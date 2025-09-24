import '../../styles/doccard.css'

import {
  Box,
  Button,
  Checkbox,
  Flex,
  IconButton,
  Text
} from '@chakra-ui/react'

import {
  DeleteIcon,
  DownloadIcon,
  EditIcon
} from '@chakra-ui/icons'

const DocCard = ({
  doc,
  bulkMode,
  onClickEdit: handleEdit,
  onClickDelete: handleDelete,
  onClickDownload: handleDownload,
  onClickBulkSelect: handleBulkSelect
}) => {

  return (
    // TODO: display appropriate icon type for the attached file
    <Box
      position='relative'
      borderWidth='1px'
      borderRadius='8px'
      bg='white'
      shadow='sm'
      p={4}
    >
      
      {/* Display bulk mode selection checkbox if bulk mode is enabled */}
      {bulkMode.enabled && (
        <Checkbox
          position='absolute'
          top={2}
          left={2}
          isChecked={bulkMode.selected.includes(doc._id)}
          onChange={() => handleBulkSelect(doc._id)}
        />
      )}

      {/* Display Document data */}
      <Flex
        direction='column'
        align='start'
        pl={bulkMode.enabled ? 6 : 0}
      >

        {/* Display mandatory fields */}
        <Text fontWeight='bold'>Name: {doc.name}</Text>
        <Text>Type: { String(doc.docType).replace(/^./, c => c.toUpperCase()) }</Text>
        
        {/* Display optional fields only if they have data */}
        {doc.dateCreate && <Text>Date Created: {new Date(doc.dateCreate).toDateString()}</Text>}
        {doc.dateEff && <Text>Date Effective: {new Date(doc.dateEff).toDateString()}</Text>}
        {doc.expiry && <Text>Expires: {new Date(doc.expiry).toDateString()}</Text>}
        
        {/* Display attached file + download controls */}
        <Flex
          width='full'
          justify='space-between'
          align='center'
          mt={2}
        >
          <Text>Attached file: {doc.fileRef ? doc.fileRef.name : 'NONE'}</Text>
          <IconButton
            icon={<DownloadIcon />}
            size='sm'
            aria-label='Download'
            colorScheme='purple'
            onClick={() => handleDownload(doc.fileRef?._id, doc.fileRef?.name)}
          />
        </Flex>

        {/* Edit/Delete controls */}
        <Flex
          width='full'
          justify='space-between'
          align='center'
          mt={2}
        >
          {/* Edit Document button */}
          <Button
            size='sm'
            leftIcon={<EditIcon />}
            aria-label='Edit Document'
            colorScheme='teal'
            onClick={() => handleEdit(doc)}
          >
            Edit
          </Button>
          {/* Delete Document button */}
          <IconButton
            icon={<DeleteIcon />}
            size='sm'
            aria-label='Delete Document'
            colorScheme='red'
            onClick={() => handleDelete(doc)}
          />          
        </Flex>

        {/* Display time of last update */}
        {doc.updatedAt && <Text>Last Updated: {new Date(doc.updatedAt).toDateString()}</Text>}
      
      </Flex>
    </Box>
  );
};

export default DocCard;