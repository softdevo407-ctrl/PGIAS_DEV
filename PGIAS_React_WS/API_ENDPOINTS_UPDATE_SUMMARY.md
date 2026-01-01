# API Endpoints Update Summary

## Date: December 30, 2025

### Changes Made to OperationsTargetSettingPage.jsx

#### 1. **CREATE - POST /api/targets**
- **Purpose**: Create a new target setting row
- **Method**: POST
- **Endpoint**: `http://localhost:8080/api/targets`
- **Request Body**: Complete TargetsSetAndAchieved entity with all fields
- **Response**: Returns the created entity with ID
- **When Used**: When saving a new row (isSaved = false)

#### 2. **UPDATE - PATCH /api/targets/{financialyear}/{centrecode}/{objectivecode}/{actioncode}/{successindicatorcode}**
- **Purpose**: Update an existing target setting row
- **Method**: PATCH
- **Endpoint**: `http://localhost:8080/api/targets/{fyYear}/{centrecode}/{objectCode}/{actionCode}/{siCode}`
- **Path Variables**:
  - `financialyear`: Format "2026-2027"
  - `centrecode`: Centre code (e.g., "01")
  - `objectivecode`: Objective code (e.g., "001A")
  - `actioncode`: Action code (e.g., "001AA000001")
  - `successindicatorcode`: SI code (e.g., "SI001")
- **Request Body**: Updated TargetsSetAndAchieved entity
- **Response**: Returns the updated entity
- **When Used**: When editing and saving an existing row (isSaved = true && (hasChanges || isEditing))

#### 3. **DELETE - DELETE /api/targets/{financialyear}/{centrecode}/{objectivecode}/{actioncode}/{successindicatorcode}**
- **Purpose**: Delete an existing target setting row
- **Method**: DELETE
- **Endpoint**: `http://localhost:8080/api/targets/{fyYear}/{centrecode}/{objectCode}/{actionCode}/{siCode}`
- **Path Variables**: Same as UPDATE endpoint
- **Request Body**: None (but Content-Type header still set)
- **Response**: Success message (no content returned)
- **When Used**: When deleting a saved row via Delete button

---

## Code Implementation

### saveRowToBackend() Function
```javascript
// Determines whether to CREATE (POST) or UPDATE (PATCH)
const isUpdate = row.isSaved && (row.hasChanges || row.isEditing);

if (isUpdate) {
  // Use PATCH endpoint with path variables
  const updateUrl = `http://localhost:8080/api/targets/${fyYear}/${centrecode}/${row.objectCode}/${row.actionCode}/${row.successIndicatorCode}`;
  response = await fetch(updateUrl, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
} else {
  // Use POST endpoint
  response = await fetch('http://localhost:8080/api/targets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}
```

### deleteRowFromBackend() Function
```javascript
// Uses DELETE with path variables
const fyYear = selectedFY; // Format: 2026-2027
const deleteUrl = `http://localhost:8080/api/targets/${fyYear}/${centrecode}/${row.objectCode}/${row.actionCode}/${row.successIndicatorCode}`;

const response = await fetch(deleteUrl, {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' }
});
```

---

## Key Improvements

✅ **Proper REST API Design**: Using correct HTTP methods (GET, POST, PATCH, DELETE)
✅ **Clean Path Variables**: Composite key represented in URL path
✅ **Distinction Between CREATE and UPDATE**: Automatic detection and appropriate endpoint routing
✅ **Console Logging**: Clear logs showing which operation is being performed
✅ **Error Handling**: Detailed error messages for API failures
✅ **Payload Structure**: Complete entity sent with all required fields

---

## UI/UX Enhancements Made

### 1. Date Input Improvements
- ✅ Keyboard input disabled - date picker selection only
- ✅ FY date range validation with visual feedback
- ✅ Red border and warning message for out-of-range dates
- ✅ Min/Max attributes enforce FY boundaries

### 2. Single-Entry Objective Handling
- ✅ Performance level fields start empty (not pre-filled)
- ✅ Users must manually enter values
- ✅ Action Code and Success Indicator display as read-only text
- ✅ Clean, focused data entry experience

### 3. Weight Type Select
- ✅ Removed dropdown arrow (CSS appearance: none)
- ✅ Improved styling and padding
- ✅ Better visual hierarchy with icons
- ✅ Cleaner disabled state

### 4. Overall Data Entry Flow
- ✅ Clear distinctions between view and edit modes
- ✅ Intuitive enable/disable logic based on centre selection
- ✅ Visual indicators for mandatory vs optional fields
- ✅ Consistent spacing and alignment

---

## Testing Checklist

- [ ] Create new target row (POST)
- [ ] Edit existing target row (PATCH)
- [ ] Delete target row (DELETE)
- [ ] Verify dates are restricted to FY range
- [ ] Verify keyboard input disabled for date fields
- [ ] Test with single-entry objectives
- [ ] Test with multi-entry objectives
- [ ] Verify error messages display correctly
- [ ] Test with different centres
- [ ] Verify success indicators populate correctly
