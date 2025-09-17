import React from 'react';
import {
  Box,
  Button,
  Flex,
  VStack,
  Text,
  SimpleGrid,
  useColorModeValue
} from '@chakra-ui/react';
import { WiCloudUp } from 'react-icons/wi';

import FileCard from '../../components/cards/FileCard';

const UploadFormUI = ({
  loading,
  dragging,
  submitting,
  
  refs,
  fetched,
  formData,
  //fileInputRef,

  onStageFiles: handleStageFiles,
  onClickRemove: handleClickRemove,
  onClickBrowse: handleClickBrowse,
  onClickSubmit: handleClickSubmit,

  dropzoneRootProps,
  dropzoneInputProps
}) => {

  const { stagedFiles } = formData;
  const { allowedFileExt, toolTips } = fetched;

  const borderColor = useColorModeValue('gray.300', 'gray.600');
  const draggingBorderColor = '#1e40af';

  // Get an array of resource names that are still loading
  const resources = Object.keys(loading).filter(key => loading[key])

  if (resources.length > 0) {
    return (
      <Flex justify="center" align="center" minH="100vh">
        <Text fontSize="xl">Loading {resources.join(', ')}. . .</Text>
      </Flex>
    );
  }

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      minH="100vh"
      px={4}
    >
      {/* Dropzone Area */}
      <Box
        {...dropzoneRootProps}
        borderWidth={2}
        borderStyle='dashed'
        borderColor={dragging ? draggingBorderColor : borderColor}
        borderRadius='8px'
        bg='white'
        w='95vw'
        minH='35vh'
        display='flex'
        alignItems='center'
        justifyContent='center'
        cursor='pointer'
        transition='border-color 0.3s, box-shadow 0.3s'
        boxShadow={dragging ? '0 0 10px rgba(30, 64, 175, 0.2)' : 'none'}
        _hover={{
          borderColor: '#1e40af',
          boxShadow: '0 0 10px rgba(30, 64, 175, 0.2)',
        }}
        mb={4}
        onClick={handleClickBrowse}
      >
        <VStack spacing={4} textAlign='center' {...dropzoneRootProps} >
          <WiCloudUp size={40} />
          <Text>Drop files here or</Text>
          <Button
            variant='outline'
            onClick={handleClickBrowse}
            _hover={{
              transform: 'scale(1.025)',
            }}
            transition='transform 0.2s'
            onFocus={e => e.stopPropagation()}
          >
            Select Files
          </Button>
          {/* Hidden input for file dialog */}
          <input
            name='stagedFiles'
            type='file'
            multiple
            style={{ display: 'none' }}
            ref={refs.fileInput}
            onChange={files => handleStageFiles(files)}
            {...dropzoneInputProps}
          />
        </VStack>
      </Box>

      {/* Files Staged for Upload */}
      <Text alignSelf="flex-start" mb={2} ml={4} fontWeight="bold">
        {stagedFiles.length === 0 ? 'No files staged for upload' : 'Files staged for upload:'}
      </Text>
      <Box w="100%" px={4} mb={4}>
        {stagedFiles.length > 0 ? (
          <SimpleGrid columns={[1, 2, 3]} spacing={4}>
            {stagedFiles.map((file, index) => (
              <FileCard key={index} file={file} onClickDelete={handleClickRemove} />
            ))}
          </SimpleGrid>
        ) : (
          <Text color="gray.500">No files staged for upload</Text>
        )}
      </Box>

      {/* Upload Button */}
      <Button
        colorScheme='blue'
        size='lg'
        onClick={handleClickSubmit}
        isLoading={submitting}
        loadingText='Submitting. . .'
        disabled={stagedFiles.length === 0}
        width='200px'
        _hover={{
          transform: 'scale(1.05)',
        }}
        transition="transform 0.2s"
      >
        Upload Files
      </Button>
    </Flex>
  )
}

export default UploadFormUI;