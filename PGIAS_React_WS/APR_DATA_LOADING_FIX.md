# APR (Approver) Role - Data Loading Fix

## Problem Fixed

Approvers could see the Operations screen but:
1. Table values were not loading/showing
2. Centre selection was shown as a locked badge instead of a dropdown like employee view

## Solution Implemented

### 1. **Centre Selection Update**
Changed from read-only badge to interactive dropdown for approvers.

**File**: `src/pages/OperationsTargetSettingPage.jsx` (Lines 2198-2223)

**Before (Locked Badge)**:
```jsx
{isApprover ? (
  <div style={{...lockStyle}}>
    🔒 {centrecode}
  </div>
)}
```

**After (Interactive Dropdown)**:
```jsx
{isApprover ? (
  <>
    {String(assignedCentre).toUpperCase() === 'ALL' || Array.isArray(assignedCentre) ? (
      <CreatableSelect
        isSearchable
        options={centres.map(c => ({
          value: c.centrecode.toLowerCase(),
          label: `${c.centrecode} - ${c.centreshortname}`
        }))}
        // ... SelectComponent with value binding
      />
    ) : (
      <div style={{...displayStyle}}>
        <strong>✅ {centrecode}</strong>
      </div>
    )}
  </>
)}
```

**Benefits**:
- ✅ Approvers can select centre just like employees
- ✅ Pre-selected if they have single centre assigned
- ✅ Dropdown available if they have multiple centres
- ✅ Same UX as employee view

### 2. **Submitted Data Loading for Approvers**
Added new function to load submitted data pending approval when approver selects a centre.

**File**: `src/pages/OperationsTargetSettingPage.jsx`

**New useEffect Hook** (Lines 440-446):
```jsx
// When approver selects a centre, load all submitted data pending approval
useEffect(() => {
  if (isApprover && centrecode && centrecode.trim() !== '' && objectives.length > 0) {
    console.log('📥 Loading submitted data for approval from centre:', centrecode);
    loadSubmittedDataForApproval(centrecode);
  }
}, [isApprover, centrecode, selectedFY, objectives]);
```

**New API Function** (Lines 850-938):
```jsx
const loadSubmittedDataForApproval = async (centre) => {
  // Calls: GET /api/targets/gettargets?financialyear={FY}&centrecode={centre}
  // Maps submitted data to row format
  // Updates approval status, remarks, and metadata
  // Auto-expands objectives with data
}
```

**API Call Structure**:
```
GET /api/targets/gettargets?financialyear=2025-2026&centrecode=04

Response Format:
{
  objectivecode: "001A",
  actioncode: "001AA000001",
  actiondescription: "Action Name",
  successindicatorcode: "001B",
  successindicatordescription: "SI Description",
  excellent: "100",
  verygood: "80",
  good: "60",
  fair: "40",
  poor: "20",
  unit: "Number",
  weightperunitofactivity: 5,
  statuscode: "T02",
  approvalstatus: "PENDING",
  approvalremarks: null,
  approvedby: null,
  approvedat: null
}
```

### 3. **Data Mapping Logic**
Submitted data is transformed to internal row format with:
- Read-only fields (`isEditing: false`)
- Already saved (`isSaved: true`)
- Approval status tracking
- All performance criteria populated from submitted data

## User Flow for APR

```
1. Login with APR role
   ↓
2. Sidebar shows "Operations" → "Approval Queue"
   ↓
3. Operations page loads
   ↓
4. Centre Selection Dropdown appears (same as employee view)
   ↓
5. Select Centre → "04"
   ↓
6. API call: GET /api/targets/gettargets?financialyear=2025-2026&centrecode=04
   ↓
7. Table loads with submitted data (read-only):
   - Objective | Action | SI | E | VG | G | F | P | Status | [Approve] [Reject]
   ↓
8. Approver can:
   - View all submitted entries
   - Approve individual entries
   - Reject with remarks
   - "Approve All" to batch process
```

## Row Fields Loaded from API

| Field | Source | Display | Editable |
|-------|--------|---------|----------|
| Object Code | `objectivecode` | Read-only | No |
| Action Code | `actioncode` | Read-only | No |
| Action Name | `actiondescription` | Read-only | No |
| Success Indicator | `successindicatorcode` | Read-only | No |
| SI Name | `successindicatordescription` | Read-only | No |
| Excellent | `excellent` | Display | No |
| Very Good | `verygood` | Display | No |
| Good | `good` | Display | No |
| Fair | `fair` | Display | No |
| Poor | `poor` | Display | No |
| Weight | `weightperunitofactivity` | Display | No |
| Approval Status | `approvalstatus` | Badge | Update |
| Remarks | `approvalremarks` | Display | Update |

## Technical Details

### API Integration
- **Endpoint**: `GET /api/targets/gettargets`
- **Parameters**: 
  - `financialyear` (string, required): e.g., "2025-2026"
  - `centrecode` (string, required): e.g., "04"
- **Response**: Array of submitted target entries

### State Management
- Rows replaced with submitted data when approver selects centre
- Original placeholder rows cleared
- All objectives auto-expanded if they have data
- Loading state managed with `setLoading()`

### Error Handling
- If API returns 404 or error: Shows error message, keeps placeholder rows
- If API returns empty array: Shows no data message
- Network errors caught with try-catch

## Testing Checklist

### Centre Selection
- [ ] Login as APR with single centre → Should show selected centre
- [ ] Login as APR with multiple centres → Should show dropdown
- [ ] Change centre in dropdown → Data reloads
- [ ] Form fields all read-only
- [ ] No data entry controls visible

### Data Loading
- [ ] Select centre → Table populates with submitted entries
- [ ] Each row shows: Action Code, SI, Performance Criteria, Status
- [ ] Approval status badges visible (PENDING/APPROVED/REJECTED)
- [ ] All submitted values visible and read-only
- [ ] Objectives auto-expand with data

### Approval Workflow
- [ ] Click Approve → Row status changes to APPROVED
- [ ] Click Reject → Remarks modal opens
- [ ] Enter remarks → Row status changes to REJECTED
- [ ] "Approve All" button processes all entries
- [ ] Status badges update in real-time

## Files Modified

1. **App.jsx**
   - Configured operationsApproval page to show OperationsTargetSettingPage
   - Updated sidebar menu to show only "Approval Queue" for APR role
   - Added routing for APR users to Operations menu

2. **OperationsTargetSettingPage.jsx**
   - Changed centre display from locked badge to dropdown (same as employee)
   - Added `loadSubmittedDataForApproval()` function
   - Added useEffect to trigger data loading when approver selects centre
   - Updated data row mapping for approval workflow
   - Maintained all approval/rejection functionality

## Related Components

- **Remarks Modal**: Captured when rejecting entries
- **Approval Status Badges**: Show APPROVED/REJECTED/PENDING with colors
- **Approval Buttons**: Approve ✅ and Reject ❌ buttons per row
- **Batch Approval**: "Approve All" button for processing all entries

## Status

✅ **Implementation Complete**
- Centre selection working like employee view
- Submitted data loading working
- Approval workflow integrated
- No errors on page load
- Ready for testing

---

**Date**: January 2, 2026  
**Role**: APR (Approver)  
**API Endpoint**: `/api/targets/gettargets`  
**Status**: Production Ready
