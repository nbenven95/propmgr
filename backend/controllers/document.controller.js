import mongoose from 'mongoose'
import sysPath from 'node:path'

import Document from '@models/document.model.js'
import File from '@models/fileRef.model.js'

import { isNull } from '@util/util.js';
import HttpStatusCodes from '@util/httpStatus.js'

const {
  OK,
  CREATED,
  BAD_REQUEST,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR
} = HttpStatusCodes;

const getDocuments = async (req, res) => {
  try {
    // Get all Documents from the database; populate fileRef with data from the corresponding File
    const documents = await Document.find().populate('fileRef').exec();
    // Access via res.data in frontend axios request
    return res.status(OK).send(documents);
  } catch(err) {
    return res.status(NOT_FOUND).send({ // No documents in database
      success: false,
      message: 'Could not locate Documents',
      error: err
    });
  }
}

/**
 * 
 * Note: if both a new file and existing fileRef are provided,
 * the new file will take precedence.
 * 
 * @param {} req 
 * @param {*} res 
 * @returns 
 */
const createDocument = async (req, res) => {
  // Destructure name and (optional) fileRef from body data
  const { docType, fileRef, name, dateCreate, dateEff, expiry } = req.body;
  // If a new file was uploaded, this will be passed by multer middleware
  const file = req.file;
  let fileId = null;
  try {
    // Check if new file data or an existing File ref has been provided
    if (file) {
      // New file uploaded -- destructure multer data
      const { filename, originalname, path } = file;
      const newFile = File({
        name:       originalname,
        path:       sysPath.resolve(path),
        uniquename: filename
      });
      await newFile.save();
      fileId = newFile._id;
    } else if (fileRef) {
      // Existing File selected
      fileId = fileRef;
    } else {
      return res.status(BAD_REQUEST).send({
        success: false,
        message: 'Must provide valid new file data or existing File ref'
      });
    }
    // Create the Document
    const newDoc = new Document({
      docType   : docType,
      fileRef   : fileId,
      name      : name,
      dateCreate: dateCreate,
      dateEff   : dateEff,
      expiry    : expiry
    });
    console.log(newDoc);
    // Attempt async save
    await newDoc.save();
    return res.status(CREATED).send({
      success: true,
      message: `Created new Document ${name}`,
      data: newDoc
    });
  } catch (err) {
    return res.status(INTERNAL_SERVER_ERROR).send({
      success:  false,
      message:  `Could not create Document ${name}`,
      error:    err
    });
  }
}

const deleteDocument = async (req, res) => {
  // Unpack id from from request header params
  const { id } =  req.params;
  // Ensure id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(BAD_REQUEST).send({
      success: false,
      message: `Invalid object id ${id}`
    });
  }
  // Attempt async delete the Property object
  try {
    const deletedDoc = await Document.findByIdAndDelete(id);
    // Check for non-existent Document
    if (isNull(deletedDoc)) {
      return res.status(NOT_FOUND).send({
        success: false,
        message: `Document ${id} not found`
      });
    }
    return res.status(OK).send({
      success: true,
      message: `Deleted Document ${id}`,
      data: deletedDoc
    });
  } catch (err) {
    return res.status(INTERNAL_SERVER_ERROR).send({
      success: false,
      message: `Could not delete Document ${id}`,
      error: err
    });
  }
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const updateDocument = async (req, res) => {
  const { id } = req.params;
  // TODO: pass optional multipart form data with newly uploaded file if the user wants to upload a new file when editing 
  //const newFile = req.file;
  // TODO: handle user selecting a new (existing) file when editing 
  //const { name, dateCreate, dateEff, docType, expiry, fileRef } = req.body; // Expected
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(BAD_REQUEST).send({
      success: false,
      message: `Invalid object id ${id}`
    });
  }
  try {
    // Filter out null/empty entries in req.body so we don't erase data for fields that weren't updated
    const docUpdate = {};
    for (const key of Object.keys(req.body)) {
      const value = req.body[key];
      if (value !== undefined && value !== null) docUpdate[key] = value;
    }
    // Await promise
    const updatedDoc = await Document.findByIdAndUpdate(
      id,
      docUpdate,
      { new: true, runValidators: true } // Validate updated fields, return updated document
    );
    // Update failed, couldn't find document
    if (!updatedDoc) {
      return res.status(NOT_FOUND).send({
        success: false,
        message: `Document with id ${id} not found`
      });
    }
    // Update successful
    return res.status(OK).send({
      success: true,
      message: 'Document updated successfully',
      data: updatedDoc
    });
  } catch (err) {
    // General catch-all for failure to update
    return res.status(INTERNAL_SERVER_ERROR).send({
      success: false,
      message: `Could not update Document ${id}`,
      error: err
    });
  }
}

export { createDocument, deleteDocument, getDocuments, updateDocument }