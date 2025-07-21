import React from 'react'
import { Flex, flexbox, VStack } from '@chakra-ui/react'
import { WiCloudUp } from "react-icons/wi";

import './UploadPage.css'
import FilesGrid from '../../components/filesgrid'
import { scale } from 'framer-motion';

/**
 * Dumb (presentational) component for UploadPage.
 * Receives state and handlers as props from smart component.
 * 
 * @param {*} param0 
 * @returns 
 */
const UploadPageUI = ({
  files,
  isDragging,
  fileInputRef,
  handleClickBrowse,
  handleDragEnter,
  handleDragOver,
  handleDrop,
  handleDragLeave,
  handleFileChange,
  handleRemove,
  handleUpload
}) => {
  return(
    <>
    
    <div className='flex-container'>
      <h2 style={{ alignSelf: 'flex-start', marginLeft: '2.5em'}}>Drag & Drop Files</h2>
      <div
        className={`upload-container ${isDragging ? 'dragging' : ''}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragLeave={handleDragLeave}
      ><VStack alignItems={'center'}>
          <WiCloudUp transform='scale(2.5)'/>
          <p>Drop files here or</p> 
          <button className='browse-button' onClick={handleClickBrowse}>
            Select Files
          </button>
        </VStack>
        <input
          type='file'
          multiple
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={handleFileChange}
        />
      </div>
      
      {/* Preview staged files, remove from staging */}
      <FilesGrid files={files} handleDelete={handleRemove} deleteIcon={'❌'} />

      {/* Upload Button */}
      <div className={`upload-button-container${files.length === 0 ? '-disabled' : ''}`}>
        <button className='upload-button' onClick={handleUpload} disabled={files.length === 0}>
          Upload Files
        </button>
      </div>
      
    </div>
    </>
  );
}

export default UploadPageUI;