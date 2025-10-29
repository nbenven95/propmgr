// TODO: deprecate?

import React, { useState } from 'react';
import {
  FormControl,
  FormLabel,
  Input,
  IconButton,
  FormErrorMessage,
  Box,
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';
import AddressAutoCompleteForm from './AddressAutoCompleteForm';

const AddressInputForm = () => {
  const [selectedAddr, setSelectedAddr] = useState(null);
  const [touched, setTouched] = useState(false);

  const handleClear = () => {
    setSelectedAddr(null);
    setTouched(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(true);

    if (!selectedAddr) {
      // Prevent submit
      return;
    }

    // Do something with the selected address
    alert(`Submitting: ${parseAddrFromFeature(selectedAddr)}`);
  };

   const isInvalid = touched && !selectedAddr;

  return (
    <form onSubmit={handleSubmit}>
      <FormControl isRequired isInvalid={isInvalid} mb={4}>
        <FormLabel>Address</FormLabel>

        {selectedAddr ? (
          <Box display="flex" alignItems="center" gap={2}>
            <Input
              isReadOnly
              value={parseAddrFromFeature(selectedAddr)}
              whiteSpace="pre-line"
            />
            <IconButton
              aria-label="Clear address"
              icon={<CloseIcon />}
              onClick={handleClear}
              size="sm"
            />
          </Box>
        ) : (
          <AddressAutoCompleteForm
            onSelectAddr={(feature) => setSelectedAddr(feature)}
          />
        )}

        {isInvalid && (
          <FormErrorMessage>Address is required.</FormErrorMessage>
        )}
      </FormControl>

      <button type="submit">Submit</button>
    </form>
  );
};

export default AddressInputForm;