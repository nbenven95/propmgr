import { Router } from 'express'

import { createDocument, deleteDocument, getDocuments, updateDocument } from '@controllers/document.controller.js';

const DocumentRouter = (upload) => {
  const router = Router();
  router.get('/', getDocuments);
  router.post('/create', upload.single('file'), createDocument);
  router.put('/:id', updateDocument);
  router.delete('/:id', deleteDocument);
  return router;
}

export default DocumentRouter;