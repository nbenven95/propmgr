import React from 'react';
import { Box, Button, Flex, HStack, IconButton, Text } from '@chakra-ui/react';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';

import FileCard from './FileCard';

const DocCard = ({
  doc,
  onClickEdit,
  onClickDelete,
  onClickDownload,
  bulkOpEnabled,
  BulkSelector
}) => {
  // De-structure Document data
  const { 
    name,
    docType,
    dateCreate,
    dateEff,
    expiry,
    fileRef,
    _id,
    updatedAt
  } = doc;

  return (
    <Box
      position='relative'
      borderWidth='1px'
      borderRadius='8px'
      bg='white'
      shadow='sm'
      p={4}
    >
      {/* Render main content */}
      <Flex direction='column' align='start'>
        
        {/* If defined, render bulk selector */}
        {BulkSelector && <BulkSelector id={_id} />}

        {/* Card header */}
        <HStack width='full' justify='space-between' align='center' mb={2}>
          {/* Document name */}
          <Text fontWeight='bold' fontSize='2xl'>{name?? 'Document Name Not Found'}</Text>
          {/* Date of last update */}
          {updatedAt && 
            <HStack spacing={2}>
              <Text fontWeight='bold'>Last Updated:</Text>
              <Text>{new Date(updatedAt).toDateString()}</Text>
            </HStack>
          }
        </HStack>

        {/* Document type */}
        {docType &&
          <HStack width='full' justify='space-between' align='center' mb={2}>
            <Text fontWeight='bold'>Type:</Text>
            <Text>{docType.replace(/^./, ch => ch.toUpperCase())}</Text>
          </HStack>
        }

        {/* Attached file */}
        <HStack width='full' justify='space-between' align='center' mb={2}>
          <Text fontWeight='bold'>Attached File:</Text>
          {fileRef ? (
            <FileCard file={fileRef} onClickDownload={onClickDownload} />
          ) : (
            <Text>None</Text>
          )}
        </HStack>

        {/* Date of creation (optional) */}
        {dateCreate &&
          <HStack width='full' justify='space-between' align='center' mb={2}>
            <Text fontWeight='bold'>Date Created:</Text>
            <Text>{new Date(dateCreate).toDateString()}</Text>
          </HStack>
        }

        {/* Date effective (optional) */}
        {dateEff && 
          <HStack width='full' justify='space-between' align='center' mb={2}>
            <Text fontWeight='bold'>Date Effective:</Text>
            <Text>{new Date(dateEff).toDateString()}</Text>
          </HStack>
        }

        {/* Date of expiration (optional) */}
        {expiry && 
          <HStack width='full' justify='space-between' align='center' mb={2}>
            <Text fontWeight='bold'>Expiry:</Text>
            <Text>{new Date(expiry).toDateString()}</Text>
          </HStack>
        }

        {/* Edit/delete controls */}
        <HStack width='full' justify='space-between' align='center' mt={2}>
          {onClickEdit && 
            <Button
              size='sm'
              leftIcon={<EditIcon />}
              aria-label='Edit Document'
              colorScheme='teal'
              onClick={onClickEdit}
            >
              Edit Document
            </Button>
          }
          {onClickDelete && 
            <IconButton
              icon={<DeleteIcon />}
              size='sm'
              aria-label='Delete Document'
              colorScheme='red'
              disabled={bulkOpEnabled} // Disable if bulkOp mode is enabled
              onClick={onClickDelete}
            />
          }
        </HStack>

      </Flex>
    </Box>
  );
};

export default DocCard;