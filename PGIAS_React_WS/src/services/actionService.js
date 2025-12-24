// Action Service - All action-related API calls
import { API_ENDPOINTS, HTTP_METHODS } from './api.config';

/**
 * Fetch actions by objective code
 * @param {string} objectCode - Objective code
 */
export const getActionsByObjective = async (objectCode) => {
  console.log(`🔍 Fetching actions for objective: ${objectCode}`);
  try {
    const response = await fetch(`${API_ENDPOINTS.ACTIONS_BY_OBJECTIVE}/${objectCode}`);
    if (!response.ok) throw new Error('Failed to fetch actions');
    const data = await response.json();
    console.log(`✅ Actions for ${objectCode}:`, data);
    return data || [];
  } catch (error) {
    console.error(`❌ Error fetching actions for ${objectCode}:`, error.message);
    return [];
  }
};

/**
 * Save auto-generated action
 * @param {object} payload - { objectivecode, actioncode, actiondescription }
 */
export const saveAutoAction = async (payload) => {
  console.log('📝 Saving auto action:', payload);
  try {
    const response = await fetch(API_ENDPOINTS.ACTIONS_AUTO, {
      method: HTTP_METHODS.POST,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      let errorMessage = 'Failed to save action';
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
    console.log('✅ Action saved successfully:', result);
    return result;
  } catch (error) {
    console.error('❌ Error saving action:', error.message);
    throw error;
  }
};

/**
 * Generate action code: ObjectiveCode + "A" + 6-digit sequential number
 * @param {string} objectivecode - Objective code (e.g., "001A")
 * @param {array} existingActions - Array of existing actions
 */
export const generateActionCode = (objectivecode, existingActions = []) => {
  let maxNum = 0;
  existingActions.forEach(action => {
    const match = action.actioncode.match(/(\d{6})$/);
    if (match) {
      const num = parseInt(match[1]);
      if (num > maxNum) maxNum = num;
    }
  });

  const nextNum = (maxNum + 1).toString().padStart(6, '0');
  return `${objectivecode}A${nextNum}`; // e.g., 001AA000001
};
