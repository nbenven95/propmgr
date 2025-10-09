import { useEffect } from 'react';
import { Text } from '@chakra-ui/react';
import axios from 'axios';

import FilesPageUI from './FilesPageUI';
import UploadForm from './UploadForm';

import useBulkOp from '../../hooks/useBulkOp';
import useDrawer from '../../hooks/useDrawer';
import useNotify from '../../hooks/useNotify';
import useFetch from '../../hooks/useFetch';
import { getErrorMsg, plural, onDownload } from '../../util/util';

import EndpointEnum from '../../util/EndpointEnum.js';

const { FILES_API } = EndpointEnum;

const FilesPage = () => {

  const notify = useNotify();

  const { onDrawerOpen, onDrawerClose, DrawerMenu } = useDrawer();

  const { loading, isFetching, fetched, onFetchMany, LoadingIndicator } = useFetch([
    { files: { init: [], url: FILES_API } }
  ]); 

  const { onBulkOp, bulkOpEnabled, BulkSelector, BulkController } = useBulkOp({
    name: 'Delete',
    fn: async (id) => axios.delete(`${FILES_API}/${id}`)
  });

  // TODO: get names of specific resources that failed to fetch?
  const handleFetch = async (resources) => {
    const errs = await onFetchMany(resources);
    // On failure to fetch, log to console
    if (errs.length > 0) {
      const numErrors = errs.length;
      const label = plural('resource', numErrors);
      console.error(`Failed to fetch (${numErrors}) ${label}: ${errs.join(', ')}`);
    }
  };

  // TODO: use this as fn for useBulkOp, deprecate handleBulkDelete, pass onBulkOp to BulkController instead?
  const handleDelete = async (id) => {
    if (!id) throw new Error(`Invalid ObjectID \"${id}\"`);
    if (fetched.files?.length === 0) return;

    // Try to find a fetched File with ObjectID matching argument `id`
    const file = fetched.files.find(file => file._id === id);
    // Handle non-operational (unexpected) error
    if (!file) {
      // Log detailed error to console
      console.error(`Could not locate File with ObjectID \"${id}\"`);
      // Notify user with a generic error
      notify({
        status: 'error',
        title: 'Error deleting File',
        desc: 'Encountered an unexpected error'
      });
      return;
    }

    const { name, documents, _id } = file;

    // Try to delete the File, notify user of success/failure
    try {
      // Handle operational (expected) error: user attempts to delete File linked to Document(s)
      const numLinked = documents?.length?? 0;
      if (numLinked > 0) {
        const label = plural('Document', numLinked);
        // Notify user with a detailed error
        throw new Error(`File \"${name}\" has (${numLinked}) linked ${label}`);
      }
      await axios.delete(`${FILES_API}/${_id}`);
      notify({
        status: 'success',
        title: 'File Deleted',
        desc: `Successfully deleted File \"${name}\"`
      });
    } catch (err) {
      notify({
        status: 'error',
        title: `Error Deleting File \"${name}\"`,
        desc: getErrorMsg(err)
      });
    }

    // Refresh fetched Files
    await handleFetch(['files']);
  };

  const handleBulkDelete = async () => {
    // Try bulk deleting Files, notify user of success/failure
    // TODO: refactor onBulkOp to handle cases where some requests succeed and some fail
    try {
      const res = await onBulkOp();
      const label = plural('File', res.length);
      notify({
        status: 'success',
        title: `${label} Deleted`,
        desc: `Successfully deleted (${res.length}) ${label}`
      });
    } catch (err) {
      notify({
        status: 'error',
        title: 'Error Deleting Files',
        desc: getErrorMsg(err)
      });
    }

    // Refresh fetched Files
    await handleFetch(['files']);
  };

  const handleDownload = async (id, fileName) => {
    // Try to download the file, notify the user on success/failure
    try {
      await onDownload(`${FILES_API}/download/${id}`, fileName);
      notify({
        status: 'success',
        title: 'File Downloaded',
        desc: `Successfully downloaded File \"${fileName}\"`
      });
    } catch (err) {
      notify({
        status: 'error',
        title: 'Error Downloading File',
        desc: getErrorMsg(err)
      });
    }
  };

  const handleOpenForm = () => {
    onDrawerOpen(
      <Text>Upload New File</Text>,
      <UploadForm onUpdate={() => {
        // Initiate fetch, don't await
        handleFetch(['files']);
        // Close drawer immediately so resource loading indicator displays
        onDrawerClose();
      }} />
    );
  };

  // Handle side effects of initial page render
  useEffect(() => {
    handleFetch(['files']);
  }, []);

  // Return presentational component with injected controller elements
  return (
    <FilesPageUI
      //loading={loading}
      fetched={fetched}
      isFetching={isFetching}
      LoadingIndicator={LoadingIndicator}
      onClickDelete={handleDelete}
      onClickUpload={handleOpenForm}
      onClickDownload={handleDownload}
      DrawerMenu={DrawerMenu}
      bulkOpEnabled={bulkOpEnabled}
      BulkSelector={BulkSelector}
      BulkController={<BulkController onBulkOp={handleBulkDelete} />}
    />
  );
};

export default FilesPage;