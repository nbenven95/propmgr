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
 * Create a PropertyProfile from request body data.
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const createProperty = async (req, res, next) => {

  console.log(req.body.address);

  /* Destructure fields from request body */
  const {
    name,
    address,
    apn,
    phone,
    dateBuilt,
    dateAcq,
    wastePickupSched,
    geocode,
    extent,
    notes,            // List of note key/value pairs (embedded)
    insurancePolicy,  // Object ID corresponding to an InsurancePolicy document
    opSystems,        // Array of object IDs corresponding to OpSys documents
    documents,        // Array of object IDs corresponding to Document documents (hehe)
    subunits          // Array of object IDs corresponding to Subunit documents
  } = req.body;

  /* Attempt async save */
  try {
  /* Note: when using multer to parse requests with header 'multipart/form-data', 
     every field value is parsed as a string. This means that we need to manually
     parse every field to get the expected value (unless it is a string) */
    const newProperty = new PropertyProfile({
      name,
      address: JSON.parse(address),
      geocode: JSON.parse(geocode),
      extent: JSON.parse(extent)
    });
    console.log(newProperty);

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
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
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

  // Filter null values in request body
  const propertyUpdate = {};
  for (const key of Object.keys(req.body)) {
    const value = req.body[key];
    // Only add non-null values to the update object
    if (value !== undefined && value !== null) {
      propertyUpdate[key] = value;
    }
  }

  try { // Attempt async update

    // Await update promise
    const updatedProperty = await PropertyProfile.findByIdAndUpdate(
      id,
      propertyUpdate,
      { new: true, runValidators: true } // Return updated document, validate updated fields
    );
    // Not found => 404
    if (!updatedProperty) {
      console.error(`PropertyProfile with ObjectID \'${id}\' not found`);
      return res.status(NOT_FOUND).send({
        success: false,
        message: `PropertyProfile with ObjectID \'${id}\' not found`
      });
    }
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