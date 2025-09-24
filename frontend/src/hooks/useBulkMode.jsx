import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';

// TODO: refactor this component in a similar manner to useDrawer to return a BulkDeleteControls component

/**
 * 
 * @returns
 */
export default function useBulkMode() {
  /* */
  const [bulkMode, setBulkMode] = useState({ enabled: false, selected: [] });

  /**
   * Reference to current bulkMode state.
   * 
   * Need this as a workaround to prevent stale references before
   * awaiting async calls (can't await inside functional useState
   * setters, meaning we can't just use `prev`).
   */
  const bulkModeRef = useRef(bulkMode);
  // Update bulkModeRef whenever bulkMode state changes (prevent stale reference)
  useEffect(() => { bulkModeRef.current = bulkMode }, [bulkMode]);

  /* Enable bulk mode */
  const onEnable = useCallback(() => setBulkMode({ selected: [], enabled: true }), []);

  /* Disable bulk mode */
  const onDisable = useCallback(() => setBulkMode({ selected: [], enabled: false }), []);

  const onBulkModeToggle = useCallback(() => setBulkMode(prev => ({ selected: [], enabled: !prev.enabled})));

  /**
   * 
   * @param {*} id The ObjectID of the item to select/de-select for bulk delete
   */
  const onBulkSelectToggle = useCallback(id => {
    // Use functional form of setBulkMode and reference prev to ensure we have the most up-to-date values
    setBulkMode(prev => {
      // Don't continue if bulk mode isn't enabled
      if (!prev.enabled) return prev;
      // Get most up-to-date current state (NOTE: don't use bulkMode.enabled directly; can't guarantee this is up to date)
      const current = Array.from(prev.selected);
      // Init state update array
      const updated = current.includes(id)
        // id is already present, remove it to de-select
        ? current.filter(_id => _id !== id)
        // id is not present, append it to the current state
        : [...current, id];
      return { ...prev, selected: updated };
    });
  }, []);

  /**
   * 
   * @param {*} url The URL of the API endpoint for the resource to be deleted
   * @returns       TODO: format responses array to contain objects: { success: <t/f>, }
   */
  const onBulkDelete = useCallback(async (url) => {
    // Get non-stale reference to current bulk mode state via ref
    const _bulkMode = bulkModeRef.current;
    // If bulkMode disabled or nothing selected, return empty array
    if (!_bulkMode.enabled || _bulkMode.selected.length === 0) return [];

    // TODO: change this to use Promise.allSettled so errors don't interrupt
    
    console.log(`${_bulkMode.selected.join(', ')}`);

    const responses = await Promise.all(
      // Map ObjectIDs in `selected` to output of axios.delete()
      _bulkMode.selected.map(id => axios.delete(`${url}/${id}`))
    );
    
    /*
    const responses = await Promise.allSettled(
      _bulkMode.selected.map(id => axios.delete(`${url}/${id}`))
    );
    */
    
    // Reset bulk mode on success
    setBulkMode({ enabled: false, selected: [] });
    // Return the deleted items (assumes deleted item is passed via `data` field in the response)
    //return responses.map(res => res.data.data);
    return responses.map(res => res.data);
    /*
    return responses.map(res => {
      return res.status === 'fulfilled'
        ? { success: true, data: res.value }
        : { success: false, error: res.reason }
    });
    */
  }, []);

  // Return relevant state/callbacks for the hook
  return { 
    bulkMode,
    onEnable,
    onDisable,
    onBulkModeToggle,
    onBulkSelectToggle,
    onBulkDelete
  };
}