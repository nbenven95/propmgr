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
  CLOTHES_WASHER: 'clothes washer',
  CLOTHES_DRYER : 'clothes dryer',
  DISH_WASHER   : 'dishwasher'
});

export default OpSysTypeEnum;

export { ApplianceTypeEnum }