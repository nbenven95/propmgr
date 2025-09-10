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
  Stack,
  Text
} from '@chakra-ui/react';

import UIHeader from '../../components/UIHeader';
import DocCard from '../../components/cards/DocCard';

const DocsPageUI = ({
  isOpen,
  handleClose,
  drawerContent,
  fetched,
  loading,
  bulkMode,
  enableBulkMode,
  disableBulkMode,
  toggleBulkSelect,
  handleBulkDeleteDocs,
  handleDeleteDoc,
  handleClickEditDoc,
  handleClickCreateDoc,
  handleDownloadFile
}) => {

  const { docs } = fetched;
  
  {/* Display loading indicator while fetching */}
  if (loading.docs) {
    // TODO: replace text with an animated loading icon
    return (
      <Flex justify="center" align="center" minH="100vh">
        <Text fontSize="xl">Loading Documents. . .</Text>
      </Flex>
    );
  }

  {/* Display fetched Documents */}
  return (
    <Box maxW='100vw' mx='auto' p={4}>
      
      {/* Display UI header text and bulk operation controls */}
      {/* TODO: refactor this to separate the title and + button from the bulk delete controls */}
      <UIHeader
        title='Documents'
        bulkMode={bulkMode}
        enableBulkMode={enableBulkMode}
        disableBulkMode={disableBulkMode}
        handleBulkDelete={handleBulkDeleteDocs}
        handleClickCreate={handleClickCreateDoc}
      />
      
      {/* Main Documents view */}
      {docs.length === 0 ? (
        <Text>No Documents Found</Text>
      ) : (
        <Stack spacing={4}>
          {docs.map((doc) => (
            <DocCard
              doc={doc}
              bulkMode={bulkMode}
              toggleBulkSelect={toggleBulkSelect}
              handleClickEditDoc={handleClickEditDoc}
              handleDeleteDoc={handleDeleteDoc}
              handleDownloadFile={handleDownloadFile}
              key={doc._id}
            />
          ))}
        </Stack>
      )}

      {/* Drawer menu */}
      <Drawer isOpen={isOpen} placement='top' onClose={handleClose} size='lg'>
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
}

export default DocsPageUI;