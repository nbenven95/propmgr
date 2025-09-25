// TODO: rename this file to helpers.js
import axios from 'axios';

// TODO: write an async wrapper function similar to backend to cut down on try/catch boilerplate

/**
 * Given a whitespace-delimited string, returns a
 * copy of the string with each word capitalized.
 *  
 * @param {*} str 
 * @returns 
 */
export const capitalize = (str) => {
  // Split input string on one or more whitespace
  return String(str).split(/\s+/).map(token => {
    if (token.length === 0) return '';
    // Capitalize the first character of each token if it is a letter
    const firstChar = token.charAt(0);
    if (/[a-z]/.test(firstChar)) {
      return `${firstChar.toUpperCase()}${token.slice(1)} `;
    }
    // First character not a letter (or already capitalized)
    return token;
  }).join(' ');
};

/**
 * 
 * @param {*} err 
 * @returns 
 */
export const getErrorMsg = (err) => {
  return err.response?.data?.message || err.message || err.name || err.code;
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
  //return `${year}-${month}-${day}T00:00:00`;
}; // TODO: deprecate? 

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
export const onDeleteSingle = async (uri) => {
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
export const onDownload = async (uri, fileName) => {
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

/**
 * 
 * @param {*} name 
 * @param {*} count 
 * @returns 
 */
export const plural = (name, count) => `${name}${count > 1 ? 's' : ''}`;

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