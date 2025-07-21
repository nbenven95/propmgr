import mongoose from 'mongoose'
import countries from 'i18n-iso-countries'

//import states from '@util/state-validator/states.js'

const addressSchema = new mongoose.Schema({
  
  // Street name
  street: { type: String, required: [true, 'Street name is required'] },

  // Street number
  number: { type: Number, required: [true, 'Street number is required'], validate: {
    validator: function(v) { // Ensure positive finite integer
      return Number.isInteger(v) && Number.isFinite(v) && v > 0;
    },
    message: props => `Invalid address number ${props.value}: must be a positive integer > 0`
  }},

  // Subunit number (optional)
  unit: { type: Number, required: false, validate: {
    validator: function(v) { // Ensure positive finite integer
      return Number.isInteger(v) && Number.isFinite(v) && v > 0;
    },
    message: props => `Invalid subunit number ${props.value}: must be a positive integer > 0`
  }},

  // City/town name
  city: { type: String, required: [true, 'City name is required'] }, // TODO: validate on frontend

  // ISO 3166 country code (2-letter, 3-letter, or numeric)
  country: { type: String, required: [true, 'Country code is required'], validate: {
    validator: function(v) { return countries.isValid(v); },
    message: props => `Invalid country code ${props.value}`
  }},

  // Postal/zip code
  postal: { type: String, required: [true, 'Postal/zip code is required'], validate: {
    validator: function(v) { // Ensure 5-digit string; optionally match `-' and 4-digit suffix
      const postalCodeRegex = /^\d{5}(-\d{4})?$/gmi; // NOTE: this only validates structure; it does not prove authenticity
      return postalCodeRegex.test(v);
    },
    message: 'Invalid postal/zip code {VALUE}'
  }},

  // State code (only required if country is USA)
  state: { type: String, required: () => ['USA','US','840'].includes(this.country), validate: {
    validator: function(v) { 
      return true; //states.isValid(v); // TODO: refactor
    },
    message: 'Invalid state code {VALUE}'
  }}

}, { _id: false }); // Embedded schema, no separate id

const Address = new mongoose.model('Address', addressSchema);

export default Address;
export { addressSchema }