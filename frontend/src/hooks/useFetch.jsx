import { useCallback, useEffect, useRef, useState } from 'react';
import { Flex, Text, Spinner, VStack, Box } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import axios from 'axios';

// For loading indicator animation
const MotionFlex = motion.create(Flex);

// Wait 300 ms before displaying the loading indicator
const DISPLAY_DELAY = 300;
// Loading indicator must be visible for at least this long to prevent flickering
const MIN_DISPLAY_DURATION = 500;

/**
 * 
 * @param {*} resources 
 * @returns 
 */
export default function useFetch(resources) {

  // e.g., [{ files: false }, { docs: false }, ...]
  const loadingArray = resources.map(r => {
    const [name, { init, url }] = Object.entries(r)[0];
    return { [name]: false }; 
  });
  // e.g., [{ files: [] }, { docs: [] }, ...]
  const fetchedArray = resources.map(r => {
    const [name, { init, url }] = Object.entries(r)[0];
    return { [name]: init };
  });
  // e.g., [{ files: 'http://localhost:5000/api/files' }, ...]
  const endpointsArray = resources.map(r => {
     const [name, { init, url }] = Object.entries(r)[0];
    return { [name]: url };
  })

  // e.g., { files: false, docs: false }
  const [loading, setLoading] = useState(Object.assign({}, ...loadingArray));

  // e.g., { files: [], docs: [] }
  const [fetched, setFetched] = useState(Object.assign({}, ...fetchedArray));

  // e.g., { files: 'http://localhost:5000/api/files', ... }
  const endpoints = Object.freeze(Object.assign({}, ...endpointsArray));

  // State to track whether or not there are any ongoing fetches
  const [isFetching, setIsFetching] = useState(false);
  
  // Handle side effects of loading state update
  useEffect(() => {
    // If any resource is still loading, set isLoading flag to 'true'
    setIsFetching(Object.keys(loading).some(resource =>
      loading[resource] === true
    ));
  }, [loading])

  const onFetch = useCallback(async (resource) => {
    // Try to fetch from the endpoint corresponding to key `resource`
    try {
      // Ensure `resource` is a valid key
      if (!Object.keys(endpoints).includes(resource)) {
        throw new Error(`Invalid resource key \"${resource}\"`);
      }

      // Get the URL from endpoints dictionary
      const url = endpoints[resource];
      // Set loading state to true
      setLoading(prev => ({ ...prev, [resource]: true }));

      // Init fetch
      const res = await axios.get(url);
      // On success, update state with newly fetched resource
      setFetched(prev => ({ ...prev, [resource]: res.data }));

    } catch (err) {
      // Propagate the error with appended message
      err.message = `Failed to fetch resource \"${resource}\": ${err.message}`;
      throw err;
    } finally {
      // Clean up: set loading state to false on success or failure
      setLoading(prev => ({ ...prev, [resource]: false }));
    }
  }, []);

  const onFetchMany = useCallback(async (resources) => {
    // Validate input
    if (!Array.isArray(resources)) {
      throw new Error('Invalid type for argument \`resources\`');
    }
    // Return immediately if no resources to fetch
    if (resources.length === 0) return [];

    // Execute all promises in parallel until all are settled (success or failure)
    const responses = await Promise.allSettled(resources.map(resource => 
      onFetch(resource)
    ));

    // Get an array of error messages
    const errors = responses.filter(res => 
      res.status === 'rejected' // Get an array of all rejected responses
    ).map(res => // Collect all error messages (i.e., `reason`) into an array
      res.reason
    );
    // Return errors (if errors.length === 0, all fetches successful)
    return errors;
  }, []);

  // TODO: add a DISPLAY_TIMEOUT value that will prevent loading indicators from displaying
  // i.e., use a small delay (e.g., 300 ms) before showing the indicator so quick fetches don't make the screen flash
  // Keep the loading indicator visible for at least a minimum duration once shown so it doesn't flicker if the fetch completes quickly
  
  const LoadingIndicator = () => {
    // State to track whether or not the loading indicator should be displayed based on display timeout
    const [visible, setVisible] = useState(false);
    
    const showTimer = useRef(null);
    const hideTimer = useRef(null);

    // Get names of all resources that are still loading
    const resourcesLoading = Object.keys(loading).filter(resource => loading[resource]);
    // No resources loading 
    //if (resourcesLoading.length === 0) return null;

    // Handle side effects of fetches starting/stopping
    useEffect(() => {
      // Check if there are any resources being fetched
      if (resourcesLoading.length > 0) {
        // Wait before displaying the loading indicator in case the fetches finish quickly
        showTimer.current = setTimeout(() => setVisible(true), DISPLAY_DELAY);
      } else {
        // Always reset showTimer when all fetches complete
        clearTimeout(showTimer.current);

        // Check if loading indicator was displayed due to fetch taking longer than DISPLAY_DELAY
        if (visible) {
          // Ensure the loading indicator is displayed for at least MIN_DISPLAY DURATION
          hideTimer.current = setTimeout(() => setVisible(false), MIN_DISPLAY_DURATION);
        }

        // Clean up to prevent memory leaks
        return () => {
          clearTimeout(showTimer.current);
          clearTimeout(hideTimer.current);
        }
      }
    }, [resourcesLoading.length]);

    // Don't render the loading indicator until DISPLAY_DELAY has elapsed
    if (!visible) return null;
    
    return (
      <MotionFlex
        justify='center'
        align='center'
        minH='100vh'
        direction='column'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <VStack spacing={4}>
          {/* Display animated spinner icon */}
          <Spinner
            thickness='4px'
            speed='0.65s'
            emptyColor='gray.200'
            color='blue.500'
            size='xl'
          />
          {/* Display names of resources */}
          <Box textAlign='center'>
            <Text fontSize='xl' mb={1}>
              Loading resources...
            </Text>
            <Text color='gray.500' fontSize='md'>
              {resourcesLoading.join(', ')}
            </Text>
          </Box>
        </VStack>
      </MotionFlex>
    );
  }

  // Return state, callbacks, and components to be exposed to the user
  return {
    loading, // Indicates the specific names of resources and their individual loading states // TODO: I don't think this is used externally anymore (replaced by isLoading and LoadingIndicator)
    isFetching, // Indicates if any resources are still being fetched
    fetched,
    onFetch,
    onFetchMany,
    LoadingIndicator: (props) => ( // TODO: optional props for loading indicator?
      <LoadingIndicator {...props} />
    )
  };
}