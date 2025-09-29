import axios from 'axios';
import { useEffect, useRef, useState } from 'react';

import CreatePropertyProfileFormUI from './CreatePropertyProfileFormUI';

import useFetch from '../../hooks/useFetch.jsx';
import useNotify from '../../hooks/useNotify.jsx';
import useDrawer from '../../hooks/useDrawer.jsx';
import useFormData from '../../hooks/useFormData.jsx';

import { getErrorMsg } from '../../util/util.js';

import EndpointEnum from '../../util/EndpointEnum.js';

const { DOCUMENTS_API, GEOCODING_API } = EndpointEnum; // TODO: add POLICIES_API, OPSYS_API, SUBUNITS_API 

const CreatePropertyProfileForm = ({ onUpdate }) => {

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
    { apn             : { init: '', required: false } }, // Assessor Parcel Number (Tax ID #)
    { dateBuilt       : { init: '', required: false } }, // Date of Property construction
    { dateAcq         : { init: '', required: false } }, // Date of Property acquisition (may be same as dateBuilt)
    { address         : { init: null, required: true } },
    { phone           : { init: null, required: false } },
    { geoCode         : { init: [], required: false } }, // Longitude/latitude
    { wastePickupSched: { init: null, required: false } },
    { insurancePolicy : { init: null, required: false } }, // TODO: create endpoint
    { opSystems       : { init: [], required: false } }, // TODO: create endpoint
    { documents       : { init: [], required: false } }, 
    { subunits        : { init: [], required: false } }, // TODO: create endpoint
    { notes           : { init: [], required: false } },
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
    dateBuilt: useRef(),
    useDefaultDateAcq: useRef() // TODO: assign this to checkbox
  };

  /**
   * 
   * @param {String} field 
   */
  const toggleFormState = (field) => {
    // TODO: how to ensure that 'field' is a boolean?
    setFormState(prev => ({ ...prev, [field]: !prev.field }));
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
   * 
   * @param {*} addr 
   * @returns 
   */
  const handleFetchGeoCode = async (addr) => {
    for (const value in Object.values(addr)) {
      // If any of the fields are null, clear geocode + bounding box form data state and abort fetch
      if (value === null || value === undefined) {
        setFormState(prev => ({ ...prev, geoCode: [], /*boundingBox: []*/ }));
        return;
      }
    }
    const { streetNumber, streetName, city, state, postalCode, country } = address;
    const query = `${streetNumber}, ${streetName}, ${city}, ${state}, ${postalCode}, ${country}`;
    const params = { q: query, format: 'json', limit: 1, addressdetails: 1 };
    const headers = { 'User-Agent': 'RisePropertyManager/1.0 (nbenveniste@riseservices.org)' }; // TODO: read user agent from env
    try {
      const response = await axios.get(GEOCODING_API, { params, headers });
      console.log('Geocode fetch result:', response.data);
      const { lat, lon, boundingbox } = response.data;
      setFormData(prev => ({ ...prev, geoCode: [lon, lat], /*boundingBox: [...boundingbox]*/ })); // TODO: set boundingBox form state (need to update propertyprofile schema)
    } catch (err) {
      console.error('Error fetching geocode:', err);
      // Clear form data state on failed API request
      setFormState(prev => ({ ...prev, geoCode: [], /*boundingBox: []*/ }));
    }
  };


  /*
  // Handle side effects of initial page render
  useEffect(() => {
    handleFetch(['docs']);
  }, []);

  // Handle effects of address field update
  useEffect(() => {
    handleFetchGeoCode(formData.address);
  }, [formData.address]);


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
  */

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
      onSubmit={handleSubmitForm}
      onToggleDefaultDate={() => toggleFormState('useDefaultDateAcq')}
    />
  )
};

export default CreatePropertyProfileForm;