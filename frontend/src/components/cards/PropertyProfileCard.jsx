import { Box, Button, Flex, HStack, IconButton, Text } from '@chakra-ui/react';

import { DeleteIcon, EditIcon } from '@chakra-ui/icons';

import { Map } from '@vis.gl/react-maplibre';

import AddressCard from './AddressCard';
import AgeCard from './AgeCard';

// TODO: refactor to map card, look into more style sheet and styling options (e.g., put a box around the property)
// TODO: set up geocoding support on backend (will probably need to access OSM geocoding API)
// TODO: only render map and street view if property has a valid geocode (the API may not always succeed)

// TODO: look into how to properly use the public instance of openfreemap (local hosting takes 300-500 GB): https://github.com/hyperknot/openfreemap
// TODO: example project using react-maplibre and OFM: https://github.com/w3cj/openfreemap-examples/tree/main/react-example
const mapStyle = 'https://tiles.openfreemap.org/styles/liberty';

const PropertyProfileCard =({
  property,
  onClickEdit,
  onClickDelete,
  BulkSelector
}) => {
  // De-structure fetched data
  const { _id, updatedAt, name, geoCode, address, age, documents } = property;
  const [lat, lon] = geoCode?.coordinates;

  return (
    <Box
      position='relative'
      borderWidth='1px'
      borderRadius='8px'
      bg='white'
      shadow='sm'
      p={4}
    >
      {/* Display Property Profile data */}
      <Flex
        direction='column'
        align='start'
      >  
        {/* Render bulk selector checkbox if one was provided */}
        {BulkSelector && <BulkSelector id={_id} />}

        {/* Property name */}
        <Text fontWeight='bold'>{name}</Text>

        {/* GPS Map View */}
        {geoCode && <Map 
          initialViewState={{
            longitude: lon,
            latitude: lat,
            zoom: 15
          }}
          style={{ width: 200, height: 200 }}
          mapStyle={mapStyle}
          attributionControl={false}
        />}

        {/* Property address */}
        {address && <AddressCard address={address} />}

        {/* Property age */}
        {age && <AgeCard age={property.age} />}

        {/* Property Profile attached Documents */}
        {documents && <HStack spacing={2} >
          <Text fontWeight='bold' >Attached Documents: </Text>
          <Text >{documents.length}</Text>
        </HStack>}

        {/* Edit/Delete controls */}
        <Flex width='full' justify='space-between' align='center' mt={2} >
          {/* Edit Document button */}
          <Button size='sm'
            leftIcon={<EditIcon />}
            aria-label='Edit Document'
            colorScheme='teal'
            onClick={() => onClickEdit(property)}
          >
            Edit
          </Button>
          {/* Delete Document button */}
          <IconButton
            icon={<DeleteIcon />}
            size='sm'
            aria-label='Delete Property Profile'
            colorScheme='red'
            onClick={() => onClickDelete(property)}
          />  
        </Flex>

        {/* Display time of last update */}
        {updatedAt && <Text>Last Updated: {new Date(updatedAt).toDateString()}</Text>}
      </Flex>

    </Box>
  );
};

export default PropertyProfileCard;