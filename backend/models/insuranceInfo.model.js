import mongoose from 'mongoose'

import { phoneNumberSchema } from '@models/embedded/phoneNumber.model.js'

const contactInfoSchema = new mongoose.Schema({

  first: {
    type: String,
    required: [true, 'Insurance agent contact first name is required']
  },

  last: {
    type: String,
    required: [true, 'Insurance agent contact last name is required']
  },

  phone: {
    type: phoneNumberSchema,
    required: false
  },

  email: {
    type: String, // TODO: add a separate embedded email schema with validator 
    required: false
  }

}, { _id: false });

const insuranceInfoSchema = new mongoose.Schema({

  agencyName: { type: String, required: [true, 'Insurance agency name is required']},

  agencyPhone: {
    type: phoneNumberSchema,
    required: false
  },

  documents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }]

}, { timestamps: true });

const InsuranceInfo = new mongoose.model('InsuranceInfo', insuranceInfoSchema);

export default InsuranceInfo;