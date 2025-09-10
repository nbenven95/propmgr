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
  toggleBulkSelect,
  handleClickEditDoc,
  handleDeleteDoc,
  handleDownloadFile
}) => {

  return (
    // TODO: display appropriate icon type for the attached file
    // TODO: refactor so we can somehow pre-generate date strings so we don't have to redundantly call `new Date(...).toDateString()` over and over
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
          onChange={() => toggleBulkSelect(doc._id)}
        />
      )}

      {/* Display Document data fields */}
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
            onClick={() => handleDownloadFile(doc.fileRef?._id, doc.fileRef?.name)}
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
            onClick={() => handleClickEditDoc(doc)}
          >
            Edit
          </Button>
          {/* Delete Document button */}
          <IconButton
            icon={<DeleteIcon />}
            size='sm'
            aria-label='Delete Document'
            colorScheme='red'
            onClick={() => handleDeleteDoc(doc._id)}
          />          
        </Flex>

        {/* Display time of last update */}
        {doc.updatedAt && <Text>Last Updated: {new Date(doc.updatedAt).toDateString()}</Text>}
      
      </Flex>
    </Box>
  );
};

export default DocCard;