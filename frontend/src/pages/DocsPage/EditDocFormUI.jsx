import React from 'react';
import {
  Button,
  Input,
  Select,
  FormControl,
  FormLabel,
  VStack,
  Flex
} from '@chakra-ui/react';

const EditDocFormUI = ({

}) => {
  return (
  <>
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
        type="datetime-local"
        value={formatISO(dateCreate)}
        onChange={(e) => setDateCreate(e.target.value)}
      />
    </FormControl>

    <FormControl>
      <FormLabel>Date Effective</FormLabel>
      <Input
        type="datetime-local"
        value={formatISO(dateEff)}
        onChange={(e) => setDateEff(e.target.value)}
      />
    </FormControl>

    <FormControl>
      <FormLabel>Expiration Date</FormLabel>
      <Input
        type="datetime-local"
        value={formatISO(expiry)}
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
  </>
  );
};

export default EditDocFormUI;