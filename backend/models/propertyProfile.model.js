import mongoose from 'mongoose'

import { noteSchema } from '@models/embedded/note.model.js'
import { phoneNumberSchema } from '@models/embedded/phoneNumber.model.js'

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
  dateacq: {
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
  notes: [noteSchema]
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

// Add subunits property after defining subunitSchema to prevent subunit recursion
propertyProfileSchema.add({ subunits: { type: [subunitSchema], required: false } });
const PropertyProfile = new mongoose.model('PropertyProfile', propertyProfileSchema);

export default PropertyProfile;
export { Subunit }