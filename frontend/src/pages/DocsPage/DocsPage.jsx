import { useEffect } from 'react';
import { useToast, Text } from '@chakra-ui/react';

// Import custom components
import DocsPageUI from './DocsPageUI';
import CreateDocForm from './CreateDocForm.jsx';
import EditDocForm from './EditDocForm.jsx';

// Import custom hooks
import useBulkMode from '../../hooks/useBulkMode.js';
import useDrawer from '../../hooks/useDrawer.js';
import useFetch from '../../hooks/useFetch.js';

// Import utility functions
import { getErrorMsg, handleDeleteSingle, handleDownload } from '../../util/util.js'

// TODO: move to centralized location 
const baseUrl     = 'http://localhost:5000';
const filesApi    = `${baseUrl}/api/files`;
const docsApi     = `${baseUrl}/api/docs`;
const infoApi     = `${baseUrl}/api/info`;
const toolTipApi  = `${infoApi}/tool-tips`;

/**
 * 
 */
const DocsPage = () => {
  /**
   * Hook for managing pop-up messages
   */
  const toast = useToast();
  /**
   * Custom hook for managing drawer menu open/close and rendered content state
   */
  const { drawerContent, isOpen, handleOpen, handleClose } = useDrawer();
  /**
   * Custom hook for managing bulk delete mode state
   */
  const {
    bulkMode,
    enableBulkMode,
    disableBulkMode,
    toggleBulkSelect,
    handleBulkDelete
  } = useBulkMode();
  /**
   * Custom hook for managing fetched data state
   */
  const { loading, fetched, handleFetch } = useFetch({
    initLoading: { docs: false, toolTips: false },
    initFetched: { docs: [], toolTips: {} }
  });
  
  /**
   * 
   */
  useEffect(() => {
    handleFetch(docsApi, 'docs');
    handleFetch(`${toolTipApi}/DocsPage`, 'toolTips');
  }, []);

  /**
   * 
   */
  const onUpdate = async () => {
    await handleFetch(docsApi, 'docs');
    handleClose();
  };

  /**
   * 
   * @param {*} id 
   */
  const handleDeleteDoc = async (id) => {
    let toastArgs = {};
    try {
      // Attempt to delete the document given its ObjectID
      const doc = await handleDeleteSingle(`${docsApi}/${id}`);
      // Init success toast
      toastArgs = {
        title       : 'Document Deleted',
        description : `Successfully deleted Document \"${doc?.name?? id}\"`,
        status      : 'success'
      };
      // Refresh documents
      await handleFetch(docsApi, 'docs');
    } catch (err) {
      // Init error toast
      toastArgs = {
        title       : 'Error Deleting Document',
        description : getErrorMsg(err),
        status      : 'error'
      };
      console.error(err);
    }
    // Display success/error message
    toast({ ...toastArgs, duration: 3000, isClosable: true });
  };

  /**
   * Handle deleting all Documents selected for bulk delete.
   */
  const handleBulkDeleteDocs = async () => {
    let toastArgs = {};
    try {
      // Attempt bulk delete
      const deletedDocs     = await handleBulkDelete(docsApi);
      const deletedDocNames = deletedDocs.map(doc => doc.name).join(', ');
      // Init success toast
      toastArgs = {
        title       : `Deleted ${deletedDocs.length} Documents`,
        description : `Successfully deleted Documents: ${deletedDocNames}`,
        status      : 'success'
      };
      // Refresh Documents
      await handleFetch(docsApi, 'docs');
    } catch (err) {
      // Init error toast
      toastArgs = {
        title       : 'Error Deleting Documents',
        description : getErrorMsg(err),
        status      : 'error'
      };
      console.error(err);
    } finally {
      // Display success/error message
      toast({ ...toastArgs, duration: 3000, isClosable: true });
    }
  };

  /**
   * Download a File from the /api/files endpoint given its FileRef ObjectID
   * Essentially just a wrapper for the utility function handleDownload given
   * inputs id and fileName with known/constant URL (filesApi); also displays
   * success/error toasts.
   * 
   * @param {*} id 
   * @param {*} filename 
   */
  const handleDownloadFile = async (id, fileName) => {
    let toastArgs = {};
    try {
      // Attempt async file download
      await handleDownload(`${filesApi}/download/${id}`, fileName);
      // Init success toast
      toastArgs = {
        title       : 'File Downloaded',
        description : `Successfully downloaded File \"${fileName}\"`,
        status      : 'success'
      };
    } catch (err) {
      // Init error toast
      toastArgs = {
        title       : 'Error Downloading File',
        description : getErrorMsg(err),
        status      : 'error'
      };
      console.error(err);
    }
    // Display success/error message
    toast({ ...toastArgs, duration: 3000, isClosable: true });
  };

  /**
   * 
   */
  const handleClickCreateDoc = () => {
    handleOpen(
      <Text>Create New Document</Text>,
      <CreateDocForm onUpdate={onUpdate} />
    );
  };

  /**
   * 
   * @param {*} doc 
   * @returns 
   */
  const handleClickEditDoc = (doc) => {
    if (doc) {
      handleOpen(
        <Text>Edit {doc.name}</Text>,
        <EditDocForm doc={doc} onUpdate={onUpdate} />
      );
    } else {
      toast({
        title       : 'Error Editing Document',
        description : 'No Document selected for editing.',
        status      : 'error',
        duration    : 3000,
        isClosable  : true
      });
    }
  };

  // Return presentational component with injected controller elements
  return (
    <DocsPageUI
      isOpen={isOpen}
      handleClose={handleClose}
      drawerContent={drawerContent}
      fetched={fetched}
      loading={loading}
      bulkMode={bulkMode}
      enableBulkMode={enableBulkMode}
      disableBulkMode={disableBulkMode}
      toggleBulkSelect={toggleBulkSelect}
      handleBulkDeleteDocs={handleBulkDeleteDocs}
      handleDeleteDoc={handleDeleteDoc}
      handleClickEditDoc={handleClickEditDoc}
      handleClickCreateDoc={handleClickCreateDoc}
      handleDownloadFile={handleDownloadFile}
    />
  );
};

export default DocsPage;