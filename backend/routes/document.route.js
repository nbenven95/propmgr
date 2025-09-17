import { Router } from 'express'

import { createDocument, deleteDocument, getDocuments, updateDocument } from '@controllers/document.controller.js';

const DocumentRouter = (upload) => {
  const router = Router();
  router.get('/', getDocuments);
  /* Note: all routes that require multer middleware should use
     Multer.array('files'). This provides a standard method for
     uploading files to any endpoint from frontend. Any POST
     request containing file(s) to upload should contain a FormData
     object with key/value pair 'files': FileList[] */
  router.post('/create', upload.array('files'), createDocument);
  router.put('/:id', updateDocument);
  router.delete('/:id', deleteDocument);
  return router;
}

export default DocumentRouter;