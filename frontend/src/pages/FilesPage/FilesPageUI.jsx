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
  fetched,
  isFetching,
  LoadingIndicator,
  DrawerMenu,
  onClickUpload,
  onClickDownload, // TODO: implement
  onClickDelete,
  bulkOpEnabled,
  BulkSelector,
  BulkController
}) => {
  // If defined, display loading indicator if still fetching
  if (LoadingIndicator && isFetching) return <LoadingIndicator />;

  // De-structure fetched resources
  const { files } = fetched;

  // Display fetched files in a grid
  return (
    <Box maxW='100vw' mx='auto' p={4}>

      {/* Page header */}
      <Flex mb={4} align='center'>
        {/* Button to open UploadForm drawer */}
        <CreateNewItemBtn label='Upload New File' onClick={onClickUpload} />
        <Heading size='lg'>Files</Heading>
        <Spacer />
        {/* Render bulk delete controls */}
        {BulkController}
      </Flex>

      {/* Init drawer menu (if defined) */}
      {DrawerMenu && <DrawerMenu />}

      {/* TODO: update to use flex container (include 'not found' text) */}
      {/* Render main content when fetch completes */}
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
                onClickDownload={() => onClickDownload(file._id, file.name)}
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