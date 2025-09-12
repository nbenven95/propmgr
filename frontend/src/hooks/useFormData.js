import axios from 'axios';
import { useCallback, useState } from 'react';

/**
 * 
 * @param {*} initFormData
 * @param {*} required
 * 
 * @note Parameters must be passed as kwargs in an object
 * 
 * @returns 
 */
export default function useFormData({initFormData, required}) {
  /**
   * `formData` should contain string keys that correspond to
   * names of input fields on your form, with the associated
   * values being the data that is read from those fields.
   */
  const [formData, setFormData] = useState(initFormData);
  /**
   * `required` should be an object containing key/value pairs,
   * where each key corresponds 1:1 with keys in `formData`.
   * The associated values indicate whether or not the corresponding
   * field in `formData` is required for submission.
   */
  const _required = Object.freeze(required); // TODO: validate input
  /**
   * Form submission state.
   *    true : submission in progress
   *    false: submission complete/submission not started
   */
  const [submitting, setSubmitting] = useState(false);

  /**
   * Update state when the value of a form field changes,
   * regardless of type (i.e., works with text, file, and
   * multi-file).
   * 
   * @param {*} e
   * @returns
   * 
   * @usage Assign as the callback to handle onChange events
   *        for <input/> forms; e.g., onChange={handleChange},
   *        onChange={e => handleChange(e)}
   * 
   * @note  You must add a 'name' property to your file input element
   *        with the same value as the name of your state variable
   *        (e.g., stagedFiles).
   */
  const handleChange = useCallback(e => {
    // De-structure target element
    const { name, type, files, value, checked } = e.target;
    let stateUpdate = null;
    // Check the input type
    switch (type) {
      // Handle file input
      case 'file': {
        // Check for single or multiple files
        stateUpdate = files.length > 1 ? Array.from(files) : files[0];
        break;
      }
      // Handle checkbox input
      case 'checkbox': {
        stateUpdate = checked;
        break;
      }
      // Handle all other input types
      default: {
        stateUpdate = value;
        break;
      }
    }
    // Perform the state update
    //setFormData(prev => ({ ...prev, [name]: stateUpdate }));
    setFormData(prev => {
      // Handle case where multiple files are set: filter duplicates
      if (type === 'file' && files.length > 1) {
        // Init filtered files with most up-to-date state
        const filteredFiles = [...prev[name]]; // TODO: not sure if this is how to access the stagedFiles field generically
        // Only add files from stateUpdate that have not already been staged 
        stateUpdate.forEach(file => {
          // Check if the current file in stateUpdate is already staged
          const alreadyStaged = filteredFiles.some(f => {
            return f.name === file.name && f.size === file.size;
          });
          // If not already staged, add the file to filtered files list
          if (!alreadyStaged) filteredFiles.push(file);
        })
        // Update state with the filtered files list
        return { ...prev, [name]: filteredFiles }
      }
      // Else, perform the state update as usual
      return { ...prev, [name]: stateUpdate }
    });
  }, []);

  /**
   * Construct FormData payload from current form data state (helper).
   * 
   * @throws  Error if a required field is empty
   * @returns A FormData object containing all non-empty fields
   */
  const getPayload = () => {
    // Construct payload (FormData object) from current form data state
    const payload = new FormData();
    Object.keys(formData).forEach(field => {
      // Check if the field is required
      if (_required[field] && !formData[field]) {
          // Throw an error if the field is required but empty
          // TODO: change this error message to be more specific about required fields 
          const err = `Invalid value \"${formData[field]}\" for field \"${field}\"`;
          throw new Error(err);
      }
      // Else, append field if non-empty (guaranteed to be non-empty if it is required)
      if (formData[field]) payload.append(field, formData[field]);
    });
    return payload;
  };

  /**
   * @param uri
   * @param args (OPTIONAL)
   */
  const handlePost = useCallback(async (uri, data, args = {}) => {
    // Variable to store response
    let postRes = null;
    // Variable to store error (if we catch one) so we can propagate it
    let postErr = null;
    // Attempt POST request
    try {
      setSubmitting(true);
      postRes = await axios.post(uri, data, args);
    } catch (err) {
      postErr = err;
    } finally {
      setSubmitting(false);
    }
    // Propagate any errors that we caught
    if (postErr) throw new Error(postErr);
    // Else, return the response data on success
    return postRes.data.data;
  }, []);

  /**
   * @param {*} uri
   * @param {*} args (OPTIONAL)
   */
  const handlePut = useCallback(async (uri, data, args = {}) => {
    let putRes = null;
    let putErr = null;
    try {
      setSubmitting(true);
      putRes = await axios.put(uri, data, args);
    } catch (err) {
      putErr = err;
    } finally {
      setSubmitting(false);
    }
    // Propagate any errors that we caught
    if (putErr) throw new Error(putErr);
    // Else, return the response data on success
    return putRes.data.data;
  }, []);

  // Return relevant state/callbacks for the hook
  return { formData, setFormData, getPayload, submitting, handleChange, handlePost, handlePut };
}