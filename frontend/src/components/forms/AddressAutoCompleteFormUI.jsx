import React from 'react';
import {
  Box,
  Input,
  List,
  ListItem,
  Spinner,
  Text,
} from '@chakra-ui/react';

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
 * @param {*} feature 
 * @returns 
 */
const parseAddrFromFeature = (feature) => {
  if (!feature) return 'Undefined';

  // 1. Use place_name if available (common with Mapbox/Nominatim)
  if (feature.place_name) return feature.place_name;

  const props = feature.properties || {};

  // 2. Use 'label' or 'name' fields if available
  if (props?.label) return props.label;
  if (props?.name) return props.name;

  // 3. Construct address from components, if available
  const parts = [
    props.housenumber,
    props.street || props.road,
    props.city || props.town || props.village,
    props.state,
    props.postcode,
    props.country || props.countrycode
  ].filter(Boolean); // remove null/undefined

  if (parts.length > 0) {
    const line1 = [props.housenumber, props.street || props.road].filter(Boolean).join(' ');
    const line2 = [props.city || props.town || props.village, props.state].filter(Boolean).join(', ')
      .concat(` ${props.postcode || ''}`);
    const line3 = props.country || props.countrycode;
    return [line1, line2, line3].filter(Boolean).join('\n');
  }

  // Fallback: couldn't parse anything meaningful
  return 'Undefined';
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

  const isLoading = loading.suggestedAddresses || loading.reverseGeocodeLookup;

  return (
    <Box position='relative' width='100%'>
      {/* Input Field */}
      <Input
        placeholder='Search for an address. . .'
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
            <List spacing={0} ref={refs.list}>
              {results.map((feature, index) => {
                return (
                  <ListItem
                    key={feature.id || index}
                    px={4}
                    py={2}
                    bg={highlightIndex === index ? 'gray.100' : 'white'}
                    cursor='pointer'
                    _hover={{ bg: 'gray.50' }}
                    onClick={() => onResultClick(feature)}
                  >
                    <HighlightMatch
                      target={parseAddrFromFeature(feature)}
                      query={query}
                    />
                  </ListItem>
                );
              })}
            </List>
          ) : (
            <Box px={4} py={2}>
              <Text fontSize='sm' color='gray.500'>
                No results found.
              </Text>
            </Box>
          )}
        </Box>
      )}

      {/* Selected address preview (optional) */}
      {selectedAddr && (
        <Box mt={2}>
          <Text>Selected:</Text>
          <Text fontSize='sm' color='green.600' whiteSpace='pre-line'>
            {parseAddrFromFeature(selectedAddr)}
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default AddressAutoCompleteFormUI;