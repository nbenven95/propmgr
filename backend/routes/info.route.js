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
  toolTipDict
}) => {
  
  const infoRouter = new Router();

  infoRouter.get('/document-types', (req, res) => res.status(OK).send(docTypes));

  infoRouter.get('/allowed-file-ext', (req, res) => res.status(OK).send(allowedFileExt));

  infoRouter.get('/tool-tips/:view', (req, res) => {
    const { view } = req.params;
    const toolTips = toolTipDict[view];
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