import { useEffect, useState } from 'react'
import axios from 'axios'

import FilesPageUI from './FilesPageUI'

// TODO: read these from .env?
const endpoint = 'http://localhost:5000/api/files'

/**
 * 
 * @returns 
 */
const FilesPage = () => {

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  /*
  const handleDelete = (fileId) => {
    axios.delete(`${endpoint}/${fileId}`).then(res => {
      alert(`Successfully deleted file: id=${fileId}`);
      fetchFiles(); // On successful delete, get the updated file list
    }).catch(err => {
      alert(`Error deleting file: id=${fileId}`);
      console.error(err)
    });
  };
  */
  const handleDelete = (file) => {
    axios.delete(`${endpoint}/${file?._id}`).then(res => {
      alert(`Successfully deleted file ${file?._id}`); // TODO: replace alerts with proper notifications 
      fetchFiles(); // On successful delete, get the updated file list
    }).catch(err => {
      alert(`Error deleting file ${file?._id}`);
      console.error(err)
    });
  };

  
  /**
   * Get list of currently uploaded files
   */
  const fetchFiles = () => {
    setLoading(true);
    // async call to get files from backend
    axios.get(endpoint).then(res => { // TODO: loading animation, specify timeout period
      const newState = Array.from(res.data);
      setUploadedFiles(newState);
      setLoading(false);
    }).catch(err => {
      console.error(err); // TODO: redirect to error page 
      setLoading(false);
    });
  };

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