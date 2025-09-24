const BASE_URL = 'http://localhost:5000/api';
const INFO_API = `${BASE_URL}/info`;

const EndpointEnum = Object.freeze({
  FILES_API     : `${BASE_URL}/files`,
  DOCS_API      : `${BASE_URL}/docs`,
  PROPERTIES_API: `${BASE_URL}/properties`,
  SUBUNITS_API  : `${BASE_URL}/subunits`,
  FILE_EXT_API  : `${INFO_API}/allowed-file-ext`,
  DOC_TYPE_API  : `${INFO_API}/document-types`,
});

export default EndpointEnum;