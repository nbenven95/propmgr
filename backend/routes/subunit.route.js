import { Router } from 'express'

import { createSubunit, deleteSubunit, getSubunits, updateSubunit } from '@controllers/subunit.controller.js'

const SubunitRouter = () => {
  const router = Router();

  router.get('/', getSubunits);

  router.post('/create', createSubunit);

  router.delete('/:id', deleteSubunit);

  router.put('/:id', updateSubunit);

  return router;
};

export default SubunitRouter;