import mongoose from 'mongoose'

import DocTypeEnum from '@config/docType.js'

import { noteSchema } from '@models/embedded/note.model.js'
import { phoneNumberSchema } from '@models/embedded/phoneNumber.model.js'

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
   * Property date of acquisition
   */
  dateAcq: {
    type    : Date,
    required: false
  },
  /**
   * Property phone number
   * Note: use embedded schema to store data directly in parent object.
   */
  phone: {
    type    : phoneNumberSchema,
    required: false
  },
  /**
   * Geocode corresponding to the property street address
   * Note: use embedded schema to store data directly in parent object.
   */
  /*
  geocode: {
    type    : geoCodeSchema,
    required: false
  },
  */
  /**
   * List of notes
   * e.g., important neighbor information, etc.
   * Note: use embedded schema to store data directly in parent object.
   */
  notes: [{
    type    : noteSchema,
    required: false
  }]
  /**
   * List of associated property documents
   * Note: store object IDs, populate w/ data from documents collection on request.
   */
  /*
  documents: [{
    type    : mongoose.Schema.Types.ObjectId,
    ref     : 'Document',
    required: false
  }]
  */
}, { timestamps: true });

// Subunit schema inherits all fields from Property, except the subunits field
const subunitSchema = new mongoose.Schema({ ...propertyProfileSchema.obj }, { timestamps: true });
const Subunit = new mongoose.model('Subunit', subunitSchema);

// Add subunits after defining subunitSchema to prevent recursion bugs
propertyProfileSchema.add({

  subunits: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subunit',
    required: false
  }]

});
const PropertyProfile = new mongoose.model('PropertyProfile', propertyProfileSchema);

export default PropertyProfile;
export { Subunit }