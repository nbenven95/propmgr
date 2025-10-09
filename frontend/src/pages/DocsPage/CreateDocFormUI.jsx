import {
  Box,
  Button,
  Checkbox,
  Input,
  Select,
  FormControl,
  FormLabel,
  VStack,
  Flex,
  Heading,
  Tooltip,
  Text
} from '@chakra-ui/react';

import { formatDisplayDate } from '../../util/util';

const CreateDocFormUI = ({
  refs,
  formState,

  fetched,
  isFetching,
  LoadingIndicator,

  formData,
  required,
  ready,
  submitting,
  
  DrawerMenu,
  onClickUpload,
  onStageFiles,

  onChangeField,
  onChangeDate,
  onClickSubmit,
  onClickToggle
}) => {
  // If defined, display loading indicator if still fetching
  if (LoadingIndicator && isFetching) return <LoadingIndicator />;

  // De-structure fetched data
  const { allowedFileExt, docTypes, files } = fetched;

  // De-structure form data
  const { name, docType, dateCreate, dateEff, expiry } = formData;

  // De-structure form state
  const { useDefaultName } = formState;

  return (
    <Box
      maxW='600px'
      mx='auto'
      p={4}
      borderWidth='1px'
      borderRadius='8px'
      boxShadow='xl'
      bg='white'
    >
      {/* Page header */}
      <Heading mb={4} textAlign='center'>Create New Document</Heading>
      
      {/* Init drawer menu (if defined) */}
      {DrawerMenu && <DrawerMenu />}
      
      {/* Render main content */}
      <VStack spacing={4} align='stretch'>  

        {/* Name input */}
        <FormControl isRequired={required?.name}>
          <FormLabel>Name</FormLabel>
          <Input
            name='name'
            placeholder='Document Name'
            value={name}
            onChange={onChangeField}
            ref={refs.name}
          />
        </FormControl>

        {/* Toggle use default document name */}
        <Checkbox
          name='useDefaultName'
          isChecked={useDefaultName}
          onChange={onClickToggle}
          // TODO: is this ref needed anymore?
          ref={refs.useDefaultName}
        >
          Use file name as document name
        </Checkbox>

        {/* Document type selector (drop-down) */}
        <FormControl isRequired={required?.docType}>
          <FormLabel>Document Type</FormLabel>
          <Select
            name='docType'
            placeholder='Select Document Type'
            value={docType}
            onChange={onChangeField}
          >
            {Object.entries(docTypes).map(([k, v])=> 
              <option key={k} value={v}>
                {String(v).replace(/^./, c => c.toUpperCase())}
              </option>
            )}
          </Select>
        </FormControl>

        {/* Date created picker */}
        <FormControl isRequired={required?.dateCreate}>
          <Tooltip label={'Document date of creation'}>
            <FormLabel>Date Created</FormLabel>
          </Tooltip>
          <Input
            name='dateCreate'
            type='date'
            value={formatDisplayDate(dateCreate)}
            onChange={onChangeDate}
          />
        </FormControl>

        {/* Date effective picker */}
        <FormControl isRequired={required?.dateEff}>
          <Tooltip label={'Date the document comes into effect'}>
            <FormLabel>Date Effective</FormLabel>
          </Tooltip>
          <Input
            name='dateEff'
            type='date'
            value={formatDisplayDate(dateEff)}
            onChange={onChangeDate}
          />
        </FormControl>

        {/* Expiration date picker */}
        <FormControl isRequired={required?.expiry}>
          <Tooltip label={'Document expiration date'}>
            <FormLabel>Expiration Date</FormLabel>
          </Tooltip>
          <Input
            name='expiry'
            type='date'
            value={formatDisplayDate(expiry)}
            onChange={onChangeDate}
          />
        </FormControl>

        {
          // TODO: Add two buttons: select existing file, select new file
          // - Intially, both should be enabled
          // - Upload button should be linked via reference to an input component
          // - Corresponding input component should be set to single file mode
          // TODO: On clicking 'select new file', drawer opens with the UploadForm component
          // TODO: On staging a file, both buttons should be hidden
          // - Replaced with a 'file staged for upload' field
          // TODO: Render a FileCard component next to the 'staged for upload' field
          // - Should have the necessary controller logic to handle removing the file from staging
          // - If the file is removed from staging, both buttons are displayed again
          // - Make sure to re-fetch files if a new one is uploaded during document creation
          // - 
          // TODO: On clicking 'select existing file', drawer opens with the FilesPage rendered
          // - Make sure files are being pre-fetched in useEffect for initial render
          // - Pass pre-fetched files to FilesPageUI component
          // TODO: On selecting a file, both buttons should be hidden
          // - Replaced with a 'file' field
          // TODO: Render a FileCard component next to the 'file' field
          // - Should have necessary controller logic to handle clearing the file like any other form
          // - Should be displayed the same as the FileCard for the file to be uploaded
          // - 
          // TODO: Add onClick handler for FileCards to handle clicking/selecting them
        }
        {/* File input field (old) */}
        <FormControl isRequired={true}>
          <FormLabel>Upload File</FormLabel>
          <Input
            name='stagedFiles'
            type='file'
            accept={allowedFileExt.map(ext => `.${ext}`).join(',')}
            onChange={e => {
              onStageFiles(e.target.files);
            }}
          />
        </FormControl>

        {/* New file upload controls (opens drawer with dropzone)
        <FormControl>
          <FormLabel>Attach File</FormLabel>
          <HStack justifyContent='space-between' width='100%' >
            <Button variant='outline' onClick={() => alert('select clicked!')} >
              Select From Existing Files
            </Button>
            <Button colorScheme='blue' onClick={onClickUpload} >
              Upload New File
            </Button>
          </HStack>
        </FormControl>
        */}

        {/* Submit button */}
        <Flex justify='center' mt={4}>
          <Button
            colorScheme='teal'
            onClick={onClickSubmit}
            isLoading={submitting}
            disabled={!ready}
            loadingText='Submitting. . .'
            width='100%'
          >
            Create Document
          </Button>
        </Flex>

      </VStack>

      {/* Drawer menu 
      <Drawer isOpen={isOpen} placement='top' onClose={() => handleClose()} size='lg'>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth='1px'>{drawerContent.header}</DrawerHeader>
          <DrawerBody p={4}>
            {drawerContent.body}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
      */}

    </Box>
  );
}

export default CreateDocFormUI;