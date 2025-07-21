import mongoose from 'mongoose'

import { documentSchema } from '@models/document.model.js'

const opSysSchema = new mongoose.Schema({

  documents: { type: [documentSchema], required: false }
  
}, { _id: false });

const OpSys = new mongoose.model('OpSys', opSysSchema);

export default OpSys;
export { opSysSchema }