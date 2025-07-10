import React, { useState, useRef } from 'react'
import axios from 'axios'

const proxy = 'http://localhost:5000'; // backend server

const UploadPage = () => {

  /* Stateful array to track staged files, setter to modify.
  You can read/modify this array in event handlers by accessing
  the DOM element that fired the event, then use the setter;
  e.g., use e.target.files to access the current state, run your
  program logic in the event handler based on the DOM event that
  was fired, then use setFiles(updated_files) to change the state */
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef();

  /* Handle staging new files for upload */
  const handleFilesAdded = (newFileList) => { // TODO: more concise way of filtering?
    // List containing files to be staged
    const newFiles = Array.from(newFileList);
    // Init update list with currently staged files
    const updatedFiles = [...files];
    // Append newly staged files to existing staged files
    newFiles.forEach(file => {
      // Only add the file if it is not already staged
      if (!updatedFiles.some(f => f.name === file.name && f.size === file.size)) {
        updatedFiles.push(file);
      }
    });
    setFiles(updatedFiles); // Update global staged files array
  };

  /* Handle drag and drop events */
  const handleDrop = (e) => {
    e.preventDefault(); // Block default event handler
    handleFilesAdded(
      e.dataTransfer.files // Get drag-and-drop files, add them to global 'files' array
    ); 
  };

  /* Handle removing staged files */
  const handleRemove = (index) => {
    setFiles(files.filter((_, i) => i !== index)); // TODO: better/more readable way of doing this?
  };

  /* Upload staged files in response to upload button click */
  const handleUpload = () => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    // async call to upload files to server
    axios.post(`${proxy}/upload`, formData).then(res => {
      alert('Files uploaded successfully');
      setFiles([]); // Clear staged files
    }).catch(err => {
      alert('Error uploading files');
      console.error(err);
    });
  };

  /* Handle button click event -- open file explorer */
  const handleClickBrowse = () => {
    fileInputRef.current.click(); // Trigger click event on main file input object
  };

  /* Handle event when files are added/removed from staging */
  const handleFileChange = (e) => {
    // e.target is the DOM element that triggered the event; allows us to access global array 'files'
    handleFilesAdded(e.target.files);
  };

  return (
    <div>
      <h2>Drag & Drop Files</h2>
      <div
        style={{
          border: '2px dashed #ccc',
          padding: '20px',
          borderRadius: '5px',
          textAlign: 'center',
        }}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={(e) => e.preventDefault()}
      >
        <p>Drop files here or <button onClick={handleClickBrowse}>Browse</button></p>
        <input
          type="file"
          multiple
          style={{ display: 'none' }}
          ref={fileInputRef}
          // TODO: won't this call handleFilesAdded a second time redundantly for drag and drop? Might not matter
          onChange={handleFileChange}
        />
      </div>

      {/* File Preview Grid 
      TODO: file upload loading animation (e.g., make the file icons file up with a color to indicate loading progress */}
      {files.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: '20px' }}>
          {files.map((file, index) => (
            <div 
              key={index}
              style={{ 
                position: 'relative', 
                margin: '10px', 
                width: '100px', 
                height: '100px', 
                border: '1px solid #ccc', 
                borderRadius: '4px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
              {/* File Icon */}
              <div style={{ textAlign: 'center', padding: '5px' }}>
                <div style={{ fontSize: '40px' }}>
                  📄
                </div>
                <div style={{ fontSize: '12px', wordBreak: 'break-all', maxWidth: '80px' }}>
                  {file.name}
                </div>
              </div>
              {/* Remove Button
                TODO:
                  - Add 'confirm remove from staging' popup message
                  - Change from button to checkbox to allow for bulk removal */}
              <button
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  color: 'none',
                  background: 'white',
                  border: '1px solid red',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
                onClick={() => handleRemove(index)}
                title="Remove"
              >
                ❌
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      <div style={{ marginTop: '20px' }}>
        <button onClick={handleUpload} disabled={files.length === 0}>
          Upload Files
        </button>
      </div>
    </div>
  );
};

export default UploadPage;