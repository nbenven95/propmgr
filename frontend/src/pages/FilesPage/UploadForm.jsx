import React, { useEffect, useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';

import UploadFormUI from './UploadFormUI';

import useFetch from '../../hooks/useFetch';
import useNotify from '../../hooks/useNotify';
import useFormData from '../../hooks/useFormData';
import { getErrorMsg, plural } from '../../util/util';

import EndpointEnum from '../../util/EndpointEnum';

const { FILES_API, FILE_EXT_API } = EndpointEnum;

// TODO: refactor file staging state and logic to Dropzone

/**
 * 
 * @param {*} props 
 * @returns 
 */
const UploadForm = ({ onUpdate }) => {

  const notify = useNotify();

  const { formData, setFormData, submitting, onChange, onSubmit } = useFormData([
    { stagedFiles: { init: [], required: true } }
  ]);

  const { loading, fetched, onFetchMany } = useFetch([
    { allowedFileExt: { init: [], url: FILE_EXT_API } }
  ]);

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

  const handleFetch = async (resources) => {
    const errs = await onFetchMany(resources);
    // On failure to fetch, just log to console
    if (errs.length > 0) {
      const numErrors = errs.length;
      const label = plural('resource', numErrors);
      console.error(`Failed to fetch (${numErrors}) ${label}: ${errs.join(', ')}`);
    }
  };

  const handleStageFiles = (files) => {
    // Make sure input is an array of Files and not a FileList
    const filesToStage = Array.from(files);
    // Dropzone gives us files directly; create fake event object for onChange to work with
    onChange({ target: { name: 'stagedFiles', type: 'file', files: filesToStage } });
  };

  /**
   * Remove a File that is staged for upload.
   * @param {*} name The name of the File
   */
  const handleUnstageFile = (name) => {
    console.log(name)
    setFormData(prev => {
      // De-structure previous state
      const { stagedFiles } = prev;
      // If no files staged, abort update
      if (stagedFiles.length === 0) return prev;
      // Remove the file with the specified ObjectID from the stagedFiles array
      const stagedFilesUpdated = stagedFiles.filter(file => file.name !== name);
      return { ...prev, stagedFiles: stagedFilesUpdated };
    });
  };

  const handleUpload = async () => {
    try {
      // Await POST request (default for onSubmit)
      const res = await onSubmit(`${FILES_API}/upload`);
      const files = Array.from(res.data);
      // Clear staged files
      setFormData({ stagedFiles: [] });
      // Notify user of successful upload
      // TODO: format these messages on the backend for consistency, access through res.message field
      notify({
        status: 'success',
        title: `${plural('File', files.length)} Uploaded`,
        desc: files.length > 1
          ? `Successfully uploaded (${files.length}) Files`
          : `Successfully uploaded File \"${files[0].name}\"`
      });
    } catch (err) {
      notify({
        status: 'error',
        title: 'Error Uploading File(s)',
        desc: getErrorMsg(err)
      });
    } finally {
      // TODO: should this be called on success and failure, or just success?
      onUpdate?.();
    }
  };

  // Handle side effects of initial page render
  useEffect(() => {
    handleFetch(['allowedFileExt']);
  }, []);

  return (
    <UploadFormUI
      refs={refs}
      fetched={fetched}
      formData={formData}
      loading={loading}
      dragging={dragging}
      submitting={submitting}

      // Triggers File Input component from clicking 'Browse Files' button
      onClickBrowse={() => refs.fileInput.current?.click()}
      onStageFiles={handleStageFiles}
      onClickUnstage={handleUnstageFile}
      onClickSubmit={handleUpload}

      // react-dropzone props
      dropzoneRootProps={getRootProps()}
      dropzoneInputProps={getInputProps()}
    />
  );
}

export default UploadForm;