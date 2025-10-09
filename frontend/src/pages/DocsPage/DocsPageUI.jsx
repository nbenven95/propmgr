import React from 'react';
import { Box, Flex, Heading, Spacer, Stack, Text } from '@chakra-ui/react';

import DocCard from '../../components/cards/DocCard';
import CreateNewItemBtn from '../../components/buttons/CreateNewItemBtn';

const DocsPageUI = ({
  fetched,
  isFetching,
  LoadingIndicator,
  DrawerMenu,
  onClickEdit,
  onClickCreate,
  onClickDelete,
  onClickDownload,
  bulkOpEnabled,
  BulkSelector,
  BulkController
}) => {  
  // If defined, display loading indicator while fetching
  if (LoadingIndicator && isFetching) return <LoadingIndicator />

  // De-structure fetched resources
  const { docs } = fetched;

  // Display fetched Documents
  return (
    <Box maxW='100vw' mx='auto' p={4}>
      
      {/* Page header */}
      <Flex mb={4} align='center'>
        {/* Button to open CreateDocForm drawer */}
        <CreateNewItemBtn label='Create New Document' onClick={onClickCreate} />
        <Heading size='lg'>Documents</Heading>
        <Spacer />
        {/* Display bulk delete controls */}
        {BulkController}
      </Flex>

      {/* Init drawer menu (if defined) */}
      {DrawerMenu && <DrawerMenu />}
      
      {/* TODO: update to use flex container (include 'not found' text) */}
      {docs.length === 0 ? (
        <Text>No Documents Found</Text>
      ) : (
        <Stack spacing={4}>
          {docs.map(doc => (
            <DocCard
              doc={doc}
              onClickEdit={() => onClickEdit(doc._id)}
              onClickDelete={() => onClickDelete(doc._id)}
              onClickDownload={() => onClickDownload(doc.fileRef?._id, doc.fileRef?.name)}
              bulkOpEnabled={bulkOpEnabled}
              BulkSelector={BulkSelector}
              key={doc._id}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}

export default DocsPageUI;