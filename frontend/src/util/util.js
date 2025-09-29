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
 * 
 * @param {String} dateStr An ISO 8601 date string (UTC)
 * @returns 
 */
export const formatDisplayDate = (dateStr) => {
  if (!dateStr) return '';
  // Use en-CA locale for 'yyyy-MM-dd' output formatting
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    year    : 'numeric',
    month   : '2-digit',
    day     : '2-digit'
  }).format(new Date(dateStr));
}; // TODO: look into alternatives to handle cases where Intl isn't supported by a browser

/**
 * Get the current local date/time in ISOO 8601 format (yyyy-MM-ddThh:mm:ss).
 * 
 * Note: the difference between this and `new Date(Date.now()).toISOString()`
 * is that this function returns the local date/time, not UTC. This function
 * also does not include milliseconds or the trailing 'Z' (this indicates UTC).
 * 
 * @returns The local timestamp as a String in the format 'yyyy-MM-ddThh:mm:ss'
 */
export const getLocalTimestamp = () => { // TODO: deprecate?
  const now     = new Date();
  const year    = now.getFullYear();
  const month   = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed, need to add 1
  const day     = String(now.getDate()).padStart(2, '0');
  const hours   = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  //return `${year}-${month}-${day}T00:00:00`;
};

/**
 * 
 * @param {*} url 
 * @param {*} timeout 
 * @returns 
 */
export const isServerReachable = async (url, timeout = 5000) => {
  try {
    // Resolve Promise when as soon as fetch or timeout finishes (success or failure)
    const response = await Promise.race([ // Note: Promise.race resolves as soon as the first Promise in this array resolves or rejects
      fetch(url), 
      new Promise((resolve, reject) => {
        // Reject Promise if timeout is reached (throw error so we can catch/handle this condition separately)
        setTimeout(() => reject(new Error(`Service Unreachable: ${url}`)), timeout)
      })
    ]);
    // Timeout not exceeded: return response status (may still be false)
    return response.ok;
  } catch (err) {
    // Timeout exceeded: server unreachable
    console.error(err);
    return false;
  }
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
// TODO: consider refactoring delete logic into a hook that also returns a delete button component (possibly do this with edit and create?)
// TODO: or, just deprecate this (pretty redundant)
export const onDeleteSingle = async (uri) => {
  const res         = await axios.delete(uri);
  const httpRes     = res.data;
  const deletedItem = httpRes.data;
  return deletedItem;
};

/**
 * 
 * @param {*} uri 
 * @param {*} fileName 
 */
// TODO: consider refactoring this into a hook that returns a download button component
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