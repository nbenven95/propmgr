import React from 'react'
import { Tooltip } from '@chakra-ui/react'

import FileCard from '../../components/FileCard'

import '../../styles/filecard.css'

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
    <div className='files-container'>
      {loading ? (
        <p>Loading . . .</p> 
      ) : uploadedFiles.length === 0 ? (
        <p>No Files found.</p>
      ) : (
        <>
          <h2>Files</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginTop: '20px' }}>
            {uploadedFiles?.map((file, index) => (
              <Tooltip key={index} label={
                file.documents?.length === 0
                  ? 'No linked documents'
                  : `Linked documents (${file.documents?.length}): ` + file.documents.map(doc => doc?.name).join(', ')
              }>
                <div key={index}>
                  <FileCard file={file} handleDelete={handleDelete} />
                </div>
              </Tooltip>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default FilesPageUI;