import axios from 'axios';
import { useState, useCallback } from 'react';

/**
 * 
 * @returns
 */
export default function useBulkMode() {
  /**
   * 
   */
  const [bulkMode, setBulkMode] = useState({
    enabled : false,
    selected: []
  });

  /* Enable bulk mode */
  const enableBulkMode = useCallback(() => {
    setBulkMode(prev => ({ selected: [], enabled: true }));
  }, []);

  /* Disable bulk mode */
  const disableBulkMode = useCallback(() => {
    setBulkMode(prev => ({ selected: [], enabled: false }));
  }, []);

  /* Toggle bulk mode on/off */
  // TODO: can we just always set `selected` to [] when toggling? 
  const toggleBulkMode = useCallback(() => {
    /*
    setBulkMode(prev => {
      let current = prev.enabled;
      let toggled = !current;
      // If bulkMode is disabled, clear the `selected` array
      if (toggled === false) return { selected: [], enabled: false };
      // Else, bulkMode is enabled
      return { ...prev, enabled: true };
    });
    */
    setBulkMode(prev => ({ selected: [], enabled: !prev.enabled }));
  }, []);

  /**
   * 
   * @param {*} id The ObjectID of the item to select/de-select for bulk delete
   */
  const toggleBulkSelect = useCallback(id => {
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
   * @throws        Error on failed DELETE request for any of the
   *                selected items (e.g., invalid ObjectID) // TODO: verify this
   * @returns       An array containing the responses for each
   *                DELETE request
   */
  const handleBulkDelete = useCallback(async (url) => {
    // If nothing selected, return empty array
    if (bulkMode.selected.length === 0) return [];
    // Await DELETE requests for all items
    const responses = await Promise.all(
      // Map ObjectIDs in `selected` to output of axios.delete()
      bulkMode.selected.map(id => axios.delete(`${url}/${id}`))
    );
    // TODO: do we need to manually check `responses` for errors before proceeding?
    // Reset bulk mode on success
    setBulkMode({ enabled: false, selected: [] });
    // Return the deleted items (assumes deleted item is passed via `data` field in the response)
    return responses.map(res => res.data.data);
  }, []);

  // Return relevant state/callbacks for the hook
  return { 
    bulkMode,
    enableBulkMode,
    disableBulkMode,
    toggleBulkMode,
    toggleBulkSelect,
    handleBulkDelete
  };
}