import axios from 'axios'
import { useState, useEffect } from 'react'
import { useDisclosure, useToast } from '@chakra-ui/react'

import PropertyProfilesPageUI from './PropertyProfilesPageUI'
import EditPropertyProfileForm from './Edit/EditPropertyProfileForm'
import CreatePropertyProfileForm from './Create/CreatePropertyProfileForm'

const baseUrl     = 'http://localhost:5000';
const propsApi = `${baseUrl}/api/properties`;

/**
 * 
 * @returns 
 */
const PropertyProfilesPage = () => {
  /**
   * Drawer open state
   *    Stores the state of the drawer menu (true: open, false: closed).
   * onOpen
   *    Event handler to be called when drawer menu should open.
   * onClose
   *    Event handler to be called when drawer menu should close.
   */
  const { isOpen, onOpen, onClose } = useDisclosure();
  /**
   * Drawer header state
   *    Set the title of the drawer menu based on the current operating mode.
   */
  const [drawerHeader, setDrawerHeader] = useState('');
  /**
   * Drawer body state
   *    Render a given component (e.g. Create, Edit, etc.) based on the current operating mode.
   */
  const [drawerBody, setDrawerBody] = useState(null);
   /**
   * Page loading state
   */
  const [loading, setLoading] = useState(true);
    /**
   * Bulk operation state
   */
  const [bulkMode, setBulkMode] = useState(false);
  /**
   * PropertyProfiles state
   *    Stores the result of the most recent GET request (list of PropertyProfiles).
   */
  const [profiles, setProfiles] = useState([]);
  /**
   * Bulk operation selected items state
   *    Stores ObjectIDs of items to be bulk deleted.
   */
  const [selectedProfiles, setSelectedProfiles] = useState([]);

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
   * Get all PropertyProfiles
   */
  const fetchProfiles = async () => {
    setLoading(true);
    try {
      // On success, update state variable with response data
      const res = await axios.get(propsApi);
      setProfiles(res.data);
    } catch (err) {
      // Handle failed API request
      console.error(err);
      toastError('Error fetching Property Profiles', err.message);
    } finally {
      // Set loading to false after handling success/failure
      setLoading(false);
    }
  };

  // Fetch PropertyProfiles during initial render
  useEffect(() => fetchProfiles(), []);

  /**
   * Delete a PropertyProfile given its ObjectID
   * @param {*} id 
   */
  const handleDelete = async (id) => {
    try {
      // On success, display a message with the deleted profile's name
      const res = await axios.delete(`${propsApi}/${id}`);
      toastSuccess('Property Profile deleted', `Successfully deleted Property Profile: \'${res.data?.data?.name}\'`)
    } catch (err) {
      // Handle failed API request
      console.error(err);
      toastError('Error deleting Property Profile', err.message);
    }
  };

  /**
   * Delete all currently selected PropertyProfiles
   */
  const handleDeleteBulk = async () => {};

  /**
   * Open drawer menu and render create component
   */
  const handleClickCreate = async () => {
    setDrawerHeader('Create Property Profile');
    setDrawerBody(
      <CreatePropertyProfileForm 

      />
    );
    // Open the drawer
    onOpen();
  };
  
  /**
   * Open drawer menu and render edit component with the specified PropertyProfile
   * @param {*} profile 
   */
  const handleClickEdit = async (profile) => {
    setDrawerHeader(`Edit Property Profile: ${profile.name}`);
    setDrawerBody(
      <EditPropertyProfileForm 

      />
    );
    // Open the drawer
    onOpen();
  };

  /**
   * Given a PropProf ObjectID, toggles its 'selected' status for bulk operations.
   * @param {*} id 
   */
  const toggleSelect = (id) => {
    // Update state variable for selected PropertyProfiles
    setSelectedProfiles(prev => {
      // Check if the specified profile was previously selected
      prev.includes(id)
        // Profile was previously selected: remove it from the list (toggle off)
        ? prev.filter(propId => propId !== id)
        // Profile was not selected: add it to the list (toggle on)
        : [...prev, id]
    });
  }

  return (
    <PropertyProfilesPageUI 

    />
  );
};

export default PropertyProfilesPage;