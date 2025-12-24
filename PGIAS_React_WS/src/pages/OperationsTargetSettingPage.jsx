// OPERATIONAL DATA ENTRY - TARGET SETTING PAGE (Backend Integrated)
// This is a new, completely redesigned page with table-based entry

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, CheckCircle, ChevronDown, ChevronRight, X, Search, Loader, AlertCircle } from 'lucide-react';
import CreatableSelect from 'react-select/creatable';

// Add pulse animation for highlighted buttons
const pulseStyle = `
  @keyframes pulse {
    0% {
      box-shadow: 0 0 8px rgba(40, 167, 69, 0.6);
    }
    50% {
      box-shadow: 0 0 16px rgba(40, 167, 69, 0.8);
    }
    100% {
      box-shadow: 0 0 8px rgba(40, 167, 69, 0.6);
    }
  }
`;

// Inject styles into document head
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = pulseStyle;
  document.head.appendChild(style);
}

const OperationsTargetSettingPage = () => {
  // State Management
  const [operation, setOperation] = useState('TARGET_SETTING');
  const [selectedFY, setSelectedFY] = useState('2026-2027');
  const [centrecode, setCentrecode] = useState(''); // Will be populated from user roles/permissions
  const [userRoles, setUserRoles] = useState([]); // Roles assigned to user
  const [userid, setUserid] = useState('USER001'); // Default user ID (can be fetched from session/context)
  const [assignedCentre, setAssignedCentre] = useState(null);
  const [centres, setCentres] = useState([]);
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

  // Get dynamic financial year based on operation type
  // TARGET_SETTING: Next financial year (2026-2027)
  // TARGET_ACHIEVED: Current year (2025-2026)
  const getDynamicFY = (op) => {
    if (op === 'TARGET_SETTING') {
      return '2026-2027'; // Next financial year for target setting
    } else {
      return '2025-2026'; // Current year for achievement
    }
  };

  // Update selectedFY whenever operation changes
  useEffect(() => {
    setSelectedFY(getDynamicFY(operation));
  }, [operation]);

  // Fetch Objectives and user roles on component mount
  useEffect(() => {
    fetchObjectives();
    initializeUserFromLocalStorage();
    // Initialize Bootstrap tooltips
    if (window.$ && window.$.fn.tooltip) {
      window.$('[data-toggle="tooltip"]').tooltip({
        trigger: 'hover',
        placement: 'bottom',
        delay: { show: 500, hide: 100 }
      });
    }
  }, []);

  // Initialize user data from localStorage (set by App.jsx on login)
  const initializeUserFromLocalStorage = () => {
    try {
      // Read loginId and centreCode set by App.jsx during authentication
      const loginId = localStorage.getItem('loginId');
      const centreCodeFromStorage = localStorage.getItem('centreCode');

      // Set userid to loginId
      setUserid(loginId);
      setAssignedCentre(centreCodeFromStorage);

      // Normalize centre assignment: if 'All' or 'ALL', allow selection; otherwise pre-fill
      if (String(centreCodeFromStorage).toUpperCase() === 'ALL') {
        setCentrecode(''); // Allow user to select
      } else {
        setCentrecode(centreCodeFromStorage);
      }

      console.log('👤 Initialized from localStorage - User:', loginId, '| Centre:', centreCodeFromStorage);
      
      // Fetch centres list for dropdown (in case user assigned to 'ALL')
      fetchCentres();
    } catch (err) {
      console.error('Failed to initialize user from localStorage:', err);
      setUserid('USER001');
      setCentrecode('01');
    }
  };

  // Fetch all centres from backend
  // API returns: { centrecode, centrelongname, centreshortname, ... }
  const fetchCentres = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/centres');
      if (!res.ok) throw new Error('Failed to fetch centres');
      const data = await res.json();
      console.log('✅ Fetched Centres:', data);
      // Centres array with fields: centrecode (lowercase), centreshortname, centrelongname
      setCentres(data || []);
    } catch (err) {
      console.error('Failed to load centres:', err);
      setCentres([]);
    }
  };

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

          // Only auto-select default action for SINGLE-ENTRY objectives (multipleEntries === 'No')
          if (!isMultiEntry) {
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

  // Fetch Success Indicators for ALL objectives when objectives load
  // This makes SI dropdown always available without depending on action code selection
  useEffect(() => {
    if (objectives.length > 0) {
      console.log('🔄 Fetching Success Indicators for all objectives...');
      objectives.forEach(obj => {
        fetchSuccessIndicators(obj.objectivecode);  // Fetch for objective only, no actionCode
      });
    }
  }, [objectives]);

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

  // Fetch Success Indicators from: http://localhost:8080/api/successindicator/success/{objectcode}
  // SUCCESS INDICATORS ARE NOW FETCHED DIRECTLY FOR EACH OBJECTIVE - NO LONGER DEPENDENT ON ACTION CODE
  const fetchSuccessIndicators = async (objectCode, actionCode = null) => {
    try {
      const response = await fetch(`http://localhost:8080/api/successindicator/success/${objectCode}`);
      if (!response.ok) throw new Error('Failed to fetch success indicators');
      const data = await response.json();
      console.log(`✅ Fetched Success Indicators for Objective ${objectCode}:`, data);
      
      // Store by objectCode only (universal for all actions in this objective)
      const key = objectCode;  // Changed from objectCode_actionCode to just objectCode
      setSuccessIndicators(prev => ({
        ...prev,
        [key]: data
      }));
      
      // Also store by objectCode_actionCode format for backward compatibility with existing logic
      if (actionCode) {
        setSuccessIndicators(prev => ({
          ...prev,
          [`${objectCode}_${actionCode}`]: data
        }));
      }
    } catch (err) {
      console.error('Failed to fetch success indicators:', err);
      const key = objectCode;
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

  // Fetch saved rows for selected centre and financial year
  // This loads any previously saved data for the current centre/FY combination
  const fetchSavedRowsForCentre = async (centre, fy) => {
    try {
      if (!centre) {
        console.log('❌ No centre provided, skipping fetch');
        return [];
      }
      
      console.log(`🔍 API Call: GET /api/targets?centrecode=${centre}&financialyear=${fy}`);
      const response = await fetch(`http://localhost:8080/api/targets?centrecode=${centre}&financialyear=${fy}`);
      
      if (!response.ok) {
        console.warn(`⚠️ API returned status ${response.status} for centre ${centre}`);
        return [];
      }
      
      const data = await response.json();
      console.log(`📦 API Response:`, data);
      console.log(`✅ Found ${Array.isArray(data) ? data.length : 0} saved rows for centre ${centre}`);
      
      // Map saved data to rows state
      if (!Array.isArray(data) || data.length === 0) {
        console.log(`ℹ️ No data returned - empty array or not array`);
        return [];
      }
      
      const savedRows = data.map((item, idx) => {
        // Determine weight type based on unit field
        let weightType = 'NUMBER'; // default
        if (item.unit === 'Date' || item.unit === 'DATE') {
          weightType = 'DATE';
        } else if (item.unit === 'Percentage' || item.unit === 'PERCENTAGE' || item.validforpercentage === 'Yes') {
          weightType = 'PERCENTAGE';
        }
        
        // Get objective metadata to determine if multipleEntries
        const objective = objectives.find(obj => obj.objectivecode === item.objectivecode);
        const isMultipleEntries = objective?.multipleentries === 'Yes';
        
        const mappedRow = {
          id: `saved_${item.objectivecode}_${item.actioncode}_${item.successindicatorcode}`,
          objectCode: item.objectivecode,
          objectDescription: item.objectivedescription || '',
          mandatory: objective?.mandatory || '',
          multipleEntries: isMultipleEntries,
          predefinedParameters: objective?.predefinedparameters === 'Yes' || false,
          predefinedReferenceValues: objective?.predefinedreferencevalues === 'Yes' || false,
          changeInTargetCriteria: objective?.changeintargetcriteria === 'Yes' || false,
          predefinedActions: objective?.predefinedactions === 'Yes' || false,
          weightPeriod: objective?.weightperinitofactivity || '',
          unit: item.unit || '',
          unitPreferred: 'Default',
          actionCode: item.actioncode,
          actionName: item.actiondescription || '',
          successIndicatorCode: item.successindicatorcode,
          siName: item.successindicatordescription || '',
          siDescription: item.successindicatordescription || '',
          weightInfo: null,
          selectedWeightType: weightType,  // Now correctly set based on unit
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
        
        console.log(`  📍 Row ${idx + 1}: ${mappedRow.objectCode} | Action: ${mappedRow.actionCode} | SI: ${mappedRow.successIndicatorCode} | MultipleEntries: ${mappedRow.multipleEntries} | Excellent: ${mappedRow.excellent}`);
        
        return mappedRow;
      });
      
      // Auto-expand objectives that have saved rows
      const objectsWithSavedRows = new Set(savedRows.map(r => r.objectCode));
      setExpandedObjectives(prev => {
        const updated = { ...prev };
        objectsWithSavedRows.forEach(objCode => {
          updated[objCode] = true;  // Expand objective
        });
        return updated;
      });
      
      return savedRows;
    } catch (err) {
      console.error(`❌ Error fetching saved rows for centre ${centre}:`, err);
      return [];
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

  // Save Row to Backend: POST http://localhost:8080/api/targets
  const saveRowToBackend = async (row) => {
    try {
      // Use selected financial year string as-is (format: 2026-2027)
      const fyYear = selectedFY;

      // Find centre short name from loaded centres
      const selectedCentreObj = centres.find(c => c.centrecode === centrecode) || null;

      // Build the complete payload matching the database table structure
      const payload = {
        financialyear: fyYear,
        centrecode: centrecode,
        centreshortname: selectedCentreObj ? selectedCentreObj.centreshortname : '',
        objectivecode: row.objectCode,
        objectivedescription: row.objectDescription || '',
        actioncode: row.actionCode,
        actiondescription: row.actionName || '',
        successindicatorcode: row.successIndicatorCode,
        successindicatordescription: row.siName || '',
        unit: row.unit || '',
        targetsetvalue: row.excellent || '', // Primary target is Excellent
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
        regstatus: 'A', // Active
        regtime: new Date().toISOString()
      };

      console.log('📝 Row payload to save:', payload);
      
      // Call the backend API to save
      const response = await fetch('http://localhost:8080/api/targets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        let errorMessage = 'Failed to save row';
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
      console.log('✅ Row saved successfully:', result);
      return "Row saved successfully";
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
    // Look up SI using just objectCode (SI data is now fetched independently of action code)
    const si = successIndicators[objectCode]?.find(s => s.successindicatorcode === siCode);
    
    // Check if this objective allows multiple entries
    const objective = objectives.find(obj => obj.objectivecode === objectCode);
    const isMultipleEntries = objective?.multipleentries === 'Yes';
    
    setRows(rows.map(row =>
      row.id === rowId
        ? { 
            ...row, 
            successIndicatorCode: siCode,  // Store CODE
            siName: si?.successindicatordescription || '',  // Display DESCRIPTION
            siDescription: si?.successindicatordescription || '',
            // For multiple entries: Load default values from SI; for single-entry: let user enter
            excellent: isMultipleEntries ? (si?.targetcriteriavalueexcellent || '') : '',
            veryGood: isMultipleEntries ? (si?.targetcriteriavalueverygood || '') : '',
            good: isMultipleEntries ? (si?.targetcriteriavaluegood || '') : '',
            fair: isMultipleEntries ? (si?.targetcriteriavaluefair || '') : '',
            poor: isMultipleEntries ? (si?.targetcriteriavaluepoor || '') : '',
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
    // Validate centre is selected
    if (!centrecode || centrecode.trim() === '') {
      setTooltipError({
        rowId: row.id,
        field: 'centrecode',
        message: '⚠️ Please select a centre before saving'
      });
      return;
    }
    
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

  // Delete Row from Backend: POST http://localhost:8080/api/targets/delete
  const deleteRowFromBackend = async (row) => {
    try {
      const fyYear = selectedFY.replace('FY', '').replace('-', '/'); // Convert FY2024-25 to 2024/25
      
      // Build the composite ID that matches the database primary key
      const id = {
        financialyear: fyYear,
        centrecode: centrecode,
        objectivecode: row.objectCode,
        actioncode: row.actionCode,
        successindicatorcode: row.successIndicatorCode
      };

      console.log('🗑️ Deleting row with ID:', id);
      
      const response = await fetch('http://localhost:8080/api/targets/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(id)
      });
      
      if (!response.ok) {
        let errorMessage = 'Failed to delete row';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          const errorText = await response.text();
          if (errorText) errorMessage = errorText;
        }
        throw new Error(errorMessage);
      }
      
      console.log('✅ Row deleted successfully');
      return "Row deleted successfully";
    } catch (err) {
      throw new Error('Error deleting row: ' + err.message);
    }
  };

  // Show confirmation dialog before deleting a row
  const requestDeleteRow = (rowId) => {
    const row = rows.find(r => r.id === rowId);
    if (!row) return;
    
    if (window.confirm('Are you sure you want to delete this entry?')) {
      setLoading(true);
      deleteRowFromBackend(row)
        .then(() => {
          setRows(rows.filter(r => r.id !== rowId));
          alert('✅ Row deleted successfully!');
        })
        .catch(err => {
          alert('❌ Error: ' + err.message);
        })
        .finally(() => {
          setLoading(false);
        });
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

  // Format date to dd/mm/yyyy
  const formatDateDDMMYYYY = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr + 'T00:00:00');
      if (isNaN(date.getTime())) return dateStr;  // Return original if invalid
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (e) {
      return dateStr;  // Return original on error
    }
  };

  // Render input field based on selected weight type
  const renderWeightInput = (row, field) => {
    const value = row[field];
    const weightType = row.selectedWeightType || 'NUMBER';  // Use selectedWeightType, not weightInfo
    const isDisabled = isCentreLocked();
    
    // Check if this is a single-entry objective (multipleentries = 'No')
    const isSingleEntry = !row.multipleEntries;  // multipleEntries = false means single-entry
    
    // AFTER SAVING: All fields are disabled (frozen) until Edit is clicked
    if (row.isSaved && !row.isEditing) {
      // For DATE type: show formatted date, otherwise show value as-is
      const displayValue = weightType === 'DATE' ? formatDateDDMMYYYY(value) : value;
      return (
        <small className="text-muted">
          {displayValue !== null && displayValue !== '' ? displayValue : '-'}
        </small>
      );
    }
    
    // Performance level fields logic:
    // NEW entries (not saved yet): ALWAYS ENABLED
    // SAVED entries: 
    //   - Single-entry: ALWAYS ENABLED (even when not editing)
    //   - Multi-entry: DISABLED until SI selected (unless editing, then check SI)
    let isPerformanceFieldDisabled = false;
    
    if (row.isSaved && !row.isEditing) {
      // Saved row, not in edit mode: DISABLED for all
      isPerformanceFieldDisabled = true;
    } else if (!row.isSaved) {
      // New/fresh entry: ALWAYS ENABLED
      isPerformanceFieldDisabled = false;
    } else if (row.isSaved && row.isEditing) {
      // Editing a saved row: Enable based on objective type
      isPerformanceFieldDisabled = isSingleEntry ? false : (!row.successIndicatorCode || isDisabled);
    } else {
      // Multi-entry, not saved yet, SI required
      isPerformanceFieldDisabled = isSingleEntry ? false : (!row.successIndicatorCode || isDisabled);
    }

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
        <input 
          type="date" 
          className="form-control form-control-sm" 
          value={value || ''} 
          onChange={(e) => handleFieldChange(row.id, field, e.target.value)}
          disabled={isPerformanceFieldDisabled}
          style={{fontSize: '0.7rem', padding: '0.2rem'}}
        />
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
          disabled={isPerformanceFieldDisabled}
          title={isPerformanceFieldDisabled ? (isSingleEntry ? '' : 'Select Success Indicator first to enable') : ''}
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
          disabled={isPerformanceFieldDisabled}
          title={isPerformanceFieldDisabled ? (isSingleEntry ? '' : 'Select Success Indicator first to enable') : ''}
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

  // Validate performance levels - ONLY Excellent is MANDATORY
  const validatePerformanceLevels = (row) => {
    // Check ONLY if Excellent is filled
    if (!row.excellent && row.excellent !== 0) {
      return {
        isValid: false,
        field: 'excellent',
        message: '📊 Excellent is MANDATORY'
      };
    }

    // Everything else is optional - SAVE
    return { isValid: true };
  };

  // Get the last saved row for an objective to check if we can add entry
  const getLastRowForObjective = (objectCode) => {
    const objRows = rows.filter(r => r.objectCode === objectCode);
    return objRows.length > 0 ? objRows[objRows.length - 1] : null;
  };

  // Check if centre is locked (selected and not empty)
  const isCentreLocked = () => {
    return centrecode && centrecode.trim() !== '';
  };

  // Check if an objective is restricted to HQ only
  const isObjectiveRestrictedToHQ = (mandatory) => {
    return mandatory === 'HQ';
  };

  // Check if current centre is HQ
  const isCurrentCentreHQ = () => {
    if (!centrecode) return false;
    return centrecode === '13' || 
      (centres.find(c => c.centrecode === centrecode)?.centreshortname === 'HQ');
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

      {/* ===== OPERATION & PERIOD SELECTION ===== */}
      <div className="row g-2 mb-4 align-items-end">
        <div className="col-md-5">
          <label className="form-label fw-semibold mb-2">📋 Select Operation *</label>
          <div className="btn-group w-100" role="group">
            <input type="radio" className="btn-check" name="operation" id="targetSetting" value="TARGET_SETTING" checked={operation === 'TARGET_SETTING'} onChange={(e) => setOperation(e.target.value)} />
            <label className="btn btn-outline-primary fw-semibold" htmlFor="targetSetting" style={{fontSize: '0.9rem', padding: '0.4rem 0.8rem'}}>
              🎯 Target Setting (2026-2027)
            </label>
            
            <input type="radio" className="btn-check" name="operation" id="targetAchieved" value="TARGET_ACHIEVED" onChange={(e) => setOperation(e.target.value)} disabled />
            <label className="btn btn-outline-secondary fw-semibold disabled" htmlFor="targetAchieved" style={{fontSize: '0.9rem', padding: '0.4rem 0.8rem'}}>
              ✅ Target Achieved (2025-2026)
            </label>
          </div>
        </div>

        <div className="col-md-3">
          <label className="form-label fw-semibold mb-2" style={{
            color: (!centrecode || centrecode.trim() === '') ? '#dc3545' : '#495057',
            fontWeight: 'bold'
          }}>
            💼 Centre {(!centrecode || centrecode.trim() === '') && <span style={{color: '#dc3545'}}>*REQUIRED</span>}
          </label>
          {String(assignedCentre).toUpperCase() === 'ALL' ? (
            <>
              <select
                className={`form-select form-select-sm ${(!centrecode || centrecode.trim() === '') ? 'is-invalid border-danger border-3' : ''}`}
                value={centrecode}
                onChange={(e) => {
                  const selectedCentre = e.target.value;
                  
                  // Validate centre selection
                  if (!selectedCentre || selectedCentre.trim() === '') {
                    setTooltipError({
                      rowId: null,
                      field: 'centrecode',
                      message: '⚠️ Please select a centre before proceeding'
                    });
                    return;
                  }
                  
                  // Clear tooltip error
                  setTooltipError(null);
                  
                  // Update centre
                  setCentrecode(selectedCentre);
                  
                  console.log(`📍 Centre changed to: ${selectedCentre}, Fetching saved data...`);
                  
                  // Fetch saved rows for selected centre and FY
                  fetchSavedRowsForCentre(selectedCentre, selectedFY).then(savedRows => {
                    console.log(`🔄 Setting rows with ${savedRows.length} saved rows`);
                    
                    setRows(prev => {
                      // Remove ALL previously saved rows from other centres
                      // Keep ONLY template rows (where isSaved === false)
                      const templateRows = prev.filter(r => !r.isSaved);
                      
                      // Combine: new saved rows + empty template
                      const newRows = [...savedRows, ...templateRows];
                      
                      console.log(`📋 Total rows after centre change: ${newRows.length} (${savedRows.length} saved + ${templateRows.length} template)`);
                      
                      return newRows;
                    });
                  });
                }}
                style={{
                  fontSize: '0.9rem',
                  borderWidth: (!centrecode || centrecode.trim() === '') ? '3px' : '1px',
                  backgroundColor: (!centrecode || centrecode.trim() === '') ? '#fff5f5' : '#fff'
                }}
              >
                <option value="">🔴 SELECT CENTRE FIRST...</option>
                {centres.map(c => (
                  <option key={c.centrecode} value={c.centrecode}>
                    {`${c.centreshortname} - ${c.centrelongname}`}
                  </option>
                ))}
              </select>
              {tooltipError?.field === 'centrecode' && (
                <div className="invalid-feedback d-block" style={{color: '#dc3545', fontSize: '0.85rem', marginTop: '0.25rem', fontWeight: 'bold'}}>
                  {tooltipError.message}
                </div>
              )}
              {(!centrecode || centrecode.trim() === '') && !tooltipError && (
                <small style={{color: '#dc3545', display: 'block', marginTop: '0.5rem', fontWeight: 'bold'}}>
                  👆 Select your centre to proceed
                </small>
              )}
            </>
          ) : (
            <div className="alert alert-success mb-0 py-2 px-3" style={{fontSize: '0.9rem', display: 'flex', alignItems: 'center', backgroundColor: '#d4edda', borderColor: '#28a745'}}>
              <strong>
                {centres.length > 0 
                  ? (() => {
                      const found = centres.find(c => c.centrecode === (centrecode || assignedCentre));
                      return found 
                        ? `✅ ${found.centreshortname} - ${found.centrelongname}`
                        : assignedCentre;
                    })()
                  : (centrecode || assignedCentre || 'Loading...')
                }
              </strong>
              {/*<small className="ms-2 text-muted">(Role-based)</small>*/}
            </div>
          )}
        </div>

        <div className="col-md-4">
          <label className="form-label fw-semibold mb-2">📅 Financial Year</label>
          <div className="alert alert-info mb-0 py-2 px-3" style={{fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <span>{operation === 'TARGET_SETTING' ? '🎯 2026-2027 (Next Year)' : '✅ 2025-2026 (Current Year)'}</span>
          </div>
        </div>
      </div>

      {/* ===== DATA ENTRY TABLE ===== */}
      <div className={`card border-0 shadow-sm mb-4 ${(!centrecode || centrecode.trim() === '') ? 'opacity-50' : ''}`} style={{pointerEvents: (!centrecode || centrecode.trim() === '') ? 'none' : 'auto'}}>
        <div className="card-header bg-success text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">📊 Target Settings by Objective ({rows.length} entries)</h5>
            <small className="text-white-50">All objectives auto-loaded - Multiple entries where allowed</small>
          </div>
        </div>

        <div className="card-body">
          {(!centrecode || centrecode.trim() === '') ? (
            <div className="alert alert-danger text-center py-5" style={{backgroundColor: '#f8d7da', borderColor: '#f5c6cb'}}>
              <h6 style={{fontSize: '1.2rem', fontWeight: 'bold', color: '#721c24'}}>🔴 Data Entry Disabled</h6>
              <p style={{color: '#721c24', marginBottom: '0'}}>
                <strong>Please select a Centre above to start entering target settings.</strong>
              </p>
            </div>
          ) : rows.length === 0 ? (
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
                    {objectives
                      .filter(obj => {
                        // Filter objectives based on HQ mandatory restriction
                        // If mandatory === 'HQ', only show for centre code 13 or centre short name HQ
                        if (obj.mandatory === 'HQ') {
                          const isHQCentre = centrecode === '13' || 
                            (centres.find(c => c.centrecode === centrecode)?.centreshortname === 'HQ');
                          return isHQCentre;
                        }
                        // Show all other objectives
                        return true;
                      })
                      .map(obj => {
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
                                    {row.isSaved && !row.isEditing ? (
                                      <small>{row.actionName || row.actionCode || '-'}</small>
                                    ) : row.isEditing && row.multipleEntries ? (
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

                                {/* SUCCESS INDICATOR - ALWAYS AVAILABLE DIRECTLY FROM API (NOT DEPENDENT ON ACTION CODE) */}
                                <td colSpan="1" style={{verticalAlign: 'middle', padding: '0.3rem', width: '20%', backgroundColor: '#f8f9fa', borderTop: tooltipError?.rowId === row.id && tooltipError?.field === 'successIndicatorCode' ? '3px solid #dc3545' : 'none'}}>
                                  <div style={{position: 'relative'}}>
                                    {row.isSaved && !row.isEditing ? (
                                      <small>{row.siName ? row.siName : '-'}</small>
                                    ) : row.isEditing && row.multipleEntries ? (
                                      <select 
                                        className="form-select form-select-sm"
                                        value={row.successIndicatorCode || ''}
                                        onChange={(e) => {
                                          const siCode = e.target.value;
                                          if (siCode) {
                                            handleSIChange(row.id, row.objectCode, row.actionCode, siCode);
                                          }
                                        }}
                                        disabled={!isCentreLocked()}
                                        style={{fontSize: '0.8rem', padding: '0.2rem'}}
                                      >
                                        <option value="">Select SI...</option>
                                        {successIndicators[row.objectCode]?.map(si => (
                                          <option key={si.successindicatorcode} value={si.successindicatorcode}>
                                            {si.successindicatordescription}
                                          </option>
                                        )) || []}
                                      </select>
                                    ) : (
                                      <small>{row.siName ? row.siName : '-'}</small>
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
                                      disabled={row.unitPreferred === 'Fixed' || row.multipleEntries || isCentreLocked()}
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
                                  <div style={{position: 'relative'}}>
                                    {renderWeightInput(row, 'excellent')}
                                    {tooltipError?.rowId === row.id && tooltipError?.field === 'excellent' && (
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

                                {/* VERY GOOD INPUT */}
                                <td colSpan="1" style={{fontSize: '0.75rem', padding: '0.2rem', verticalAlign: 'middle', backgroundColor: '#e7f3ff', borderTop: tooltipError?.rowId === row.id && tooltipError?.field === 'veryGood' ? '3px solid #dc3545' : 'none'}}>
                                  <div style={{position: 'relative'}}>
                                    {renderWeightInput(row, 'veryGood')}
                                    {tooltipError?.rowId === row.id && tooltipError?.field === 'veryGood' && (
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

                                {/* GOOD INPUT */}
                                <td colSpan="1" style={{fontSize: '0.75rem', padding: '0.2rem', verticalAlign: 'middle', backgroundColor: '#e7f3ff', borderTop: tooltipError?.rowId === row.id && tooltipError?.field === 'good' ? '3px solid #dc3545' : 'none'}}>
                                  <div style={{position: 'relative'}}>
                                    {renderWeightInput(row, 'good')}
                                    {tooltipError?.rowId === row.id && tooltipError?.field === 'good' && (
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

                                {/* FAIR INPUT */}
                                <td colSpan="1" style={{fontSize: '0.75rem', padding: '0.2rem', verticalAlign: 'middle', backgroundColor: '#e7f3ff', borderTop: tooltipError?.rowId === row.id && tooltipError?.field === 'fair' ? '3px solid #dc3545' : 'none'}}>
                                  <div style={{position: 'relative'}}>
                                    {renderWeightInput(row, 'fair')}
                                    {tooltipError?.rowId === row.id && tooltipError?.field === 'fair' && (
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

                                {/* POOR INPUT */}
                                <td colSpan="1" style={{fontSize: '0.75rem', padding: '0.2rem', verticalAlign: 'middle', backgroundColor: '#e7f3ff', borderTop: tooltipError?.rowId === row.id && tooltipError?.field === 'poor' ? '3px solid #dc3545' : 'none'}}>
                                  <div style={{position: 'relative'}}>
                                    {renderWeightInput(row, 'poor')}
                                    {tooltipError?.rowId === row.id && tooltipError?.field === 'poor' && (
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
                                    
                                    {/* ADD ENTRY BUTTON - Only show after row is saved - HIGHLIGHTED */}
                                    {row.multipleEntries && row.isSaved && getLastRowForObjective(row.objectCode)?.id === row.id && (
                                      <>
                                        <button 
                                          className="btn btn-sm btn-success"
                                          onClick={() => addNewEntryForObjective(row.objectCode)}
                                          disabled={loading}
                                          title="Add new entry"
                                          style={{
                                            fontSize: '0.7rem', 
                                            padding: '0.3rem 0.5rem', 
                                            minWidth: '28px', 
                                            flex: '0 0 auto',
                                            fontWeight: '600',
                                            boxShadow: '0 0 8px rgba(40, 167, 69, 0.6)',
                                            animation: 'pulse 2s infinite'
                                          }}
                                        >
                                          <Plus size={12} />
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
          <li><strong style={{color: '#dc3545'}}>🔴 FIRST: Select a Centre</strong> - This is MANDATORY! Select your centre from the dropdown above before doing anything else. Data entry and operations are disabled until you select a centre.</li>
          <li>Select <strong>Operation</strong> and <strong>Financial Year</strong> at the top</li>
          <li>All <strong>objectives auto-load</strong> from the API as collapsible rows</li>
          <li>For objectives that allow <strong>Multiple Entries</strong> (like 001A, 002A, 003A), use the <strong>"Add Entry"</strong> button (visible only after saving the first entry)</li>
          <li>For objectives with <strong>predefinedactions = "Yes"</strong>, select from dropdown. For <strong>"No"</strong>, enter description inline</li>
          <li>System auto-generates action codes like "001AA000001" for non-predefined actions</li>
          <li>Select <strong>Success Indicator</strong> → Weight type (Date/Number/%) loads from API</li>
          <li><strong>Excellent field is MANDATORY</strong> — rest of the performance levels (Very Good, Good, Fair, Poor) are optional</li>
          <li>If you enter values, they must follow the correct order: For DATE type, earlier dates for higher performance. For NUMBER/PERCENTAGE, higher values for higher performance</li>
          <li>Date values display in <strong>dd/mm/yyyy</strong> format for user-friendly viewing</li>
          <li>Click <strong>"Save"</strong> to save row to backend and freeze all values (Action Code, Success Indicator become read-only)</li>
          <li>Click <strong>"Edit"</strong> to modify a saved row</li>
          <li>Click <strong>"Delete"</strong> to remove a row (only for multiple-entry objectives)</li>
          <li>Once a row is saved, an <strong>"Add Entry"</strong> button appears to add the next entry</li>
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
          <li><code>POST http://localhost:8080/api/actions/auto</code> - Save user-entered actions with auto-generated codes</li>
          <li><code>POST http://localhost:8080/api/targets</code> - <strong>CREATE/UPDATE target setting row</strong></li>
          <li><code>POST http://localhost:8080/api/targets/delete</code> - <strong>DELETE target setting row</strong></li>
          <li><code>POST http://localhost:8080/api/targets/by-id</code> - <strong>GET target setting by composite ID</strong></li>
          <li><code>GET http://localhost:8080/api/targets</code> - <strong>GET all target settings</strong></li>
        </ul>
      </div>

      {/* ===== CONFIRMATION MODAL - DELETE ONLY ===== */}


    </div>
  );
};

export default OperationsTargetSettingPage;
