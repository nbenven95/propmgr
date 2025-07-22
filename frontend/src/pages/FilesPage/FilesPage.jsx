import axios from 'axios'
import { useEffect, useState } from 'react'

import FilesPageUI from './FilesPageUI'

const filesRoute = 'http://localhost:5000/api/files' // TODO: read from .env 

/**
 * 
 * @returns 
 */
const FilesPage = () => {

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  /**
   * Get list of currently uploaded files
   */
  const fetchFiles = () => {
    setLoading(true);
    // async call to get files from backend
    axios.get(filesRoute).then(res => { // TODO: loading animation, specify timeout period
      const newState = Array.from(res.data);
      setUploadedFiles(newState);
    }).catch(err => {
      alert('Error fetching Files');
      console.error(err); // FIXME: proper error handling
    }).finally(() => {
      setLoading(false);
    });
  };

  /**
   * 
   * @param {*} file 
   */
  const handleDelete = (file) => {
    axios.delete(`${filesRoute}/${file?._id}`).then(res => {
      alert(`Successfully deleted File ${file?._id}`); // FIXME: replace alerts with proper notifications 
      fetchFiles(); // On successful delete, get the updated file list
    }).catch(err => {
      alert(`Error deleting File ${file?._id}`);
      console.error(err); // FIXME: proper error handling
    });
  };

  // TODO: look into using useEffect() properly; not sure if its appropriate here
  // Specify functions that need to run before each render
  useEffect(() => { 
    fetchFiles();
  }, []);

  return (
    <FilesPageUI
      loading={loading}
      uploadedFiles={uploadedFiles}
      handleDelete={handleDelete}
    />
  );
};

export default FilesPage;