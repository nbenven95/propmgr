import { useEffect } from 'react';
import { Text } from '@chakra-ui/react';

import DocsPageUI from './DocsPageUI';
import CreateDocForm from './CreateDocForm';
import EditDocForm from './EditDocForm';

import useBulkMode from '../../hooks/useBulkMode';
import useDrawer from '../../hooks/useDrawer';
import useNotify from '../../hooks/useNotify';
import useFetch from '../../hooks/useFetch';
import { getErrorMsg, plural, onDeleteSingle, onDownload } from '../../util/util';

// TODO: move to centralized location 
const baseUrl     = 'http://localhost:5000/api';
const filesApi    = `${baseUrl}/files`;
const docsApi     = `${baseUrl}/docs`;

const DocsPage = () => {

  //const toast = useToast();
  const notify = useNotify();

  const { drawerContent, isOpen, onDrawerOpen, onDrawerClose, DrawerMenu } = useDrawer();

  const { bulkMode, onBulkModeToggle, onBulkSelectToggle, onBulkDelete } = useBulkMode();

  const { loading, fetched, onFetchMany } = useFetch([
    { docs: { init: [], url: docsApi } }
  ]);

  /**
   * 
   * @param {Array} resources 
   */
  const handleFetch = async (resources) => {
    // TODO: is there a way to get the names of resources that failed to fetch?
    const errs = await onFetchMany(resources);
    // On failure to fetch, log to console
    if (errs.length > 0) {
      const numErrors = errs.length;
      console.error(
        `Failed to fetch (${numErrors}) ${plural('resource', numErrors)}: ${errs.join(', ')}`
      );
    }
  };
  
  /* Handle side effects */

  // Fetch resources (no dependencies; only called on initial page render)
  useEffect(() => {
    handleFetch(['docs']);
  }, []);

  /**
   * 
   * @param {*} doc 
   */
  const handleDelete = async (doc) => {
    try {
      const { name, _id } = doc;
      // Try to delete the Document, notify user on success
      await onDeleteSingle(`${docsApi}/${_id}`);
      notify({
        status: 'success',
        title: 'Document Deleted',
        desc: `Successfully deleted Document \"${name}\"`
      });
    } catch (err) {
      // Notify user if delete fails
      notify({
        status: 'error',
        title: `Error Deleting Document \"${name}\"`,
        desc: getErrorMsg(err)
      });
    }
    // Refresh fetched Documents on successful delete
    await handleFetch(['docs']);
  };

  /**
   * Handle deleting all Documents selected for bulk delete.
   */
  const handleBulkDelete = async () => {
    try {
      // Attempt bulk delete
      const res = await onBulkDelete(docsApi);
      const numDel = res.data.length;
      const label = plural('Document', numDel);
      notify({
        status: 'success',
        title: `${label} Deleted`,
        desc: `Successfully deleted (${numDel}) ${label}`
      });
    } catch (err) {
      notify({
        status: 'error',
        title: 'Error Deleting Documents',
        desc: getErrorMsg(err)
      });
    }
    // Refresh fetched Documents on successful bulk delete
    await handleFetch(['docs']);
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
    try {
      // Attempt File download, notify user on success
      await onDownload(`${filesApi}/download/${id}`, fileName);
      notify({
        status: 'success',
        title: 'File Downloaded',
        desc: `Successfully downloaded File \"${fileName}\"`
      });
    } catch (err) {
      // Notify user of failed download
      notify({
        status: 'error',
        title: 'Error Downloading File',
        desc: getErrorMsg(err)
      });
    }
  };

  /* Handle opening drawer and rendering CreateDocForm */
  const handleOpenCreateForm = () => {
    onDrawerOpen(
      <Text>Create New Document</Text>,
      <CreateDocForm onUpdate={() => {
        handleFetch(['docs']);
        onDrawerClose();
      }} />
    );
  };

  /* Handle opening drawer and rendering EditDocForm */
  const handleOpenEditForm = (doc) => {
    onDrawerOpen(
      <Text>Edit {doc?.name?? 'Document'}</Text>,
      <EditDocForm doc={doc} onUpdate={() => {
        handleFetch(['docs']);
        onDrawerClose();
      }} />
    );
  };

  // Return presentational component with injected controller elements
  return (
    <DocsPageUI
      loading={loading}
      fetched={fetched}
      
      drawerMenu={<DrawerMenu />}

      onClickEdit={handleOpenEditForm}
      onClickCreate={handleOpenCreateForm}
      onClickDelete={handleDelete}
      onClickDownload={handleDownload}

      bulkMode={bulkMode}
      onBulkDelete={handleBulkDelete} // Custom bulk delete handler
      onBulkModeToggle={onBulkModeToggle}
      onBulkSelectToggle={onBulkSelectToggle}
    />
  );
};

export default DocsPage;