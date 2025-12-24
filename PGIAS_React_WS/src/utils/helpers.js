// Helper functions - Misc utilities
import { HQ_CENTRE_CODES } from './constants';

/**
 * Check if centre is HQ
 */
export const isHQCentre = (centrecode, centres = []) => {
  if (HQ_CENTRE_CODES.includes(centrecode)) return true;
  const centre = centres.find(c => c.centrecode === centrecode);
  return centre ? HQ_CENTRE_CODES.includes(centre.centreshortname) : false;
};

/**
 * Check if objective is HQ-only
 */
export const isHQOnlyObjective = (objective) => {
  return objective?.mandatory === 'HQ';
};

/**
 * Check if user can access HQ objective
 */
export const canAccessHQObjective = (objective, currentCentrecode, centres = []) => {
  if (!isHQOnlyObjective(objective)) return true; // Non-HQ objectives visible to all
  return isHQCentre(currentCentrecode, centres); // HQ objectives only for HQ centres
};

/**
 * Build target save payload
 */
export const buildTargetPayload = (row, selectedFY, centrecode, centreObj, userid) => {
  return {
    financialyear: selectedFY,
    centrecode: centrecode,
    centreshortname: centreObj ? centreObj.centreshortname : '',
    objectivecode: row.objectCode,
    objectivedescription: row.objectDescription || '',
    actioncode: row.actionCode,
    actiondescription: row.actionName || '',
    successindicatorcode: row.successIndicatorCode,
    successindicatordescription: row.siName || '',
    unit: row.unit || '',
    targetsetvalue: row.excellent || '',
    weightperunitofactivity: row.weightValue?.value || 0,
    targetcriteriavalueexcellent: row.excellent || '',
    targetcriteriavalueverygood: row.veryGood || '',
    targetcriteriavaluegood: row.good || '',
    targetcriteriavaluefair: row.fair || '',
    targetcriteriavaluepoor: row.poor || '',
    achievementstatuscode: null,
    achievementstatusdescription: null,
    validforpercentage: row.selectedWeightType === 'PERCENTAGE' ? 'Yes' : 'No',
    targetvalueachieved: null,
    achievementweightperunitofactivity: null,
    actualachievementpercentage: null,
    statuscode: 'T01',
    statusdescription: 'Target Setting',
    remarksofcentres: '',
    remarksofhqorapexcommittee: '',
    centrelevelapproveduserid: null,
    departmentlevelapproveduserid: null,
    userid: userid,
    regstatus: 'A',
    regtime: new Date().toISOString()
  };
};

/**
 * Build delete ID payload
 */
export const buildDeletePayload = (row, selectedFY) => {
  const fyYear = selectedFY.replace('-', '/');
  return {
    financialyear: fyYear,
    centrecode: row.centrecode,
    objectivecode: row.objectCode,
    actioncode: row.actionCode,
    successindicatorcode: row.successIndicatorCode
  };
};

/**
 * Generate unique row ID
 */
export const generateRowId = (objectCode, actionCode = '', siCode = '', timestamp = false) => {
  const base = `${objectCode}_${actionCode}_${siCode}`.replace(/\s+/g, '_');
  return timestamp ? `${base}_${Date.now()}` : base;
};

/**
 * Group rows by objective code
 */
export const groupRowsByObjective = (rows) => {
  const grouped = {};
  rows.forEach(row => {
    if (!grouped[row.objectCode]) {
      grouped[row.objectCode] = [];
    }
    grouped[row.objectCode].push(row);
  });
  return grouped;
};

/**
 * Get total weight for objective
 */
export const calculateTotalWeight = (rows, objectCode) => {
  const objectRows = rows.filter(r => r.objectCode === objectCode && r.isSaved);
  const totalWeight = objectRows.reduce((sum, row) => {
    let weight = 0;
    if (row.weightperunitofactivity && typeof row.weightperunitofactivity === 'number') {
      weight = row.weightperunitofactivity;
    } else if (row.weightValue && row.weightValue.value) {
      weight = parseFloat(row.weightValue.value) || 0;
    }
    return sum + weight;
  }, 0);
  return totalWeight > 0 ? totalWeight.toFixed(2) : null;
};

/**
 * Deep clone object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Compare two objects for changes
 */
export const hasChanges = (original, current) => {
  return JSON.stringify(original) !== JSON.stringify(current);
};

/**
 * Get changed fields
 */
export const getChangedFields = (original, current) => {
  const changes = {};
  Object.keys(current).forEach(key => {
    if (original[key] !== current[key]) {
      changes[key] = {
        old: original[key],
        new: current[key]
      };
    }
  });
  return changes;
};
