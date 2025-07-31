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



const DocsPageUI = ({
  isOpen,
  onClose,
  drawerHeader,
  drawerBody,
  documents,
  loading,
  bulkMode,
  setBulkMode,
  selectedDocs,
  setSelectedDocs,
  handleDelete,
  handleBulkDelete,
  handleDownloadFile,
  toggleSelect,
  handleEditClick,
  handleCreateClick
}) => {

// TODO: replace with a chakra UI animated loading icon 
if (loading) {
    return (
      <Flex justify="center" align="center" minH="100vh">
        <Text fontSize="xl">Loading documents. . .</Text>
      </Flex>
    );
  }

  return (
    <Box maxW='100vw' mx='auto' p={4}>
      <Flex mb={4} align='center'>
        <Heading size='lg'>Documents</Heading>
        <Box px={6} transform={'scale(2)'}>
          <IconButton
            colorScheme='blue'
            aria-label='Create New Document'
            size='xs'
            icon={<PlusSquareIcon />} 
            onClick={handleCreateClick}
          />
        </Box>
        <Spacer />
        {bulkMode ? (
          <>
            <Button size="sm" colorScheme="red" onClick={() => { setBulkMode(false); setSelectedDocs([]); }}>
              Cancel Bulk Delete
            </Button>
            <Button size="sm" ml={2} colorScheme="red" onClick={handleBulkDelete} isDisabled={selectedDocs.length === 0}>
              Delete Selected
            </Button>
          </>
        ) : (
          <Button size="sm" onClick={() => setBulkMode(true)} colorScheme="blue">
            Enable Bulk Delete
          </Button>
        )}
      </Flex>

      {documents.length === 0 ? (
        <Text>No documents found.</Text>
      ) : (
        <Stack spacing={4}>
          {documents.map((doc) => (
            <Box key={doc._id} position="relative" p={4} borderWidth="1px" borderRadius="8px" bg="white" shadow="sm">
              {bulkMode && (
                <Checkbox
                  position="absolute"
                  top={2}
                  left={2}
                  isChecked={selectedDocs.includes(doc._id)}
                  onChange={() => toggleSelect(doc._id)}
                />
              )}
              <Flex direction="column" align="start" pl={bulkMode ? 6 : 0}>
                <Text fontWeight="bold">Name: {doc.name}</Text>
                <Text>Type: { String(doc.docType).replace(/^./, ch => ch.toUpperCase()) }</Text>
                {doc.dateCreate && <Text>Date Created: {new Date(doc.dateCreate).toLocaleDateString()}</Text>}
                {doc.dateEff && <Text>Date Effective: {new Date(doc.dateEff).toLocaleDateString()}</Text>}
                {doc.expiry && <Text>Expires: {new Date(doc.expiry).toLocaleDateString()}</Text>}
                <Flex mt={2} width='full' justify='space-between' aligh='center'>
                  <Text>Attached file: {doc.fileRef ? doc.fileRef.name : 'NONE'}</Text>
                  <IconButton
                    icon={<DownloadIcon />}
                    size='sm'
                    aria-label='Download'
                    colorScheme='purple'
                    onClick={() => handleDownloadFile(doc.fileRef?._id, doc.fileRef?.name)}
                  />
                </Flex>
                <Flex mt={2} width="full" justify="space-between" align="center">
                  <Button
                    size="sm"
                    leftIcon={<EditIcon />}
                    colorScheme="teal"
                    onClick={() => handleEditClick(doc)}
                  >
                    Edit
                  </Button>
                  <IconButton
                    icon={<DeleteIcon />}
                    size="sm"
                    aria-label="Delete"
                    colorScheme="red"
                    onClick={() => handleDelete(doc._id)}
                  />
                </Flex>
              </Flex>
            </Box>
          ))}
        </Stack>
      )}

      {/* Menu drawer */}
      <Drawer isOpen={isOpen} placement="top" onClose={onClose} size="lg">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton/>
          <DrawerHeader borderBottomWidth="1px">{drawerHeader}</DrawerHeader>
          <DrawerBody p={4}>
            {drawerBody}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}

export default DocsPageUI;