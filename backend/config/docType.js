/**
 * Define allowed Document types here so we can access from frontend/
 */
const DocTypeEnum = Object.freeze({
  BLUEPRINT:  'blueprint',
  CONTRACT:   'contract',
  DEED:       'deed',
  FLOORPLAN:  'floorplan',
  LEASE:      'lease',
  LIEN:       'lien',
  MANUAL:     'manual',
  SCHEMATIC:  'schematic',
  TEXT:       'text',
  WARRANTY:   'warranty',
  WORKORDER:  'workorder'
});

export default DocTypeEnum;