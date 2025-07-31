import axios from 'axios'
import { useEffect, useState } from 'react'
import { useToast } from '@chakra-ui/react'

import FilesPageUI from './FilesPageUI'

const filesRoute = 'http://localhost:5000/api/files' // TODO: read from .env 

/**
 * 
 * @returns 
 */
const FilesPage = () => {
  const toast = useToast();
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
      console.error(err);
      toast({
        title: 'Error fetching files',
        description: err.message,
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    }).finally(() => {
      setLoading(false);
    });
  };

  /**
   * 
   * @param {*} file 
   */
  const handleDelete = (file) => {
    if (Array.isArray(file?.documents) && file.documents.length > 0) {
      toast({
        
      })
    }
    axios.delete(`${filesRoute}/${file?._id}`).then(res => {
      toast({
        title: 'File successfully deleted',
        description: `File with ID "${file._id}" successfully deleted.`,
        status: 'success',
        duration: 3000,
        isClosable: true
      })
      fetchFiles(); // On successful delete, get the updated file list
    }).catch(err => {
      toast({
        title: 'Error deleting file',
        description: `File with ID "${file._id}" could not be deleted`,
        status: 'error',
        duration: 3000,
        isClosable: true
      })
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