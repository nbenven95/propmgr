import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  Button,
  Input,
  Select,
  FormControl,
  FormLabel,
  VStack,
  Flex,
  useToast
} from '@chakra-ui/react';

// TODO: load from env 
const docsApi = 'http://localhost:5000/api/docs';
const infoApi = 'http://localhost:5000/api/info';

const EditDocForm = ({ document, onClose, onUpdate }) => {
  const toast = useToast();
  const [name, setName] = useState(document.name);
  const [docType, setDocType] = useState(document.docType);
  const [docTypes, setDocTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateCreate, setDateCreate] = useState(
    document.dateCreate ? new Date(document.dateCreate).toISOString().substr(0,10) : ''
  );
  const [dateEff, setDateEff] = useState(
    document.dateEff ? new Date(document.dateEff).toISOString().substr(0,10) : ''
  );
  const [expiry, setExpiry] = useState(
    document.expiry ? new Date(document.expiry).toISOString().substr(0,10) : ''
  );

  /* Data to fetch during initial render */
  useEffect(() => {
    setLoading(true);
    axios.get(infoApi + '/document-types').then(res => {
      let docTypes = [];
      Object.entries(res.data).forEach(item => {
        docTypes.push({
          label: String(item[1]).replace(/^./, ch => ch.toUpperCase()),
          value: String(item[1])
        });
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

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await axios.put(docsApi + '/' + document._id, {
        name,
        docType,
        dateCreate,
        dateEff,
        expiry,
      });
      onUpdate();
      toast({
        title: 'Document updated',
        description: `Document "${response.data?.data?.name}" successfully updated.`,
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (err) {
      console.error(err);
      toast({
        title: 'Error updating document',
        description: err.response?.data?.message || err.message,
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      <FormControl isRequired>
        <FormLabel>Name</FormLabel>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </FormControl>

      <FormControl isRequired>
        <FormLabel>Document Type</FormLabel>
        <Select
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
          type="date"
          value={dateCreate}
          onChange={(e) => setDateCreate(e.target.value)}
        />
      </FormControl>

      <FormControl>
        <FormLabel>Date Effective</FormLabel>
        <Input
          type="date"
          value={dateEff}
          onChange={(e) => setDateEff(e.target.value)}
        />
      </FormControl>

      <FormControl>
        <FormLabel>Expiration Date</FormLabel>
        <Input
          type="date"
          value={expiry}
          onChange={(e) => setExpiry(e.target.value)}
        />
      </FormControl>

      <Flex mt={4} justify="space-between">
        <Button colorScheme="teal" onClick={handleSave} isLoading={loading}>
          Save
        </Button>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </Flex>
    </VStack>
  );
};

export default EditDocForm;
