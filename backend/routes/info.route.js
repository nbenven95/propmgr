import { Router } from 'express'

import HttpStatusCodes from '@util/HttpStatus.js'

const { BAD_REQUEST, NOT_FOUND, OK } = HttpStatusCodes;

/**
 * Define helper routes for providing non-confidential information
 * to the frontend. e.g., allowed file types, document types, etc.
 *
 * Because the app will be fully containerized and there is additional
 * backend validation for all of these attributes, MITM attacks are
 * not a huge concern. This is essentially just a convenience to
 * avoid horrible relative imports from backend to frontend.
 */
const InfoRouter = ({
  allowedFileExt,
  docTypes,
  toolTips,
  opSysTypes,
  applianceTypes
}) => {
  
  const infoRouter = new Router();

  // Route for valid document types
  infoRouter.get('/document-types', (req, res) => res.status(OK).send(docTypes));

  // Route for valid file extensions
  infoRouter.get('/allowed-file-ext', (req, res) => res.status(OK).send(allowedFileExt));

  // Route for valid operating system types 
  infoRouter.get('/opsys-types', (req, res) => res.status(OK).send(opSysTypes));

  // Route for valid appliance types
  infoRouter.get('/appliance-types', (req, res) => res.status(OK).send(applianceTypes));

  infoRouter.get('/tool-tips/:view', (req, res) => {
    const { view } = req.params;
    const toolTips = toolTips[view];
    if (!view) return res.status(BAD_REQUEST).send({
      success: false,
      message: 'Missing request parameter `view`'
    });
    if (!toolTips) return res.status(NOT_FOUND).send({
      success: false,
      message: `Could not find tool tips for view \`${view}\``
    })
    return res.status(OK).send(toolTips);
  });

  return infoRouter;

}

export default InfoRouter;