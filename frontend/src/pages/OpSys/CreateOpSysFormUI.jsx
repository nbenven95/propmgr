import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Flex,
  Heading,
  VStack,
  useToast,
} from '@chakra-ui/react';

// Sample enums (replace with your actual imports if needed)
const OpSysTypeEnum = ['windows', 'linux', 'macos', 'appliance'];
const ApplianceTypeEnum = ['server', 'desktop', 'tablet'];

// UI Component
function CreateOpSysFormUI({ 
  formData, 
  handleChange, 
  handleSubmit, 
  isSubmitting 
}) {
  return (
    <Box p={6} maxW="600px" mx="auto" borderWidth="1px" borderRadius="8px">
      <Heading mb={4}>Create Operating System</Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Name</FormLabel>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter OS name"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Type</FormLabel>
            <Select
              name="opSysType"
              value={formData.opSysType}
              onChange={handleChange}
            >
              {OpSysTypeEnum.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </Select>
          </FormControl>

          {formData.opSysType.toLowerCase() === 'appliance' && (
            <FormControl isRequired>
              <FormLabel>Subtype</FormLabel>
              <Select
                name="opSysSubType"
                value={formData.opSysSubType}
                onChange={handleChange}
              >
                {ApplianceTypeEnum.map((subtype) => (
                  <option key={subtype} value={subtype}>{subtype}</option>
                ))}
              </Select>
            </FormControl>
          )}

          {/* Additional fields like dateOfInstall, serialNumber, etc., can be added here */}

          <Button
            type="submit"
            colorScheme="teal"
            isLoading={isSubmitting}
            width="full"
          >
            Create
          </Button>
        </VStack>
      </form>
    </Box>
  );
}