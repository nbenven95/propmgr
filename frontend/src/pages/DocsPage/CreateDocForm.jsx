import { useEffect, useRef, useState } from 'react';
import { Text } from '@chakra-ui/react';

import CreateDocFormUI from './CreateDocFormUI';
import UploadForm from '../../pages/FilesPage/UploadForm';

import useFetch from '../../hooks/useFetch.jsx';
import useNotify from '../../hooks/useNotify.jsx';
import useDrawer from '../../hooks/useDrawer.jsx';
import useFormData from '../../hooks/useFormData.jsx';
import EndpointEnum from '../../util/EndpointEnum';
import { getErrorMsg, truncateExt } from '../../util/util.js';

const { DOCS_API, DOC_TYPE_API, FILES_API, FILE_EXT_API } = EndpointEnum;

// TODO: Instead of having a standard file picker, have two buttons: Upload New, Select Existing
// TODO: Clicking Upload New opens the drawer menu and renders the upload form
// TODO: Clicking Select Existing opens the drawer menu and displays all existing Files with the ability to select one

/**
 * 
 * @param {*} props
 * @returns 
 */
const CreateDocForm = ({ onUpdate }) => {

  const notify = useNotify();

  const { onDrawerOpen, onDrawerClose, DrawerMenu } = useDrawer();

  const { 
    isFetching,
    fetched,
    onFetchMany,
    LoadingIndicator
  } = useFetch([
    { allowedFileExt: { init: [], url: FILE_EXT_API } },
    { docTypes      : { init: [], url: DOC_TYPE_API } },
    { files         : { init: [], url: FILES_API } }
  ]);

  const {
    formData,
    setFormData,
    required,
    ready,
    submitting,
    onChange,
    onSubmit
  } = useFormData([
    { name        : { init: '', required: true } },
    { docType     : { init: '', required: true } },
    { stagedFiles : { init: [], required: false } }, // If uploading a new file
    // TODO: fix dateCreate init value so time portion is set to midnight
    { dateCreate  : { init: new Date().toISOString(), required: false } },
    { dateEff     : { init: '', required: false } },
    { expiry      : { init: '', required: false } },
    { fileRef     : { init: '', required: false } }, // If selecting an existing file
  ]);

  // TODO: either stagedFiles or fileRef is required

  const [formState, setFormState] = useState({ useDefaultName: true });

  const refs = {
    name: useRef(),
    stagedFiles: useRef(formData.stagedFiles),
    useDefaultName: useRef()
  };

  const toggleFormState = field => setFormState(prev => ({ ...prev, [field]: !prev.field }));

  const handleFetch = async (resources) => {
    const errs = await onFetchMany(resources);
    // On failure to fetch, just log to console
    if (errs.length > 0) {
      const numErrors = errs.length;
      const label = plural('resource', numErrors);
      console.error(`Failed to fetch (${numErrors}) ${label}: ${errs.join(', ')}`);
    }
  };

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

  const handleOpenUploadForm = () => {
    onDrawerOpen(
      <Text>Upload New File</Text>,
      <UploadForm onUpdate={handleStageFiles} />
    );
  };

  // TODO: when ability to upload new or select existing file is implemented, ensure one or the other is provided
  const handleSubmitForm = async () => {
    try {
      const res = await onSubmit(
        `${DOCS_API}/create`,
        { headers: { 'Content-Type': 'multipart/form-data' } 
      });
      notify({ status: 'success', title: 'Document Created', desc: res.message });
    } catch (err) {
      notify({ status: 'error', title: 'Error Creating Document', desc: getErrorMsg(err) });
    } finally {
      // TODO: if onUpdate is not defined, reset the form (implement in the hook?)
      onUpdate?.();
    }
  };

  // Handle side effects of initial page render
  useEffect(() => {
    handleFetch(['allowedFileExt', 'docTypes', 'files']);
  }, []);

  // Handle side effects of useDefaultName toggled or new file staged/selected
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

  return (
    <CreateDocFormUI 
      refs={refs}
      formState={formState}

      fetched={fetched}
      isFetching={isFetching}
      LoadingIndicator={LoadingIndicator}

      formData={formData}
      required={required}
      ready={ready}
      submitting={submitting}

      // TODO: implement logic to allow user to choose between uploading a new file and selecting an existing one
      DrawerMenu={DrawerMenu}
      onClickUpload={handleOpenUploadForm}
      onStageFiles={handleStageFiles}

      onChangeField={onChange}
      onChangeDate={handleChangeDate}
      onClickSubmit={handleSubmitForm}
      onClickToggle={() => toggleFormState('useDefaultName')}
    />
  );
};

export default CreateDocForm;
