import React from 'react'

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
    <div>
      <h2>Drag & Drop Files</h2>
      {/* Drag-and-drop field upload field */}
      <div
        className={`upload-container ${isDragging ? 'dragging' : ''}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragLeave={handleDragLeave}
      >
        <p>{ 'Drop files here or ' } 
          <button className="browse-button" onClick={handleClickBrowse}>
            browse your local files
          </button>
        </p>
        <input
          type="file"
          multiple
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={handleFileChange}
        />
      </div>
      
      {/* File Preview Grid */}
      {files.length > 0 && (
        <div className="file-preview-grid">
          {files.map((file, index) => (
            <div key={index} className="file-card">

              {/* File Icon */}
              <div style={{ textAlign: 'center', padding: '5px' }}>
                <div className="file-icon">📄</div>
                <div className="file-name">{file.name}</div>
              </div>

              {/* Remove Button */}
              <button className="remove-button" title="Remove" onClick={() => handleRemove(index)}>
                ❌
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      <div className="upload-button-container">
        <button className="upload-button" onClick={handleUpload} disabled={files.length === 0}>
          Upload Files
        </button>
      </div>
    </div>
  );
}

export default UploadPageUI;