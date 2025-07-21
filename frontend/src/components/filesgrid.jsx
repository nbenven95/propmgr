import React from 'react'
import { useRef } from 'react'

import './filesgrid.css'

const FilesGrid = ({
  files,
  handleDelete,
  deleteIcon
},
) => {
  
  return (
    <div className="files-grid">
      {files?.map((file, index) => (
        <div key={index} className="file-card">

            {/* File icon */}
            <div style={{ textAlign: 'center', padding: '5px' }}>
              <div className="file-icon">📄</div>
              <div className="file-name">{file?.name}</div>
            </div>

            {/* Remove/delete button */}
            <button className="delete-button" title="Delete" onClick={() => handleDelete(file)}>
              {deleteIcon}
            </button>

        </div>
      ))}
    </div>
  );
};

export default FilesGrid;