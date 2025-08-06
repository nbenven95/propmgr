import mongoose from 'mongoose'

/**
 * Schema encapsulating data on operating systems
 */
const opSysSchema = new mongoose.Schema({

  name: { 
    type    : String, 
    required: [true, 'Operating system name is required']
  },
  
  documents: [{
    type    : mongoose.Schema.Types.ObjectId,
    ref     : 'Document',
    required: false
  }]
  
}, { timestamps: true });

const OpSys = new mongoose.model('OpSys', opSysSchema);

export default OpSys;