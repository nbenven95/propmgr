import mongoose from 'mongoose'

import DocTypeEnum from '@config/DocTypes.js'
import FileRef from '@models/fileRef.model.js'

// TODO: implement some way to get list of all PropertyProfile, Subunit, OpSys, and InsurancePolicy documents that are associated with a given Document document

// TODO: automated document expiration warnings

const documentSchema = new mongoose.Schema({
  /**
   * Document name
   */
  name: { type: String, required: [true, 'Document name is required'] },
  /**
   * Document creation date
   */
  dateCreate: { type: Date, required: false },
  /**
   * Date document takes effect, if applicable
   */
  dateEff: { type: Date, required: false },
  /**
   * Document expiration date, if applicable
   */
  expiry: { type: Date, required: false },
  /**
   * Document type (e.g. contract, lease, warranty, floorplan, etc.)
   */
  docType: {
    type: String,
    required: [true, 'Document type is required'],
    validate: {
      validator: function(v) {
        // TODO: implement ability for user to add new document types 
        return Object.values(DocTypeEnum).includes(v.toLowerCase()); // Ensure doc type is one of the pre-defined types
      },
      message: props => `Invalid document type: ${props.value}`
    }
  },
  /**
   * Attached file
   */
  fileRef: { 
    type: mongoose.Schema.Types.ObjectId, // Store the object ID, populate with data on request
    ref: 'FileRef',
    required: [true, 'File ref is required']
  }

}, { timestamps: true });

/**
 * Pre-save middleware to handle async validation.
 * Ensures that the object ID for fileRef is valid
 * and that a corresponding FileRef object exists.
 */
documentSchema.pre('save', async function(next) {
  try {
    // Check for object update; if no modification, continue to save
    if (!this.isModified('fileRef')) return next();

    // If no file exists, throw an error
    const newFileRef = this.fileRef;
    let fileExistsForId = await FileRef.exists({ _id: newFileRef });
    if (!fileExistsForId) throw new Error(`Invalid FileRef object ID: ${fileId}`);

    // Update fileRef associations
    const DocumentModel = this.constructor;
    const prevDoc = await DocumentModel.findById(this._id).lean();
    const oldFileRef = prevDoc ? prevDoc.fileRef : null;

    // If this is a document update and fileRef is modified, remove this document from oldFileRef's document associations
    if (oldFileRef && (!this.isNew || oldFileRef.toString() !== newFileRef.toString())) {
      await mongoose.model('FileRef').updateOne(
        { _id: oldFileRef },
        { $pull: { documents: this._id } }
      )
    }

    // Add this document to new FileRef's document associations
    await mongoose.model('FileRef').updateOne(
      { _id: newFileRef },
      { $addToSet: { documents: this._id } }
    )

    // Continue to save
    return next();

  } catch (err) {
    // Handle File does not exist, invalid object id, etc.
    console.error(
      `Error in ${this.type} pre-save validation: ${err.message?? err.name?? err.code?? '<no internal error message provided>'}`
    );
    next(err);
  }
});

// TODO: check if this needs 'new' or not
const Document = new mongoose.model('Document', documentSchema);

export default Document;