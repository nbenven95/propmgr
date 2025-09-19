import React, { useEffect, useState, useRef } from 'react';
//import { useToast } from '@chakra-ui/react';
import { useDropzone } from 'react-dropzone';

import UploadFormUI from './UploadFormUI';

import useFetch from '../../hooks/useFetch';
import useNotify from '../../hooks/useNotify';
import useFormData from '../../hooks/useFormData';
import { getErrorMsg } from '../../util/util';

// TODO: move to centralized location 
const baseUrl   = 'http://localhost:5000';
const filesApi  = `${baseUrl}/api/files`;
const infoApi   = `${baseUrl}/api/info`;
const fileExtApi = `${infoApi}/allowed-file-ext`;

// TODO: refactor file staging state and logic to Dropzone

const UploadForm = ({ onUpdate }) => {

  //const toast = useToast();
  const notify = useNotify();

  const { formData, setFormData, submitting, onChange, onSubmit } = useFormData({
    initFormData: { stagedFiles: [] },
    required    : { stagedFiles: true }
  });

  const { loading, fetched, onFetchMany } = useFetch({
    initLoading: { allowedFileExt: false },
    initFetched: { allowedFileExt: false },
    endpoints: { allowedFileExt: fileExtApi }
  });

  // Init component references
  const refs = { fileInput: useRef() };

  // Init dropzone state
  const [dragging, setDragging] = useState(false);
  
  // Dropzone setup
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (files) => handleStageFiles(files), // Note: this references one of our event handlers
    multiple: true,
    onDragEnter: () => setDragging(true),
    onDragOver: () => setDragging(true),
    onDragLeave: () => setDragging(false),
    onDropAccepted: () => setDragging(false),
  });

  /**
   * 
   * @param {Array} resources 
   */
  const handleFetch = async (resources) => {
    const errs = await onFetchMany(resources);
    // On failure to fetch, just log to console
    if (errs.length > 0) {
      console.error(`Failed to fetch (${errs.length})`.concat(
        `resource${errs.length > 1 ? 's' : ''}: ${errs.join(', ')}`));
    }
  };

  /* Handle side effects */

  // Fetch resources (no dependencies; only called on initial page render)
  useEffect(() => {
    handleFetch(['allowedFileExt']);
  }, []);

  /**
   * 
   * @param {*} files
   */
  const handleStageFiles = (files) => {
    // Make sure input is an array of Files and not a FileList for consistency
    const filesToStage = Array.from(files);
    // Fake event object because dropzone gives us the files directly, not an event object
    onChange({ target: { name: 'stagedFiles', type: 'file', files: filesToStage } });
  };

  /* Handle removing a staged file */
  const handleRemoveFile = (file) => {
    setFormData(prev => {
      const stagedFilesUpdated = prev.stagedFiles.filter(f => {
        return f.name !== file.name
      });
      return { ...prev, stagedFiles: stagedFilesUpdated };
    });
  };

  /* Trigger file input from 'select files' button */
  const handleBrowseFiles = () => refs.fileInput.current?.click();

  /* */
  const handleSubmitForm = async () => {
    try {
      // Await POST request (default for onSubmit)
      const files = await onSubmit(`${filesApi}/upload`);
      // Clear staged files
      setFormData({ stagedFiles: [] });
      // Notify user of successful upload
      notify({
        status: 'success',
        title: `File${files.length > 1 ? 's' : ''} Uploaded`,
        desc: files.length > 1
          ? `Successfully uploaded (${files.length}) Files`
          : `Successfully uploaded File \"${files[0].name}\"`
      });
      // If UploadForm is being rendered in a drawer, update fetched Files and close drawer
      /* Note: call this synchronously so we can start the fetch and immediately close
        the drawer. If the fetch is still ongoing, 'Files Loading. . .' will (should)
        display; this may or may not be desirable behavior. */
      if (onUpdate) onUpdate();
    } catch (err) {
      // Notify user of failed upload
      notify({ status: 'error', title: `Error Uploading `, desc: getErrorMsg(err) });
    }
  };

  return (
    <UploadFormUI
      loading={loading}
      dragging={dragging}
      submitting={submitting}

      refs={refs}
      fetched={fetched}
      formData={formData}

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