import axios from 'axios'
import { useState, useEffect } from 'react'
import { useDisclosure, useToast, Text } from '@chakra-ui/react'

import DocsPageUI from './DocsPageUI'
import CreateDocForm from './CreateDoc/CreateDocForm'
import EditDocForm from './EditDoc/EditDocForm'

// TODO: read baseUrl and API endpoints from env 
const baseUrl   = 'http://localhost:5000';
const docsApi   = `${baseUrl}/api/docs`;
const filesApi  = `${baseUrl}/api/files`;

/**
 * Documents page controller logic
 * 
 * @returns a rendered documents page UI component
 */
const DocsPage = () => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();  // Drawer menu open/close state
  const [loading, setLoading] = useState(true);         // Page loading state (waiting for API request, etc.)
  const [drawerHeader, setDrawerHeader] = useState(''); // Drawer menu header content
  const [drawerBody, setDrawerBody] = useState(null);   // Drawer menu body content; render edit or create view based on operating mode
  const [documents, setDocuments] = useState([]);       // List of documents retrieved from backend
  const [bulkMode, setBulkMode] = useState(false);      // Bulk delete mode/single delete mode
  const [selectedDocs, setSelectedDocs] = useState([]); // Documents selected for bulk delete
  const [currentDoc, setCurrentDoc] = useState(null);   // Document selected for editing

  /**
   * Helper function for generating chakra-ui success toasts
   * @param {*} title 
   * @param {*} desc 
   */
  const toastSuccess = (title, desc) => {
    toast({ title: title, description: desc, status: 'success', duration: 3000, isClosable: true });
  };

  /**
   * Helper function for generating chakra-ui error toasts
   * @param {*} title 
   * @param {*} desc 
   */
  const toastError = (title, desc) => {
    toast({ title: title, description: desc, status: 'error', duration: 3000, isClosable: true });
  };

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await axios.get(docsApi);
      setDocuments(res.data);
    } catch (err) {
      console.error(err);
      toastError('Error fetching documents', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(docsApi + '/' + id);
      toastSuccess('Document deleted', `Document with ID "${id}" successfully deleted.`);
      fetchDocuments();
    } catch (err) {
      console.error(err);
      toastError('Error deleting document', err.message);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedDocs.length === 0) return;
    try {
      await Promise.all(
        selectedDocs.map((id) => axios.delete(docsApi + '/' + id))
      );
      toastSuccess('Documents deleted', `${selectedDocs.length} documents deleted.`);
      setSelectedDocs([]);
      setBulkMode(false);
      fetchDocuments();
    } catch (err) {
      console.error(err);
      toastError('Error deleting documents', err.message);
    }
  };

  const handleDownloadFile = async (id, filename) => {
    try {
      const response = await axios.get(
        `${filesApi}/download/${id}`,
        { responseType: 'blob' } // Must specify response type as blob (binary object)
      );
      const url = window.URL.createObjectURL(new Blob([response.data])); // Create URL for blob
      const link = document.createElement('a'); // Create temporary link element for blob
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link); // Cleanup
      window.URL.revokeObjectURL(url);
      toastSuccess('File download successful', `Successfully downloaded file "${filename}"`);
    } catch (err) {
      console.error(err);
      toastError('Error downloading file', err.message);
    }
  };

  const toggleSelect = (id) => {
    setSelectedDocs((prev) =>
      prev.includes(id) ? prev.filter((docId) => docId !== id) : [...prev, id]
    );
  };

  const handleCreateClick = () => {
    setCurrentDoc(null);
    setDrawerHeader('Create New Document');
    setDrawerBody(<CreateDocForm onUpdate={() => {
      fetchDocuments();
      onClose();
    }} />);
    onOpen();
  }

  const handleEditClick = (doc) => {
    setCurrentDoc(doc);
    setDrawerHeader('Edit Document');
    setDrawerBody(
      doc ?
        <EditDocForm
          document={doc}
          onClose={onClose}
          onUpdate={() => {
            fetchDocuments();
            onClose();
          }}
        />
      : <Text>No document selected!</Text> // In theory, this should never happen
    )
    onOpen();
  };

  // Return the UI element with our injected controller elements
  return (
    <DocsPageUI
      isOpen={isOpen}
      onClose={onClose}
      documents={documents}
      loading={loading}
      bulkMode={bulkMode}
      setBulkMode={setBulkMode}
      selectedDocs={selectedDocs}
      setSelectedDocs={setSelectedDocs}
      handleDelete={handleDelete}
      handleBulkDelete={handleBulkDelete}
      handleDownloadFile={handleDownloadFile}
      toggleSelect={toggleSelect}
      handleEditClick={handleEditClick}
      handleCreateClick={handleCreateClick}
      drawerHeader={drawerHeader}
      drawerBody={drawerBody}
    />
  );
};

export default DocsPage;
