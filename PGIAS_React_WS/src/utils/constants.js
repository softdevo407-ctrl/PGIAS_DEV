// Constants - All application constants
export const OPERATIONS = {
  TARGET_SETTING: 'TARGET_SETTING',
  TARGET_ACHIEVED: 'TARGET_ACHIEVED'
};

export const FINANCIAL_YEARS = {
  TARGET_SETTING: '2026-2027',
  TARGET_ACHIEVED: '2025-2026'
};

export const PERFORMANCE_LEVELS = {
  EXCELLENT: 'excellent',
  VERY_GOOD: 'veryGood',
  GOOD: 'good',
  FAIR: 'fair',
  POOR: 'poor'
};

export const PERFORMANCE_LEVEL_NAMES = {
  excellent: 'Excellent',
  veryGood: 'Very Good',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor'
};

export const WEIGHT_TYPES = {
  DATE: 'DATE',
  NUMBER: 'NUMBER',
  PERCENTAGE: 'PERCENTAGE'
};

export const STATUS_CODES = {
  TARGET_SETTING: 'T01',
  ACTIVE: 'A',
  INACTIVE: 'I'
};

export const DEFAULT_ROW_STATE = {
  actionCode: '',
  actionName: '',
  successIndicatorCode: '',
  siName: '',
  siDescription: '',
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

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100
};

export const MESSAGES = {
  LOADING: 'Loading data...',
  SAVING: 'Saving...',
  DELETING: 'Deleting...',
  SAVED_SUCCESS: '✅ Saved successfully!',
  DELETE_SUCCESS: '✅ Deleted successfully!',
  ERROR_GENERIC: '❌ An error occurred',
  ERROR_SAVE: '❌ Error saving data',
  ERROR_DELETE: '❌ Error deleting data',
  CONFIRM_DELETE: 'Are you sure you want to delete this entry?',
  CONFIRM_EDIT: 'Are you sure you want to edit this row?'
};

export const VALIDATION_MESSAGES = {
  CENTRE_REQUIRED: '⚠️ Please select a centre before proceeding',
  CENTRE_REQUIRED_SAVE: '⚠️ Please select a centre before saving',
  OBJECTIVE_REQUIRED: 'Please select Objective',
  ACTION_REQUIRED: 'Please select Action Code',
  SI_REQUIRED: 'Please select Success Indicator',
  EXCELLENT_MANDATORY: '📊 Excellent value is MANDATORY'
};

export const HQ_CENTRE_CODES = ['13', 'HQ'];

export const EDIT_MODES = {
  VIEW: 'view',
  EDIT: 'edit',
  CREATE: 'create'
};
