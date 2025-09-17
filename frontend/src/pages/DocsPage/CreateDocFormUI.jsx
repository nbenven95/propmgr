import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Checkbox,
  Input,
  Select,
  FormControl,
  FormLabel,
  VStack,
  Flex,
  Heading,
  Tooltip,
  HStack,
  Text
} from '@chakra-ui/react';

const CreateDocFormUI = ({
  isOpen,
  loading,
  submitting,
  useDefaultName,

  refs,
  fetched,
  formData,
  drawerContent,
  
  onCloseForm: handleClose,
  onChangeForm: handleChange,
  onStageFiles: handleStageFiles,
  onDatePickerFocus: handleFocus,
  onDatePickerFocusLost: handleFocusLost,

  onClickUpload: handleClickUpload,
  onClickSubmit: handleClickSubmit,
  onClickToggle: handleClickToggle
}) => {

  // De-structure fetched data
  const { files, docTypes, toolTips, allowedFileExt } = fetched;

  // De-structure form data
  const { name, docType, dateCreate, dateEff, expiry } = formData;

  return (
    <Box maxW='600px' mx='auto' p={4} borderWidth='1px' borderRadius='8px' boxShadow='xl' bg='white'>
      <Heading mb={4} textAlign='center'>Create New Document</Heading>
      <VStack spacing={4} align='stretch'>
        
        {/* Name input */}
        <FormControl isRequired>
          <FormLabel>Name</FormLabel>
          <Input
            name='name'
            placeholder='Document Name'
            value={name?? ''}
            onChange={e => handleChange(e)}
            ref={refs.name}
          />
        </FormControl>

        {/* Toggle use default document name */}
        <FormControl>
          <Checkbox
            name='useDefaultName'
            isChecked={useDefaultName}
            onChange={() => handleClickToggle()}
          >
            Use file name as document name
          </Checkbox>
        </FormControl>

        {/* Document type selector (drop-down) */}
        <FormControl isRequired>
          <FormLabel>Document Type</FormLabel>
          <Select
            name='docType'
            placeholder='Select Document Type'
            value={docType?? ''}
            onChange={e => handleChange(e)}
          >
            {loading.docTypes
              ? <>Loading docTypes. . .</>
              : Object.entries(docTypes).map(([k, v])=> 
                <option key={k} value={v}>
                  {String(v).replace(/^./, c => c.toUpperCase())}
                </option>
              )
            }
          </Select>
        </FormControl>

        {/* Date created picker */}
        <FormControl>
          <Tooltip label={toolTips.dateCreate?? 'Date created'}>
            <FormLabel>Date Created</FormLabel>
          </Tooltip>
          <Input
            name='dateCreate'
            type='datetime-local'
            value={dateCreate?? ''}
            onFocus={e => handleFocus(e)}
            onBlur={e => handleFocusLost(e)}
            onChange={e => handleChange(e)}
            ref={refs.dateCreate}
          />
        </FormControl>

        {/* Date effective picker */}
        <FormControl>
          <Tooltip label={toolTips.dateEff?? 'Date effective'}>
            <FormLabel>Date Effective</FormLabel>
          </Tooltip>
          <Input
            name='dateEff'
            type='datetime-local'
            value={dateEff?? ''}
            onFocus={e => handleFocus(e)}
            onBlur={e => handleFocusLost(e)}
            onChange={e => handleChange(e)}
            ref={refs.dateEff}
          />
        </FormControl>

        {/* Expiration date picker */}
        <FormControl>
          <Tooltip label={toolTips.expiry?? 'Expiration date'}>
            <FormLabel>Expiration Date</FormLabel>
          </Tooltip>
          <Input
            name='expiry'
            type='datetime-local'
            value={expiry}
            onFocus={e => handleFocus(e)}
            onBlur={e => handleFocusLost(e)}
            onChange={e => handleChange(e)}
            ref={refs.expiry}
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
        {/* File upload 
        <FormControl isRequired>
          <FormLabel>Upload File</FormLabel>
          <Input
            name='stagedFile'
            type='file'
            accept={allowedFileExt.map(ext => `.${ext}`).join(',')}
            onChange={e => {
              handleStageFiles(e.target.files);
            }}
          />
        </FormControl>
        */}
        <FormControl>
          <FormLabel>Attach File</FormLabel>
          <HStack justifyContent='space-between' width='100%' >
            <Button variant='outline' onClick={() => alert('select clicked!')} >
              Select From Existing Files
            </Button>
            <Button colorScheme='blue' onClick={() => handleClickUpload()} >
              Upload New File
            </Button>
          </HStack>
        </FormControl>

        {/* Submit button */}
        <Flex justify='center' mt={4}>
          <Button
            colorScheme='teal'
            onClick={() => handleClickSubmit()}
            isLoading={submitting}
            loadingText='Submitting. . .'
            width='100%'
          >
            Create Document
          </Button>
        </Flex>

        {/* TODO: add 'clear form' button */}

      </VStack>

      {/* Drawer menu */}
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

    </Box>
  );
}

export default CreateDocFormUI;