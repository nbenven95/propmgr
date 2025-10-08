import React from 'react';
import { Box, Flex, Heading, Spacer, Text, Tooltip } from '@chakra-ui/react';

import CreateNewItemBtn from '../../components/buttons/CreateNewItemBtn';
import FileCard from '../../components/cards/FileCard';

/**
 * 
 * @param {*} props
 * @returns 
 */
const FilesPageUI = ({
  loading,
  fetched,
  onClickUpload,
  onClickDelete,
  onClickDownload,
  DrawerMenu,
  bulkOpEnabled,
  BulkSelector,
  BulkController
}) => {
  // Destructure fetched resources
  const { files } = fetched;

  {/* Display loading indicator while fetching */}
  if (loading.files) {
    return (
      <Flex justify='center' align='center' minH='100vh'>
        <Text fontSize='xl'>Loading Files. . .</Text>
      </Flex>
    );
  }

  {/* Display fetched Files in a grid */}
  return (
    <Box maxW='100vw' mx='auto' p={4} >
      
      {/* Page header */}
      <Flex mb={4} align='center'>
        {/* Button to open UploadForm drawer */}
        <CreateNewItemBtn label='Upload New File' onClick={onClickUpload} />
        <Heading size='lg'>Files</Heading>
        <Spacer />
        {/* Bulk delete controls */}
        {BulkController}
      </Flex>

      {/* Drawer menu: render UploadForm on open */}
      {DrawerMenu && <DrawerMenu />}

      {/* Display uploaded Files */}
      {files.length === 0 ? (
        <Text>No Files Found</Text>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginTop: '20px' }} >
          {files.map(file => (
            <Tooltip key={file._id} label={
              file.documents?.length === 0
                ? 'No Linked Documents'
                : `Linked documents (${file.documents?.length}): ${file.documents.map(doc => doc.name).join(', ')}`
            }>
              <FileCard 
                file={file}
                onClickRemove={() => onClickDelete(file._id)}
                onClickDownload={onClickDownload}
                bulkOpEnabled={bulkOpEnabled}
                BulkSelector={BulkSelector}
                key={file._id}
              />
            </Tooltip>
          ))}
        </div>
      )}
    </Box>
  );
};

export default FilesPageUI;