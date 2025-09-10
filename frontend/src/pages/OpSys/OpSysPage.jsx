import axios from 'axios'
import { useState, useEffect } from 'react'
import { useDisclosure, useToast } from '@chakra-ui/react'

import OpSysPageUI from './OpSysPageUI.jsx'
import CreateOpSysForm from './CreateOpSysForm.jsx'
import EditOpSysForm from './EditOpSysForm.jsx'

// TODO: move to centralized location
const baseUrl = 'http://localhost:5000';
const docsApi = `${baseUrl}/api/docs`;
const opSysApi = `${baseUrl}/api/opsys`;
const infoApi = `${baseUrl}/api/info`;
const opSysTypesApi = `${infoApi}/opsys-types`;
const applianceTypesApi = `${infoApi}/appliance-types`;
// TODO: add endpoint for opsys on backend

const OpSysPage = () => {
  /**
   * Drawer open/close state
   */
  const { isOpen, onOpen, onClose } = useDisclosure();
  /**
   * Drawer menu content
   */
  const [drawerContent, setDrawerContent] = useState({
    drawerHeader: '',
    drawerBody: null
  });
  /**
   * Page loading state and setter
   */
  const [loading, setLoading] = useState({
    docs: false,
    opSys: false
  });
  /**
   * State of resources fetched from the database
   */
  const [fetched, setFetched] = useState({
    docs: [],
    opSys: []
  });
  /**
   * Bulk operations state and items selected for bulk operations
   */
  const [bulkMode, setBulkMode] = useState({
    enabled: false,
    selected: []
  });

  /**
   * Helper function for generating chakra-ui success toasts
   * @param {*} title 
   * @param {*} desc 
   */
  const toastSuccess = (title, desc) => {
    toast({ title: title, description: desc, status: 'success', duration: 3000, isClosable: true });
  };

  /**
   * Helper function for generating chakra-ui error toasts
   * @param {*} title 
   * @param {*} desc 
   */
  const toastError = (title, desc) => {
    toast({ title: title, description: desc, status: 'error', duration: 3000, isClosable: true });
  };

  /**
   * 
   * @param {*} resource 
   * @param {*} url 
   * @param {*} setState 
   */
  const fetch = async (resource, url, setState) => {
    try {
      setLoading(loading[resource] = true);
      // On success, update state variable with response data
      const res = await axios.get(url);
      setState(res.data);
      console.log(`Done fetching resource: ${resource}`);
    } catch (err) {
      // API request failed: notify user
      console.error(err);
    } finally {
      // Clean up
      setLoading(loading[resource] = false);
    }
  };

  /**
   * 
   * @param {*} resourceUrl 
   * @param {*} resourceName 
   * @returns 
   */
  const handleDeleteBulk = async (resourceUrl, resourceName) => {
    // Return if no items are selected
    if (bulkMode.selected.length === 0) return;
    try {
      // Collect responses for delete requests into array
      const responses = await Promise.all(
        bulkMode.selected.map(id => axios.delete(`${resourceUrl}/${id}`))
      );
      // Get names of deleted items, display success message
      const deletedItems = responses.map(res => res.data?.data?.name);
      toastSuccess(
        `Deleted ${resourceName}`,
        `Successfully deleted ${resourceName}: ${deletedItems.join(', ')}`
      );
    } catch (err) {
      // Handle bulk delete failure
      console.error(err);
      toastError(`Error deleting ${resourceName}`, err.message);
    }
  };

  /**
   * 
   * @param {*} id 
   * @param {*} resourceUrl 
   * @param {*} resourceName 
   */
  const handleDelete = async (id, resourceUrl, resourceName) => {
    try {
      const res = await axios.delete(`${resourceUrl}/${id}`);
      toastSuccess(
        `Deleted ${resourceName}`,
        `Successfully deleted ${resourceName}: ${res.data?.data?.name}`
      );
    } catch (err) {
      // Handle delete failure
      console.error(err);
      toastError(`Error deleting ${resourceName}`, err.message);
    }
  }

  /**
   * 
   */
  const handleClickCreate = async () => {
    setDrawerContent(drawerContent.header = 'Create new OpSys Profile');
    setDrawerContent(drawerContent.body = (
      <CreateOpSysForm
        api={`${opSysApi}/create`}
        onUpdate={onUpdate}
      />
    ));
    onOpen(); // Open the drawer menu
  };

  /**
   * 
   * @param {*} opSys 
   */
  const handleClickEdit = async (opSys) => {
    setDrawerContent(drawerContent.header = `Edit OpSys Profile: ${opSys.name}`);
    setDrawerContent(drawerContent.body = (
      <EditOpSysForm 
        api={`${opSysApi}/edit`}
        onUpdate={onUpdate}
      />
    ));
    onOpen(); // Open the drawer menu
  };

  /**
   * 
   */
  const onUpdate = () => {
    fetch('opSys', opSysApi, setFetched.opSys);
    onClose(); // Close the drawer menu
  };

  /**
   * 
   * @param {*} id 
   */
  const toggleSelect = (id) => {
    setBulkMode(bulkMode.selected(prev => {
      prev.includes(id)
        // De-select item: remove its ObjectID from the list of selected items
        ? prev.filter(_id => _id !== id)
        // Select item: add its ObjectID to the list of selected items
        : [...prev, id]
    }));
  };

  // Fetch resources on initial page render
  useEffect(() => {
    fetch('docs', docsApi, setFetched.docs);
    fetch('opSys', opSysApi, setFetched.opSys);
  }, []);

  return (
    <OpSysPageUI
      loading={loading}
      fetched={fetched}
      bulkMode={bulkMode}
      setBulkMode={setBulkMode}
      toggleSelect={toggleSelect}
      handleDeleteBulk={handleDeleteBulk}
      handleDelete={handleDelete}
      handleClickCreate={handleClickCreate}
      handleClickEdit={handleClickEdit}
      drawerContent={drawerContent}
      isOpen={isOpen}
      onClose={onClose}
    />
  );
};

export default OpSysPage;