import mongoose from 'mongoose'

import Address from '@models/embedded/address.model.js'
import Document from '@models/document.model.js'
import GeoLoc from '@models/embedded/geoLoc.model.js'
import Property from '@models/property.model.js'

import { isNull } from '@util/util.js'
import HttpStatusCodes from '@util/httpStatus.js'

// Destructure enum object to access elements directly
const { 
  OK,
  CREATED,
  BAD_REQUEST,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR
} = HttpStatusCodes;

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const getProperties = async (req, res) => {
  try {
    const properties = await Property.find();
    // Access properties via res.data in axios request on frontend
    return res.status(OK).send(properties);
  } catch (err) {
    return res.status(NOT_FOUND).send({
      success: false,
      message: 'Could not locate Properties',
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
const createProperty = async (req, res) => {
  // Destructure property fields from request body
  const { name, addr, geoLoc, dateAcq, documents } = req.body; 

  /* Note: mongoose auto-casts subdocuments when assigning plain objects; i.e., we don't 
  have to explicitly set all of the fields for Address, GeoLoc, and Document, just pass
  the corresponding req.body data to the mongoose object constructor. */

  // Create mongoose Property object
  const newProperty = new Property({
    name: name,
    addr: new Address(addr),
    geoLoc: new GeoLoc(geoLoc),
    dateAcq: new Date(dateAcq), // TODO: use .toISOString() when reading this value on frontend 
    documents: documents?.map((doc) => new Document(doc))?? []
  });
  // Attempt async save
  try {
    await newProperty.save();
    return res.status(CREATED).send({
      success: true,
      message: 'Created Property',
      data: newProperty
    })
  } catch (err) {
    return res.status(INTERNAL_SERVER_ERROR).send({
      success: false,
      message: 'Could not create Property',
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
      message: `Invalid object id ${id}`
    });
  }
  // Attempt async delete of database object
  try {
    const deletedProperty = await Property.findByIdAndDelete(id);
    // Invalid object id
    if (isNull(deletedProperty)) {
      return res.status(NOT_FOUND).send({
        success: false,
        message: `Property ${id} not found`
      });
    }
    // Successful deletion
    return res.status(OK).send({
      success: true,
      message: `Deleted Property ${id}`,
      data: deletedProperty 
    });
  } catch (err) {
    // Handle general server errors
    return res.status(INTERNAL_SERVER_ERROR).send({
      success: false,
      message: `Could not delete Property ${id}`,
      error: err
    })
  }
}

export { createProperty, deleteProperty, getProperties }