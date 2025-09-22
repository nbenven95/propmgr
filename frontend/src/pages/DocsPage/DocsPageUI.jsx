import React from 'react';
import { Box, Flex, Stack, Text } from '@chakra-ui/react';

import UIHeader from '../../components/UIHeader';
import DocCard from '../../components/cards/DocCard';

const DocsPageUI = ({
  loading,
  fetched,
  drawerMenu,

  onClickEdit,
  onClickCreate,
  onClickDelete,
  onClickDownload,
 
  bulkMode,
  onBulkDelete,
  onBulkModeToggle,
  onBulkSelectToggle
}) => {
  // Destructure fetched resources
  const { docs } = fetched;
  
  {/* Display loading indicator while fetching */}
  if (loading.docs) {
    return (
      <Flex justify="center" align="center" minH="100vh">
        <Text fontSize="xl">Loading Documents. . .</Text>
      </Flex>
    );
  }

  {/* Display fetched Documents in a stack */}
  return (
    <Box maxW='100vw' mx='auto' p={4}>
      {/* Bulk delete controls, button link to CreateDocForm via drawer */}
      <UIHeader
        title='Documents'
        bulkMode={bulkMode}
        onClickCreate={onClickCreate}
        onClickDelete={onBulkDelete}
        onClickBulkModeToggle={onBulkModeToggle}
      />

      {/* Drawer menu */}
      {drawerMenu}
      
      {/* Main Documents view */}
      {docs.length === 0 ? (
        <Text>No Documents Found</Text>
      ) : (
        <Stack spacing={4}>
          {docs.map((doc) => (
            <DocCard
              doc={doc}
              bulkMode={bulkMode}
              onClickEdit={onClickEdit}
              onClickDelete={onClickDelete}
              onClickDownload={onClickDownload}
              onClickBulkSelect={onBulkSelectToggle}
              key={doc._id}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}

export default DocsPageUI;