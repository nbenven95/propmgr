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

const PropertyProfilesPageUI = ({
  isOpen,
  onClose,
  loading,
  bulkMode,
  setBulkMode,
  selectedProperties,
  setSelectedProperties,
  handleDelete,
  handleBulkDelete,
  handleEditClick,
  handleCreateClick
}) => {

  // Display loading text if in loading state
  if (loading) {
    return (
      <Flex justify="center" align="center" minH="100vh">
        <Text fontSize="xl">Loading Properties. . .</Text>
      </Flex>
    );
  }

  return (
    <Box maxW='100vw' mx='auto' p={4}>
      <Flex mb={4} align='center'>
        <Heading size='lg'>Property Profiles</Heading>
        <Box px={6} transform={'scale(2)'}>
          <IconButton
            colorScheme='blue'
            aria-label='Create New Property Profile'
            size='xs'
            icon={<PlusSquareIcon />} 
            onClick={handleCreateClick}
          />
        </Box>
        <Spacer />
      </Flex>
    </Box>
  );

};

export default PropertyProfilesPageUI;