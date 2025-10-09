import { useEffect } from 'react';
import { Text } from '@chakra-ui/react';
import axios from 'axios';

import DocsPageUI from './DocsPageUI';
import CreateDocForm from './CreateDocForm';
import EditDocForm from './EditDocForm';

import useBulkOp from '../../hooks/useBulkOp';
import useDrawer from '../../hooks/useDrawer';
import useNotify from '../../hooks/useNotify';
import useFetch from '../../hooks/useFetch';
import { getErrorMsg, plural, onDownload } from '../../util/util';

import EndpointEnum from '../../util/EndpointEnum';

const { DOCS_API, FILES_API } = EndpointEnum;

const DocsPage = () => {

  const notify = useNotify();

  const { onDrawerOpen, onDrawerClose, DrawerMenu } = useDrawer();

  const { loading, isFetching, fetched, onFetchMany, LoadingIndicator } = useFetch([
    { docs: { init: [], url: DOCS_API } }
  ]);

  const { onBulkOp, bulkOpEnabled, BulkSelector, BulkController } = useBulkOp({
    name: 'Delete',
    fn: async (id) => axios.delete(`${DOCS_API}/${id}`)
  });

  const handleFetch = async (resources) => {
    const errs = await onFetchMany(resources);
    // On failure to fetch, log to console
    if (errs.length > 0) {
      const numErrors = errs.length;
      const label = plural('resource', numErrors);
      console.error(`Failed to fetch (${numErrors}) ${label}: ${errs.join(', ')}`);
    }
  };

  const handleDelete = async (id) => {
    if (!id) throw new Error(`Invalid ObjectID \"${id}\"`);
    // If no fetched documents, don't bother searching
    if (fetched.docs?.length === 0) return;

    // Try to find a Document with ObjectID matching argument `id`
    const doc = fetched.docs.find(doc => doc._id === id);
    // Handle non-operational (unexpected) error
    if (!doc) {
      // Log detailed error msg to console
      console.error(`Could not locate Document with ObjectID \"${id}\"`);
      // Notify user with a generic error
      notify({
        status: 'error',
        title: 'Error deleting Document',
        desc: 'Encountered an unexpected error'
      });
      return;
    }

    // Try to delete the Document, notify user of success/failure
    const { name, _id } = doc;
    try {
      await axios.delete(`${DOCS_API}/${_id}`);
      notify({
        status: 'success',
        title: 'Document Deleted',
        desc: `Successfully deleted Document \"${name}\"`
      });
    } catch (err) {
      notify({
        status: 'error',
        title: `Error deleting Document \"${name}\"`,
        desc: getErrorMsg(err)
      });
    }

    // Refresh fetched Documents
    await handleFetch(['docs']);
  };

  const handleBulkDelete = async () => {
    // Try bulk deleting Documents, notify user of success/failure
    // TODO: refactor onBulkOp to handle cases where some requests succeed and some fail
    try {
      const res = await onBulkOp();
      const label = plural('Document', res.length);
      notify({
        status: 'success',
        title: `${label} Deleted`,
        desc: `Successfully deleted (${res.length}) ${label}`
      });
    } catch (err) {
      notify({
        status: 'error',
        title: 'Error Deleting Documents',
        desc: getErrorMsg(err)
      });
    }

    // Refresh fetched Documents
    await handleFetch(['docs']);
  };

  // TODO: refactor onDownload into a hook; just pass this as an anon func prop
  const handleDownload = async (id, fileName) => {
    // Try to download the file, notify user of success/failure
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

  const handleOpenCreateForm = () => {
    onDrawerOpen(
      <Text>Create New Document</Text>,
      <CreateDocForm onUpdate={() => {
        // Initiate fetch, don't await
        handleFetch(['docs']);
        // Close drawer immediately so resource loading indicator displays
        onDrawerClose();
      }} />
    );
  };

  const handleOpenEditForm = (doc) => {
    onDrawerOpen(
      <Text>Edit {doc?.name?? 'Document'}</Text>,
      <EditDocForm doc={doc} onUpdate={() => {
        handleFetch(['docs']);
        onDrawerClose();
      }} />
    );
  };

  // Handle side effects of initial page render
  useEffect(() => {
    handleFetch(['docs']);
  }, []);

  // Return presentational component with injected controller elements
  return (
    <DocsPageUI
      //loading={loading}
      fetched={fetched}
      isFetching={isFetching}
      LoadingIndicator={LoadingIndicator}

      DrawerMenu={DrawerMenu}
      onClickEdit={handleOpenEditForm}
      onClickCreate={handleOpenCreateForm}
      onClickDelete={handleDelete}
      onClickDownload={handleDownload}

      bulkOpEnabled={bulkOpEnabled}
      BulkSelector={BulkSelector}
      BulkController={<BulkController onBulkOp={handleBulkDelete} />}
    />
  );
};

export default DocsPage;