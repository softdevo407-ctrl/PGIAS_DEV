# Implementation Details - Data Entry Page

## File: OperationsTargetSettingPage.jsx

### Summary of Changes

**Total Lines:** 2,429
**Last Updated:** December 30, 2025
**Status:** ✅ Complete

---

## API Endpoints Used

### 1. Fetch Operations (GET)

| Endpoint | Purpose | Called When |
|----------|---------|------------|
| `/api/objectives` | Get all objectives | Page load |
| `/api/actions/objective/{code}` | Get actions for objective | Objective loads |
| `/api/successindicator/success/{code}` | Get success indicators | Objective loads |
| `/api/objectives/getWeights/{code}` | Get weight type info | Objective loads |
| `/api/targets?centrecode={}&financialyear={}` | Get saved targets for centre | Centre selected |
| `/api/successindicator/weight/{code}/{sicode}` | Get weight value | SI selected |
| `/api/centres` | Get all centres | Page load |

### 2. Write Operations (POST/PATCH/DELETE)

| Method | Endpoint | Purpose | Condition |
|--------|----------|---------|-----------|
| POST | `/api/targets` | Create new target | New row, no ID yet |
| POST | `/api/actions/auto` | Create custom action | User creates inline |
| PATCH | `/api/targets/{fy}/{cc}/{oc}/{ac}/{si}` | Update target | Existing row, user edits |
| DELETE | `/api/targets/{fy}/{cc}/{oc}/{ac}/{si}` | Delete target | User deletes row |

---

## Key State Variables

```javascript
// UI State
const [operation, setOperation] = useState('TARGET_SETTING'); // Current operation
const [selectedFY, setSelectedFY] = useState('2026-2027');    // Selected financial year
const [centrecode, setCentrecode] = useState('');             // Selected centre

// User & Permission Data
const [userRoles, setUserRoles] = useState([]);
const [userid, setUserid] = useState('USER001');
const [assignedCentre, setAssignedCentre] = useState(null);   // User's assigned centres
const [centres, setCentres] = useState([]);                   // All centres

// Master Data
const [objectives, setObjectives] = useState([]);              // All objectives
const [actions, setActions] = useState({});                    // Actions by objective
const [successIndicators, setSuccessIndicators] = useState({}); // SIs by objective
const [weights, setWeights] = useState({});                    // Weights by objective

// Data Entry
const [rows, setRows] = useState([]);                          // Current rows being edited
const [expandedObjectives, setExpandedObjectives] = useState({}); // Which objectives are expanded

// UI Feedback
const [loading, setLoading] = useState(false);                 // Loading indicator
const [error, setError] = useState(null);                      // Error message
const [tooltipError, setTooltipError] = useState(null);        // Field-level errors
```

---

## Key Functions

### Data Fetching

```javascript
fetchObjectives()                           // GET /api/objectives
fetchActions(objectCode)                    // GET /api/actions/objective/{code}
fetchSuccessIndicators(objectCode)          // GET /api/successindicator/success/{code}
fetchWeightAndUpdateRow(objectCode)         // GET /api/objectives/getWeights/{code}
fetchExistingTargetData(objectCode)         // GET /api/targets?centrecode={}&fy={}
fetchWeightValue(objectCode, siCode)        // GET /api/successindicator/weight/{code}/{sicode}
fetchSavedRowsForCentre(centre, fy)        // GET /api/targets?centrecode={}&financialyear={}
fetchCentres()                              // GET /api/centres
```

### Row Management

```javascript
saveRow(row)                    // Validates and calls saveRowToBackend
saveRowToBackend(row)           // POST or PATCH to backend
deleteRowFromBackend(row)       // DELETE from backend
requestEditRow(rowId)           // Enter edit mode for saved row
requestDeleteRow(rowId)         // Request confirmation before delete
addNewEntryForObjective(code)   // Add new blank row for multi-entry
```

### Validation

```javascript
validatePerformanceLevels(row)           // Validate Excellent, Very Good, etc.
isDateWithinFinancialYear(date, fy)     // Check date in FY range
compareDates(date1, date2)               // Compare two dates for ordering
```

### UI Rendering

```javascript
renderWeightInput(row, field)     // Render date/number/percentage input
formatDateDDMMYYYY(dateStr)        // Format date for display
getFinancialYearDates(fyString)    // Extract FY from/to dates
```

### Event Handlers

```javascript
handleActionChange(rowId, objectCode, actionCode)
handleSIChange(rowId, objectCode, actionCode, siCode)
handleWeightTypeChange(rowId, weightType)
handleFieldChange(rowId, field, value)
```

---

## Row Data Structure

```javascript
{
  // Identification
  id: 'saved_001A_001AA000001_SI001',        // Unique row ID
  objectCode: '001A',                         // Objective code
  objectDescription: 'Objective Description',

  // Master Data
  mandatory: 'Yes',                           // Is objective mandatory
  multipleEntries: false,                     // Single or multi-entry
  predefinedParameters: true,
  predefinedReferenceValues: true,
  changeInTargetCriteria: false,
  predefinedActions: false,

  // Weight Information
  weightPeriod: 'Monthly',
  unit: 'Date',                              // Unit type
  unitPreferred: 'Fixed',                    // Fixed or Default
  selectedWeightType: 'DATE',                // DATE, NUMBER, or PERCENTAGE
  weightValue: { value: 0.5, unit: '' },    // Weight per unit

  // Master Codes & Descriptions
  actionCode: '001AA000001',
  actionName: 'Action Description',
  successIndicatorCode: 'SI001',
  siName: 'Success Indicator Name',
  siDescription: 'SI Description',

  // Performance Levels
  excellent: '15/06/2026',                   // For DATE type: date value
  veryGood: '20/07/2026',                    // For NUMBER: numeric value
  good: '25/08/2026',                        // For %: percentage value
  fair: '30/09/2026',
  poor: '31/10/2026',

  // State Flags
  isEditing: false,                          // Currently in edit mode
  isSaved: true,                             // Saved to backend
  hasChanges: false,                         // Has unsaved changes
  originalValues: null,                      // Original values before edit

  // Metadata
  weightperunitofactivity: 0.5,              // Weight contribution
}
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Page Load                              │
├─────────────────────────────────────────────────────────────┤
│ 1. fetchObjectives()          → GET /api/objectives         │
│ 2. initializeUserFromLocal()  → Read from localStorage      │
│ 3. fetchCentres()             → GET /api/centres            │
└────────────────┬──────────────────────────────────────────┬─┘
                 │                                            │
                 ▼                                            ▼
        ┌──────────────────────┐              ┌─────────────────────┐
        │ Objectives Loaded    │              │ Centres Loaded      │
        └────────┬─────────────┘              └────────┬────────────┘
                 │                                    │
                 ├─ For each objective:              │
                 │  - fetchActions()                │
                 │  - fetchWeights()                │
                 │  - fetchSuccessIndicators()      │
                 │  - Create template rows          │
                 │                                  │
                 └──────────────────┬───────────────┘
                                    │
                                    ▼
                         ┌────────────────────┐
                         │ User Selects Centre│
                         └────────┬───────────┘
                                  │
                                  ├─ setCentrecode(selected)
                                  ├─ For each single-entry objective:
                                  │  └─ fetchExistingTargetData()
                                  │     └─ GET /api/targets?centrecode={}&fy={}
                                  │     └─ Enriches with SI descriptions
                                  │
                                  ▼
                         ┌────────────────────┐
                         │  Data Ready        │
                         │  User Edits        │
                         └────────┬───────────┘
                                  │
                      ┌───────────┬───────────┐
                      │           │           │
                      ▼           ▼           ▼
                   SAVE         EDIT        DELETE
                    │            │           │
          POST/PATCH to          │      DELETE to
         /api/targets        confirmEdit  /api/targets
                    │            │           │
                    ▼            ▼           ▼
              Row Frozen      Edit Mode  Row Removed
              (isEditing=f)  (isEditing=t)
```

---

## Important Business Logic

### Single vs Multi-Entry Handling

```javascript
// Single-Entry Objectives (multipleEntries = 'No')
- Loaded from API: fetchExistingTargetData()
- Action Code: Read-only text display
- Success Indicator: Read-only text display
- Performance Levels: Start empty, user enters
- Row auto-expands on page load
- No "Add Entry" button

// Multi-Entry Objectives (multipleEntries = 'Yes')
- Action Code: User selects from dropdown
- Success Indicator: User selects from dropdown
- Performance Levels: User enters
- Row starts collapsed
- "Add Entry" button appears after first save
```

### Edit Mode Detection

```javascript
const isUpdate = row.isSaved && (row.hasChanges || row.isEditing);

// Triggers PATCH if:
// 1. Row was already saved (isSaved = true) AND
// 2. Either has unsaved changes OR is in edit mode
```

### Field Disability Logic

```javascript
// Disabled when:
isPerformanceFieldDisabled = true if:
  - Row is saved AND not in edit mode (read-only display), OR
  - Row is new AND centre not selected (needs centre), OR
  - Multi-entry AND no SI selected yet

// Enabled when:
  - Row is new AND centre selected, OR
  - Row is being edited (isEditing = true)
```

---

## Validation Rules

### Date Type (Financial Year Constraints)
```
FY 2026-2027 = April 1, 2026 to March 31, 2027

Excellent: Must be within FY ✓
Very Good: Must be > Excellent ✓ (later date)
Good:      Must be > Very Good ✓ (later date)
Fair:      Must be > Good ✓ (later date)
Poor:      Must be > Fair ✓ (later date)

Ordering: Excellent < Very Good < Good < Fair < Poor (ascending dates)
```

### Number/Percentage Type
```
Ordering: Excellent > Very Good > Good > Fair > Poor (descending values)

Excellent: MANDATORY
Others: Optional, but if 2+ are entered, must follow order
```

---

## Error Handling

### Tooltip Errors
```javascript
setTooltipError({
  rowId: row.id,                              // Which row
  field: 'excellent',                         // Which field
  message: '⚠️ Excellent is MANDATORY'       // What's wrong
});

// Display as:
// - Red top border on field
// - Tooltip below field with message
// - Tooltip includes arrow pointing to field
```

### API Errors
```javascript
try {
  const response = await fetch(...);
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
} catch (err) {
  alert('❌ Error: ' + err.message);
}
```

---

## Performance Considerations

1. **Lazy Loading**: SI/Actions fetched only for displayed objectives
2. **State Optimization**: Uses functional updates to avoid closure issues
3. **Conditional Rendering**: Only expands visible objectives
4. **Memoization**: (Could be added) useCallback for handlers
5. **Debouncing**: (Could be added) For field changes

---

## Browser Compatibility

| Feature | Support |
|---------|---------|
| Date Picker | Modern browsers (Chrome, Firefox, Safari, Edge) |
| localStorage | All modern browsers |
| Fetch API | All modern browsers |
| CSS Grid/Flex | All modern browsers |
| Modern JavaScript | ES6+ features (const, arrow functions, etc.) |

---

## Deployment Checklist

- [ ] Backend APIs deployed and tested
- [ ] CORS configured for API calls
- [ ] Environment variables set (API URLs)
- [ ] localStorage permissions configured
- [ ] Date timezone handling verified
- [ ] Financial year dates correct for FY
- [ ] Error messages tested
- [ ] Performance tested with large datasets
- [ ] Browser compatibility tested
- [ ] Mobile responsiveness verified
- [ ] Accessibility tested (WCAG AA)
- [ ] Security review completed
