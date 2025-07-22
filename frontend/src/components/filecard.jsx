import React from 'react'

import './filecard.css'

const fileIcon = '📄'; // TODO: check docs for icon package with icons for different file types 
const deleteIcon = '❌';

/**
 * 
 * @param {*} param0 
 * @returns 
 */
const FileCard = ({
  file,
  handleDelete
}) => {
  return (
    <div className='file-card'>

      {/* File icon + name; TODO: fix this formatting */}
      <div className='file-icon-container'>
        <div className='file-icon'>{fileIcon}</div>
      </div>
      <div className='file-name'>{file?.name}</div>

      {/* File delete/remove from staging button */}
      <button className='delete-button' title='Delete' onClick={() => handleDelete(file)}>
        {deleteIcon}
      </button>

    </div>
  )
};

export default FileCard;