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
  const enableBulkMode = useCallback(() => bulkMode.enabled = true, []);

  /* Disable bulk mode */
  const disableBulkMode = useCallback(() => bulkMode.enabled = false, []);

  /* Toggle bulk mode on/off */
  const toggleBulkMode = useCallback(() => {
    // Get current state
    let current = bulkMode.enabled;
    // Toggle the current state
    const toggled = !current;
    // Perform state update
    setBulkMode(prev => ({ ...prev, enabled: toggled }));
  }, []);

  /**
   * 
   * @param {*} id The ObjectID of the item to select/de-select for bulk delete
   */
  const toggleBulkSelect = useCallback(id => {
    // Don't continue if bulk mode isn't enabled
    if (!bulkMode.enabled) return;
    // Get current state
    const current = Array.from(bulkMode.selected);
    // Init state update array
    const updated = current.includes(id)
       // id is already present, remove it to de-select
      ? current.filter(_id => _id !== id)
      // id is not present, add it to `bulkMode.selected` to select for bulk delete
      : [...current, id]
    // Update bulkMode.selected state
    setBulkMode(prev => ({ ...prev, selected: updated }));
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