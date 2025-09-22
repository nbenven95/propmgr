import React from 'react';
import { Box, Flex, Text, Tooltip } from '@chakra-ui/react';

import UIHeader from '../../components/UIHeader';
import FileCard from '../../components/cards/FileCard';

/**
 * 
 * @param {*} param0 
 * @returns 
 */
const FilesPageUI = ({
  loading,
  fetched,
  drawerMenu,

  onClickUpload,
  onClickDelete,
  onClickDownload,

  bulkMode,
  onBulkDelete,
  onBulkModeToggle,
  onBulkSelectToggle
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
      {/* Bulk delete controls, button link to UploadForm via drawer */}
      <UIHeader 
        title='Files'
        bulkMode={bulkMode}
        onClickCreate={onClickUpload}
        onClickDelete={onBulkDelete}
        onClickBulkModeToggle={onBulkModeToggle}
      />

      {/* Drawer menu */}
      {drawerMenu}

      {/* FileCard grid */}
      {files.length === 0 ? (
        <Text>No Files Found</Text>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginTop: '20px' }} >
          {files.map((file, i) => (
            <Tooltip key={i} label={
              file.documents?.length === 0
                ? 'No Linked Documents'
                : `Linked documents (${file.documents?.length}): ${file.documents.map(d => d.name).join(', ')}`
            } >
              <FileCard 
                file={file}
                bulkMode={bulkMode}
                onClickDelete={onClickDelete}
                onClickBulkSelect={onBulkSelectToggle}
                onClickDownload={onClickDownload}
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