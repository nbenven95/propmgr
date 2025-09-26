import { useEffect, useState } from 'react';
import { Box, Text } from '@chakra-ui/react';
import { Map } from '@vis.gl/react-maplibre';

import { isServerReachable } from '../../util/util';

const MapCard = ({
  geoCode,
  mapStyle = 'https://tiles.openfreemap.org/styles/liberty' // TODO: should probably turn this into state if we want to support toggling between multiple views
}) => {

  const [formState, setFormState] = useState({
    mapServiceAvailable: false
  });

  // On initial render, test map service for reachability
  useEffect(() => {
    const res = isServerReachable(mapStyle); // TODO: is this the correct URL to test?
    setFormState(prev => ({ ...prev, mapServiceAvailable: res }));
  }, []);

  const [lat, lon] = geoCode?.coordinates;

  return (
    <Box border='1px solid' borderColor='gray.200' borderRadius='md' p={4} maxW='100vw' >
      {geoCode && formState.mapServiceAvailable ? ( // Render the map if OpenFreeMap service is available
        <Map 
          initialViewState={{
            longitude: lon,
            latitude: lat,
            zoom: 15
          }}
          style={{ width: 200, height: 200 }}
          mapStyle={mapStyle}
          attributionControl={false}
        />
      ) : (
        <Text fontWeight='bold' >Map Service Unavailable</Text>
      )}
    </Box>
  );
};

export default MapCard;