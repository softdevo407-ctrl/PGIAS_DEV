// Centre Service - All centre-related API calls
import { API_ENDPOINTS, HTTP_METHODS } from './api.config';

/**
 * Fetch all available centres
 */
export const getAllCentres = async () => {
  console.log(`🔍 Fetching all centres...`);
  try {
    const response = await fetch(API_ENDPOINTS.CENTRES);
    if (!response.ok) throw new Error('Failed to fetch centres');
    const data = await response.json();
    console.log('✅ Fetched Centres:', data);
    return data || [];
  } catch (error) {
    console.error('❌ Error fetching centres:', error.message);
    return [];
  }
};

/**
 * Format centre display as "shortname - longname"
 * @param {object} centre - Centre object
 */
export const formatCentreDisplay = (centre) => {
  if (!centre) return 'Unknown Centre';
  return `${centre.centreshortname} - ${centre.centrelongname}`;
};

/**
 * Find centre by code
 * @param {array} centres - Array of centres
 * @param {string} centrecode - Centre code to find
 */
export const findCentreByCode = (centres, centrecode) => {
  return centres.find(c => c.centrecode === centrecode);
};

/**
 * Check if a centre is HQ
 * @param {object} centre - Centre object
 */
export const isHQCentre = (centre) => {
  if (!centre) return false;
  return centre.centrecode === '13' || centre.centreshortname === 'HQ';
};
