import axios from 'axios';
import { useEffect } from 'react';
import { Text } from '@chakra-ui/react';

import PropertyProfilesPageUI from './PropertyProfilesPageUI';
import CreatePropertyProfileForm from './CreatePropertyProfileForm';
import EditPropertyProfileForm from './EditPropertyProfileForm';

import useBulkMode from '../../hooks/useBulkMode';
import useBulkOp from '../../hooks/useBulkOp';
import useDrawer from '../../hooks/useDrawer';
import useNotify from '../../hooks/useNotify';
import useFetch from '../../hooks/useFetch';
import { getErrorMsg, plural, onDeleteSingle } from '../../util/util';

import EndpointEnum from '../../util/EndpointEnum.js';

const { PROPERTIES_API } = EndpointEnum; // TODO: add POLICIES_API, OPSYS_API, SUBUNITS_API 

const PropertyProfilesPage = () => {
  const notify = useNotify();

  //const { bulkMode, onBulkModeToggle, onBulkSelectToggle, onBulkDelete } = useBulkMode(); // TODO: deprecate

  const { onBulkOp, BulkSelector, BulkController } = useBulkOp({
    name: 'Delete',
    fn: async (id) => axios.delete(`${PROPERTIES_API}/${id}`) // TODO: replace with onDeleteSingle after testing (need to account for different output format)
  });

  const { onDrawerOpen, onDrawerClose, DrawerMenu } = useDrawer();

  const { loading, fetched, onFetchMany } = useFetch([
    { properties: { init: [], url: PROPERTIES_API } }
  ]);

  /**
   * 
   * @param {Array} resources 
   */
  const handleFetch = async (resources) => {
    const errs = await onFetchMany(resources);
    // On failure to fetch, log to console
    if (errs.length > 0) {
      const numErrors = errs.length;
      console.error(
        `Failed to fetch (${numErrors}) ${plural('resource', numErrors)}: ${errs.join(', ')}`
      );
    }
  };

  // Fetch resources from database during initial render
  useEffect(() => {
    handleFetch(['properties']);
    // TODO: fetch subunits, opsys, policies, docs?
  }, []);

  /**
   * 
   * @param {*} property
   */
  const handleDelete = async (property) => {
    try {
      const { name, _id } = property;
      // Try to delete the PropertyProfile, notify user on success
      await onDeleteSingle(`${PROPERTIES_API}/${_id}`);
      notify({
        status: 'success',
        title: 'Property Profile Deleted',
        desc: `Successfully deleted Property Profile \"${name}\"`
      });
    } catch (err) {
      // Notify user if delete fails
      notify({
        status: 'error',
        title: `Error Deleting Property Profile \"${name}\"`,
        desc: getErrorMsg(err)
      });
    }
    // Refresh fetched PropertyProfiles on successful delete
    await handleFetch(['properties']);
  };

  const handleBulkDelete = async () => {
    try {
      // Try bulk delete
      //const res = await onBulkDelete(propertiesApi);
      const res     = await onBulkOp();
      const numDel  = res.data.length;
      const label   = plural('Property Profile', numDel);
      notify({
        status: 'success',
        title: `${label} Deleted`,
        desc: `Successfully deleted (${numDel}) ${label}`
      });
    } catch (err) {
      notify({
        status: 'error',
        title: 'Error Deleting Property Profiles',
        desc: getErrorMsg(err)
      });
    }
    // Refresh fetch Property Profiles on successful bulk delete
    await handleFetch(['properties']);
  };

  const handleOpenCreateForm = () => {
    onDrawerOpen(
      <Text>Create New Property Profile</Text>,
      <></> // TODO: render CreatePropertyProfileForm
    )
  };

  const handleOpenEditForm = (property) => {
    onDrawerOpen(
      <Text>Edit {property?.name?? 'Property Profile'}</Text>,
      <></> // TODO: render EditPropertyProfileForm
    )
  };

  return (
    <PropertyProfilesPageUI
      loading={loading}
      fetched={fetched}

      onClickEdit={handleOpenEditForm}
      onClickCreate={handleOpenCreateForm}
      onClickDelete={handleDelete}

      DrawerMenu={DrawerMenu}
      BulkSelector={BulkSelector}
      BulkController={<BulkController onBulkOp={handleBulkDelete} />}
    />
  );
};

export default PropertyProfilesPage;