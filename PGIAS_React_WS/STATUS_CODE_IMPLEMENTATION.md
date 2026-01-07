# Status Code Implementation - Complete

## Overview
Successfully implemented status-code-based row state management system replacing old `isSaved`/`isEditing` mechanism.

## Status Codes Implemented

### T01 - Draft Targets Setting
- **Editable**: YES
- **Color**: Blue (#0066cc border, #f8f9fa background)
- **Hover Color**: Light blue (#f0f8ff)
- **Text**: Dark gray (#333)
- **Border Left Width**: 4px
- **Button State**: ENABLED (Save, Edit, Delete, Add Entry)
- **User Intent**: New rows or rows being prepared for submission

### T02 - Targets Submitted for Centre Level Approval
- **Editable**: NO
- **Color**: Yellow (#ffc107 border, #fff3cd background)
- **Hover Color**: Yellow (#fff3cd - no change)
- **Text**: Brown (#856404)
- **Border Left Width**: 4px
- **Button State**: DISABLED (All buttons disabled)
- **User Intent**: Row is awaiting approval review
- **Message**: "⏳ Targets Submitted for Centre Level Approval"

### T03 - Targets Sent for Resubmission
- **Editable**: YES (same as T01)
- **Color**: Red (#dc3545 border, #ffe5e5 background)
- **Hover Color**: Darker red (#ffd6d6)
- **Text**: Dark red (#721c24)
- **Border Left Width**: 4px
- **Button State**: ENABLED (Save, Edit, Delete, Add Entry)
- **Special Behavior**: Shows rejection message on hover/title
- **Message**: "❌ Targets sent for resubmission at Centre Level"
- **User Intent**: Row needs to be updated based on reviewer feedback

### T04 - Targets Approved by Centre Level
- **Editable**: NO
- **Color**: Green (#28a745 border, #d4edda background)
- **Hover Color**: Lighter green (#c8e6c9)
- **Text**: Dark green (#155724)
- **Border Left Width**: 5px (thicker to indicate approved)
- **Button State**: DISABLED (All buttons disabled)
- **Message**: "✅ Targets Approved by Centre Level"
- **User Intent**: Row is finalized and locked

## Code Changes Made

### 1. Helper Functions Added (Lines 1645-1695)

**getRowStatusStyle(statuscode)**
- Returns styling object containing:
  - `backgroundColor`: CSS background color
  - `borderLeftColor`: Border left color
  - `borderLeftWidth`: Border left width (in px)
  - `isEditable`: Boolean (redundant with isRowEditable)
  - `statusLabel`: User-facing status message
  - `hoverColor`: Color on mouse hover
  - `textColor`: Text color
- Handles all 4 status codes with sensible defaults to T01

**isRowEditable(statuscode)**
- Returns: `true` for T01 and T03
- Returns: `false` for T02 and T04
- Used throughout component for button and field enable/disable logic

### 2. Row Object Initialization (Lines 305-340)
Added two new fields to row template:
```javascript
statuscode: 'T01',           // Default to Draft
statusdescription: 'Draft Targets Setting'
```

### 3. Table Row Styling Updated (Lines 2530-2560)
```javascript
{expandedObjectives[obj.objectivecode] && objEntries.map(row => {
  const rowStatus = getRowStatusStyle(row.statuscode || 'T01');
  const isEditable = isRowEditable(row.statuscode || 'T01');
  return (
    <tr style={{
      borderLeft: `${rowStatus.borderLeftWidth} solid ${rowStatus.borderLeftColor}`,
      backgroundColor: rowStatus.backgroundColor,
      color: rowStatus.textColor,
      opacity: isEditable ? 1 : 0.8
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = rowStatus.hoverColor;
      if (!isEditable) {
        e.currentTarget.title = rowStatus.statusLabel;
      }
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = rowStatus.backgroundColor;
      e.currentTarget.title = '';
    }}
    title={rowStatus.statusLabel}>
```

### 4. Save Button Updated (Line 3025)
```javascript
disabled={!row.isEditing || loading || !isRowEditable(row.statuscode || 'T01')}
title={!isRowEditable(row.statuscode || 'T01') ? `Cannot save - Row is in ${getRowStatusStyle(row.statuscode || 'T01').statusLabel} state` : "Save changes"}
```

### 5. Add Entry Button Updated (Line 3062)
```javascript
disabled={loading || !isRowEditable(row.statuscode || 'T01')}
title={!isRowEditable(row.statuscode || 'T01') ? `Cannot add entries - Row is in ${getRowStatusStyle(row.statuscode || 'T01').statusLabel} state` : "Add new entry"}
```

### 6. Edit Button Updated (Lines 3098-3123)
```javascript
disabled={row.isEditing || loading || !isRowEditable(row.statuscode || 'T01')}
title={!isRowEditable(row.statuscode || 'T01') ? `Cannot edit - Row is in ${getRowStatusStyle(row.statuscode || 'T01').statusLabel} state` : "Edit this entry"}
// Updated styling to use isRowEditable() instead of row.isSaved
backgroundColor: isRowEditable(row.statuscode || 'T01') && !row.isEditing ? '#0066cc' : '#e9ecef'
```

### 7. Delete Button Updated (Lines 3130-3155)
```javascript
disabled={row.hasChanges || loading || !isRowEditable(row.statuscode || 'T01')}
title={!isRowEditable(row.statuscode || 'T01') ? `Cannot delete - Row is in ${getRowStatusStyle(row.statuscode || 'T01').statusLabel} state` : "Delete this entry"}
// Updated styling to use isRowEditable() instead of row.isSaved
backgroundColor: isRowEditable(row.statuscode || 'T01') && !row.hasChanges ? '#dc3545' : '#e9ecef'
```

### 8. Input Field Disable Logic Updated

**Action Code CreatableSelect (Line 2623)**
```javascript
isDisabled={!isRowEditable(row.statuscode || 'T01')}
```
Changed from: `isDisabled={row.isSaved && !row.isEditing || isFormSubmitted}`

**Success Indicator Select (Line 2729)**
```javascript
disabled={!isCentreLocked() || !isRowEditable(row.statuscode || 'T01')}
```
Changed from: `disabled={!isCentreLocked() || (row.isSaved && !row.isEditing) || isFormSubmitted}`

## Backward Compatibility Notes

### Fields Still Present (Not Removed)
The following old fields remain in the row object for backward compatibility:
- `isEditing`: Still used to control Save button and input field edit mode
- `isSaved`: Still used to fetch saved rows, may be deprecated
- `isFormSubmitted`: Still used in form submission logic
- `approvalStatus`, `approvalRemarks`: Legacy fields, not used in new system

### Migration Strategy
- **New rows**: Get `statuscode: 'T01'` and `statusdescription: 'Draft Targets Setting'`
- **Fetched rows**: Should include `statuscode` from API, falls back to 'T01'
- **Old rows**: Falls back gracefully with `row.statuscode || 'T01'` pattern

## Status Transition Flow (Expected Backend Implementation)

```
User Creates Row:
  T01 (Draft) → User enters data and clicks Save

User Submits for Approval:
  T01 (Draft) → T02 (Submitted)
  [Row becomes locked, buttons disabled]

Approver Reviews:
  T02 (Submitted) → T04 (Approved) OR T03 (Resubmission)

If Approved:
  T04 (Approved) - Row locked permanently in green

If Rejected:
  T03 (Resubmission Required)
  [Row unlocked, user can edit]
  After Edit → T02 (Submitted again)
```

## Visual Indicators Summary

| Status | Color | Icon | Border Width | Editable | Buttons | Hover |
|--------|-------|------|--------------|----------|---------|-------|
| T01 | Blue | 📝 | 4px | YES | Enabled | Light Blue |
| T02 | Yellow | ⏳ | 4px | NO | Disabled | Same |
| T03 | Red | ❌ | 4px | YES | Enabled | Dark Red |
| T04 | Green | ✅ | 5px | NO | Disabled | Light Green |

## Error Handling

- All status code lookups include fallback: `row.statuscode || 'T01'`
- Missing statuscode defaults to Draft (T01) to allow continued operation
- Helper functions handle unknown status codes gracefully

## Testing Checklist

- [ ] New rows default to T01 (Draft) with blue styling
- [ ] T01 rows: All buttons enabled, fields editable
- [ ] T02 rows: All buttons disabled, fields read-only
- [ ] T03 rows: All buttons enabled, fields editable, red color with rejection message on hover
- [ ] T04 rows: All buttons disabled, fields read-only, green color
- [ ] Hover titles display correct status labels
- [ ] Save/Edit/Delete buttons have correct disabled state
- [ ] Action Code and SI dropdowns respect editability
- [ ] Form submission works with current status-based logic
- [ ] Data persistence maintains statuscode correctly

## Future Enhancements

1. **Backend Integration**: Ensure API returns `statuscode` and `statusdescription` in row data
2. **Status Update API**: Create endpoint to transition row status (T01→T02, T02→T04, etc.)
3. **Audit Trail**: Track status changes with timestamp and user who made the change
4. **Approval Remarks**: Populate rejection message for T03 rows from approver feedback
5. **Batch Status Updates**: Allow approver to approve/reject multiple rows at once

## Files Modified

- `src/pages/OperationsTargetSettingPage.jsx` - Complete implementation

## Lines Changed Summary

- Line 1645-1695: Added helper functions
- Line 305-340: Added statuscode fields to row initialization
- Line 2530-2560: Updated tr element styling
- Line 2623: Updated Action Code select
- Line 2729: Updated SI select
- Line 3025: Updated Save button
- Line 3062: Updated Add Entry button
- Line 3098-3123: Updated Edit button styling
- Line 3130-3155: Updated Delete button styling

## Notes

- All changes follow existing code style and patterns
- No external dependencies added
- Backward compatible with existing row object structure
- Ready for production integration with status-aware backend API
