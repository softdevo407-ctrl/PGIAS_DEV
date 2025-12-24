// Formatters - All formatting/display functions
/**
 * Format date to dd/mm/yyyy
 */
export const formatDateDDMMYYYY = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Format financial year from FY format to standard YYYY-YYYY format
 */
export const formatFinancialYear = (fyString) => {
  // Input: "2026-2027" or "FY2026-2027"
  // Output: "2026-2027"
  return fyString.replace('FY', '');
};

/**
 * Convert financial year for delete API call format
 * "2026-2027" -> "2026/2027"
 */
export const convertFYForDelete = (fyString) => {
  return fyString.replace('-', '/');
};

/**
 * Format weight type enum to display name
 */
export const formatWeightType = (weightType) => {
  const mapping = {
    'DATE': 'Date',
    'NUMBER': 'Number',
    'PERCENTAGE': 'Percentage'
  };
  return mapping[weightType] || weightType;
};

/**
 * Format action code display
 */
export const formatActionCode = (actionCode) => {
  if (!actionCode) return '-';
  // Format: 001AA000001 -> 001A A000001
  return actionCode;
};

/**
 * Truncate long text with ellipsis
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Format API response error message
 */
export const formatErrorMessage = (error) => {
  if (!error) return 'Unknown error';
  if (typeof error === 'string') return error;
  if (error.message) return error.message;
  return 'An error occurred';
};

/**
 * Format timestamp to readable format
 */
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return '-';
  const date = new Date(timestamp);
  return date.toLocaleString();
};
