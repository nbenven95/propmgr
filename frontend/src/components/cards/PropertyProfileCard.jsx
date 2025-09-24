import { Box, Button, Flex, IconButton, Text } from '@chakra-ui/react';

import { DeleteIcon, EditIcon } from '@chakra-ui/icons';

import { Map } from '@vis.gl/react-maplibre';

import AddressCard from './AddressCard';
import AgeCard from './AgeCard';

// TODO: refactor to MapCard
// MapLibre style URL
const mapStyle = 'https://tiles.openfreemap.org/styles/liberty';

const PropertyProfileCard =({
  property,
  onClickEdit,
  onClickDelete,
  BulkSelector
}) => {
  return (
    <Box position='relative' borderWidth='1px' borderRadius='8px' bg='white' shadow='sm' p={4}>
      
      {/* Render bulk selector checkbox if one was provided */}
      {BulkSelector && <BulkSelector id={property._id} />}

      {/* Display Property Profile data */}
      <Flex direction='column' align='start' pl={bulkMode.enabled ? 6 : 0} >
        
        {/* Property name */}
        <Text fontWeight='bold'>{property.name}</Text>

        {/* GPS Map View */}
        {!property.geoCode && <Map 
          initialViewState={{
            longitude: property.geoCode.coordinates[1],
            latitude: property.geoCode.coordinates[0],
            zoom: 15
          }}
          style={{ width: 200, height: 200 }}
          mapStyle={mapStyle}
          attributionControl={false}
        />}

        {/* Property address */}
        {property.address && (
          <AddressCard address={property.address} />
        )}

        {/* Property age */}
        {property.age && 
          <AgeCard age={property.age} />
        }

        {/* Property Profile attached Documents */}
        {property.documents &&
          <Text># Attached Documents: {property.documents.length}</Text>
        }

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
        {doc.updatedAt && <Text>Last Updated: {new Date(doc.updatedAt).toDateString()}</Text>}
      </Flex>

    </Box>
  );
};

export default PropertyProfileCard;