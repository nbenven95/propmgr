import axios from 'axios'
import { useEffect, useState } from 'react'

import CreatePropertyProfileFormUI from './CreatePropertyProfileFormUI'

import formatISO from '../../../util/util'
import { set } from 'mongoose';

const baseUrl = 'http://localhost:5000';
const docsApi = `${baseUrl}/api/docs`;
const propsApi = `${baseUrl}/api/properties`;
const subunitsApi = `${baseUrl}/api/subunits`;
// TODO: add endpoints for insurance and opsys

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
   * Stores list of all Documents in backend database
   */
  const [allDocuments, setAllDocuments] = useState([]); // TODO: how to write a request that will filter all non-property documents?
  /**
   * Stores list of all InsurancePolicies in backend database
   */
  const [allInsurancePolicies, setAllInsurancePolicies] = useState([]);
  /**
   * Stores list of all current OpSys in backend database
   */
  const [allOpSystems, setAllOpSystems] = useState([]);
  /**
   * Stores list of all current Subunits in backend database
   */
  const [allSubunits, setAllSubunits] = useState([]);

  /**
   * Stores loading states resources being fetched
   */
  const [isLoading, setIsLoading] = useState({
    docs              : true,
    subunits          : true,
    opSystems         : true,
    insurancePolicies : true
  });
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

  /* Fetch data during initial render */
  useEffect(() => {

    // Fetch all Documents
    setIsLoading(isLoading.docs = true);
    axios.get(docsApi).then(res => {
      // Get Documents request success
      setAllDocuments(res.data);
      console.log('Done fetching Documents');
    }).catch(err => {
      // Get Documents request failure
      console.error(err);
      toastError('Error fetching Documents', err.message);
    }).finally(
      // Clean up
      setIsLoading(isLoading.docs = false)
    );

    // Fetch all Subunits
    setIsLoading(isLoading.subunits = true);
    axios.get(subunitsApi).then(res => {
      // Get Subunits request success
      setAllSubunits(res.data);
      console.log('Done fetching Subunits');
    }).catch(err => {
      // Get Subunits request failure
      console.error(err);
      toastError('Error fetching Subunits', err.message);
    }).finally(
      // Clean up
      setIsLoading(isLoading.subunits = false)
    );

    // Fetch all InsurancePolicies // TODO: create backend endpoint
    // Fetch all OpSystems // TODO: create backend endpoint
  }, []);

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