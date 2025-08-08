import mongoose from 'mongoose'

const emailSchema = new mongoose.Schema({

  addr: {
    type: String,
    required: [true, 'Email address is required'],
    validate: {
      /**
       * Validates email addresses according to RFC 5322 requirements.
       * Does not enforce all possible edge cases, but covers the most common
       * rules, such as length restrictions, restricted characters for the
       * local and domain portion, restricted character sequences (e.g.,
       * no consecutive periods), no leading periods, etc.
       * 
       * @param {*} v the email address to validate, as a string
       * @returns true if the email address is valid, false otherwise 
       */
      validator: function(v) {
        const emailRegex = /^(([^<>()[$$\\.,;:\s@"]+(\.[^<>()[$$\\.,;:\s@"]+)*|".+"))@([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
        return emailRegex.test(v);
      },
      message: props => `Invalid email address: ${props.value}`
    }
  }

}, { _id: false });

export { emailSchema }