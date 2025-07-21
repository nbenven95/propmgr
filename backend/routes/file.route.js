import { Router } from 'express'

import { getFileRefs, createFileRefs, deleteFileRef } from '@controllers/file.controller.js'

// Instantiate first using 'createFileRoutes(upload)', where 'upload' is a multer object
const FileRouter = (upload) => {
  const router = Router();
  // Get currently uploaded files
  router.get('/', getFileRefs);
  // Upload files from request body to disk storage
  router.post('/upload', upload.array('files'), createFileRefs);
  // Delete a file
  router.delete('/:id', deleteFileRef);
  return router;
}

export default FileRouter;