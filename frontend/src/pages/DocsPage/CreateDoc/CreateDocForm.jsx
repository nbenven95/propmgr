import axios from 'axios'
import React, { useEffect, useRef, useState } from 'react'
import {
  Box,
  Button,
  Checkbox,
  Input,
  Select,
  FormControl,
  FormLabel,
  useToast,
  VStack,
  Flex,
  Heading
} from '@chakra-ui/react'

// Define allowed file extensions
// TODO: either read from env or setup endpoint to serve 
const allowedExtensions = [
  '.txt','.pdf','.doc','.docx','.png','.jpg'
];

const baseUrl   = 'http://localhost:5000';
const docsApi   = `${baseUrl}/api/docs`;
const infoApi   = `${baseUrl}/api/info`;

const CreateDocForm = ({
  onUpdate
}) => {
  const toast = useToast();
  const [docTypes, setDocTypes] = useState([]);

  // State variables for form fields
  const [name, setName] = useState('');
  const [docType, setDocType] = useState('');
  const [dateCreate, setDateCreate] = useState('');
  const [dateEff, setDateEff] = useState('');
  const [expiry, setExpiry] = useState('');
  const [file, setFile] = useState(null); // State for when user uploads a new file
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [useDefaultName, setUseDefaultName] = useState(true);

  const fileInputRef = useRef(); // Ref so we can clear file input on form submission

  /* Data to fetch during initial render */
  useEffect(() => {
    setLoading(true);
    axios.get(infoApi + '/document-types').then(res => {
      let docTypes = [];
      Object.entries(res.data).forEach(item => {
        docTypes.push({
          label: String(item[1]).replace(/^./, ch => ch.toUpperCase()),
          value: String(item[1])
        })
      });
      setDocTypes(docTypes);
    }).catch(err => {
      console.error(err);
      toast({
        title: 'Error fetching document types',
        description: err.message,
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }).finally(
      setLoading(false)
    );
  }, []); // Pass empty dependency array to only run during initial render

  /* Event handler to toggle 'use default name' checkbox */
  const toggleUseDefaultName = (e) => {
    const prev = useDefaultName;
    setUseDefaultName(!prev);
    setName(
      !prev && file // If toggling from off to on and there is a staged file
        ? file.name // True: autofill with staged file's name (user can still overwrite this)
        : ''        // False: display form placeholder text
    )
  }

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    if (useDefaultName) setName(e.target.files[0].name);
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
    // TODO: add check to see if user uploaded a new file, or selected an existing FileRef object 
    formData.append('file', file); // Note: this field is expected by multer (backend middleware); multer processes the data and places it in req.file 

    setIsSubmitting(true);
    try {
      const response = await axios.post(docsApi + '/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      onUpdate(); // Refresh Documents list and close drawer
      toast({
        title: 'Document created.',
        description: `Document "${response.data?.data?.name}" has been created.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      // Old form reset logic
      //setName(''); setDocType(''); setDateCreate(''); setDateEff(''); setExpiry(''); setFile(null);
      // Must explicitly clear the file input field
      //fileInputRef.current.value = null;
    } catch (err) {
      console.error(err);
      toast({
        title: 'Error creating document',
        description: err.response?.data?.message || err.message, // TODO: not sure if this is necessary 
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

        <FormControl>
          <Checkbox
            defaultChecked={true}
            onChange={(e) => toggleUseDefaultName(e.target.value)}
          >
            Use file name as document name
          </Checkbox>
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Document Type</FormLabel>
          <Select
            placeholder='Select Document Type'
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
          >
            {loading
              ? <>Loading document types. . .</>
              : docTypes?.map(opt =>
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            )}
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
          <FormLabel>Expiration Date</FormLabel>
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

export default CreateDocForm;
