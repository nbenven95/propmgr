import mongoose from 'mongoose'

/**
 * Schema encapsulating insurance policy information
 */
const insurancePolicySchema = new mongoose.Schema({
  /**
   * Name of the agency handling the policy.
   */
  agencyName: { type: String, required: [true, 'Insurance agency name is required']},
  /**
   * Contact information for the insurance agent/agency handling the policy.
   */
  agencyContact: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
    required: [true, 'Insurance agency contact information is required']
  },
  /**
   * List of documentation related to the policy.
   */
  documents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: false
  }]

}, { timestamps: true });

const InsurancePolicy = new mongoose.model('InsurancePolicy', insurancePolicySchema);

export default InsurancePolicy;