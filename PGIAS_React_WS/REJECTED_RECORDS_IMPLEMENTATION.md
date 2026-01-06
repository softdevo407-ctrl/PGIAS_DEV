# Rejected Records Feature Implementation

## Overview
Successfully implemented rejected records functionality in **OperationsTargetSettingPage.jsx** to display records that were rejected by approvers with their approval remarks.

## Implementation Details

### 1. **State Management**
Added two new state variables to track rejected records:
- `rejectedRecords` - Stores the array of rejected target entries fetched from API
- `showRejectionRemarks` - Object tracking which rejected rows have their remarks expanded

```jsx
const [rejectedRecords, setRejectedRecords] = useState([]); // Store rejected records with remarks
const [showRejectionRemarks, setShowRejectionRemarks] = useState({}); // Track which rejected rows show remarks
```

### 2. **Fetch Rejected Records Function**
Created `fetchRejectedRecords()` async function (lines 664-725) that:
- Calls API endpoint: `GET /api/targets/rejected?financialyear={fy}&centrecode={code}`
- Maps rejected records to row objects with `isRejected=true`
- Sets `statuscode='T03'` for rejected status
- Auto-expands objectives containing rejected records for visibility
- Includes error handling and logging

**Key Features:**
```jsx
const rejectedRows = data.map((item, idx) => {
  const mappedRow = {
    id: item.id || `rejected-${idx}`,
    objectCode: item.objectcode,
    objectivecode: item.objectcode,
    actionCode: item.actioncode,
    actionName: item.actiondescription,
    successIndicatorCode: item.successindicatorcode,
    siName: item.siname,
    siDescription: item.sidescription,
    statuscode: 'T03', // Rejected status
    approvalRemarks: item.approvalremarks, // Store remarks for display
    isRejected: true, // Mark as rejected
    isSaved: true // Mark as saved (from DB)
  };
  return mappedRow;
});
```

### 3. **Data Loading Integration**
Updated the centre selection `onChange` handler (line 1985) to fetch both saved AND rejected records:

```jsx
// Fetch both saved and rejected records
Promise.all([
  fetchSavedRowsForCentre(selectedCentre, selectedFY),
  fetchRejectedRecords(selectedCentre, selectedFY)
]).then(([savedRows, rejectedRows]) => {
  setRows(prev => {
    const templateRows = prev.filter(r => !r.isSaved);
    const newRows = [...savedRows, ...templateRows];
    return newRows;
  });
  setRejectedRecords(rejectedRows);
});
```

### 4. **Table Rendering Updates**

#### 4a. Combined Display Logic (line 2240)
Modified to include rejected records alongside saved rows:
```jsx
let objEntries = rows.filter(r => r.objectCode === obj.objectivecode);
const objRejectedEntries = rejectedRecords.filter(r => r.objectCode === obj.objectivecode);
let allEntries = [...objEntries, ...objRejectedEntries];
```

#### 4b. Row Styling (line 2310)
Added dynamic styling based on row status:
- **Rejected Rows:** Light red (#ffe6e6) with red border (#dc3545)
- **Saved Rows:** Light green (#d4edda) with green border (#28a745)  
- **New Rows:** Light gray (#f8f9fa) with blue border (#0066cc)

```jsx
const isRejected = row.isRejected === true;
const isSaved = row.isSaved === true;

if (isRejected) {
  rowBgColor = '#ffe6e6';
  rowBorderColor = '#dc3545';
  rowHoverColor = '#ffcccc';
} else if (isSaved) {
  rowBgColor = '#d4edda';
  rowBorderColor = '#28a745';
  rowHoverColor = '#c8e6c9';
}
```

#### 4c. Rejected Status Badge (line 2480)
Added red ❌ REJECTED badge that appears for rejected rows:
- Shows only when `isRejected === true`
- Displays tooltip: "Rejected: {approval remarks}"
- Clickable to expand/collapse remarks
- Has pulse animation for visibility
- Red background with white text

```jsx
{isRejected && (
  <div 
    title={`Rejected: ${row.approvalRemarks || 'No remarks provided'}`}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      backgroundColor: '#dc3545',
      color: 'white',
      padding: '2px 6px',
      borderRadius: '3px',
      cursor: 'pointer',
      fontSize: '0.75rem',
      fontWeight: 'bold',
      whiteSpace: 'nowrap',
      animation: 'pulse 1s infinite'
    }}
    onClick={() => setShowRejectionRemarks(prev => ({...prev, [row.id]: !prev[row.id]}))}
  >
    ❌ REJECTED
  </div>
)}
```

### 5. **Rejection Remarks Display** (lines 2977-3027)
New collapsible row that displays when:
- Row is rejected (`isRejected === true`)
- User clicks the REJECTED badge
- State `showRejectionRemarks[row.id] === true`

**Features:**
- Yellow background (#fff3cd) with warning styling
- Warning icon (⚠️) with red background
- "Rejection Remarks:" header
- Italicized remarks text in white box with yellow border
- Clean, professional layout with proper spacing
- Graceful fallback: "No remarks provided by the approver."

```jsx
{isRejected && showRejectionRemarks[row.id] && (
  <tr style={{
    backgroundColor: '#fff3cd',
    borderLeft: '5px solid #ffc107',
    animation: 'slideDown 0.3s ease'
  }}>
    <td colSpan="10" style={{padding: '0.75rem 1rem'}}>
      {/* Remarks display content */}
    </td>
  </tr>
)}
```

## User Experience Flow

1. **Selection:** User selects a centre and financial year
2. **Loading:** Both saved and rejected records are fetched automatically
3. **Display:** 
   - Saved records appear with green styling
   - Rejected records appear with red styling and ❌ REJECTED badge
   - Objectives with rejected records are auto-expanded
4. **Interaction:** User clicks REJECTED badge to view remarks
5. **Visibility:** Remarks row slides down with yellow background and warning styling

## Visual Indicators

| Status | Border Color | Background | Badge | Icon |
|--------|-------------|------------|-------|------|
| New/Template | Blue (#0066cc) | Light Gray (#f8f9fa) | None | — |
| Saved | Green (#28a745) | Light Green (#d4edda) | None | — |
| Rejected | Red (#dc3545) | Light Red (#ffe6e6) | ❌ REJECTED | Pulse animation |

## API Integration

**Endpoint Used:**
```
GET /api/targets/rejected?financialyear={year}&centrecode={code}
```

**Response Format Expected:**
```json
[
  {
    "id": "123",
    "objectcode": "OBJ001",
    "actioncode": "ACT001",
    "actiondescription": "Action Description",
    "successindicatorcode": "SI001",
    "siname": "SI Name",
    "sidescription": "SI Description",
    "approvalremarks": "This target is not achievable based on current resources",
    "statuscode": "T03"
  }
]
```

## Code Statistics

- **Lines Added:** ~120 lines
- **Files Modified:** 1 (OperationsTargetSettingPage.jsx)
- **New Functions:** 1 (fetchRejectedRecords)
- **State Variables Added:** 2 (rejectedRecords, showRejectionRemarks)
- **Syntax Errors:** 0 ✅

## Testing Checklist

- [x] Compile without errors
- [x] State initialization correct
- [x] Centre change handler fetches both saved and rejected records
- [x] Rejected records properly filtered by objective
- [x] Row styling updates correctly based on status
- [x] ❌ REJECTED badge displays only for rejected rows
- [x] Remarks row toggles on badge click
- [x] Remarks display with proper formatting
- [x] Auto-expand objectives containing rejected entries
- [x] Handle case with no rejected records
- [x] Handle case with multiple rejected records
- [x] Proper error handling for API calls

## Future Enhancements

1. **Edit Rejected Records:** Allow users to modify and resubmit rejected entries
2. **Filter:** Add filter to show only rejected records
3. **Statistics:** Show count of rejected vs approved records
4. **History:** Track rejection history with timestamps
5. **Re-submission:** Automatic re-submission workflow for rejected entries
6. **Notifications:** Toast notifications when new rejections are added

## File Location
`e:\Dev WS\PGIAS_React_WS\src\pages\OperationsTargetSettingPage.jsx`

## Related Documentation
- [ApprovalQueuePage Implementation](./APPROVAL_QUEUE_IMPROVEMENTS.md)
- [API Integration Guide](./API_INTEGRATION_GUIDE.md)
- [Implementation Complete](./IMPLEMENTATION_COMPLETE.md)

---

**Implementation Date:** 2024
**Status:** ✅ COMPLETE
**Quality:** No errors, fully functional
