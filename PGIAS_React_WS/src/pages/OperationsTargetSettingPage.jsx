// OPERATIONAL DATA ENTRY - TARGET SETTING PAGE (Backend Integrated)
// This is a new, completely redesigned page with table-based entry

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, CheckCircle, ChevronDown, ChevronRight, X, Search, Loader, AlertCircle } from 'lucide-react';
import CreatableSelect from 'react-select/creatable';

const OperationsTargetSettingPage = () => {
  // State Management
  const [operation, setOperation] = useState('TARGET_SETTING');
  const [selectedFY, setSelectedFY] = useState('FY2024-25');
  const [objectives, setObjectives] = useState([]);
  const [actions, setActions] = useState({});
  const [successIndicators, setSuccessIndicators] = useState({});
  const [weights, setWeights] = useState({});
  const [totalWeights, setTotalWeights] = useState({}); // Store total weight per objective (sum of weightperunitofactivity)
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedObjectives, setExpandedObjectives] = useState({}); // Track which objectives are expanded
  
  // Action creation state
  const [showActionModal, setShowActionModal] = useState(false);
  const [newActionObjective, setNewActionObjective] = useState(''); // Which objective is creating action
  const [newActionForm, setNewActionForm] = useState({
    actiondescription: '',
    actionname: ''
  });
  const [inlineActionRows, setInlineActionRows] = useState({}); // Track which rows are showing inline action form

  // Tooltip error state
  const [tooltipError, setTooltipError] = useState(null); // { rowId, field, message }

  // Financial Years for display
  const financialYears = [
    { id: 'FY2024-25', name: 'FY 2024-25' },
    { id: 'FY2023-24', name: 'FY 2023-24' },
    { id: 'FY2022-23', name: 'FY 2022-23' }
  ];

  // Fetch Objectives on component mount
  useEffect(() => {
    fetchObjectives();
    // Initialize Bootstrap tooltips
    if (window.$ && window.$.fn.tooltip) {
      window.$('[data-toggle="tooltip"]').tooltip({
        trigger: 'hover',
        placement: 'bottom',
        delay: { show: 500, hide: 100 }
      });
    }
  }, []);

  // When objectives load, create rows for each objective
  useEffect(() => {
    if (objectives.length > 0) {
      const newRows = objectives.map(obj => {
        const hasMultipleEntries = obj.multipleentries === 'Yes';
        const hasPredefinedActions = obj.predefinedactions === 'Yes';
        
        console.log(`📊 ${obj.objectivecode}: multipleEntries=${hasMultipleEntries}, predefinedActions=${hasPredefinedActions}`);
        
        return {
          id: `obj_${obj.objectivecode}`,
          objectCode: obj.objectivecode,
          objectDescription: obj.objectivedescription,
          // Metadata from API
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
          selectedWeightType: null,  // User's selected weight type (can differ from default)
          excellent: '',
          veryGood: '',
          good: '',
          fair: '',
          poor: '',
          isEditing: true,
          isSaved: false,
          hasChanges: false,  // Track if row has unsaved changes after being saved
          originalValues: null  // Store original values when entering edit mode
        };
      });
      setRows(newRows);
      // Auto-fetch actions and weights for each objective
      objectives.forEach(obj => {
        fetchActions(obj.objectivecode);
        fetchWeightAndUpdateRow(obj.objectivecode);
      });
    }
  }, [objectives]);

  // Auto-select default action and fetch SI options when actions load
  // For multi-entry objectives, DO NOT pre-create extra rows - only create when user clicks 'Add Entry'
  // Single-entry objectives get their rows from fetchExistingTargetData API call
  useEffect(() => {
    if (Object.keys(actions).length > 0) {
      setRows(prev => {
        const updated = [...prev];
        
        // For single-entry objectives, populate the first row with default action
        objectives.forEach(obj => {
          const isMultiEntry = obj.multipleentries === 'Yes';
          
          const availableActions = (actions[obj.objectivecode] || []).filter(a => !a.actioncode.includes('XX'));
          
          // Update existing rows with default action code if empty
          for (let row of updated) {
            if (row.objectCode === obj.objectivecode && !row.actionCode && availableActions.length > 0) {
              const defaultAction = availableActions[0];
              row.actionCode = defaultAction.actioncode;
              row.actionName = defaultAction.actiondescription;
              fetchSuccessIndicators(row.objectCode, defaultAction.actioncode);
            }
          }
        });
        
        return updated;
      });
    }
  }, [actions]);

  // Set default selectedWeightType when weights load
  useEffect(() => {
    if (Object.keys(weights).length > 0) {
      setRows(prev => {
        const updated = [...prev];
        for (let row of updated) {
          if (weights[row.objectCode] && !row.selectedWeightType) {
            row.selectedWeightType = weights[row.objectCode].weightType;
          }
        }
        return updated;
      });
    }
  }, [weights]);

  // Load existing saved data for single-entry objectives
  useEffect(() => {
    if (objectives.length > 0) {
      objectives.forEach(obj => {
        // Only fetch for single-entry objectives (multipleentries === 'No')
        if (obj.multipleentries === 'No') {
          fetchExistingTargetData(obj.objectivecode);
        }
      });
    }
  }, [objectives, selectedFY]);

  // Update Bootstrap tooltips when error state changes
  useEffect(() => {
    if (window.$ && window.$.fn.tooltip) {
      // Destroy existing tooltips
      window.$('[data-toggle="tooltip"]').tooltip('dispose');
      // Reinitialize with updated content
      window.$('[data-toggle="tooltip"]').tooltip({
        trigger: 'hover',
        placement: 'bottom',
        delay: { show: 500, hide: 100 }
      });
    }
  }, [tooltipError]);

  // ===== API CALLS ====="
  
  // Fetch Objectives from: http://localhost:8080/api/objectives
  const fetchObjectives = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/objectives');
      if (!response.ok) throw new Error('Failed to fetch objectives');
      const data = await response.json();
      console.log('Fetched Objectives:', data);
      setObjectives(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch objectives: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Actions from: http://localhost:8080/api/actions/objective/{objectcode}
  const fetchActions = async (objectCode) => {
    try {
      const response = await fetch(`http://localhost:8080/api/actions/objective/${objectCode}`);
      if (!response.ok) throw new Error('Failed to fetch actions');
      const data = await response.json();
      setActions(prev => ({
        ...prev,
        [objectCode]: data
      }));
    } catch (err) {
      console.error('Failed to fetch actions:', err);
      setActions(prev => ({
        ...prev,
        [objectCode]: []
      }));
    }
  };

  // Generate auto action code: ObjectiveCode + "A" + sequential number with SIX zeros (e.g., 001AA000001, 001AA000002)
  // When multiple entries = Yes, actionCode uses format: ObjectiveCodeA000000 (six zeros)
  const generateActionCode = (objectivecode) => {
    // Get all existing actions for this objective
    const existingActions = actions[objectivecode] || [];
    const objectivePrefix = objectivecode; // e.g., "001A"
    
    // Find highest sequential number
    let maxNum = 0;
    existingActions.forEach(action => {
      // Pattern: 001AA000001, 001AA000002, etc.
      // Extract the 6-digit number at end (SIX zeros format)
      const match = action.actioncode.match(/(\d{6})$/);
      if (match) {
        const num = parseInt(match[1]);
        if (num > maxNum) maxNum = num;
      }
    });
    
    // Generate next code with SIX zeros padding
    const nextNum = (maxNum + 1).toString().padStart(6, '0');
    return `${objectivePrefix}A${nextNum}`; // e.g., 001AA000001 (SIX zeros)
  };

  // Save inline action (user-entered action with auto-generated code)
  const saveInlineAction = async (rowId, objectCode, actionDescription) => {
    if (!actionDescription?.trim()) {
      alert('❌ Please enter an action description');
      return;
    }

    try {
      setLoading(true);
      
      // Generate action code
      const generatedCode = generateActionCode(objectCode);
      
      // Prepare payload for auto endpoint
      const payload = {
        objectivecode: objectCode,
        actioncode: generatedCode,
        actiondescription: actionDescription.trim()
      };

      // Save action to backend AUTO endpoint
      const response = await fetch('http://localhost:8080/api/actions/auto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        // Parse error response
        let errorMessage = 'Failed to save action';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          // If response is not JSON, try text
          const errorText = await response.text();
          if (errorText) errorMessage = errorText;
        }
        
        // Check for duplicate description error
        if (errorMessage.includes('already exists')) {
          alert(`⚠️ ${errorMessage}\n\nPlease enter a different action description.`);
        } else {
          throw new Error(errorMessage);
        }
        return;
      }
      
      const savedAction = await response.json();
      console.log('✅ Action saved via AUTO API:', savedAction);

      // Update actions list with the new action from API response
      setActions(prev => ({
        ...prev,
        [objectCode]: [...(prev[objectCode] || []), savedAction]
      }));

      // Update the row with the new action
      setRows(prev => prev.map(row =>
        row.id === rowId
          ? { 
              ...row, 
              actionCode: generatedCode, 
              actionName: actionDescription.trim(),
              successIndicatorCode: '',
              siName: '',
              siDescription: ''
            }
          : row
      ));

      // Fetch success indicators for this new action
      fetchSuccessIndicators(objectCode, generatedCode);

      // Clear inline form
      setInlineActionRows(prev => ({...prev, [rowId]: false}));
      setNewActionForm({ actiondescription: '', actionname: '' });

      alert('✅ Action created successfully!');
    } catch (err) {
      alert('❌ Error saving action: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Success Indicators from: http://localhost:8080/api/successindicator/{objectcode}/{actioncode}
  const fetchSuccessIndicators = async (objectCode, actionCode) => {
    try {
      const response = await fetch(`http://localhost:8080/api/successindicator/success/${objectCode}`);
      if (!response.ok) throw new Error('Failed to fetch success indicators');
      const data = await response.json();
      console.log(`Fetched Success Indicators for ${objectCode} + ${actionCode}:`, data);
      const key = `${objectCode}_${actionCode}`;
      setSuccessIndicators(prev => ({
        ...prev,
        [key]: data
      }));
      
      // Total weight will be calculated from saved row values, not from initial SI data
      // Store success indicators first, weight calculation happens when rows are saved
    } catch (err) {
      console.error('Failed to fetch success indicators:', err);
      const key = `${objectCode}_${actionCode}`;
      setSuccessIndicators(prev => ({
        ...prev,
        [key]: []
      }));
    }
  };

  // Fetch Weight from: http://localhost:8080/api/objectives/getWeights/{objectcode}
  const fetchWeightAndUpdateRow = async (objectCode) => {
    try {
      console.log(objectCode)
      const response = await fetch(`http://localhost:8080/api/objectives/getWeights/${objectCode}`);
      if (!response.ok) throw new Error('Failed to fetch weight');
      const data = await response.json();
      // data format: { objectivecode: "001A", weightType: "DATE", unit: "Date" }
      
      // Store in weights state
      setWeights(prev => ({
        ...prev,
        [objectCode]: data
      }));

      // Update the row's weightInfo with the fetched data
      // Convert weightType from API to type field for consistency
      setRows(prev => prev.map(row => 
        row.objectCode === objectCode 
          ? { 
              ...row, 
              weightInfo: {
                type: data.weightType,  // API sends "weightType", we store as "type"
                unit: data.unit,
                objectivecode: data.objectivecode
              }
            }
          : row
      ));
    } catch (err) {
      console.error('Failed to fetch weight:', err);
      return null;
    }
  };

  // Fetch existing saved target data for single-entry objectives
  // Uses Success Indicator API which provides default values
  const fetchExistingTargetData = async (objectCode) => {
    try {
      // Call Success Indicator API to get default values for single-entry objectives
      const response = await fetch(`http://localhost:8080/api/successindicator/success/${objectCode}`);
      if (!response.ok) {
        console.log(`No success indicators found for ${objectCode}`);
        return [];
      }
      const data = await response.json();
      
      if (!Array.isArray(data) || data.length === 0) {
        console.log(`No data returned for ${objectCode}`);
        return [];
      }
      
      console.log(`✅ Loaded ${data.length} rows for ${objectCode}`);
      
      // Total weight will be calculated from saved row values
      // Each row's weight contribution is tracked separately based on saved data
      
      // Map success indicator data to rows
      // New API structure: actioncode, actiondescription, successindicatorcode, successindicatordescription are all direct properties
      const existingRows = data.map((item, idx) => {
        // Normalize defaultorfixed value: "fixed" or "Fixed" → "Fixed", "default" or "Default" → "Default"
        const normalizedWeightPref = item.defaultorfixed ? 
          (item.defaultorfixed.toLowerCase() === 'fixed' ? 'Fixed' : 'Default') : 'Default';
        
        return {
          id: `obj_${objectCode}_saved_${idx}`,
          objectCode: objectCode,
          objectDescription: '',
          mandatory: '',
          multipleEntries: false,
          predefinedParameters: false,
          predefinedReferenceValues: false,
          changeInTargetCriteria: false,
          predefinedActions: false,
          weightPeriod: '',
          unit: item.unit || '',
          unitPreferred: normalizedWeightPref,  // Normalized defaultorfixed value (Fixed or Default)
          // Map from success indicator response (flat structure)
          actionCode: item.actioncode || '',
          actionName: item.actiondescription || '',  // Action description directly from API
          successIndicatorCode: item.successindicatorcode || '',
          siName: item.successindicatordescription || '',  // SI description from API
          siDescription: item.successindicatordescription || '',
          weightInfo: null,
          selectedWeightType: item.unit === 'Number' ? 'NUMBER' : item.unit === 'Percentage' ? 'PERCENTAGE' : item.unit === 'Date' ? 'DATE' : 'NUMBER',
          weightValue: item.weightperunitofactivity ? { value: item.weightperunitofactivity, unit: '' } : null,
          // Performance level target criteria
          excellent: item.targetcriteriavalueexcellent || '',
          veryGood: item.targetcriteriavalueverygood || '',
          good: item.targetcriteriavaluegood || '',
          fair: item.targetcriteriavaluefair || '',
          poor: item.targetcriteriavaluepoor || '',
          isEditing: true,   // All fields editable
          isSaved: false,     // Allow editing
          hasChanges: false,
          originalValues: null,
          weightperunitofactivity: item.weightperunitofactivity || 0  // Store weight value for total calculation
        };
      });
      
      // Replace placeholder row with actual saved rows
      setRows(prev => {
        const filtered = prev.filter(r => r.objectCode !== objectCode || r.isSaved);
        return [...filtered, ...existingRows];
      });
      
      // Auto-expand this objective to show its loaded rows
      setExpandedObjectives(prev => ({...prev, [objectCode]: true}));
      
      return existingRows;
    } catch (err) {
      console.error(`Failed to fetch existing data for ${objectCode}:`, err);
      return [];
    }
  };

  // Fetch Weight Value from: http://localhost:8080/api/successindicator/weight/{objectcode}/{successindicatorcode}
  const fetchWeightValue = async (objectCode, successIndicatorCode) => {
    try {
      const response = await fetch(`http://localhost:8080/api/successindicator/weight/${objectCode}/${successIndicatorCode}`);
      if (!response.ok) throw new Error('Failed to fetch weight value');
      const data = await response.json();
      console.log(`Fetched Weight Value for ${objectCode} + ${successIndicatorCode}:`, data);
      // data format can be: just a number (0.75) or object { value: "5.5", unit: "kg" }
      // Return in normalized format: { value: number, unit: '' }
      if (typeof data === 'number') {
        return { value: data, unit: '' };
      } else if (data && typeof data === 'object') {
        return data;
      }
      return null;
    } catch (err) {
      console.error('Failed to fetch weight value:', err);
      return null;
    }
  };

  // Save Row to Backend: POST http://localhost:8080/api/target-setting
  const saveRowToBackend = async (row) => {
    try {
      const payload = {
        financialYear: selectedFY,
        objectCode: row.objectCode,
        actionCode: row.actionCode,
        successIndicatorCode: row.successIndicatorCode,
        weightInfo: row.weightInfo,
        selectedWeightType: row.selectedWeightType,
        excellent: row.excellent,
        veryGood: row.veryGood,
        good: row.good,
        fair: row.fair,
        poor: row.poor,
        status: 'SAVED'
      };

      console.log('📝 Row payload to save:', payload);
      
      // Once API is ready, uncomment below to POST to backend:
      /*
      const response = await fetch('http://localhost:8080/api/target-setting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('Failed to save row');
      const result = await response.json();
      return "Saved Successfully";
      */
      
      // For now, just return success (API endpoint will be added)
      return "Row saved (API endpoint pending)";
    } catch (err) {
      throw new Error('Error saving row: ' + err.message);
    }
  };

  // ===== ROW MANAGEMENT FUNCTIONS =====

  // Handle action selection - fetch success indicators
  const handleActionChange = (rowId, objectCode, actionCode) => {
    const action = actions[objectCode]?.find(a => a.actioncode === actionCode);
    
    setRows(rows.map(row =>
      row.id === rowId
        ? { 
            ...row, 
            actionCode, 
            actionName: action?.actiondescription || '', 
            successIndicatorCode: '',
            siName: '',
            siDescription: ''
          }
        : row
    ));
    
    // Fetch success indicators for this objective + action combo
    fetchSuccessIndicators(objectCode, actionCode);
  };

  // Handle success indicator selection
  const handleSIChange = (rowId, objectCode, actionCode, siCode) => {
    const key = `${objectCode}_${actionCode}`;
    // successindicatorcode is a direct property in the flat API response
    const si = successIndicators[key]?.find(s => s.successindicatorcode === siCode);
    
    setRows(rows.map(row =>
      row.id === rowId
        ? { 
            ...row, 
            successIndicatorCode: siCode,  // Store CODE
            siName: si?.successindicatordescription || '',  // Display DESCRIPTION
            siDescription: si?.successindicatordescription || '',
            // Don't auto-populate performance levels - let user enter manually
            // Keep empty so user can enter their own values
            excellent: '',
            veryGood: '',
            good: '',
            fair: '',
            poor: '',
            weightValue: null  // Reset weight value, will be fetched
          }
        : row
    ));

    // Clear tooltip error when user selects success indicator
    if (tooltipError?.rowId === rowId && tooltipError?.field === 'successIndicatorCode') {
      setTooltipError(null);
    }

    // Fetch weight info for this objective + SI combo
    fetchWeightAndUpdateRow(objectCode);
    
    // Fetch weight value for this specific SI
    fetchWeightValue(objectCode, siCode).then(weightData => {
      if (weightData) {
        setRows(prev => prev.map(row =>
          row.id === rowId ? { ...row, weightValue: weightData } : row
        ));
      }
    });
  };

  // Handle weight type selection
  const handleWeightTypeChange = (rowId, weightType) => {
    setRows(rows.map(row =>
      row.id === rowId
        ? { ...row, selectedWeightType: weightType }
        : row
    ));
  };

  // Handle value changes in Excellent/Very Good/Good/Fair/Poor columns
  const handleFieldChange = (rowId, field, value) => {
    setRows(rows.map(row => {
      if (row.id === rowId) {
        // If row was saved, mark it as having changes when any field is modified
        const hasChanges = row.isSaved ? true : false;
        return { ...row, [field]: value, hasChanges };
      }
      return row;
    }));
    
    // Clear tooltip error when user starts editing
    if (tooltipError?.rowId === rowId) {
      setTooltipError(null);
    }
  };

  // Save row to backend and freeze it
  const saveRow = async (row) => {
    // Validate mandatory fields
    if (!row.objectCode || !row.actionCode || !row.successIndicatorCode) {
      let missingField = 'objectCode';
      let errorMsg = 'Please select Objective';
      
      if (row.objectCode && !row.actionCode) {
        missingField = 'actionCode';
        errorMsg = 'Please select Action Code';
      } else if (row.objectCode && row.actionCode && !row.successIndicatorCode) {
        missingField = 'successIndicatorCode';
        errorMsg = 'Please select Success Indicator';
      } else if (!row.objectCode && !row.actionCode && !row.successIndicatorCode) {
        errorMsg = 'Please select all master data (Objective, Action, Success Indicator)';
      }
      
      setTooltipError({
        rowId: row.id,
        field: missingField,
        message: errorMsg
      });
      return;
    }

    // Get metadata from objectives array
    const objective = objectives.find(o => o.objectivecode === row.objectCode);
    if (!objective) {
      setTooltipError({
        rowId: row.id,
        field: 'objectCode',
        message: 'Objective not found'
      });
      return;
    }
    
    // Performance levels are OPTIONAL - only validate if 2 or more are entered
    const validationResult = validatePerformanceLevels(row);
    if (!validationResult.isValid) {
      // Set tooltip error to show below the problematic column
      setTooltipError({
        rowId: row.id,
        field: validationResult.field,
        message: validationResult.message
      });
      return;
    }

    try {
      setLoading(true);
      await saveRowToBackend(row);
      
      // Freeze the row after successful save
      setRows(rows.map(r =>
        r.id === row.id ? { ...r, isEditing: false, isSaved: true, hasChanges: false } : r
      ));
      alert('✅ Row saved successfully!');
    } catch (err) {
      alert('❌ Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Show alert before editing a saved row
  const requestEditRow = (rowId) => {
    const confirmed = window.confirm('Are you sure you want to edit this row?');
    if (confirmed) {
      setRows(rows.map(r => {
        if (r.id === rowId) {
          return { 
            ...r, 
            isEditing: true,
            hasChanges: false,
            originalValues: { ...r }
          };
        }
        return r;
      }));
    }
  };

  // Show confirmation dialog before deleting a row
  const requestDeleteRow = (rowId) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      setRows(rows.filter(r => r.id !== rowId));
    }
  };

  // Add a new entry row for an objective that allows multiple entries
  // Inserts the new entry directly below the last existing entry for that objective
  const addNewEntryForObjective = async (objectCode) => {
    // Get metadata from objectives array
    const objective = objectives.find(o => o.objectivecode === objectCode);
    if (!objective) return;
    
    const allowsMultiple = objective.multipleentries === 'Yes';
    if (!allowsMultiple) {
      alert('❌ This objective does not allow multiple entries');
      return;
    }

    // Count existing entries for this objective
    const existingEntries = rows.filter(r => r.objectCode === objectCode);

    // Don't pre-select a default action - let user choose
    const defaultActionCode = '';
    const defaultActionName = '';

    // Default weight info from weights cache if available
    const defaultWeight = weights[objectCode] || null;

    // Create new row
    const newRow = {
      id: `obj_${objectCode}_${Date.now()}`,
      objectCode: objectCode,
      objectDescription: objective.objectivedescription,
      // Metadata from API
      mandatory: objective.mandatory,
      multipleEntries: true,
      predefinedParameters: objective.predefinedparameters === 'Yes',
      predefinedReferenceValues: objective.predefinedreferencevalues === 'Yes',
      changeInTargetCriteria: objective.changeintargetcriteria === 'Yes',
      predefinedActions: objective.predefinedactions === 'Yes',
      weightPeriod: objective.weightperinitofactivity,
      unit: objective.unit,
      unitPreferred: objective.unitpreferred,
      // Entry fields (auto-select default action if available)
      actionCode: defaultActionCode,
      actionName: defaultActionName,
      successIndicatorCode: '',
      siName: '',
      siDescription: '',
      weightInfo: defaultWeight ? { type: defaultWeight.weightType, unit: defaultWeight.unit, objectivecode: objectCode } : null,
      selectedWeightType: defaultWeight ? defaultWeight.weightType : null,
      excellent: '',
      veryGood: '',
      good: '',
      fair: '',
      poor: '',
      isEditing: true,
      isSaved: false,
      hasChanges: false,
      originalValues: null,
      entryNumber: existingEntries.length + 1
    };

    // Insert new row directly after the last existing entry for the objective
    setRows(prev => {
      const idx = prev.map(r => r.objectCode).lastIndexOf(objectCode);
      if (idx === -1) {
        return [...prev, newRow];
      }
      return [...prev.slice(0, idx + 1), newRow, ...prev.slice(idx + 1)];
    });

    // If we have a default action, fetch its success indicators to populate options
    if (defaultActionCode) {
      fetchSuccessIndicators(objectCode, defaultActionCode);
    }

    // Ensure weight info is loaded for this objective
    if (!defaultWeight) {
      fetchWeightAndUpdateRow(objectCode);
    }

    console.log(`New entry #${newRow.entryNumber} added for ${objectCode}`);
  };

  // Get count of entries for an objective
  const getEntriesCount = (objectCode) => {
    return rows.filter(r => r.objectCode === objectCode).length;
  };

  // Check if objective allows adding more entries
  const canAddMoreEntries = (objectCode) => {
    const objective = objectives.find(o => o.objectivecode === objectCode);
    return objective && objective.multipleentries === 'Yes';
  };

  // Render input field based on selected weight type
  const renderWeightInput = (row, field) => {
    const value = row[field];
    const weightType = row.selectedWeightType || 'NUMBER';  // Use selectedWeightType, not weightInfo

    // Field labels for placeholders
    const fieldLabels = {
      excellent: 'Excellent',
      veryGood: 'Very Good',
      good: 'Good',
      fair: 'Fair',
      poor: 'Poor'
    };

    // For DATE type: date picker only, no manual text entry
    if (weightType === 'DATE') {
      return (
        <div>
          {row.isEditing ? (
            <input 
              type="date" 
              className="form-control form-control-sm" 
              value={value} 
              onChange={(e) => handleFieldChange(row.id, field, e.target.value)}
              placeholder={fieldLabels[field] || 'Select date'}
              style={{cursor: 'pointer', color: value ? '#000' : '#999', fontSize: '0.7rem', padding: '0.2rem'}}
            />
          ) : (
            <small className="text-muted">{value || '-'}</small>
          )}
        </div>
      );
    } else if (weightType === 'PERCENTAGE') {
      return (
        <input 
          type="number" 
          min="0" 
          max="100" 
          className="form-control form-control-sm" 
          placeholder={fieldLabels[field] || '0-100%'}
          value={value} 
          onChange={(e) => handleFieldChange(row.id, field, e.target.value)}
          disabled={!row.isEditing}
        />
      );
    } else {
      return (
        <input 
          type="number" 
          className="form-control form-control-sm" 
          placeholder={fieldLabels[field] || 'Enter value'}
          value={value} 
          onChange={(e) => handleFieldChange(row.id, field, e.target.value)}
          disabled={!row.isEditing}
        />
      );
    }
  };

  // Calculate total weight from saved rows only
  const calculateTotalWeightForObjective = (objectCode) => {
    const savedRows = rows.filter(r => r.objectCode === objectCode && r.isSaved);
    const totalWeight = savedRows.reduce((sum, row) => {
      // Try weightperunitofactivity first, then weightValue.value, default to 0
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

  // Check if an objective is single-entry (multipleentries = 'No')
  const isSingleEntryObjective = (objectCode) => {
    const objective = objectives.find(obj => obj.objectivecode === objectCode);
    return objective && objective.multipleentries === 'No';
  };

  // Validate performance levels - only if 2 or more values are entered
  const validatePerformanceLevels = (row) => {
    const performanceLevels = [
      { name: 'Excellent', value: row.excellent, key: 'excellent' },
      { name: 'Very Good', value: row.veryGood, key: 'veryGood' },
      { name: 'Good', value: row.good, key: 'good' },
      { name: 'Fair', value: row.fair, key: 'fair' },
      { name: 'Poor', value: row.poor, key: 'poor' }
    ];

    // Count how many fields have values
    const enteredLevels = performanceLevels.filter(level => level.value !== null && level.value !== '');

    // Only validate if 2 or more values are entered
    if (enteredLevels.length < 2) {
      return { isValid: true };
    }

    const weightType = row.selectedWeightType || 'NUMBER';

    // For DATE type: dates should be in ascending order (Excellent < Very Good < Good < Fair < Poor)
    // Meaning Excellent date is earliest, Poor date is latest
    if (weightType === 'DATE') {
      for (let i = 0; i < performanceLevels.length - 1; i++) {
        const current = performanceLevels[i];
        const next = performanceLevels[i + 1];

        // Skip if current is empty
        if (!current.value) continue;

        // If next has value, compare - current date MUST be LESS THAN next date
        if (next.value) {
          if (new Date(current.value) >= new Date(next.value)) {
            return { 
              isValid: false,
              field: next.key,
              message: `📅 ${next.name} must be a LATER date than ${current.name}` 
            };
          }
        }
      }
    } else {
      // For NUMBER and PERCENTAGE: values should be in descending order (Excellent > Very Good > Good > Fair > Poor)
      for (let i = 0; i < performanceLevels.length - 1; i++) {
        const current = performanceLevels[i];
        const next = performanceLevels[i + 1];

        // Skip if current is empty
        if (!current.value && current.value !== 0) continue;

        // If next has value, compare
        if (next.value || next.value === 0) {
          const currentNum = parseFloat(current.value);
          const nextNum = parseFloat(next.value);

          if (currentNum <= nextNum) {
            return { 
              isValid: false,
              field: next.key,
              message: `📊 ${next.name} (${nextNum}) must be LOWER than ${current.name} (${currentNum})` 
            };
          }
        }
      }
    }

    return { isValid: true };
  };

  // Get the last saved row for an objective to check if we can add entry
  const getLastRowForObjective = (objectCode) => {
    const objRows = rows.filter(r => r.objectCode === objectCode);
    return objRows.length > 0 ? objRows[objRows.length - 1] : null;
  };

  return (
    <div className="container-fluid">
      {/* ===== HEADER ===== */}
      <div className="row mb-4">
        <div className="col">
          <h2 className="fw-bold">🎯 Operational Data Entry - TARGET SETTING</h2>
          <p className="text-muted">Configure target settings for objectives with backend API integration</p>
        </div>
      </div>

      {/* ===== ERROR & LOADING MESSAGES ===== */}
      {error && <div className="alert alert-danger alert-dismissible fade show"><strong>Error:</strong> {error}</div>}
      {loading && <div className="alert alert-info"><div className="spinner-border spinner-border-sm me-2"></div>Loading data...</div>}

      {/* ===== OPERATION & FINANCIAL YEAR SELECTION ===== */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">📋 Operation & Period Selection</h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Select Operation *</label>
              <div className="btn-group w-100" role="group">
                <input type="radio" className="btn-check" name="operation" id="targetSetting" value="TARGET_SETTING" checked={operation === 'TARGET_SETTING'} onChange={(e) => setOperation(e.target.value)} />
                <label className="btn btn-outline-primary fw-semibold" htmlFor="targetSetting">
                  🎯 Target Setting
                </label>
                
                <input type="radio" className="btn-check" name="operation" id="targetAchieved" value="TARGET_ACHIEVED" onChange={(e) => setOperation(e.target.value)} disabled />
                <label className="btn btn-outline-secondary fw-semibold disabled" htmlFor="targetAchieved">
                  ✅ Target Achieved (Next Phase)
                </label>
              </div>
              <small className="text-muted d-block mt-1">Currently showing TARGET SETTING mode (Current FY only)</small>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Financial Year *</label>
              <select className="form-select form-select-lg" value={selectedFY} onChange={(e) => setSelectedFY(e.target.value)}>
                {operation === 'TARGET_SETTING' && 
                  financialYears.slice(0, 1).map(fy => (
                    <option key={fy.id} value={fy.id}>
                      {fy.name} (Current Year)
                    </option>
                  ))
                }
              </select>
              <small className="text-muted d-block mt-1">Only current year available for Target Setting</small>
            </div>
          </div>
        </div>
      </div>

      {/* ===== DATA ENTRY TABLE ===== */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-success text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">📊 Target Settings by Objective ({rows.length} entries)</h5>
            <small className="text-white-50">All objectives auto-loaded - Multiple entries where allowed</small>
          </div>
        </div>

      

        <div className="card-body">
          {rows.length === 0 ? (
            <div className="alert alert-info text-center py-4">
              <h6>Loading objectives from API...</h6>
              <p className="mb-0">All objectives will appear as rows once loaded</p>
            </div>
          ) : (
            <div>
              {/* Add Entry buttons are now integrated into each row's action buttons */}

              <div className="table-responsive" style={{overflowX: 'auto', overflowY: 'visible'}}>
                <table className="table table-bordered table-hover table-sm" style={{width: '100%'}}>
                  <thead className="table-light">
                    <tr style={{backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6'}}>
                      <th width="20%" style={{textAlign: 'center', fontSize: '0.8rem', fontWeight: '600', padding: '0.4rem'}}>Action Code</th>
                      <th width="13%" style={{textAlign: 'center', fontSize: '0.8rem', fontWeight: '600', padding: '0.4rem'}}>Success Indicator</th>
                      <th width="2%" style={{textAlign: 'center', fontSize: '0.8rem', fontWeight: '600', padding: '0.4rem'}}>Weight Type</th>
                      <th width="2%" style={{textAlign: 'center', fontSize: '0.8rem', fontWeight: '600', padding: '0.4rem'}}>Weight</th>
                      <th width="8%" style={{textAlign: 'center', fontSize: '0.75rem', fontWeight: '600', padding: '0.3rem', backgroundColor: '#cfe9ff', color: '#0066cc'}}>📊 Excellent</th>
                      <th width="8%" style={{textAlign: 'center', fontSize: '0.75rem', fontWeight: '600', padding: '0.3rem', backgroundColor: '#cfe9ff', color: '#0066cc'}}>📈 Very Good</th>
                      <th width="8%" style={{textAlign: 'center', fontSize: '0.75rem', fontWeight: '600', padding: '0.3rem', backgroundColor: '#cfe9ff', color: '#0066cc'}}>✓ Good</th>
                      <th width="8%" style={{textAlign: 'center', fontSize: '0.75rem', fontWeight: '600', padding: '0.3rem', backgroundColor: '#cfe9ff', color: '#0066cc'}}>↓ Fair</th>
                      <th width="8%" style={{textAlign: 'center', fontSize: '0.75rem', fontWeight: '600', padding: '0.3rem', backgroundColor: '#cfe9ff', color: '#0066cc'}}>✗ Poor</th>
                      <th width="12%" style={{textAlign: 'center', fontSize: '0.8rem', fontWeight: '600', padding: '0.4rem', backgroundColor: '#f0f8ff'}}>ACTIONS</th>
                    </tr>
                  </thead>

                  <tbody>
                    {objectives.map(obj => {
                      const objEntries = rows.filter(r => r.objectCode === obj.objectivecode);
                      const defaultWeight = weights[obj.objectivecode];
                      const allowsMultiple = obj.multipleentries === 'Yes';

                      return (
                        <React.Fragment key={`group_${obj.objectivecode}`}>
                          {/* Objective header row - COLLAPSIBLE */}
                          <tr 
                            className="table-info" 
                            style={{backgroundColor: '#e7f3ff', cursor: 'pointer', height: '60px'}}
                            onClick={() => setExpandedObjectives(prev => ({...prev, [obj.objectivecode]: !prev[obj.objectivecode]}))}
                          >
                            <td colSpan={10} style={{padding: '1rem 0.5rem'}}>
                              <div className="d-flex justify-content-between align-items-center py-2 px-3">
                                <div style={{display: 'flex', alignItems: 'center', flex: 1}}>
                                  <button 
                                    className="btn btn-sm btn-link p-0 me-2" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setExpandedObjectives(prev => ({...prev, [obj.objectivecode]: !prev[obj.objectivecode]}));
                                    }}
                                    style={{color: '#0066cc', textDecoration: 'none', minWidth: '20px'}}
                                    title={expandedObjectives[obj.objectivecode] ? 'Collapse' : 'Expand'}
                                  >
                                    {expandedObjectives[obj.objectivecode] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                  </button>
                                  <div>
                                    <h6 className="mb-1" style={{color: '#0066cc', margin: 0}}>
                                      <strong>{obj.objectivecode}</strong> — <strong style={{fontWeight: '600'}}>{obj.objectivedescription}</strong>
                                    </h6>
                                    <div>
                                      {obj.mandatory === 'Yes' && <span className="badge bg-danger">MANDATORY</span>}
                                    
                                    </div>
                                  </div>
                                </div>
                                <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                                  {calculateTotalWeightForObjective(obj.objectivecode) && (
                                    <span className="badge bg-success" style={{fontSize: '0.85rem', padding: '0.5rem 0.75rem'}}>
                                      📊 Total Weight: {calculateTotalWeightForObjective(obj.objectivecode)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>

                          {/* Entry rows - only show if expanded */}
                          {expandedObjectives[obj.objectivecode] && objEntries.map(row => (
                            <React.Fragment key={row.id}>
                              {/* SINGLE ROW: ALL DATA + PERFORMANCE + ACTIONS (11 columns) */}
                              <tr className={row.isSaved ? 'bg-success bg-opacity-15' : 'bg-light'} style={{borderLeft: row.isSaved ? '5px solid #28a745' : '4px solid #007bff', height: '40px', borderRadius: row.isSaved ? '4px 0 0 4px' : '0', fontWeight: row.isSaved ? '500' : 'normal'}}>
                                {/* ACTION CODE */}
                                <td colSpan="1" style={{verticalAlign: 'middle', padding: '0.2rem', backgroundColor: '#f8f9fa', borderTop: tooltipError?.rowId === row.id && tooltipError?.field === 'actionCode' ? '3px solid #dc3545' : 'none'}}>
                                  <div style={{position: 'relative'}}>
                                    {row.multipleEntries ? (
                                      <CreatableSelect
                                        isClearable
                                        isSearchable
                                        options={(actions[row.objectCode] || [])
                                          .filter(a => !a.actioncode.includes('XX'))
                                          .map(action => ({
                                            value: action.actioncode,
                                            label: action.actiondescription
                                          }))}
                                        value={row.actionCode && row.actionCode.trim() !== '' ? {
                                          value: row.actionCode,
                                          label: row.actionName || row.actionCode
                                        } : null}
                                        onChange={(option) => {
                                          if (option) {
                                            const actualActions = (actions[row.objectCode] || []).filter(a => !a.actioncode.includes('XX'));
                                            setRows(rows.map(r =>
                                              r.id === row.id
                                                ? { 
                                                    ...r, 
                                                    actionCode: option.value, 
                                                    actionName: option.label || '', 
                                                    successIndicatorCode: '',
                                                    siName: '',
                                                    siDescription: ''
                                                  }
                                                : r
                                            ));
                                            // Clear tooltip error when user selects action code
                                            if (tooltipError?.rowId === row.id && (tooltipError?.field === 'actionCode' || tooltipError?.field === 'successIndicatorCode')) {
                                              setTooltipError(null);
                                            }
                                            fetchSuccessIndicators(row.objectCode, option.value);
                                          } else {
                                            setRows(rows.map(r =>
                                              r.id === row.id
                                                ? { 
                                                    ...r, 
                                                    actionCode: '', 
                                                    actionName: '', 
                                                    successIndicatorCode: '',
                                                    siName: '',
                                                    siDescription: ''
                                                  }
                                                : r
                                            ));
                                          }
                                        }}
                                        onCreateOption={(inputValue) => {
                                          if (window.confirm(`Are you sure you want to add this action?\n\n"${inputValue}"`)) {
                                            saveInlineAction(row.id, row.objectCode, inputValue);
                                          }
                                        }}
                                        placeholder="Select or create..."
                                        classNamePrefix="react-select"
                                        styles={{
                                          control: (base) => ({
                                            ...base,
                                            fontSize: '0.75rem',
                                            minHeight: '26px',
                                            height: '26px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                          }),
                                          placeholder: (base) => ({
                                            ...base,
                                            textAlign: 'center',
                                            margin: '0 auto',
                                            position: 'absolute',
                                            left: '50%',
                                            transform: 'translateX(-50%)'
                                          }),
                                          input: (base) => ({
                                            ...base,
                                            textAlign: 'center',
                                            width: '100%'
                                          }),
                                          indicatorSeparator: (base) => ({
                                            ...base,
                                            display: 'none'
                                          }),
                                          dropdownIndicator: (base) => ({
                                            ...base,
                                            color: '#666',
                                            padding: '4px 8px',
                                            display: 'flex',
                                            alignItems: 'center'
                                          })
                                        }}
                                      />
                                    ) : (
                                      <small>{row.actionName || row.actionCode || '-'}</small>
                                    )}
                                    {tooltipError?.rowId === row.id && tooltipError?.field === 'actionCode' && (
                                      <div style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        marginTop: '4px',
                                        backgroundColor: '#dc3545',
                                        color: 'white',
                                        padding: '6px 12px',
                                        borderRadius: '4px',
                                        fontSize: '0.75rem',
                                        zIndex: 1000,
                                        whiteSpace: 'nowrap',
                                        pointerEvents: 'auto'
                                      }}>
                                        {tooltipError.message}
                                        <div style={{
                                          position: 'absolute',
                                          bottom: '100%',
                                          left: '50%',
                                          transform: 'translateX(-50%)',
                                          width: '0',
                                          height: '0',
                                          borderLeft: '6px solid transparent',
                                          borderRight: '6px solid transparent',
                                          borderBottom: '6px solid #dc3545'
                                        }}></div>
                                      </div>
                                    )}
                                  </div>
                                </td>

                                {/* SUCCESS INDICATOR */}
                                <td colSpan="1" style={{verticalAlign: 'middle', padding: '0.3rem', width: '20%', backgroundColor: '#f8f9fa', borderTop: tooltipError?.rowId === row.id && tooltipError?.field === 'successIndicatorCode' ? '3px solid #dc3545' : 'none'}}>
                                  <div style={{position: 'relative'}}>
                                    {row.isEditing && row.multipleEntries ? (
                                      <select 
                                        className="form-select form-select-sm"
                                        value={row.successIndicatorCode || ''}
                                        onChange={(e) => {
                                          const siCode = e.target.value;
                                          handleSIChange(row.id, row.objectCode, row.actionCode, siCode);
                                        }}
                                        disabled={!row.actionCode}
                                        style={{fontSize: '0.8rem', padding: '0.2rem'}}
                                      >
                                        <option value="">Select...</option>
                                        {successIndicators[`${row.objectCode}_${row.actionCode}`]?.map(si => (
                                          <option key={si.successindicatorcode} value={si.successindicatorcode}>
                                            {si.successindicatordescription}
                                          </option>
                                        )) || []}
                                      </select>
                                    ) : (
                                      <div>
                                        {row.siName ? (
                                          <small>{row.siName}</small>
                                        ) : (
                                          <span className="text-muted">-</span>
                                        )}
                                      </div>
                                    )}
                                    {tooltipError?.rowId === row.id && tooltipError?.field === 'successIndicatorCode' && (
                                      <div style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        marginTop: '4px',
                                        backgroundColor: '#dc3545',
                                        color: 'white',
                                        padding: '6px 12px',
                                        borderRadius: '4px',
                                        fontSize: '0.75rem',
                                        zIndex: 1000,
                                        whiteSpace: 'nowrap',
                                        pointerEvents: 'auto'
                                      }}>
                                        {tooltipError.message}
                                        <div style={{
                                          position: 'absolute',
                                          bottom: '100%',
                                          left: '50%',
                                          transform: 'translateX(-50%)',
                                          width: '0',
                                          height: '0',
                                          borderLeft: '6px solid transparent',
                                          borderRight: '6px solid transparent',
                                          borderBottom: '6px solid #dc3545'
                                        }}></div>
                                      </div>
                                    )}
                                  </div>
                                </td>

                                {/* WEIGHT TYPE */}
                                <td colSpan="1" style={{verticalAlign: 'middle', padding: '0.3rem', width: '8%', backgroundColor: '#f8f9fa'}}>
                                  {row.isEditing ? (
                                    <select 
                                      className="form-select form-select-sm"
                                      value={row.selectedWeightType || ''}
                                      onChange={(e) => handleWeightTypeChange(row.id, e.target.value)}
                                      disabled={row.unitPreferred === 'Fixed' || row.multipleEntries}
                                      style={{fontSize: '0.8rem', padding: '0.2rem'}}
                                    >
                                      <option value="">Select...</option>
                                      <option value="DATE">📅 Date</option>
                                      <option value="PERCENTAGE">📊 PERCENTAGE</option>
                                      <option value="NUMBER">🔢 NUMBER</option>
                                    </select>
                                  ) : (
                                    <small>
                                      {row.selectedWeightType === 'DATE' ? '📅 Date' : 
                                       row.selectedWeightType === 'PERCENTAGE' ? '📊 PERCENTAGE' : 
                                       row.selectedWeightType === 'NUMBER' ? '🔢 NUMBER' : 
                                       '-'} {row.unitPreferred === 'Fixed'}
                                    </small>
                                  )}
                                </td>

                                {/* WEIGHT VALUE */}
                                <td colSpan="1" className="text-center" style={{verticalAlign: 'middle', padding: '0.3rem', backgroundColor: '#f8f9fa'}}>
                                  <small className="text-muted">
                                    {row.weightValue ? (
                                      <>
                                        <strong>{row.weightValue.value || row.weightValue}</strong>
                                        {row.weightValue.unit && <span> {row.weightValue.unit}</span>}
                                      </>
                                    ) : (
                                      <span>-</span>
                                    )}
                                  </small>
                                </td>

                                {/* EXCELLENT INPUT */}
                                <td colSpan="1" style={{fontSize: '0.75rem', padding: '0.2rem', verticalAlign: 'middle', backgroundColor: '#e7f3ff', borderTop: tooltipError?.rowId === row.id && tooltipError?.field === 'excellent' ? '3px solid #dc3545' : 'none'}}>
                                  <div>
                                    {renderWeightInput(row, 'excellent')}
                                    {tooltipError?.rowId === row.id && tooltipError?.field === 'excellent' && (
                                      <small className="text-danger d-block mt-1" style={{fontSize: '0.65rem', fontWeight: 'bold'}}>
                                        ⚠️ {tooltipError.message}
                                      </small>
                                    )}
                                  </div>
                                </td>

                                {/* VERY GOOD INPUT */}
                                <td colSpan="1" style={{fontSize: '0.75rem', padding: '0.2rem', verticalAlign: 'middle', backgroundColor: '#e7f3ff', borderTop: tooltipError?.rowId === row.id && tooltipError?.field === 'veryGood' ? '3px solid #dc3545' : 'none'}}>
                                  <div>
                                    {renderWeightInput(row, 'veryGood')}
                                    {tooltipError?.rowId === row.id && tooltipError?.field === 'veryGood' && (
                                      <small className="text-danger d-block mt-1" style={{fontSize: '0.65rem', fontWeight: 'bold'}}>
                                        ⚠️ {tooltipError.message}
                                      </small>
                                    )}
                                  </div>
                                </td>

                                {/* GOOD INPUT */}
                                <td colSpan="1" style={{fontSize: '0.75rem', padding: '0.2rem', verticalAlign: 'middle', backgroundColor: '#e7f3ff', borderTop: tooltipError?.rowId === row.id && tooltipError?.field === 'good' ? '3px solid #dc3545' : 'none'}}>
                                  <div>
                                    {renderWeightInput(row, 'good')}
                                    {tooltipError?.rowId === row.id && tooltipError?.field === 'good' && (
                                      <small className="text-danger d-block mt-1" style={{fontSize: '0.65rem', fontWeight: 'bold'}}>
                                        ⚠️ {tooltipError.message}
                                      </small>
                                    )}
                                  </div>
                                </td>

                                {/* FAIR INPUT */}
                                <td colSpan="1" style={{fontSize: '0.75rem', padding: '0.2rem', verticalAlign: 'middle', backgroundColor: '#e7f3ff', borderTop: tooltipError?.rowId === row.id && tooltipError?.field === 'fair' ? '3px solid #dc3545' : 'none'}}>
                                  <div>
                                    {renderWeightInput(row, 'fair')}
                                    {tooltipError?.rowId === row.id && tooltipError?.field === 'fair' && (
                                      <small className="text-danger d-block mt-1" style={{fontSize: '0.65rem', fontWeight: 'bold'}}>
                                        ⚠️ {tooltipError.message}
                                      </small>
                                    )}
                                  </div>
                                </td>

                                {/* POOR INPUT */}
                                <td colSpan="1" style={{fontSize: '0.75rem', padding: '0.2rem', verticalAlign: 'middle', backgroundColor: '#e7f3ff', borderTop: tooltipError?.rowId === row.id && tooltipError?.field === 'poor' ? '3px solid #dc3545' : 'none'}}>
                                  <div>
                                    {renderWeightInput(row, 'poor')}
                                    {tooltipError?.rowId === row.id && tooltipError?.field === 'poor' && (
                                      <small className="text-danger d-block mt-1" style={{fontSize: '0.65rem', fontWeight: 'bold'}}>
                                        ⚠️ {tooltipError.message}
                                      </small>
                                    )}
                                  </div>
                                </td>

                                {/* SINGLE ACTIONS COLUMN: ALL 4 BUTTONS (SAVE, ADD, EDIT, DELETE) */}
                                <td colSpan="1" style={{verticalAlign: 'middle', padding: '0.2rem', backgroundColor: '#f0f8ff', minWidth: '120px'}}>
                                  <div style={{display: 'flex', gap: '0.25rem', justifyContent: 'center', alignItems: 'center', flexWrap: 'nowrap', width: '100%'}}>
                                    {/* SAVE BUTTON */}
                                    <button 
                                      className="btn btn-sm btn-success"
                                      onClick={() => saveRow(row)}
                                      disabled={!row.isEditing || loading}
                                      title="Save"
                                      style={{fontSize: '0.7rem', padding: '0.2rem 0.3rem', minWidth: '24px', flex: '0 0 auto'}}
                                    >
                                      {loading ? (
                                        <Loader size={10} className="spinner-border spinner-border-sm" />
                                      ) : (
                                        <CheckCircle size={11} />
                                      )}
                                    </button>
                                    
                                    {/* ADD ENTRY BUTTON */}
                                    {row.multipleEntries && getLastRowForObjective(row.objectCode)?.id === row.id && (
                                      <>
                                        <button 
                                          className="btn btn-sm btn-outline-info"
                                          onClick={() => addNewEntryForObjective(row.objectCode)}
                                          disabled={loading}
                                          title="Add row"
                                          style={{fontSize: '0.7rem', padding: '0.2rem 0.3rem', minWidth: '24px', flex: '0 0 auto'}}
                                        >
                                          <Plus size={11} />
                                        </button>
                                      </>
                                    )}
                                    
                                    {/* EDIT BUTTON */}
                                    <button 
                                      className={`btn btn-sm btn-outline-${row.isSaved && !row.isEditing ? 'primary' : 'secondary'}`}
                                      onClick={() => requestEditRow(row.id)}
                                      disabled={!row.isSaved || row.isEditing || loading}
                                      title="Edit"
                                      style={{fontSize: '0.7rem', padding: '0.2rem 0.3rem', minWidth: '24px', flex: '0 0 auto'}}
                                    >
                                      <Edit size={11} />
                                    </button>
                                    
                                    {/* DELETE BUTTON - Only for Multi-Entry Objectives */}
                                    {row.multipleEntries && (
                                      <>
                                        <button 
                                          className="btn btn-sm btn-outline-danger"
                                          onClick={() => requestDeleteRow(row.id)}
                                          disabled={!row.isSaved || row.hasChanges || loading}
                                          title="Delete"
                                          style={{fontSize: '0.7rem', padding: '0.2rem 0.3rem', minWidth: '24px', flex: '0 0 auto'}}
                                        >
                                          <Trash2 size={11} />
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </td>
                              </tr>

                              {/* ROW 2 DELETED: All content merged into single row */}
                            </React.Fragment>
                          ))}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
      {showActionModal && (
        <div className="modal d-block" style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Create New Action for Objective {newActionObjective}</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => {
                    setShowActionModal(false);
                    setNewActionForm({ actiondescription: '', actionname: '' });
                  }}
                />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-bold">Action Description *</label>
                  <textarea 
                    className="form-control"
                    placeholder="e.g., Conduct quarterly training session"
                    rows="3"
                    value={newActionForm.actiondescription}
                    onChange={(e) => setNewActionForm({...newActionForm, actiondescription: e.target.value})}
                  />
                  <small className="text-muted">Detailed description (required)</small>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Action Name (Optional)</label>
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="Short name for display"
                    value={newActionForm.actionname}
                    onChange={(e) => setNewActionForm({...newActionForm, actionname: e.target.value})}
                  />
                  <small className="text-muted">If left blank, description will be used</small>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowActionModal(false);
                    setNewActionForm({ actiondescription: '', actionname: '' });
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== INSTRUCTIONS ===== */}
      <div className="alert alert-info border-start border-4 border-info">
        <h6 className="fw-bold mb-2">📌 How to Use:</h6>
        <ol className="mb-0">
          <li>All <strong>objectives auto-load</strong> from the API as rows</li>
          <li>For objectives that allow <strong>Multiple Entries</strong> (like 001A, 002A, 003A), use the <strong>"Add Entry"</strong> buttons above the table to add more entries</li>
          <li>For objectives with <strong>predefinedactions = "Yes"</strong>, select from dropdown. For <strong>"No"</strong>, enter description inline</li>
          <li>System auto-generates action codes like "001AA000001" for non-predefined actions</li>
          <li>Select <strong>Success Indicator</strong> → Weight type (Date/Number/%) loads from API</li>
          <li>Performance levels <strong>(Excellent, Very Good, Good, Fair, Poor)</strong> are <strong>OPTIONAL</strong> - you can leave them empty or fill any combination</li>
          <li>If you enter values, they must follow the correct order: For DATE type, earlier dates for higher performance. For NUMBER/PERCENTAGE, higher values for higher performance</li>
          <li>Input type automatically adjusts based on weight type (date picker, text, percentage)</li>
          <li>Click <strong>"Save"</strong> to save row to backend and freeze it</li>
          <li>Click <strong>"Edit"</strong> to modify a saved row</li>
          <li>Click <strong>"Delete"</strong> to remove a row</li>
        </ol>
      </div>

      {/* ===== API REFERENCE ===== */}
      <div className="alert alert-secondary border-start border-4 border-secondary">
        <h6 className="fw-bold mb-2">🔗 API Endpoints Being Used:</h6>
        <ul className="mb-0 font-monospace">
          <li><code>GET http://localhost:8080/api/objectives</code> - Fetch all objectives</li>
          <li><code>GET http://localhost:8080/api/actions/objective/{'{objectcode}'}</code> - Fetch actions by objective</li>
          <li><code>GET http://localhost:8080/api/successindicator/success/{'{objectcode}'}</code> - Fetch success indicators</li>
          <li><code>GET http://localhost:8080/api/objectives/getWeights/{'{objectcode}'}</code> - Fetch weight type</li>
          <li><code>POST http://localhost:8080/api/actions</code> - Save user-entered actions with auto-generated codes</li>
          <li><code>POST http://localhost:8080/api/target-setting</code> - Save target setting row</li>
        </ul>
      </div>

      {/* ===== CONFIRMATION MODAL - DELETE ONLY ===== */}


    </div>
  );
};

export default OperationsTargetSettingPage;
