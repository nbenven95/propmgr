import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Button,
  Flex,
  VStack,
  Text,
  SimpleGrid,
  useColorModeValue,
  useToast
} from '@chakra-ui/react';
import { WiCloudUp } from 'react-icons/wi';
import { useDropzone } from 'react-dropzone';

import useFormData from '../../hooks/useFormData';

const Dropzone = ({
  stagedFiles, // current list of staged files
  onFilesChanged
}) => {
  
  /* TODO: is this state really needed? Is there a way to somehow 'return' the files that are dragged/selected and maintain that state elsewhere? */
  const {
    formData,
    setFormData,
    getPayload,
    submitting,
    handleChange,
    handlePost,
    handlePut
  } = useFormData({
    initFormData: { stagedFiles: [] },
    required    : { stagedFiles: true }
  });

  const toast = useToast();

  // Dropzone setup
  const [dragging, setDragging] = useState(false);
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => handleFilesAdded(acceptedFiles),
    multiple: true,
    onDragEnter: () => setDragging(true),
    onDragOver: () => setDragging(true),
    onDragLeave: () => setDragging(false),
    onDropAccepted: () => setDragging(false),
  });

  return (
    <DropzoneUI
    
    />
  );
};

const DropzoneUI = ({
  dragging,
  handleClickBrowse
}) => {
  const borderColor = useColorModeValue('gray.300', 'gray.600');
  const draggingBorderColor = '#1e40af';
};

export default Dropzone;