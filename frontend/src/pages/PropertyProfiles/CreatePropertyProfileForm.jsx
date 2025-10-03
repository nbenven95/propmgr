import axios from 'axios';
import { useEffect, useRef, useState } from 'react';

import CreatePropertyProfileFormUI from './CreatePropertyProfileFormUI';

import useFetch from '../../hooks/useFetch.jsx';
import useNotify from '../../hooks/useNotify.jsx';
import useDrawer from '../../hooks/useDrawer.jsx';
import useFormData from '../../hooks/useFormData.jsx';

import { getErrorMsg } from '../../util/util.js';

import EndpointEnum from '../../util/EndpointEnum.js';

/**
 * 
 * @param {*} props
 * @returns 
 */
const CreatePropertyProfileForm = ({ onUpdate }) => {

  const { DOCUMENTS_API, PROPERTIES_API } = EndpointEnum; // TODO: add POLICIES_API, OPSYS_API, SUBUNITS_API 

  /* Note: for any of the fetched resources (Documents, Policies, OpSys, Subunits), don't allow the user to create new ones directly.
      For simplicity, just have a dropdown menu (e.g., 'select documents to attach'); this should open a drawer that renders DocsPage,
      but with additional controls. Next to each DocCard, there should be an option to "attach"; at the top of the drawer view, there
      should be bulk mode enable/disable controls; in bulk select mode, the user can select multiple documents at once to attach. If there
      are no Documents to choose from (or the user wishes to create a new one), the Create(+) link should still be functional when rendering
      the form, allowing the user to create new resources without leaving the main Property creation page. This functionality should
      be available for all resources that have non-embedded schema (i.e., they must be fetched separately): docs, opsys, subunits, policies
  */
  const { formData, setFormData, submitting, onChange, onSubmit } = useFormData([
    { name            : { init: '', required: true } },
    { address         : { init: null, required: true } },
    { geocode         : { init: [], required: false } }, // Longitude/latitude
    { extent          : { init: [], required: false } }, // Bounding box [west, south, east, north]
    { apn             : { init: '', required: false } }, // Assessor Parcel Number (Tax ID #)
    { dateBuilt       : { init: '', required: false } }, // Date of Property construction
    { dateAcq         : { init: '', required: false } }, // Date of Property acquisition (may be same as dateBuilt)
    { phone           : { init: '', required: false } },
    { wastePickupSched: { init: null, required: false } },
    { notes           : { init: [], required: false } },
    { documents       : { init: [], required: false } }, 
    { insurancePolicy : { init: null, required: false } }, // TODO: create endpoint
    { opSystems       : { init: [], required: false } }, // TODO: create endpoint
    { subunits        : { init: [], required: false } }, // TODO: create endpoint
  ]);

  const { loading, fetched, onFetchMany } = useFetch([
    { docs: { init: [], url: DOCUMENTS_API } }
  ]);

  //const { drawerContent, isOpen, onDrawerOpen, onDrawerClose, DrawerMenu } = useDrawer();

  const notify = useNotify();

  const [formState, setFormState] = useState({
    useDefaultDateAcq: false // Is dateAcq the same as dateBuilt? (If true, set dateBuilt to dateAcq)
  });

  // Init element references
  const refs = {
    addressInput: useRef(),
    dateBuilt: useRef(),
    useDefaultDateAcq: useRef(),
  };

  /**
   * 
   * @param {String} field 
   */
  const toggleFormState = field => setFormState(prev => ({ ...prev, [field]: !prev.field })); // TODO: how to ensure that 'field' is a boolean?

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

  /**
   * 
   * @param {Event} e 
   * @returns 
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

  /**
   * 
   */
  const handleSelectAddress = (locationData) => {
    // Destructure location data from parseFeature
    const { address, geocode, extent } = locationData;
    setFormData(prev => ({ ...prev, address: address, geocode: geocode, extent: extent }));
  };

  /**
   * 
   */
  const handleClearAddress = () => {
    setFormData(prev => ({ ...prev, address: null, geocode: [], extent: [] }));
  };

  /**
   * 
   */
  const handleSubmitForm = async () => {
    try {
      const {
        address,
        geocode,
        extent,
        wastePickupSched,
        notes,
        insurancePolicy,
        documents,
        opSystems,
        subunits,
        ...others // name, apn, phone, dateBuilt, dateAcq
      } = formData;
      const preparedData = {
        ...others,
        address: address ? JSON.stringify(address) : undefined,

        geocode: Array.isArray(geocode) && geocode.length > 0 ? JSON.stringify(geocode) : undefined,

        extent: Array.isArray(extent) && extent.length > 0 ? JSON.stringify(extent) : undefined,

        wastePickupSched: wastePickupSched ? JSON.stringify(wastePickupSched) : undefined,

        notes: Array.isArray(notes) && notes.length > 0 ? JSON.stringify(notes) : undefined,

        insurancePolicy: insurancePolicy ? JSON.stringify(insurancePolicy) : undefined,

        documents: Array.isArray(documents) && documents.length > 0 ? JSON.stringify(documents) : undefined,

        opSystems: Array.isArray(opSystems) && opSystems.length > 0 ? JSON.stringify(opSystems) : undefined,
        
        subunits: Array.isArray(subunits) && subunits.length > 0 ? JSON.stringify(subunits) : undefined
      }
      console.log(preparedData);
      const url = `${PROPERTIES_API}/create`;
      const data = preparedData;
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      const res = await axios.post(url, data, config);
      console.log(res.data?.message);
      //const res = await onSubmit(`${PROPERTIES_API}/create`, { headers: { 'Content-Type': 'multipart/form-data' } });
      //notify({ status: 'success', title: 'Property Profile Create', desc: res.message });
    } catch (err) {
      notify({ status: 'error', title: 'Error Creating Property Profile', desc: getErrorMsg(err) });
    } finally {
      onUpdate?.();
    }
  };

  // Handle side effects of initial page render
  useEffect(() => {
    handleFetch(['docs']);
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

  return (
    <CreatePropertyProfileFormUI
      refs={refs}
      fetched={fetched}
      loading={loading}
      formData={formData}
      formState={formState}
      submitting={submitting}
      onChangeField={onChange}
      onChangeDate={handleChangeDate}
      onClickSubmit={handleSubmitForm}
      onSelectAddress={handleSelectAddress}
      onClearAddress={handleClearAddress}
      onToggleDefaultDate={() => toggleFormState('useDefaultDateAcq')}
    />
  )
};

export default CreatePropertyProfileForm;