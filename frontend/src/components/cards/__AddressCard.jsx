import { Box, Stack, Text } from '@chakra-ui/react';
import { capitalize } from '../../util/util.js';

/**
 * 
 * @param {*} param0 
 * @returns 
 */
const AddressCard = ({
  address
}) => {
  // TODO: logic for formatting abbreviations like 'st', 'ave', 'rd', etc. (e.g., append a period)
  const { streetNumber, streetName, city, state, postalCode, country } = address;
  return (
    <Box border='1px solid' borderColor='gray.200' borderRadius='md' p={4} maxW='400px'>
      <Stack spacing={2}>
        {/* Combine street number and name */}
        <Text fontWeight="bold">
          {streetNumber} {capitalize(streetName)} 
        </Text>
        {/* City, State, Postal Code */}
        <Text>
          {capitalize(city)}, {capitalize(state)} {postalCode}
        </Text>
        {/* Country */}
        <Text>{capitalize(country)}</Text>
      </Stack>
    </Box>
  );
};

export default AddressCard;