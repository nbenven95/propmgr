import mongoose from 'mongoose'

import { Subunit } from '@models/propertyProfile.model.js'

import HttpStatusCodes from '@util/httpStatus.js'

const { BAD_REQUEST, CREATED, INTERNAL_SERVER_ERROR, NOT_FOUND, OK } = HttpStatusCodes; // Destructure elements for direct access

const getSubunits = async (req, res) => {

  try {
    const subunits = await Subunit.find();
    if (!Array.isArray(subunits) || subunits.length === 0) {
      console.error('No Subunits found');
      return res.status(NOT_FOUND).send({
        success: false,
        message: 'No Subunits found'
      });
    }
    return res.status(OK).send(subunits);
  } catch (err) {
    console.error('Error fetching Subunits', err.message?? err.name?? err.code); // TODO: standardize error handling 
    return res.status(INTERNAL_SERVER_ERROR).send({
      success: false,
      message: 'Error fetching Subunits',
      error: err
    });
  }
};

const createSubunit = async (req, res) => {
  const { name, dateAcq, phone, notes } = req.body;
  const newSubunit = new Subunit({
    name: name,
    dateAcq: dateAcq ? new Date(dateAcq) : null,
    phone: phone,
    notes: notes
  });
  try {
    await newSubunit.save();
    return res.status(CREATED).send({
      success: true,
      message: `Successfully created Subunit \'${name}\'`,
      data: newSubunit
    });
  } catch (err) {
    console.error(
      `Failed to created Subunit \'${name}\': ${err.message?? err.name?? err.code?? '<no internal error message provided>'}`
    );
    return res.status(INTERNAL_SERVER_ERROR).send({
      success: false,
      message: `Failed to create Subunit \'${name}\'`,
      error: err
    });
  }
}

const deleteSubunit = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(BAD_REQUEST).send({
      success: false,
      message: `Invalid object ID \'${id}\'`
    });
  }
  try {
    const deletedSubunit = await Subunit.findByIdAndDelete(id);
    if (!deletedSubunit) {
      return res.status(NOT_FOUND).send({
        success: false,
        message: `Subunit with ID \'${id}\' not found`
      });
    }
    return res.status(OK).send({
      success: true,
      message: `Successfully deleted Subunit \'${deletedSubunit.name}\'`,
      data: deletedSubunit
    });
  } catch (err) {
    return res.status(INTERNAL_SERVER_ERROR).send({
      success: false,
      message: `Failed to delete Subunit with ID \'${id}\'`,
      error: err
    });
  }
};

const updateSubunit = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(BAD_REQUEST).send({
      success: false,
      message: `Invalid object ID \'${id}\'`
    });
  }
  try {
    // Filter null values in request body
    const subunitUpdate = {};
    for (const key of Object.keys(req.body)) {
      // Only add non-null values to the update object
      const value = req.body[key];
      if (value !== undefined && value !== null) {
        subunitUpdate[key] = value;
      }
    }
    const updatedSubunit = await Subunit.findByIdAndUpdate(
      id,
      subunitUpdate,
      { new: true, runValidators: true }
    );
    if (!updatedSubunit) {
      return res.status(NOT_FOUND).send({
        success: false,
        message: `Subunit with ID \'${id}\' not found`
      });
    }
    return res.status(OK).send({
      success: true,
      message: `Successfully updated Subunit \'${updatedSubunit.name}\'`,
      data: updatedSubunit
    });
  } catch (err) {
    console.error(
      `Failed to update Subunit with ID \'${id}\': ${err.message?? err.name?? err.code?? '<no internal error message provided>'}`
    );
    return res.status(INTERNAL_SERVER_ERROR).send({
      success: false,
      message: `Failed to update Subunit with ID \'${id}\'`,
      error: err
    });
  }
};

export { getSubunits, createSubunit, deleteSubunit, updateSubunit }