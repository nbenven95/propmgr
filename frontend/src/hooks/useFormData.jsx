import axios from 'axios';
import { useCallback, useState } from 'react';

export default function useFormData(fields) {
  
  // TODO: refactor to take one parameter: fields
  // fields will be an array of key/value pairs:
  // { <field_name>: { init: <init_value>, required: <is the field required? (true/false)> } }
  // Build our formData and submitting state from this
  // Can also build an efficient lookup table for required instead of relying on the original input

  const [formData, setFormData] = useState(Object.assign({}, ...fields.map(f => {
    const [name, { init, _ }] = Object.entries(f)[0];
    return { [name]: init };
  })));

  //const _required = Object.freeze(required);
  const required = Object.freeze(Object.assign({}, ...fields.map(f => {
    const [name, { _, required }] = Object.entries(f)[0];
    return { [name]: required };
  })));

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
  const onChange = useCallback(e => {
    // De-structure target element
    const { name, type, files, value, checked } = e.target;
    let stateUpdate = null;
    // Check the input type
    switch (type) {
      // Handle file input
      case 'file': {
        // Always assign as an array of files for consistent handling when filtering duplicates
        stateUpdate = !Array.isArray(files) ? Array.from(files) : files;
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
      }
    }
    // Perform the state update
    setFormData(prev => {
      // Handle state update for FileList
      if (type === 'file' && Array.isArray(stateUpdate)) {
        // Init new files to stage
        const filesToStage = [...stateUpdate]; 
        // Init filtered list with currently staged files; account for prev state being a FileArray or single File
        const stagedFiles = Array.isArray(prev[name]) ? [...prev[name]] : [prev[name]];
        // Init updated staged files list (no duplicates)
        const stagedFilesUpdated = combineAndDeduplicate(filesToStage, stagedFiles);
        // Update state stagedFiles array
        return { ...prev, [name]: stagedFilesUpdated }
      }
      // Else, perform the state update as usual
      return { ...prev, [name]: stateUpdate };
    });
  }, []);

  /**
   * Combine and de-duplicate two FileLists.
   * 
   * @param {*} stagedFiles
   * @param {*} filesToStage
   * @returns An updated FileList containing all elements of files1 with non-duplicate elements from files2 inserted
   */
  function combineAndDeduplicate(stagedFiles, filesToStage) {
    // TODO: is there a Set data structure that could do this for us?
    if (!Array.isArray(stagedFiles) || !Array.isArray(filesToStage)) {
      throw new Error(`${!Array.isArray(stagedFiles) ? 'stagedFiles' : 'filesToStage'} must be an array`);
    }
    // Define helper functions  
    function isSameFile(file, other) {
      return file?.name === other?.name && file?.size === other?.size;
    }
    function isAlreadyStaged(file) {
      return stagedFiles.some(f => isSameFile(file, f));
    }
    const deduplicated = [...stagedFiles];
    // Append all files to the new list that are not already present
    filesToStage.forEach(file => !isAlreadyStaged(file) && deduplicated.push(file));
    return deduplicated;
  }

  /**
   * Construct FormData payload from current formData state (helper).
   * 
   * @throws  Error if a required field is empty
   * @returns A FormData object containing all non-empty fields
   */
  function getPayload() {
    // Construct payload (FormData object) from current form data state
    const payload = new FormData();
    Object.keys(formData).forEach(field => {
      // Check if the field is required
      if (required[field] && !formData[field]) {
          // Throw an error if the field is required but empty
          throw new Error(`Field \"${field}\" is required`);
      }
      const value = formData[field];
      // Check if the field is a File or array of Files
      const isFile = (obj) => obj instanceof File || (obj instanceof Blob && obj.size > 0);
      const isFileArray = (obj) => {
        if (!Array.isArray(obj)) return false;
        return obj.every(item => isFile(item));
      }
      if (isFileArray(value) && value.length > 0) {
        /* The 'files' field is needed by Multer on the backend.
           If we append multiple files to the FormData object
           under the same key, it will be interpretted as an
           array by the server. */
        /* Note: this requires that you use {headers: { 'Content-Type': 'multipart/form-data' }}
           in your POST request so axios knows how to construct (I think? TODO: look into this) */
        value.forEach(file => payload.append('files', file));
      } else if (value !== undefined && value !== null) {
        /* Else, append the value if non-empty (will always
           be non-empty at this point if it is required) */
        payload.append(field, value);
      }
    });
    return payload;
  };

  /**
   * @param {String} type Can be either 'POST' (e.g., creating a new item using data from a form submission),
   *                      or 'PUT' (e.g., updating an existing item using data from a form submission)
   * @param {String} url
   */
  const onSubmit = useCallback(async (url, config = {}, type = 'POST') => {
    try {
      // Set submission state `submitting=true` to indicate submission in progress
      setSubmitting(true);
      // Init FormData payload from the current state
      const payload = getPayload();
      // Perform the request depending on the submission type
      switch (type.toUpperCase()) {
        case 'POST': {
          var res = await axios.post(url, payload, config);
          break;
        }
        case 'PUT' : {
          var res = await axios.put(url, payload, config);
          break;
        }
        default: throw new Error(`Invalid value \"${type}\" for argument \`type\` (must be string \'POST\' or \'PUT\')`);
      }
    } catch (err) {
      // Propagate errors
      throw err;
    } finally {
      // Reset submission state on success or failure
      setSubmitting(false);
    }

    // TODO: refactor this to just return res.data so we can access the response message and not just the resource
    // Return response data; if undefined/null and no error was thrown already, throw one now
    /*
    return res?.data?.data?? (() => {
      throw new Error(`${type.toUpperCase()} request received null/undefined response`)
    })();
    */
    return res?.data?? (() => {
      throw new Error(`${type.toUpperCase()} request received null/undefined response`)
    })();
  });

  // TODO: add an onClear callback to clear all fields

  // Return relevant state/callbacks for the hook
  return { formData, setFormData, submitting, onChange, onSubmit };
}