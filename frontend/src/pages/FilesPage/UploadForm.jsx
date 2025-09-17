import React, { useEffect, useState, useRef } from 'react';
import { useToast } from '@chakra-ui/react';
import { useDropzone } from 'react-dropzone';

import UploadFormUI from './UploadFormUI';

import useFetch from '../../hooks/useFetch';
import useFormData from '../../hooks/useFormData';
import { getErrorMsg } from '../../util/util';

// TODO: move to centralized location 
const baseUrl   = 'http://localhost:5000';
const filesApi  = `${baseUrl}/api/files`;
const infoApi   = `${baseUrl}/api/info`;
const fileExtApi = `${infoApi}/allowed-file-ext`;
const toolTipApi = `${infoApi}/tool-tips`; // TODO: implement

// TODO: refactor file staging state and logic to Dropzone

const UploadForm = ({ onUpdate }) => {

  const toast = useToast();

  const { formData, setFormData, submitting, onChange, onSubmit } = useFormData({
    initFormData: { stagedFiles: [] },
    required    : { stagedFiles: true }
  });

  const { loading, fetched, onFetch } = useFetch({
    initLoading: { allowedFileExt: false, toolTips: false },
    initFetched: { allowedFileExt: false, toolTips: false },
    endpoints: { allowedFileExt: fileExtApi, toolTips: toolTipApi }
  });

  // Init dropzone state
  const [dragging, setDragging] = useState(false);
  
  // Dropzone setup
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => onFilesAdded(acceptedFiles),
    multiple: true,
    onDragEnter: () => setDragging(true),
    onDragOver: () => setDragging(true),
    onDragLeave: () => setDragging(false),
    onDropAccepted: () => setDragging(false),
  });
  
  const refs = { fileInput: useRef() };

  // Handle side-effects
  useEffect(() => {
    /* Workaround to let us indirectly await async in useEffect */
    const handleFetch = async () => {
      // Array of fetch promises
      const promises = [onFetch('allowedFileExt'), onFetch('toolTips')];
      // Execute all promises in parallel until all are settled
      const results = await Promise.allSettled(promises);
      // Get a list of errors for any resources that failed to fetch
      const errs = results.filter(r => r.status === 'rejected').map(r => r.reason);
      // Notify user of any resources that failed to fetch
      const numErrs = errs.length;
      if (numErrs > 0) {
        const msg = `Failed to fetch (${numErrs}) resource${numErrs > 1 ? 's' : ''}: ${errs.join(', ')}`;
        console.error(msg);
      }
    };
    handleFetch();
  }, []); // No dependencies; only called on initial page render

  /**
   * 
   * @param {*} files
   */
  const handleStageFiles = (files) => {
    // Make sure input is an array of Files and not a FileList for consistency
    const filesToStage = Array.from(files);
    /* When using an input element with react-dropzone, onChange callbacks
       are passed the files array directly, not an element object. This forces
       us to create our own fake event object to pass to onChange. */
    onChange({ 
      target: { 
        name  : 'stagedFiles',
        type  : 'file',
        files : filesToStage
      }
    });
  };

  /* Remove a staged file */
  const handleRemoveFile = (file) => {
    setFormData(prev => {
      return { ...prev, stagedFiles: prev.stagedFiles.filter(f => f.name !== file.name) };
    });
  };

  /* Trigger file input from 'select files' button */
  const handleBrowseFiles = () => refs.fileInput.current?.click();

  /* */
  const handleSubmitForm = async () => {
    let toastArgs = {};
    try {
      // TODO: do we need to pass a config object with headers?
      const files = await onSubmit(`${filesApi}/upload`);
      // Call update handler (this is only defined when UploadForm is rendered in a drawer)
      if (onUpdate) await onUpdate();
      // Clear staged files
      setFormData(prev => ({ ...prev, stagedFiles: [] }));
      toastArgs = {
        title       : files.length > 1
          ? 'Files Uploaded'
          : 'File Uploaded',
        description : files.length > 1
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
    }
    toast({ ...toastArgs, duration: 3000, isClosable: true });
  };



  return (
    <UploadFormUI
      loading={loading}
      dragging={dragging}
      submitting={submitting}

      refs={refs}
      fetched={fetched}
      formData={formData}
      //fileInputRef={refs.fileInput} // Note: for some reason, this was breaking if I tried passing refs and then de-structuring

      onStageFiles={handleStageFiles}
      onClickRemove={handleRemoveFile}
      onClickBrowse={handleBrowseFiles}
      onClickSubmit={handleSubmitForm}

      dropzoneRootProps={getRootProps()}
      dropzoneInputProps={getInputProps()}
    />
  );
}

export default UploadForm;