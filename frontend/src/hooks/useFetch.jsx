import axios from 'axios';
import { useState, useCallback } from 'react';

// TODO: add a DISPLAY_TIMEOUT value that will prevent loading indicators from displaying
// i.e., use a small delay (e.g., 300 ms) before showing the indicator so quick fetches don't make the screen flash
// Keep the loading indicator visible for at least a minimum duration once shown so it doesn't flicker if the fetch completes quickly

// TODO: refactor input parameters
// should now take one argument: resources
// resources will be an array of key/value pairs:
// { <resource_name>: { init: <initial_value>, url: <resource_api_url> }}
// Use this to build out our fetched and loading state
// Can also build an efficient lookup table for endpoints

/**
 * 
 * @param {*} initLoading An object comprised of string keys and boolean
 *                        values. The keys should correspond to the names
 *                        of resources to fetch; they should be the same
 *                        as the resource name at the end of your API endpoint
 *                        (e.g., ${baseUrl}/api/docs -> 'docs'). The associated
 *                        boolean value is the loading/fetched state of
 *                        the resource; these should all be initialized to 'false'.
 *                     
 * @param {*} initFetched An object comprised of string keys and values of arbitrary type.
 *                        The keys should match 1:1 with those in `loading` for
 *                        consistency. The values correspond to the fetched resource
 *                        and must be initialized to the equivalent empty value
 *                        for that type (e.g., object => {}, array => [], string => '').
 * 
 * @note                  Parameters must be passed as kwargs in an object
 * 
 * @returns
 */
export default function useFetch(resources) {

  // e.g., { files: false, docs: false }
  const [loading, setLoading] = useState(Object.assign({}, ...resources.map(r => {
    const [name, { init, url }] = Object.entries(r)[0];
    return { [name]: false }; 
  })));

  // e.g., { files: [], docs: [] }
  const [fetched, setFetched] = useState(Object.assign({}, ...resources.map(r => {
    const [name, { init, url }] = Object.entries(r)[0];
    return { [name]: init };
  })));

  // e.g., { files: 'http://localhost:5000/api/files', docs: 'http://localhost:5000/api/docs' }
  const endpoints = Object.freeze(Object.assign({}, ...resources.map(r => {
     const [name, { init, url }] = Object.entries(r)[0];
    return { [name]: url };
  })));

  /**
   * @param {String} resrc
   */
  const onFetch = useCallback(async (resrc) => {
    try {
      // Get the URL for the resource to fetch
      if (!Object.keys(endpoints).includes(resrc)) {
        // Ensure 'resource' is a valid resource key
        throw new Error(`Invalid resource key \"${resrc}\"`);
      }
      const url = endpoints[resrc];
      // Set loading state of resource
      setLoading(prev => ({ ...prev, [resrc]: true }));
      const res = await axios.get(url);
      // Update fetched data for the resource
      setFetched(prev => ({ ...prev, [resrc]: res.data }));

      // TODO: sleep for a few millis to test loading indicators (disable for production)

    } catch (err) {
      // Append the original error message to our new one; append new message to err
      err.message = `Failed to fetch resource \"${resrc}\": ${err.message}`;
      // Propagate error
      throw err;
    } finally {
      // Update loading state of resource
      setLoading(prev => ({ ...prev, [resrc]: false }));
    }
  }, []);

  /**
   * @param {Array} resrcs
   */
  const onFetchMany = useCallback(async (resrcs) => {
    // Input validation
    if (!Array.isArray(resrcs)) {
      throw new Error('Invalid value for resources (must be an array of strings)');
    } else if (resrcs.length === 0) {
      return [];
    }
    // Execute all promises in parallel until all are settled (success or error)
    const responses = await Promise.allSettled(resrcs.map(resrc => onFetch(resrc)));
    // Get an array of error messages
    const errors = responses.filter(res => res.status === 'rejected').map(res => res.reason);
    // Return the errors array (if length === 0, all fetches successful)
    return errors;
  }, []);

  // Return relevant state/callbacks for the hook
  return { loading, fetched, onFetch, onFetchMany };
}