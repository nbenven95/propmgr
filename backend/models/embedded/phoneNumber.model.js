import mongoose from 'mongoose'

/**
 * Embedded schema encapsulating phone number data
 */
const phoneNumberSchema = new mongoose.Schema({
  /**
   * The original string representation of the phone number as input by the user
   */
  number: {
    type    : String,
    required: [true, 'Phone number is required']
  },
  /**
   * The extracted area code and digits of the phone number as a string
   */
  digits: {
    type    : String,
    required: false
  },
  /**
   * The extracted country code of the phone number (if present)
   */
  countryCode: {
    type    : String,
    required: false
  }
}, { _id: false }); // No unique ID for embedded schema

/**
 * Pre-save middleware (synchronous)
 * Validates American/Candian phone numbers (structure only, not correctness),
 * and then strips all non-digit characters, storing only a string of digits.
 */
phoneNumberSchema.pre('save', function(next) {
  
  // Matches optional country code, 3-digit area code (parenthesis optional), and final 7 digits (separators optional)
  const phoneRegex = /^(\+?\d{1,3}[\s.-]?)?(\d{3}|\(\d{3}\))[\s.-]?\d{3}[\s.-]?\d{4}$/;
  
  // Check for pattern match
  const isValidPhoneNumber = phoneRegex.test(this.number);
  if (!isValidPhoneNumber) throw new Error(`Invalid phone number: ${this.number}`);
  
  // Strip all non-digit characters (greedy match)
  const extractedDigits = this.number.replace(/\D/g, '');
  
  // Check for country code
  // Note: this assumes a 10-11 digit phone number with a 1-digit country code 
  if (extractedDigits.length === 11) { 
    this.countryCode = extractedDigits.substring(0, 1);
    this.digits = extractedDigits.substring(1, 11);
  } else {
    this.digits = extractedDigits;
  }

  // Proceed to save
  next();
});

export { phoneNumberSchema }