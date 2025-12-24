// Success Indicator Service - All success indicator-related API calls
import { API_ENDPOINTS, HTTP_METHODS } from './api.config';

/**
 * Fetch success indicators by objective code
 * @param {string} objectCode - Objective code
 */
export const getSuccessIndicatorsByObjective = async (objectCode) => {
  console.log(`🔍 Fetching success indicators for objective: ${objectCode}`);
  try {
    const response = await fetch(`${API_ENDPOINTS.SUCCESS_INDICATORS}/${objectCode}`);
    if (!response.ok) throw new Error('Failed to fetch success indicators');
    const data = await response.json();
    console.log(`✅ Success Indicators for ${objectCode}:`, data);
    return data || [];
  } catch (error) {
    console.error(`❌ Error fetching success indicators for ${objectCode}:`, error.message);
    return [];
  }
};

/**
 * Fetch weight value for a specific success indicator
 * @param {string} objectCode - Objective code
 * @param {string} successIndicatorCode - Success indicator code
 */
export const getSuccessIndicatorWeight = async (objectCode, successIndicatorCode) => {
  console.log(`🔍 Fetching weight for SI: ${objectCode} / ${successIndicatorCode}`);
  try {
    const response = await fetch(`${API_ENDPOINTS.SUCCESS_INDICATOR_WEIGHT}/${objectCode}/${successIndicatorCode}`);
    if (!response.ok) throw new Error('Failed to fetch weight value');
    const data = await response.json();

    // Normalize response to { value, unit }
    if (typeof data === 'number') {
      return { value: data, unit: '' };
    } else if (data && typeof data === 'object') {
      return data;
    }
    return null;
  } catch (error) {
    console.error(`❌ Error fetching SI weight:`, error.message);
    return null;
  }
};

/**
 * Map success indicator API response to row data
 * @param {object} item - Success indicator item from API
 */
export const mapSavedDataToRow = (item) => {
  // Determine weight type based on unit field
  let weightType = 'NUMBER'; // default
  if (item.unit === 'Date' || item.unit === 'DATE') {
    weightType = 'DATE';
  } else if (item.unit === 'Percentage' || item.unit === 'PERCENTAGE' || item.validforpercentage === 'Yes') {
    weightType = 'PERCENTAGE';
  }

  return {
    id: `saved_${item.objectivecode}_${item.actioncode}_${item.successindicatorcode}`,
    objectCode: item.objectivecode,
    objectDescription: item.objectivedescription || '',
    mandatory: '',
    multipleEntries: false,
    predefinedParameters: false,
    predefinedReferenceValues: false,
    changeInTargetCriteria: false,
    predefinedActions: false,
    weightPeriod: '',
    unit: item.unit || '',
    unitPreferred: 'Default',
    actionCode: item.actioncode,
    actionName: item.actiondescription || '',
    successIndicatorCode: item.successindicatorcode,
    siName: item.successindicatordescription || '',
    siDescription: item.successindicatordescription || '',
    weightInfo: null,
    selectedWeightType: weightType,
    weightValue: item.weightperunitofactivity ? { value: item.weightperunitofactivity, unit: '' } : null,
    excellent: item.targetcriteriavalueexcellent || '',
    veryGood: item.targetcriteriavalueverygood || '',
    good: item.targetcriteriavaluegood || '',
    fair: item.targetcriteriavaluefair || '',
    poor: item.targetcriteriavaluepoor || '',
    isEditing: false,
    isSaved: true,
    hasChanges: false,
    originalValues: null,
    weightperunitofactivity: item.weightperunitofactivity || 0
  };
};
