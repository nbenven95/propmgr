import { Router } from 'express'

import { uploadFiles, downloadFile, getFileRefById, getFileRefs, deleteFileRefAndFile } from '@controllers/fileRef.controller.js'

const FileRefRouter = (upload) => {
  const router = Router();

  /**
   * Upload file(s) from remote client to local disk storage
   * and create a FileRef object to store file metadata.
   */
  router.post('/upload', upload.array('files'), uploadFiles);

  // Download the file for File object with specified id
  router.get('/download/:id', downloadFile);

  // Get all File ref objects
  router.get('/', getFileRefs);

  // Get the File ref object with specified id
  router.get('/:id', getFileRefById);

  // Delete the File object with specified id and its attached file
  router.delete('/:id', deleteFileRefAndFile);

  return router;
}

export default FileRefRouter;