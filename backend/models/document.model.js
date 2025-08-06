import mongoose from 'mongoose'

import DocTypeEnum from '@config/docType.js'
import FileRef from '@models/fileRef.model.js'

const documentSchema = new mongoose.Schema({

  // Document name
  name: { type: String, required: [true, 'Document name is required'] },

  // Document creation date
  dateCreate: { type: Date, required: false },

  // Date document takes effect (if applicable)
  dateEff: { type: Date, required: false },

  // Document type
  docType: {
    type: String,
    required: [true, 'Document type is required'],
    validate: {
      validator: function(v) {
        return Object.values(DocTypeEnum).includes(v.toLowerCase());
      },
      message: props => `Invalid document type: ${props.value}`
    }
  },

  // Document expiration date (if applicable)
  expiry: { type: Date, required: false },

  // Attached file (stores the object ID; populate with object data on request)
  fileRef: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FileRef',
    required: [true, 'File ref is required']
  }

}, { timestamps: true });

/**
 * Pre-save middleware; handles async validation logic.
 * Executes before the Document object is saved to the
 * database. Ensures that a File exists for fileRef.
 */
documentSchema.pre('save', async function(next) { // TODO: this should run after createWithFile (if it is called), but before .save(); verify this
  try {
    // If this is a document update and fileRef is unmodified, continue to save()
    if (!this.isModified('fileRef')) return next();
    const newFileRef = this.fileRef;
    let fileExistsForId = await FileRef.exists({ _id: newFileRef });
    // If no file exists, throw an error
    if (!fileExistsForId) throw new Error(`Invalid file ref: ${fileId}`);
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
    console.error('Error in documentSchema presave validation:', err.message);
    next(err);
  }
});

const Document = new mongoose.model('Document', documentSchema);

export default Document;