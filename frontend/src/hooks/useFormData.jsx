import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';

export default function useFormData(fields) {

  // Ensure input is an array
  if (!Array.isArray(fields)) {
     throw new Exception(`Invalid type for argument \`fields\`: ${typeof fields}`);
  }

  // Map `fields` to an array of key/value pairs (key=fieldName, value=initValue)
  const formDataArray = fields.map(field => {
    // Note: for some reason this returns a two-element array; only the first elem has valid data
    const [name, { init, _ }] = Object.entries(field)[0];
    // Return the corresponding key/value pair (to be used with formData state)
    return { [name]: init };
  });

  // Map `fields` to an array of key/value pairs (key=fieldName, value=isFieldRequired)
  const requiredArray = fields.map(field => {
    // Unpack the row from the input object
    const [name, { _, required }] = Object.entries(field)[0];
    // Return the key/value pair to be used in our isFieldRequired lookup table
    return { [name]: required };
  });

  // State to track current data that has been input into form fields
  const [formData, setFormData] = useState(Object.assign({}, ...formDataArray));

  // Lookup table to check if a given field is required for form submission
  const required = Object.freeze(Object.assign({}, ...requiredArray));

  // State to track if the form is ready to submit (i.e., all required fields are filled out)
  const [ready, setReady] = useState(false);

  // State to track if the form is currently submitting
  const [submitting, setSubmitting] = useState(false);

  // Validate form data on state change, set validation flag (e.g., disable submit button until all req fields are filled)
  useEffect(() => {
    let ready = true;

    for (const [field, data] of Object.entries(formData)) {
      // Check missing required fields
      if (required[field] && (data === null || data === undefined || data === '')) {
        console.log(`Missing required field: ${field}`);
        ready = false;
      }
      // TODO: other validation? (e.g., check for garbage input)
    }

    if (ready) console.log('Ready to submit!');
    setReady(ready)
  }, [formData]);

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
   * @note  YOU MUST ADD A 'name' PROPERTY TO YOUR INPUT ELEMENTS
   *        WITH THE SAME NAME YOU PROVIDE THE FIELD ON INIT.
   *        (e.g., name='stagedFiles').
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
   * Combine and de-duplicate two File arrays
   * 
   * @param {array} stagedFiles
   * @param {array} filesToStage
   * @returns An updated array containing all elements from files1
   *          with non-duplicate elements from files2 inserted.
   */
  function combineAndDeduplicate(stagedFiles, filesToStage) {
    if (!Array.isArray(stagedFiles)) {
      throw new Error(`Invalid type for argument \`stagedFiles\`: ${typeof stagedFiles}`);
    }
    if (!Array.isArray(filesToStage)) {
      throw new Error(`Invalid type for argument \`filesToStage\`: ${typeof filesToStage}`);
    }

    /* Helper function: check if two files are the same */  
    function isSameFile(file, other) {
      return file?.name === other?.name && file?.size === other?.size;
    }

    /* Helper function: check if a file is already staged */
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
    const payload = new FormData();

    // TODO: change this to `for (const [field, data] of Object.entries(formData))`
    Object.keys(formData).forEach(field => {   
      // Value of the current form field
      const value = formData[field];
      
      /* Helper function: check if input is a File/Blob */
      function isFile(obj) {
        return obj instanceof File || (obj instanceof Blob && obj.size > 0);
      }
      
      /* Helper function: check if input is an array of Files */
      function isFileArray(obj) {
        if (!Array.isArray(obj)) return false;
        return obj.every(item => isFile(item));
      }
      
      // TODO: try to generalize more; e.g., handle FileList objects directly, single Files, etc.

      // Append field and corresponding value depending on the field type
      if (isFileArray(value) && value.length > 0) {
        // Handle appending array of Files
        value.forEach(file => {
          // Note: if appending multiple Files to the same key (`files`), this key is parsed as an array by Multer
          payload.append('files', file);
        });
      } else if (value !== undefined && value !== null) {
        // Handle appending generic data (only fields that are non-null)
        payload.append(field, value);
      }
    });
    return payload;
  };

  /**
   * @param {string} type Can be either 'POST' (e.g., creating a new item using data from a form submission),
   *                      or 'PUT' (e.g., updating an existing item using data from a form submission)
   * @param {string} url
   */
  const onSubmit = useCallback(async (url, config = {}, type = 'POST') => {
    try {      
      // Ensure current form state is valid before continuing
      if (!ready) throw new Error('Missing required field(s)');

      // Set submission state to true
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
        default: {
          // Print a meaningful error message
          throw new Error(`Invalid value for argument \`type\`: ${type}`);
        }
      }

    } catch (err) {
      // Propagate errors
      throw err;
    } finally {
      // Clean up: set submission state to false on success or failure
      setSubmitting(false);
    }

    // Return response data: { success, message, data }
    return res?.data?? (() => {
      throw new Error(`${type.toUpperCase()} request received null/undefined response`)
    })();
  });

  // Return relevant state/callbacks for the hook
  return { formData, setFormData, required, ready, submitting, onChange, onSubmit };
}