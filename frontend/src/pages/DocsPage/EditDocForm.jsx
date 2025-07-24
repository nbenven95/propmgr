import axios from 'axios';
import React, { useState } from 'react';
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

// FIXME: load from env or another common/global file 
const docsApi = 'http://localhost:5000/api/docs';

const EditDocForm = ({ document, onClose, onUpdate }) => {
  const [name, setName] = useState(document.name);
  const [fileRef, setFileRef] = useState(document.fileRef);
  const [docType, setDocType] = useState(document.docType);
  const [dateCreate, setDateCreate] = useState(
    document.dateCreate ? new Date(document.dateCreate).toISOString().substr(0,10) : ''
  );
  const [dateEff, setDateEff] = useState(
    document.dateEff ? new Date(document.dateEff).toISOString().substr(0,10) : ''
  );
  const [expiry, setExpiry] = useState(
    document.expiry ? new Date(document.expiry).toISOString().substr(0,10) : ''
  );
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    console.log(document?._id);
    setLoading(true);
    try {
      await axios.put(docsApi + '/' + document._id, {
        name,
        docType,
        dateCreate,
        dateEff,
        expiry,
      });
      onUpdate(); // refresh list and close drawer
    } catch (err) {
      alert('Error updating document: ' + err.message);
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
          {DocTypeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
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
        <FormLabel>Expiry Date</FormLabel>
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
