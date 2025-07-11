import express from 'express'

import { uploadFiles, getUploadedFiles, deleteUploadedFile } from '@controllers/file.controller.js'

// Instantiate first using 'createFileRoutes(upload)', where 'upload' is a multer object
export default (upload) => {
  const router = express.Router();
  // Get currently uploaded files
  router.get('/', getUploadedFiles);
  // Upload files from request body to disk storage
  router.post('/upload', upload.array('files'), uploadFiles);
  // Delete a file
  router.delete('/:id', deleteUploadedFile);
  return router;
}