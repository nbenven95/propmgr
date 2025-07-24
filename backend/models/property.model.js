// TODO: use google maps address validation plugin on frontend for async address validation

import mongoose from 'mongoose'

import { addressSchema } from '@models/embedded/address.model.js'
import { contactInfoSchema } from '@models/embedded/contactInfo.model.js'
import { documentSchema } from '@models/document.model.js'
import { geoLocSchema } from '@models/embedded/geoLoc.model.js'
import { insuranceInfoSchema } from '@models/embedded/insuranceInfo.model.js'
import { neighborInfoSchema } from '@models/embedded/neighborInfo.model.js'
import { opSysSchema } from '@models/embedded/opSys.model.js'

import DocTypeEnum from '@util/docType.js'

// Limit the allowed document types to only those relevant to properties
const { BLUEPRINT, CONTRACT, DEED, FLOORPLAN, LEASE, LIEN, WORKORDER } = DocTypeEnum;
const allowedDocTypes = [BLUEPRINT, CONTRACT, DEED, FLOORPLAN, LEASE, LIEN, WORKORDER];

/* Property profile */
const propertyScehma = new mongoose.Schema({

  name: { type: String, required: [true, 'Property name is required'] },
  
  addr: { type: addressSchema, required: [true, 'Property address is required'] },
  
  geoLoc: { type: geoLocSchema, required: false },
  
  dateAcq: { type: Date, required: [true, 'Property date of acquisition is required'] },
  
  documents: { type: [documentSchema], required: false, validate: {
    validator: function(docs) { // Ensure all documents have an allowed type
      return docs.every(doc => allowedDocTypes.includes(doc.docType));
    },
    message: `Invalid document type. Allowed types: ${allowedDocTypes.join(', ')}`
  }}

}, { timestamps: true });

// Subunit schema inherits all fields from Property before adding 'subunits' field to Property
const subunitSchema = new mongoose.Schema({ ...propertyScehma.obj }, { timestamps: true });

// Add subunits field to propertySchema after subunitSchema is defined
propertyScehma.add({ subunits: { type: [subunitSchema], required: false } });

const Subunit = new mongoose.model('Subunit', subunitSchema);
const Property = new mongoose.model('Property', propertyScehma);

export default Property;
export { Subunit, subunitSchema, propertyScehma }