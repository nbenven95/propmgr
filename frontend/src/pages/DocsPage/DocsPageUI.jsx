import React from 'react'

import './DocsPage.css'
import DocCard from '../../components/doccard'

/**
 * 
 * @param {*} param0 
 * @returns 
 */
const DocsPageUI = ({
  loading,
  documents,
  handleDelete
}) => {
  console.log(loading)
  return (
    <div className='docs-container'>
      {loading ? (
        <p>Loading . . .</p> 
      ) : documents.length === 0 ? (
        <p>No Documents found.</p>
      ) : (
        // View and delete Documents
        <>
          <h2>Documents</h2>
          <div style={{ 
            display   : 'flex',
            flexWrap  : 'wrap',
            gap       : '15px',
            marginTop : '20px'
          }}>
            {documents?.map((doc, index) => (
              <div key={index}>
                <DocCard
                  doc={doc}
                  handleDelete={handleDelete}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default DocsPageUI;