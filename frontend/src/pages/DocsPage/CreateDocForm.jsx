import axios from 'axios'
import { useEffect, useRef, useState } from 'react'
import { useToast } from '@chakra-ui/react'

import { getLocalTimestamp, handleFetch, toastError, toastSuccess } from '../../util/util.js'

import CreateDocFormUI from './CreateDocFormUI.jsx'

// TODO: move to centralized location 
const baseUrl   = 'http://localhost:5000';
const filesApi  = `${baseUrl}/api/files`;
const docsApi   = `${baseUrl}/api/docs`;
const infoApi   = `${baseUrl}/api/info`;

const CreateDocForm = ({
  onUpdate
}) => {
  /**
   * 
   */
  const toast = useToast();
  /**
   * 
   */
  const [loading, setLoading] = useState({
    files         : false,
    allowedFileExt: false,
    docTypes      : false,
    toolTips      : false
  });
  /**
   * 
   */
  const [fetched, setFetched] = useState({
    files         : [],
    allowedFileExt: [],
    docTypes      : [],
    toolTips      : {}
  });
  /**
   * Input field data
   */
  const [formData, setFormData] = useState({ // TODO: add state that would allow a user to select an existing file
    name      : '',
    file      : null, // New file upload
    fileRef   : '',   // Existing file (mutually exclusive w/ file)
    docType   : '',
    dateCreate: getLocalTimestamp(),
    dateEff   : '',
    expiry    : '',
  });
  /**
   * DOM element references
   */
  const refs = {
    dateCreate: useRef(),
    dateEff   : useRef(),
    expiry    : useRef(),
    name      : useRef()
  }
  /**
   * 
   */
  const [useDefaultName, setUseDefaultName] = useState(true);
  /**
   * 
   */
  const [submitting, setSubmitting]         = useState(false);

  // Fetch data during initial render
  useEffect(() => {
    
    handleFetch('allowedFileExt', `${infoApi}/allowed-file-ext`, setLoading, setFetched);
    handleFetch('docTypes', `${infoApi}/document-types`, setLoading, setFetched);
    handleFetch('toolTips', `${infoApi}/tool-tips/CreateDocForm`, setLoading, setFetched);
    handleFetch('files', `${filesApi}`, setLoading, setFetched);

    /*
    // Get document types from backend
    axios.get(infoApi + '/document-types').then(res => {
      setLoading(loading['docTypes'] = true);
      let docTypes = [];
      Object.entries(res.data).forEach(item => {
        docTypes.push({
          label: String(item[1]).replace(/^./, ch => ch.toUpperCase()),
          value: String(item[1])
        });
      });
      setDocTypes(docTypes);
      console.log('Done fetching docTypes');
    }).catch(err => {
      console.error(err);
    }).finally(
      setLoading(loading.docTypes = false)
    );

    // Get allowed file types from backend
    axios.get(infoApi + '/allowed-file-ext').then(res => {
      setLoading(loading.allowedFileExt = true);
      setAllowedFileExt(res.data);
      console.log('Done fetching allowedFileExt');
    }).catch(err => {
      console.error(err);
    }).finally(
      setLoading(loading.allowedFileExt = false)
    );
    */
  }, []); // Pass empty dependency array so useEffect only runs on initial render

  /**
   * Truncate the file extension from the given filename
   * 
   * @param {} filename 
   * @returns 
   */
  const fileNameNoExt = (filename) => {
    const lastDotIndex = filename?.lastIndexOf('.');
    if (lastDotIndex === -1) return filename; // No extension
    return filename?.substring(0, lastDotIndex);
  };

  /**
   * Toggle useDefaultName on/off
   */
  const toggleUseDefaultName = () => {
    const file    = formData.file;
    const nameRef = refs.name;
    // Current state
    const curr    = useDefaultName;
    // Get the hypothetical default Document name
    const defaultName   = fileNameNoExt(file.name);
    // Toggle useDefaultName to the opposite of its current value
    setUseDefaultName(!curr);
    // Check if Document name should be updated or left alone
    setFormData(prev => ({
      ...prev,
      // Check if useDefaultName was toggled on (i.e., curr = false) and if there is a staged file
      name: !curr && file
              // True: use default document name
              ? defaultName
              /* False (useDefaultName toggled off): check if name was changed from
                 the default value from when useDefaultName was previously toggled on */
              : defaultName !== nameRef.current.value
                /* True: useDefaultName was previously toggled on, then user updated the name.
                   Use whatever value that is currently in the name input field. */
                ? nameRef.current.value
                /* False: useDefaultName was previously toggled on, no changes made.
                   Just clear the form. */
                : ''
    }));
  };

  /**
   * 
   * @param {*} e 
   */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      toastError(toast, 'File Select Error', 'No file was selected');
      return;
    }
    setFormData(prev => ({ ...prev, file: file }));
    // If useDefaultName is toggled, update the Document name to reflect the new file
    if (useDefaultName) {
      const defaultName = fileNameNoExt(file.name);
      setFormData(prev => ({ ...prev, name: defaultName }));
    }
  };

  /**
   * 
   * @param {*} e 
   * @returns 
   */
  const handleSubmit = async () => { // TODO: should this function be async since it is a callback for Button onClick?
    const { name, docType, file, dateCreate, dateEff, expiry } = formData;
    if (!name || !docType || !file) {
      toastError(toast, 'Validation Error', 'Please fill all required fields.');
      return;
    }
    const docData = (new FormData())
      .append('name', name)
      .append('docType', docType)
      .append('file', file); // Expected by multer middleware; processes requeust before controller and puts result in req.file
    if (dateCreate) docData.append('dateCreate', dateCreate);
    if (dateEff)    docData.append('dateEff', dateEff);
    if (expiry)     docData.append('expiry', expiry);
    
    try {
      setSubmitting(true);
      const response = await axios.post(docsApi + '/create', docData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Call onUpdate if it was passed as a param (only relevant when this form is embedded in a drawer or other container)
      if (onUpdate) onUpdate(); // TODO: should this be awaited?

      toastSuccess(toast, 'Document Created', `Document "${response.data?.data?.name}" successfully created.`);
    } catch (err) {
      console.error(err);
      toastError(toast, 'Error Creating Document', err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Handle onFocus events for datetime picker elements (datetime picker opened).
   * DT picker should set the date/time that are selected by default when the
   * picker opens to the one specified by the callback function setDefaultValueOnOpen.
   * If the user has already chosen a date, that value is used instead.
   * 
   * @param {*} e 
   */
  const handleFocus = (e) => {};

  /**
   * Handle blur (focusLost) events for datetime picker elements (datetime picker closed).
   * DT picker should display the chosen date as the preview value, or use the placeholder
   * '--:-- --' if no date was chosen.
   * 
   * @param {} e 
   */
  const handleFocusLost = (e) => {};

  return (
    <CreateDocFormUI 
      formData={formData}
      setFormData={setFormData}
      fetched={fetched}
      refs={refs}
      loading={loading}
      submitting={submitting}
      handleSubmit={handleSubmit}
      handleFocus={handleFocus}
      handleFocusLost={handleFocusLost}
      handleFileChange={handleFileChange}
      toggleUseDefaultName={toggleUseDefaultName}
    />
  );
};

export default CreateDocForm;
