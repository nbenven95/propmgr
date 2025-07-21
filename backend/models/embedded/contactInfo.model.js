import mongoose from 'mongoose'

import { addressSchema } from '@models/embedded/address.model.js';

const contactInfoSchema = new mongoose.Schema({
  
  first: { type: String, required: [true, ''] },
  
  last: { type: String, required: [true, ''] },
  
  addr: { type: addressSchema, required: [true, ''] },
  
  phone: { type: String, required: [true, ''] },
  
  email: { type: String, required: false }

}, { _id: false }); // Embedded schema, no separate id

const ContactInfo = new mongoose.model('ContactInfo', contactInfoSchema);

export default ContactInfo;
export { contactInfoSchema } // TODO: validate phone # and email address structure