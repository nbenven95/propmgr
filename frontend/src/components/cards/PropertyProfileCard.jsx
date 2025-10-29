import { Box, Button, Flex, HStack, IconButton, Spacer, Text, Tooltip } from '@chakra-ui/react';

import { DeleteIcon, EditIcon } from '@chakra-ui/icons';

import AddressCard from './AddressCard';
import AgeCard from './AgeCard';
import MapCard from './MapCard';

// TODO: refactor to map card, look into more style sheet and styling options (e.g., put a box around the property)
// TODO: set up geocoding support on backend (will probably need to access OSM geocoding API)
// TODO: only render map and street view if property has a valid geocode (the API may not always succeed)

// TODO: look into how to properly use the public instance of openfreemap (local hosting takes 300-500 GB): https://github.com/hyperknot/openfreemap
// TODO: example project using react-maplibre and OFM: https://github.com/w3cj/openfreemap-examples/tree/main/react-example

const PropertyProfileCard =({
  property,
  onClickEdit,
  onClickDelete,
  BulkSelector
}) => {
  // De-structure PropertyProfile data
  const {
    name,
    address,
    geoCode,
    apn,
    phone,
    dateBuilt,
    dateAcq,
    age,
    wastePickupSched,
    notes,
    insurancePolicy,
    opSystems,
    documents,
    subunits,
    _id,
    updatedAt
  } = property;

  return (
    <Box
      position='relative'
      borderWidth='1px'
      borderRadius='8px'
      bg='white'
      shadow='sm'
      p={4}
    >
      {/* Render main content */}
      <Flex direction='column' align='start' >  
        
        {/* If defined, render bulk selector */}
        {BulkSelector && <BulkSelector id={_id} />}

        {/* Card header */}
        <HStack width='full' justify='space-between' align='center' mb={2}>
          {/* Property name */}
          <Text fontWeight='bold' fontSize='2xl'>{name}</Text>
          {/* Date of last update */}
          {updatedAt && <HStack>
            <Text fontWeight='bold'>Last Updated: </Text>
            <Text>{new Date(updatedAt).toDateString()}</Text>
          </HStack>}
        </HStack>

        {/* GPS Map View */}
        {geoCode && <>
          <MapCard geoCode={geoCode} />
          <Spacer padding={1} />
        </>}

        {/* Property address */}
        {address && <>
          <AddressCard address={address} />
          <Spacer padding={1} />
        </>}

        {/* APN */}
        {apn && <HStack spacing={2} >
          <Tooltip label={'Assesor Parcel Number (Tax ID Number'} >
            <Text fontWeight='bold' >APN: </Text>
            <Text>{apn}</Text>
          </Tooltip>
          <Spacer padding={1} />
        </HStack>}

        {/* Date built */}

        {/* Date of acquisition */}

        {/* Age */}
        {age && <>
           <AgeCard age={age} />
           <Spacer padding={1} />
        </>}

        {/* TODO Insurance policy */}

        {/* TODO  Operational Systems */}

        {/* Property Profile attached Documents */}
        {documents && <>
          <HStack spacing={2} >
            <Text fontWeight='bold' >Attached Documents: </Text>
            <Text >{documents.length}</Text>
          </HStack>
          <Spacer padding={1} />
        </>}

        {/* TODO Subunits */}

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
        <Spacer padding={1} />
      </Flex>

    </Box>
  );
};

export default PropertyProfileCard;