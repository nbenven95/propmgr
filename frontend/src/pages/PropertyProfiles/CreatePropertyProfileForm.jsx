import { useEffect, useRef, useState } from 'react';

import CreatePropertyProfileFormUI from './CreatePropertyProfileFormUI';

import useFetch from '../../hooks/useFetch.jsx';
import useNotify from '../../hooks/useNotify.jsx';
import useDrawer from '../../hooks/useDrawer.jsx';
import useFormData from '../../hooks/useFormData.jsx';

import { getErrorMsg, truncateExt } from '../../util/util.js';

import EndpointEnum from '../../util/EndpointEnum.js';

const { DOCUMENTS_API } = EndpointEnum; // TODO: add POLICIES_API, OPSYS_API, SUBUNITS_API 

const CreatePropertyProfileForm = ({ onUpdate }) => {

  /* Note: for any of the fetched resources (Documents, Policies, OpSys, Subunits), don't allow the user to create new ones directly.
      For simplicity, just have a dropdown menu (e.g., 'select documents to attach'); this should open a drawer that renders DocsPage,
      but with additional controls. Next to each DocCard, there should be an option to "attach"; at the top of the drawer view, there
      should be bulk mode enable/disable controls; in bulk select mode, the user can select multiple documents at once to attach. If there
      are no Documents to choose from (or the user wishes to create a new one), the Create(+) link should still be functional when rendering
      the form, allowing the user to create new resources without leaving the main Property creation page. This functionality should
      be available for all resources that have non-embedded schema (i.e., they must be fetched separately): docs, opsys, subunits, policies

      Make a new copy of useBulkMode (useBulkOp) that handles generic bulk operations, not just bulk delete. On init, the user should
      provide the bulk operation that they wish to execute. The hook should also return a BulkController component (copy this functionality
      from UIHeader). Bulk controller should somehow take a list of items (e.g., DocCard) and apply the bulk control components (i.e., the
      selection checkbox).
  */
  const { formData, setFormData, submitting, onChange, onSubmit } = useFormData([
    { name            : { init: '', required: true } },
    { apn             : { init: '', required: false } }, // Assessor Parcel Number (Tax ID #)
    { dateBuilt       : { init: '', required: false } }, // Date of Property construction
    { dateAcq         : { init: '', required: false } }, // Date of Property acquisition (may be same as dateBuilt)
    { address         : { init: null, required: true } },
    { phone           : { init: null, required: false } },
    { geoCode         : { init: null, required: false } }, // Latitude/longitude
    { wastePickupSched: { init: null, required: false } },
    { insurancePolicy : { init: null, required: false } }, // TODO: create endpoint
    { opSystems       : { init: [], required: false } }, // TODO: create endpoint
    { documents       : { init: [], required: false } }, 
    { subunits        : { init: [], required: false } }, // TODO: create endpoint
    { notes           : { init: [], required: false } },
  ]);

  const { loading, fetched, onFetchMany } = useFetch([
    { properties: { init: [], url: PROPERTIES_API } }
  ]);

  const { drawerContent, isOpen, onDrawerOpen, onDrawerClose, DrawerMenu } = useDrawer();

  const notify = useNotify();

  const [formState, setFormState] = useState({
    useDefaultDateAcq: false // Is dateAcq the same as dateBuilt? (If true, set dateBuilt to dateAcq)
  });

  // Init element references
  const refs = {
    dateBuilt: useRef(),
    useDefaultDateAcq: useRef() // TODO: assign this to checkbox
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

  // Handle side effects of initial page render
  useEffect(() => {
    handleFetch(['properties']);
  }, []);

  // Handle side effects of toggling 'useDefaultDateAcq' on/off
  useEffect(() => {
    setFormData(prev => {
      // If useDefaultDateAcq was toggled on, overwrite dateAcq with dateBuilt
      if (formState.useDefaultDateAcq) return { ...prev, dateAcq: prev.dateBuilt }
      // Clear the form if toggled off
      return { ...prev, dateAcq: '' };
    });
  }, [formState.useDefaultDateAcq]);

  // Handle side effects of manually editing dateAcq after enabling 'useDefaultDateAcq'
  useEffect(() => {
    setFormState(prev => {
      if (prev.useDefaultDateAcq) {
        // If useDefaultDateAcq was enabled (resulting in dateAcq being overwritten with dateBuilt), do nothing
        if (formData.dateAcq === refs.dateBuilt.current?.value) return prev;
        // Else, the user altered the value: disable 'useDefaultDateAcq'
        return { ...prev, useDefaultDateAcq: false };
      }
      // Do nothing if 'useDefaultDateAcq' is disabled
      return prev;
    });
  }, [formData.dateAcq]);

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

  const handleToggleUseDefaultDateAcq = () => {
    setFormState(prev => ({ ...prev, useDefaultDateAcq: !prev.useDefaultDateAcq }));
  };

  const handleSubmitForm = async () => {
    try {
      const res = await onSubmit(
        `${PROPERTIES_API}/create`,
        //{ headers: { 'Content-Type': 'multipart/form-data' } } // TODO: do we need these headers?
      );
      notify({ status: 'success', title: 'Property Profile Create', desc: res.message });
    } catch (err) {
      notify({ status: 'error', title: 'Error Creating Property Profile', desc: getErrorMsg(err) });
    } finally {
      if (onUpdate) onUpdate();
    }
  };

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