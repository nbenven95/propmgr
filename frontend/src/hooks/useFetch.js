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
export default function useFetch({initLoading, initFetched}) {
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
   * The keys should be the same as those in `loading` for
   * consistency.
   */
  const [fetched, setFetched] = useState(initFetched);

  /**
   * @param {*} uri The URI of the resource to fetch. The final component
   *                of the URI should match the corresponding key for the
   *                resource in `loading` and `fetched`.
   * @returns
   */
  const handleFetch = useCallback(async (uri, resource) => {
    try {
      // Set loading state of resource
      setLoading(prev => ({ ...prev, [resource]: true }));
      const res = await axios.get(uri);
      // Update fetched data for the resource
      setFetched(prev => ({ ...prev, [resource]: res.data }));
    } catch (err) {
      // Propagate error so client can handle it (finally block still executes)
      if (axios.isAxiosError(err)) {
        console.error('Axios error:', err.response?.status, err.response?.data);
      } else {
        console.error('Unexpected error:', err);
      }
    } finally {
      // Update loading state of resource
      setLoading(prev => ({ ...prev, [resource]: false }));
    }
  }, []);

  // Return relevant state/callbacks for the hook
  return { loading, fetched, handleFetch };
}