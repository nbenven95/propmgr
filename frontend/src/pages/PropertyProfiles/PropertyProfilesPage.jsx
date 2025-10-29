import { useEffect } from 'react';
import { Text } from '@chakra-ui/react';
import axios from 'axios';

import PropertyProfilesPageUI from './PropertyProfilesPageUI';
import CreatePropertyProfileForm from './CreatePropertyProfileForm';
import EditPropertyProfileForm from './EditPropertyProfileForm';

import useBulkOp from '../../hooks/useBulkOp';
import useDrawer from '../../hooks/useDrawer';
import useNotify from '../../hooks/useNotify';
import useFetch from '../../hooks/useFetch';
import { getErrorMsg, plural } from '../../util/util'; // TODO: rename to 'helpers'

import EndpointEnum from '../../util/EndpointEnum.js';

const { PROPERTIES_API } = EndpointEnum; // TODO: add POLICIES_API, OPSYS_API, SUBUNITS_API 

const PropertyProfilesPage = () => {
  /* Init hooks */
  const notify = useNotify();

  const { onBulkOp, BulkSelector, BulkController } = useBulkOp({
    name: 'Delete',
    fn: async (id) => axios.delete(`${PROPERTIES_API}/${id}`)
  });

  const { onDrawerOpen, onDrawerClose, DrawerMenu } = useDrawer();

  const { loading, fetched, onFetchMany } = useFetch([
    { properties: { init: [], url: PROPERTIES_API } }
  ]);

  /**
   * 
   * @param {*} resources 
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
    // TODO: fix edge case where deleting last property profile results in a 404 that prevents the page from updating properly
    handleFetch(['properties']);
    // TODO: fetch subunits, opsys, policies, docs?
  }, []);

  /**
   * 
   * @param {*} property
   */
  const handleDelete = async (property) => {
    try {
      // Try to delete the PropertyProfile, notify user on success
      const { name, _id } = property;
      await axios.delete(`${PROPERTIES_API}/${_id}`);
      notify({
        status: 'success',
        title: 'Property Profile Deleted',
        desc: `Successfully deleted Property Profile \"${name}\"`
      });
    } catch (err) {
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
      const res     = await onBulkOp();
      const numDel  = res.data.length?? 0;
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
      <CreatePropertyProfileForm
        onUpdate={() => {
          // Inititate fetch, don't await
          handleFetch('properties');
          // Close drawer immediately so resource loading indicator displays
          onDrawerClose();
        }}
      />
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