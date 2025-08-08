import { Router } from 'express'

import { createProperty, deleteProperty, getProperties, getPropertyByID, updateProperty } from '@controllers/propertyProfile.controller.js'

const PropertyProfileRouter = () => {
  const router = Router();
  
  /* Property profile routes */

  router.get('/', getProperties); // Get all Properties

  router.get('/:id', getPropertyByID); // Get Property by its object ID

  router.post('/create', createProperty); // Create Property

  router.delete('/:id', deleteProperty); // Delete Property

  router.put('/:id', updateProperty); // Update Property (or related) information, documents, etc.

  return router;
};

export default PropertyProfileRouter;