import React from 'react'
import { Box, IconButton, Text } from '@chakra-ui/react'
import { DeleteIcon, DownloadIcon } from '@chakra-ui/icons'
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
  onClickDownload,
  bulkOpEnabled,
  BulkSelector,
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
      {/* If defined, render bulk selector */}
      {/* TODO: disable if attached to any docs */}
      {BulkSelector && <BulkSelector id={_id} />}

      {/* Render delete button */}
      {onClickRemove && 
        <IconButton
          position='absolute'
          top={2}
          left={2}
          size='sm'
          aria-label='Delete File'
          icon={<DeleteIcon />}
          colorScheme='red'
          disabled={bulkOpEnabled || documents?.length > 0} // Disable 
          onClick={onClickRemove}
        />
      }

      {/* Render download button */}
      {onClickDownload &&
        <IconButton
          position='absolute'
          top={2}
          right={2}
          size='sm'
          aria-label={'Download File'}
          icon={<DownloadIcon />}
          colorScheme='purple'
          onClick={onClickDownload}
        />
      }

      {/* Render file icon in center of card */}
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
      {/* TODO: fix positioning */}
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