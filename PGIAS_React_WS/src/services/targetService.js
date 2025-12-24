// Target Setting Service - All target-related API calls
import { API_ENDPOINTS, HTTP_METHODS, fetchAPI } from './api.config';

/**
 * Fetch all target settings
 */
export const getAllTargets = async () => {
  console.log(`🔍 Fetching all targets...`);
  return await fetchAPI(`${API_ENDPOINTS.TARGETS}?`, {
    method: HTTP_METHODS.GET
  });
};

/**
 * Fetch saved rows for a specific centre and financial year
 * @param {string} centrecode - Centre code
 * @param {string} financialyear - Financial year (format: YYYY-YYYY)
 */
export const getTargetsByCentreAndFY = async (centrecode, financialyear) => {
  if (!centrecode) {
    console.log('❌ No centre provided, skipping fetch');
    return [];
  }

  const url = `${API_ENDPOINTS.TARGETS}?centrecode=${centrecode}&financialyear=${financialyear}`;
  console.log(`🔍 API Call: GET ${url}`);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`⚠️ API returned status ${response.status} for centre ${centrecode}`);
      return [];
    }

    const data = await response.json();
    console.log(`📦 API Response: ${Array.isArray(data) ? data.length : 0} rows found`, data);

    if (!Array.isArray(data) || data.length === 0) {
      console.log(`ℹ️ No data returned - empty array or not array`);
      return [];
    }

    return data;
  } catch (error) {
    console.error(`❌ Error fetching targets for centre ${centrecode}:`, error.message);
    return [];
  }
};

/**
 * Fetch saved rows by centre code only
 * @param {string} centrecode - Centre code
 */
export const getTargetsByCentre = async (centrecode) => {
  if (!centrecode) {
    console.log('❌ No centre provided, skipping fetch');
    return [];
  }

  const url = `${API_ENDPOINTS.TARGETS}?centrecode=${centrecode}`;
  console.log(`🔍 Fetching targets for centre: ${centrecode}`);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`⚠️ API returned status ${response.status}`);
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(`❌ Error fetching targets:`, error.message);
    return [];
  }
};

/**
 * Fetch saved rows by financial year only
 * @param {string} financialyear - Financial year
 */
export const getTargetsByFY = async (financialyear) => {
  const url = `${API_ENDPOINTS.TARGETS}?financialyear=${financialyear}`;
  console.log(`🔍 Fetching targets for FY: ${financialyear}`);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`⚠️ API returned status ${response.status}`);
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(`❌ Error fetching targets:`, error.message);
    return [];
  }
};

/**
 * Save or update a target setting row
 * @param {object} payload - Target data to save
 */
export const saveTarget = async (payload) => {
  console.log('📝 Saving target:', payload);

  try {
    const response = await fetch(API_ENDPOINTS.TARGETS, {
      method: HTTP_METHODS.POST,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      let errorMessage = 'Failed to save target';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        const errorText = await response.text();
        if (errorText) errorMessage = errorText;
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('✅ Target saved successfully:', result);
    return result;
  } catch (error) {
    console.error('❌ Error saving target:', error.message);
    throw error;
  }
};

/**
 * Delete a target setting row
 * @param {object} id - Composite ID { financialyear, centrecode, objectivecode, actioncode, successindicatorcode }
 */
export const deleteTarget = async (id) => {
  console.log('🗑️ Deleting target with ID:', id);

  try {
    const response = await fetch(API_ENDPOINTS.TARGETS_DELETE, {
      method: HTTP_METHODS.POST,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(id)
    });

    if (!response.ok) {
      let errorMessage = 'Failed to delete target';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        const errorText = await response.text();
        if (errorText) errorMessage = errorText;
      }
      throw new Error(errorMessage);
    }

    console.log('✅ Target deleted successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Error deleting target:', error.message);
    throw error;
  }
};

/**
 * Get target by composite ID
 * @param {object} id - Composite ID
 */
export const getTargetById = async (id) => {
  console.log('🔍 Fetching target by ID:', id);

  try {
    const response = await fetch(API_ENDPOINTS.TARGETS_BY_ID, {
      method: HTTP_METHODS.POST,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(id)
    });

    if (!response.ok) {
      throw new Error('Failed to fetch target');
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Error fetching target:', error.message);
    throw error;
  }
};
