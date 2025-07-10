import React, { useEffect, useState } from 'react'
import axios from 'axios'

const proxy = 'http://localhost:5000'; // backend server

const FilesPage = () => {

  /* Stateful array to track staged files, setter to modify.
  You can read/modify this array in event handlers by accessing
  the DOM element that fired the event, then use the setter;
  e.g., use e.target.uploadedFiles to access the current state, run
  your program logic in the event handler based on the DOM event that
  was fired, then use setUploadedFiles(updated_files) to modify. */
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Stateful boolean to track state of async requests
  const [loading, setLoading] = useState(true);

  /* Get list of uploaded files from backend
    TODO:
      - Loading animation while waiting for files to be fetched
      - Timeout if no response from server after set period of time */
  const fetchFiles = () => {
    setLoading(true);
    // async call to get files from backend
    axios.get(`${proxy}/files`).then(res => {
      const newState = Array.from(res.data);
      console.log(newState);
      setUploadedFiles(newState);
      setLoading(false);
    }).catch(err => {
      console.error(err); // TODO: redirect to error page?
      setLoading(false);
    });
  };

  /* The function passed to useEffect runs during initial render;
  this is typically used to pre-calculate something that needs to
  be rendered. In this case, we need to get the list of files to
  be able to actually render the page. Arg 2 (optional) is a list
  of deps that require the func to be called again after loading. */
  useEffect(() => { 
    fetchFiles();
    console.log(`Fetched files: ${uploadedFiles}`); 
  }, []);

  const handleDelete = (fileId) => {
    // TODO: backend call to get file name by id
    axios.delete(`${proxy}/files/${fileId}`).then(res => {
      alert(`Successfully deleted file: id=${fileId}`);
      fetchFiles(); // On successful delete, get the updated file list
    }).catch(err => {
      alert(`Error deleting file: id=${fileId}`);
      console.error(err)
    });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Uploaded files</h2>
      {/* TODO: more readable way of checking the loading state? */}
      {loading ? (
        <p>Loading...</p> 
      ) : uploadedFiles.length === 0 ? (
        <p>No files uploaded yet.</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {uploadedFiles.map((file) => (
            <div
              key={file._id} 
              style={{
                position: 'relative', // TODO: look into refactoring styling into element-specific css config, import
                margin: '10px',
                width: '100px',
                height: '100px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                {/* File icon */}
                <div style={{ textAlign: 'center', padding: '5px' }}>
                  <div style={{ fontSize: '40px' }}>
                    📄
                  </div>
                  <div style={{ fontSize: '12px', wordBreak: 'break-all', maxWidth: '80px' }}>
                    {file.filename}
                  </div>
                </div>
                {/* Delete button
                  TODO:
                    - Add 'confirm delete' popup message
                    - Change from button to checkbox to allow for bulk delete */}
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
                  onClick={() => handleDelete(file._id)}
                  title="Delete"
                >
                  ❌
                </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilesPage;