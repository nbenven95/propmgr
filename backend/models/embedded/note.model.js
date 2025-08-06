import mongoose from 'mongoose'

const noteSchema = new mongoose.Schema({

  label: { 
    type    : String,
    required: [true, 'Note label is required']
  },

  text: {
    type    : String,
    required: [true, 'Note body text is required']
  }

}, { _id: false }); // No unique ID for embedded schema

export { noteSchema }