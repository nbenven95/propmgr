import React from 'react';
import { Box, Stack, Text } from '@chakra-ui/react';

/**
 * 
 * @param {*} param0 
 * @returns 
 */
const AddressCard = ({
  address
}) => {
  return (
    <Box border='1px solid' borderColor='gray.200' borderRadius='md' p={4} maxW='400px'>
      <Stack spacing={2}>
        {/* Combine street number and name */}
        <Text fontWeight="bold">
          {address.streetNumber} {address.streetName}
        </Text>
        {/* City, State, Postal Code */}
        <Text>
          {address.city}, {address.state} {address.postalCode}
        </Text>
        {/* Country */}
        <Text>{address.country}</Text>
      </Stack>
    </Box>
  );
};

export default AddressCard;