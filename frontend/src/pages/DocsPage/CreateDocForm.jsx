import { useEffect, useRef, useState } from 'react';
import { Text } from '@chakra-ui/react';

import CreateDocFormUI from './CreateDocFormUI';
import UploadForm from '../../pages/FilesPage/UploadForm';

import useFetch from '../../hooks/useFetch.jsx';
import useNotify from '../../hooks/useNotify.jsx';
import useDrawer from '../../hooks/useDrawer.jsx';
import useFormData from '../../hooks/useFormData.jsx';
import { getErrorMsg, truncateExt } from '../../util/util.js';

// TODO: move to centralized location 
const baseUrl   = 'http://localhost:5000/api';
const filesApi  = `${baseUrl}/files`;
const docsApi   = `${baseUrl}/docs`;
const infoApi   = `${baseUrl}/info`;
const fileExtApi = `${infoApi}/allowed-file-ext`;
const docTypesApi = `${infoApi}/document-types`;

/**
 * 
 * @param {*} onUpdate 
 * @returns 
 */
const CreateDocForm = ({ onUpdate }) => {

  const { formData, setFormData, submitting, onChange, onSubmit } = useFormData([
    { name        : { init: '', required: true } },
    { stagedFiles : { init: [], required: true } }, // If creating Document with an uploaded File
    { docType     : { init: '', required: true } }, // Init to type 'Text'
    { dateCreate  : {
      // TODO: fix this init so that the time is set to midnight 
      init    : new Date().toISOString(), // Init date as ISO string (this is how they are saved on the backend)
      required: false
    } },
    { dateEff     : { init: '', required: false } },
    { expiry      : { init: '', required: false } },
    { fileRef     : { init: '', required: false } }, // If creating Document with pre-uploaded File
  ]);

  const { loading, fetched, onFetchMany } = useFetch([
    { allowedFileExt: { init: [], url: fileExtApi } },
    { docTypes      : { init: [], url: docTypesApi } },
    { files         : { init: [], url: filesApi } }
  ]);

  const { drawerContent, isOpen, onDrawerOpen, onDrawerClose, DrawerMenu } = useDrawer();

  const notify = useNotify();

  const [formState, setFormState] = useState({ useDefaultName: true });

  // TODO: check if the date refs are actually being used 
  const refs = {
    name: useRef(),
    stagedFiles: useRef(formData.stagedFiles),
    useDefaultName: useRef()
  };

  /**
   * 
   * @param {Array} resources 
   */
  const handleFetch = async (resources) => {
    const errs = await onFetchMany(resources);
    // On failure to fetch, just log to console
    if (errs.length > 0) {
      console.error(`Failed to fetch (${errs.length})`.concat(
        `${plural('resource', errs.length)}: ${errs.join(', ')}`));
    }
  };

  // Handle side effects
  useEffect(() => {
    handleFetch(['allowedFileExt', 'docTypes', 'files']);
  }, []); // No dependencies; only called on initial page render

  // Handle side effects (useDefaultName toggled or staged file change)
  // TODO: consider simplifying (e.g., just disable the input form when toggled on)
  useEffect(() => {
    const { stagedFiles } = formData;
    const { useDefaultName } = formState;
    const defaultName = stagedFiles.length > 0 ? truncateExt(stagedFiles[0].name) : '';
    const currentName = refs.name.current?.value?? '';

    let nameUpdate;

    if (useDefaultName) {
      // useDefaultName toggled on: update form data and return
      nameUpdate = defaultName;
    } else {
      // useDefaultName toggled off: check if the name field should be cleared
      if (currentName !== defaultName) {
        // defaultName was changed while it was toggled on: keep the changes
        nameUpdate = currentName;
      } else {
        // defaultName was not changed: clear the field
        nameUpdate = '';
      }
    }
    setFormData(prev => ({ ...prev, name: nameUpdate }));
  }, [formState.useDefaultName, formData.stagedFiles]);

  /**
   * 
   * @param {*} files 
   */
  const handleStageFiles = (files) => {
    // Ensure input is Files array (not FileList)
    const temp = Array.from(files);
    if (temp.length > 1) {
      notify({
        status: 'error',
        title: 'Error Staging File',
        desc: 'Only (1) file may be staged for upload at a time.'
      });
      return;
    }
    // Init file to stage (must be an array for multer.array() middleware on backend)
    const fileToStage = [temp[0]];
    onChange({ target: { name: 'stagedFiles', type: 'file', files: fileToStage } });
  };

  /**
   * 
   * @param {*} e 
   */
  const handleChangeDate = (e) => {
    // Get the raw value of the Date picker input ('yyyy-MM-dd')
    const datePickerVal = e.target.value;
    if (!datePickerVal) return;
    // Get the date components
    const [year, month, day] = datePickerVal.split('-');
    // Create a new local date with time set to midnight
    const dateLocal = new Date(year, month - 1, day);
    // Pass a copy of e with updated target to onChange
    onChange({ 
      ...e,
      // Only need to update target.value with the new local date
      target: { ...e.target, value: dateLocal.toISOString() }
    });
  };

  /* Handle opening drawer and rendering the UploadForm */
  const handleOpenForm = () => {
    onDrawerOpen(<Text>Upload New File</Text>, <UploadForm onUpdate={handleStageFiles} />);
  };

  /* Toggle useDefaultName state */
  const handleToggleUseDefaultName = () => {
    setFormState(prev => ({ ...prev, useDefaultName: !prev.useDefaultName }));
  }

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

    /**
   * 
   * @param {*} e 
   * @returns 
   */
  const handleSubmitForm = async () => {
    // TODO: implement async wrapper function (similar to backend)
    try {
      const res = await onSubmit(`${docsApi}/create`, { headers: { 'Content-Type': 'multipart/form-data' } });
      notify({ status: 'success', title: 'Document Created', desc: res.message });
    } catch (err) {
      notify({ status: 'error', title: 'Error Creating Document', desc: getErrorMsg(err) });
    } finally {
      // If CreateDocForm is being rendered in a drawer, refresh fetched data and close drawer
      if (onUpdate) onUpdate();
    }
  };

  return (
    <CreateDocFormUI 
      refs={refs}
      fetched={fetched}
      formData={formData}
      formState={formState}
      loading={loading}
      submitting={submitting}

      drawerMenu={<DrawerMenu />}

      isOpen={isOpen}
      drawerContent={drawerContent}
      onCloseForm={onDrawerClose}

      onChangeField={onChange}
      onChangeDate={handleChangeDate}
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
