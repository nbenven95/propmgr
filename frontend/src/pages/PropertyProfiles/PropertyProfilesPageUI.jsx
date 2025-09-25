import React from 'react';
import { Box, Flex, Heading, Spacer, Stack, Text } from '@chakra-ui/react';

import CreateNewItemBtn from '../../components/buttons/CreateNewItemBtn';
import PropertyProfileCard from '../../components/cards/PropertyProfileCard';


const PropertyProfilesPageUI = ({
  loading,
  fetched,
  
  onClickEdit,
  onClickCreate,
  onClickDelete,

  DrawerMenu,
  BulkSelector,
  BulkController,
}) => {
  // Destructure fetched resources
  const { properties } = fetched;

  // Display loading indicator while fetching resources
  if (loading.properties) {
    return (
      <Flex justify='center' align='center' minH='100vh'>
        <Text fontSize='xl'>Loading Properties. . .</Text>
      </Flex>
    );
  }

  // Display fetched Property Profiles
  return (
    <Box maxW='100vw' mx='auto' p={4}>

      {/* Page header */}
      <Flex mb={4} align='center'>
        <Heading size='lg'>Property Profiles</Heading>
        {/* Create new item button */}
        <CreateNewItemBtn label='Create new Property Profile' onClick={onClickCreate} />
        <Spacer />
        {/* Bulk delete controls */}
        {BulkController}
      </Flex>

      {/* Drawer menu (render Create/Edit form) on open */}
      {DrawerMenu && <DrawerMenu />}

      {/* Display Property Profiles */}
      {properties.length === 0 ? (
        <Text>No Property Profiles Found</Text>
      ) : (
        <Stack spacing={4}>
          {properties.map(property => (
            <PropertyProfileCard
              property={property}
              onClickEdit={onClickEdit}
              onClickDelete={onClickDelete}
              BulkSelector={BulkSelector}
              key={property._id}
            />
          ))}
        </Stack>
      )}

    </Box>
  );
};

export default PropertyProfilesPageUI;