import React from 'react'

/**
 * 
 * @param {*} param0 
 * @returns 
 */
const FilesPageUI = ({
  loading,
  uploadedFiles,
  handleDelete
}) => {
  return (
    <div className="files-container">
      {/* TODO: more readable way of checking the loading state? */}
      {loading ? (
        <p>Loading...</p> 
      ) : uploadedFiles.length === 0 ? (
        <p>No files uploaded yet.</p>
      ) : (
        <div>
          <h2>Uploaded files</h2>
          <div className="files-grid">
            {uploadedFiles.map((file) => (
              
              <div key={file._id} className="file-card">

                  {/* File icon */}
                  <div style={{ textAlign: 'center', padding: '5px' }}>
                    <div className="file-icon">📄</div>
                    <div className="file-name">{file.filename}</div>
                  </div>

                  {/* Delete button */}
                  <button className="delete-button" title="Delete" onClick={() => handleDelete(file._id)}>
                    ❌
                  </button>

              </div>
              
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilesPageUI;

// TODO:
// Refactor file display grid and associated components to a dedicated component class
// Make file icon have absolute position on card and have text cut off at the bottom of
// the card with '...'; when you hover over the card, an info box appears, displaying the
// full file name.