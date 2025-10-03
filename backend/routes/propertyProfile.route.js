import { Router } from 'express'

import { createProperty, deleteProperty, getProperties, getPropertyByID, updateProperty } from '@controllers/propertyProfile.controller.js'

const PropertyProfileRouter = (upload) => { // Need reference to multer object to handle multipart form data
  const router = Router();
  
  /* Property profile routes */

  router.get('/', getProperties); // Get all Properties

  router.get('/:id', getPropertyByID); // Get Property by its object ID

  router.post('/create', upload.none(), createProperty); // Create Property (use upload.none() middleware to parse multipart form data)

  router.delete('/:id', deleteProperty); // Delete Property

  router.put('/:id', updateProperty); // Update Property (or related) information, documents, etc.

  return router;
};

export default PropertyProfileRouter;