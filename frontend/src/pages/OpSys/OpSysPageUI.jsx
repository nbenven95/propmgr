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
import { DeleteIcon, EditIcon, PlusSquareIcon } from '@chakra-ui/icons'

import ContactInfoCard from '@components/ContactInfoCard'

const OpSysPageUI = ({
  loading,
  fetched,
  bulkMode,
  setBulkMode,
  toggleSelect,
  handleDeleteBulk,
  handleDelete,
  handleClickCreate,
  handleClickEdit,
  drawerContent,
  isOpen,
  onClose
}) => {

  const isResourceLoading = (resourceKey, resourceName) => {
    if (loading[resourceKey]) {
      return (
        <Flex justify='center' align='center' minH='100vh'>
          <Text fontSize='xl'>Loading {resourceName}. . .</Text>
        </Flex>
      )
    }
  };
  isResourceLoading('opSys', 'OpSys');
  isResourceLoading('docs', 'Documents');

  return (
    <Box maxW='100vw' mx='auto' p={4}>
      <Flex mb={4} align='center'>
        <Heading size='lg'>OpSys</Heading>
        <Box px={6} transform={'scale(2)'}>
          <IconButton
            colorScheme='blue'
            aria-label='Create New OpSys Profile'
            size='xs'
            icon={<PlusSquareIcon/>}
            onClick={handleClickCreate}
          />
        </Box>
        <Spacer />
        {bulkMode.enabled ? (
          <>
            <Button size='sm' colorScheme='red' onClick={() => {
              setBulkMode(bulkMode.enabled = false);
              setBulkMode(bulkMode.selected = []);
            }}>
              Cancel Bulk Delete
            </Button>
            <Button size='sm' ml={2} colorScheme='red' onClick={handleDeleteBulk} isDisabled={bulkMode.selected === 0}>
              Delete Selected
            </Button>
          </>
        ) : (
          <Button size='sm' onClick={() => setBulkMode(bulkMode.enabled = true)} colorScheme='blue'>
            Enable Bulk Delete
          </Button>
        )}
      </Flex>
      {fetched.opSys.length === 0 ? (
        <Text>No OpSys Profiles Found</Text>
      ) : (
        <Stack spacing={4}>
          {fetched.opSys.map(os => (
            <Box
              key={os._id}
              position='relative'
              p={4}
              borderWidth='1px'
              borderRadius='8px'
              bg='white'
              shadow='sm'
            >
              {/* If bulk mode enabled, show 'select' checkbox */}
              {bulkMode.enabled && (
                <Checkbox
                  position='absolute'
                  top={2}
                  left={2}
                  isChecked={bulkMode.selected.includes(os._id)}
                  onChange={() => toggleSelect(os._id)}
                />
              )}
              {/* Display OpSys Profile information */}
              {/* Name */}
              {/* Type */}
              {/* Subtype (only if primary type is 'appliance') */}
              {/* Install date */}
              {/* Last service date */}
              {/* Contact information for servicer */}
              {/* Serial number */}
              {/* Associated documents */}
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );

};

export default OpSysPageUI;