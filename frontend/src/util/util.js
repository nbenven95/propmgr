/**
 * Formats a timestamp into an ISO string
 * @param {*} timestamp
 * @returns 
 */
const formatISO = (timestamp) => {
  if (!timestamp || timestamp === '') return; // Return on null/empty input (date fields are optional)
  const date = new Date(timestamp);
  // Extract date parts
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  // Format: YYYY-MM-DDTHH:MM
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export { formatISO }