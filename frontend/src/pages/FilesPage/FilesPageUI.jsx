import React from 'react'

import './FilesPage.css'
import FilesGrid from '../../components/filesgrid'

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
      {loading ? (
        <p>Loading...</p> 
      ) : uploadedFiles.length === 0 ? (
        <p>No files uploaded yet.</p>
      ) : (

        <div>
          {/* View and delete uploaded files */}
          <h2>Uploaded files</h2>
          <FilesGrid files={uploadedFiles} handleDelete={handleDelete} deleteIcon={'❌'}/>
        </div>

      )}
    </div>
  );
};

export default FilesPageUI;