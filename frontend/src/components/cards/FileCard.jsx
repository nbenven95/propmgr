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
  toggleBulkSelect,
  handleDeleteFile
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
      {/* If bulkMode prop was passed, render the bulk select checkbox (if bulkMode is enabled) */}
      {bulkMode && bulkMode.enabled && (
        <Checkbox
          position='absolute'
          top={2}
          left={2}
          size='sm'
          isChecked={bulkMode.selected.includes(file._id)}
          onChange={() => toggleBulkSelect(file._id)}
        />
      )}

      {/* Delete/remove from staging button in upper right */}
      <IconButton
        position='absolute'
        top={2}
        right={2}
        size='sm'
        aria-label='Delete File'
        icon={<DeleteIcon />}
        colorScheme='red'
        onClick={() => handleDeleteFile(file)}
      />

      {/* File Icon in center */}
      <Box flex='1' display='flex' alignItems='center' justifyContent='center' my={4} width='100%'>
        <FileIcon extension={ext} size={64} {...style} />
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
    </Box>
  )

  /*
  return (
      <div className='file-card'>
      <div className='file-icon-container'>
        <div className='file-icon'>
          {defaultStyle === undefined ? (
            <FileIcon extension={ext} {...backupStyle} />
          ) : (
            <FileIcon extension={ext} {...defaultStyle} />
          )}
        </div>
      </div>
      <div className='file-name'>{file.name}</div>
      {handleDelete && <button 
        className='delete-button'
        title='Delete' 
        onClick={() => handleDelete(file)}
      >
        <CloseIcon/>
      </button>}
    </div>
  )
  */
};

export default FileCard;