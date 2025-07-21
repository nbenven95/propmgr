import { Router } from 'express'

import { createProperty, deleteProperty, getProperties } from '@controllers/property.controller.js'

const PropertyRouter = () => {
  const router = Router();
  router.get('/', getProperties);
  router.post('/create', createProperty);
  router.delete('/:id', deleteProperty);
  return router;
};

export default PropertyRouter;