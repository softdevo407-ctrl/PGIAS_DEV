// Objective Service - All objective-related API calls
import { API_ENDPOINTS, HTTP_METHODS } from './api.config';

/**
 * Fetch all objectives
 */
export const getAllObjectives = async () => {
  console.log(`🔍 Fetching all objectives...`);
  try {
    const response = await fetch(API_ENDPOINTS.OBJECTIVES);
    if (!response.ok) throw new Error('Failed to fetch objectives');
    const data = await response.json();
    console.log('✅ Fetched Objectives:', data);
    return data || [];
  } catch (error) {
    console.error('❌ Error fetching objectives:', error.message);
    throw error;
  }
};

/**
 * Fetch weight information for an objective
 * @param {string} objectCode - Objective code
 */
export const getObjectiveWeight = async (objectCode) => {
  console.log(`🔍 Fetching weight for objective: ${objectCode}`);
  try {
    const response = await fetch(`${API_ENDPOINTS.OBJECTIVES_WEIGHTS}/${objectCode}`);
    if (!response.ok) throw new Error('Failed to fetch weight');
    const data = await response.json();
    // data format: { objectivecode: "001A", weightType: "DATE", unit: "Date" }
    console.log(`✅ Weight data for ${objectCode}:`, data);
    return data;
  } catch (error) {
    console.error(`❌ Error fetching weight for ${objectCode}:`, error.message);
    throw error;
  }
};

/**
 * Map objective data to row format
 * @param {object} obj - Objective from API
 */
export const mapObjectiveToRow = (obj) => {
  const hasMultipleEntries = obj.multipleentries === 'Yes';
  const hasPredefinedActions = obj.predefinedactions === 'Yes';

  return {
    id: `obj_${obj.objectivecode}`,
    objectCode: obj.objectivecode,
    objectDescription: obj.objectivedescription,
    mandatory: obj.mandatory,
    multipleEntries: hasMultipleEntries,
    predefinedParameters: obj.predefinedparameters === 'Yes',
    predefinedReferenceValues: obj.predefinedreferencevalues === 'Yes',
    changeInTargetCriteria: obj.changeintargetcriteria === 'Yes',
    predefinedActions: hasPredefinedActions,
    weightPeriod: obj.weightperinitofactivity,
    unit: obj.unit,
    unitPreferred: obj.unitpreferred,
    // Entry fields
    actionCode: '',
    actionName: '',
    successIndicatorCode: '',
    siName: '',
    siDescription: '',
    weightInfo: null,
    selectedWeightType: null,
    excellent: '',
    veryGood: '',
    good: '',
    fair: '',
    poor: '',
    isEditing: true,
    isSaved: false,
    hasChanges: false,
    originalValues: null
  };
};
