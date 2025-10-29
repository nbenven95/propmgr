import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { PhoneNumberUtil } from 'google-libphonenumber';

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

  console.count('CreatePropertyForm render');

  const { DOCUMENTS_API, PROPERTIES_API } = EndpointEnum; // TODO: add POLICIES_API, OPSYS_API, SUBUNITS_API 

  /* Note: for any of the fetched resources (Documents, Policies, OpSys, Subunits), don't allow the user to create new ones directly.
      For simplicity, just have a dropdown menu (e.g., 'select documents to attach'); this should open a drawer that renders DocsPage,
      but with additional controls. Next to each DocCard, there should be an option to "attach"; at the top of the drawer view, there
      should be bulk mode enable/disable controls; in bulk select mode, the user can select multiple documents at once to attach. If there
      are no Documents to choose from (or the user wishes to create a new one), the Create(+) link should still be functional when rendering
      the form, allowing the user to create new resources without leaving the main Property creation page. This functionality should
      be available for all resources that have non-embedded schema (i.e., they must be fetched separately): docs, opsys, subunits, policies
  */
  const {
    formData,
    setFormData,
    required,
    ready,
    submitting,
    onChange
  } = useFormData([
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

  // Init hook for fetching resources
  const { loading, fetched, onFetchMany } = useFetch([
    { docs: { init: [], url: DOCUMENTS_API } }
  ]);

  // Init hook for rendering forms in collapsable drawer
  //const { drawerContent, isOpen, onDrawerOpen, onDrawerClose, DrawerMenu } = useDrawer();

  // General form state
  const [formState, setFormState] = useState({
    useDefaultDateAcq: false, // Is dateAcq the same as dateBuilt? (If true, set dateBuilt to dateAcq)
    isPhoneValid: false
  });

  // Init hook for rendering popup messages
  const notify = useNotify();

  // Init element references
  const refs = {
    addressInput: useRef(),
    dateBuilt: useRef(),
    useDefaultDateAcq: useRef(),
  };

  // Phone number validator
  const phoneUtil = PhoneNumberUtil.getInstance();

  /* Helper function: wrapper for PhoneNumberUtil.isValidNumber */
  const isPhoneValid = (phone) => {
    try {
      return phoneUtil.isValidNumber(phoneUtil.parseAndKeepRawInput(phone));
    } catch(err) {
      console.error(getErrorMsg(err));
      return false;
    }
  };

  /* Toggles the state of boolean form fields */
  const toggleFormState = (field) => setFormState(prev => ({ ...prev, [field]: !prev.field }));

  const handleFetch = async (resources) => {
    const errs = await onFetchMany(resources);
    // On failure to fetch, just log to console
    if (errs.length > 0) {
      const numErrors = errs.length;
      const label = plural('resource', numErrors);
      console.error(`Failed to fetch (${numErrors}) ${label}: ${errs.join(', ')}`);
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

  const handleChangeAddress = (data) => {
    const { address, geocode, extent } = data;
    setFormData(prev => ({ ...prev, address, geocode, extent }));
  };

  const handleClearAddress = () => {
    setFormData(prev => ({ ...prev, address: null, geocode: [], extent: [] }));
  };

  /**
   * Note: need to wrap with 'useCallback' b/c PhoneInputForm is memoized
   */
  const handleChangePhone = useCallback((phone) => {
    setFormData(prev => ({ ...prev, phone }));
  }, []);

  const handleClearPhone = useCallback(() => {
    setFormData(prev => ({ ...prev, phone: '' }));
  }, []);

  // TODO: find a way to use onSubmit from useFormData so we can use its `submitting` state.
  // TODO: e.g., for simplicity, maybe just add an optional parameter to directly provide the payload for cases like this?
  const handleSubmitForm = async () => {
    try {
      // De-structure form data state
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

      /* Helper function: parses an object into a JSON string */
      function parseJson(obj) {
        // If null, return undefined instead of parsing null to string 'null'
        return obj ? JSON.stringify(obj) : undefined;
      }

      /* Helper function: parses an array into a JSON string */
      function parseArray(obj) {
        // If empty, return undefined instead of parsing [] to string '[]'
        return Array.isArray(obj) && obj.length > 0
          ? JSON.stringify(obj)
          : undefined
      }

      // Manually parse all nested JSON objects and arrays to JSON strings
      const preparedData = {
        ...others,
        address         : parseJson(address),
        insurancePolicy : parseJson(insurancePolicy),
        wastePickupSched: parseJson(wastePickupSched),
        geocode         : parseArray(geocode),
        extent          : parseArray(extent),
        notes           : parseArray(notes),
        documents       : parseArray(documents),
        opSystems       : parseArray(opSystems),
        subunits        : parseArray(subunits)
      };

      const url = `${PROPERTIES_API}/create`;

      // Headers needed for backend middleware to correctly parse payload
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
  
      // Submit POST request
      const res = await axios.post(url, preparedData, config);
      // TODO: fix formatting of backend success/error messages to match with Document controller
      const msg = res.data?.message?? 'Success';
      notify({ status: 'success', title: 'Property Profile Created', desc: msg });
    } catch (err) {
      notify({ status: 'error', title: 'Error Creating Property Profile', desc: getErrorMsg(err) });
    } finally {
      onUpdate?.(); // Call onUpdate to handle cleanup (if defined)
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
      ready={ready}
      submitting={submitting}
      required={required}
      formData={formData}
      formState={formState}
      onClickSubmit={handleSubmitForm}
      onToggleDefaultDate={() => toggleFormState('useDefaultDateAcq')}
      onChangeField={onChange}
      onChangeDate={handleChangeDate}
      onChangePhone={handleChangePhone}
      onClearPhone={handleClearPhone}
      onChangeAddress={handleChangeAddress}
      onClearAddress={handleClearAddress}
    />
  );
};

export default CreatePropertyProfileForm;