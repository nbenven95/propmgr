import axios from 'axios';
import React, { useRef, useState } from 'react';
import {
  Box,
  Button,
  Input,
  Select,
  FormControl,
  FormLabel,
  useToast,
  VStack,
  Flex,
  Heading,
} from '@chakra-ui/react';

// FIXME: probably not a good way of doing this, but guarantees consistency when we add types on the backend 
import DocTypeEnum from '../../../../backend/util/docType'

// Destructure DocType elements so we can access them directly
const { 
  BLUEPRINT,
  CONTRACT,
  DEED,
  FLOORPLAN,
  LEASE,
  LIEN,
  MANUAL,
  SCHEMATIC,
  WARRANTY,
  WORKORDER
} = DocTypeEnum;

// Define allowed Document types
const DocTypeOptions = [
  { label: 'Blueprint', value: BLUEPRINT },
  { label: 'Contract',  value: CONTRACT },
  { label: 'Deed',      value: DEED },
  { label: 'Floorplan', value: FLOORPLAN },
  { label: 'Lease',     value: LEASE },
  { label: 'Lien',      value: LIEN },
  { label: 'Manual',    value: MANUAL },
  { label: 'Schematic', value: SCHEMATIC },
  { label: 'Warranty',  value: WARRANTY },
  { label: 'Workorder', value: WORKORDER },
];

// Define allowed file extensions
// TODO: read from .env for consistency with FileUploadPage 
const allowedExtensions = [
  '.txt','.pdf','.doc','.docx','.png','.jpg'
];

const docApi = 'http://localhost:5000/api/docs';

const CreateDocPage = () => {
  const toast = useToast();

  // State variables for form fields
  const [name, setName] = useState('');
  const [docType, setDocType] = useState('');
  const [dateCreate, setDateCreate] = useState('');
  const [dateEff, setDateEff] = useState('');
  const [expiry, setExpiry] = useState('');
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef(); // Ref so we can clear file input on form submission

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!name || !docType || !file) {
      toast({
        title: 'Validation Error',
        description: 'Please fill all required fields.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('docType', docType);
    if (dateCreate) formData.append('dateCreate', dateCreate);
    if (dateEff) formData.append('dateEff', dateEff);
    if (expiry) formData.append('expiry', expiry);
    formData.append('file', file);

    setIsSubmitting(true);
    try {
      const response = await axios.post(docApi + '/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast({
        title: 'Document created.',
        description: `Document "${response.data.name}" has been created.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      // Reset form after success
      setName('');
      setDocType('');
      setDateCreate('');
      setDateEff('');
      setExpiry('');
      setFile(null);
      fileInputRef.current.value = null;
    } catch (err) {
      console.error(err);
      toast({
        title: 'Error creating document.',
        description: err.response?.data?.message || err.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box maxW='600px' mx='auto' p={4} borderWidth='1px' borderRadius='8px' boxShadow='xl' bg='white'>
      <Heading mb={4} textAlign='center'>Create New Document</Heading>
      <VStack spacing={4} align='stretch'>
        <FormControl isRequired>
          <FormLabel>Name</FormLabel>
          <Input
            placeholder='Document Name'
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Document Type</FormLabel>
          <Select
            placeholder='Select Document Type'
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
          >
            {DocTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>Date Created</FormLabel>
          <Input
            type='date'
            value={dateCreate}
            onChange={(e) => setDateCreate(e.target.value)}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Date Effective</FormLabel>
          <Input
            type='date'
            value={dateEff}
            onChange={(e) => setDateEff(e.target.value)}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Expiry Date</FormLabel>
          <Input
            type='date'
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Upload File</FormLabel>
          <Input
            ref={fileInputRef}
            type='file'
            accept={allowedExtensions.toString()}
            onChange={handleFileChange}
          />
        </FormControl>

        <Flex justify="center" mt={4}>
          <Button
            colorScheme="teal"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            loadingText="Submitting"
            width="100%"
          >
            Create Document
          </Button>
        </Flex>
      </VStack>
    </Box>
  );
};

export default CreateDocPage;
