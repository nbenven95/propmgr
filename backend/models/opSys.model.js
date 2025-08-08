import mongoose from 'mongoose'

import DocTypeEnum from '@config/docType.js'
import OpSysTypeEnum, { ApplianceTypeEnum } from '@config/opSysType.js'

const { CONTRACT, MANUAL, SCHEMATIC, TEXT, WARRANTY, WORKORDER } = DocTypeEnum;
const allowedDocTypes = [CONTRACT, MANUAL, SCHEMATIC, TEXT, WARRANTY, WORKORDER];

/**
 * Schema encapsulating data on operating systems
 */
const opSysSchema = new mongoose.Schema({
  /**
   * The operating system name
   */
  name: { 
    type    : String, 
    required: [true, 'Operating system name is required']
  },
  /**
   * The operating system type
   */
  opSysType: {
    type    : String,
    required: [true, 'Operating system type is required'],
    validate: {
      validator: function(v) {
        return Object.values(OpSysTypeEnum).includes(v.toLowerCase());
      },
      message: props => `Invalid operating system type: ${props.value}`
    }
  },
  /**
   * The operating system subtype; only appliances are supported (for now)
   */
  opSysSubType: {
    type    : String,
    required: function() {
      return this.opSysType.toLowerCase() === 'appliance'; // Only require subtype for appliances
    },
    validate: {
      validator: function(v) {
        return Object.values(ApplianceTypeEnum).includes(v.toLowerCase());
      },
      message: props => `Invalid operating system sub-type: ${props.value}`
    }
  },
  /**
   * The date of purchase/installation
   */
  dateOfInstall: {
    type    : Date,
    required: false
  },
  /**
   * The date the operating system was last serviced
   */
  dateOfLastService: {
    type    : Date,
    required: false
  },
  /**
   * Contact information for OpSys servicer
   */
  servicePointOfContact: {
    type    : mongoose.Schema.Types.ObjectId,
    ref     : 'Contact',
    required: false
  },
  /**
   * Operating system serial number
   */
  serialNumber: {
    type    : String,
    required: false
  },
  /**
   * Any documents associated with operating systems
   */
  documents: [{
    type    : mongoose.Schema.Types.ObjectId,
    ref     : 'Document',
    required: false
  }]
  
}, { timestamps: true });

const OpSys = new mongoose.model('OpSys', opSysSchema);

export default OpSys;