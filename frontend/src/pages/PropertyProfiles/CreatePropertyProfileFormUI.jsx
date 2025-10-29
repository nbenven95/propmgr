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
import PhoneInputForm from '../../components/forms/PhoneInputForm';

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
  onToggleDefaultDate,
  onChangeField,
  onChangeDate,
  onChangeAddress,
  onClearAddress,
  onChangePhone,
  onClearPhone,
  onValidateFormData, // ???
  
}) => {

  // TODO: add images*, events**, and boundingBox*** fields to mongoose schema
  //* for images, refactor Dropzone component (possibly into a hook)
  //** for events, look at how daypilot structures event objects before creating schema (embedded should be fine)
  //*** for boundingBox, set on creation from geocode fetch (just an array of four floats)

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
                // Format the address for display
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
            <AddressAutoCompleteForm bias={SARATOGA_SPRINGS} onSelect={onChangeAddress} />
          )}
        </FormControl>

        {/* Name input TODO: read from API response, give user the option to overwrite */}
        <FormControl isRequired={required.name}>
          <FormLabel>Name</FormLabel>
          <Input name='name' placeholder='Property Name' value={name} onChange={e => onChangeField(e)} />
        </FormControl>

        {/* Phone number input */}
        <FormControl isRequired={required.phone}>
          <FormLabel>Phone Number</FormLabel>
          <Box display='flex' alignItems='center' gap={2}>
            
            <IconButton
              disabled={!phone}
              aria-label='Clear Phone Number'
              icon={<CloseIcon />}
              onClick={onClearPhone}
              size='sm'
            />
          </Box>
        </FormControl>

        {/*

        <FormControl isRequired={required.dateBuilt}>
          <FormLabel>Date Built</FormLabel>
          <Input
            name='dateBuilt'
            type='date'
            value={dateBuilt}
            onChange={onChangeDate}
            ref={dateBuiltRef}
          />
        </FormControl>
        
        <FormControl isRequired={false}>
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
        
        <FormControl isRequired={required.dateAcq}>
          <FormLabel>Date Acquired</FormLabel>
          <Input
            name='dateAcq'
            type='date'
            placeholder={useDefaultDateAcq ? formatDisplayDate(dateBuilt) : ''}
            value={dateAcq}
            onChange={onChangeDate}
          />
        </FormControl>

        <FormControl isRequired={required.apn}>
          <Tooltip label={'Assessor\'s Parcel Number (Tax ID Number)'}>
            <FormLabel>APN</FormLabel>
          </Tooltip>
          <Input
            name='apn'
            value={apn}
            onChange={onChangeField}
          />
        </FormControl>

        */}
        
        {/* Waste pickup schedule input */}
        <FormControl></FormControl>
        
        {/* Text input for notes -- TODO: more functional notepad-like UI*/}
        <FormControl></FormControl>

        {/* Property documents selector */}
        <FormControl></FormControl>
        
        {/* Insurance policy selector -- TODO: implement insurancePolicies backend */}
        <FormControl></FormControl>

        {/* opSystems selector -- TODO: implement opSystems backend */}
        <FormControl></FormControl>
        
        {/* Subunits selector -- TODO: implement subunits backend */}
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