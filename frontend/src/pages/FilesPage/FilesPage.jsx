import { useEffect } from 'react';
import { useToast, Text } from '@chakra-ui/react';

import FilesPageUI from './FilesPageUI';
import UploadForm from './UploadForm.jsx';

import useBulkMode from '../../hooks/useBulkMode.js';
import useDrawer from '../../hooks/useDrawer.js';
import useFetch from '../../hooks/useFetch.js';

import { getErrorMsg, handleDeleteSingle, handleDownload } from '../../util/util.js';

// TODO: move to centralized location 
const baseUrl   = 'http://localhost:5000';
const filesApi  = `${baseUrl}/api/files`;
const infoApi   = `${baseUrl}/api/info`;
const toolTipApi = `${infoApi}/tool-tips`; // TODO: implement

/**
 * 
 * @returns 
 */
const FilesPage = () => {
  
  const toast = useToast();

  const { drawerContent, isOpen, handleOpen, handleClose } = useDrawer();

  const {
    bulkMode,
    enableBulkMode,
    disableBulkMode,
    toggleBulkSelect,
    handleBulkDelete
  } = useBulkMode();

  const { loading, fetched, handleFetch } = useFetch({
    initLoading: { files: false, allowedFileExt: false, toolTips: false },
    initFetched: { files: [], allowedFileExt: [], toolTips: {} }
  });

  useEffect(() => {
    handleFetch(filesApi, 'files');
    // TODO: fetch tool tips
    //handleFetch(`${toolTipApi}/FilePage`, 'toolTips');
  }, [])

  /**
   * 
   */
  const onUpdate = async () => {
    // Refresh Files after upload
    await handleFetch(filesApi, 'files');
    // Close the drawer after upload finishes
    handleClose();
  }

  /**
   * 
   * @param {*} file 
   */
  const handleDeleteFile = async (file) => {
    let toastArgs = {};
    if (file.documents?.length > 0) {
      toastArgs = {
        title       : 'Error Deleting File',
        description : `Failed to delete File \"${file.name}\": attached to ${file.documents.length} Documents.`,
        status      : 'error'
      };
    } else {
      try {
        // Delete the File, save a copy of its data
        const deletedFile = await handleDeleteSingle(`${filesApi}/${file._id}`);
        // Get the updated list of Files
        await handleFetch(filesApi, 'files');
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
      } finally {
        toast({ ...toastArgs, duration: 3000, isClosable: true });
      }
    }
  };

  /**
   * 
   */
  const handleBulkDeleteFiles = async () => {
    let toastArgs = {};
    try {
      const deletedFiles      = await handleBulkDelete(filesApi);
      const deletedFileNames  = deletedFiles.map(file => file.name).join(', ');
      toastArgs = {
        title       : `Deleted ${deletedFiles.length} Files`,
        description : `Successfully deleted Files: ${deletedFileNames}`,
        status      : 'success'
      };
      // Refresh Files
    } catch (err) {
      toastArgs = {
        title       : 'Error Deleting Files',
        description : getErrorMsg(err),
        status      : 'error'
      };
      console.error(err);
    } finally {
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
   * Open the drawer and render the UploadForm
   */
  const handleClickUpload = async () => {
    handleOpen(
      <Text>Upload New File</Text>,
      <UploadForm onUpdate={onUpdate} />
    );
  };

  // Return presentational component with injected controller elements
  return (
    <FilesPageUI
      isOpen={isOpen}
      handleClose={handleClose}
      drawerContent={drawerContent}
      fetched={fetched}
      loading={loading}
      bulkMode={bulkMode}
      enableBulkMode={enableBulkMode}
      disableBulkMode={disableBulkMode}
      toggleBulkSelect={toggleBulkSelect}
      handleBulkDeleteFiles={handleBulkDeleteFiles}
      handleDeleteFile={handleDeleteFile}
      handleDownloadFile={handleDownloadFile}
      handleClickUpload={handleClickUpload}
    />
  );
};

export default FilesPage;