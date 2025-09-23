import mongoose from 'mongoose';
import syspath from 'node:path';

import Document from '@models/document.model.js';
import FileRef from '@models/fileRef.model.js';

import HttpStatusCodes from '@util/HttpStatus.js';

import { catchAsync, CustomError } from '@middleware/errorHandler.js';

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
    // TODO: add 404 check for empty documents list 
    return res.status(OK).send(documents);
  } catch(err) {
    // Handle general server-side errors (missing document collection in db, etc.)
    return res.status(INTERNAL_SERVER_ERROR).send({
      success: false,
      message: 'Error fetching Documents',
      error: err
    });
  }
};

const getDocumentById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(BAD_REQUEST).send({
      success: false,
      message: `Invalid object id: ${id}`
    });
  }
  try {
    const doc = await Document.findById(id).populate('fileRef').exec();
    if (!doc) {
      return res.status(NOT_FOUND).send({
        success: false,
        message: `Could not find FileRef with id ${id}`,
        error: err
      });
    }
    return res.status(OK).send(fileRef);
  } catch (err) {
    // Handle general server side request failures
    return res.status(INTERNAL_SERVER_ERROR).send({
      success: false,
      message: 'Internal server error',
      error: err
    });
  }
};

// Note: parameter 'next' is required for catchAsync
const createDocument = catchAsync(async (req, res, next) => {
  // Get the current value of fileRef (may be null if a new file was uploaded)
  const { name, fileRef } = req.body;

  // Throw an error if no existing fileRef or new File data were provided
  if (!fileRef && (!Array.isArray(req.files) || req.files.length == 0)) {
    throw new CustomError({
      message: `Error creating Document \"${name}\": must provide a valid FileRef ObjectID or new File data`,
      statusCode: BAD_REQUEST,
      isOperational: true
    });
  }

  // If a new File was uploaded, try to save it (already processed by Multer at this point)
  let id;
  if (req.files?.length > 0) {
    const { filename, originalname, path } = req.files[0];
    const uploadedFile = new FileRef({
      name: originalname,
      path: syspath.resolve(path),
      uniquename: filename
    });
    await uploadedFile.save();
    id = uploadedFile._id;
  }

  // Create the Document: if a new FileRef was created, use its ObjectID as our fileRef
  const doc = new Document({ ...req.body, fileRef: fileRef || id });
  await doc.save();
  return res.status(CREATED).send({
    success: true,
    message: `Successfully created Document \"${doc.name}\"`,
    data: doc
  });
});

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
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
  // Attempt delete
  try {
    const deletedDoc = await Document.findByIdAndDelete(id);
    // Check for non-existent Document
    if (!deletedDoc) {
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
};

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const updateDocument = async (req, res) => {
  const { id } = req.params;
  //const file = req.file;
  // Check for valid object ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(BAD_REQUEST).send({
      success: false,
      message: `Invalid object ID ${id}`
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
        message: `Document with ID ${id} not found`
      });
    }
    // Update successful
    return res.status(OK).send({
      success: true,
      message: `Document with ID ${id} updated successfully`,
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
};

export { createDocument, deleteDocument, getDocumentById, getDocuments, updateDocument }