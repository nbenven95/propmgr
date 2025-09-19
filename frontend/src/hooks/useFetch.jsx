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
export default function useFetch({ initLoading, initFetched, endpoints }) {
  /**
   * `loading` should contain string keys that correspond
   * to resources to fetch, with the associated values
   * being the 'fetched' state (i.e., has the resource
   * been fetched, or are we still fetching?)
   */
  const [loading, setLoading] = useState(initLoading);
  /**
   * `fetched` should contain string keys that correspond
   * to resources to fetch, with the associated values
   * being the fetched resource (objects, arrays, etc.)
   * The key names must be the same as those set in `loading`.
   */
  const [fetched, setFetched] = useState(initFetched);
  /**
   * `api` should contain string keys that correspond to
   * resources to fetch, with the associated values
   * being the URL of the GET endpoint.
   * The key names must be the same as those set in `loading`
   * and `fetched`.
   */
  const _endpoints = Object.freeze(endpoints);

  /**
   * @param {String} resource
   */
  const onFetch = useCallback(async (resource) => {
    try {
      // Get the URL for the resource to fetch
      if (!Object.keys(_endpoints).includes(resource)) {
        // Ensure 'resource' is a valid resource key
        throw new Error(`Invalid resource key \"${resource}\"`);
      }
      const url = endpoints[resource]; 
      // Set loading state of resource
      setLoading(prev => ({ ...prev, [resource]: true }));
      const res = await axios.get(url);
      // Update fetched data for the resource
      setFetched(prev => ({ ...prev, [resource]: res.data }));
      // Sleep for a few seconds so the loading indicator displays consistently
      // TODO: is this best practice for production build?
      
    } catch (err) {
      // Append the original error message to our new one; append new message to err
      err.message = `Failed to fetch resource \"${resource}\": ${err.message}`;
      // Propagate error
      throw err;
    } finally {
      // Update loading state of resource
      setLoading(prev => ({ ...prev, [resource]: false }));
    }
  }, []);

  /**
   * @param {Array} resources
   */
  const onFetchMany = useCallback(async (resources) => {
    // Input validation
    if (!Array.isArray(resources)) {
      throw new Error('Invalid value for resources (must be an array of strings)');
    } else if (resources.length === 0) {
      return [];
    }
    // Execute all promises in parallel until all are settled (success or error)
    const responses = await Promise.allSettled(resources.map(resource => onFetch(resource)));
    // Get an array of error messages
    const errors = responses.filter(res => res.status === 'rejected').map(res => res.reason);
    // Return the errors array (if length === 0, all fetches successful)
    return errors;
  }, []);

  // Return relevant state/callbacks for the hook
  return { loading, fetched, onFetch, onFetchMany };
}