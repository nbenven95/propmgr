import { useEffect } from 'react';
import { useToast, Text } from '@chakra-ui/react';

import DocsPageUI from './DocsPageUI';
import CreateDocForm from './CreateDocForm';
import EditDocForm from './EditDocForm';

import useBulkMode from '../../hooks/useBulkMode';
import useDrawer from '../../hooks/useDrawer';
import useFetch from '../../hooks/useFetch';
import { getErrorMsg, onDeleteSingle, onDownload } from '../../util/util';

// TODO: move to centralized location 
const baseUrl     = 'http://localhost:5000';
const filesApi    = `${baseUrl}/api/files`;
const docsApi     = `${baseUrl}/api/docs`;
const infoApi     = `${baseUrl}/api/info`;
const toolTipApi  = `${infoApi}/tool-tips`;

const DocsPage = () => {

  const toast = useToast();

  const { drawerContent, isOpen, onDrawerOpen, onDrawerClose } = useDrawer();

  const { bulkMode, onBulkModeToggle, onBulkSelectToggle, onBulkDelete } = useBulkMode();

  const { loading, fetched, onFetch } = useFetch({
    initLoading: { toolTips: false, docs: false },
    initFetched: { toolTips: {}, docs: [] },
    endpoints: { toolTips: toolTipApi, docs: docsApi }
  });
  
  // Handle side-effects
  useEffect(() => {
    /* Workaround to let us indirectly await async in useEffect */
    const handleFetch = async () => {
      // Array of fetch promises
      const promises = [onFetch('toolTips'), onFetch('docs')];
      // Execute all promises in parallel until all are settled
      const results = await Promise.allSettled(promises);
      // Get a list of errors for any resources that failed to fetch
      const errs = results.filter(r => r.status === 'rejected').map(r => r.reason);
      // Notify user of any resources that failed to fetch
      const numErrs = errs.length;
      if (numErrs > 0) {
        const msg = `Failed to fetch (${numErrs}) resource${numErrs > 1 ? 's' : ''}: ${errs.join(', ')}`;
        console.error(msg);
      }
    };
    handleFetch();
  }, []); // No dependencies; only called on initial page render

  /* Handle refreshing fetched Documents after one is created, edited, or deleted */
  const handleRefresh = async () => {
    await onFetch('docs');
    if (isOpen) onDrawerClose(); // Close the drawer if the Create/EditDocForm is open
  };

  /**
   * 
   * @param {*} id 
   */
  const handleDelete = async (id) => {
    let toastArgs = {};
    try {
      // Attempt to delete the document given its ObjectID
      const doc = await onDeleteSingle(`${docsApi}/${id}`);
      // Init success toast
      toastArgs = {
        title       : 'Document Deleted',
        description : `Successfully deleted Document \"${doc?.name?? id}\"`,
        status      : 'success'
      };
      // Refresh fetched Documents
      await handleRefresh();
    } catch (err) {
      // Init error toast
      toastArgs = {
        title       : 'Error Deleting Document',
        description : getErrorMsg(err),
        status      : 'error'
      };
    }
    // Display success/error message
    toast({ ...toastArgs, duration: 3000, isClosable: true });
  };

  /**
   * Handle deleting all Documents selected for bulk delete.
   */
  const handleBulkDelete = async () => {
    let toastArgs = {};
    try {
      // Attempt bulk delete
      const deletedDocs     = await onBulkDelete(docsApi);
      const deletedDocNames = deletedDocs.map(doc => doc.name).join(', ');
      // Init success toast
      toastArgs = {
        title       : `Deleted ${deletedDocs.length} Documents`,
        description : `Successfully deleted Documents: ${deletedDocNames}`,
        status      : 'success'
      };
      // Refresh fetched Documents
      await handleFetch();
    } catch (err) {
      // Init error toast
      toastArgs = {
        title       : 'Error Deleting Documents',
        description : getErrorMsg(err),
        status      : 'error'
      };
    }
    // Display success/error message
    toast({ ...toastArgs, duration: 3000, isClosable: true });
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
  const handleDownload = async (id, fileName) => {
    let toastArgs = {};
    try {
      // Attempt async file download
      await onDownload(`${filesApi}/download/${id}`, fileName);
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
    }
    // Display success/error message
    toast({ ...toastArgs, duration: 3000, isClosable: true });
  };

  /* Handle opening drawer and rendering CreateDocForm */
  const handleOpenCreateForm = () => {
    onDrawerOpen(
      <Text>Create New Document</Text>,
      <CreateDocForm onUpdate={handleRefresh} />
    );
  };

  /* Handle opening drawer and rendering EditDocForm */
  const handleOpenEditForm = (doc) => {
    onDrawerOpen(
      <Text>Edit {doc.name}</Text>,
      <EditDocForm doc={doc} onUpdate={handleRefresh} />
    );
  };

  /* Handle closing drawer that is displaying Create/EditForm */
  const handleCloseForm = () => onDrawerClose();

  /* */
  const handleToggleBulkMode = () => onBulkModeToggle();

  /* */
  const handleToggleBulkSelect = (id) => onBulkSelectToggle(id);

  // Return presentational component with injected controller elements
  return (
    <DocsPageUI
      isOpen={isOpen}
      loading={loading}

      fetched={fetched}
      drawerContent={drawerContent}
      
      onCloseForm={handleCloseForm}

      onClickCreate={handleOpenCreateForm}
      onClickEdit={handleOpenEditForm}
      onClickDelete={handleDelete}
      onClickDownload={handleDownload}

      bulkMode={bulkMode}
      onBulkDelete={handleBulkDelete}
      onBulkModeToggle={handleToggleBulkMode}
      onBulkSelectToggle={handleToggleBulkSelect}
    />
  );
};

export default DocsPage;