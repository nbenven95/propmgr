import mongoose from 'mongoose'

import { contactInfoSchema } from '@models/embedded/contactInfo.model.js';
import { DocType, documentSchema } from '@models/document.model.js'

const insuranceInfoSchema = new mongoose.Schema({

  contact: { type: contactInfoSchema, required: [true, ''] },

  documents: { type: [documentSchema], required: false }

}, { _id: false });

const InsuranceInfo = new mongoose.model('InsuranceInfo', insuranceInfoSchema);

export default InsuranceInfo;
export { insuranceInfoSchema }