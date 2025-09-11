import axios from 'axios';
import { useEffect, useState } from 'react';
import { useToast } from '@chakra-ui/react';

import useFetch from '../../hooks/useFetch.js';

import EditDocFormUI from './EditDocFormUI.jsx';

import {
  getLocalTimestamp,
  handleDeleteBulk,
  handleDeleteSingle,
  handleDownload,
  handleFetch,
  handleOpenDrawer,
  toastError,
  toastSuccess,
} from '../../util/util.js';

const baseUrl   = 'http://localhost:5000';
const filesApi  = `${baseUrl}/api/files`;
const docsApi   = `${baseUrl}/api/docs`;
const infoApi   = `${baseUrl}/api/info`;

const EditDocForm = ({
  doc,
  onUpdate
}) => {
  const toast = useToast();

  const [loading, setLoading] = useState({
    docTypes: false,
    files   : false
  });
  const [fetched, setFetched] = useState({
    docTypes: [],
    files   : []
  });
  const [formData, setFormData] = useState({
    name: doc.name,
    file: null,   // If user wishes to upload a new file
    fileRef: '',  // If user wishes to select a new, existing file
    docType: doc.docType,
    //dateCreate: doc.dateCreate ? new Date(doc.dateCreate).toISOString().substr(0, 10),
    dateCreate: doc.dateCreate ? new Date(doc.dateCreate).toDateString() : getLocalTimestamp(),
    dateEff: doc.dateEff ? new Date(doc.dateEff).toDateString() : '',
    expiry: doc.expiry ? new Date(doc.expiry).toDateString() : ''
  });
  const [submitting, setSubmitting] = useState(false);
  //const [name, setName] = useState(document.name);
  //const [docType, setDocType] = useState(document.docType);
  //const [docTypes, setDocTypes] = useState([]);
  ///const [loading, setLoading] = useState(false);
  //const [dateCreate, setDateCreate] = useState(
  //  document.dateCreate ? new Date(document.dateCreate).toISOString().substr(0,10) : ''
  //);
  //const [dateEff, setDateEff] = useState(
  //  document.dateEff ? new Date(document.dateEff).toISOString().substr(0,10) : ''
  //);
  //const [expiry, setExpiry] = useState(
  //  document.expiry ? new Date(document.expiry).toISOString().substr(0,10) : ''
  //);

  /* Data to fetch during initial render */
  useEffect(() => {
    setLoading(true);
    axios.get(infoApi + '/document-types').then(res => {
      let docTypes = [];
      Object.entries(res.data).forEach(item => {
        docTypes.push({
          label: String(item[1]).replace(/^./, ch => ch.toUpperCase()),
          value: String(item[1])
        });
      });
      setDocTypes(docTypes);
    }).catch(err => {
      console.error(err);
      toast({
        title: 'Error fetching document types',
        description: err.message,
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }).finally(
      setLoading(false)
    );
  }, []); // Pass empty dependency array to only run during initial render

  const handleSave = async () => {
    setLoading(true);
    console.log(dateCreate);
    try {
      const response = await axios.put(docsApi + '/' + document._id, {
        name,
        docType,
        dateCreate,
        dateEff,
        expiry,
      });
      onUpdate();
      toastSuccess(toast, 'Document Updated', `Document "${response.data?.data?.name}" successfully updated.`);
    } catch (err) {
      console.error(err);
      toast({
        title: 'Error updating document',
        description: err.response?.data?.message || err.message,
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <EditDocFormUI />
  );
};

export default EditDocForm;
