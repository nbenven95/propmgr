import React from 'react'
import { VStack } from '@chakra-ui/react'
import { WiCloudUp } from "react-icons/wi";

import './UploadPage.css'
import FileCard from '../../components/filecard'

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
    <div className='flex-container'>      
      {/* Drag and drop upload area */}
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
      {/* End drag and drop area */}
      
      {/* Preview staged files, remove from staging */}
      <h3 style={{ alignSelf: 'flex-start', marginTop: '8px', marginBottom: '8px', marginLeft: '28px' }}>
        {files.length === 0 ? (
          'No files staged for upload'
        ) : (
          'Files staged for upload:'
        )}
      </h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginTop: '20px' }}>
        {files?.map((file, index) => (
          <div key={index}>
            <FileCard file={file} handleDelete={handleRemove}/>
          </div>
        ))}
      </div>
      {/* End preview staged staged files grid */}

      {/* Upload Button */}
      <div className={`upload-button-container${files.length === 0 ? '-disabled' : ''}`}>
        <button className='upload-button' onClick={handleUpload} disabled={files.length === 0}>
          Upload Files
        </button>
      </div>
      {/* End upload button */}
      
    </div>
  );
}

export default UploadPageUI;