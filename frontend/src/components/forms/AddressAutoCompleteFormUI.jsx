import React from 'react';
import {
  Box,
  Input,
  List,
  ListItem,
  Spinner,
  Text,
} from '@chakra-ui/react';

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
  return (<>
    {String(target).slice(0, i)}
    <b>{target.slice(i, i + queryLen)}</b>
    {String(target).slice(i + queryLen)}
  </>);
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
  const {
    query,
    results,
    highlightIndex,
    noResults,
    selectedAddr
  } = formState;

  const isLoading = loading.suggestedAddresses || loading.reverseGeocodeLookup;

  return (
    <Box position="relative" width="100%">
      {/* Input Field */}
      <Input
        placeholder="Search for an address..."
        value={query}
        onChange={onInputChange}
        onKeyDown={onKeyDown}
        autoComplete="off"
      />

      {/* Loading Spinner */}
      {isLoading && (
        <Spinner
          size="sm"
          position="absolute"
          right="10px"
          top="10px"
          color="gray.500"
        />
      )}

      {/* Dropdown List */}
      {(results.length > 0 || noResults) && (
        <Box
          position="absolute"
          top="100%"
          width="100%"
          bg="white"
          border="1px solid"
          borderColor="gray.200"
          borderRadius="md"
          mt={2}
          zIndex={1000}
          ref={refs.list}
        >
          {results.length > 0 ? (
            <List spacing={0}>
              {results.map((feature, index) => {
                const placeName = feature.place_name || feature.properties?.label || feature.properties?.name || 'Unknown';

                return (
                  <ListItem
                    key={feature.id || index}
                    px={4}
                    py={2}
                    bg={highlightIndex === index ? 'gray.100' : 'white'}
                    cursor="pointer"
                    _hover={{ bg: 'gray.50' }}
                    onClick={() => onResultClick(feature)}
                  >
                    <Text fontSize="sm">
                      <HighlightMatch target={placeName} query={query} />
                    </Text>
                  </ListItem>
                );
              })}
            </List>
          ) : (
            <Box px={4} py={2}>
              <Text fontSize="sm" color="gray.500">
                No results found.
              </Text>
            </Box>
          )}
        </Box>
      )}

      {/* Selected address preview (optional) */}
      {selectedAddr && (
        <Box mt={2}>
          <Text fontSize="sm" color="green.600">
            Selected: {selectedAddr}
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default AddressAutoCompleteFormUI;