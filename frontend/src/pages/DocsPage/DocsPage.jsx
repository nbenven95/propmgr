import axios from 'axios'
import { useEffect, useState } from 'react'

import DocsPageUI from './DocsPageUI'

const docsRoute = 'http://localhost:5000/api/docs'; // TODO: read from .env 

const DocsPage = () => {

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  /**
   * 
   */
  const fetchDocs = () => {
    setLoading(true);
    axios.get(docsRoute).then(res => {
      // Get the list of Document objects from response as an array
      const newState = Array.from(res.data);
      // Update global state
      setDocuments(newState);
    }).catch(err => {
      alert('Error fetching Documents'); // FIXME: proper error handling 
      console.error(err);
    }).finally(() => {
      setLoading(false);
    });
  }

  /**
   * Deletes Document doc (but not the associated File)
   * 
   * @param {*} doc 
   */
  const handleDelete = (doc) => {
    axios.delete(`${docsRoute}/${doc?._id}`).then(res => {
      alert(`Successfully deleted Document ${doc._id}`); // FIXME: proper notification
      fetchDocs();
    }).catch(err => {
      alert(`Error deleting Document ${doc._id}`);
      console.error(err); // FIXME: proper error handling 
    });
  }

  return (
    <DocsPageUI
      loading={{loading}}
      documents={{documents}}
      handleDelete={{handleDelete}}
    />
  );
};

export default DocsPage;