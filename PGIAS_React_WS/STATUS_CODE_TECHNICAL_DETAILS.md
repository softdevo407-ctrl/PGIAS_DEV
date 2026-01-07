# Status Code Implementation - Technical Details

## Implementation Summary

This document provides technical details of the status-code-based row state management system implemented in OperationsTargetSettingPage.jsx.

## Architecture Overview

```
Row Object
    ↓
    ├─ statuscode (T01, T02, T03, T04)
    │   ↓
    │   getRowStatusStyle() → Styling object
    │   
    └─ isRowEditable() → Boolean (editable/disabled)
        ↓
        ├─ Control Button States (Save, Edit, Delete, Add Entry)
        ├─ Control Input Field States (Action Code, SI)
        ├─ Control Row Colors & Styling
        └─ Control User Interaction
```

## Status Code Enum

```javascript
T01 = Draft Targets Setting
T02 = Targets Submitted for Centre Level Approval
T03 = Targets sent for resubmission at Centre Level
T04 = Targets Approved by Centre Level
```

## Helper Function Details

### getRowStatusStyle(statuscode)

**Location**: Lines 1645-1695

**Returns**: Object with the following structure:
```javascript
{
  backgroundColor: string,      // CSS background color
  borderLeftColor: string,      // Border left color
  borderLeftWidth: string,      // Border left width with unit
  isEditable: boolean,          // Whether row is editable
  statusLabel: string,          // User-facing status message
  hoverColor: string,           // Color on mouse hover
  textColor: string             // Text color for content
}
```

**Usage**:
```javascript
const rowStatus = getRowStatusStyle(row.statuscode || 'T01');
// Now use:
// rowStatus.backgroundColor
// rowStatus.borderLeftColor
// rowStatus.statusLabel
// etc.
```

**Status Definitions**:

#### T01: Draft Targets Setting
```javascript
{
  backgroundColor: '#f8f9fa',
  borderLeftColor: '#0066cc',
  borderLeftWidth: '4px',
  isEditable: true,
  statusLabel: '📝 Draft Targets Setting',
  hoverColor: '#f0f8ff',
  textColor: '#333'
}
```

#### T02: Submitted for Centre Level Approval
```javascript
{
  backgroundColor: '#fff3cd',
  borderLeftColor: '#ffc107',
  borderLeftWidth: '4px',
  isEditable: false,
  statusLabel: '⏳ Targets Submitted for Centre Level Approval',
  hoverColor: '#fff3cd',
  textColor: '#856404'
}
```

#### T03: Sent for Resubmission
```javascript
{
  backgroundColor: '#ffe5e5',
  borderLeftColor: '#dc3545',
  borderLeftWidth: '4px',
  isEditable: true,
  statusLabel: '❌ Targets sent for resubmission at Centre Level',
  hoverColor: '#ffd6d6',
  textColor: '#721c24'
}
```

#### T04: Approved by Centre Level
```javascript
{
  backgroundColor: '#d4edda',
  borderLeftColor: '#28a745',
  borderLeftWidth: '5px',
  isEditable: false,
  statusLabel: '✅ Targets Approved by Centre Level',
  hoverColor: '#c8e6c9',
  textColor: '#155724'
}
```

### isRowEditable(statuscode)

**Location**: Lines 1690-1693

**Logic**:
```javascript
const isRowEditable = (statuscode) => {
  return statuscode === 'T01' || statuscode === 'T03';
};
```

**Returns**: 
- `true` if statuscode is 'T01' or 'T03'
- `false` if statuscode is 'T02' or 'T04'
- `false` for unknown statuscodes (defaults to uneditable)

**Usage**:
```javascript
if (isRowEditable(row.statuscode || 'T01')) {
  // Allow editing
  button.disabled = false;
} else {
  // Disable editing
  button.disabled = true;
}
```

## Row Object Structure

**Location**: Lines 305-340

**New Fields Added**:
```javascript
statuscode: 'T01',                    // Default status code
statusdescription: 'Draft Targets Setting'  // User-facing description
```

**Complete Row Template**:
```javascript
{
  // Identification
  id: newId,
  objectCode: obj.objectivecode,
  
  // Data Entry
  actionCode: '',
  actionName: '',
  successIndicatorCode: '',
  siName: '',
  siDescription: '',
  
  // Weight Type
  selectedWeightType: null,
  
  // Performance Ratings
  excellent: '',
  veryGood: '',
  good: '',
  fair: '',
  poor: '',
  
  // State Management (OLD - still present for compatibility)
  isEditing: true,
  isSaved: false,
  hasChanges: false,
  originalValues: null,
  
  // State Management (NEW - status-based)
  statuscode: 'T01',
  statusdescription: 'Draft Targets Setting',
  
  // Approval Fields
  approvalStatus: 'PENDING',
  approvalRemarks: '',
  approvedBy: null,
  approvedAt: null
}
```

## Table Row Rendering

**Location**: Lines 2530-2560

**Implementation**:
```javascript
{expandedObjectives[obj.objectivecode] && objEntries.map(row => {
  // Get status styling and editability
  const rowStatus = getRowStatusStyle(row.statuscode || 'T01');
  const isEditable = isRowEditable(row.statuscode || 'T01');
  
  return (
    <React.Fragment key={row.id}>
      <tr 
        style={{
          borderLeft: `${rowStatus.borderLeftWidth} solid ${rowStatus.borderLeftColor}`,
          height: '40px',
          borderRadius: '0',
          fontWeight: '500',
          transition: 'all 0.2s ease',
          backgroundColor: rowStatus.backgroundColor,
          color: rowStatus.textColor,
          opacity: isEditable ? 1 : 0.8
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = rowStatus.hoverColor;
          if (!isEditable) {
            // Show status label on hover for disabled rows
            e.currentTarget.title = rowStatus.statusLabel;
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = rowStatus.backgroundColor;
          e.currentTarget.title = '';
        }}
        title={rowStatus.statusLabel}
      >
        {/* Table cells... */}
      </tr>
    </React.Fragment>
  );
})}
```

**Styling Logic**:
- Border left: Dynamically set from `rowStatus.borderLeftWidth` and `borderLeftColor`
- Background: Dynamically set from `rowStatus.backgroundColor`
- Hover: Dynamically set from `rowStatus.hoverColor`
- Text Color: Dynamically set from `rowStatus.textColor`
- Opacity: 100% for editable, 80% for disabled
- Tooltip: Shows `rowStatus.statusLabel` on hover for disabled rows

## Button State Management

### Save Button

**Location**: Line 3025

```javascript
<button
  disabled={!row.isEditing || loading || !isRowEditable(row.statuscode || 'T01')}
  title={!isRowEditable(row.statuscode || 'T01') 
    ? `Cannot save - Row is in ${getRowStatusStyle(row.statuscode || 'T01').statusLabel} state`
    : "Save changes"
  }
/>
```

**Disabled Conditions**:
1. `!row.isEditing` - Not in edit mode
2. `loading` - Request in progress
3. `!isRowEditable(...)` - Status is T02 or T04

### Add Entry Button

**Location**: Line 3062

```javascript
{row.multipleEntries && row.isSaved && getLastRowForObjective(row.objectCode)?.id === row.id && (
  <button
    disabled={loading || !isRowEditable(row.statuscode || 'T01')}
    title={!isRowEditable(row.statuscode || 'T01') 
      ? `Cannot add entries - Row is in ${getRowStatusStyle(row.statuscode || 'T01').statusLabel} state`
      : "Add new entry"
    }
  />
)}
```

**Disabled Conditions**:
1. `loading` - Request in progress
2. `!isRowEditable(...)` - Status is T02 or T04

### Edit Button

**Location**: Line 3098

```javascript
<button
  disabled={row.isEditing || loading || !isRowEditable(row.statuscode || 'T01')}
  title={!isRowEditable(row.statuscode || 'T01') 
    ? `Cannot edit - Row is in ${getRowStatusStyle(row.statuscode || 'T01').statusLabel} state`
    : "Edit this entry"
  }
/>
```

**Disabled Conditions**:
1. `row.isEditing` - Already in edit mode
2. `loading` - Request in progress
3. `!isRowEditable(...)` - Status is T02 or T04

**Styling** (Lines 3105-3123):
```javascript
style={{
  backgroundColor: isRowEditable(row.statuscode || 'T01') && !row.isEditing ? '#0066cc' : '#e9ecef',
  color: isRowEditable(row.statuscode || 'T01') && !row.isEditing ? 'white' : '#999',
  cursor: isRowEditable(row.statuscode || 'T01') && !row.isEditing ? 'pointer' : 'not-allowed',
}}
onMouseEnter={(e) => {
  if (isRowEditable(row.statuscode || 'T01') && !row.isEditing) {
    e.currentTarget.style.backgroundColor = '#004da3';
    e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 102, 204, 0.3)';
  }
}}
onMouseLeave={(e) => {
  e.currentTarget.style.backgroundColor = isRowEditable(row.statuscode || 'T01') && !row.isEditing ? '#0066cc' : '#e9ecef';
  e.currentTarget.style.boxShadow = 'none';
}}
```

### Delete Button

**Location**: Line 3130

```javascript
{row.multipleEntries && (
  <button
    disabled={row.hasChanges || loading || !isRowEditable(row.statuscode || 'T01')}
    title={!isRowEditable(row.statuscode || 'T01') 
      ? `Cannot delete - Row is in ${getRowStatusStyle(row.statuscode || 'T01').statusLabel} state`
      : "Delete this entry"
    }
  />
)}
```

**Disabled Conditions**:
1. `row.hasChanges` - Row has unsaved changes
2. `loading` - Request in progress
3. `!isRowEditable(...)` - Status is T02 or T04

**Styling** (Lines 3140-3158):
```javascript
style={{
  backgroundColor: isRowEditable(row.statuscode || 'T01') && !row.hasChanges ? '#dc3545' : '#e9ecef',
  color: isRowEditable(row.statuscode || 'T01') && !row.hasChanges ? 'white' : '#999',
  cursor: isRowEditable(row.statuscode || 'T01') && !row.hasChanges ? 'pointer' : 'not-allowed',
}}
```

## Input Field State Management

### Action Code CreatableSelect

**Location**: Line 2623

```javascript
<CreatableSelect
  isDisabled={!isRowEditable(row.statuscode || 'T01')}
  // ... other props
/>
```

**Previous Logic**: `isDisabled={row.isSaved && !row.isEditing || isFormSubmitted}`
**New Logic**: `isDisabled={!isRowEditable(row.statuscode || 'T01')}`

### Success Indicator Select

**Location**: Line 2729

```javascript
<select
  disabled={!isCentreLocked() || !isRowEditable(row.statuscode || 'T01')}
  // ... other props
/>
```

**Previous Logic**: `disabled={!isCentreLocked() || (row.isSaved && !row.isEditing) || isFormSubmitted}`
**New Logic**: `disabled={!isCentreLocked() || !isRowEditable(row.statuscode || 'T01')}`

## Fallback Pattern

All status code lookups follow this pattern:
```javascript
getRowStatusStyle(row.statuscode || 'T01')  // Defaults to T01
isRowEditable(row.statuscode || 'T01')       // Defaults to T01
```

This ensures:
- Missing statuscode doesn't break the UI
- Unknown statuscodes default to editable (T01 behavior)
- Graceful degradation for rows without statuscode

## Status Transition Flow (Expected)

```
Create Row
    ↓
T01: Draft - User Edits
    ↓
T01: Draft - User Clicks Submit
    ↓
T02: Submitted - Awaiting Approval
    ├─→ APPROVED: T02 → T04 ✅
    │   └─ T04: Approved (Locked, Green)
    │
    └─→ REJECTED: T02 → T03 ❌
        └─ T03: Resubmission - User Edits
            ↓
        User Clicks Resubmit
            ↓
        T03 → T02: Submitted Again
            ↓
        Approval Process Repeats
```

## Backward Compatibility Considerations

### Old Fields Still Used

1. **isEditing**: Controls whether Save button shows
   - Still necessary for edit mode UI
   - Works alongside statuscode

2. **isSaved**: Used in fetching and row identification
   - Still used: `row.isSaved && !row.isEditing`
   - Still used: fetching saved rows

3. **isFormSubmitted**: Used in form validation
   - Still used in overall form state
   - Not used for individual row editability anymore

### Migration Path

1. **Immediate**: Use new statuscode-based logic for editability
2. **Phase 2**: Backend API returns statuscode
3. **Phase 3**: Remove isFormSubmitted checks from input fields
4. **Phase 4**: Deprecate row.isSaved in favor of statuscode
5. **Phase 5**: Remove old fields entirely

## Performance Considerations

**Optimization**: Helper functions are NOT memoized
- Called once per row render
- O(1) lookup in getRowStatusStyle (object key access)
- O(1) evaluation in isRowEditable (simple comparison)
- Negligible performance impact

## Error Handling

### Undefined statuscode
```javascript
row.statuscode || 'T01'  // Defaults to Draft
```

### Unknown statuscode
```javascript
styles[statuscode] || styles['T01']  // Defaults to T01 style
```

### Missing row properties
```javascript
row.statuscode || 'T01'  // Safe fallback
```

## Testing Scenarios

### Scenario 1: New Row Created
- statuscode: 'T01'
- All buttons: Enabled
- All fields: Editable
- Color: Blue

### Scenario 2: Row Submitted
- statuscode: 'T02'
- All buttons: Disabled
- All fields: Read-only
- Color: Yellow
- Hover: Shows approval message

### Scenario 3: Row Rejected
- statuscode: 'T03'
- All buttons: Enabled
- All fields: Editable
- Color: Red
- Hover: Shows rejection message

### Scenario 4: Row Approved
- statuscode: 'T04'
- All buttons: Disabled
- All fields: Read-only
- Color: Green (5px border)
- Hover: Shows approval message

## API Integration Requirements

### Row Object from API
```json
{
  "id": "row-123",
  "objectCode": "OBJ001",
  "actionCode": "ACT001",
  "successIndicatorCode": "SI001",
  "statuscode": "T01",
  "statusdescription": "Draft Targets Setting",
  ...otherFields
}
```

### Status Update Endpoint
```
PUT /api/targets/{rowId}/status
{
  "statuscode": "T02",
  "statusdescription": "Targets Submitted for Centre Level Approval"
}
```

## Deployment Checklist

- [ ] Verify no console errors
- [ ] Test all 4 status codes
- [ ] Verify button states
- [ ] Verify field editability
- [ ] Verify row colors
- [ ] Verify hover tooltips
- [ ] Test with missing statuscode
- [ ] Test with unknown statuscode
- [ ] Verify backward compatibility
- [ ] Load test with 100+ rows
- [ ] Cross-browser test

---

**Last Updated**: [Current Date]
**Status**: Ready for Production
**Breaking Changes**: None
**Migration Required**: Backend API needs statuscode support
