import mongoose from 'mongoose'

import Document from '@models/document.model.js'
import InsurancePolicy from '@models/insurancePolicy.model.js'
import OpSys from '@models/opSys.model.js'

import { addressSchema } from '@models/embedded/address.model.js'
import { geoCodeSchema } from '@models/embedded/geoCode.model.js'
import { noteSchema } from '@models/embedded/note.model.js'
import { phoneNumberSchema } from '@models/embedded/phoneNumber.model.js'
import { wastePickupSchedSchema } from '@models/embedded/wastePickupSched.model.js'

import DocTypeEnum from '@config/DocTypes.js'

const { BLUEPRINT, CONTRACT, DEED, FLOORPLAN, LEASE, LIEN, SCHEMATIC, TEXT, WORKORDER } = DocTypeEnum;
const allowedDocTypes = [BLUEPRINT, CONTRACT, DEED, FLOORPLAN, LEASE, LIEN, SCHEMATIC, TEXT, WORKORDER];

// TODO: add field for garbage pickup schedule; should include day(s) of the week, time, and frequency (e.g., weekly, biweekly, etc.) 

/**
 * Schema encapsulating property profile information
 */
const propertyProfileSchema = new mongoose.Schema({
  /**
   * Property name
   */
  name: { 
    type    : String,
    required: [true, 'Property name is required']
  },
  /**
   * Property address (street number, name, unit (optional), city, state (conditional), postal code, country)
   */
  address: {
    type    : addressSchema, // Embedded schema; stores data directly in parent object
    required: [true, 'Property address is required']
  },
  /**
   * Geocode corresponding to the property street address
   */
  geoCode: { // TODO: set using react-maplibre geocoder on the frontend BEFORE the HTTP request is sent to the backend 
    type    : geoCodeSchema, // Embedded schema; stores data directly in parent object
    required: false,
    validate: {
      validator: function(geoCode) { 
        const { type, coordinates } = geoCode;
        const predicates = [ // Define predicates to test
          String(type).toLowerCase() === 'point',
          Array.isArray(coordinates),
          coordinates.length === 2
        ];
        return predicates.every(pred => pred === true);
      },
      message: props => `Invalid GeoCode: ${props.value}`
    }
  },
  /**
   * Assessor's Parcel Number; AKA Property ID Number, Tax ID Number
   */
  apn: { // TODO: look into viability of fetching via API request (e.g., try to auto-populate when user enters address) 
    type    : String,
    required: false
  },
  /**
   * Property phone number
   */
  phone: {
    type    : phoneNumberSchema, // Embedded schema; stores data directly in parent object
    required: false
  },
  dateBuilt: {
    type    : Date,
    required: false
  },
  /**
   * Property date of acquisition
   */
  dateAcq: { 
    type    : Date,
    required: false
  },
  /**
   * Day and frequency of garbage pickup
   */
  wastePickupSched: {
    type    : wastePickupSchedSchema,
    required: false
  },
  /**
   * List of labeled notes (important neighbor information, etc.)
   */
  notes: {
    type    : [noteSchema], // Embedded schema; stores data directly in parent object
    default : [],
    validate: {
      validator: function(notes) {
        let maxNotes = 32; // FIXME: magic number; how to pass from init code in server.js? 
        return Array.isArray(notes) && notes.length < maxNotes + 1
      },
      message: props => `${props.value}`
    }
  },
  /**
   * Property insurance policy information.
   */
  insurancePolicy: {
    type    : mongoose.Schema.Types.ObjectId, // Store object ID, populate with data on request
    ref     : 'InsurancePolicy',
    required: false
  },
  /**
   * List of associated operating systems (HVAC, roofing, dishwashers, clotheswashers/driers, etc.)
   */
  opSystems: [{
    type    : mongoose.Schema.Types.ObjectId, // Store object IDs, populate with data on request
    ref     : 'OpSys',
    required: false
  }],
  /**
   * List of associated property documents.
   */
  documents: [{
    type    : mongoose.Schema.Types.ObjectId, // Store object IDs, populate with data on request
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
      `Error in ${this.type} pre-save validation: ${err.message?? err.name?? err.code?? '<no internal error message provided'}`
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
export { Subunit }