import mongoose from 'mongoose'

const geoLocSchema = new mongoose.Schema({

  type: { type: String, enum: ['Point'], required: [true, 'Error: missing type \'Point\''] },

  coordinates: { type: [Number], required: [true] },

}, { _id: false }); // Embedded schema, no separate id

const GeoLoc = new mongoose.model('GeoLoc', geoLocSchema);

export default GeoLoc;
export { geoLocSchema }