import React, { useState } from 'react';
import { Box, Button, Container, Heading, HStack, VStack } from '@chakra-ui/react';
import Map3D from '../components/cards/Map3D';

const StyleUrlEnum = Object.freeze({
  BRIGHT: 'https://tiles.openfreemap.org/styles/bright',
  LIBERTY: 'https://tiles.openfreemap.org/styles/liberty', // Note: this style comes with 3D building layer built in
  POSITRON: 'https://tiles.openfreemap.org/styles/positron'
});

const MapTest = () => {

  const { BRIGHT, LIBERTY, POSITRON } = StyleUrlEnum;

  const [formState, setFormState] = useState({ style: BRIGHT });

  return (
    <Container maxW='container.xl' padding={4}>
      <VStack spacing={4}>
        <Heading size='md'>OpenFreeMaps + MapLibre 3D Map (React + Chakra)</Heading>
        <Box borderWidth='1px' borderRadius='md' padding={4} bg='whiteAlpha.50'>
          <Map3D
            center={[-73.7887825, 43.0772178]} // Longitude, Latitude
            boundingBox={[43.0769987, 43.0774049, -73.7890584, -73.7885055]}
            zoom={15}
            pitch={60}
            bearing={0}
            styleUrl={formState.style}
            height='640px'
          />
          <HStack spacing={1} width='100vw' mt={1}>
            <Button aria-label='style-bright' onClick={() => {
              setFormState(prev => ({ ...prev, style: BRIGHT }))
            }} colorScheme={formState.style === BRIGHT ? 'gray' : 'purple'}>
              Bright
            </Button>
            <Button aria-label='style-liberty' onClick={() => {
              setFormState(prev => ({ ...prev, style: LIBERTY }))
            }} colorScheme={formState.style === LIBERTY ? 'gray' : 'purple'}>
              Liberty
            </Button>
            <Button aria-label='style-positron' onClick={() => {
              setFormState(prev => ({ ...prev, style: POSITRON }))
            }} colorScheme={formState.style === POSITRON ? 'gray' : 'purple'}>
              Positron
            </Button>
          </HStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default MapTest;
