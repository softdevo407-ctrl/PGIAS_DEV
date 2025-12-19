// Screens Service - Fetch screens from API ONLY
const SCREENS_API = 'http://localhost:8080/api/screens';

// Map screen IDs to page keys for routing
const SCREEN_TO_PAGE_KEY = {
  'SCR001': 'Dashboard',
  'SCR002': 'Users',
  'SCR003': 'Operations',
  'SCR004': 'OperationsDataEntry',
  'SCR005': 'OperationsReview',
  'SCR006': 'OperationsReport',
  'SCR007': 'OperationsApproval',
  'SCR008': 'GenericEntry',
  'SCR009': 'RoleManagement',
  'SCR010': 'UserRoleAssignment',
  'SCR011': 'Centres',
  'SCR012': 'CentreTypes',
  'SCR013': 'Objectives',
  'SCR014': 'Screens',
  'SCR015': 'SuccessIndicator',
  'SCR016': 'Actions',
  'SCR017': 'StatusCodes',
  'SCR018': 'UnitDatatypeCodes',
};

// Map page keys to screen IDs
const PAGE_KEY_TO_SCREEN = {
  'Dashboard': 'SCR001',
  'Users': 'SCR002',
  'Operations': 'SCR003',
  'OperationsDataEntry': 'SCR004',
  'OperationsReview': 'SCR005',
  'OperationsReport': 'SCR006',
  'OperationsApproval': 'SCR007',
  'GenericEntry': 'SCR008',
  'RoleManagement': 'SCR009',
  'UserRoleAssignment': 'SCR010',
  'Centres': 'SCR011',
  'CentreTypes': 'SCR012',
  'Objectives': 'SCR013',
  'Screens': 'SCR014',
  'SuccessIndicator': 'SCR015',
  'Actions': 'SCR016',
  'StatusCodes': 'SCR017',
  'UnitDatatypeCodes': 'SCR018',
};

/**
 * Fetch all screens from API ONLY
 * @returns {Promise<Array>} Array of screen objects from API
 * @throws {Error} If API fails or returns invalid data
 */
export const fetchScreens = async () => {
  try {
    const response = await fetch(SCREENS_API);
    if (!response.ok) {
      throw new Error(`API returned status ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    
    // Ensure we have an array
    if (!Array.isArray(data)) {
      throw new Error('API did not return an array of screens');
    }

    // Validate that we have screens
    if (data.length === 0) {
      throw new Error('API returned empty screens array');
    }

    // Enrich screens with page keys
    return data.map(screen => ({
      ...screen,
      pageKey: SCREEN_TO_PAGE_KEY[screen.screenId] || screen.screenId
    }));
  } catch (error) {
    console.error('❌ Error fetching screens from API:', error.message);
    throw error;  // Re-throw so caller can handle
  }
};

/**
 * Get screen name by page key
 * @param {string} pageKey - The page key
 * @param {Array} screens - Array of screen objects
 * @returns {string} Screen name or page key as fallback
 */
export const getScreenNameByPageKey = (pageKey, screens) => {
  const screen = screens?.find(s => s.pageKey === pageKey);
  return screen?.screenName || pageKey;
};

/**
 * Get screen name by screen ID
 * @param {string} screenId - The screen ID
 * @param {Array} screens - Array of screen objects
 * @returns {string} Screen name or screen ID as fallback
 */
export const getScreenNameByScreenId = (screenId, screens) => {
  const screen = screens?.find(s => s.screenId === screenId);
  return screen?.screenName || screenId;
};

/**
 * Convert page key to screen ID
 * @param {string} pageKey - The page key
 * @returns {string} Screen ID
 */
export const pageKeyToScreenId = (pageKey) => {
  return PAGE_KEY_TO_SCREEN[pageKey] || pageKey;
};

/**
 * Convert screen ID to page key
 * @param {string} screenId - The screen ID
 * @returns {string} Page key
 */
export const screenIdToPageKey = (screenId) => {
  return SCREEN_TO_PAGE_KEY[screenId] || screenId;
};

export const SCREEN_TO_PAGE_KEY_MAP = SCREEN_TO_PAGE_KEY;
export const PAGE_KEY_TO_SCREEN_MAP = PAGE_KEY_TO_SCREEN;
