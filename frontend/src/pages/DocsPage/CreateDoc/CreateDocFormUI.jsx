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
  name,
  nameRef,
  setName,
  toggleUseDefaultName,
  docType,
  setDocType,
  isLoading,
  docTypes,
  handleDTPickerFocus,
  handleDTPickerFocusLost,
  dateCreate,
  dateCreateRef,
  setDateCreate,
  dateEff,
  dateEffRef,
  setDateEff,
  expiry,
  expiryRef,
  setExpiry,
  allowedFileExt,
  handleFileChange,
  isSubmitting,
  handleSubmit,
  toolTips
}) => {
  return (
    <Box maxW='600px' mx='auto' p={4} borderWidth='1px' borderRadius='8px' boxShadow='xl' bg='white'>
      <Heading mb={4} textAlign='center'>Create New Document</Heading>
      <VStack spacing={4} align='stretch'>
        <FormControl isRequired>
          <FormLabel>Name</FormLabel>
          <Input
            placeholder='Document Name'
            value={name}
            onChange={(e) => setName(e.target.value)}
            ref={nameRef}
          />
        </FormControl>

        <FormControl>
          <Checkbox
            defaultChecked={true}
            onChange={(e) => toggleUseDefaultName(e.target.value)}
          >
            Use file name as document name
          </Checkbox>
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Document Type</FormLabel>
          <Select
            placeholder='Select Document Type'
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
          >
            {isLoading['docTypes']
              ? <>Loading document types. . .</>
              : docTypes?.map(opt =>
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            )}
          </Select>
        </FormControl>

        <FormControl>
          <Tooltip label={toolTips['dateCreate']}>
            <FormLabel>Date Created</FormLabel>
          </Tooltip>
          <Input
            type='datetime-local'
            value={dateCreate}
            onFocus={(e) => handleDTPickerFocus(e)}
            onBlur={(e) => handleDTPickerFocusLost(e)}
            onChange={(e) => setDateCreate(e.target.value)}
            ref={dateCreateRef}
          />
        </FormControl>

        <FormControl>
          <Tooltip label={toolTips['dateEff']}>
            <FormLabel>Date Effective</FormLabel>
          </Tooltip>
          <Input
            type='datetime-local'
            value={dateEff}
            onFocus={(e) => handleDTPickerFocus(e)}
            onBlur={(e) => handleDTPickerFocusLost(e)}
            onChange={(e) => setDateEff(e.target.value)}
            ref={dateEffRef}
          />
        </FormControl>

        <FormControl>
          <Tooltip label={toolTips['expiry']}>
            <FormLabel>Expiration Date1</FormLabel>
          </Tooltip>
          <Input
            type='datetime-local'
            value={expiry}
            onFocus={(e) => handleDTPickerFocus(e)}
            onBlur={(e) => handleDTPickerFocusLost(e)}
            onChange={(e) => setExpiry(e.target.value)}
            ref={expiryRef}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Upload File</FormLabel>
          <Input
            type='file'
            accept={allowedFileExt.map(ext => '.' + ext).join(',')}
            onChange={(e) => handleFileChange(e)}
          />
        </FormControl>

        <Flex justify="center" mt={4}>
          <Button
            colorScheme="teal"
            onClick={(e) => handleSubmit(e)}
            isLoading={isSubmitting}
            loadingText="Submitting"
            width="100%"
          >
            Create Document
          </Button>
        </Flex>
      </VStack>
    </Box>
  );
}

export default CreateDocFormUI;