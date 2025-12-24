// Validators - All validation functions
import { PERFORMANCE_LEVELS } from './constants';

/**
 * Validate that excellent field is filled (mandatory)
 */
export const validateExcellentMandatory = (row) => {
  if (!row.excellent && row.excellent !== 0) {
    return {
      isValid: false,
      field: 'excellent',
      message: '📊 Excellent value is MANDATORY'
    };
  }
  return { isValid: true };
};

/**
 * Validate performance levels order
 * For DATE: ascending order (earlier dates for higher performance)
 * For NUMBER/PERCENTAGE: descending order (higher values for higher performance)
 */
export const validatePerformanceLevelOrder = (row) => {
  const performanceLevels = [
    { name: 'Excellent', value: row.excellent, key: 'excellent' },
    { name: 'Very Good', value: row.veryGood, key: 'veryGood' },
    { name: 'Good', value: row.good, key: 'good' },
    { name: 'Fair', value: row.fair, key: 'fair' },
    { name: 'Poor', value: row.poor, key: 'poor' }
  ];

  // Count how many fields have values
  const enteredLevels = performanceLevels.filter(level => level.value !== null && level.value !== '');

  // Only validate order if 2 or more values are entered
  if (enteredLevels.length < 2) {
    return { isValid: true };
  }

  const weightType = row.selectedWeightType || 'NUMBER';

  if (weightType === 'DATE') {
    // DATE: ascending order (Excellent < Very Good < Good < Fair < Poor)
    for (let i = 0; i < performanceLevels.length - 1; i++) {
      const current = performanceLevels[i];
      const next = performanceLevels[i + 1];

      if (!current.value) continue;

      if (next.value) {
        if (new Date(current.value) >= new Date(next.value)) {
          return {
            isValid: false,
            field: next.key,
            message: `❌ ${next.name} date must be after ${current.name} date`
          };
        }
      }
    }
  } else {
    // NUMBER/PERCENTAGE: descending order (Excellent > Very Good > Good > Fair > Poor)
    for (let i = 0; i < performanceLevels.length - 1; i++) {
      const current = performanceLevels[i];
      const next = performanceLevels[i + 1];

      if (!current.value && current.value !== 0) continue;

      if (next.value || next.value === 0) {
        const currentNum = parseFloat(current.value);
        const nextNum = parseFloat(next.value);

        if (currentNum <= nextNum) {
          return {
            isValid: false,
            field: next.key,
            message: `❌ ${next.name} must be less than ${current.name}`
          };
        }
      }
    }
  }

  return { isValid: true };
};

/**
 * Complete validation for a row
 */
export const validateRow = (row, objectives) => {
  // Validate centre is selected (will be checked in parent component)
  if (!row.objectCode || !row.actionCode || !row.successIndicatorCode) {
    let missingField = 'objectCode';
    let errorMsg = 'Please select Objective';

    if (row.objectCode && !row.actionCode) {
      missingField = 'actionCode';
      errorMsg = 'Please select Action Code';
    } else if (row.objectCode && row.actionCode && !row.successIndicatorCode) {
      missingField = 'successIndicatorCode';
      errorMsg = 'Please select Success Indicator';
    }

    return {
      isValid: false,
      field: missingField,
      message: errorMsg
    };
  }

  // Validate objective exists
  const objective = objectives.find(o => o.objectivecode === row.objectCode);
  if (!objective) {
    return {
      isValid: false,
      field: 'objectCode',
      message: 'Objective not found'
    };
  }

  // Validate Excellent is mandatory
  const excellentValidation = validateExcellentMandatory(row);
  if (!excellentValidation.isValid) {
    return excellentValidation;
  }

  // Validate order if multiple values entered
  const orderValidation = validatePerformanceLevelOrder(row);
  if (!orderValidation.isValid) {
    return orderValidation;
  }

  return { isValid: true };
};
