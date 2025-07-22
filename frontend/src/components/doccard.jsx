import React from 'react'

import './doccard.css'

// TODO: read from .env
const docIcon = '📃';
const deleteIcon = '❌';

const DocCard = ({
  doc,
  handleDelete
}) => {
  return (
    <div>
      {/* Document icon + name; TODO: custom formatting */}
      <div className='doc-icon-container'>
        <div className='doc-icon'>{docIcon}</div>
        <div className='doc-name'>{doc?.name}</div>
      </div>

      {/* Document delete button */}
      <button className='delete-button' title='Delete' onClick={() => handleDelete(doc)}>
        {deleteIcon}
      </button> 
    </div>
  )
};

export default DocCard;