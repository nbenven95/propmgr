import axios from 'axios'
import { useEffect, useRef, useState } from 'react'
import { useToast } from '@chakra-ui/react'

import CreateDocFormUI from './CreateDocFormUI.jsx'

const baseUrl     = 'http://localhost:5000';
const docsApi     = `${baseUrl}/api/docs`;
const infoApi     = `${baseUrl}/api/info`;
const toolTipsApi = `${infoApi}/tool-tips`;

// TODO: add clear form button 

const CreateDocForm = ({
  onUpdate
}) => {
  const toast = useToast();

  const [allowedFileExt, setAllowedFileExt] = useState([]);
  const [docTypes, setDocTypes]             = useState([]);
  const [toolTips, setToolTips]             = useState({});

  /**
   * Helper method for generating full timestamps
   * @returns
   */
  // TODO: try replacing all of this with just `new Date(Date.now())`
  const dateTime = () => {
    const now     = new Date(); // Get current date/time as ISO timestamp
    const year    = String(now.getFullYear());
    const month   = String(now.getMonth()).padStart(2,'0');
    const day     = String(now.getDate()).padStart(2,'0');
    const hours   = String(now.getHours()).padStart(2,'0');
    const minutes = String(now.getMinutes()).padStart(2,'0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // State variables for form fields
  const [name, setName]                     = useState('');
  const [docType, setDocType]               = useState('');
  const [dateCreate, setDateCreate]         = useState(dateTime());
  const [dateEff, setDateEff]               = useState('');
  const [expiry, setExpiry]                 = useState('');
  const [file, setFile]                     = useState(null); // State to track new file upload
  const [useDefaultName, setUseDefaultName] = useState(true);
  const [isSubmitting, setIsSubmitting]     = useState(false);
  const [isLoading, setIsLoading]           = useState({
    allowedFileExt: false,
    docTypes      : false,
    toolTips      : false
  });

  // Element references
  const dateCreateRef = useRef();
  const dateEffRef    = useRef();
  const expiryRef     = useRef();
  const nameRef       = useRef();

  const toastSuccess = (title, desc) => {
    toast({
      title: title,
      description: desc,
      status: 'success',
      duration: 3000,
      isClosable: true
    });
  };

  const toastError = (title, desc) => {
    toast({
      title: title,
      description: desc,
      status: 'error',
      duration: 3000,
      isClosable: true
    });
  }

  /**
   * Fetch data during initial render
   */
  useEffect(() => {
    // Get document types from backend
    axios.get(infoApi + '/document-types').then(res => {
      setIsLoading(isLoading['docTypes'] = true);
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
      toastError('Error fetching document types', err.message);
    }).finally(
      setIsLoading(isLoading['docTypes'] = false)
    );
    // Get allowed file types from backend
    axios.get(infoApi + '/allowed-file-ext').then(res => {
      setIsLoading(isLoading['allowedFileExt'] = true);
      setAllowedFileExt(res.data);
      console.log('Done fetching allowedFileExt');
    }).catch(err => {
      console.error(err);
      toastError('Error fetching allowed file types/extensions', err.message);
    }).finally(
      setIsLoading(isLoading['allowedFileExt'] = false)
    );
    // Get tool tips for this view from backend
    axios.get(toolTipsApi + '/CreateDocForm').then(res => {
      setIsLoading(isLoading['toolTips'] = true)
      setToolTips(res.data);
      console.log('Done fetching toolTips for CreateDocForm');
    }).catch(err => {
      console.error(err);
      toastError('Error fetching tool tips for CreateDocForm', err.message);
    }).finally(
      setIsLoading(isLoading['toolTips'] = false)
    );
  }, []); // Pass empty dependency array to only run during initial render

  /**
   * Given a filename, returns the filename with the final extension truncated.
   * e.g., fileNameNoExt('hello.txt') => 'hello'
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
   * Event handler to toggle 'use default name' checkbox
   * 
   * @param {*} e 
   */
  const toggleUseDefaultName = (e) => {
    const prev = useDefaultName;
    const defaultName = fileNameNoExt(file.name);
    setUseDefaultName(!prev);
    setName(
      !prev && file                             // If toggling from off to on and there is a staged file
        ? defaultName                           // True: use filename with extension truncated
        : defaultName !== nameRef.current.value // False: toggling from on to off; check if user has edited the default name before clearing form
          ? nameRef.current.value               // True: don't clear the form when toggling on to off
          : ''                                  // False: clear the form
    );
  };

  /**
   * 
   * @param {*} e 
   */
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    if (useDefaultName) setName(
      fileNameNoExt(e.target.files[0]?.name)
    );
  };

  /**
   * 
   * @param {*} e 
   * @returns 
   */
  const handleSubmit = async (e) => {
    if (!name || !docType || !file) {
      toastError('Validation Error', 'Please fill all required fields.');
      return;
    }
    const formData = new FormData();
    formData.append('name', name);
    formData.append('docType', docType);
    if (dateCreate) formData.append('dateCreate', dateCreate);
    if (dateEff) formData.append('dateEff', dateEff);
    if (expiry) formData.append('expiry', expiry);
    // TODO: add check to see if user uploaded a new file, or selected an existing FileRef object 
    formData.append('file', file); // Note: this field is expected by multer (backend middleware); multer processes the data and places it in req.file 
    setIsSubmitting(true);
    try {
      const response = await axios.post(docsApi + '/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      onUpdate(); // Refresh Documents list and close drawer // TODO: await this
      toastSuccess('Document Created', `Document "${response.data?.data?.name}" successfully created.`);
    } catch (err) {
      console.error(err);
      toastError('Error Creating Document', err.response?.data?.message || err.message);
    } finally {
      setIsSubmitting(false);
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
  const handleDTPickerFocus = (e) => {
    
  }

  /**
   * Handle blur (focusLost) events for datetime picker elements (datetime picker closed).
   * DT picker should display the chosen date as the preview value, or use the placeholder
   * '--:-- --' if no date was chosen.
   * 
   * @param {} e 
   */
  const handleDTPickerFocusLost = (e) => {

  }

  return (
    <CreateDocFormUI 
      name={name}
      nameRef={nameRef}
      setName={setName}
      toggleUseDefaultName={toggleUseDefaultName}
      docType={docType}
      setDocType={setDocType}
      isLoading={isLoading}
      docTypes={docTypes}
      handleDTPickerFocus={handleDTPickerFocus}
      handleDTPickerFocusLost={handleDTPickerFocusLost}
      dateCreate={dateCreate}
      dateCreateRef={dateCreateRef}
      setDateCreate={setDateCreate}
      dateEff={dateEff}
      dateEffRef={dateEffRef}
      setDateEff={setDateEff}
      expiry={expiry}
      expiryRef={expiryRef}
      setExpiry={setExpiry}
      allowedFileExt={allowedFileExt}
      handleFileChange={handleFileChange}
      isSubmitting={isSubmitting}
      handleSubmit={handleSubmit}
      toolTips={toolTips}
    />
  );
};

export default CreateDocForm;
