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
  Tooltip
} from '@chakra-ui/react'

const CreateDocFormUI = ({
  formData,
  setFormData,
  fetched,
  refs,
  loading,
  submitting,
  handleSubmit,
  handleFocus,
  handleFocusLost,
  handleFileChange,
  toggleUseDefaultName,
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
            placeholder='Document Name'
            value={name}
            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            ref={refs.name}
          />
        </FormControl>

        {/* Toggle use default document name */}
        <FormControl>
          <Checkbox
            defaultChecked={true}
            onChange={() => toggleUseDefaultName()}
          >
            Use file name as document name
          </Checkbox>
        </FormControl>

        {/* Document type selector (drop-down) */}
        <FormControl isRequired>
          <FormLabel>Document Type</FormLabel>
          <Select
            placeholder='Select Document Type'
            value={docType}
            onChange={e => setFormData(prev => ({ ...prev, docType: e.target.value }))}
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
          <Tooltip label={toolTips['dateCreate']}>
            <FormLabel>Date Created</FormLabel>
          </Tooltip>
          <Input
            type='datetime-local'
            value={dateCreate}
            onFocus={e => handleFocus(e)}
            onBlur={e => handleFocusLost(e)}
            onChange={e => setFormData(prev => ({ ...prev, dateCreate: e.target.value }))}
            ref={refs.dateCreate}
          />
        </FormControl>

        {/* Date effective picker */}
        <FormControl>
          <Tooltip label={toolTips['dateEff']}>
            <FormLabel>Date Effective</FormLabel>
          </Tooltip>
          <Input
            type='datetime-local'
            value={dateEff}
            onFocus={e => handleFocus(e)}
            onBlur={e => handleFocusLost(e)}
            onChange={e => setFormData(prev => ({ ...prev, dateEff: e.target.value }))}
            ref={refs.dateEff}
          />
        </FormControl>

        {/* Expiration date picker */}
        <FormControl>
          <Tooltip label={toolTips['expiry']}>
            <FormLabel>Expiration Date</FormLabel>
          </Tooltip>
          <Input
            type='datetime-local'
            value={expiry}
            onFocus={e => handleFocus(e)}
            onBlur={e => handleFocusLost(e)}
            onChange={e => setFormData(prev => ({ ...prev, expiry: e.target.value }))}
            ref={refs.expiry}
          />
        </FormControl>

        {/* TODO: file select drop-down menu */}
        {/* TODO: add logic to prevent user from selecting an existing file and uploading a new one */}

        {/* File upload */}
        <FormControl isRequired>
          <FormLabel>Upload File</FormLabel>
          <Input
            type='file'
            accept={allowedFileExt.map(ext => `.${ext}`).join(',')}
            onChange={() => handleFileChange()}
          />
        </FormControl>

        {/* Submit button */}
        <Flex justify='center' mt={4}>
          <Button
            colorScheme='teal'
            onClick={() => handleSubmit()}
            isLoading={submitting}
            loadingText='Submitting. . .'
            width='100%'
          >
            Create Document
          </Button>
        </Flex>

        {/* TODO: add 'clear form' button */}

      </VStack>
    </Box>
  );
}

export default CreateDocFormUI;