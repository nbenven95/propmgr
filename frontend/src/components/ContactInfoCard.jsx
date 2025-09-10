import React from 'react'
import { Box, Text, VStack } from '@chakra-ui/react'

import AddressCard from './AddressCard'

const ContactInfoCard = ({
  first,
  last,
  phone,
  email,
  address
}) => {
  // Format the phone number with US area code (assuming input is 10 digits)
  const formatPhoneNumber = (number) => {
    const cleaned = ('' + number).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return number; // fallback if input isn't 10 digits
  };

  return (
    <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={4} maxW="400px" bg="white">
      <VStack spacing={2} align="start">
        <Text fontSize="lg" fontWeight="bold">
          {first} {last}
        </Text>
        <Text>
          <strong>Phone:</strong> {formatPhoneNumber(phone)}
        </Text>
        <Text>
          <strong>Email:</strong> {email}
        </Text>
      </VStack>
    </Box>
  );
};

export default ContactInfoCard;