import mongoose from 'mongoose'
import countries from 'i18n-iso-countries'

//import states from '@util/state-validator/states.js'

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
  number: {
    type: Number,
    required: [true, 'Street number is required'],
    validate: {
      validator: function(v) {
        return v                  // Ensure v is not null/undefined
          && Number.isFinite(v)   // Ensure v is finite
          && Number.isInteger(v)  // Ensure v is an integer
          && v > 0;               // Ensure v is positive
      },
      message: props => `Invalid street number: ${props.value} (must be a positive integer > 0)`
    }
  },
  /**
   * Street name
   */
  street: { type: String, required: [true, 'Street name is required'] },
  /**
   * Subunit number (optional)
   */
  unit: {
    type: Number,
    required: false,
    validate: {
      validator: function(v) {
        return v                  // Ensure v is not null/undefined
          && Number.isFinite(v)   // Ensure v is finite
          && Number.isInteger(v)  // Ensure v is an integer
          && v > 0;               // Ensure v is positive
      },
      message: props => `Invalid subunit number: ${props.value} (must be a positive integer > 0)`
    }
  },
  /**
   * City name
   */
  city: { type: String, required: [true, 'City name is required'] },
  /**
   * ISO 3166 country code (2-letter, 3-letter, or numeric) // TODO: allow countries by name as well; get country code from name 
   */
  country: {
    type: String,
    required: [true, 'Country code is required'],
    validate: {
      validator: function(v) { return countries.isValid(v); },
      message: props => `Invalid country code: ${props.value}`
    }
  },
  /**
   * Postal/zip code
   * Note: this field's validator only validates structure; it does not ensure correctness.
   */
  postal: {
    type: String,
    required: [true, 'Postal code is required'],
    validate: {
      validator: function(v) {
        const postalCodeRegex = /^\d{5}(-\d{4})?$/gmi; // Match on 5-digit string with optional hyphen separator and 4-digit suffix
        return postalCodeRegex.test(v);
      },
      message: props => `Invalid postal code: ${props.value}`
    }
  },
  /**
   * State code (optional; only required if country is USA) // TODO: allow state names as well 
   */
  state: {
    type: String,
    required: function() {
      return ['USA','US','840'].includes(this.country); // Set 'required' based on instance's value of 'country'
    },
    validate: {
      validator: function(v) { return true; }, // TODO: debug states validator; `return states.isValid(v);`
      message: props => `Invalid state code: ${props.value}`
    }
  }
}, { _id: false }); // No unique ID for embedded schema

export { addressSchema }