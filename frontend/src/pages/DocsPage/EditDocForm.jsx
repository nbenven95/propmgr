import { useEffect, useRef, useState } from 'react';

import useFetch from '../../hooks/useFetch';
import useNotify from '../../hooks/useNotify';
import useDrawer from '../../hooks/useDrawer';
import useFormData from '../../hooks/useFormData';
import EditDocFormUI from './EditDocFormUI';
import EndpointEnum from '../../util/EndpointEnum';
import { getLocalTimestamp } from '../../util/util';

const { DOCS_API, DOC_TYPE_API, FILES_API, FILE_EXT_API } = EndpointEnum;

/**
 * 
 * @param {*} props 
 * @returns 
 */
const EditDocForm = ({ doc, onUpdate }) => {

  if (!doc) throw Error(`Invalid value for \"doc\": ${doc}`);

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

  // De-structure doc fields
  const {
    name,
    docType,
    stagedFiles,
    dateCreate,
    dateEff,
    expiry,
    fileRef
  } = doc;

  const {
    formData,
    setFormData,
    required,
    ready,
    submitting,
    onChange,
    onSubmit
  } = useFormData([
    { name        : { init: name, required: true } },
    { docType     : { init: docType, required: true } },
    { dateCreate  : { init: dateCreate?? new Date().toISOString(), required: false } },
    { dateEff     : { init: dateEff?? '', required: false} },
    { expiry      : { init: expiry?? '', required: false } },
    { fileRef     : { init: fileRef?? '', required: false } },
    { stagedFiles : { init: [], required: false } }
  ]);

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

  // Handle side effects of initial page render
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
  }, []);

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
