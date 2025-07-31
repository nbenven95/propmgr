import { Router } from 'express'

import HttpStatusCodes from '@util/httpStatus.js';

const { OK } = HttpStatusCodes;

/**
 * Define helper routes for providing non-confidential information
 * to the frontend. e.g., allowed file types, document types, etc.
 *
 * Because the app will be fully containerized and there is additional
 * backend validation for all of these attributes, MITM attacks are
 * not a huge concern. This is essentially just a convenience to
 * avoid horrible relative imports from backend to frontend.
 */
const InfoRouter = (docTypes, allowedFileTypes) => {
  
  const infoRouter = new Router();

  infoRouter.get('/document-types', (req, res) => res.status(OK).send(docTypes));

  infoRouter.get('/allowed-file-types', (req, res) => res.status(OK).send(allowedFileTypes));

  return infoRouter;

}

export default InfoRouter;