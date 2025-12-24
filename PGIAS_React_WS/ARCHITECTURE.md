# Project Architecture - Best Practices Implementation

## 📁 Folder Structure

```
src/
├── components/
│   └── DataTable.jsx
├── config/
│   └── config.js
├── hooks/                          # ✨ NEW - Custom React hooks
│   └── useTargetSetting.js        # State management & logic
├── pages/
│   ├── HomePage.jsx
│   ├── OperationsTargetSettingPage.jsx  (REFACTORED)
│   ├── RoleManagementPage.jsx
│   ├── RolePageAssignmentPage.jsx
│   └── ...
├── services/                       # ✨ NEW - API layer
│   ├── api.config.js             # Centralized API config & fetch wrapper
│   ├── targetService.js          # Target API calls
│   ├── objectiveService.js       # Objective API calls
│   ├── actionService.js          # Action API calls
│   ├── successIndicatorService.js # SI API calls
│   └── centreService.js          # Centre API calls
├── utils/                          # ✨ NEW - Helper functions
│   ├── constants.js              # App constants (operations, FY, statuses, etc.)
│   ├── validators.js             # Validation functions
│   ├── formatters.js             # Formatting & display functions
│   └── helpers.js                # Misc utility functions
├── App.jsx
└── main.jsx
```

## 🏗️ Architecture Layers

### 1. **Services Layer** (`services/`)
Handles all API communication and business logic.

**Files:**
- **api.config.js** - Centralized configuration
  - `API_ENDPOINTS` - All API URLs
  - `fetchAPI()` - Generic fetch wrapper with error handling
  
- **targetService.js** - Target operations
  - `getTargetsByCentreAndFY()` - Fetch by centre + FY
  - `saveTarget()` - Save/update target
  - `deleteTarget()` - Delete target
  
- **objectiveService.js** - Objective operations
  - `getAllObjectives()` - Get all objectives
  - `getObjectiveWeight()` - Get weight info
  - `mapObjectiveToRow()` - Map API response to UI format
  
- **actionService.js** - Action operations
  - `getActionsByObjective()` - Get actions for objective
  - `saveAutoAction()` - Save auto-generated action
  - `generateActionCode()` - Generate action codes
  
- **successIndicatorService.js** - Success Indicator operations
  - `getSuccessIndicatorsByObjective()` - Get SIs
  - `mapSavedDataToRow()` - Map API response to row format
  
- **centreService.js** - Centre operations
  - `getAllCentres()` - Get all centres
  - `findCentreByCode()` - Find centre
  - `isHQCentre()` - Check if HQ

### 2. **Hooks Layer** (`hooks/`)
Custom React hooks for component logic and state management.

**Files:**
- **useTargetSetting.js** - Main hook for target page
  - Manages rows, loading, errors, tooltips
  - `fetchSavedRowsForCentre()` - Load saved data
  - `handleCentreChange()` - Change centre logic
  - `saveRow()` - Save with validation
  - `deleteRow()` - Delete with confirmation
  - `updateRowField()` - Update field value
  - `editRow()` - Enable edit mode
  - `toggleObjectiveExpansion()` - Expand/collapse

### 3. **Utils Layer** (`utils/`)
Reusable utility functions.

**Files:**
- **constants.js** - Application constants
  - `OPERATIONS` - Operation types
  - `FINANCIAL_YEARS` - FY mappings
  - `PERFORMANCE_LEVELS` - Level keys
  - `WEIGHT_TYPES` - Weight type options
  - `STATUS_CODES` - Status codes
  - `MESSAGES` - UI messages
  - `VALIDATION_MESSAGES` - Error messages
  
- **validators.js** - Validation functions
  - `validateExcellentMandatory()` - Validate excellent field
  - `validatePerformanceLevelOrder()` - Validate order
  - `validateRow()` - Complete row validation
  
- **formatters.js** - Formatting functions
  - `formatDateDDMMYYYY()` - Date formatting
  - `formatFinancialYear()` - FY formatting
  - `formatWeightType()` - Weight type display
  - `truncateText()` - Text truncation
  - `formatErrorMessage()` - Error formatting
  
- **helpers.js** - Utility functions
  - `isHQCentre()` - Check HQ
  - `canAccessHQObjective()` - Check access
  - `buildTargetPayload()` - Build save payload
  - `buildDeletePayload()` - Build delete payload
  - `generateRowId()` - Generate unique IDs
  - `groupRowsByObjective()` - Group utilities
  - `calculateTotalWeight()` - Weight calculations
  - `deepClone()` - Object cloning
  - `hasChanges()` / `getChangedFields()` - Change tracking

## 🔄 Data Flow

```
Page Component
    ↓
useTargetSetting() Hook
    ↓
Services (targetService, objectiveService, etc.)
    ↓
API Endpoints (api.config.js)
    ↓
Backend API
```

## 📚 Usage Examples

### Before (All logic in component):
```jsx
// ❌ NOT RECOMMENDED - 2000+ lines in component
const OperationsTargetSettingPage = () => {
  // 100+ state variables
  // 50+ function definitions
  // API calls mixed with UI logic
  // Validators inline
  // Formatters inline
  // ...
}
```

### After (Separated layers):
```jsx
// ✅ CLEAN & ORGANIZED
import { useTargetSetting } from '../hooks/useTargetSetting';
import * as targetService from '../services/targetService';
import { validateRow } from '../utils/validators';
import { formatDateDDMMYYYY } from '../utils/formatters';

const OperationsTargetSettingPage = () => {
  const {
    rows,
    setRows,
    handleCentreChange,
    saveRow,
    deleteRow,
    updateRowField
  } = useTargetSetting();

  // Page now focuses ONLY on UI/rendering
  // Logic is abstracted away
};
```

## 🚀 Benefits

1. **Single Responsibility** - Each file has ONE job
2. **Reusability** - Services, hooks, utils can be used across pages
3. **Testability** - Easy to unit test each layer
4. **Maintainability** - Changes isolated to specific layers
5. **Scalability** - Easy to add new features
6. **Readability** - Clear separation of concerns

## 🔧 How to Add New Features

### Add a new API endpoint:
1. Add URL to `api.config.js` → `API_ENDPOINTS`
2. Create service function in `services/yourService.js`
3. Import and use in hook or component

### Add a new validation:
1. Add validator function to `utils/validators.js`
2. Import and use in hook's validation logic
3. Return validation result with field + message

### Add a new utility function:
1. Add to appropriate file in `utils/`
2. Import where needed
3. Works across all pages

## 📋 Migration Checklist

- [x] Create services layer
- [x] Create utils layer
- [x] Create hooks layer
- [ ] Refactor OperationsTargetSettingPage.jsx
- [ ] Refactor RoleManagementPage.jsx
- [ ] Refactor RolePageAssignmentPage.jsx
- [ ] Update other pages to use new structure
- [ ] Add unit tests for services
- [ ] Add unit tests for validators
- [ ] Update documentation

## 🧪 Testing Strategy

```
services/        → Unit tests (mock API calls)
utils/           → Unit tests (pure functions)
hooks/           → Integration tests (state management)
pages/           → Component tests (UI only)
```

## 📖 Documentation Files

- `ARCHITECTURE.md` - This file
- Each service/util/hook has JSDoc comments
- Examples provided in each file
