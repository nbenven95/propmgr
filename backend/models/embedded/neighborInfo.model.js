import mongoose from 'mongoose'

import { contactInfoSchema } from '@models/embedded/contactInfo.model.js'

const neighborInfoSchema = new mongoose.Schema({

  contact: { type: contactInfoSchema, required: [true, ''] },

  notes: { type: String, required: false }

}, { _id: false });

const NeighborInfo = new mongoose.model('NeighborInfo', neighborInfoSchema);

export default NeighborInfo;
export { neighborInfoSchema }