import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, useColorModeValue } from '@chakra-ui/react';
import { Map, NavigationControl, FullscreenControl } from '@vis.gl/react-maplibre';
import 'maplibre-gl/dist/maplibre-gl.css'; // Needed for zoom/fullscreen controls GUI

const Map3D = ({
  center = [-100, 40],
  boundingBox,
  zoom = 15,
  styleUrl = 'https://demotiles.maplibre.org/style-maptiler-basic.json',
  pitch = 60,
  bearing = 0,
  showControls = true,
  height = '500px'
}) => {

  const [formState, setFormState] = useState({ is3D: true, mapLoaded: false });
  const refs = { map: useRef(null) };
  const bg = useColorModeValue('gray.100', 'gray.900');

  /**
   * 
   * @returns 
   */
  const getBoundingBoxGeoJSON = () => {
    if (!Array.isArray(boundingBox) || boundingBox.length !== 4) return null;

    // South, North, West, East
    const [s, n, w, e] = boundingBox.map(elem => parseFloat(elem));

    // SW, SE, NE, NW, SW (close the polygon)
    const coordinates = [[ [w, s], [e, s], [e, n], [w, n], [w, s] ]];

    // Return the GeoJSON polygon
    return {
      type: 'FeatureCollection',
      features: [{ 
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates },
        properties: {} 
      }]
    };
  };

  /**
   * Get all layers containing text labels for the given map
   * @param {*} map 
   * @returns 
   */
  const getLabelLayers = (map) => {
    if (!map) return [];
    return Array.from(map.getStyle().layers)
      .filter(layer => layer.type === 'symbol')
      .map(layer => layer.id);
  }

  /**
   * 
   * @param {*} map 
   */
  const addBuilding3DLayer = (map) => { // Note: this is only needed for Bright and Positron
    if (!map.getLayer('building-3d')) {
      // Ensure text renders on top of buildings: get the layer that building-3d should render before (bottom of the label layer stack)
      const beforeId = getLabelLayers(map)?.[0]
      // Add buildings
      map.addLayer({
        id: 'building-3d',
        type: 'fill-extrusion',
        source: 'openmaptiles',
        'source-layer': 'building',
        filter: [
          'all',
          ['has', 'render_height'],
          ['has', 'render_min_height']
        ],
        minzoom: 15,
        paint: {
          'fill-extrusion-color': '#ccc',
          'fill-extrusion-height': ['get', 'render_height'],
          'fill-extrusion-base': ['get', 'render_min_height'],
          'fill-extrusion-opacity': 0.9
        }
      }, beforeId);
    }
  };
  
  /**
   * 
   * @param {*} map 
   * @returns 
   */
  const addBoundingBoxLayer = (map) => {
    const bboxGeoJSON = getBoundingBoxGeoJSON();
    if (!bboxGeoJSON) return;
    if (!map.getSource('bbox')) {
      map.addSource('bbox', { type: 'geojson', data: bboxGeoJSON });
    }
    if (!map.getLayer('bbox-layer')) {
      map.addLayer({
        id: 'bbox-layer',
        type: 'line',
        source: 'bbox',
        layout: {},
        paint: { 'line-color': '#FF0000', 'line-width': 2 }
      });
    }
  };

  /**
   * Init style data
   * @returns 
   */
  const handleStyleData = () => {
    const map = refs.map.current?.getMap();
    if (!map) return;
    try {
      addBuilding3DLayer(map);
      addBoundingBoxLayer(map);
    } catch (err) {
      console.warn('Failed to add layer:', err);
    }
  };

  /**
   * Initialize map
   * @param {*} e 
   * @returns 
   */
  const handleMapLoad = (e) => {
    const map = e.target;
    if (!map) return;
    setFormState(prev => ({ ...prev, mapLoaded: true }));
    map.jumpTo({ center, zoom, bearing, pitch });
  };

  /**
   * Toggle 3D / 2D view
   */
  const toggle3D = () => {
    setFormState(prev => ({ ...prev, is3D: !prev.is3D }));
  };

  // Handle 2D/3D state updates
  useEffect(() => {
    if (!formState.mapLoaded) return;
    const map = refs.map.current?.getMap();
    if (!map) return;
    const { is3D } = formState;
    if (is3D) {
      map.setPitch(pitch);
      if (map.getStyle() && map.getLayer('building-3d')) {
        map.setLayoutProperty('building-top', 'visibility', 'none');
        map.setLayoutProperty('building-3d', 'visibility', 'visible');
      }
    } else {
      map.setPitch(0);
      if (map.getStyle() && map.getLayer('building-3d')) {
        map.setLayoutProperty('building-top', 'visibility', 'visible');
        map.setLayoutProperty('building-3d', 'visibility', 'none');
      }
    }
  }, [formState.is3D, formState.mapLoaded, pitch]);

  // Ensure extrusion is visible on mount if is3D
  useEffect(() => {
    const map = refs.map.current?.getMap();
    const { is3D } = formState;
    if (!map) return;
    if (is3D && map.getStyle() && map.getLayer('building-3d')) {
      map.setLayoutProperty('building-3d', 'visibility', 'visible');
    }
  }, []);

  return (
    <Box
      height={height}
      bg={bg}
      borderRadius='md'
      overflow='hidden'
      position='relative'
      data-testid='map3d-container'
    >
      <Map
        style={{ width: '100%', height: '100%' }}
        mapStyle={styleUrl || 'https://demotiles.maplibre.org/style-maptiler-basic.json'}
        antialias={true}
        onLoad={handleMapLoad}
        onStyleData={handleStyleData}
        ref={refs.map}
      >
        {showControls && (
          // TODO: add jump back to center
          <>
            <NavigationControl position='top-left' />
            <FullscreenControl position='top-right' />
          </>
        )}
      </Map>
      <Box 
        position='absolute'
        bottom='10px'
        left='10px'
        zIndex={1}
        display='flex'
        gap={2}
      >
        <Button
          size='sm'
          onClick={toggle3D}
          title='Toggle 2D/3D view'
          colorScheme={formState.is3D ? 'purple' : 'gray'}
        >
          {formState.is3D ? '3D' : '2D'}
        </Button>
      </Box>
    </Box>
  );
};

export default Map3D;