import axios from 'axios';
import { useState, useCallback } from 'react';

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

  // Return relevant state/callbacks for the hook
  return { loading, fetched, onFetch };
}