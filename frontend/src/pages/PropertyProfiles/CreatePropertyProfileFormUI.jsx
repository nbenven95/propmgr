import { Box, FormControl, FormLabel, Heading, VStack, Tooltip, Checkbox, Input } from "@chakra-ui/react";

import { formatDisplayDate } from '../../util/util';

const CreatePropertyProfileFormUI = ({
  refs,
  fetched,
  loading,
  formData,
  formState,
  submitting,
  onSubmit,
  onChangeField,
  onChangeDate,
  onToggleDefaultDate,
}) => {

  // TODO: add images*, events**, and boundingBox*** fields to mongoose schema
  //* for images, refactor Dropzone component (possibly into a hook)
  //** for events, look at how daypilot structures event objects before creating schema (embedded should be fine)
  //*** for boundingBox, set on creation from geocode fetch (just an array of four floats); additionally, store geocode as lon, lat instead of lat, lon from now on

  const { docs } = fetched; // TODO: fetch policy, opsys, subunits

  const {
    name,
    address,
    geoCode, // TODO: when address state updates, make API call to fetch this. On success, preview with Map3D view, asking if this is correct. If not, (or the geocode fetch fails), inform user and allow them to input the geocode manually 
    apn, // TODO: look for APIs to reliably fetch this
    phone,
    dateBuilt,
    dateAcq,
    wastePickupSched, // TODO: implement event scheduler/manager using daypilot-lite-react
    notes, // TODO: implement basic notepad-style text editor (look for pkgs)

    insurancePolicy,
    opSystems,
    documents, // TODO: add new document type: inspection (use dateEff/expiry to auto-schedule an inspection event (by default, 1 wk before expiry))
    subunits
  } = formData;

  const { useDefaultDateAcq } = formState;

  const dateBuiltRef = refs?.dateBuilt;
  const useDefaultDateAcqRef = refs?.useDefaultDateAcq;

  return (
    <Box maxW='100vw' mx='auto' p={4} borderWidth='1px' borderRadius='8px' boxShadow='xl' bg='white'>
      
      <Heading mb={4} textAlign='center'>Create New Property Profile</Heading>

      <VStack spacing={4} ailgn='stretch'>
        {/* Name input */}
        <FormControl isRequired>
          <FormLabel>Name</FormLabel>
          <Input
            placeholder='Property Name'
            value={name}
            onChange={onChangeField}
          />
        </FormControl>

        {/* Date built input */}
        <FormControl>
          <FormLabel>Date Built</FormLabel>
          <Input
            type='date'
            value={dateBuilt}
            onChange={onChangeDate}
            ref={dateBuiltRef}
          />
        </FormControl>
        
        {/* Date acquired same as date built? */}
        <FormControl>
          <Checkbox
            disabled={!dateBuilt}
            defaultChecked={false}
            onChange={onToggleDefaultDate}
            ref={useDefaultDateAcqRef}
          >
            Use Date Built as Date Acquired
          </Checkbox>
        </FormControl>
        
        {/* Date acquired input */}
        <FormControl>
          <FormLabel>Date Acquired</FormLabel>
          <Input
            placeholder={useDefaultDateAcq ? dateBuilt : ''}
            type='date'
            value={dateAcq}
            onChange={onChangeDate}
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