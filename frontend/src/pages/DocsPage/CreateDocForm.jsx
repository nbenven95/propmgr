import { useEffect, useRef, useState } from 'react';
import { useToast, Text } from '@chakra-ui/react';

import CreateDocFormUI from './CreateDocFormUI';
import UploadForm from '../../pages/FilesPage/UploadForm';

import useDrawer from '../../hooks/useDrawer.jsx';
import useFetch from '../../hooks/useFetch.jsx';
import useFormData from '../../hooks/useFormData.jsx';
import { getErrorMsg, getLocalTimestamp, truncateExt } from '../../util/util.js';

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

  const { formData, setFormData, submitting, onChange, onSubmit } = useFormData({
    initFormData: {
      name        : '',
      stagedFiles : [], // Newly uploaded file; use an array for consistency (only allow 1 element)
      docType     : '',      
      dateCreate  : getLocalTimestamp(),
      dateEff     : '',
      expiry      : '',
      fileRef     : '' // ObjectID of existing FileRef (mutually exclusive with `file`)
    },
    required: {
      name        : true,
      stagedFiles : true,
      docType     : true,
      dateCreate  : false,
      dateEff     : false,
      expiry      : false,
      fileRef     : false // TODO: make mutually exclusive w/ file
    }
  });

  const { loading, fetched, onFetch } = useFetch({
    initLoading: { allowedFileExt: false, docTypes: false, toolTips: false, files: false },
    initFetched: { allowedFileExt: [], docTypes: [], toolTips: {}, files: [] },
    endpoints: { 
      allowedFileExt: fileExtApi,
      docTypes      : docTypeApi,
      toolTips      : toolTipApi,
      files         : filesApi
    }
  });

  const { drawerContent, isOpen, onDrawerOpen, onDrawerClose } = useDrawer();

  const refs = {
    dateCreate: useRef(),
    dateEff   : useRef(),
    expiry    : useRef(),
    name      : useRef()
  };

  // TODO: move this into form data? (shouldn't matter if it gets sent with our requests)
  const [useDefaultName, setUseDefaultName] = useState(true);

  // Handle side-effects
  useEffect(() => {
    /* Workaround to let us indirectly await async in useEffect */
    const handleFetch = async () => {
      // Array of fetch promises
      const promises = [
        onFetch('allowedFileExt'),
        onFetch('docTypes'),
        onFetch('toolTips'),
        onFetch('files')
      ];
      // Execute all promises in parallel until all are settled
      const results = await Promise.allSettled(promises);
      // Get a list of errors for any resources that failed to fetch
      const errs = results.filter(r => r.status === 'rejected').map(r => r.reason);
      // Notify user of any resources that failed to fetch
      const numErrs = errs.length;
      if (numErrs > 0) {
        const msg = `Failed to fetch (${numErrs}) resource${numErrs > 1 ? 's' : ''}: ${errs.join(', ')}`;
        console.error(msg);
      }
    };
    handleFetch();
  }, []); // No dependencies; only called on initial page render

  // Handle side-effects (useDefaultName toggled or staged file change)
  useEffect(() => {
    setFormData(prev => {
      if (!Array.isArray(prev.stagedFiles) || prev.stagedFiles.length === 0) {
        // No file staged for upload yet, do nothing
        return { ...prev };
      }
      // Only allow one file to be staged
      const stagedFile = prev.stagedFiles[0];
      // Get the default name (truncate file ext)
      const defaultName = truncateExt(stagedFile.name);
      // Check if default name toggled on/off
      if (useDefaultName) {
        // Default name toggled on
        return { ...prev, name: defaultName };
      } else {
        // Default name toggled off
        if (defaultName !== refs.name.current?.value) {
          // If name changed while toggled on, keep the changes
          return { ...prev, name: refs.name.current.value };
        } else {
          // No changes made, clear the field
          return { ...prev, name: '' };
        }
      }
    });
  }, [useDefaultName, formData.stagedFiles]);

  /**
   * 
   * @param {*} files 
   */
  const handleStageFiles = (files) => {
    // Make sure input is an array of Files and not a FileList (or else things break)
    const filesToStage = Array.from(files);
    // Enforce file upload limit for Document creation
    let toastArgs = {
      title: 'Error Staging File',
      status: 'error',
      duration: 3000,
      isClosable: true,
      description: 'Only (1) file may be staged for upload at a time.'
    };
    if (formData.stagedFiles.length == 1 || filesToStage.length > 1) {
      toast({ ...toastArgs });
      return;
    }
    onChange({
      target: {
        name  : 'stagedFiles', // Name of our file input element and corresponding formData state field
        type  : 'file',
        files : filesToStage
      }
    });
  };

  /**
   * 
   * @param {*} e 
   * @returns 
   */
  const handleSubmitForm = async () => { // TODO: should onClick callbacks be async? 
    let toastArgs = {};
    try {

      // TODO: handle file upload and doc creation separately (will need to update doc controller backend)
      // First, ensure either payload.files or payload.fileRef is set (error if both or none)
      //  - payload.files will be read as req.files after request goes through multer middleware
      //  - All other payload fields are (should be) used as the key/values in req.body on backend
      //  - i.e., what we unpack when we make the call to mongoose to create our db objects
      //  - Documents have a fileRef field (the ObjectID of an uploaded file) that should be part of req.body
      // If payload.files is set and is a valid FileArray, make a post request to upload the files
      //  - Should only contain one File; must be an array for consistency on backend 
      //    If upload is successful, get the ID of the resulting object and use that for our fileRef
      //    Also, re-fetch files
      // Else, assume fileRef is set and construct the payload from our current formData state 

      const doc = await onSubmit(`${docsApi}/create`, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      //const doc = await handlePost(`${docsApi}/create`, payload, { headers: {} });
      if (onUpdate) await onUpdate();
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

  /* Handle opening drawer and rendering UploadForm */
  const handleOpenForm = () => {
    onDrawerOpen(
      <Text>Upload New File</Text>,
      <UploadForm onUpdate={handleStageFiles} />
    );
  };

  /**
   * Handle onChange events for form input fields (non-file)
   * 
   * @param {*} e 
   * @returns 
   */
  const handleChangeForm = e => onChange(e);

  /* Handle closing drawer displaying the UploadForm */
  const handleCloseForm = () => onDrawerClose();

  /* Toggle useDefaultName state */
  const handleToggleUseDefaultName = () => setUseDefaultName(prev => !prev);

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
      isOpen={isOpen}
      loading={loading}
      submitting={submitting}
      useDefaultName={useDefaultName}

      refs={refs}
      fetched={fetched}
      formData={formData}
      drawerContent={drawerContent}

      onCloseForm={handleCloseForm}
      onChangeForm={handleChangeForm}
      onStageFiles={handleStageFiles}
      //onDatePickerFocus={handleFocus}
      //onDatePickerFocusLost={handleFocusLost}

      onClickUpload={handleOpenForm}
      onClickSubmit={handleSubmitForm}
      onClickToggle={handleToggleUseDefaultName}
    />
  );
};

export default CreateDocForm;
