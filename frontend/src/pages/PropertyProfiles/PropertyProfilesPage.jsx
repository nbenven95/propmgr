import axios from 'axios'
import { useState, useEffect } from 'react'
import { useDisclosure, useToast } from '@chakra-ui/react'

import PropertyProfilesPageUI from './PropertyProfilesPageUI'
import EditPropertyProfileForm from './Edit/EditPropertyProfileForm'
import CreatePropertyProfileForm from './Create/CreatePropertyProfileForm'

const baseUrl = 'http://localhost:5000';
const propertiesApi = `${baseUrl}/api/properties`;
const docsApi = `${baseUrl}/api/docs`;
const subunitsApi = `${baseUrl}/api/subunits`;

/**
 * 
 * @returns 
 */
const PropertyProfilesPage = () => { // TODO: document these better
  /**
   * Drawer open/close state
   */
  const { isOpen, onOpen, onClose } = useDisclosure();
  /**
   * Drawer header content state and setter
   */
  const [drawerHeader, setDrawerHeader] = useState('');
  /**
   * Drawer body content state and setter
   */
  const [drawerBody, setDrawerBody] = useState(null);
   /**
   * Page loading state and setter
   */
  const [loading, setLoading] = useState({
    docs: false,
    opSys: false,
    policies: false,
    subunits: false,
    properties: false
  });
  /**
   * Bulk operation state and setter
   */
  const [bulkMode, setBulkMode] = useState(false);
  /**
   * List of all current Documents in database
   */
  const [docs, setDocs] = useState([]); // TODO: how to write a request that will filter all non-property documents?
  /**
   * List of all current Insurance Policies in database
   */
  const [policies, setPolicies] = useState([]);
  /**
   * List of all current Operating Systems in database
   */
  const [opSys, setOpSys] = useState([]);
  /**
   * List of all current Subunits in database
   */
  const [subunits, setSubunits] = useState([]);
  /**
   * List of all current Property Profiles in database
   */
  const [properties, setProperties] = useState([]);
    /**
   * List of ObjectIDs of Property Profiles currently selected for bulk delete
   */
  const [selectedProperties, setSelectedProperties] = useState([]);

  // Init object for displaying toast messages
  const toast = useToast();

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

  // Fetch resources from database during initial render
  useEffect(() => {
    fetch('properties', propertiesApi, setProperties);
    fetch('subunits', subunitsApi, setSubunits);
    fetch('docs', docsApi, setDocs);
    // TODO: fetch opSys
    // TODO: fetch policies
  }, []);

  /**
   * Delete a Property Profile given its ObjectID
   * @param {*} id 
   */
  const handleDelete = async (id) => {
    try {
      // On success, display a message with the deleted profile's name
      const res = await axios.delete(`${propertiesApi}/${id}`);
      toastSuccess('Property Profile deleted', `Successfully deleted Property Profile: \'${res.data?.data?.name}\'`)
    } catch (err) {
      // Handle failed API request
      console.error(err);
      toastError('Error deleting Property Profile', err.message);
    }
  };

  /**
   * Given a Property Profile ObjectID, toggles its 'selected'
   * status for bulk operations (bulk delete).
   * @param {*} id 
   */
  const toggleSelect = (id) => {
    // Update state variable for selected PropertyProfiles
    setSelectedProperties(prev => {
      // Check if the specified profile was previously selected
      prev.includes(id)
        // Profile was previously selected: remove it from the list (toggle off)
        ? prev.filter(propId => propId !== id)
        // Profile was not selected: add it to the list (toggle on)
        : [...prev, id]
    });
  }

  /**
   * Delete all Property Profiles selected for bulk delete.
   */
  const handleDeleteBulk = async () => {
    if (selectedProperties.length === 0) return;
    try {
      // Collect responses for delete requests into array
      const responses = await Promise.all(
        selectedProperties.map(id => axios.delete(`${propertiesApi}/${id}`))
      );
      // Get names of deleted Property Profiles from response data
      const deletedProperties = responses.map(res => res.data?.data?.name);
      toastSuccess(
        'Deleted Property Profiles',
        `Successfully deleted Property Profiles: ${deletedProperties.join(', ')}`
      );
    } catch (err) {
      // Bulk delete failed
      console.error(err);
      toastError('Error deleting Property Profiles', err.message);
    }
  };

  /**
   * Refresh Property Profiles and Subunits, close drawer menu.
   * Call after creating a new Property Profile/Subunit.
   */
  const onUpdate = () => {
    // Only refresh Property Profiles and Subunits (others shouldn't have changed)
    fetch('properties', propertiesApi, setProperties);
    fetch('subunits', subunitsApi, setSubunits);
    onClose();
  }

  /**
   * Open drawer menu and render CreatePropertyProfileForm
   */
  const handleClickCreate = async () => {
    setDrawerHeader('Create New Property Profile');
    setDrawerBody(
      <CreatePropertyProfileForm
        api={`${propertiesApi}/create`}
        onUpdate={onUpdate}
      />
    );
    // Open the drawer
    onOpen();
  };
  
  /**
   * Open drawer menu and render EditPropertyProfileForm with specified property
   * @param {*} property
   */
  const handleClickEdit = async (property) => {
    setDrawerHeader(`Edit Property Profile: ${property.name}`);
    setDrawerBody(
      <EditPropertyProfileForm
        api={`${propertiesApi}/${property._id}`}
        onUpdate={onUpdate}
      />
    );
    // Open the drawer
    onOpen();
  };

  return (
    <PropertyProfilesPageUI 
      loading={loading}
      properties={properties}
      selectedProperties={selectedProperties}
      handleDelete={handleDelete}
      bulkMode={bulkMode}
      setBulkMode={setBulkMode}
      toggleSelect={toggleSelect}
      handleDeleteBulk={handleDeleteBulk}
      handleClickCreate={handleClickCreate}
      handleClickEdit={handleClickEdit}
      isOpen={isOpen}
      onClose={onClose}
      drawerHeader={drawerHeader}
      drawerBody={drawerBody}
    />
  );
};

export default PropertyProfilesPage;