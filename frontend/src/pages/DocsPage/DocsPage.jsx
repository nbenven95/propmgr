import axios from 'axios'
import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Checkbox,
  Flex,
  Heading,
  IconButton,
  Spacer,
  Stack,
  Text,
  useDisclosure,
  useToast,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody
} from '@chakra-ui/react'
import { DeleteIcon, EditIcon } from '@chakra-ui/icons'

import EditDocForm from './EditDocForm'

const docsApi = 'http://localhost:5000/api/docs';

const DocsPage = () => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState([]);

  // State for the document currently being edited
  const [currentDoc, setCurrentDoc] = useState(null);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await axios.get(docsApi);
      setDocuments(res.data);
    } catch (err) {
      toast({
        title: 'Error fetching documents.',
        description: err.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(docsApi + '/' + id);
      toast({
        title: 'Document deleted.',
        description: `Document successfully deleted.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchDocuments();
    } catch (err) {
      toast({
        title: 'Error deleting document.',
        description: err.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedDocs.length === 0) return;
    try {
      await Promise.all(
        selectedDocs.map((id) => axios.delete(docsApi + '/' + id))
      );
      toast({
        title: 'Documents deleted.',
        description: `${selectedDocs.length} documents deleted.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setSelectedDocs([]);
      fetchDocuments();
    } catch (err) {
      toast({
        title: 'Error deleting documents.',
        description: err.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const toggleSelect = (id) => {
    setSelectedDocs((prev) =>
      prev.includes(id) ? prev.filter((docId) => docId !== id) : [...prev, id]
    );
  };

  const handleEditClick = (doc) => {
    setCurrentDoc(doc); // set the document to edit
    onOpen(); // open the drawer
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="100vh">
        <Text fontSize="xl">Loading documents...</Text>
      </Flex>
    );
  }

  return (
    <Box maxW="1000px" mx="auto" p={4}>
      <Flex mb={4} align="center">
        <Heading size="lg">Documents</Heading>
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
                <Text>Type: {doc.docType}</Text>
                {doc.dateCreate && <Text>Date Created: {new Date(doc.dateCreate).toLocaleDateString()}</Text>}
                {doc.dateEff && <Text>Date Effective: {new Date(doc.dateEff).toLocaleDateString()}</Text>}
                {doc.expiry && <Text>Expiry: {new Date(doc.expiry).toLocaleDateString()}</Text>}
                {doc.fileRef && <Text>Attached file: {doc.fileRef.name}</Text>} {/* TODO: add a download button */}
                {/* Add other fields as needed */}
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

      {/* Drawer for editing */}
      <Drawer isOpen={isOpen} placement="top" onClose={onClose} size="lg">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Edit Document</DrawerHeader>
          <DrawerBody p={4}>
            {currentDoc && (
              <EditDocForm
                document={currentDoc}
                onClose={onClose}
                onUpdate={() => {
                  fetchDocuments();
                  onClose();
                }}
              />
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default DocsPage;
