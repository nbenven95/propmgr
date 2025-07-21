import React, { useState, useRef } from 'react'
import axios from 'axios'

import UploadPageUI from './UploadPageUI'

// TODO: read these from .env?
const endpoint = 'http://localhost:5000/api/files'

/**
 * Smart (container) component for UploadPage.
 * Manages state, logic, and side effects.
 * 
 * @returns 
 */
const UploadPage = ({
  stagedFilesGrid
}) => {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef();

  /* Handle staging new files for upload */
  const handleFilesAdded = (newFileList) => {
    // TODO: more concise way of filtering?
    // List containing files to be staged
    const newFiles = Array.from(newFileList);
    // Init update list with currently staged files
    const updatedFiles = [...files];
    // Append newly staged files to existing staged files
    newFiles.forEach(file => {
      // Only add the file if it is not already staged
      if (!updatedFiles.some(f => f.name === file.name && f.size === file.size)) {
        console.log(file);
        updatedFiles.push(file);
      }
    });
    setFiles(updatedFiles); // Update global staged files array
  };

  /* Upload staged files in response to upload button click */
  const handleUpload = () => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    // async call to upload files to server
    axios.post(endpoint + '/upload', formData).then(res => {
      alert('Files uploaded successfully');
      setFiles([]); // Clear staged files
    }).catch(err => {
      alert('Error uploading files');
      console.error(err);
    });
  };

  /* Handle removing staged files */
  /*
  const handleRemove = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };
  */
  const handleRemove = (file) => {
    setFiles(files.filter(f => f.name !== file.name));
  };

  /* Handle event when files are added/removed from staging */
  const handleFileChange = (e) => {
    // e.target is the DOM element that triggered the event
    // Allows us to access and update global state
    handleFilesAdded(e.target.files);
  };

  /* Handle button click event -- open file explorer */
  const handleClickBrowse = () => {
    // Pass off click event to persistent reference to file input form
    fileInputRef.current.click();
  };

  /* Drag and drop event handlers */

  const handleDragEnter = (e) => {
    // Block default event handler
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  }

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    // Handle file upload
    // Get drag and drop files, update global state
    handleFilesAdded(e.dataTransfer.files);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  }

  return (
    // Pass state and handlers to dumb component
    <UploadPageUI
      stagedFilesGrid={stagedFilesGrid}
      files={files}
      isDragging={isDragging}
      fileInputRef={fileInputRef}
      handleClickBrowse={handleClickBrowse}
      handleDragEnter={handleDragEnter}
      handleDragOver={handleDragOver}
      handleDrop={handleDrop}
      handleDragLeave={handleDragLeave}
      handleFileChange={handleFileChange}
      handleRemove={handleRemove}
      handleUpload={handleUpload}
    />
  );
};

export default UploadPage;