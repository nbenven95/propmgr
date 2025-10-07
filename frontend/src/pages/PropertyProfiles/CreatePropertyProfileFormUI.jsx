import React from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  Heading,
  VStack,
  Checkbox,
  Input,
  IconButton,
  Flex,
  Button
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';

import AddressAutoCompleteForm from '../../components/forms/AddressAutoCompleteForm';
import { formatDisplayDate } from '../../util/util';

// Lon/lat bias for Saratoga Springs
const SARATOGA_SPRINGS = [-73.77, 44.08];

const CreatePropertyProfileFormUI = ({
  refs,
  fetched,
  loading,
  ready,
  submitting,
  required,
  formData,
  formState,
  onClickSubmit,
  onChangeField,
  onChangeDate,
  onSelectAddress,
  onClearAddress,
  onValidateFormData,
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
    geocode,
    extent,
    apn, // TODO: look for APIs to reliably fetch this
    dateBuilt,
    dateAcq,
    phone,
    wastePickupSched, // TODO: implement event scheduler/manager using daypilot-lite-react
    notes, // TODO: implement basic notepad-style text editor (look for pkgs)

    documents, // TODO: add new document type: inspection (use dateEff/expiry to auto-schedule an inspection event (by default, 1 wk before expiry))
    insurancePolicy,
    opSystems,
    subunits
  } = formData;

  const { useDefaultDateAcq } = formState;

  const addressInputRef = refs?.addressInput;
  const dateBuiltRef = refs?.dateBuilt;
  const useDefaultDateAcqRef = refs?.useDefaultDateAcq;

  return (
    <Box maxW='100vw' mx='auto' p={4} borderWidth='1px' borderRadius='8px' boxShadow='xl' bg='white'>
      
      <Heading mb={4} textAlign='center'>Create New Property Profile</Heading>

      <VStack spacing={4} ailgn='stretch'>
        {/* Use approx. geocode for Saratoga Springs as bias to narrow down search results */}
        <FormControl isRequired={required.address}>
          <FormLabel>Address</FormLabel>
          {address ? (
            <Box display='flex' alignItems='center' gap={2}>
            <Input
              isReadOnly
              value={(() => {
                const { streetNumber, streetName, city, state, postalCode, country } = address;
                const line1 = `${streetNumber} ${streetName}`
                const line2 = `${city}, ${state} ${postalCode}`
                const line3 = country;
                return [line1, line2, line3].join(', ');
              })()}
              whiteSpace='pre-line'
            />
            <IconButton
              aria-label='Clear address'
              icon={<CloseIcon />}
              onClick={onClearAddress}
              size='sm'
            />
          </Box>
          ) : (
            <AddressAutoCompleteForm bias={SARATOGA_SPRINGS} onSelect={onSelectAddress} />
          )}
        </FormControl>

        {/* Name input TODO: read from API response, give user the option to overwrite */}
        <FormControl isRequired={required.name}>
          <FormLabel>Name</FormLabel>
          <Input name='name' placeholder='Property Name' value={name} onChange={e => onChangeField(e)} />
        </FormControl>

        {/* 
        <FormControl>
          <FormLabel>Date Built</FormLabel>
          <Input
            name='dateBuilt'
            type='date'
            value={dateBuilt}
            onChange={onChangeDate}
            ref={dateBuiltRef}
          />
        </FormControl>
        
        <FormControl>
          <Checkbox
            name='useDefaultDateAcq'
            disabled={!dateBuilt}
            defaultChecked={false}
            onChange={onToggleDefaultDate}
            ref={useDefaultDateAcqRef}
          >
            Use Date Built as Date Acquired
          </Checkbox>
        </FormControl>
        
        <FormControl>
          <FormLabel>Date Acquired</FormLabel>
          <Input
            name='dateAcq'
            type='date'
            placeholder={useDefaultDateAcq ? formatDisplayDate(dateBuilt) : ''}
            value={dateAcq}
            onChange={onChangeDate}
          />
        </FormControl>

        <FormControl>
          <Tooltip label={'Assessor\'s Parcel Number (Tax ID Number)'}>
            <FormLabel>APN</FormLabel>
          </Tooltip>
          <Input
            name='apn'
          />
        </FormControl>
        */}
        
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

        {/* Submit button */}
        <Flex justify='center' mt={4}>
          <Button
            colorScheme='teal'
            onClick={onClickSubmit}
            isLoading={submitting}
            disabled={!ready}
            loadingText='Submitting. . .'
            width='100%'
          >
            Create Property Profile
          </Button>
        </Flex>
      </VStack>
    </Box>
  );
};

export default CreatePropertyProfileFormUI;