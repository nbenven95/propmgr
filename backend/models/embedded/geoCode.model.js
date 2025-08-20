import mongoose from 'mongoose'

const geoCodeSchema = new mongoose.Schema({

  type: {
    type    : String,
    enum    : ['Point'], // TODO: not sure if this is needed 
    required: [true, 'Geocode type \'Point\' is required']
  },

  coordinates: {
    type    : [Number],
    required: [true, 'Geocode'] // TODO: add validator that ensures this array has exactly 2 elements 
  }

}, { _id: false }); // No unique ID for embedded schema

export { geoCodeSchema }