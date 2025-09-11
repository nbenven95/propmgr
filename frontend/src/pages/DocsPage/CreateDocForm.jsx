import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useToast } from '@chakra-ui/react';

import useFetch from '../../hooks/useFetch.js';
import useFormData from '../../hooks/useFormData.js';

import { getErrorMsg, getLocalTimestamp, truncateExt } from '../../util/util.js';

import CreateDocFormUI from './CreateDocFormUI.jsx';

// TODO: move to centralized location 
const baseUrl   = 'http://localhost:5000';
const filesApi  = `${baseUrl}/api/files`;
const docsApi   = `${baseUrl}/api/docs`;
const infoApi   = `${baseUrl}/api/info`;
const fileExtApi = `${infoApi}/allowed-file-ext`;
const docTypeApi = `${infoApi}/document-types`;
const toolTipApi = `${infoApi}/tool-tips`;

/**
 * 
 * @param {*} onUpdate 
 * @returns 
 */
const CreateDocForm = ({ onUpdate }) => {

  const toast = useToast();

  const { formData, setFormData, getPayload, submitting, handleChange, handlePost, handlePut } = useFormData({
    initFormData: {
      name      : '',
      file      : null, // Newly uploaded file
      docType   : '',      
      dateCreate: getLocalTimestamp(),
      dateEff   : '',
      expiry    : '',
      fileRef   : '' // ObjectID of existing FileRef (mutually exclusive with `file`)
    },
    required: { // TODO: change this so file is not required; either file or fileRef is required (but not both)
      name      : true,
      file      : true,
      docType   : true,
      dateCreate: false,
      dateEff   : false,
      expiry    : false,
      fileRef   : false
    }
  });

  const { loading, fetched, handleFetch } = useFetch({
    initLoading: { allowedFileExt: false, docTypes: false, toolTips: false, files: false },
    initFetched: { allowedFileExt: [], docTypes: [], toolTips: {}, files: [] }
  });

  const refs = {
    dateCreate: useRef(),
    dateEff   : useRef(),
    expiry    : useRef(),
    name      : useRef()
  };

  // TODO: add state to ensure that user may either upload a new file or select an existing file
  const [useDefaultName, setUseDefaultName] = useState(true);

  /**
   * Handle side effects on initial render.
   * Fetch all data needed for the page to function:
   * allowed file extensions, document types, tool
   * tips for input forms, and currently uploaded files. 
   */
  useEffect(() => {
    handleFetch(fileExtApi, 'allowedFileExt');
    handleFetch(docTypeApi, 'docTypes');
    handleFetch(`${toolTipApi}/CreateDocForm`, 'toolTips');
    handleFetch(filesApi, 'files');
  }, []);

  /**
   * Handle changing the document name 
   */
  useEffect(() => {
    // File was cleared: do nothing
    if (!formData.file) return;
    // Get the default name (just the filename w/ extension truncated)
    const defaultName = truncateExt(formData.file.name);
    // useDefaultName toggled on
    if (useDefaultName) {
      // Set Document name to the default name
      setFormData(prev => ({ ...prev, name: defaultName }));
    }
    else if (defaultName !== refs.name.current.value) {
      // useDefaultName toggled off: if name changed while toggled on, keep the changes
      setFormData(prev => ({ ...prev, name: refs.name.current.value }));
    } else {
      // useDefaultName toggled off, no changes made: clear the field
      setFormData(prev => ({ ...prev, name: '' }));
    }
  }, [useDefaultName, formData.file]) // This effect is called if useDefaultName is toggled or a new file is staged

  /* Toggle useDefaultName state */
  const handleToggle = () => setUseDefaultName(!useDefaultName);

  /**
   * 
   * @param {*} e 
   * @returns 
   */
  const handleSubmit = async () => {
    // TODO: should callbacks be async? e.g., this is a callback for onClick 
    let toastArgs = {};
    try {
      // Get the current form data state as a FormData object
      const payload = getPayload();
      const doc = await handlePost(`${docsApi}/create`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      if (onUpdate) await onUpdate(); // TODO: should this be awaited?
      toastArgs = {
        title       : 'Document Created',
        description : `Successfully created Document \"${doc.name}\"`,
        status      : 'success'
      };
    } catch (err) {
      toastArgs = {
        title       : 'Error Creating Document',
        description : getErrorMsg(err),
        status      : 'error'
      };
      console.error(err);
    }
    toast({ ...toastArgs, duration: 3000, isClosable: true });
  };

  /**
   * Handle onFocus events for dateTime picker elements.
   * This occurs when the element is opened. DT picker should
   * set the date/time that are selected by default when the
   * picker opens to the one specified by the callback function
   * setDefaultValueOnOpen. If the user has already chosen a
   * date, that value is used instead.
   * 
   * @param {*} e 
   */
  const handleFocus = (e) => {};

  /**
   * Handle blur events for datetime picker elements.
   * This occurs when the dateTime picker is closed. DT picker
   * should display the chosen date as the preview value, 
   * or use the placeholder '--:-- --' if no date was chosen.
   * 
   * @param {*} e 
   */
  const handleFocusLost = (e) => {};

  return (
    <CreateDocFormUI 
      formData={formData}
      fetched={fetched}
      refs={refs}
      loading={loading}
      submitting={submitting}
      useDefaultName={useDefaultName}
      handleSubmit={handleSubmit}
      handleChange={handleChange}
      handleToggle={handleToggle}
      handleFocus={handleFocus}
      handleFocusLost={handleFocusLost}
    />
  );
};

export default CreateDocForm;
