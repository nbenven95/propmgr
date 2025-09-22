import { useEffect } from 'react';
import { Text } from '@chakra-ui/react';

import FilesPageUI from './FilesPageUI';
import UploadForm from './UploadForm';

import useBulkMode from '../../hooks/useBulkMode';
import useDrawer from '../../hooks/useDrawer';
import useNotify from '../../hooks/useNotify';
import useFetch from '../../hooks/useFetch';
import { getErrorMsg, plural, onDeleteSingle, onDownload } from '../../util/util';

// TODO: move to centralized location 
const baseUrl   = 'http://localhost:5000';
const filesApi  = `${baseUrl}/api/files`;

/**
 * 
 * @returns 
 */
const FilesPage = () => {

  /* Init hooks */
  
  const { bulkMode, onBulkModeToggle, onBulkSelectToggle, onBulkDelete } = useBulkMode();
  
  const { onDrawerOpen, onDrawerClose, DrawerMenu } = useDrawer();

  const { loading, fetched, onFetchMany } = useFetch([
    { files: { init: [], url: filesApi } }
  ]); 

  const notify = useNotify();

  /**
   * 
   * @param {Array} resrcs
   */
  const handleFetch = async (resrcs) => {
    // TODO: is there a way to get the names of resources that failed to fetch?
    const errs = await onFetchMany(resrcs);
    // On failure to fetch, log to console
    if (errs.length > 0) {
      const numErrors = errs.length;
      const msg = `Failed to fetch (${numErrors}) ${plural('resource', numErrors)}: ${errs.join(', ')}`;
      console.error(msg);
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
    const { name, documents, _id } = file;
    const numLinked = documents?.length?? 0;
    try {
      // Check if the File has any attached Documents before attempting delete
      if (numLinked > 0) {
        const msg = `File \"${name}\" has (${numLinked}) linked ${plural('Document', numLinked)}`;
        throw new Error(msg);
      }
      // Try to delete the File, notify user on success
      await onDeleteSingle(`${filesApi}/${_id}`);
      notify({
        status: 'success',
        title: 'File Deleted',
        desc: `Successfully deleted File \"${name}\"`
      });
    } catch (err) {
      // Notify user if delete fails
      notify({
        status: 'error',
        title: `Error Deleting File \"${name}\"`,
        desc: getErrorMsg(err)
      });
    }
    // Refresh fetched Files on successful delete (handle errors separately)
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
        title: `${plural('File', numDeleted)} Deleted`,
        desc: `Successfully deleted (${numDeleted}) ${plural('File', numDeleted)}`
      });
    } catch (err) {
      // Notify user if bulk delete fails
      notify({ status: 'error', title: 'Error Deleting Files', desc: getErrorMsg(err) });
    }
    // Refresh fetched Files on successful bulk delete
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
      // Notify user of failed download
      notify({
        status: 'error',
        title: 'Error Downloading File',
        desc: getErrorMsg(err)
      });
    }
  };

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
        onDrawerClose(); // Close the form immediately after initiating the fetch
      }} />
    );
  };

  // Return presentational component with injected controller elements
  return (
    <FilesPageUI
      loading={loading}
      fetched={fetched}

      drawerMenu={<DrawerMenu />}

      onClickDelete={handleDelete}
      onClickUpload={handleOpenForm}
      onClickDownload={handleDownload}

      // TODO: refactor useBulkMode
      bulkMode={bulkMode}
      onBulkDelete={handleBulkDelete} // Custom bulk delete handler
      onBulkModeToggle={onBulkModeToggle}
      onBulkSelectToggle={onBulkSelectToggle}
    />
  );
};

export default FilesPage;