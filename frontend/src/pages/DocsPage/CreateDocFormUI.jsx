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
  fetched,
  refs,
  loading,
  submitting,
  useDefaultName,
  handleSubmit,
  handleChange,
  handleToggle,
  handleFocus,
  handleFocusLost
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
            value={name}
            onChange={e => handleChange(e)}
            ref={refs.name}
          />
        </FormControl>

        {/* Toggle use default document name */}
        <FormControl>
          <Checkbox
            name='useDefaultName'
            isChecked={useDefaultName}
            onChange={handleToggle}
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
            value={docType}
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
          <Tooltip label={toolTips['dateCreate']}>
            <FormLabel>Date Created</FormLabel>
          </Tooltip>
          <Input
            name='dateCreate'
            type='datetime-local'
            value={dateCreate}
            onFocus={e => handleFocus(e)}
            onBlur={e => handleFocusLost(e)}
            onChange={e => handleChange(e)}
            ref={refs.dateCreate}
          />
        </FormControl>

        {/* Date effective picker */}
        <FormControl>
          <Tooltip label={toolTips['dateEff']}>
            <FormLabel>Date Effective</FormLabel>
          </Tooltip>
          <Input
            name='dateEff'
            type='datetime-local'
            value={dateEff}
            onFocus={e => handleFocus(e)}
            onBlur={e => handleFocusLost(e)}
            onChange={e => handleChange(e)}
            ref={refs.dateEff}
          />
        </FormControl>

        {/* Expiration date picker */}
        <FormControl>
          <Tooltip label={toolTips['expiry']}>
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

        {/* TODO: file select drop-down menu */}
        {/* TODO: add logic to prevent user from selecting an existing file and uploading a new one */}

        {/* File upload */}
        <FormControl isRequired>
          <FormLabel>Upload File</FormLabel>
          <Input
            name='file'
            type='file'
            accept={allowedFileExt.map(ext => `.${ext}`).join(',')}
            onChange={e => handleChange(e)}
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