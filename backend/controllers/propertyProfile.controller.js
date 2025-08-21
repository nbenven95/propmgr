import mongoose from 'mongoose'
import fetch from 'node-fetch'

import PropertyProfile from '@models/propertyProfile.model.js'

import HttpStatusCodes from '@util/HttpStatus.js'

const { BAD_REQUEST, CREATED, INTERNAL_SERVER_ERROR, NOT_FOUND, OK } = HttpStatusCodes; // Destructure elements for direct access

/**
 * Get all PropertyProfiles.
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const getProperties = async (req, res) => {
  try { // Attempt async GET request

    const properties = await PropertyProfile.find() // Await find all PropertyProfiles promise; populate fields that store ObjectIDs
      .populate('insurancePolicy')
      .populate('opSystems')
      .populate('documents')
      .populate('subunits')
      .exec();
    
    if (!Array.isArray(properties) || properties.length === 0) { // Check for no PropertyProfiles found
      console.error('No PropertyProfiles found');
      return res.status(NOT_FOUND).send({
        success: false,
        message: 'No PropertyProfiles found'
      });
    }
    
    return res.status(OK).send(properties); // Found properties; use `res.data` to get properties from API request on frontend
  
  } catch (err) {
    
    // Handle general server-side errors (missing database collection, etc.)
    console.error(
      `Error fetching PropertyProfiles: ${err.message?? err.name?? err.code?? '<no internal error message provided>'}`
    );
    return res.status(INTERNAL_SERVER_ERROR).send({
      success: false,
      message: 'Error fetching PropertyProfiles',
      error: err
    });
  }
};

/**
 * Get a PropertyProfile given its object ID.
 * 
 * @param {*} req 
 * @param {*} res 
 */
const getPropertyByID = async (req, res) => {
  const { id } = req.params;
  try {
    const property = await PropertyProfile.find({ _id: id });
    if (!property) return res.status(NOT_FOUND).send({
      success: false,
      message: `PropertyProfile not found: ObjectID \'${id}\'`
    });
  } catch(err) {
    console.error(
      `Error fetching PropertyProfile: ObjectID \'${id}\': ${
        err.message?? err.name?? err.code?? '<no internal error message provided>'
      }`
    );
  }
};

/**
 * Get geocode from address using OpenStreetMap/Nominatim API
 * @param {*} address
 */
const getGeoCode = async (address, next) => {
  if (!address) throw new Error('address cannot be null');
  const {
    streetNumber,
    streetName,
    city,
    state,
    postalCode,
    country
  } = address;
  const baseUrl = 'https://nominatim.openstreetmap.org/search';
  const params = new URLSearchParams({
    format        : 'json',
    limit         : '1',
    addressdetails: '1',
    q             : `${streetNumber}, ${streetName}, ${city}, ${state}, ${postalCode}, ${country}`
  });
  const uri = `${baseUrl}?${params.toString()}`
  try {
    const res = await fetch(uri, {
      headers: {
        'User-Agent': 'RisePropertyManager/1.0 (nbenveniste@riseservices.org)'
      }
    });
    if (!res.ok) {
      throw new Error(`Failed to get geocode for address: ${addr}: Nominatum API responded with status: ${res.status}`);
    }
    // Get response data in JSON
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error(`Address not found: ${addr}`);
    }
    // Get latitude and longitude from response data (should only be one element in 'data')
    return [data[0].lat, data[0].lon];
  } catch (err) {
    console.error(err);
    next(err);
  }
};

/**
 * Create a PropertyProfile from request body data.
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const createProperty = async (req, res, next) => {
  /* Destructure fields from request body */
  const {
    name,
    address,
    apn,              // Assessor's Parcel Number (Tax ID)
    phone,
    dateAcq,
    wastePickupSched,
    notes,            // List of note key/value pairs (embedded)
    insurancePolicy,  // Object ID corresponding to an InsurancePolicy document
    opSystems,        // Array of object IDs corresponding to OpSys documents
    documents,        // Array of object IDs corresponding to Document documents (hehe)
    subunits          // Array of object IDs corresponding to Subunit documents
  } = req.body;

  // Try to get geocode from address
  let coords = null;
  try {
    // On success, returns a 2-element array: [lat, lon]
    coords = await getGeoCode(address, next);
  } catch(err) {
    console.error(err);
    next(err);
  }

  /* Create mongoose PropertyProfile document instance */
  const newProperty = new PropertyProfile({
    name            : name,
    address         : address,
    geoCode         : coords ? { type: 'Point', coordinates: coords } : null,
    apn             : apn,
    phone           : phone,
    dateAcq         : dateAcq
      ? new Date(dateAcq) // Init Date object from ISO date string passed in request body
      : null,
    wastePickupSched: wastePickupSched,
    notes           : notes,
    insurancePolicy : insurancePolicy,
    opSystems       : opSystems,
    documents       : documents,
    subunits        : subunits
  });

  /* Attempt async save */
  try {
    await newProperty.save();
    return res.status(CREATED).send({
      success: true,
      message: `Successfully created PropertyProfile \'${newProperty.name}\'`,
      data: newProperty
    })
  } catch (err) {
    return res.status(INTERNAL_SERVER_ERROR).send({
      success: false,
      message: `Failed to create PropertyProfile \'${name}\': ${
        err.message?? err.name?? err.code?? '<no internal error message provided>'
      }`,
      error: err
    });
  }
};

/**
 * Delete a PropertyProfile given its MongoDB ObjectID.
 * // TODO: verify the types of req and res 
 * @param {Request} req The HTTP request object.
 *  Contains the ObjectID of the PropertyProfile
 *  to delete in req.params.id
 * @param {Response} res The HTTP response object.
 */
const deleteProperty = async (req, res) => {
  const { id } = req.params; // Destructure URL parameters // TODO: what if req.params is null/undefined?
  if (!id || !mongoose.Types.ObjectId.isValid(id)) { // Ensure valid ObjectID
    return res.status(BAD_REQUEST).send({
      success: false,
      message: (() => {
        if (!id || id === '') return 'Missing ObjectID'
        else                  return `Invalid ObjectID: \'${id}\'`
      })()
    });
  }
  // Attempt async delete of database object
  try {
    const deletedProperty = await PropertyProfile.findByIdAndDelete(id);
    // Not found => 404
    console.error(`PropertyProfile not found: ObjectID \'${id}\'`);
    if (!deletedProperty) {
      return res.status(NOT_FOUND).send({
        success: false,
        message: `PropertyProfile not found: ObjectID \'${id}\'`
      });
    }
    // Successful deletion
    return res.status(OK).send({
      success: true,
      message: `Successfully deleted PropertyProfile \'${deletedProperty.name}\'`,
      data: deletedProperty 
    });
  } catch (err) {
    // Handle general server errors
    console.error(
      `Failed to delete PropertyProfile with ObjectID \'${id}\': ${
        err.message?? err.name?? err.code?? '<no internal error message provided>'
      }`
    );
    return res.status(INTERNAL_SERVER_ERROR).send({
      success: false,
      message: `Failed to delete PropertyProfile with ObjectID \'${id}\'}`,
      error: err
    });
  }
};

/**
 * Update a PropertyProfile given its object ID and request body data.
 * 
 * @param {*} req 
 * @param {*} res 
 */
const updateProperty = async (req, res) => {
  
  const { id } = req.params; // Unpack request URL parameters
  
  if (!mongoose.Types.ObjectId.isValid(id)) { // Check for valid object ID
    return res.status(BAD_REQUEST).send({
      success: false,
      message: `Invalid PropertyProfile ObjectID: ${id}`
    });
  }
  
  try { // Attempt async update
    
    // Filter null values in request body
    const propertyUpdate = {};
    for (const key of Object.keys(req.body)) {
      const value = req.body[key];
      // Only add non-null values to the update object
      if (value !== undefined && value !== null) {
        propertyUpdate[key] = value;
      }
    }
    // Await update promise
    const updatedProperty = await PropertyProfile.findByIdAndUpdate(
      id,
      propertyUpdate,
      { new: true, runValidators: true } // Return updated document, validate updated fields
    );
    // Not found => 404
    console.error(`PropertyProfile with ObjectID \'${id}\' not found`);
    if (!updatedProperty) return res.status(NOT_FOUND).send({
      success: false,
      message: `PropertyProfile with ObjectID \'${id}\' not found`
    });
    // Update successful => 200
    return res.status(OK).send({
      success: true,
      message: `PropertyProfile with ObjectID \'${id}\' updated successfully`,
      data: updatedProperty
    });
  } catch (err) { // TODO: test edge cases, verify that only server-side errors are caught here 
    // Handle server-side errors
    console.error(
      `Failed to update PropertyProfile with ObjectID \'${id}\': ${
        err.message?? err.name?? err.code?? '<no internal error message provided>'
      }`
    );
    return res.status(INTERNAL_SERVER_ERROR).send({
      success: false,
      message: `Failed to update Property with ID \'${id}\'`,
      error: err
    });
  }
};

export { createProperty, deleteProperty, getProperties, getPropertyByID, updateProperty }