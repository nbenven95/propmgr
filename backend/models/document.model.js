import mongoose from 'mongoose'

import File from '@models/file.model.js'

const DocType = Object.freeze({
  BLUEPRINT:  'blueprint',
  CONTRACT:   'contract',
  DEED:       'deed',
  FLOORPLAN:  'floorplan',
  LEASE:      'lease',
  LIEN:       'lien',
  MANUAL:     'manual',
  SCHEMATIC:  'schematic',
  WARRANTY:   'warranty',
  WORKORDER:  'workorder'
});

const documentSchema = new mongoose.Schema({

  // Document creation date
  dateCreate: { type: Date, required: false },

  // Date the document took effect (if relevant)
  dateEff: { type: Date, required: false },

  // Document type -- validate against values in DocType enum
  docType: {
    type: String,
    required: [true, 'Document type is required'],
    validate: {
      validator: function(v) {
        return Object.values(DocType).includes(v.toLowerCase());
      },
      message: 'Invalid document type {VALUE}'
    }
  },

  // Document expiration date (if relevant)
  expiry: { type: Date, required: false },

  // Object id of attached File; populate with contents of actual File on request
  fileRef: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File',
    required: [true, 'File ref is required']
  },

  name: { type: String, required: [true, 'Document name is required'] }

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
    const fileId = this.fileRef;
    let fileExistsForId = await File.exists({ _id: fileId });
    // If no file exists, throw an error
    if (!fileExistsForId) throw new Error(`Invalid file ref ${fileId}`);
    // File exists, continue to save()
    return next();
  } catch (err) {
    // Handle File does not exist, invalid object id, etc.
    console.error('Error in documentSchema presave validation:', err.message);
    next(err);
  }
});

const Document = new mongoose.model('Document', documentSchema);

export default Document;
export { documentSchema, DocType }