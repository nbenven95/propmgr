import React from 'react'
import {
  Box,
  Button,
  Checkbox,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Heading,
  IconButton,
  Spacer,
  Stack,
  Text
} from '@chakra-ui/react'
import { DeleteIcon, DownloadIcon, EditIcon, PlusSquareIcon } from '@chakra-ui/icons'

import DocCard from '../../components/doccard'

const PropertyProfilesPageUI = ({
  loading,
  properties,
  selectedProperties,
  setSelectedProperties,
  handleDelete,
  bulkMode,
  setBulkMode,
  toggleSelect,
  handleDeleteBulk,
  handleClickCreate,
  handleClickEdit,
  isOpen,
  onClose,
  drawerHeader,
  drawerBody
}) => {
  // Display loading text if loading
  if (loading) {
    return (
      <Flex justify='center' align='center' minH='100vh'>
        <Text fontSize='xl'>Loading Properties. . .</Text>
      </Flex>
    );
  }
  // Else, display main Property Profiles view
  return (
    <Box maxW='100vw' mx='auto' p={4}>
      <Flex mb={4} align='center'>
        <Heading size='lg'>Property Profiles</Heading>
        {/* Create new Property Profile button (opens drawer menu) */}
        <Box px={6} transform={'scale(2)'}>
          <IconButton
            colorScheme='blue'
            aria-label='Create New Property Profile'
            size='xs'
            icon={<PlusSquareIcon />} 
            onClick={handleClickCreate}
          />
        </Box>
        <Spacer />
        {/* Display/hide bulk delete controls */}
        {bulkMode ? (
          // Bulk mode currently enabled
          <>
            <Button
              size='sm'
              colorScheme='red'
              onClick={() => {
                setBulkMode(false);
                setSelectedProperties([]);
              }}
            >
              Cancel Bulk Delete
            </Button>
            <Button
              size='sm'
              ml={2}
              colorScheme='red'
              onClick={handleDeleteBulk}
              isDisabled={selectedProperties.length === 0}
            >
              Delete Selected
            </Button>
          </>
        ) : (
          // Bulk mode currently disabled
          <Button
            size='sm'
            onClick={() => setBulkMode(true)}
            colorScheme='blue'
          >
            Enable Bulk Delete
          </Button>
        )}
      </Flex>
      {/* Display Property Profiles */}
      {properties.length === 0 ? (
        <Text>No Property Profiles Found</Text>
      ) : (
        <Stack spacing={4}>
          {properties.map(property => (
            <Box
              key={property._id}
              position='relative'
              p={4}
              borderWidth='1px'
              borderRadius='8px'
              bg='white'
              shadow='sm'
            >
              {/* If bulk mode is enabled, show 'select' checkbox */}
              {bulkMode && (
                <Checkbox
                  position='absolute'
                  top={2}
                  left={2}
                  isChecked={selectedProperties.includes(property._id)}
                  onChange={() => toggleSelect(property._id)}
                />
              )}
              {/* Display Property Profiles */}
              <Flex direction='column' align='start' pl={bulkMode ? 6 : 0}>
                {/* Property name */}
                <Text fontWeight='bold'>Name: {property.name}</Text>
                {/* Property address */}
                {property.address && <Text>Address: </Text>}
                {/* Property geocode */}
                {property.geoCode && <Text>Latitude: {property.geoCode.coordinates[0]}</Text>}
                {property.geoCode && <Text>Longitude: {property.geoCode.coordinates[1]}</Text>}
                {/* Property documents */}
                {property.documents && <Text>Documents: {property.documents.length}</Text>}
              </Flex>
            </Box>
          ))}
        </Stack>
      )}
      {/* Drawer menu (create and delete) */}
      <Drawer isOpen={isOpen} placement='top' onClose={onClose} size='lg'>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth='1px'>{drawerHeader}</DrawerHeader>
          <DrawerBody p={4}>{drawerBody}</DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default PropertyProfilesPageUI;