import React from 'react'
import { Box, Flex, Checkbox, IconButton, Text } from '@chakra-ui/react'
import { DeleteIcon } from '@chakra-ui/icons'
import { defaultStyles, FileIcon } from 'react-file-icon'

import iconMap from '../../util/iconMap.js'

/**
 * 
 * @param {*} param0 
 * @returns 
 */
const FileCard = ({
  file,
  bulkMode,
  onClickDelete: handleDelete,
  onClickBulkSelect: handleBulkSelect,
  onClickDownload: handleDownload // TODO: add download button
}) => {

  // Get the file extension (or the final extension, in the case of multiple)
  let ext = String(file?.name).split('.').pop();
  // If no extension, replace with ''
  if (ext === file.name) ext = '';

  // Try to get a style for the extension provided by the library
  const defaultStyle  = defaultStyles[ext];
  // Get a backup style from our custom map, in case the library doesn't have one for this extension type
  const backupStyle   = iconMap(ext);
  const style         = defaultStyle?? backupStyle;

  return (
    <Box
      position='relative'
      borderWidth='1px'
      borderRadius='8px'
      bg='white'
      shadow='sm'
      p={4}
      width='200px' // fixed width for consistency, adjust as needed
      height='250px' // fixed height, adjust as needed
      display='flex'
      flexDirection='column'
      alignItems='center'
    >
      {/* Render bulkMode select checkbox if enabled and file has no attached documents */}
      {bulkMode?.enabled && file.documents?.length === 0 && (
        <Checkbox
          position='absolute'
          top={2}
          left={2}
          size='md'
          isChecked={bulkMode?.selected.includes(file._id)}
          onChange={() => handleBulkSelect(file._id)}
        />
      )}

      {/* Display delete/remove from staging button as long as the file has no attached Documents */}
      <IconButton
        position='absolute'
        top={2}
        right={2}
        size='sm'
        aria-label='Delete File'
        icon={<DeleteIcon />}
        colorScheme='red'
        disabled={bulkMode?.enabled || file?.documents?.length > 0}
        onClick={() => handleDelete(file)}
      />

      {/* File Icon in center */}
      <Box flex='1' display='flex' alignItems='center' justifyContent='center' my={4} width='40%'>
        <FileIcon extension={ext} {...style} />
      </Box>

      {/* Filename, truncated */}
      <Text
        fontSize='sm'
        fontWeight='medium'
        isTruncated
        maxWidth='100%'
        textAlign='center'
        mb={2}
      >
        {file.name}
      </Text>
      <Text>{file._id}</Text>
    </Box>
  );
};

export default FileCard;