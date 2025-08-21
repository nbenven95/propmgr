import axios from 'axios'
import { useEffect, useState } from 'react'
import { useToast } from '@chakra-ui/react'

import CreatePropertyProfileFormUI from './CreatePropertyProfileFormUI'

import { formatISO } from '../../../util/util'

const CreatePropertyProfileForm = ({
  onUpdate
}) => {
  
  // State for profile being created

  const [name, setName] = useState('');
  const [apn, setApn] = useState('');
  const [dateBuilt, setDateBuilt] = useState('');
  const [dateAcq, setDateAcq] = useState('');
  const [address, setAddress] = useState(null);
  const [phone, setPhone] = useState(null);
  const [geoCode, setGeoCode] = useState(null);
  const [wastePickupSched, setWastePickupSched] = useState(null);
  const [insurancePolicy, setInsurancePolicy] = useState(null); // TODO: create backend endpoint
  const [notes, setNotes] = useState([]);
  const [opSystems, setOpSystems] = useState([]); // TODO: create backend endpoint
  const [documents, setDocuments] = useState([]);
  const [subunits, setSubunits] = useState([]);

  /**
   * Stores form submission state
   */
  const [isSubmitting, setIsSubmitting] = useState(false);

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
   * Event handler for form submission events
   * @param {*} e 
   */
  const handleSubmit = async (e) => {
    // Validate mandatory fields
    if (!name || !address) {
      toastError('Validation Error', 'Please fill all required fields.');
      return;
    }
    // Init form data
    const formData = new FormData();

    // Append data for mandatory fields
    formData.append('name', name);
    formData.append('address', address);

    // Only append optional fields that have been filled out
    if (apn) formData.append('apn', apn);
    if (dateBuilt) formData.append('dateBuilt', dateBuilt);
    if (dateAcq) formData.append('dateAcq', dateAcq);
    if (dateEff) formData.append('phone', phone);
    if (geoCode) formData.append('geoCode', geoCode);
    if (wastePickupSched) formData.append('wastePickupSched', wastePickupSched);
    if (insurancePolicy) formData.append('insurancePolicy', insurancePolicy);
    if (notes) formData.append('notes', notes);
    if (opSystems) formData.append('opSystems', opSystems);
    if (documents) formData.append('documents', documents);
    if (subunits) formData.append('subunits', subunits);

    try {
      setIsSubmitting(true);
      const res = await axios.post(`${propsApi}/create`, formData); // TODO: set headers? 
      onUpdate();
      toastSuccess(
        'Property Profile Created',
        `Successfully created Property Profile: ${res.data?.data?.name}`
      );
    } catch (err) {
      console.error(err);
      toastError('Error creating Property Profile', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

};

export default CreatePropertyProfileForm;