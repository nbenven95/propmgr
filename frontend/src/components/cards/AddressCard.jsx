import React from 'react';
import { Box, Text } from '@chakra-ui/react';

/**
 * 
 * @param {string} text 
 * @param {string} query 
 * @returns 
 */
const highlightMatch = (text, query) => {
  if (!query) return text;
  
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  
  if (tokens.length === 0) return text;

  const regex = new RegExp(`(${tokens.join('|')})`, 'gi');
  const parts = String(text).split(regex);
  return parts.map((part, i) =>
    tokens.includes(part.toLowerCase()) ? (
      <Box as='span' key={i} bg='yellow.200' borderRadius='sm' px='1'>{part}</Box>
    ) : (
      part
    )
  );
};

/**
 * 
 * @param {object} props
 * @returns 
 */
const AddressCard = ({ address, query = '' }) => {
  if (!address) return null;

  const {
    streetNumber  = '',
    streetName    = '',
    city          = '',
    state         = '',
    postalCode    = '',
    country       = ''
  } = address;

  return (
    <Box>
      <Text fontWeight='bold'>
        {highlightMatch(`${streetNumber} ${streetName}`.trim(), query)}
      </Text>
      <Text fontSize='sm' color='gray.600'>
        {highlightMatch([city, `${state} ${postalCode}`, country].join(', '), query)}
      </Text>
    </Box>
  );
};

export default AddressCard;