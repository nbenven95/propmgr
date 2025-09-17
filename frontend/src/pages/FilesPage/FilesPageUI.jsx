import React from 'react';
import {
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Text,
  Tooltip
} from '@chakra-ui/react';

import UIHeader from '../../components/UIHeader';
import FileCard from '../../components/cards/FileCard';

/**
 * 
 * @param {*} param0 
 * @returns 
 */
const FilesPageUI = ({
  isOpen,
  loading,

  fetched,
  drawerContent,
  
  onCloseForm: handleCloseDrawer,

  onClickUpload: handleClickUpload,
  onClickDelete: handleClickDelete,
  onClickDownload: handleClickDownload,

  bulkMode,
  onBulkDelete: handleBulkDelete,
  onBulkModeToggle: handleToggleBulkMode,
  onBulkSelectToggle: handleToggleBulkSelect
}) => {
  
  const { files } = fetched;

  {/* Display loading indicator while fetching */}
  if (loading.files) {
    return (
      <Flex justify='center' align='center' minH='100vh'>
        <Text fontSize='xl'>Loading Files. . .</Text>
      </Flex>
    );
  }

  return (
    <Box maxW='100vw' mx='auto' p={4} >

      {/* Bulk delete controls, button link to upload menu */}
      <UIHeader 
        title='Files'
        bulkMode={bulkMode}
        onClickCreate={handleClickUpload}
        onClickDelete={handleBulkDelete}
        onClickBulkModeToggle={handleToggleBulkMode}
      />

      {/* Main FileCard display */}
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
                onClickDelete={handleClickDelete}
                onClickBulkSelect={handleToggleBulkSelect}
                onClickDownload={handleClickDownload}
                key={file._id}
              />
            </Tooltip>
          ))}
        </div>
      )}

      {/* Drawer menu */}
      <Drawer isOpen={isOpen} placement='top' onClose={handleCloseDrawer} size='lg'>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth='1px'>{drawerContent.header}</DrawerHeader>
          <DrawerBody p={4}>
            {drawerContent.body}
          </DrawerBody>
        </DrawerContent>
      </Drawer>

    </Box>
  );
};

export default FilesPageUI;