import { useEffect, useRef } from 'react';
import { Text } from '@chakra-ui/react';

import FilesPageUI from './FilesPageUI';
import UploadForm from './UploadForm';

import useBulkMode from '../../hooks/useBulkMode';
import useDrawer from '../../hooks/useDrawer';
import useNotify from '../../hooks/useNotify';
import useFetch from '../../hooks/useFetch';
import { getErrorMsg, onDeleteSingle, onDownload } from '../../util/util';

// TODO: move to centralized location 
const baseUrl   = 'http://localhost:5000';
const filesApi  = `${baseUrl}/api/files`;

/**
 * 
 * @returns 
 */
const FilesPage = () => {
  /* Init hooks */

  const notify = useNotify();
  
  const { drawerContent, isOpen, onDrawerOpen, onDrawerClose, DrawerMenu } = useDrawer();
  
  const { bulkMode, onBulkModeToggle, onBulkSelectToggle, onBulkDelete } = useBulkMode();
  
  const { loading, fetched, onFetchMany } = useFetch({
    initLoading: { files: false},
    initFetched: { files: [] },
    endpoints  : { files: filesApi }
  });

  /**
   * 
   * @param {Array} resources 
   */
  const handleFetch = async (resources) => {
    // TODO: is there a way to get the names of resources that failed to fetch?
    const errs = await onFetchMany(resources);
    // On failure to fetch, just log to console
    if (errs.length > 0) {
      console.error(`Failed to fetch (${errs.length})`.concat(
        `resource${errs.length > 1 ? 's' : ''}: ${errs.join(', ')}`));
    }
  };

  /* Handle side effects */

  // Fetch resources (no dependencies; only called on initial page render)
  useEffect(() => {
    handleFetch(['files']);
  }, []);

  /**
   * @param {*} file 
   */
  const handleDelete = async (file) => {
    // Check if the File has any attached Documents before attempting delete
    const numDocs = file.documents?.length;
    if (numDocs > 0) {
      notify({
        status: 'error',
        title: 'Error Deleting File',
        desc: `File \"${file.name}\" is attached to (${numDocs}) Document${numDocs > 1 ? 's' : ''}.`
      });
      return;
    }
    try {
      // Try to delete the file, notify user on success
      const deletedFile = await onDeleteSingle(`${filesApi}/${file._id}`);
      notify({
        status: 'success',
        title: 'File Deleted',
        desc: `Successfully deleted File \"${deletedFile.name}\"`
      });
    } catch (err) {
      // Notify user if delete fails
      notify({ status: 'error', title: 'Error Deleting File', desc: getErrorMsg(err) });
    }
    // Refresh fetched files
    await handleFetch(['files']);
  };

  /** */
  const handleBulkDelete = async () => {
    try {
      // Attempt bulk delete
      const deletedFiles = await onBulkDelete(filesApi);
      const numDeleted = deletedFiles.length;
      notify({
        status: 'success',
        title: 'Files Deleted',
        desc: `Successfully deleted (${numDeleted}) File${numDeleted > 1 ? 's' : ''}`
      });
    } catch (err) {
      // Notify user if bulk delete fails
      notify({ status: 'error', title: 'Error Deleting Files', desc: getErrorMsg(err) });
    }
    // Refresh fetched files
    await handleFetch(['files']);
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
      // Notify user if download fails
      notify({ status: 'error', title: 'Error Downloading File', desc: getErrorMsg(err) });
    }
  };

  /* Handle closing UploadForm drawer */
  const handleCloseForm = () => onDrawerClose();

  /* Handle opening the drawer and rendering UploadForm */
  const handleOpenForm = () => {
    onDrawerOpen(
      <Text>Upload New File</Text>,
      <UploadForm onUpdate={() => { // Only need to pass onUpdate if UploadForm is being rendered in Drawer
        /* Note: because handleFetch is async and we are
          calling it without await, the function will start
          the fetch and then immediately close the form without
          waiting for the promise to be fulfilled. This should
          then allow 'Loading Files. . .' to display when the
          drawer closes if the fetch is still ongoing.  */
        handleFetch(['files']);
        handleCloseForm();
      }} />
    );
  };
  
  /* */
  const handleToggleBulkMode = () => onBulkModeToggle();

  /* */
  const handleToggleBulkSelect = (id) => onBulkSelectToggle(id);

  // Return presentational component with injected controller elements
  return (
    <FilesPageUI
      loading={loading}
      fetched={fetched}

      drawerMenu={<DrawerMenu onDrawerClose={handleCloseForm} />}

      onClickDelete={handleDelete}
      onClickUpload={handleOpenForm}
      onClickDownload={handleDownload}

      // Bulk mode state (TODO: refactor)
      bulkMode={bulkMode}
      onBulkDelete={handleBulkDelete}
      onBulkModeToggle={handleToggleBulkMode}
      onBulkSelectToggle={handleToggleBulkSelect}
    />
  );
};

export default FilesPage;