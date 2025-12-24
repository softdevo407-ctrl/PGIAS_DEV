# 🔧 REFACTORING EXAMPLE - How to Extract Functions into Separate Files

## The Problem: All Functions in One Page ❌

Before refactoring, **OperationsTargetSettingPage.jsx has 2000+ lines** with ALL functions mixed together:

```javascript
// ❌ BAD - Everything in one file
const OperationsTargetSettingPage = () => {
  const fetchCentres = async () => { /* 10 lines */ };
  const fetchObjectives = async () => { /* 10 lines */ };
  const fetchActions = async (objectCode) => { /* 10 lines */ };
  const fetchSuccessIndicators = async (objectCode, actionCode) => { /* 10 lines */ };
  const fetchWeights = async (objectCode) => { /* 10 lines */ };
  const saveRow = async (row) => { /* 50 lines */ };
  const deleteRow = async (row) => { /* 30 lines */ };
  const validatePerformanceLevels = (row) => { /* 20 lines */ };
  const formatDateDDMMYYYY = (dateStr) => { /* 5 lines */ };
  // ... 1900+ more lines ...
  return <div> {/* UI JSX */} </div>;
};
```

**Problems:**
- 🔴 **Hard to debug** - Where is the bug? In fetchCentres or saveRow?
- 🔴 **Hard to test** - Can't test functions without rendering the component
- 🔴 **Duplicated code** - Same logic repeated in multiple pages
- 🔴 **Messy** - Business logic mixed with UI logic

---

## The Solution: Separate Services Layer ✅

After refactoring, functions are extracted into **organized service files**:

```javascript
// ✅ GOOD - Clean separation of concerns
const OperationsTargetSettingPage = () => {
  // Import services - not the functions!
  import * as centreService from '../services/centreService';
  import * as objectiveService from '../services/objectiveService';
  import * as actionService from '../services/actionService';
  
  // Page ONLY handles UI - delegates to services
  return <div> {/* UI JSX only */} </div>;
};
```

---

## Step-by-Step: How to Extract Functions

### Example 1: Extract `fetchCentres` → `centreService.js`

#### BEFORE (In page):
```javascript
const OperationsTargetSettingPage = () => {
  const fetchCentres = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/centres');
      if (!res.ok) throw new Error('Failed to fetch centres');
      const data = await res.json();
      console.log('✅ Fetched Centres:', data);
      setCentres(data || []);
    } catch (err) {
      console.error('Failed to load centres:', err);
      setCentres([]);
    }
  };

  useEffect(() => {
    fetchCentres();
  }, []);
};
```

#### AFTER (In service file `src/services/centreService.js`):
```javascript
/**
 * centreService.js - All centre-related API calls
 * Easy to debug! Each function in its own file.
 */

export const getAllCentres = async () => {
  try {
    console.log('🔍 API Call: GET /api/centres');
    const response = await fetch('http://localhost:8080/api/centres');
    
    if (!response.ok) {
      throw new Error('Failed to fetch centres');
    }
    
    const data = await response.json();
    console.log('✅ Fetched Centres:', data);
    return data;
  } catch (err) {
    console.error('❌ Error in centreService.getAllCentres():', err);
    throw err;
  }
};

export const findCentreByCode = (centres, code) => {
  return centres.find(c => c.centrecode === code);
};

export const isHQCentre = (centre) => {
  return centre.centrecode === '13' || centre.centreshortname === 'HQ';
};
```

#### AFTER (In refactored page):
```javascript
import * as centreService from '../services/centreService';

const OperationsTargetSettingPage = () => {
  const [centres, setCentres] = useState([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Just call the service - it handles the API call!
      const centresData = await centreService.getAllCentres();
      setCentres(centresData);
    } catch (err) {
      console.error('Failed to load centres:', err);
    }
  };
};
```

**Benefits:**
- ✅ `centreService.getAllCentres()` is **reusable in ALL pages**
- ✅ Easy to **debug** - Look in `src/services/centreService.js`
- ✅ Easy to **test** - Can test without rendering component
- ✅ Easy to **modify** - Change the API URL in one place, affects all pages

---

### Example 2: Extract `validatePerformanceLevels` → `utils/validators.js`

#### BEFORE (In page):
```javascript
const OperationsTargetSettingPage = () => {
  const validatePerformanceLevels = (row) => {
    const performanceLevels = [
      { name: 'Excellent', value: row.excellent, key: 'excellent' },
      { name: 'Very Good', value: row.veryGood, key: 'veryGood' },
      { name: 'Good', value: row.good, key: 'good' },
      { name: 'Fair', value: row.fair, key: 'fair' },
      { name: 'Poor', value: row.poor, key: 'poor' }
    ];

    if (!row.excellent && row.excellent !== 0) {
      return {
        isValid: false,
        field: 'excellent',
        message: '📊 Excellent value is MANDATORY'
      };
    }

    const enteredLevels = performanceLevels.filter(level => level.value !== null && level.value !== '');
    if (enteredLevels.length < 2) {
      return { isValid: true };
    }

    const weightType = row.selectedWeightType || 'NUMBER';
    // ... 30 more lines of validation logic ...
    
    return { isValid: true };
  };
};
```

#### AFTER (In `src/utils/validators.js`):
```javascript
/**
 * validators.js - All validation functions
 * Pure functions - no state, no side effects
 */

export const validatePerformanceLevels = (row) => {
  const performanceLevels = [
    { name: 'Excellent', value: row.excellent, key: 'excellent' },
    { name: 'Very Good', value: row.veryGood, key: 'veryGood' },
    { name: 'Good', value: row.good, key: 'good' },
    { name: 'Fair', value: row.fair, key: 'fair' },
    { name: 'Poor', value: row.poor, key: 'poor' }
  ];

  // Excellent is MANDATORY
  if (!row.excellent && row.excellent !== 0) {
    return {
      isValid: false,
      field: 'excellent',
      message: '📊 Excellent value is MANDATORY'
    };
  }

  // Rest of validation...
  return { isValid: true };
};

export const validateRow = (row, objectives) => {
  // Another validation function
  return { isValid: true, field: null, message: null };
};
```

#### AFTER (In refactored page):
```javascript
import { validatePerformanceLevels } from '../utils/validators';

const OperationsTargetSettingPage = () => {
  const handleSaveRow = (row) => {
    // Just call the validator!
    const validation = validatePerformanceLevels(row);
    
    if (!validation.isValid) {
      setTooltipError({
        rowId: row.id,
        field: validation.field,
        message: validation.message
      });
      return;
    }
    
    // Save row...
  };
};
```

**Benefits:**
- ✅ `validatePerformanceLevels()` is a **pure function** - easy to unit test!
- ✅ **Reusable** across all pages
- ✅ Easy to **debug** - See all validators in one file
- ✅ **No state dependencies** - can test with any object

---

### Example 3: Extract State Management → Custom Hook

#### BEFORE (In page):
```javascript
const OperationsTargetSettingPage = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tooltipError, setTooltipError] = useState(null);
  const [expandedObjectives, setExpandedObjectives] = useState({});

  const fetchSavedRowsForCentre = async (centre, fy) => { /* 30 lines */ };
  const saveRow = async (row) => { /* 50 lines */ };
  const deleteRow = async (row) => { /* 30 lines */ };
  const updateRowField = (rowId, field, value) => { /* 10 lines */ };
  const editRow = (rowId) => { /* 10 lines */ };
  const toggleObjectiveExpansion = (objectCode) => { /* 5 lines */ };

  // ... 1900 more lines ...
};
```

#### AFTER (In `src/hooks/useTargetSetting.js`):
```javascript
/**
 * useTargetSetting.js - Custom hook for target setting state
 * All state management in ONE place!
 */

export const useTargetSetting = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tooltipError, setTooltipError] = useState(null);
  const [expandedObjectives, setExpandedObjectives] = useState({});

  // All state management functions
  const fetchSavedRowsForCentre = useCallback(async (centre, fy) => { /* 30 lines */ }, []);
  const saveRow = useCallback(async (row, objectives, centrecode, selectedFY, centres, userid) => { /* 50 lines */ }, []);
  const deleteRow = useCallback(async (row, selectedFY, centrecode) => { /* 30 lines */ }, []);
  const updateRowField = useCallback((rowId, field, value) => { /* 10 lines */ }, []);
  const editRow = useCallback((rowId) => { /* 10 lines */ }, []);
  const toggleObjectiveExpansion = useCallback((objectCode) => { /* 5 lines */ }, []);

  return {
    rows,
    loading,
    error,
    tooltipError,
    expandedObjectives,
    fetchSavedRowsForCentre,
    saveRow,
    deleteRow,
    updateRowField,
    editRow,
    toggleObjectiveExpansion
  };
};
```

#### AFTER (In refactored page):
```javascript
import { useTargetSetting } from '../hooks/useTargetSetting';

const OperationsTargetSettingPage = () => {
  // ONE line to get ALL state and methods!
  const {
    rows,
    loading,
    error,
    tooltipError,
    expandedObjectives,
    fetchSavedRowsForCentre,
    saveRow,
    deleteRow,
    updateRowField,
    editRow,
    toggleObjectiveExpansion
  } = useTargetSetting();

  // Page is now MUCH simpler!
  return <div> {/* UI JSX only */} </div>;
};
```

**Benefits:**
- ✅ **Reusable hook** - Use same hook in multiple pages
- ✅ **Easy to debug** - All state logic in one file
- ✅ **Easy to test** - Can test hook independently
- ✅ **Page is clean** - Only handles UI

---

## Complete File Structure After Refactoring

```
src/
├── pages/
│   ├── OperationsTargetSettingPage.jsx          (OLD - 2000+ lines)
│   ├── OperationsTargetSettingPage_REFACTORED.jsx  (NEW - ~400 lines)
│   ├── RoleManagementPage.jsx
│   └── RolePageAssignmentPage.jsx
├── services/
│   ├── api.config.js                 ← All API config
│   ├── centreService.js              ← centre functions
│   ├── objectiveService.js           ← objective functions
│   ├── actionService.js              ← action functions
│   ├── successIndicatorService.js    ← SI functions
│   └── targetService.js              ← target functions
├── hooks/
│   └── useTargetSetting.js           ← State management hook
├── utils/
│   ├── constants.js                  ← All constants
│   ├── validators.js                 ← Validation functions
│   ├── formatters.js                 ← Formatting functions
│   └── helpers.js                    ← Utility functions
└── components/
    └── DataTable.jsx
```

---

## How to Apply This to Your Other Pages

### Step 1: Identify All Functions in RoleManagementPage
```javascript
// Look for all fetch functions:
const fetchRoles = async () => { };
const fetchPermissions = async () => { };
const saveRole = async () => { };
const updateRole = async () => { };
const deleteRole = async () => { };
// ... etc
```

### Step 2: Create Service Files
Create `src/services/roleService.js`:
```javascript
export const getAllRoles = async () => { /* move code here */ };
export const getPermissions = async () => { /* move code here */ };
export const saveRole = async (role) => { /* move code here */ };
export const updateRole = async (roleId, data) => { /* move code here */ };
export const deleteRole = async (roleId) => { /* move code here */ };
```

### Step 3: Create Custom Hook (Optional)
Create `src/hooks/useRoleManagement.js`:
```javascript
export const useRoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const fetchRoles = useCallback(async () => { }, []);
  const saveRole = useCallback(async (role) => { }, []);
  // ... etc
  
  return { roles, loading, fetchRoles, saveRole, ... };
};
```

### Step 4: Refactor Page
```javascript
import { useRoleManagement } from '../hooks/useRoleManagement';

const RoleManagementPage = () => {
  const { roles, loading, fetchRoles, saveRole, deleteRole } = useRoleManagement();
  
  useEffect(() => {
    fetchRoles();
  }, []);
  
  return <div> {/* UI JSX only */} </div>;
};
```

---

## Benefits Summary

| Aspect | Before | After |
|--------|--------|-------|
| **Page Size** | 2000+ lines | ~400 lines |
| **Functions Location** | Mixed in page | Organized in services/hooks/utils |
| **Debugging** | Where is the bug? | Look in specific service file |
| **Testing** | Can't test functions separately | Easy to unit test each function |
| **Code Reuse** | Copy-paste to other pages | Import same service in all pages |
| **Maintenance** | Change one thing = update many files | Change service = updates all pages |
| **Readability** | 2000 lines is overwhelming | Specific files for specific concerns |

---

## 🎯 Your Next Steps

1. ✅ Services/hooks/utils already created (see Phase 4)
2. ✅ Refactored example created (OperationsTargetSettingPage_REFACTORED.jsx)
3. ⏳ **TODO**: Update the ORIGINAL OperationsTargetSettingPage.jsx to use the refactored pattern
4. ⏳ **TODO**: Apply same pattern to RoleManagementPage.jsx
5. ⏳ **TODO**: Apply same pattern to RolePageAssignmentPage.jsx

---

## Questions? Debug Guide

**Q: Where did `fetchCentres` go?**
- A: It's now in `src/services/centreService.js` as `getAllCentres()`

**Q: How do I use `validatePerformanceLevels`?**
- A: Import from `src/utils/validators.js` and call: `const result = validatePerformanceLevels(row);`

**Q: Where is the row state managed?**
- A: In the custom hook `src/hooks/useTargetSetting.js`

**Q: Can I still debug console.log?**
- A: Yes! Each service has console.log statements. Search for the emoji (🔍, 📦, ✅) in DevTools

