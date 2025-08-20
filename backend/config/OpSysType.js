const OpSysTypeEnum = Object.freeze({
  HVAC                : 'hvac',
  PLUMBING            : 'plumbing',
  ELECTRIC            : 'electric',
  GENERAL_CONTRACTING : 'contracting, general',
  ROOFING             : 'roofing',
  WINDOWS             : 'windows',
  APPLIANCES          : 'appliances',
  SANITATION          : 'sanitation'
});

const ApplianceTypeEnum = Object.freeze({
  CLOTHES_WASHER: 'washer, clothes',
  CLOTHES_DRYER : 'dryer, clothes',
  DISH_WASHER   : 'washer, dishes'
});

export default OpSysTypeEnum;

export { ApplianceTypeEnum }