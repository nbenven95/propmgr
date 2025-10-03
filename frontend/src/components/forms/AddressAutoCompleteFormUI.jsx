import React from 'react';
import {
  Box,
  Input,
  List,
  ListItem,
  ListIcon,
  Spinner,
  Text,
  HStack
} from '@chakra-ui/react';
import { FaMapMarkerAlt } from 'react-icons/fa';

import AddressCard from '../cards/AddressCard';
import { parseFeature } from './AddressAutoCompleteForm';

// TODO: restructure this so that it takes <Text/> as a child, use this as the target
/**
 * 
 * @param {*} props
 * @returns JSX.Element
 */
const HighlightMatch = ({
  target,
  query
}) => {
  const i = String(target)
    .toLowerCase()
    .indexOf(String(query).toLowerCase());
  // Query substring not found in target string 
  if (i === -1) return target;
  const queryLen = String(query).length;
  return (
    <Text>
      {String(target).slice(0, i)}
      <b>{target.slice(i, i + queryLen)}</b>
      {String(target).slice(i + queryLen)}
    </Text>
  );
};

/**
 * 
 * @param {*} props
 * @returns JSX.Element
 */
const AddressAutoCompleteFormUI = ({
  refs,
  loading,
  formState,
  onInputChange,
  onResultClick,
  onKeyDown
}) => {
  // De-structure form state
  const { query, results, highlightIndex, noResults, selectedAddr } = formState;

  // TODO: differentiate between these
  const isLoading = loading.suggestedAddresses || loading.reverseGeocodeLookup;

  return (
    <Box position='relative' width='100%'>
      {/* Input Field */}
      <Input
        placeholder='Start typing an address, e.g. 123 Main. . .'
        value={query}
        onChange={onInputChange}
        onKeyDown={onKeyDown}
        autoComplete='off'
      />

      {/* Loading Spinner */}
      {isLoading && (
        <Spinner size='sm' position='absolute' right='10px' top='10px' color='gray.500' />
      )}

      {/* Dropdown List */}
      {results.length > 0 && (
        <Box
          position='absolute'
          top='100%'
          width='100%'
          bg='white'
          border='1px solid'
          borderColor='gray.200'
          borderRadius='md'
          mt={2}
          zIndex={1000}
          ref={refs.list} // TODO: should list ref go here, or in actual list?
        >
          {results.length > 0 ? (
            <List spacing={0}>
              {results.map((feature, index) => {
                return (
                  <ListItem key={index}>
                    <HStack
                      px={4}
                      py={2}
                      cursor='pointer'
                      bg={highlightIndex === index ? 'gray.100' : 'white'}
                      _hover={{ bg: 'gray.50' }}
                      onClick={() => onResultClick(feature)}
                    >
                      <ListIcon
                        as={FaMapMarkerAlt}
                        boxSize={4}
                        color='gray.500'
                        mt={1}
                        mr={3}
                        flexShrink={0}
                      />
                      <AddressCard address={parseFeature(feature)?.address} query={query} />
                    </HStack>
                  </ListItem>
                );
              })}
            </List>
          ) : (
            // No suggestions found
            <Box px={4} py={2}>
              <Text fontSize='sm' color='gray.500'>No results found.</Text>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default AddressAutoCompleteFormUI;