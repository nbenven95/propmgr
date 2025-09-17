import { useEffect } from 'react';
import { useToast, Text } from '@chakra-ui/react';

import FilesPageUI from './FilesPageUI';
import UploadForm from './UploadForm';

import useBulkMode from '../../hooks/useBulkMode';
import useDrawer from '../../hooks/useDrawer';
import useFetch from '../../hooks/useFetch';
import { getErrorMsg, onDeleteSingle, onDownload } from '../../util/util';

// TODO: move to centralized location 
const baseUrl   = 'http://localhost:5000';
const filesApi  = `${baseUrl}/api/files`;
const infoApi   = `${baseUrl}/api/info`;
const toolTipApi = `${infoApi}/tool-tips`;

/**
 * 
 * @returns 
 */
const FilesPage = () => {
  
  const toast = useToast();

  const { drawerContent, isOpen, onDrawerOpen, onDrawerClose } = useDrawer();

  const { bulkMode, onBulkModeToggle, onBulkSelectToggle, onBulkDelete } = useBulkMode();

  const { loading, fetched, onFetch } = useFetch({
    initLoading: { toolTips: false, files: false},
    initFetched: { toolTips: {}, files: [] },
    endpoints  : { toolTips: toolTipApi, files: filesApi }
  });

  // Handle side-effects
  useEffect(() => {
    /* Workaround to let us indirectly await async in useEffect */
    const handleFetch = async () => {
      // Array of fetch promises
      const promises = [onFetch('toolTips'), onFetch('files')];
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

  /**
   * 
   * @param {*} file 
   */
  const handleDelete = async (file) => {
    let toastArgs = {};
    if (file.documents?.length > 0) {
      toastArgs = {
        title       : 'Error Deleting File',
        status      : 'error',
        description : `Failed to delete File \"${file.name}\": attached to (${file.documents.length}) Document${file.documents.length > 1 ? 's' : ''}.`
      };
    } else {
      try {
        // Delete the File, save a copy of its data
        const deletedFile = await onDeleteSingle(`${filesApi}/${file._id}`);
        // Refresh Files
        await onFetch('files');
        toastArgs = {
          title       : 'Deleted File',
          description : `Successfully deleted File \"${deletedFile.name}\"`,
          status      : 'success'
        };
      } catch (err) {
        toastArgs = {
          title       : 'Error Deleting File',
          description : getErrorMsg(err),
          status      : 'error'
        };
        console.error(err);
      }
    }
    toast({ ...toastArgs, duration: 3000, isClosable: true });
  };

  /**
   * 
   */
  const handleBulkDelete = async () => {
    let toastArgs = {};
    try {
      // Attempt bulk delete
      const deletedFiles      = await onBulkDelete(filesApi);
      const deletedFileNames  = deletedFiles.map(file => file.name).join(', ');
      toastArgs = {
        title       : `Deleted ${deletedFiles.length} Files`,
        description : `Successfully deleted Files: ${deletedFileNames}`,
        status      : 'success'
      };
      // Refresh Files
      await onFetch('files');
    } catch (err) {
      // Init error toast
      toastArgs = {
        title       : 'Error Deleting Files',
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
      console.error(err);
    }
    // Display success/error message
    toast({ ...toastArgs, duration: 3000, isClosable: true });
  };

  /* Handle refreshing fetched Files after they are uploaded or deleted */
  const handleRefresh = async () => {
    // Refresh Files after upload
    await onFetch('files');
    // Close drawer on success
    onDrawerClose();
  }

  /* Handle opening the drawer and rendering UploadForm */
  const handleOpenForm = () => {
    onDrawerOpen(
      <Text>Upload New File</Text>,
      <UploadForm onUpdate={handleRefresh} />
    );
  };

  /* Handle closing drawer that is displaying UploadForm */
  const handleCloseForm = () => onDrawerClose();

  const handleToggleBulkMode = () => onBulkModeToggle();
  const handleToggleBulkSelect = () => onBulkSelectToggle();

  // Return presentational component with injected controller elements
  return (
    <FilesPageUI
      isOpen={isOpen}
      loading={loading}

      fetched={fetched}
      drawerContent={drawerContent}

      onCloseForm={handleCloseForm}

      onClickDownload={handleDownload}
      onClickDelete={handleDelete}
      onClickUpload={handleOpenForm}
      
      bulkMode={bulkMode}
      onBulkDelete={handleBulkDelete}
      onBulkModeToggle={handleToggleBulkMode}
      onBulkSelectToggle={handleToggleBulkSelect}
    />
  );
};

export default FilesPage;