import mongoose from 'mongoose'

import { addressSchema } from '@models/embedded/address.model.js'
import { emailSchema } from '@models/embedded/email.model.js'
import { phoneNumberSchema } from '@models/embedded/phoneNumber.model.js'

const contactSchema = new mongoose.Schema({

  first: { type: String, required: false },

  last: { type: String, required: false },

  phone: { type: phoneNumberSchema, required: false },

  email: { type: emailSchema, required: false },

  address: { type: addressSchema, required: false }

}, { timestamps: true });

const Contact = new mongoose.model('Contact', contactSchema);

export default Contact;