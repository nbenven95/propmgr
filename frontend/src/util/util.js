import axios from 'axios';

/**
 * 
 * @param {*} err 
 * @returns 
 */
export const getErrorMsg = (err) => {
  return err.response?.data?.message || err.message || err.name || err.code;
};

/**
 * Truncate the file extension from the given filename
 * 
 * @param {} filename 
 * @returns 
 */
export const truncateExt = (filename) => {
  const lastDotIndex = filename?.lastIndexOf('.');
  if (lastDotIndex === -1) return filename; // No extension
  return filename?.substring(0, lastDotIndex);
};

/**
 * Get the current local date/time in ISOO 8601 format (yyyy-MM-ddThh:mm:ss).
 * 
 * Note: the difference between this and `new Date(Date.now()).toISOString()`
 * is that this function returns the local date/time, not UTC. This function
 * also does not include milliseconds or the trailing 'Z' (this indicates UTC).
 * 
 * @returns The local timestamp as a String in the format 'yyyy-MM-ddThh:mm:ss'
 */
export const getLocalTimestamp = () => {
  const now     = new Date();
  const year    = now.getFullYear();
  const month   = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed, need to add 1
  const day     = String(now.getDate()).padStart(2, '0');
  const hours   = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

/**
 * Note: this assumes that the DELETE endpoint controller on the backend
 * puts the deleted item into the .data field of the HTTP response. The
 * entire HTTP response is stored in the axios response object's .data field.
 * To access the deleted item via the axios response object:
 *    httpRes         = res.data;
 *    deletedItem     = httpRes.data;
 *    deletedItemName = deletedItem.name;
 * This all assumes that your endpoint controller is correctly constructing its
 * HTTP responses by placing the deleted item into the HTTP response's .data field.
 * 
 * @param {*} uri URI corresponding to the resource's DELETE API endpoint, followed
 *                by a '/' and the ObjectID of the resource instance to delete.
 * @throws        Error if the API request fails
 * @returns       The deleted item
 */
export const handleDeleteSingle = async (uri) => {
  const res         = await axios.delete(uri);
  const httpRes     = res.data;
  const deletedItem = httpRes.data; // TODO: how to handle cases where this is null/undefined? 
  return deletedItem;
};

/**
 * 
 * @param {*} uri 
 * @param {*} fileName 
 */
export const handleDownload = async (uri, fileName) => {
  // Attempt API request, expect binary object (blob) response type
  const res = await axios.get(uri, { responseType: 'blob' });
  // On success, create a new URL for the blob using the response data
  const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
  // Create a temporary link for the blob; set the URL and download attributes
  const blobLink = document.createElement('a');
  blobLink.href = blobUrl;
  blobLink.setAttribute('download', fileName);
  // Add the blob link to the DOM, 'click' it to initiate download
  document.body.appendChild(blobLink);
  blobLink.click();
  // Remove the temp blob link from the DOM
  document.body.removeChild(blobLink);
  window.URL.revokeObjectURL(blobUrl);
};

// TODO: refactor into useDrawer hook, then deprecate
export const handleOpenDrawer = (headerContent, bodyContent, setDrawerContent, onOpen) => {
  setDrawerContent({
    header: headerContent,
    body  : bodyContent
  });
  onOpen(); // From useDisclosure()
};

// TODO: refactor into useFormData hook, then deprecate
/**
 * Handles updating formData state when user inputs new form data.
 * Intended to be used as the argument for the onChange attribute
 * for @chakra-ui/react.Input
 * 
 * e.g., formData = { firstName: '' }
 * <Input
 *   type='text'
 *   placeholder='Enter your first name'
 *   value={formData.firstName}
 *   onChange={handleChange('firstName')}
 * />
 * 
 * @param {*} field 
 * @returns 
 */
export const handleChange = (field) => (e) => {
  setFormData(prev => ({
    ...prev,
    [field]: e.target.value
  }));
};

// TODO: deprecate
export const toastSuccess = (toast, title, desc) => {
  toast({ title: title, description: desc, status: 'success', duration: 3000, isClosable: true });
};

// TODO: deprecate
export const toastError = (title, desc) => {
  toast({ title: title, description: desc, status: 'error', duration: 3000, isClosable: true });
};

// TODO: deprecate
export const handleFetch = async (resource, url, setLoading, setFetched) => {
  let fetchError = null;
  try {
    // Set loading state of resource
    setLoading(prev => ({
      ...prev,
      [resource]: true
    }));
    const res = await axios.get(url);
    // Update fetched data for the resource
    setFetched(prev => ({
      ...prev,
      [resource]: res.data
    }));
  } catch (err) {
    // On failed API request, save the error so we can propagate it
    fetchError = err;
  } finally {
    // Update loading state of resource
    setLoading(prev => ({
      ...prev,
      [resource]: false
    }));
  }
  // If resource fetch failed, propagate the error
  if (fetchError) throw new Error(fetchError.message);
};

// TODO: deprecate
export const handleDeleteBulk = async (url, bulkMode, setBulkMode) => {
  // No items selected for bulk mode operations, return empty array
  if (bulkMode.selected.length === 0) return [];
  // Attempt bulk delete, collect individual responses into an array
  const responses = await Promise.all(
    // Use handleDeleteSingle to attempt deletion of each selected item
    bulkMode.selected.map(id => handleDeleteSingle(id, url))
  );
  // On success, reset bulkMode.
  setBulkMode({
    enabled:  false,
    selected: []
  });
  // Map names of each deleted item into a separate array, return them
  return responses.map(res => res.data?.data?.name);
};

// TODO: deprecate
export const handleToggleSelect = (id, bulkMode, setBulkMode) => {
  // Check if bulkMode is enabled
  if (!bulkMode.enabled) return;
  // Get the current list of selected items
  const selected = bulkMode.selected;
  // Check if the item is already selected
  const updatedSelection = selected.includes(id)
    // Item is already selected => toggle select off: remove its ID from selected
    ? selected.filter(_id => _id !== id)
    // Item is not selected => toggle select on: add its ID to selected
    : [...selected, id]
  // Update bulkMode with new state
  setBulkMode(prev => ({
    ...prev,
    selected: updatedSelection
  }));
};