import React, { useEffect, useState, useRef } from 'react';
import { useToast } from '@chakra-ui/react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';

import UploadFormUI from './UploadFormUI';

import useFetch from '../../hooks/useFetch.js';
import useFormData from '../../hooks/useFormData.js';

import { getErrorMsg, getLocalTimestamp, truncateExt } from '../../util/util.js';

// TODO: move to centralized location 
const baseUrl   = 'http://localhost:5000';
const filesApi  = `${baseUrl}/api/files`;
const infoApi   = `${baseUrl}/api/info`;
const fileExtApi = `${infoApi}/allowed-file-ext`;
const toolTipApi = `${infoApi}/tool-tips`; // TODO: implement

const UploadForm = ({ onUpdate }) => {

  const { formData, setFormData, getPayload, submitting, handleChange, handlePost } = useFormData({
    initFormData: { stagedFiles: [] },
    required    : { stagedFiles: true }
  });

  const { loading, fetched, handleFetch } = useFetch({
    initLoading: { allowedFileExt: false, toolTips: false },
    initFetched: { allowedFileExt: false, toolTips: false }
  });

  //const [files, setFiles] = useState([])
  const [dragging, setDragging] = useState(false);

  const refs = { fileInput: useRef() };

  /**
   * Handle side effects on initial render.
   * 
   * Fetch all data needed for the page to function:
   *  + Allowed file extensions
   *  + Tool tips
   */
  useEffect(() => {

    // Can't directly await an async function in useEffect
    // Workaround: define an async function, await inside of it, call the function synchronously (without await)
    const fetch = async () => {
      try {
        // Await inside of async function so we can catch async errors
        await handleFetch(fileExtApi, 'allowedFileExt');
        await handleFetch(`${toolTipApi}/UploadForm`, 'toolTips');
      } catch (err) {
        // Catch failed API requests
        //console.error(err);
      }
    }
    // Call the async function without await (can't directly await in useEffect)
    fetch();
  }, []);

  // Handle files added via input or dropzone
  /*
  const handleFilesAdded = (newFileList) => {
    const newFiles = Array.from(newFileList)
    const updatedFiles = [...files]
    newFiles.forEach(file => {
      // Avoid duplicates based on name and size
      if (!updatedFiles.some(f => f.name === file.name && f.size === file.size)) {
        updatedFiles.push(file)
      }
    })
    setFiles(updatedFiles)
  }
  */

  /*
  const handleUpload = () => {
    const formData = new FormData()
    files.forEach(file => {
      formData.append('files', file)
    })
    axios.post(`${endpoint}/upload`, formData)
      .then(res => {
        alert('Files uploaded successfully')
        setFiles([])
      })
      .catch(err => {
        alert('Error uploading files')
        console.error(err)
      })
  }
  */
  const handleSubmit = async () => {
    let toastArgs = {};
    try {
      const payload = getPayload();
      // TODO: do we need to pass a config object with headers?
      const files = await handlePost(`${filesApi}/upload`, payload);
      // Call update handler (this is only defined when UploadForm is rendered in a drawer)
      if (onUpdate) await onUpdate();
      toastArgs = {
        title       : files.length > 1
          ? 'Files Uploaded'
          : 'File Uploaded',
        description : files.length > 1
          // TODO: test formatting of this toast
          ? `Successfully uploaded (${files.length}) Files:\n ${files.map(file => file.name).join(', ')})`
          : `Successfully uploaded File \"${files[0].name}\"`,
        status      : 'success'
      };
    } catch (err) {
      toastArgs = {
        title       : 'Error Uploading File',
        description : getErrorMsg(err),
        status      : 'error'
      };
      console.error(err);
    } finally {
      toastArgs({ ...toastArgs, duration: 3000, isClosable: true });
    }
  };

  /*
  const handleRemove = (file) => {
    setFiles(prev => prev.filter(f => f.name !== file.name))
  }
  */
  // Remove a staged File
  const handleRemove = (file) => {
    setFormData(prev => {
      return { ...prev, files: prev.files.filter(f => f.name !== file.name) };
    });
  };

  // For button to trigger file input
  const handleClickBrowse = () => {
    fileInputRef.current.click()
  }

  // TODO: ensure that this properly filters duplicate files 
  const handleFilesAdded = (e) => handleChange(e);

  // Dropzone setup
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => handleFilesAdded(acceptedFiles),
    multiple: true,
    onDragEnter: () => setDragging(true),
    onDragOver: () => setDragging(true),
    onDragLeave: () => setDragging(false),
    onDropAccepted: () => setDragging(false),
  })

  return (
    <UploadFormUI
      formData={formData}
      fetched={fetched}
      refs={refs}
      loading={loading}
      submitting={submitting}
      dragging={dragging}
      handleClickBrowse={handleClickBrowse}
      handleChange={handleFilesAdded}
      handleRemove={handleRemove}
      handleSubmit={handleSubmit}
      dropzoneRootProps={getRootProps()}
      dropzoneInputProps={getInputProps()}
    />
  )
}

export default UploadForm;