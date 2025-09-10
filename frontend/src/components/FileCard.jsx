import React from 'react'
import { defaultStyles, FileIcon } from 'react-file-icon'
import { CloseIcon } from '@chakra-ui/icons'

import iconMap from '../util/iconMap.js'

import '../styles/filecard.css'

/**
 * 
 * @param {*} param0 
 * @returns 
 */
const FileCard = ({
  file,
  handleDelete
}) => {
  // Get the file extension (or the final extension, in the case of multiple)
  let ext = String(file?.name).split('.').pop();
  // If no extension, replace with ''
  if (ext === file.name) ext = '';

  const defaultStyle = defaultStyles[ext];
  const backupStyle = iconMap(ext);

  return (
      <div className='file-card'>
      {/* File icon + name */}
      <div className='file-icon-container'>
        <div className='file-icon'>
          {defaultStyle === undefined ? (
            <FileIcon extension={ext} {...backupStyle} />
          ) : (
            <FileIcon extension={ext} {...defaultStyle} />
          )}
        </div>
      </div>
      <div className='file-name'>{file.name}</div>
      {/* File delete/remove from staging button */}
      <button className='delete-button' title='Delete' onClick={() => handleDelete(file)}>
        <CloseIcon/>
      </button>
    </div>
  )
};

export default FileCard;