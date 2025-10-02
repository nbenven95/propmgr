import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useOutsideClick } from '@chakra-ui/react';
import { throttle } from 'lodash';
import axios from 'axios';

import AddressAutoCompleteFormUI from './AddressAutoCompleteFormUI';
import EndpointEnum from '../../util/EndpointEnum';

const { GEOCODE_API } = EndpointEnum;

// Init cache
const cache = new Map(); // TODO: how to use browser cache?

// TODO: why is this non-arrow? Is it so we have proper 'this' context so caching works?
function AddressAutoCompleteForm ({
  initQuery = '',
  bias = [],
  lang = 'en',
  limit = 5,
  debounceMs = 400, // Time in milliseconds to wait before fetching more suggestions: number
  onSelect          // Callback to handle an address being selected
}) {
  const [formState, setFormState] = useState({
    query         : initQuery,
    results       : [],
    noResults     : false,
    selectedAddr  : null,
    highlightIndex: -1
  });

  const [loading, setLoading] = useState({
    suggestedAddresses  : false,
    reverseGeocodeLookup: false
  });

  const refs = {
    cancelGetSuggAddrToken: useRef(null),
    cancelRevGeocodeLookup: useRef(null),
    list: useRef(null)
  };

  // TODO: I think this just handles what should happen if you click outside of the form (verify?)
  useOutsideClick({
    ref: refs.list,
    handler: () => setFormState(prev => ({ ...prev, 
      results: [], 
      highlightIndex: -1 
    }))
  });

  /**
   * Parse address, geocode, and bounding box (extent) from a GeoJSON Feature
   * @param {*} feature 
   * @returns
   */
  const parseFeature = (feature) => {
    if (!feature) return {};
  
    const props = feature.properties || {};
  
    // Construct address from components
    const addr = {
      streetNumber: props.housenumber || '',
      streetName  : props.street || props.road || '',
      city        : props.city || props.town || props.village || '',
      state       : props.state || '',
      postalCode  : props.postcode,
      country     : props.country || props.countrycode,
    };
  
    // The name of this field may change depending on the API (photon.komoot.io uses 'extent' for some reason)
    const extent = props.extent || props.boundingbox || props.bbox;
  
    return {
      address: addr,
      geocode: [...feature.geometry?.coordinates] || [], // lon, lat
      extent: [...extent] || [] // i.e., bounding box [west, south, east, north]
    };
  };

  /**
   * 
   */
  const fetchAddrResults = useCallback(throttle(async query => {    
    if (!query) return;

    // Check if there is a request that is still currently active; cancel if it is
    const currReq = refs.cancelGetSuggAddrToken.current; // TODO: should this be current.token?
    if (currReq) {
      currReq.cancel('Canceling GET address suggestions: new request triggered');
    }
    // Create a new cancel token
    const source = axios.CancelToken.source();
    refs.cancelGetSuggAddrToken.current = source;

    // Check cache for query before attempting API request
    if (cache.has(query)) {
      const cached = cache.get(query);
      setFormState(prev => ({ ...prev,
        results: cached,
        noResults: cached.length === 0 
      }));
      setLoading(prev => ({ ...prev, suggestedAddresses: false }));
      console.log(`cache hit: \"${query}\", ${JSON.stringify(cached)}`);
      return;
    }

    // Cache miss: proceed with fetch
    try {
      setLoading(prev => ({ ...prev, suggestedAddresses: true }));

      // Init fetch params
      const params = { q: query, limit, lang };
      // Check if a bias coordinate was provided
      if (Array.isArray(bias) && bias.length == 2) {
        params.lon = bias[0], // Assume [lon, lat]
        params.lat = bias[1]
      }

      // Start fetch
      const cancelToken = source.token; // TODO: not sure if this will work; may still need to do `cancelToken: source.token`
      const response = await axios.get(`${GEOCODE_API}/api`, { params, cancelToken });
      const features = response.data?.features || []; // TODO: verify format; this should be an array of GeoJSON Features

      // On success, update cache and form state
      cache.set(query, features);
      setFormState(prev => ({ ...prev,
        results: features,
        noResults: features.length === 0
      }));

    } catch (err) {
      // Check if the error is due to a canceled request or a failed fetch
      if (axios.isCancel(err)) {
        console.warn('Request canceled:', err.message);
      } else {
        console.error('Error fetching address suggestions:', err);
      }
    } finally {
      // Set loading state to false on success or failure
      setLoading(prev => ({ ...prev, suggestedAddresses: false }));
    }
  }, debounceMs), []);

  /**
   * Handle reverse geocoding a selected suggestion to get the exact address details
   * @param {*} feature 
   */
  const handleSelect = async (feature) => {
    if (!feature) return;
    const [lon, lat] = feature.geometry?.coordinates;
    if (typeof lon !== 'number' || typeof lat !== 'number') return;

    // Check if there is a request that is still currently active; cancel if it is
    const currReq = refs.cancelRevGeocodeLookup.current;
    if (currReq) {
      currReq.cancel('Canceling current reverse geocode lookup: new request triggered');
    }
    // Create a new cancel token
    const source = axios.CancelToken.source();
    refs.cancelRevGeocodeLookup.current = source;

    // Check cache for query before attempting API request
    const key = `${lon},${lat}`;

    if (cache.has(key)) {
      const cachedFeature = cache.get(key); // Should be an address string
      setFormState({
        query: '',
        results: [],
        noResults: false,
        selectedAddr: parseFeature(cachedFeature), // Get the address, geocode, and extent as a separate object
        highlightIndex: -1
      });
      setLoading(prev => ({ ...prev, reverseGeocodeLookup: false }));
      console.log(`cache hit: \"${key}\", ${JSON.stringify(cachedFeature)}`)
      // Call onSelect handler to expose state to parent component (address, geocode, extent)
      onSelect?.(parseFeature(cachedFeature));
      return;
    }

    // Cache miss: proceed with fetch
    try {      
      setLoading(prev => ({ ...prev, reverseGeocodeLookup: true }));

      // Init fetch params
      const params = { lon, lat, lang, limit: 1 };

      // Start fetch
      const cancelToken = source.token;
      const response = await axios.get(`${GEOCODE_API}/reverse`, { params, cancelToken });
      const fetchedFeature = response.data?.features?.[0] || null;

      // On success, update cache and form state
      cache.set(key, fetchedFeature);
      setFormState(prev => ({ ...prev,
        query: '',
        results: [],
        noResults: false,
        selectedAddr: parseFeature(fetchedFeature), // Get the address, geocode, and extent as a separate object
        highlightIndex: -1
      }));
      // Call onSelect handler to expose state to parent component (address, geocode, extent)
      onSelect?.(parseFeature(fetchedFeature));
      
    } catch (err) {
      // Check if the error is due to a canceled request or a failed fetch
      if (axios.isCancel(err)) {
        console.warn('Request canceled:', err.message);
      } else {
        console.error('Error fetching address suggestions:', err);
      }
    } finally {
      setLoading(prev => ({ ...prev, reverseGeocodeLookup: false }));
    }
  };

  /**
   * Handle arrow key navigation for suggested results
   * @param {Event} e 
   */
  const handleKeyDown = (e) => {
    if (!e.key) return;
    const key = e.key;

    switch (key) {
      case 'ArrowDown': {
        e.preventDefault();
        setFormState(prev => {
          const indexPrev = prev.highlightIndex;
          const resultsPrev = [...prev.results];
          // Get the index of the currently selected suggestion
          const indexCurr = Math.min(indexPrev + 1, resultsPrev.length - 1);
          return { ...prev, highlightIndex: indexCurr };
        });
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        setFormState(prev => {
          const indexPrev = prev.highlightIndex;
          const indexCurr = Math.max(indexPrev - 1, 0);
          return { ...prev, highlightIndex: indexCurr };
        });
        break;
      }
      case 'Enter': {
        e.preventDefault();
        const index = formState.highlightIndex;
        if (index >= 0) {
          const feature = formState.results[index];
          handleSelect(feature);
        }
        break;
      }
      case 'Escape': {
        e.preventDefault();
        setFormState(prev => ({ ...prev,
          query: '',
          results: [],
          noResults: false,
          highlightIndex: -1
        }));
        break;
      }
      default: {
        console.warn('Unrecognized key pressed:', key);
      }
    }
  };

  // Handle cleanup on component unmount
  useEffect(() => {
    // TODO: how to return early if page has just loaded?
    return () => {
      // On component unmount, cancel any in-progress requests
      const cancelToken = refs.cancelToken?.current;
      if (cancelToken) cancelToken.cancel('Canceling current request: component unmounted');
    };
  }, []);

  // Handle side effects of query input value changing (i.e., user is typing in the input)
  useEffect(() => {
    const { query } = formState;
    if (!String(query)?.trim()) {
      setFormState(prev => ({ ...prev,
        results: [],
        noResults: false
      }));
      return;
    }
    // If formState contains a valid query string, fetch suggested addresses
    fetchAddrResults(query);
  }, [formState.query, fetchAddrResults]); // TODO: not sure why the callback is listed in the dependencies

  // Return the presentational component with injected state and controller components
  return (
    <AddressAutoCompleteFormUI
      refs={refs}
      loading={loading}
      formState={formState}
      onKeyDown={handleKeyDown}
      onInputChange={e => {
        setFormState(prev => (({ ...prev, query: e.target.value })))
      }}
      onResultClick={feature => handleSelect(feature)}
    />
  );
}

export default AddressAutoCompleteForm;