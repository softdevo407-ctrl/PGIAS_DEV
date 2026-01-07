// OPERATIONAL DATA ENTRY - TARGET SETTING PAGE (Backend Integrated)
// This is a new, completely redesigned page with table-based entry

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, CheckCircle, ChevronDown, ChevronRight, X, Search, Loader, AlertCircle, Bell, Check, AlertTriangle, Info, UploadCloud } from 'lucide-react';
import CreatableSelect from 'react-select/creatable';
import Swal from 'sweetalert2';

// Add enhanced animations and styles for better UI
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
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(400px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  /* Sticky table header styles */
  .sticky-table-header {
    position: sticky;
    top: 0;
    z-index: 10;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  /* Table enhancements */
  .enhanced-table {
    border-collapse: separate;
    border-spacing: 0;
  }
  
  .enhanced-table tbody tr:hover {
    background-color: #f0f8ff !important;
    transition: background-color 0.2s ease-in-out;
  }
  
  /* Form control enhancements */
  .form-control-modern, .form-select-modern {
    border-radius: 6px;
    border: 1px solid #ddd;
    transition: all 0.3s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }
  
  .form-control-modern:focus, .form-select-modern:focus {
    border-color: #0066cc;
    box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
    outline: none;
  }
  
  /* Badge enhancements */
  .badge-modern {
    border-radius: 20px;
    padding: 0.4rem 0.8rem;
    font-weight: 500;
    font-size: 0.85rem;
  }
`;

// Inject styles into document head
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = pulseStyle;
  document.head.appendChild(style);
}

// ===== SWEETALERT NOTIFICATION HELPER =====
// SweetAlert is used instead of custom toast system for consistent alerts

const OperationsTargetSettingPage = () => {
  // SweetAlert notification helper function with clickable buttons
  const showAlert = useCallback((message, type = 'info', title = '') => {
    const config = {
      title: title || (type === 'success' ? 'Success!' : type === 'error' ? 'Error!' : type === 'warning' ? 'Warning!' : 'Info'),
      text: message,
      icon: type,
      confirmButtonColor: type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : type === 'warning' ? '#ffc107' : '#0066cc',
      confirmButtonText: 'OK',
      toast: false,
      position: 'center',
      showConfirmButton: true,
      allowOutsideClick: true,
      allowEscapeKey: true
    };
    Swal.fire(config);
  }, []);

  // SweetAlert confirmation dialog for user actions (Edit/Delete)
  const showConfirmAlert = useCallback((title, message) => {
    return Swal.fire({
      title: title,
      text: message,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0066cc',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, Proceed',
      cancelButtonText: 'Cancel'
    });
  }, []);

  // State Management
  const [operation, setOperation] = useState('TARGET_SETTING');
  const [selectedFY, setSelectedFY] = useState('2026-2027');
  const [centrecode, setCentrecode] = useState(''); // Will be populated from user roles/permissions
  const [userRoles, setUserRoles] = useState([]); // Roles assigned to user
  const [userRole, setUserRole] = useState(''); // Single role (APR = Approver, EMP = Employee)
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
  const [isFormSubmitted, setIsFormSubmitted] = useState(false); // Track if form is already submitted (statuscode T02)
  
  // Approver-specific state
  const [showRemarksModal, setShowRemarksModal] = useState(false);
  const [remarksData, setRemarksData] = useState({ rowId: null, remarks: '' });
  // const isApprover = userRole === 'APR'; // Approver has separate page
  
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
      // Read loginId and centre codes from localStorage set by App.jsx during authentication
      const loginId = localStorage.getItem('loginId');
      const centreCodeFromStorage = localStorage.getItem('centreCode'); // Comma-separated string
      const centreCodesArrayFromStorage = localStorage.getItem('centreCodesArray'); // JSON array
      const userRoleFromStorage = localStorage.getItem('userRole'); // User role (APR, EMP, etc)
      
      console.log('🔑 Retrieved from localStorage - User:', loginId, '| Centre:', centreCodeFromStorage, '| Role:', userRoleFromStorage);

      // Set userid and role
      setUserid(loginId);
      setUserRole(userRoleFromStorage || '');
      
      // Parse centreCodesArray if available (takes priority over centreCode string)
      let parsedCentreArray = null;
      try {
        if (centreCodesArrayFromStorage) {
          parsedCentreArray = JSON.parse(centreCodesArrayFromStorage);
          console.log('📍 Parsed centre codes array:', parsedCentreArray);
        }
      } catch (parseErr) {
        console.warn('Failed to parse centreCodesArray:', parseErr);
      }

      // Use parsed array if available, otherwise fallback to parsing the comma-separated string
      if (parsedCentreArray && Array.isArray(parsedCentreArray) && parsedCentreArray.length > 0) {
        setAssignedCentre(parsedCentreArray);
      } else if (centreCodeFromStorage && (centreCodeFromStorage.includes(',') || centreCodeFromStorage.includes('|') || centreCodeFromStorage.includes(';'))) {
        const separators = /[,|;]+/;
        const codes = centreCodeFromStorage.split(separators).map(c => c.trim()).filter(Boolean);
        setAssignedCentre(codes);
      } else {
        setAssignedCentre(centreCodeFromStorage);
      }

      // Normalize centre assignment: if 'All' or 'ALL', allow selection; otherwise pre-fill or force selection
      if (String(centreCodeFromStorage).toUpperCase() === 'ALL') {
        setCentrecode(''); // Allow user to select from all centres
      } else if (parsedCentreArray?.length > 1 || (centreCodeFromStorage && (centreCodeFromStorage.includes(',') || centreCodeFromStorage.includes('|') || centreCodeFromStorage.includes(';')))) {
        // Multiple assigned centres -> force user to pick one
        setCentrecode('');
      } else {
        setCentrecode(centreCodeFromStorage);
      }

      console.log('👤 Initialized from localStorage - User:', loginId, '| Centre(s):', centreCodeFromStorage);
      
      // Fetch centres list for dropdown
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
          originalValues: null,  // Store original values when entering edit mode
          // Approver-specific fields
          approvalStatus: 'PENDING',  // PENDING, APPROVED, REJECTED
          approvalRemarks: '',  // Remarks for rejection or approval
          approvedBy: null,  // User ID of approver
          approvedAt: null  // Timestamp of approval/rejection
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

  // ===== DYNAMIC TOTAL WEIGHT CALCULATION =====
  // Update total weights whenever rows change (real-time calculation)
  useEffect(() => {
    const updatedTotalWeights = {};
    objectives.forEach(obj => {
      const totalWeight = calculateTotalWeightForObjective(obj.objectivecode);
      if (totalWeight) {
        updatedTotalWeights[obj.objectivecode] = totalWeight;
      }
    });
    setTotalWeights(updatedTotalWeights);
  }, [rows, objectives]);

  // ===== CHECK FOR T02 STATUSCODE (SUBMITTED STAGE) =====
  // Lock form if any row has statuscode = T02 (already submitted)
  useEffect(() => {
    if (rows && rows.length > 0) {
      const hasT02Status = rows.some(row => row.statuscode === 'T02');
      if (hasT02Status) {
        setIsFormSubmitted(true);
       // showAlert('This form has already been submitted (T02 status). Form is now locked.', 'info', 'Form Locked');
        console.log('🔒 Form locked - Status T02 detected (submitted stage)');
      } else {
        setIsFormSubmitted(false);
      }
    }
  }, [rows, centrecode, selectedFY]);

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
      showAlert('Please enter an action description', 'error', 'Validation Error');
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
          showAlert(`${errorMessage} - Please enter a different action description`, 'warning', 'Action Exists');
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

      showAlert('Action created successfully!', 'success', 'Success');
    } catch (err) {
      showAlert('Error saving action: ' + err.message, 'error', 'Error');
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
          weightperunitofactivity: item.weightperunitofactivity || 0,
          statuscode: item.statuscode || 'T01'  // T01 = target setting, T02 = submitted
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
          // Performance level target criteria - START EMPTY for single-entry objectives
          // User must manually enter values
          excellent: '',
          veryGood: '',
          good: '',
          fair: '',
          poor: '',
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
      // Only include optional performance level fields if they have actual values
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
        // Only send optional fields if they have values
        targetcriteriavalueverygood: (row.veryGood && String(row.veryGood).trim() !== '') ? row.veryGood : null,
        targetcriteriavaluegood: (row.good && String(row.good).trim() !== '') ? row.good : null,
        targetcriteriavaluefair: (row.fair && String(row.fair).trim() !== '') ? row.fair : null,
        targetcriteriavaluepoor: (row.poor && String(row.poor).trim() !== '') ? row.poor : null,
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
      
      // Determine if this is an UPDATE or CREATE
      const isUpdate = row.isSaved && (row.hasChanges || row.isEditing);
      let response;
      
      if (isUpdate) {
        // UPDATE: Use PATCH with path variables
        const updateUrl = `http://localhost:8080/api/targets/${fyYear}/${centrecode}/${row.objectCode}/${row.actionCode}/${row.successIndicatorCode}`;
        console.log('🔄 Updating row via PATCH:', updateUrl);
        response = await fetch(updateUrl, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        // CREATE: Use POST
        console.log('➕ Creating new row via POST');
        response = await fetch('http://localhost:8080/api/targets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      
      if (!response.ok) {
        let errorMessage = isUpdate ? 'Failed to update row' : 'Failed to save row';
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
      console.log(isUpdate ? '✅ Row updated successfully:' : '✅ Row saved successfully:', result);
      return isUpdate ? "Row updated successfully" : "Row saved successfully";
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
            // For multi-entry: DO NOT auto-fill performance levels - let user enter them
            // For single-entry: DO NOT auto-fill either - let user enter them
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
    
    // Clear tooltip error when user starts editing this field
    if (tooltipError?.rowId === rowId && tooltipError?.field === field) {
      setTooltipError(null);
    }
  };

  // Save row to backend and freeze it
  const saveRow = async (row) => {
    // Show confirmation before saving
    const confirmResult = await showConfirmAlert('Save Entry?', 'Are you sure want to save this entry?');
    if (!confirmResult.isConfirmed) {
      return; // User cancelled
    }

    // Check if row status is T02 or T04 (locked statuses)
    const status = row.statuscode || 'T01';
    if (status === 'T02' || status === 'T04') {
      showAlert(`Row is locked (${getRowStatusInfo(status).description}). Cannot edit.`, 'warning', 'Row Locked');
      return;
    }
    
    // Validate centre is selected
    if (!centrecode || centrecode.trim() === '') {
      showAlert('Please select a centre before saving', 'warning', 'Centre Required');
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
      
      // Immediately freeze the row after successful save (isEditing: false)
      setRows(rows.map(r =>
        r.id === row.id ? { ...r, isEditing: false, isSaved: true, hasChanges: false, statuscode: 'T01' } : r
      ));
      showAlert('Row saved successfully!', 'success', 'Success');
    } catch (err) {
      showAlert('Error: ' + err.message, 'error', 'Error');
    } finally {
      setLoading(false);
    }
  };

  // Show alert before editing a saved row
  const requestEditRow = (rowId) => {
    const row = rows.find(r => r.id === rowId);
    if (!row) return;
    
    const status = row.statuscode || 'T01';
    if (status === 'T02' || status === 'T04' || status === 'T05' || status === 'T06' || status === 'T07') {
      showAlert(`Row is locked (${getRowStatusInfo(status).description}). Cannot edit.`, 'warning', 'Row Locked');
      return;
    }
    
    // For T03 (Rejected rows), allow direct editing without confirmation
    if (status === 'T03') {
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
      return;
    }

    showConfirmAlert('Edit Row?', 'Are you sure you want to edit this row?').then((result) => {
      if (result.isConfirmed) {
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
    });
  };

  // Delete Row from Backend: POST http://localhost:8080/api/targets/delete
  const deleteRowFromBackend = async (row) => {
    try {
      const fyYear = selectedFY; // Use as-is (format: 2026-2027)
      
      // Build DELETE URL with path variables
      const deleteUrl = `http://localhost:8080/api/targets/${fyYear}/${centrecode}/${row.objectCode}/${row.actionCode}/${row.successIndicatorCode}`;
      console.log('🗑️ Deleting row via DELETE:', deleteUrl);
      
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
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
    
    // Check if row status is T02 or T04 (locked statuses)
    const status = row.statuscode || 'T01';
    if (status === 'T02' || status === 'T04') {
      showAlert(`Row is locked (${getRowStatusInfo(status).description}). Cannot delete.`, 'warning', 'Row Locked');
      return;
    }
    
    showConfirmAlert('Delete Entry?', 'Are you sure you want to delete this entry? This action cannot be undone.').then((result) => {
      if (result.isConfirmed) {
        setLoading(true);
        deleteRowFromBackend(row)
          .then(() => {
            setRows(rows.filter(r => r.id !== rowId));
            showAlert('Row deleted successfully!', 'success', 'Success');
          })
          .catch(err => {
            showAlert('Error: ' + err.message, 'error', 'Error');
          })
          .finally(() => {
            setLoading(false);
          });
      }
    });
  };

  // ===== RESUBMIT REJECTED ROW =====
  // Resubmit a rejected row (T03 status) to change it back to T02 (Submitted)
  // Use new API endpoint: PUT /api/targets/resubmit with full request body
  const resubmitRejectedRow = async (row) => {
    // Show confirmation before resubmitting
    const confirmResult = await showConfirmAlert('Resubmit Entry?', 'Are you sure you want to resubmit this rejected entry for approval?');
    if (!confirmResult.isConfirmed) {
      return; // User cancelled
    }

    // Validate performance levels before resubmitting (same validation as save)
    const validationResult = validatePerformanceLevels(row);
    if (!validationResult.isValid) {
      setTooltipError({
        rowId: row.id,
        field: validationResult.field,
        message: validationResult.message
      });
      return;
    }

    try {
      setLoading(true);
      const fyYear = selectedFY;

      // Find centre short name from loaded centres
      const selectedCentreObj = centres.find(c => c.centrecode === centrecode) || null;

      // Build complete payload with all data (same structure as save but for resubmit)
      const payload = {
        financialyear: fyYear,
        centrecode: centrecode,
        objectivecode: row.objectCode,
        actioncode: row.actionCode,
        successindicatorcode: row.successIndicatorCode,
        centreshortname: selectedCentreObj ? selectedCentreObj.centreshortname : '',
        objectivedescription: row.objectDescription || '',
        actiondescription: row.actionName || '',
        successindicatordescription: row.siName || '',
        unit: row.unit || '',
        targetsetvalue: row.excellent || '',
        weightperunitofactivity: row.weightValue?.value || 0,
        targetcriteriavalueexcellent: row.excellent || '',
        // Include optional performance level fields if they have values
        targetcriteriavalueverygood: (row.veryGood && String(row.veryGood).trim() !== '') ? row.veryGood : null,
        targetcriteriavaluegood: (row.good && String(row.good).trim() !== '') ? row.good : null,
        targetcriteriavaluefair: (row.fair && String(row.fair).trim() !== '') ? row.fair : null,
        targetcriteriavaluepoor: (row.poor && String(row.poor).trim() !== '') ? row.poor : null,
        achievementstatuscode: null,
        achievementstatusdescription: null,
        validforpercentage: row.selectedWeightType === 'PERCENTAGE' ? 'Y' : 'N',
        targetvalueachieved: null,
        achievementweightperunitofactivity: null,
        actualachievementpercentage: null,
        remarksofcentres: '',
        remarksofhqorapexcommittee: ''
      };

      console.log('📝 Resubmit payload:', payload);

      // Call new resubmit API endpoint with PUT and request body
      const submitUrl = `http://localhost:8080/api/targets/resubmit`;
      console.log('🔄 Resubmitting row via PUT:', submitUrl);

      const response = await fetch(submitUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        let errorMessage = 'Failed to resubmit row';
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
      console.log('✅ Row resubmitted successfully:', result);

      // Update row status to T02 (Submitted) and freeze it
      setRows(rows.map(r =>
        r.id === row.id ? { ...r, statuscode: 'T02', isEditing: false, hasChanges: false, approvalRemarks: '' } : r
      ));

      // Clear any tooltip errors
      setTooltipError(null);

      showAlert('Entry resubmitted successfully!', 'success', 'Success');
    } catch (err) {
      showAlert('Error: ' + err.message, 'error', 'Error');
    } finally {
      setLoading(false);
    }
  };

  // ===== APPROVER WORKFLOW FUNCTIONS (Only for APR role) =====
  
  // Request approval for a row
  const requestApproveRow = (rowId) => {
    const row = rows.find(r => r.id === rowId);
    if (!row) return;

    showConfirmAlert('Approve Entry?', 'Are you sure want to approve this entry?').then((result) => {
      if (result.isConfirmed) {
        approveRowToBackend(row);
      }
    });
  };

  // Approve row to backend
  const approveRowToBackend = async (row) => {
    try {
      setLoading(true);
      const fyYear = selectedFY;

      const payload = {
        financialyear: fyYear,
        centrecode: centrecode,
        objectivecode: row.objectCode,
        actioncode: row.actionCode,
        successindicatorcode: row.successIndicatorCode,
        approvalstatus: 'APPROVED',
        approvalremarks: '',
        approvedby: userid,
        approvedat: new Date().toISOString()
      };

      const response = await fetch('http://localhost:8080/api/targets/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        let errorMessage = 'Failed to approve row';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          const errorText = await response.text();
          if (errorText) errorMessage = errorText;
        }
        throw new Error(errorMessage);
      }

      // Update row status
      setRows(rows.map(r =>
        r.id === row.id 
          ? { ...r, approvalStatus: 'APPROVED', approvedBy: userid, approvedAt: new Date().toISOString() } 
          : r
      ));

      showAlert('Entry approved successfully!', 'success', 'Success');
    } catch (err) {
      showAlert('Error: ' + err.message, 'error', 'Error');
    } finally {
      setLoading(false);
    }
  };

  // Request rejection with remarks
  const requestRejectRow = (rowId) => {
    const row = rows.find(r => r.id === rowId);
    if (!row) return;

    // Show remarks modal
    setRemarksData({ rowId, remarks: '' });
    setShowRemarksModal(true);
  };

  // Submit rejection with remarks
  const submitRejectWithRemarks = async () => {
    if (!remarksData.remarks || remarksData.remarks.trim() === '') {
      showAlert('Please enter rejection remarks', 'warning', 'Remarks Required');
      return;
    }

    const row = rows.find(r => r.id === remarksData.rowId);
    if (!row) return;

    try {
      setLoading(true);
      const fyYear = selectedFY;

      const payload = {
        financialyear: fyYear,
        centrecode: centrecode,
        objectivecode: row.objectCode,
        actioncode: row.actionCode,
        successindicatorcode: row.successIndicatorCode,
        approvalstatus: 'REJECTED',
        approvalremarks: remarksData.remarks.trim(),
        approvedby: userid,
        approvedat: new Date().toISOString()
      };

      const response = await fetch('http://localhost:8080/api/targets/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        let errorMessage = 'Failed to reject row';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          const errorText = await response.text();
          if (errorText) errorMessage = errorText;
        }
        throw new Error(errorMessage);
      }

      // Update row status
      setRows(rows.map(r =>
        r.id === row.id 
          ? { ...r, approvalStatus: 'REJECTED', approvalRemarks: remarksData.remarks.trim(), approvedBy: userid, approvedAt: new Date().toISOString() } 
          : r
      ));

      setShowRemarksModal(false);
      setRemarksData({ rowId: null, remarks: '' });
      showAlert('Entry rejected with remarks!', 'success', 'Success');
    } catch (err) {
      showAlert('Error: ' + err.message, 'error', 'Error');
    } finally {
      setLoading(false);
    }
  };

  // ===== STATUS CODE HELPER FUNCTIONS =====
  // Get status info: color, label, editable flag
  const getRowStatusInfo = (statuscode) => {
    const statuses = {
      'T01': { label: '📝 Saved', color: '#e6f4ff', borderColor: '#0066cc', textColor: '#0066cc', icon: '📝', editable: true, description: 'Targets Setting - Editable', showButtons: true },
      'T02': { label: '🔒 Submitted', color: '#fff3cd', borderColor: '#ff9800', textColor: '#ff6600', icon: '🔒', editable: false, description: 'Submitted for Approval - Locked', showButtons: true },
      'T03': { label: '⚠️ Rejected', color: '#ffe6e6', borderColor: '#dc3545', textColor: '#dc3545', icon: '⚠️', editable: true, description: 'Sent for Resubmission - Editable', hasRejection: true, showButtons: true },
      'T04': { label: '✓ Approved', color: '#d4edda', borderColor: '#28a745', textColor: '#155724', icon: '✓', editable: false, description: 'Approved by Centre Level - Locked', showButtons: true },
      'T05': { label: '🤔 Clarification', color: '#fff8e1', borderColor: '#fbc02d', textColor: '#f57f17', icon: '🤔', editable: false, description: 'Clarification Required', showButtons: true },
      'T06': { label: '👁️ Review', color: '#f3e5f5', borderColor: '#9c27b0', textColor: '#6a1b9a', icon: '👁️', editable: false, description: 'Under Review', showButtons: true },
      'T07': { label: '✅ Sanctioned', color: '#e8f5e9', borderColor: '#4caf50', textColor: '#1b5e20', icon: '✅', editable: false, description: 'Sanctioned - Locked', showButtons: true }
    };
    return statuses[statuscode] || statuses['T01'];
  };

  // Check if row is editable based on status
  const isRowEditable = (statuscode) => {
    const info = getRowStatusInfo(statuscode);
    return info.editable;
  };

  // Check if row should show action buttons (always show, but may be disabled)
  const canShowActionButtons = (statuscode) => {
    return true;  // Always show buttons, disable them based on status
  };

  // Check if buttons should be disabled (locked statuses)
  const areButtonsDisabled = (statuscode) => {
    // T02 (Submitted), T04 (Approved), T05 (Clarification), T06 (Review), T07 (Sanctioned) are locked
    return statuscode === 'T02' || statuscode === 'T04' || statuscode === 'T05' || statuscode === 'T06' || statuscode === 'T07';
  };

  // Add a new entry row for an objective that allows multiple entries
  // Inserts the new entry directly below the last existing entry for that objective
  const addNewEntryForObjective = async (objectCode) => {
    // Get metadata from objectives array
    const objective = objectives.find(o => o.objectivecode === objectCode);
    if (!objective) return;
    
    // Check if objective allows multiple entries - if not, show error
    const allowsMultiple = objective.multipleentries === 'Yes';
    if (!allowsMultiple) {
      showAlert('This objective allows only ONE entry. Cannot add more.', 'info', 'Single Entry Only');
      return;
    }
    
    // Check if form is locked
    if (isFormSubmitted) {
      showAlert('Form is locked - Already submitted. Cannot add new entries.', 'warning', 'Form Locked');
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
    const status = row.statuscode || 'T01';
    
    // AFTER SAVING: Check based on STATUS CODE
    if (row.isSaved && !row.isEditing) {
      // For DATE type: show formatted date, otherwise show value as-is
      let displayValue = '';
      if (weightType === 'DATE') {
        displayValue = value ? formatDateDDMMYYYY(value) : '-';
      } else {
        displayValue = value !== null && value !== '' ? value : '-';
      }
      return (
        <small className="text-muted">
          {displayValue}
        </small>
      );
    }
    
    // Performance level fields logic based on STATUS CODE:
    // T01 (Draft): EDITABLE
    // T02 (Submitted): DISABLED
    // T03 (Resubmit): EDITABLE
    // T04 (Approved): DISABLED
    // NEW entries (not saved): ALWAYS ENABLED
    let isPerformanceFieldDisabled = false;
    
    // If row has a status code, use that to determine editability
    if (row.isSaved && row.statuscode) {
      const isEditable = isRowEditable(row.statuscode);
      isPerformanceFieldDisabled = !isEditable;
    } else if (row.isSaved && !row.isEditing) {
      // Saved row without explicit status, not in edit mode: DISABLED
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

    // Determine if field is mandatory
    const isMandatory = field === 'excellent';
    
    // Check if there's an error for THIS specific field
    const hasError = tooltipError?.rowId === row.id && tooltipError?.field === field;
    const errorClass = hasError ? 'is-invalid' : '';

    // Get financial year date range for date validation
    const fyDates = getFinancialYearDates(selectedFY);

    // For DATE type: date picker with FY restrictions
    if (weightType === 'DATE') {
      const isOutsideFY = value && fyDates && (value < fyDates.fromDate || value > fyDates.toDate);
      
      return (
        <div style={{position: 'relative'}}>
          <input 
            type="date" 
            className={`form-control form-control-sm ${errorClass} ${isOutsideFY ? 'is-invalid' : ''}`}
            value={value || ''} 
            onChange={(e) => {
              const selectedDate = e.target.value;
              // Validate date is within FY
              if (selectedDate && fyDates && !isDateWithinFinancialYear(selectedDate, selectedFY)) {
                setTooltipError({
                  rowId: row.id,
                  field: field,
                  message: `📅 Date must be within FY ${selectedFY} (${formatDateDDMMYYYY(fyDates.fromDate)} to ${formatDateDDMMYYYY(fyDates.toDate)})`
                });
                return;
              }
              // Clear error if date is valid
              if (tooltipError?.rowId === row.id && tooltipError?.field === field) {
                setTooltipError(null);
              }
              handleFieldChange(row.id, field, selectedDate);
            }}
            onKeyDown={(e) => {
              // Block all keyboard input - date picker selection only
              e.preventDefault();
            }}
            disabled={isPerformanceFieldDisabled}
            min={fyDates?.fromDate || ''}
            max={fyDates?.toDate || ''}
            style={{
              fontSize: '0.75rem', 
              padding: '0.3rem 0.4rem', 
              fontWeight: '500', 
              border: isOutsideFY ? '2px solid #dc3545' : '1px solid #dee2e6',
              backgroundColor: isOutsideFY ? '#fff5f5' : '#fff',
              cursor: isPerformanceFieldDisabled ? 'not-allowed' : 'pointer'
            }}
            title={isMandatory 
              ? `Mandatory - Select date within FY ${selectedFY} (${formatDateDDMMYYYY(fyDates?.fromDate)} to ${formatDateDDMMYYYY(fyDates?.toDate)})` 
              : `Optional - Select date within FY ${selectedFY} (${formatDateDDMMYYYY(fyDates?.fromDate)} to ${formatDateDDMMYYYY(fyDates?.toDate)})`}
          />
          {isOutsideFY && (
            <small style={{
              display: 'block',
              color: '#dc3545',
              marginTop: '0.25rem',
              fontWeight: 'bold',
              fontSize: '0.7rem'
            }}>
              ⚠️ Date outside FY range
            </small>
          )}
        </div>
      );
    } else if (weightType === 'PERCENTAGE') {
      return (
        <input 
          type="number" 
          min="0" 
          max="100" 
          className={`form-control form-control-sm ${errorClass}`}
          placeholder={isMandatory ? 'Required' : 'Optional'}
          value={value || ''} 
          onChange={(e) => handleFieldChange(row.id, field, e.target.value)}
          disabled={isPerformanceFieldDisabled}
          title={isMandatory ? 'Mandatory - higher is better' : 'Optional'}
        />
      );
    } else {
      // NUMBER type
      return (
        <input 
          type="number" 
          className={`form-control form-control-sm ${errorClass}`}
          placeholder={isMandatory ? 'Required' : 'Optional'}
          value={value || ''} 
          onChange={(e) => handleFieldChange(row.id, field, e.target.value)}
          disabled={isPerformanceFieldDisabled}
          title={isMandatory ? 'Mandatory - higher is better' : 'Optional'}
        />
      );
    }
  };

  // Calculate total weight from saved rows only
  const calculateTotalWeightForObjective = (objectCode) => {
    // Include BOTH saved rows AND unsaved rows that have a weight value selected
    // This makes total weights update dynamically when SI is selected (before saving)
    const relevantRows = rows.filter(r => r.objectCode === objectCode && (r.isSaved || r.weightValue));
    const totalWeight = relevantRows.reduce((sum, row) => {
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

  // Helper: Extract financial year dates (from and to)
  const getFinancialYearDates = (fyString) => {
    // fyString format: "2026-2027"
    if (!fyString) return null;
    const [fromYear, toYear] = fyString.split('-').map(y => y.trim());
    if (!fromYear || !toYear) return null;
    // Financial year typically starts April 1st and ends March 31st
    // So 2026-2027 means April 1, 2026 to March 31, 2027
    return {
      fromDate: `${fromYear}-04-01`,
      toDate: `${toYear}-03-31`
    };
  };

  // Helper: Validate date is within financial year
  const isDateWithinFinancialYear = (dateStr, fyString) => {
    if (!dateStr || !fyString) return false;
    const fyDates = getFinancialYearDates(fyString);
    if (!fyDates) return false;
    return dateStr >= fyDates.fromDate && dateStr <= fyDates.toDate;
  };

  // Helper: Compare two dates (for DATE weight type)
  const compareDates = (date1, date2) => {
    // Returns: -1 if date1 < date2, 0 if equal, 1 if date1 > date2
    if (!date1 || !date2) return 0;
    if (date1 < date2) return -1;
    if (date1 > date2) return 1;
    return 0;
  };

  // Comprehensive validation for performance level fields
  const validatePerformanceLevels = (row) => {
    const weightType = row.selectedWeightType || 'NUMBER';
    
    // Check if Excellent is filled (MANDATORY)
    if (!row.excellent && row.excellent !== 0) {
      return {
        isValid: false,
        field: 'excellent',
        message: '📊 Excellent is MANDATORY'
      };
    }

    if (weightType === 'DATE') {
      // ===== DATE TYPE VALIDATION =====
      // 1. Excellent must be within financial year
      if (!isDateWithinFinancialYear(row.excellent, selectedFY)) {
        return {
          isValid: false,
          field: 'excellent',
          message: `📅 Excellent date must be within FY ${selectedFY}`
        };
      }

      // 2. Check order ONLY if other fields are filled: dates should be ascending (Excellent < Very Good < Good < Fair < Poor)
      // For dates, earlier = better performance
      // Only validate optional fields if they ARE actually entered
      
      let previousValue = row.excellent;

      // Check Very Good ONLY if entered
      const veryGoodVal = String(row.veryGood || '').trim();
      if (veryGoodVal !== '') {
        if (!isDateWithinFinancialYear(veryGoodVal, selectedFY)) {
          return {
            isValid: false,
            field: 'veryGood',
            message: `⚠️ Very Good date must be after Excellent (${formatDateDDMMYYYY(row.excellent)})`
          };
        }
        // Very Good should be AFTER Excellent (later date for worse performance)
        if (compareDates(veryGoodVal, previousValue) <= 0) {
          return {
            isValid: false,
            field: 'veryGood',
            message: `⚠️ Very Good date must be after Excellent (${formatDateDDMMYYYY(row.excellent)})`
          };
        }
        previousValue = veryGoodVal;
      }

      // Check Good ONLY if entered
      const goodVal = String(row.good || '').trim();
      if (goodVal !== '') {
        if (!isDateWithinFinancialYear(goodVal, selectedFY)) {
          return {
            isValid: false,
            field: 'good',
            message: `⚠️ Good date must be after ${veryGoodVal ? 'Very Good' : 'Excellent'} (${formatDateDDMMYYYY(previousValue)})`
          };
        }
        if (compareDates(goodVal, previousValue) <= 0) {
          return {
            isValid: false,
            field: 'good',
            message: `⚠️ Good date must be after ${veryGoodVal ? 'Very Good' : 'Excellent'} (${formatDateDDMMYYYY(previousValue)})`
          };
        }
        previousValue = goodVal;
      }

      // Check Fair ONLY if entered
      const fairVal = String(row.fair || '').trim();
      if (fairVal !== '') {
        if (!isDateWithinFinancialYear(fairVal, selectedFY)) {
          return {
            isValid: false,
            field: 'fair',
            message: `⚠️ Fair date must be after ${goodVal ? 'Good' : (veryGoodVal ? 'Very Good' : 'Excellent')} (${formatDateDDMMYYYY(previousValue)})`
          };
        }
        if (compareDates(fairVal, previousValue) <= 0) {
          return {
            isValid: false,
            field: 'fair',
            message: `⚠️ Fair date must be after ${goodVal ? 'Good' : (veryGoodVal ? 'Very Good' : 'Excellent')} (${formatDateDDMMYYYY(previousValue)})`
          };
        }
        previousValue = fairVal;
      }

      // Check Poor ONLY if entered
      const poorVal = String(row.poor || '').trim();
      if (poorVal !== '') {
        if (!isDateWithinFinancialYear(poorVal, selectedFY)) {
          return {
            isValid: false,
            field: 'poor',
            message: `⚠️ Poor date must be after ${fairVal ? 'Fair' : (goodVal ? 'Good' : (veryGoodVal ? 'Very Good' : 'Excellent'))} (${formatDateDDMMYYYY(previousValue)})`
          };
        }
        if (compareDates(poorVal, previousValue) <= 0) {
          return {
            isValid: false,
            field: 'poor',
            message: `⚠️ Poor date must be after ${fairVal ? 'Fair' : (goodVal ? 'Good' : (veryGoodVal ? 'Very Good' : 'Excellent'))} (${formatDateDDMMYYYY(previousValue)})`
          };
        }
      }
    } else {
      // ===== NUMBER/PERCENTAGE TYPE VALIDATION =====
      // Excellent is mandatory - convert to number for comparison
      const excellentVal = parseFloat(row.excellent) || 0;

      // Check Very Good ONLY if filled
      if (row.veryGood !== null && row.veryGood !== '') {
        const veryGoodVal = parseFloat(row.veryGood) || 0;
        if (veryGoodVal >= excellentVal) {
          return {
            isValid: false,
            field: 'veryGood',
            message: `📈 Very Good (${veryGoodVal}) must be less than Excellent (${excellentVal})`
          };
        }
      }

      // Check Good ONLY if filled
      if (row.good !== null && row.good !== '') {
        const goodVal = parseFloat(row.good) || 0;
        const compareWith = row.veryGood ? parseFloat(row.veryGood) : excellentVal;
        if (goodVal >= compareWith) {
          return {
            isValid: false,
            field: 'good',
            message: `✓ Good (${goodVal}) must be less than ${row.veryGood ? 'Very Good' : 'Excellent'} (${compareWith})`
          };
        }
      }

      // Check Fair ONLY if filled
      if (row.fair !== null && row.fair !== '') {
        const fairVal = parseFloat(row.fair) || 0;
        const compareWith = row.good ? parseFloat(row.good) : (row.veryGood ? parseFloat(row.veryGood) : excellentVal);
        if (fairVal >= compareWith) {
          return {
            isValid: false,
            field: 'fair',
            message: `↓ Fair (${fairVal}) must be less than ${row.good ? 'Good' : (row.veryGood ? 'Very Good' : 'Excellent')} (${compareWith})`
          };
        }
      }

      // Check Poor ONLY if filled
      if (row.poor !== null && row.poor !== '') {
        const poorVal = parseFloat(row.poor) || 0;
        const compareWith = row.fair ? parseFloat(row.fair) : (row.good ? parseFloat(row.good) : (row.veryGood ? parseFloat(row.veryGood) : excellentVal));
        if (poorVal >= compareWith) {
          return {
            isValid: false,
            field: 'poor',
            message: `✗ Poor (${poorVal}) must be less than ${row.fair ? 'Fair' : (row.good ? 'Good' : (row.veryGood ? 'Very Good' : 'Excellent'))} (${compareWith})`
          };
        }
      }
    }

    // All validations passed
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

  // Comprehensive validation and submit all data
  const validateAndSubmitAllData = async () => {
    // Step 1: Check if centre is selected
    if (!centrecode || centrecode.trim() === '') {
      showAlert('Please select a centre before submitting', 'warning', 'Centre Required');
      return;
    }

    // Step 2: Check if centre is HQ (centre code 13)
    const isHQCentre = centrecode === '13';

    // Step 3: Get ALL objectives (will be filtered during validation)
    let applicableObjectives = objectives;

    if (applicableObjectives.length === 0) {
      showAlert('No objectives available', 'info', 'No Data');
      return;
    }

    // Step 4: Check MANDATORY objectives for at least one saved row
    // For HQ objectives (mandatory='HQ'): Only validate if user is at centre 13 (HQ)
    // For regular mandatory (mandatory='Yes'): Always validate
    const missingObjectives = [];
    for (const obj of applicableObjectives) {
      let isMandatory = false;
      
      // Check if this objective is mandatory for current centre
      if (obj.mandatory === 'Yes') {
        // Regular mandatory for all centres
        isMandatory = true;
      } else if (obj.mandatory === 'HQ' && isHQCentre) {
        // HQ-only mandatory objectives - only validate if at HQ centre (13)
        isMandatory = true;
      }
      
      // If mandatory, check for saved rows
      if (isMandatory) {
        const savedRowsForObj = rows.filter(r => r.objectCode === obj.objectivecode && r.isSaved);
        if (savedRowsForObj.length === 0) {
          missingObjectives.push(`${obj.objectivecode} - ${obj.objectivedescription}`);
        }
      }
    }

    // Step 4: Show validation errors if any mandatory objectives are missing
    if (missingObjectives.length > 0) {
      const errorList = missingObjectives.map((obj, idx) => `${idx + 1}. ${obj}`).join(' | ');
      showAlert(`Missing ${missingObjectives.length} mandatory objective(s): ${errorList}`, 'error', 'Validation Failed');
      return;
    }

    // Step 5: All validations passed - show confirmation
    const totalSaved = rows.filter(r => r.isSaved).length;
    const totalMandatory = applicableObjectives.filter(obj => obj.mandatory === 'Yes' || obj.mandatory === 'HQ').length;
    const totalOptional = applicableObjectives.length - totalMandatory;
    
    const summaryMessage = `Total Entries: ${totalSaved}\nMandatory Objectives: ${totalMandatory} ✓\nOptional Objectives: ${totalOptional}\nFinancial Year: ${selectedFY}\nCentre: ${centrecode}`;

    showConfirmAlert(
      'Submit All Data?',
      `All mandatory objectives are complete!\n\n${summaryMessage}\n\nThis will lock the form from further editing.`
    ).then((result) => {
      if (result.isConfirmed) {
        // Step 6: Call backend API to submit all records
        submitAllData();
      }
    });
  };

  // Validate and approve all data (Approver role only)
  const validateAndApproveAllData = async () => {
    // Count approval statuses
    const approved = rows.filter(r => r.approvalStatus === 'APPROVED').length;
    const rejected = rows.filter(r => r.approvalStatus === 'REJECTED').length;
    const pending = rows.filter(r => r.approvalStatus === 'PENDING').length;

    // If there are rejected entries, show warning
    if (rejected > 0) {
      const warningMsg = `You have ${rejected} rejected entry(ies).\n\nApproved: ${approved}\nRejected: ${rejected}\nPending: ${pending}\n\nDo you want to approve with these rejected cases?`;
      
      showConfirmAlert(
        'Approve All with Rejected Cases?',
        warningMsg
      ).then((result) => {
        if (result.isConfirmed) {
          approveAllToBackend();
        }
      });
    } else if (pending > 0) {
      showAlert(`You have ${pending} pending entry(ies). Please approve or reject them first.`, 'warning', 'Pending Entries');
    } else {
      // All approved
      const summaryMessage = `Total Entries Approved: ${approved}\nFinancial Year: ${selectedFY}\nCentre: ${centrecode}`;
      
      showConfirmAlert(
        'Approve All Data?',
        `All entries are ready for approval!\n\n${summaryMessage}`
      ).then((result) => {
        if (result.isConfirmed) {
          approveAllToBackend();
        }
      });
    }
  };

  // Approve all to backend
  const approveAllToBackend = async () => {
    try {
      setLoading(true);
      const fyYear = selectedFY;
      const approved = rows.filter(r => r.approvalStatus === 'APPROVED' || r.approvalStatus === 'PENDING').length;

      const payload = {
        financialyear: fyYear,
        centrecode: centrecode,
        approvedbatchcount: approved,
        approvedbybatchby: userid,
        approvedat: new Date().toISOString(),
        rowdata: rows.filter(r => r.isSaved).map(r => ({
          objectivecode: r.objectCode,
          actioncode: r.actionCode,
          successindicatorcode: r.successIndicatorCode,
          approvalstatus: r.approvalStatus,
          approvalremarks: r.approvalRemarks
        }))
      };

      const response = await fetch('http://localhost:8080/api/targets/approveall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        let errorMessage = 'Failed to approve all entries';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          const errorText = await response.text();
          if (errorText) errorMessage = errorText;
        }
        throw new Error(errorMessage);
      }

      showAlert(`All entries approved successfully! ${approved} entries were processed.`, 'success', 'Success');
      // Lock the form
      setIsFormSubmitted(true);
    } catch (err) {
      showAlert('Error: ' + err.message, 'error', 'Error');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to submit data to backend
  const submitAllData = async () => {
    try {
      setLoading(true);
      console.log(`📤 Calling /submitall API for FY: ${selectedFY}, Centre: ${centrecode}`);
      
      const response = await fetch(`http://localhost:8080/api/targets/submitall?financialyear=${selectedFY}&centrecode=${centrecode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        let errorMessage = 'Failed to submit all records';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          const errorText = await response.text();
          if (errorText) errorMessage = errorText;
        }
        throw new Error(errorMessage);
      }

      const result = await response.text();
      console.log('✅ API Response:', result);

      // Step 7: Freeze all rows after successful submission
      // Make entire form read-only - all values cannot be edited
      setRows(prev => prev.map(row => ({
        ...row,
        isEditing: false,
        isSaved: true,
        hasChanges: false
      })));

      // Show success message with submission count
      showAlert(`${result} - All entries are now frozen and cannot be edited`, 'success', 'Submitted');
      console.log(`✅ All entries submitted and frozen successfully`);
    } catch (err) {
      showAlert('Error submitting data: ' + err.message, 'error', 'Error');
      console.error('Submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid" style={{backgroundColor: '#f5f7fa', minHeight: '100vh', paddingTop: '1.5rem', paddingBottom: '2rem'}}>
  

      {/* ===== ERROR & LOADING MESSAGES ===== */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" style={{borderRadius: '8px', borderLeft: '4px solid #dc3545'}}>
          <AlertCircle size={18} className="me-2" style={{display: 'inline-block'}} />
          <strong>Error:</strong> {error}
        </div>
      )}
      {loading && (
        <div className="alert alert-info" style={{borderRadius: '8px', borderLeft: '4px solid #0066cc'}}>
          <Loader size={16} className="me-2 spinner-border spinner-border-sm" style={{display: 'inline-block'}} />
          Loading data...
        </div>
      )}

      {/* ===== IMPROVED CONTROLS SECTION - MADE SMALLER ===== */}
    <div className="row g-2 mb-3">
        <div className="col-lg-3">
          <div className="card border-0 shadow-sm h-100" style={{borderRadius: '8px', overflow: 'hidden'}}>
            <div className="card-body p-2">
              <label className="form-label fw-bold mb-1" style={{fontSize: '0.85rem', color: '#495057'}}>
                🎭 Operation Type
              </label>
              <div className="btn-group w-100" role="group" style={{fontSize: '0.75rem', marginBottom: '0.5rem'}}>
                <input type="radio" className="btn-check" name="operation" id="targetSetting" value="TARGET_SETTING" checked={operation === 'TARGET_SETTING'} onChange={(e) => setOperation(e.target.value)} />
                <label className="btn btn-outline-primary fw-semibold" htmlFor="targetSetting" style={{fontSize: '0.75rem', padding: '0.3rem 0.4rem', borderRadius: '6px 0 0 6px'}}>
                  🎯 Setting
                </label>
                
                <input type="radio" className="btn-check" name="operation" id="targetAchieved" value="TARGET_ACHIEVED" onChange={(e) => setOperation(e.target.value)} />
                <label className="btn btn-outline-success fw-semibold" htmlFor="targetAchieved" style={{fontSize: '0.75rem', padding: '0.3rem 0.4rem', borderRadius: '0 6px 6px 0'}}>
                  ✅ Achievement
                </label>
              </div>
              <div style={{
                fontSize: '0.8rem',
                padding: '0.5rem 0.6rem',
                backgroundColor: operation === 'TARGET_SETTING' ? '#fff3cd' : '#d4edda',
                borderRadius: '4px',
                color: operation === 'TARGET_SETTING' ? '#856404' : '#155724',
                border: operation === 'TARGET_SETTING' ? '1px solid #ffc107' : '1px solid #c3e6cb',
                fontWeight: '600',
                textAlign: 'center'
              }}>
                {operation === 'TARGET_SETTING' ? '🎯 Target Setting - FY 2026-2027' : '✅ Achievement Setting - FY 2025-2026'}
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-3">
          <div className="card border-0 shadow-sm h-100" style={{borderRadius: '8px', overflow: 'hidden'}}>
            <div className="card-body p-2">
              <label className="form-label fw-bold mb-1" style={{
                fontSize: '0.85rem',
                color: (!centrecode || centrecode.trim() === '') ? '#dc3545' : '#495057'
              }}>
                🏢 Centre Selection
                {(!centrecode || centrecode.trim() === '') && (
                  <span className="badge bg-danger ms-1" style={{fontSize: '0.65rem', padding: '0.25rem 0.4rem'}}>REQ</span>
                )}
              </label>
          {(String(assignedCentre).toUpperCase() === 'ALL' || Array.isArray(assignedCentre)) ? (
            <>
              <select
                className={`form-select form-select-sm ${(!centrecode || centrecode.trim() === '') ? 'is-invalid border-danger border-2' : ''}`}
                value={centrecode}
                onChange={(e) => {
                  const selectedCentre = e.target.value;
                  
                  if (!selectedCentre || selectedCentre.trim() === '') {
                    setTooltipError({
                      rowId: null,
                      field: 'centrecode',
                      message: '⚠️ Please select a centre before proceeding'
                    });
                    return;
                  }
                  
                  setTooltipError(null);
                  setCentrecode(selectedCentre);
                  
                  console.log(`📍 Centre changed to: ${selectedCentre}, Fetching saved data...`);
                  
                  fetchSavedRowsForCentre(selectedCentre, selectedFY).then(savedRows => {
                    console.log(`🔄 Setting rows with ${savedRows.length} saved rows`);
                    
                    setRows(prev => {
                      const templateRows = prev.filter(r => !r.isSaved);
                      const newRows = [...savedRows, ...templateRows];
                      console.log(`📋 Total rows after centre change: ${newRows.length} (${savedRows.length} saved + ${templateRows.length} template)`);
                      return newRows;
                    });
                  });
                }}
                style={{
                  fontSize: '0.8rem',
                  borderWidth: (!centrecode || centrecode.trim() === '') ? '2px' : '1px',
                  backgroundColor: (!centrecode || centrecode.trim() === '') ? '#fff5f5' : '#fff',
                  padding: '0.4rem'
                }}
              >
                <option value="">🔴 SELECT...</option>
                {Array.isArray(assignedCentre)
                  ? centres
                      .filter(c => assignedCentre.includes(c.centrecode))
                      .map(c => (
                        <option key={c.centrecode} value={c.centrecode}>
                          {`${c.centreshortname} - ${c.centrelongname}`}
                        </option>
                      ))
                  : centres.map(c => (
                      <option key={c.centrecode} value={c.centrecode}>
                        {`${c.centreshortname} - ${c.centrelongname}`}
                      </option>
                    ))}
              </select>
              {tooltipError?.field === 'centrecode' && (
                <div className="invalid-feedback d-block" style={{color: '#dc3545', fontSize: '0.7rem', marginTop: '0.15rem', fontWeight: 'bold'}}>
                  {tooltipError.message}
                </div>
              )}
            </>
          ) : (
            <div style={{fontSize: '0.8rem', padding: '0.35rem', backgroundColor: '#d4edda', borderRadius: '4px', color: '#155724'}}>
              <strong>✅ {centrecode}</strong>
            </div>
          )}
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card border-0 shadow-sm h-100" style={{borderRadius: '8px', overflow: 'hidden', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f7ff 100%)'}}>
            <div className="card-body p-2">
              <label className="form-label fw-bold mb-2" style={{fontSize: '0.85rem', color: '#495057', display: 'block'}}>
                📊 Data Status
              </label>
              
              {/* Entry Stage Row */}
              <div style={{marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #b3d9ff'}}>
                <div style={{fontSize: '0.75rem', fontWeight: 'bold', color: '#0066cc', marginBottom: '0.4rem'}}>
                  🔹 Entry Stage
                </div>
                <div style={{fontSize: '0.7rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                  <span className="badge bg-primary" style={{fontSize: '0.65rem', padding: '0.25rem 0.4rem'}}>
                    📝 Saved: {rows.filter(r => r.isSaved).length}
                  </span>
                  <span className="badge bg-warning" style={{fontSize: '0.65rem', padding: '0.25rem 0.4rem'}}>
                    ⚠️ Rejected: {rows.filter(r => r.statuscode === 'REJECTED').length}
                  </span>
                  <span className="badge bg-success" style={{fontSize: '0.65rem', padding: '0.25rem 0.4rem'}}>
                    ✓ Approved: {rows.filter(r => r.statuscode === 'APPROVED').length}
                  </span>
                </div>
              </div>

              {/* Review Stage Row */}
              <div style={{marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #b3d9ff'}}>
                <div style={{fontSize: '0.75rem', fontWeight: 'bold', color: '#0066cc', marginBottom: '0.4rem'}}>
                  🔹 Review Stage
                </div>
                <div style={{fontSize: '0.7rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                  <span className="badge bg-info" style={{fontSize: '0.65rem', padding: '0.25rem 0.4rem'}}>
                    👁️ Review: {rows.filter(r => r.approvalStatus === 'PENDING').length}
                  </span>
                  <span className="badge bg-secondary" style={{fontSize: '0.65rem', padding: '0.25rem 0.4rem'}}>
                    ❓ Clarification: 0
                  </span>
                  <span className="badge bg-success" style={{fontSize: '0.65rem', padding: '0.25rem 0.4rem'}}>
                    ✅ Sanctioned: {rows.filter(r => r.approvalStatus === 'APPROVED').length}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                className="btn btn-primary fw-bold w-100"
                onClick={() => validateAndSubmitAllData()}
                disabled={!centrecode || centrecode.trim() === '' || loading || isFormSubmitted}
                style={{
                  fontSize: '0.75rem',
                  padding: '0.3rem',
                  borderRadius: '4px',
                  backgroundColor: (!centrecode || centrecode.trim() === '' || isFormSubmitted) ? '#ccc' : '#0066cc',
                  border: 'none',
                  cursor: (!centrecode || centrecode.trim() === '' || isFormSubmitted) ? 'not-allowed' : 'pointer',
                  opacity: isFormSubmitted ? 0.6 : 1
                }}
                title={isFormSubmitted ? '🔒 Form already submitted' : ''}
              >
                {isFormSubmitted ? '🔒 Completed' : loading ? 'Submitting...' : '✅ Submit'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== DATA ENTRY TABLE ===== */}
      <div className={`card border-0 shadow-lg mb-4 ${(!centrecode || centrecode.trim() === '') ? 'opacity-50' : ''}`} style={{pointerEvents: (!centrecode || centrecode.trim() === '') ? 'none' : 'auto', borderRadius: '12px', overflow: 'hidden'}}>
        <div className="card-header" style={{background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)', color: 'white', borderBottom: 'none'}}>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0" style={{fontSize: '1.1rem', fontWeight: '700'}}>
              📊 Target Settings Management
            </h5>
            <small style={{opacity: '0.9', fontSize: '0.85rem'}}>
              Click on objectives to expand entries
            </small>
          </div>
        </div>

        <div className="card-body p-0">
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

              <div className="table-responsive" style={{overflowX: 'auto', overflowY: 'auto', maxHeight: '600px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'}}>
                <table className="table table-hover table-sm enhanced-table" style={{width: '100%', marginBottom: 0}}>
                  <thead className="sticky-table-header" style={{position: 'sticky', top: 0, zIndex: 200, boxShadow: '0 6px 15px rgba(0, 0, 0, 0.2)'}}>
                    <tr style={{
                      background: 'linear-gradient(135deg, #f0f4f8 0%, #e8ecf1 100%)',
                      borderBottom: '3px solid #0066cc',
                      boxShadow: '0 2px 6px rgba(0, 102, 204, 0.1)'
                    }}>
                      <th width="18%" style={{
                        textAlign: 'center',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        padding: '0.75rem 0.5rem',
                        color: '#0066cc',
                        letterSpacing: '0.5px'
                      }}>📋 Action Code</th>
                      <th width="11%" style={{
                        textAlign: 'center',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        padding: '0.75rem 0.5rem',
                        color: '#0066cc',
                        letterSpacing: '0.5px'
                      }}>🎯 Success Indicator</th>
                      <th width="2%" style={{
                        textAlign: 'center',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        padding: '0.75rem 0.3rem',
                        color: '#0066cc',
                        letterSpacing: '0.5px'
                      }}>⚖️ Type</th>
                      <th width="2%" style={{
                        textAlign: 'center',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        padding: '0.75rem 0.3rem',
                        color: '#0066cc',
                        letterSpacing: '0.5px'
                      }}>📊 Weight</th>
                      <th width="8%" style={{
                        textAlign: 'center',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        padding: '0.5rem 0.3rem',
                        backgroundColor: '#d4e9ff',
                        color: '#004db3',
                        borderRadius: '6px 0 0 0',
                        letterSpacing: '0.5px'
                      }}>⭐ Excellent</th>
                      <th width="8%" style={{
                        textAlign: 'center',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        padding: '0.5rem 0.3rem',
                        backgroundColor: '#d4e9ff',
                        color: '#004db3',
                        letterSpacing: '0.5px'
                      }}>📈 Very Good</th>
                      <th width="8%" style={{
                        textAlign: 'center',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        padding: '0.5rem 0.3rem',
                        backgroundColor: '#d4e9ff',
                        color: '#004db3',
                        letterSpacing: '0.5px'
                      }}>✓ Good</th>
                      <th width="8%" style={{
                        textAlign: 'center',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        padding: '0.5rem 0.3rem',
                        backgroundColor: '#d4e9ff',
                        color: '#004db3',
                        letterSpacing: '0.5px'
                      }}>⬇️ Fair</th>
                      <th width="8%" style={{
                        textAlign: 'center',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        padding: '0.5rem 0.3rem',
                        backgroundColor: '#d4e9ff',
                        color: '#004db3',
                        borderRadius: '0 6px 0 0',
                        letterSpacing: '0.5px'
                      }}>❌ Poor</th>
                      <th width="16%" style={{
                        textAlign: 'center',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        padding: '0.75rem 0.4rem',
                        backgroundColor: '#e6f4ff',
                        color: '#0066cc',
                        letterSpacing: '0.5px'
                      }}>⚙️ Actions</th>
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
                      // Filter rows for this objective
                      let objEntries = rows.filter(r => r.objectCode === obj.objectivecode);
                      
                      // For SINGLE-ENTRY objectives (multipleentries = 'No'):
                      // If there's already a saved row with same action + successindicator, don't show duplicates
                      const isSingleEntry = obj.multipleentries !== 'Yes';
                      if (isSingleEntry) {
                        const savedRows = objEntries.filter(r => r.isSaved);
                        if (savedRows.length > 0) {
                          // For each saved row, exclude unsaved/template rows with same action + SI codes
                          objEntries = objEntries.filter(r => {
                            // Keep all saved rows
                            if (r.isSaved) return true;
                            // For unsaved rows, exclude if there's a saved row with same action + SI
                            const hasSavedDuplicate = savedRows.some(saved => 
                              saved.actionCode === r.actionCode && 
                              saved.successIndicatorCode === r.successIndicatorCode
                            );
                            return !hasSavedDuplicate;
                          });
                        }
                      }
                      
                      // If form is submitted (T02), show ONLY saved rows (no empty templates)
                      if (isFormSubmitted) {
                        objEntries = objEntries.filter(r => r.isSaved);
                      }
                      
                      const defaultWeight = weights[obj.objectivecode];
                      const allowsMultiple = obj.multipleentries === 'Yes';

                      return (
                        <React.Fragment key={`group_${obj.objectivecode}`}>
                          {/* Objective header row - COLLAPSIBLE */}
                          <tr 
                            className="table-info" 
                            style={{
                              background: 'linear-gradient(90deg, #e7f3ff 0%, #f0f8ff 100%)',
                              cursor: 'pointer',
                              height: '60px',
                              borderLeft: '4px solid #0066cc',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(90deg, #d4e9ff 0%, #e3f2fd 100%)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(90deg, #e7f3ff 0%, #f0f8ff 100%)'}
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
                                      {obj.mandatory === 'HQ' && centrecode === '13' && <span className="badge bg-danger">MANDATORY (HQ)</span>}
                                      {obj.mandatory === 'HQ' && centrecode !== '13' && <span className="badge bg-info">HQ ONLY</span>}
                                    </div>
                                  </div>
                                </div>
                                <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                                  {totalWeights[obj.objectivecode] && (
                                    <span className="badge bg-success" style={{
                                      fontSize: '0.85rem', 
                                      padding: '0.5rem 0.75rem',
                                      animation: 'pulse 0.5s ease-in-out'
                                    }}>
                                      📊 Total Weight: <strong>{totalWeights[obj.objectivecode]}</strong>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>

                          {/* Entry rows - only show if expanded */}
                          {expandedObjectives[obj.objectivecode] && objEntries.map(row => {
                            const status = row.statuscode || 'T01';
                            const statusInfo = getRowStatusInfo(status);
                            const rowBgColor = statusInfo.color;
                            const rowBorderColor = statusInfo.borderColor;
                            const hoverBgColor = status === 'T04' ? '#c8e6c9' : status === 'T02' ? '#ffe6b3' : status === 'T03' ? '#ffcccc' : '#f0f8ff';
                            
                            return (
                            <React.Fragment key={row.id}>
                              {/* SINGLE ROW: ALL DATA + PERFORMANCE + ACTIONS (11 columns) */}
                              <tr 
                                className={row.isSaved ? 'bg-success bg-opacity-10' : 'bg-light'} 
                                style={{
                                  borderLeft: `5px solid ${rowBorderColor}`,
                                  height: '40px',
                                  fontWeight: row.isSaved ? '500' : 'normal',
                                  transition: 'background-color 0.2s ease',
                                  backgroundColor: rowBgColor,
                                  position: 'relative'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = hoverBgColor;
                                  // Show rejection tooltip for T03 on hover
                                  if (status === 'T03') {
                                    const tooltip = e.currentTarget.querySelector('[data-rejection-tooltip]');
                                    if (tooltip) tooltip.style.display = 'block';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = rowBgColor;
                                  // Hide rejection tooltip for T03
                                  if (status === 'T03') {
                                    const tooltip = e.currentTarget.querySelector('[data-rejection-tooltip]');
                                    if (tooltip) tooltip.style.display = 'none';
                                  }
                                }}
                              >
                                {/* T03 Rejection Message Tooltip */}
                                {status === 'T03' && (
                                  <div 
                                    data-rejection-tooltip
                                    style={{
                                      position: 'absolute',
                                      top: '-40px',
                                      left: '50%',
                                      transform: 'translateX(-50%)',
                                      backgroundColor: '#dc3545',
                                      color: 'white',
                                      padding: '8px 12px',
                                      borderRadius: '4px',
                                      fontSize: '0.8rem',
                                      fontWeight: '600',
                                      whiteSpace: 'nowrap',
                                      zIndex: 500,
                                      pointerEvents: 'none',
                                      display: 'none',
                                      boxShadow: '0 2px 8px rgba(220, 53, 69, 0.3)',
                                      textAlign: 'center'
                                    }}
                                  >
                                    ⚠️ Sent for Resubmission - Review and Update
                                  </div>
                                )}
                                {/* ACTION CODE */}
                                <td colSpan="1" style={{verticalAlign: 'middle', padding: '0.2rem', backgroundColor: '#f8f9fa', borderTop: tooltipError?.rowId === row.id && tooltipError?.field === 'actionCode' ? '3px solid #dc3545' : 'none'}}>
                                  <div style={{position: 'relative'}}>
                                    {row.isSaved && !row.isEditing ? (
                                      <small>{row.actionName || row.actionCode || '-'}</small>
                                    ) : row.isEditing && row.multipleEntries ? (
                                      <CreatableSelect
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
                                          showConfirmAlert(
                                            'Add New Action?',
                                            `Are you sure you want to add this action?\n\n"${inputValue}"`
                                          ).then((result) => {
                                            if (result.isConfirmed) {
                                              saveInlineAction(row.id, row.objectCode, inputValue);
                                            }
                                          });
                                        }}
                                        isClearable={false}
                                        isDisabled={row.isSaved && !row.isEditing || isFormSubmitted}
                                        classNamePrefix="react-select"
                                        styles={{
                                          control: (base) => ({
                                            ...base,
                                            fontSize: '0.95rem',
                                            minHeight: '32px',
                                            height: '32px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: '500',
                                            backgroundColor: '#fff'
                                          }),
                                          placeholder: (base) => ({
                                            ...base,
                                            fontSize: '0.95rem',
                                            display: 'none'
                                          }),
                                          input: (base) => ({
                                            ...base,
                                            fontSize: '0.95rem',
                                            textAlign: 'center',
                                            width: '100%',
                                            fontWeight: '500',
                                            margin: 0,
                                            padding: 0
                                          }),
                                          option: (base, state) => ({
                                            ...base,
                                            fontSize: '0.95rem',
                                            fontWeight: '500',
                                            backgroundColor: state.isSelected ? '#0066cc' : state.isFocused ? '#e6f4ff' : 'white',
                                            color: state.isSelected ? 'white' : '#333'
                                          }),
                                          singleValue: (base) => ({
                                            ...base,
                                            fontSize: '0.95rem',
                                            fontWeight: '500',
                                            color: '#333'
                                          }),
                                          indicatorSeparator: (base) => ({
                                            ...base,
                                            display: 'none'
                                          }),
                                          dropdownIndicator: (base) => ({
                                            ...base,
                                            display: 'none'
                                          }),
                                          menu: (base) => ({
                                            ...base,
                                            zIndex: 150
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
                                        className="form-select form-select-sm form-control-modern"
                                        value={row.successIndicatorCode || ''}
                                        onChange={(e) => {
                                          const siCode = e.target.value;
                                          if (siCode) {
                                            handleSIChange(row.id, row.objectCode, row.actionCode, siCode);
                                          }
                                        }}
                                        disabled={!isCentreLocked() || (row.isSaved && !row.isEditing) || isFormSubmitted}
                                        style={{
                                          fontSize: '0.75rem',
                                          padding: '0.35rem',
                                          borderRadius: '4px',
                                          border: '1px solid #ddd',
                                          backgroundColor: (row.isSaved && !row.isEditing) || isFormSubmitted ? '#f0f0f0' : '#fff',
                                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                          cursor: !isCentreLocked() || (row.isSaved && !row.isEditing) || isFormSubmitted ? 'not-allowed' : 'pointer',
                                          opacity: (row.isSaved && !row.isEditing) || isFormSubmitted ? 0.6 : 1
                                        }}
                                      >
                                        <option value="">Select Success Indicator</option>
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
                                      className="form-select form-select-sm form-control-modern"
                                      value={row.selectedWeightType || ''}
                                      onChange={(e) => handleWeightTypeChange(row.id, e.target.value)}
                                      disabled={row.unitPreferred === 'Fixed' || row.multipleEntries || !isCentreLocked()}
                                      style={{
                                        fontSize: '0.85rem',
                                        padding: '0.45rem',
                                        borderRadius: '4px',
                                        border: '1px solid #ddd',
                                        backgroundColor: (row.unitPreferred === 'Fixed' || row.multipleEntries || !isCentreLocked()) ? '#f0f0f0' : '#fff',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                        cursor: (row.unitPreferred === 'Fixed' || row.multipleEntries || !isCentreLocked()) ? 'not-allowed' : 'pointer',
                                        appearance: 'none',
                                        backgroundImage: 'none',
                                        paddingRight: '0.75rem'
                                      }}
                                    >
                                      <option value="">Select Type...</option>
                                      <option value="DATE">📅 Date</option>
                                      <option value="PERCENTAGE">📊 Percentage</option>
                                      <option value="NUMBER">🔢 Number</option>
                                    </select>
                                  ) : (
                                    <small style={{fontWeight: '600', color: '#0066cc'}}>
                                      {row.selectedWeightType === 'DATE' ? '📅 Date' : 
                                       row.selectedWeightType === 'PERCENTAGE' ? '📊 Percentage' : 
                                       row.selectedWeightType === 'NUMBER' ? '🔢 Number' : 
                                       '—'}
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
                                <td colSpan="1" style={{verticalAlign: 'middle', padding: '0.25rem', backgroundColor: '#f0f8ff', minWidth: '180px'}} title={status === 'T03' && row.approvalRemarks ? `📋 ${row.approvalRemarks}` : ''}>
                                  <div style={{display: 'flex', gap: '0.2rem', justifyContent: 'center', alignItems: 'center', flexWrap: 'nowrap', width: '100%', overflow: 'hidden', position: 'relative'}}>
                                    {/* SAVE BUTTON - For T01 status */}
                                    {status !== 'T03' && (
                                      <button 
                                        className="btn btn-sm"
                                        onClick={() => saveRow(row)}
                                        disabled={!row.isEditing || loading}
                                        title="Save changes"
                                        style={{
                                          fontSize: '0.65rem',
                                          padding: '0.25rem 0.35rem',
                                          minWidth: '24px',
                                          flex: '0 0 auto',
                                          backgroundColor: row.isEditing ? '#28a745' : '#e9ecef',
                                          border: 'none',
                                          color: row.isEditing ? 'white' : '#999',
                                          borderRadius: '4px',
                                          cursor: row.isEditing ? 'pointer' : 'not-allowed',
                                          transition: 'all 0.2s ease',
                                          fontWeight: '600'
                                        }}
                                        onMouseEnter={(e) => {
                                          if (row.isEditing) {
                                            e.currentTarget.style.backgroundColor = '#20c997';
                                            e.currentTarget.style.boxShadow = '0 2px 6px rgba(40, 167, 69, 0.3)';
                                          }
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.backgroundColor = row.isEditing ? '#28a745' : '#e9ecef';
                                          e.currentTarget.style.boxShadow = 'none';
                                        }}
                                      >
                                        {loading ? (
                                          <Loader size={10} className="spinner-border spinner-border-sm" />
                                        ) : (
                                          <CheckCircle size={11} />
                                        )}
                                      </button>
                                    )}

                                    {/* RE-SUBMIT BUTTON - Only for T03 status (Rejected rows) */}
                                    {/* Initially disabled, enables when row is edited and has changes */}
                                    {status === 'T03' && (
                                      <button 
                                        className="btn btn-sm"
                                        onClick={() => resubmitRejectedRow(row)}
                                        disabled={!row.isEditing || !row.hasChanges || loading}
                                        title={!row.isEditing ? "Click Edit to modify this entry" : !row.hasChanges ? "Make changes to enable resubmit" : "Resubmit for approval"}
                                        style={{
                                          fontSize: '0.65rem',
                                          padding: '0.25rem 0.35rem',
                                          minWidth: '24px',
                                          flex: '0 0 auto',
                                          backgroundColor: (row.isEditing && row.hasChanges && !loading) ? '#ff6600' : '#e9ecef',
                                          border: 'none',
                                          color: (row.isEditing && row.hasChanges && !loading) ? 'white' : '#999',
                                          borderRadius: '4px',
                                          cursor: (row.isEditing && row.hasChanges && !loading) ? 'pointer' : 'not-allowed',
                                          transition: 'all 0.2s ease',
                                          fontWeight: '600',
                                          boxShadow: (row.isEditing && row.hasChanges && !loading) ? '0 2px 4px rgba(255, 102, 0, 0.3)' : 'none',
                                          opacity: (!row.isEditing || !row.hasChanges) ? 0.6 : 1
                                        }}
                                        onMouseEnter={(e) => {
                                          if (row.isEditing && row.hasChanges && !loading) {
                                            e.currentTarget.style.backgroundColor = '#ff5500';
                                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(255, 102, 0, 0.5)';
                                            e.currentTarget.style.transform = 'translateY(-1px)';
                                          }
                                        }}
                                        onMouseLeave={(e) => {
                                          if (row.isEditing && row.hasChanges && !loading) {
                                            e.currentTarget.style.backgroundColor = '#ff6600';
                                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(255, 102, 0, 0.3)';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                          }
                                        }}
                                      >
                                        {loading ? (
                                          <Loader size={10} className="spinner-border spinner-border-sm" />
                                        ) : (
                                          <UploadCloud size={11} />
                                        )}
                                      </button>
                                    )}
                                    
                                    {/* ADD ENTRY BUTTON - Only show after row is saved - HIGHLIGHTED */}
                                    {row.multipleEntries && row.isSaved && getLastRowForObjective(row.objectCode)?.id === row.id && (
                                      <button 
                                        className="btn btn-sm"
                                        onClick={() => addNewEntryForObjective(row.objectCode)}
                                        disabled={loading || isFormSubmitted}
                                        title={isFormSubmitted ? "Form is locked - Cannot add entries" : "Add new entry"}
                                        style={{
                                          fontSize: '0.65rem',
                                          padding: '0.25rem 0.4rem',
                                          minWidth: '28px',
                                          flex: '0 0 auto',
                                          fontWeight: '700',
                                          background: isFormSubmitted ? '#ccc' : 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                                          color: isFormSubmitted ? '#666' : 'white',
                                          border: 'none',
                                          borderRadius: '5px',
                                          boxShadow: isFormSubmitted ? 'none' : '0 2px 8px rgba(40, 167, 69, 0.4)',
                                          animation: isFormSubmitted ? 'none' : 'pulse 2s infinite',
                                          cursor: isFormSubmitted ? 'not-allowed' : 'pointer',
                                          borderRadius: '4px',
                                          transition: 'all 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(40, 167, 69, 0.6)';
                                          e.currentTarget.style.transform = 'translateY(-1px)';
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(40, 167, 69, 0.4)';
                                          e.currentTarget.style.transform = 'translateY(0)';
                                        }}
                                      >
                                        <Plus size={11} />
                                      </button>
                                    )}
                                    
                                    {/* EDIT BUTTON */}
                                    <button 
                                      className="btn btn-sm"
                                      onClick={() => requestEditRow(row.id)}
                                      disabled={!row.isSaved || row.isEditing || loading || areButtonsDisabled(status)}
                                      title={areButtonsDisabled(status) ? `Cannot edit - ${getRowStatusInfo(status).description}` : "Edit this entry"}
                                      style={{
                                        fontSize: '0.65rem',
                                        padding: '0.25rem 0.35rem',
                                        minWidth: '24px',
                                        flex: '0 0 auto',
                                        backgroundColor: row.isSaved && !row.isEditing && !areButtonsDisabled(status) ? '#0066cc' : '#e9ecef',
                                        color: row.isSaved && !row.isEditing && !areButtonsDisabled(status) ? 'white' : '#999',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: row.isSaved && !row.isEditing && !areButtonsDisabled(status) ? 'pointer' : 'not-allowed',
                                        transition: 'all 0.2s ease',
                                        fontWeight: '600',
                                        opacity: areButtonsDisabled(status) ? 0.6 : 1
                                      }}
                                      onMouseEnter={(e) => {
                                        if (row.isSaved && !row.isEditing && !areButtonsDisabled(status)) {
                                          e.currentTarget.style.backgroundColor = '#004da3';
                                          e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 102, 204, 0.3)';
                                          if (status === 'T03' && row.approvalRemarks) {
                                            const tooltip = e.currentTarget.parentElement.querySelector('.rejection-tooltip');
                                            if (tooltip) tooltip.style.opacity = '1';
                                          }
                                        }
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = row.isSaved && !row.isEditing && !areButtonsDisabled(status) ? '#0066cc' : '#e9ecef';
                                        e.currentTarget.style.boxShadow = 'none';
                                        if (status === 'T03' && row.approvalRemarks) {
                                          const tooltip = e.currentTarget.parentElement.querySelector('.rejection-tooltip');
                                          if (tooltip) tooltip.style.opacity = '0';
                                        }
                                      }}
                                    >
                                      <Edit size={10} />
                                    </button>
                                    
                                    {/* DELETE BUTTON - Only for Multi-Entry Objectives */}
                                    {row.multipleEntries && (
                                      <button 
                                        className="btn btn-sm"
                                        onClick={() => requestDeleteRow(row.id)}
                                        disabled={!row.isSaved || row.hasChanges || loading || areButtonsDisabled(status)}
                                        title={areButtonsDisabled(status) ? `Cannot delete - ${getRowStatusInfo(status).description}` : "Delete this entry"}
                                        style={{
                                          fontSize: '0.65rem',
                                          padding: '0.25rem 0.35rem',
                                          minWidth: '24px',
                                          flex: '0 0 auto',
                                          backgroundColor: row.isSaved && !row.hasChanges && !areButtonsDisabled(status) ? '#dc3545' : '#e9ecef',
                                          color: row.isSaved && !row.hasChanges && !areButtonsDisabled(status) ? 'white' : '#999',
                                          border: 'none',
                                          borderRadius: '4px',
                                          cursor: row.isSaved && !row.hasChanges && !areButtonsDisabled(status) ? 'pointer' : 'not-allowed',
                                          transition: 'all 0.2s ease',
                                          fontWeight: '600',
                                          opacity: areButtonsDisabled(status) ? 0.6 : 1
                                        }}
                                        onMouseEnter={(e) => {
                                          if (row.isSaved && !row.hasChanges && !areButtonsDisabled(status)) {
                                            e.currentTarget.style.backgroundColor = '#c82333';
                                            e.currentTarget.style.boxShadow = '0 2px 6px rgba(220, 53, 69, 0.3)';
                                          }
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.backgroundColor = row.isSaved && !row.hasChanges && !areButtonsDisabled(status) ? '#dc3545' : '#e9ecef';
                                          e.currentTarget.style.boxShadow = 'none';
                                        }}
                                      >
                                        <Trash2 size={10} />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>

                              {/* ROW 2 DELETED: All content merged into single row */}
                            </React.Fragment>
                            );
                          })}
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
      <div className="card border-0 shadow-sm mb-4" style={{borderRadius: '10px', borderLeft: '5px solid #0066cc', overflow: 'hidden'}}>
        <div className="card-body">
          <h6 className="fw-bold mb-3" style={{fontSize: '1rem', color: '#0066cc'}}>📌 Quick Start Guide:</h6>
          <div className="row">
            <div className="col-md-6">
              <ol style={{fontSize: '0.9rem', lineHeight: '1.8'}}>
                <li><strong style={{color: '#dc3545', fontSize: '1rem'}}>🔴 Step 1:</strong> Select Centre - <span style={{color: '#666'}}>MANDATORY! Data entry is disabled until you select a centre</span></li>
                <li><strong style={{color: '#0066cc'}}>🎯 Step 2:</strong> Click on an objective to expand it and see entries</li>
                <li><strong style={{color: '#0066cc'}}>➕ Step 3:</strong> For multi-entry objectives, use "Add Entry" button after saving first entry</li>
                <li><strong style={{color: '#0066cc'}}>💾 Step 4:</strong> Fill in all required fields (Action Code, Success Indicator, Excellent)</li>
                <li><strong style={{color: '#28a745'}}>✅ Step 5:</strong> Click "Save" button to freeze and save the row</li>
              </ol>
            </div>
            <div className="col-md-6">
              <div style={{backgroundColor: '#f0f8ff', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem'}}>
                <h6 style={{color: '#0066cc', fontWeight: '600', marginBottom: '0.75rem'}}>💡 Important Tips:</h6>
                <ul style={{fontSize: '0.85rem', marginBottom: 0}}>
                  <li>✓ <strong>Excellent</strong> field is MANDATORY</li>
                  <li>✓ Other performance levels are OPTIONAL</li>
                  <li>✓ Dates must be in <strong>dd/mm/yyyy</strong> format</li>
                  <li>✓ For DATE: earlier dates = higher performance</li>
                  <li>✓ For NUMBER/%-: higher values = higher performance</li>
                  <li>✓ Use <strong>Edit</strong> button to modify saved rows</li>
                  <li>✓ Use <strong>Delete</strong> button only for multi-entry objectives</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== API REFERENCE ===== */}
      <div className="card border-0 shadow-sm mb-4" style={{borderRadius: '10px', borderLeft: '5px solid #6c757d', overflow: 'hidden'}}>
        <div className="card-body">
          <h6 className="fw-bold mb-3" style={{fontSize: '1rem', color: '#6c757d'}}>🔗 Backend API Endpoints:</h6>
          <div className="row">
            <div className="col-md-6">
              <small className="text-muted d-block mb-2" style={{fontSize: '0.8rem', fontWeight: 'bold'}}>READ ENDPOINTS:</small>
              <ul className="mb-0" style={{fontSize: '0.8rem'}}>
                <li><code>GET /api/objectives</code></li>
                <li><code>GET /api/actions/objective/{'{id}'}</code></li>
                <li><code>GET /api/successindicator/success/{'{id}'}</code></li>
                <li><code>GET /api/objectives/getWeights/{'{id}'}</code></li>
                <li><code>GET /api/targets</code></li>
                <li><code>GET /api/centres</code></li>
              </ul>
            </div>
            <div className="col-md-6">
              <small className="text-muted d-block mb-2" style={{fontSize: '0.8rem', fontWeight: 'bold'}}>WRITE ENDPOINTS:</small>
              <ul className="mb-0" style={{fontSize: '0.8rem'}}>
                <li><code>POST /api/targets</code> - <strong style={{color: '#28a745'}}>Create</strong></li>
                <li><code>PATCH /api/targets/{'{...paths}'}</code> - <strong style={{color: '#0066cc'}}>Update</strong></li>
                <li><code>DELETE /api/targets/{'{...paths}'}</code> - <strong style={{color: '#dc3545'}}>Delete</strong></li>
                <li><code>POST /api/actions/auto</code> - <strong style={{color: '#28a745'}}>Auto-generate codes</strong></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ===== CONFIRMATION MODAL - DELETE ONLY ===== */}


    </div>
  );
};

export default OperationsTargetSettingPage;