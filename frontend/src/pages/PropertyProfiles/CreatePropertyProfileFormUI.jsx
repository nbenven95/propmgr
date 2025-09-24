import { Box, FormControl, FormLabel, Heading, VStack, Tooltip, Checkbox, Input } from "@chakra-ui/react";

const CreatePropertyProfileFormUI = ({
  name,
  setName,
  dateBuilt,
  setDateBuilt,
  dateBuiltRef,
  toggleDefaultDate,
  useDefaultDateOfAcq,
  dateAcq,
  setDateAcq,
  apn,
  setApn,
  address,
  setAddress,
  phone,
  setPhone,
  wastePickupSched,
  setWastePickupSched,
  insurancePolicy,
  setInsurancePolicy,
  notes,
  setNotes,
  opSystems,
  setOpSystems,
  documents,
  setDocuments,
  subunits,
  setSubunits,
  submitting,
  handleSubmit
}) => {
  return (
    <Box maxW='100vw' mx='auto' p={4} borderWidth='1px' borderRadius='8px' boxShadow='xl' bg='white'>
      <VStack spacing={4} ailgn='stretch'>
        {/* Name input */}
        <FormControl isRequired>
          <FormLabel>Name</FormLabel>
          <Input
            placeholder='Property Name'
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </FormControl>
        
        {/* Date built input */}
        <FormControl>
          <FormLabel>Date Built</FormLabel>
          <Input
            type='date'
            value={dateBuilt}
            onChange={e => setDateBuilt(e.target.value)}
            ref={dateBuiltRef}
          />
        </FormControl>
        
        {/* Date acquired same as date built? */}
        <FormControl>
          <Checkbox
            disabled={!dateBuilt}
            defaultChecked={false}
            onChange={toggleDefaultDate}
          >
            Use Date Built as Date Acquired
          </Checkbox>
        </FormControl>
        
        {/* Date acquired input */}
        <FormControl>
          <FormLabel>Date Acquired</FormLabel>
          <Input
            placeholder={useDefaultDateOfAcq ? dateBuilt : ''}
            type='date'
            value={dateAcq}
            onChange={e => setDateAcq(e.target.value)}
          />
        </FormControl>
        
        {/* APN input */}
        <FormControl>
          <Tooltip label={'Assessor\'s Parcel Number (Tax ID Number)'}>
            <FormLabel>APN</FormLabel>
          </Tooltip>
          <Input />
        </FormControl>
        
        {/* Address input */}
        <FormControl></FormControl>
        
        {/* Phone number input */}
        <FormControl></FormControl>
        
        {/* Waste pickup schedule input */}
        <FormControl></FormControl>
        
        {/* Insurance policy selector */}
        <FormControl></FormControl>
        
        {/* Property notes input */}
        <FormControl></FormControl>
        
        {/* Property opSystems selector */}
        <FormControl></FormControl>
        
        {/* Property documents selector */}
        <FormControl></FormControl>
        
        {/* Subunits selector */}
        <FormControl></FormControl>
      </VStack>
    </Box>
  );
};

export default CreatePropertyProfileFormUI;