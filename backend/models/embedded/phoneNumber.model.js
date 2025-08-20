import mongoose from 'mongoose'

/**
 * Regex pattern for matching US-based phone numbers.
 * Use library (e.g., libphonenumber-js) for matching
 * more complex Int'l phone numbers.
 * 
 * Matches country code with or without '+' (optional),
 * area code with or without '()', and then the final
 * 7 digits of the number. Also matches optional separator
 * characters '.', '-', ' ' between the country code and
 * area code, between the area code and first three digits,
 * and between the first three digits and final four digits. 
 */
const phoneRegex = /^(\+?\d{1,3}[\s.-]?)?(\d{3}|\(\d{3}\))[\s.-]?\d{3}[\s.-]?\d{4}$/;

/**
 * Embedded schema encapsulating phone number data
 */
const phoneNumberSchema = new mongoose.Schema({
  /**
   * The original string representation of the phone number.
   * Includes the country code and any separator characters.
   */
  original: {
    type    : String,
    required: [true, 'Phone number is required'],
    validate: {
      validator: function(v) {
        return phoneRegex.test(v);
      },
      message: props => String.join([
        `Invalid phone number ${props.value}:`,
        'must be a valid 10-digit NANP phone number',
        'with optional E.164 country code prefix'
      ],' ')
    }
  }
}, { _id: false }); // No unique ID for embedded schema

/**
 * Get phone number string with country code and separators truncated.
 */
phoneNumberSchema.virtual('digits').get(function() {
  const digits = this.original.replace(/\D/g,''); // Truncate all non-digit characters
  return digits.length() === 11  // Check for country code
    ? digits.substring(1, 11)    // Country code is present, truncate and return the rest
    : digits                     // No country code, return all extracted digits
});

/**
 * Get just the country code, if one was provided.
 */
phoneNumberSchema.virtual('countryCode').get(function() {
  const digits = this.original.replace(/\D/g,''); // Truncate all non-digit characters
  return digits.length() === 11 // Check for country code
    ? digits.substring(0, 1)    // Country code is present, return it
    : ''                        // No country code, return empty string
});

export { phoneNumberSchema }