import mongoose from 'mongoose';

import Document from '@models/document.model.js';
import InsurancePolicy from '@models/insurancePolicy.model.js';
import OpSys from '@models/opSys.model.js';

import { addressSchema } from '@models/embedded/address.model.js';
import { noteSchema } from '@models/embedded/note.model.js';
import { phoneNumberSchema } from '@models/embedded/phoneNumber.model.js';
import { wastePickupSchedSchema } from '@models/embedded/wastePickupSched.model.js';

import DocTypeEnum from '@config/DocTypes.js';

const { BLUEPRINT, CONTRACT, DEED, FLOORPLAN, LEASE, LIEN, SCHEMATIC, TEXT, WORKORDER } = DocTypeEnum;
const allowedDocTypes = [BLUEPRINT, CONTRACT, DEED, FLOORPLAN, LEASE, LIEN, SCHEMATIC, TEXT, WORKORDER];

const MAX_NOTES = 32;

/* Note: 
The validator runs when the document is validated (typically on save or on explicit validate()). It will prevent you from saving a parent
document if notes.length exceeds MAX_NOTES, but it does not block you from pushing more items in memory by itself.
Details:
- The custom validator runs as part of Mongoose document validation.
- On doc.save() (or doc.validate()), Mongoose will validate the notes array and fail if notes.length > MAX_NOTES.
- If you push more items to notes in memory and do not call save (or validate), nothing is prevented yet.
- If you perform an update operation (e.g., findOneAndUpdate, updateOne) and want validation to run, you must enable runValidators: true on that operation.
- Example for an update:
  Model.updateOne({ _id: id }, { $set: { notes: newNotes } }, { runValidators: true })
So, to enforce the limit consistently, ensure you save/validate the document after mutations, and enable runValidators for any update operations you use.
*/

// TODO: add logic/support for building inspections (talk to Lindsey/Stace about requirements)

/**
 * Schema encapsulating property profile information
 */
const propertyProfileSchema = new mongoose.Schema({

  // Property name
  name: { type: String, required: [true, 'Property name is required'] },
  
  // Property address (street number, name, unit (optional), city, state (conditional), postal code, country)
  address: { type: addressSchema, required: [true, 'Property address is required'] },

  // Assessor's Parcel Number; AKA Property ID Number, Tax ID Number
  apn: { type: String, required: false }, // TODO: fetch via API? 

  // Property phone #
  phone: { type: phoneNumberSchema, required: false },

  // Property date of construction
  dateBuilt: { type: Date, required: false },
  
  // Property date of acquisition (may be same as dateBuilt)
  dateAcq: { type: Date, required: false },

  // Day and frequency of garbage pickup
  wastePickupSched: { type: wastePickupSchedSchema, required: false },

  // TODO: update this so it's just an array of two numbers; get rid of geoCodeSchema; (also, change to `geocode`)
  geocode: { 
    type    : [Number],
    required: false,
    validate: {
      validator: function(geocode) { 
        return Array.isArray(geocode)
          && geocode.length == 2
          && geocode.every(e => typeof e === 'number');
      },
      message: props => `Invalid geocode: ${props.value}`
    }
  },
  
  // Extent (bounding box)
  // TODO: make this conditional on geocode being present
  extent: {
    type: [Number],
    required: false,
    default: [],
    validate: {
      validator: function(extent) {
        if (!Array.isArray(extent) || extent.length !== 4) return false;
        return extent.every(e => typeof e === 'number');
      },
      message: props => `Invalid extent (bounding box): ${props.value}`
    }
  },

  // List of labeled notes
  notes: {
    type    : [noteSchema],
    default : [],
    validate: {
      validator: function(notes) {
        return Array.isArray(notes) && notes.length < MAX_NOTES + 1
      },
      message: props => `${props.value}`
    }
  },

  // Property insurance policy
  insurancePolicy: {
    type    : mongoose.Schema.Types.ObjectId,
    ref     : 'InsurancePolicy',
    required: false
  },
  
  // List of associated operational systems (HVAC, roofing, dishwashers, clotheswashers/driers, etc.)
  opSystems: [{
    type    : mongoose.Schema.Types.ObjectId,
    ref     : 'OpSys',
    required: false
  }],
  
  // List of general documents associated with the property (lease, contract, workorder, etc.)
  documents: [{
    type    : mongoose.Schema.Types.ObjectId,
    ref     : 'Document',
    required: false
  }]
  
}, { timestamps: true });

propertyProfileSchema.set('toObject', { virtuals: true });
propertyProfileSchema.set('toJSON', { virtuals: true });

/**
 * Given a Property's date of construction, get its age (virtual property)
 */
propertyProfileSchema.virtual('age').get(function() { // Note: need to use a non-arrow function so we have our own 'this' context 
  if (!this.dateBuilt) return null;
  const dateBuilt = new Date(this.dateBuilt);
  const dateNow = new Date(Date.now());
  // Get the time delta between the two dates in milliseconds
  const millis = dateNow - dateBuilt;
  // Define conversion factors
  const convert = {
    milliToSec: 1 / 1000,
    secToMin  : 1 / 60,
    minToHr   : 1 / 60,
    hrToDay   : 1 / 24,
    dayToYr   : 1 / 365
  };
  const seconds = Math.floor(millis * convert.milliToSec);
  const minutes = Math.floor(seconds * convert.secToMin);
  const hours   = Math.floor(minutes * convert.minToHr);
  const days    = Math.floor(hours * convert.hrToDay);
  const years   = Math.floor(days * convert.dayToYr);
  // Convert any overflow into the next smallest unit of time
  const dayOverflow   = days % 365; // e.g. if days is 366 => years = 1, daysRemain = 1
  const hrOverflow    = hours % 24;
  const minOverflow   = minutes % 60;
  const secOverflow   = seconds % 60;
  const milliOverflow = millis % 1000;
  return {
    years   : years,
    days    : dayOverflow,
    hours   : hrOverflow,
    minutes : minOverflow,
    seconds : secOverflow,
    millis  : milliOverflow
  }
});

/**
 * Define subunitSchema: inherits all current fields from propertyProfileSchema
 */
const subunitSchema = new mongoose.Schema({ ...propertyProfileSchema.obj }, { timestamps: true });

// Add subunits field to propertyProfileSchema after defining subunitSchema.
// Ensures that Subunits do not have their own 'subunits' field.
propertyProfileSchema.add({
  subunits: [{
    type: mongoose.Schema.Types.ObjectId, // Store object IDs, populate with data on request
    ref: 'Subunit',
    required: false
  }]
});

/**
 * Function for handling async validation in pre-save middleware.
 * 
 * Ensures that the ObjectIDs for any populated fields correspond
 * to existing MongoDB documents of the correct type.
 * 
 * @param {*} next
 */
const preSaveValidator = async function(next) { // Note: need to use a non-arrow function so we have our own 'this' context 
  try {
    // Check for unmodified fields
    const insurancePolicyMod = this.isModified('insurancePolicy');
    const documentsMod = this.isModified('documents');
    const opSystemsMod = this.isModified('opSystems');

    // Only check subunits field on PropertyProfile instances
    /* Note: 'this instance of propertyProfileSchema' does not work as a check: need an object 
    class with a constructor. The correct method would be 'this instance of PropertyProfile', 
    but we haven't defined PropertyProfile yet, and we cannot define it until we register 
    the pre-save middleware with propertyProfileSchema. This is the best workaround 
    that I could find, there is probably a better method (maybe in TypeScript?) */
    const subunitsMod = this.constructor && this.constructor.modelName === 'PropertyProfile'
      ? this.isModified('subunits')
      : false;

    // No changes: continue to save
    if (!insurancePolicyMod && !documentsMod && !opSystemsMod && !subunitsMod) return next();

    // TODO: refactor to utilize error handling middleware (e.g., throw CustomError)

    // Ensure insurancePolicy (ObjectID) points to an existing InsurancePolicy
    if (insurancePolicyMod) {
      if (!this.insurancePolicy || this.insurancePolicy === '') return next(); // TODO: verify that this is how to handle insurancePolicy being unset 
      let exists = await InsurancePolicy.find({ _id: this.insurancePolicy });
      if (!exists) throw new Error(`Invalid InsurancePolicy ObjectID: ${id}`);
    }

    // Ensure every ObjectID in documents points to an existing Document
    if (documentsMod) {
      if (!this.documents || !Array.isArray(this.documents)) return next(); // TODO: verify that this is how to handle documents being empty 
      this.documents.forEach(doc => { // Iterate over Document ObjectIDs
        Document.find({ _id: doc }).then(doc => {
          if (!allowedDocTypes.includes(doc.docType)) { // Validate docType for each Document in documents
            throw new Error(
              `Invalid Document type \'${doc.docType}\' for ${this.type}: allowed types: ${allowedDocTypes.join(',')}`
            );
          }
        }).catch(err => { // Not found/invalid ObjectID
          throw new Error(
            `Invalid Document ObjectID: ${id}:${err.message?? err.name?? err.code?? '<no internal error message provided>'}`
          );
        });
      });
    }

    // Ensure every ObjectID in opSystems points to an existing OpSys
    if (opSystemsMod) {
      if (!this.opSystems || !Array.isArray(this.opSystems)) return next(); // TODO: verify that this is how to handle opSystems being empty 
      this.opSystems.forEach(opSys => { // Iterate over OpSys ObjectIDs
        OpSys.find({ _id: opSys }).catch(err => {
          throw new Error(
            `Invalid OpSys ObjectID: ${id}:${err.message?? err.name?? err.code?? '<no internal error message provided>'}`
          );
        });
      });
    }

    // Ensure every ObjectID in subunits points to an existing Subunit
    if (subunitsMod) {
      if (!this.subunits || !Array.isArray(this.subunits)) return next(); // TODO: verify that this is how to handle subunits being empty 
      this.subunits.forEach(subunit => { // Iterate over Subunit ObjectIDs
        Subunit.find({ _id: subunit }).catch(err => {
          throw new Error(
            `Invalid Subunit ObjectID: ${id}:${err.message?? err.name?? err.code?? '<no internal error message provided>'}`
          );
        });
      });
    }

    // Pre-save validation passed, continue to save
    return next();

  } catch (err) {
    console.error(
      `Error in ${this.type} pre-save validation: ${err.message?? err.name?? err.code?? '<no internal error message provided>'}`
    );
    next(err);
  }
};

// Register pre-save middleware with schemas
propertyProfileSchema.pre('save', preSaveValidator);
subunitSchema.pre('save', preSaveValidator);

/**
 * Subunit model class
 */
const Subunit = new mongoose.model('Subunit', subunitSchema);
/**
 * PropertyProfile model class; identical to Subunit except for the added 'subunits' field
 */
const PropertyProfile = new mongoose.model('PropertyProfile', propertyProfileSchema);

export default PropertyProfile;
export { Subunit };