import axios from 'axios'
import { useEffect, useRef, useState } from 'react'
import { useToast } from '@chakra-ui/react'

import CreatePropertyProfileFormUI from './CreatePropertyProfileFormUI'

import { formatISO } from '../../../util/util'

const CreatePropertyProfileForm = ({
  api,
  onUpdate
}) => {
  /**
   * Name of new Property
   */
  const [name, setName] = useState('');
  /**
   * Assessor Parcel Number (Tax ID Number) of new Property
   */
  const [apn, setApn] = useState(''); // TODO: try to get via API on backend 
  /**
   * Date of construction
   */
  const [dateBuilt, setDateBuilt] = useState('');
  /**
   * Date of acquisition
   */
  const [dateAcq, setDateAcq] = useState('');
  /**
   * If true, use the date of construction as the date of acquisition
   */
  const [useDefaultDateAcq, setUseDefaultDateAcq] = useState(false);
  /**
   * Address
   */
  const [address, setAddress] = useState(null);
  /**
   * 
   */
  const [phone, setPhone] = useState(null);
  /**
   * 
   */
  const [wastePickupSched, setWastePickupSched] = useState(null);
  /**
   * 
   */
  const [insurancePolicy, setInsurancePolicy] = useState(null); // TODO: create backend endpoint
  /**
   * 
   */
  const [notes, setNotes] = useState([]);
  /**
   * 
   */
  const [opSystems, setOpSystems] = useState([]); // TODO: create backend endpoint
  /**
   * 
   */
  const [documents, setDocuments] = useState([]);
  /**
   * 
   */
  const [subunits, setSubunits] = useState([]);
  /**
   * Request submission state (POST)
   */
  const [submitting, setSubmitting] = useState(false);

  // Init object for displaying toast messages
  const toast = useToast();

  // Component references
  const dateBuiltRef = useRef();

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

  // TODO: add logic to toggle flag off if user overwrites the dateAcq
  const toggleDefaultDate = () => {
    const prev = useDefaultDateAcq;
    // Get the current value of the date built input
    const defaultDateAcq = dateBuiltRef.current.value;
    // Do nothing if date built is not set yet
    if (!defaultDateAcq) return;
    // Toggle state
    setUseDefaultDateAcq(!prev);
    setDateAcq(
      !prev ? defaultDateAcq : ''
    );
  }

  /**
   * Handle form submission events.
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
    if (phone) formData.append('phone', phone);
    if (wastePickupSched) formData.append('wastePickupSched', wastePickupSched);
    if (insurancePolicy) formData.append('insurancePolicy', insurancePolicy);
    if (notes) formData.append('notes', notes);
    if (opSystems) formData.append('opSystems', opSystems);
    if (documents) formData.append('documents', documents);
    if (subunits) formData.append('subunits', subunits);

    try {
      setSubmitting(true);
      const res = await axios.post(api, formData); // TODO: set headers? 
      // Request successful: fetch updated list of Property Profiles, close drawer
      onUpdate();
      toastSuccess(
        'Property Profile Created',
        `Successfully created Property Profile: ${res.data?.data?.name}`
      );
    } catch (err) {
      console.error(err);
      toastError('Error creating Property Profile', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CreatePropertyProfileFormUI
      name={name}
      setName={setName}
      apn={apn}
      setApn={setApn}
      dateBuilt={dateBuilt}
      dateBuiltRef={dateBuiltRef}
      setDateBuilt={setDateBuilt}
      toggleDefaultDate={toggleDefaultDate}
      useDefaultDateOfAcq={useDefaultDateAcq}
      dateAcq={dateAcq}
      setDateAcq={setDateAcq}
      address={address}
      setAddress={setAddress}
      phone={phone}
      setPhone={setPhone}
      wastePickupSched={wastePickupSched}
      setWastePickupSched={setWastePickupSched}
      insurancePolicy={insurancePolicy}
      setInsurancePolicy={setInsurancePolicy}
      notes={notes}
      setNotes={setNotes}
      opSystems={opSystems}
      setOpSystems={setOpSystems}
      documents={documents}
      setDocuments={setDocuments}
      subunits={subunits}
      setSubunits={setSubunits}
      submitting={submitting}
      handleSubmit={handleSubmit}
    />
  )
};

export default CreatePropertyProfileForm;