import mongoose from 'mongoose'

import { contactSchema } from '@models/embedded/contact.model.js'

/**
 * Schema encapsulating insurance policy information
 */
const insurancePolicySchema = new mongoose.Schema({
  /**
   * Name of the agency handling the policy
   */
  agencyName: { type: String, required: [true, 'Insurance agency name is required']},
  /**
   * Contact information for the insurance agent/agency handling the policy
   */
  agencyContact: {
    type    : contactSchema,
    required: [true, 'Insurance agency contact information is required']
  },
  /**
   * List of documentation related to the policy
   */
  documents: [{
    type    : mongoose.Schema.Types.ObjectId, // TODO: add validation to ensure documents are OK 
    ref     : 'Document',
    required: false
  }]

}, { timestamps: true });

const InsurancePolicy = new mongoose.model('InsurancePolicy', insurancePolicySchema);

export default InsurancePolicy;