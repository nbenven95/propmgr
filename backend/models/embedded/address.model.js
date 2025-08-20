import mongoose from 'mongoose'
import countries from 'i18n-iso-countries'

//import states from '@util/state-validator/states.js'

// TODO: debug states validator
// TODO: allow user to specify state/country by name 

/**
 * Validates that a number is a positive, finite integer.
 * 
 * @param {Number} n The number to validate.
 */
const isPositiveFiniteInt = (n) => {
  const predicates = [ // Define list of predicates to test
    n !== undefined,
    n !== null,
    Number.isInteger(n),
    Number.isFinite(n),
    n > 0
  ];
  return predicates.every(pred => pred === true); // Only true if all predicates evaluate to true
}

/**
 * Embedded schema encapsulating address information
 * 
 * Note: embedded schemas have no unique ID, model, or collection associated
 * with them. They are essentially templates that allow you to refactor fields
 * with common logic for reuse in other mongoose models.
 * 
 * e.g., if you have models 'ContactInfo' and 'PropertyProfile' that both
 * contain a 'phone' field, it makes sense to refactor that field into its own
 * schema and reuse it in each model. If you needed a separate collection to
 * track phone numbers, this would not work, as no model or collection is created.
 * For this, use `{ type: mongoose.Schema.Types.ObjectId, ref: 'PhoneNumber' }` 
 */
const addressSchema = new mongoose.Schema({
  /**
   * Street number
   */
  streetNumber: {
    type: Number,
    required: [true, 'Street number is required'],
    validate: {
      validator: function(v) {
        return isPositiveFiniteInt(v);
      },
      message: props => `Invalid street number: ${props.value}: must be a positive, finite integer > 0`
    }
  },
  /**
   * Street name
   */
  streetName: {
    type    : String,
    required: [true, 'Street name is required']
  },
  /**
   * Subunit number (optional)
   */
  subunitNumber: {
    type: Number,
    required: false,
    validate: {
      validator: function(v) {
        return isPositiveFiniteInt(v);
      },
      message: props => `Invalid subunit number: ${props.value}: must be a positive, finite integer > 0`
    }
  },
  /**
   * City name
   */
  city: {
    type    : String,
    required: [true, 'City name is required']
  },
  /**
   * State code
   */
  state: {
    type    : String,
    required: function() {
      return ['USA','US','840'].includes(this.country); // Only require state if country is USA/US/840
    },
    validate: {
      validator: function(v) {
        return true; // return states.isValid(v);
      },
      message: props => `Invalid state code: ${props.value}`
    }
  },
  /**
   * ISO 3166 country code (2-letter, 3-letter, or numeric)
   */
  country: {
    type    : String,
    required: [true, 'Country code is required'],
    validate: {
      validator: function(v) {
        return countries.isValid(v);
      },
      message: props => `Invalid country code: ${props.value}`
    }
  },
  /**
   * Postal/zip code
   */
  postalCode: {
    type    : String,
    required: [true, 'Postal code is required'],
    validate: {
      /**
       * Validates postal/zip codes.
       * 
       * A postal code is considered valid if it contains at
       * least five digits, followed by an optional suffix
       * consisting of a hypen followed by four more digits.
       * Note that this only tests for validity, not correctness.
       * 
       * @param {String} v The postal code to validate.
       * @returns true if the postal code is valid; else false
       */
      validator: function(v) {
        const postalCodeRegex = /^\d{5}(-\d{4})?$/gmi;
        return postalCodeRegex.test(v);
      },
      message: props => `Invalid postal code: ${props.value}`
    }
  }
}, { _id: false }); // No unique ID for embedded schema

export { addressSchema }