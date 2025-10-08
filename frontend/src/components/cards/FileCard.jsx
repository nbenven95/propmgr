import React from 'react'
import { Box, Flex, Checkbox, IconButton, Text } from '@chakra-ui/react'
import { DeleteIcon } from '@chakra-ui/icons'
import { defaultStyles, FileIcon } from 'react-file-icon'

import iconMap from '../../util/iconMap.js'

/**
 * 
 * @param {*} props
 * @returns 
 */
const FileCard = ({
  file,
  onClickRemove,
  onClickDownload, // TODO: add download button
  bulkOpEnabled,
  BulkSelector // TODO: add secondary bulk mode for bulk downloading
}) => {

  // Note: these are for an already uploaded file that has a corresponding FileRef object;
  // A file that is currently staged for upload will not have _id or documents.
  const { _id, name, documents } = file;

  // Get the file extension (or the final extension, in the case of multiple)
  let ext = String(name).split('.').pop();
  // If no extension, replace with ''
  if (ext === name) ext = '';

  // Try to get a style for the extension provided by the library
  const defaultStyle = defaultStyles[ext];
  // Get a backup style from our custom map, in case the library doesn't have one for this extension type
  const backupStyle = iconMap(ext);
  const style = defaultStyle?? backupStyle;

  return (
    <Box
      position='relative'
      borderWidth='1px'
      borderRadius='8px'
      bg='white'
      shadow='sm'
      p={4}
      width='200px'
      height='250px'
      display='flex'
      flexDirection='column'
      alignItems='center'
    >
      {/* Render bulk selector if one was provided and the file is not linked to any docs */}
      {BulkSelector && <BulkSelector id={_id} />}

      {/* Display delete button as long as the file has no attached Documents */}
      <IconButton
        position='absolute'
        top={2}
        left={2}
        size='sm'
        aria-label='Delete File'
        icon={<DeleteIcon />}
        colorScheme='red'
        disabled={bulkOpEnabled || documents?.length > 0}
        onClick={onClickRemove}
      />

      {/* File Icon in center */}
      <Box
        flex='1'
        display='flex'
        alignItems='center'
        justifyContent='center'
        width='40%'
      >
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
    </Box>
  );
};

export default FileCard;