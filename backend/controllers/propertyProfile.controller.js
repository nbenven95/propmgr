import mongoose from 'mongoose'
import fetch from 'node-fetch'

import PropertyProfile from '@models/propertyProfile.model.js'

import HttpStatusCodes from '@util/httpStatus.js'

const { BAD_REQUEST, CREATED, INTERNAL_SERVER_ERROR, NOT_FOUND, OK } = HttpStatusCodes; // Destructure elements for direct access
const appVersion  = '1.0';                           // TODO: how to set/get dynamically? 
const authorEmail = 'nbenveniste@riseservices.org';

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const getProperties = async (req, res) => {
  try {
    // Await get properties promise
    const properties = await PropertyProfile.find().populate('subunits').exec();
    // No properties found 
    if (!Array.isArray(properties) || properties.length === 0) {
      console.error('No Property Profiles found');
      return res.status(NOT_FOUND).send({
        success: false,
        message: 'No Property Profiles found'
      });
    }
    // Found properties; use `res.data` to get properties from API request on frontend
    return res.status(OK).send(properties);
  } catch (err) {
    // Handle general server-side errors (missing database collection, etc.)
    console.error('Error fetching Property Profiles', err.name, err.code, err.message); // TODO: standardize error handling 
    return res.status(INTERNAL_SERVER_ERROR).send({
      success: false,
      message: 'Error fetching Property Profiles',
      error: err
    });
  }
};

const getPropertyByID = async (req, res) => {

};

/**
 * Helper function for retrieving the latitude/longitude of a
 * given address from the Nominatim/OpenStreetMaps (OSM) API.
 * 
 * @param {*} req 
 * @param {*} res
 * @returns the latitude/longitude as an array of two numbers
 */
// TODO: implement request caching 
const getGeoCodeFromAddr = async (addr) => {
  const addrStr = `${addr.number}+${addr.street}+${addr.city}`;
  // Construct request URL for OpenStreetMaps (OSM) API
  const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addrStr)}&limit=1`;
  let data = null;
  try {
    // Await response to API request
    const response = await fetch(nominatimUrl, { // TODO: will this ever return null, or just throw an error? 
      headers: { 'User-Agent': `propmgr/${appVersion} (${authorEmail})` }
    });
    // Await get JSON data from response // TODO: why is this async? 
    data = await response.json(); // TODO: will this ever return null, or just throw an error? 
    if (!Array.isArray(data) || data.length === 0) {
      return res.status(NOT_FOUND).send({
        success: false,
        message: `Failed to locate geocode for address ${addrStr}`
      });
    }
  } catch (err) {
    // Catch errors due to failed API requests // TODO: may also want to handle cases for failed authentication (e.g. missing headers), etc. 
    console.error(`Error fetching data from ${nominatimUrl}`, err.message?? err);
    return res.status(BAD_REQUEST).send({
      success: false,
      message: 'Error fetching data from OSM API',
      error: err
    });
  }
  const { lat, lon } = data[0];
  return [lat, lon];
};

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const createProperty = async (req, res) => {
  // Destructure property fields from request body
  const { name, dateAcq, phone, notes, subunits } = req.body; 
  // Create mongoose Property object
  const newProperty = new PropertyProfile({
    name: name,
    dateAcq: dateAcq ? new Date(dateAcq) : null,
    phone: phone,
    notes: notes,
    subunits: subunits // Array of object IDs corresponding to subunit database entries
  });
  // Attempt async save
  try {
    await newProperty.save();
    return res.status(CREATED).send({
      success: true,
      message: `Successfully created Property '${name}'`,
      data: newProperty
    })
  } catch (err) {
    return res.status(INTERNAL_SERVER_ERROR).send({
      success: false,
      message: `Failed to create Property '${name}': ${err.message?? '<no internal error message provided>'}`,
      error: err
    });
  }
};

/**
 * Delete a property by its object id
 * 
 * @param {*} req 
 * @param {*} res 
 */
const deleteProperty = async (req, res) => {
  const { id } = req.params;
  // Ensure id is valid (shortcut 404 check)
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(BAD_REQUEST).send({
      success: false,
      message: `Invalid object ID ${id}`
    });
  }
  // Attempt async delete of database object
  try {
    const deletedProperty = await PropertyProfile.findByIdAndDelete(id);
    // Invalid object id
    if (!deletedProperty) {
      return res.status(NOT_FOUND).send({
        success: false,
        message: `Property with ID ${id} not found`
      });
    }
    // Successful deletion
    return res.status(OK).send({
      success: true,
      message: `Successfully deleted Property with ID ${id}`,
      data: deletedProperty 
    });
  } catch (err) {
    // Handle general server errors
    return res.status(INTERNAL_SERVER_ERROR).send({
      success: false,
      message: `Failed to delete Property with ID ${id}`,
      error: err
    });
  }
};

/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
const updateProperty = async (req, res) => {
  // Unpack request URI parameters
  const { id } = req.params;
  // Check for valid object ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(BAD_REQUEST).send({
      success: false,
      message: `Invalid object ID ${id}`
    });
  }
  // Proceed with update
  try {
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
    // Property not found => 404
    if (!updatedProperty) {
      return res.status(NOT_FOUND).send({
        success: false,
        message: `Property with ID ${id} not found`
      });
    }
    // Update successful => 200
    return res.status(OK).send({
      success: true,
      message: `Property with ID ${id} updated successfully`,
      data: updatedProperty
    });
  } catch (err) { // TODO: verify that only server-side errors will be caught here 
    // General errors
    console.error(
      `Failed to update Property with ID \'${id}\': ${err.message?? err.name?? err.code?? '<no internal error message provided>'}`
    );
    return res.status(INTERNAL_SERVER_ERROR).send({
      success: false,
      message: `Failed to update Property with ID \'${id}\'`,
      error: err
    });
  }
};

export { createProperty, deleteProperty, getProperties, getPropertyByID, updateProperty }