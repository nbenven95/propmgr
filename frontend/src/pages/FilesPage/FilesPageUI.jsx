import React from 'react'

import './FilesPage.css'
import FileCard from '../../components/filecard'

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
  console.log(loading)
  return (
    <div className='files-container'>
      {loading ? (
        <p>Loading . . .</p> 
      ) : uploadedFiles.length === 0 ? (
        <p>No Files found.</p>
      ) : (
        // View and delete uploaded files
        <>
          <h2>Files</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginTop: '20px' }}>
            {uploadedFiles?.map((file, index) => (
              <div key={index}>
                <FileCard file={file} handleDelete={handleDelete}/>
              </div>
            ))}
          </div>
        </>
        // End view uploaded files
      )}
    </div>
  );
};

export default FilesPageUI;