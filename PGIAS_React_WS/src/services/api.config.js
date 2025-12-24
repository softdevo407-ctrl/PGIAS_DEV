// API Configuration - Centralized API base URL and settings
const API_BASE_URL = 'http://localhost:8080/api';

export const API_ENDPOINTS = {
  // Objectives
  OBJECTIVES: `${API_BASE_URL}/objectives`,
  OBJECTIVES_WEIGHTS: `${API_BASE_URL}/objectives/getWeights`,

  // Actions
  ACTIONS: `${API_BASE_URL}/actions`,
  ACTIONS_BY_OBJECTIVE: `${API_BASE_URL}/actions/objective`,
  ACTIONS_AUTO: `${API_BASE_URL}/actions/auto`,

  // Success Indicators
  SUCCESS_INDICATORS: `${API_BASE_URL}/successindicator/success`,
  SUCCESS_INDICATOR_WEIGHT: `${API_BASE_URL}/successindicator/weight`,

  // Centres
  CENTRES: `${API_BASE_URL}/centres`,

  // Targets
  TARGETS: `${API_BASE_URL}/targets`,
  TARGETS_DELETE: `${API_BASE_URL}/targets/delete`,
  TARGETS_BY_ID: `${API_BASE_URL}/targets/by-id`,

  // User Roles
  USER_ROLES: `${API_BASE_URL}/userroles/login`
};

export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE'
};

export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json'
};

// Generic fetch wrapper with error handling
export const fetchAPI = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      headers: DEFAULT_HEADERS,
      ...options
    });

    if (!response.ok) {
      let errorMessage = `HTTP Error: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        const errorText = await response.text();
        if (errorText) errorMessage = errorText;
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error(`❌ API Error (${url}):`, error.message);
    throw error;
  }
};
