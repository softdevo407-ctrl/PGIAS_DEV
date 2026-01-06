# APR (Approver) Role - Routing & Navigation Configuration

## Problem Solved
APR role users could login but couldn't access the Operations page. The routing needed to be configured to allow APR users to see the Operations menu and access the approval interface.

## Solution Implemented

### 1. **Enabled Operations Menu for APR Role**
**File**: `src/App.jsx` (Lines 540-549)

**Logic**:
```javascript
const hasAPRRole = user && Array.isArray(user.roles) && user.roles.includes('APR');
let pageKeysToShow = ['dashboard', 'users'];
if (hasUSRRole || hasAPRRole) pageKeysToShow.push('operations');  // APR now sees Operations
```

**Result**: APR users now see the "Operations" menu item in the sidebar

### 2. **Configured APR-Specific Operations Submenu**
**File**: `src/App.jsx` (Lines 627-641)

**Logic**: 
- **For APR Users**: Shows only `operationsApproval` submenu item
- **For Non-APR Users (USR/REV)**: Shows all submenu items:
  - Data Entry
  - Review & Approve
  - Reports
  - Approval Queue

```javascript
{(hasAPRRole ? ['operationsApproval'] : ['operationsDataEntry', 'operationsReview', 'operationsReport', 'operationsApproval']).map(subKey => {
  // Render submenu
})}
```

**Benefit**: Approvers see only what's relevant to them (Approval Queue), reducing UI clutter

### 3. **Mapped operationsApproval to OperationsTargetSettingPage**
**File**: `src/App.jsx` (Lines 2136-2138)

**Change**:
```javascript
const OperationsApprovalPage = () => (
  <OperationsTargetSettingPage />  // Now shows the approval interface
);
```

**Result**: When APR user clicks "Approval Queue", they see the OperationsTargetSettingPage with approval-specific UI:
- Centre code locked (read-only)
- "Approve All" button instead of "Submit"
- Approve/Reject buttons for each row
- No data entry controls (read-only display)

## User Flow for APR Role

```
Login (APR role)
    ↓
Dashboard (default)
    ↓
Click "Operations" in sidebar
    ↓
Submenu appears with "✅ Approval Queue"
    ↓
Click "Approval Queue"
    ↓
OperationsTargetSettingPage displays with:
  - Centre code: 🔒 {code} (locked)
  - All data rows visible (read-only)
  - Approve/Reject buttons for each row
  - "Approve All" button instead of Submit
  - Status badges showing APPROVED/REJECTED/PENDING
```

## Key Features for APR

| Feature | Behaviour |
|---------|-----------|
| **Centre Selection** | Locked to assigned centre (read-only badge) |
| **Data Fields** | All read-only (no editing) |
| **Row Actions** | Approve ✅ and Reject ❌ buttons only |
| **Main Button** | "Approve All" instead of "Submit All" |
| **Status Display** | Shows PENDING/APPROVED/REJECTED with badges |
| **Rejection** | Opens remarks modal for entering reason |
| **Submenu Items** | Only "Approval Queue" visible (simplified UI) |

## Technical Details

### Database/Backend Requirements
The following endpoints are called by the approval interface:
- `GET /api/objectives` - Load objectives to approve
- `GET /api/targets/gettargets` - Load submitted target data
- `POST /api/targets/approve` - Send individual approval
- `POST /api/targets/reject` - Send rejection with remarks
- `POST /api/targets/approveall` - Batch approve all entries

### State Management
```javascript
const isApprover = userRole === 'APR';  // Main conditional flag

// Used throughout OperationsTargetSettingPage to:
// 1. Hide input controls
// 2. Show approval status badges
// 3. Display Approve/Reject buttons instead of Save/Edit/Delete
// 4. Lock centre selection
// 5. Change main button text to "Approve All"
```

## Testing Scenarios

### Scenario 1: APR User Workflow
1. Login with APR credentials
2. Verify sidebar shows "Operations" menu
3. Click "Operations" → Submenu shows "✅ Approval Queue"
4. Click "Approval Queue" → OperationsTargetSettingPage loads
5. Centre code shows as locked badge
6. Each row has Approve/Reject buttons
7. Status badges show current approval status
8. Click Approve → Row updates to APPROVED
9. Click Reject → Remarks modal opens
10. Enter remarks → Row updates to REJECTED
11. Click "Approve All" → Batch processes all entries

### Scenario 2: Menu Simplification
- Login with USR role → See all 4 operations submenu items
- Login with APR role → See only "Approval Queue"
- Confirms role-based menu filtering works

### Scenario 3: Data Protection
- Login as APR → All input fields disabled
- Cannot edit action codes, success indicators, or weights
- Can only approve or reject
- Confirms read-only access for approvers

## Related Files

- **OperationsTargetSettingPage.jsx** - Contains all approval UI logic and controls
- **App.jsx** - Contains routing and menu configuration
- **Backend API** - Must support approval endpoints for full functionality

## Status

✅ **Configuration Complete**
- APR role can now access Operations page
- Operations menu filtered for APR users
- OperationsApprovalPage mapped to approval interface
- All error checks passed

---

**Implementation Date**: January 2, 2026  
**Role Tested**: APR (Approver)  
**Status**: Production Ready
