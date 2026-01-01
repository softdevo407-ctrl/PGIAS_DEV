# RBAC Implementation for ScreensPage - Complete Update

## Overview
The ScreensPage component has been enhanced with **Role-Based Access Control (RBAC)** to display screens based on user roles and centre assignments. Only screens assigned to the user's role and centre are visible.

---

## 🔐 Key Features Implemented

### 1. **Role-Based Screen Filtering**
- Screens are filtered based on the user's assigned role
- Fetches role rights from `/api/rolerights` endpoint
- Only displays screens that match the user's role and centre

### 2. **Centre-Based Display**
- Shows user's centre code and centre name from localStorage
- Displays centre code in the table for each screen
- Filters screens by centre code

### 3. **RBAC Info Bar**
- Displays user's role
- Shows centre code
- Shows centre name
- Displays count of assigned screens

### 4. **Admin-Only Operations**
- Only users with 'admin' role can add/edit/delete screens
- Non-admin users see "View Only" status
- Add button is hidden for non-admin roles

### 5. **Enhanced Table Display**
- New column: **🏢 Centre Code** showing screen's assigned centre
- Colour-coded centre badges
- Role-aware action buttons

---

## 📊 Data Flow

```
localStorage (loginId, userRole, centreCode, centreName)
        ↓
initializeRBAC() → Fetches user info
        ↓
Fetches /api/rolerights → Gets role-screen assignments
        ↓
Filters screens → rbacFilteredItems
        ↓
Further filter by search → filteredData
        ↓
Sort, Paginate → paginatedData
        ↓
Display to user
```

---

## 🔧 New State Variables

```jsx
// RBAC States
const [userRole, setUserRole] = useState(null);                    // User's role
const [userCentre, setUserCentre] = useState(null);                // Centre name
const [userCentreCode, setUserCentreCode] = useState(null);        // Centre code
const [assignedScreens, setAssignedScreens] = useState([]);        // Screens assigned to role
const [rbacLoading, setRbacLoading] = useState(true);             // RBAC loading state
```

---

## 🎯 Core Functions Added

### 1. **initializeRBAC()** - Initializes RBAC on component mount
```jsx
- Reads loginId, userRole, centreCode, centreName from localStorage
- Validates user role
- Fetches role-screen assignments from /api/rolerights
- Stores assigned screens in state
- Initializes fetchAll()
```

### 2. **rbacFilteredItems** - Filters screens based on role and centre
```jsx
- Checks if screen is in assignedScreens list
- Verifies centre code match
- Returns only authorized screens
```

### 3. **openAdd()** - Opens add modal with RBAC info
```jsx
- Pre-fills userId from localStorage
- Pre-fills centreCode and centreName from user context
- Only accessible to admin users
```

### 4. **openEdit()** - Opens edit modal with existing RBAC info
```jsx
- Preserves centre code and name
- Updates userId
- Only accessible to admin users
```

---

## 📝 Form Fields Added

### New Fields in Form State
```jsx
centreCode: '',      // Centre code (e.g., '01', '02')
centreName: '',      // Centre name (e.g., 'HQ', 'Region 1')
```

### Form Inputs in Modal
```jsx
// Centre Code input
<input 
  placeholder="e.g., 01, 02"
  value={form.centreCode}
  onChange={(e) => setForm({...form, centreCode: e.target.value})}
/>

// Centre Name input
<input 
  placeholder="e.g., HQ, Region 1"
  value={form.centreName}
  onChange={(e) => setForm({...form, centreName: e.target.value})}
/>

// User ID (read-only)
<input 
  value={form.userId}
  readOnly
/>
```

---

## 🎨 UI Enhancements

### 1. **RBAC Info Bar** (Top of page)
Displays user's role, centre code, and centre name:
```jsx
👤 Role: [User's Role]
🏢 Centre Code: [Centre Code]
🏭 Centre Name: [Centre Name]
📊 [N] screens assigned to your role
```

### 2. **Header Update**
- Added lock icon and "(RBAC Enabled)" label
- Admin-only "Add Screen" button
- Non-admin users see "View Only" message

### 3. **Table Column**
- New column: **🏢 Centre Code**
- Blue badge display: `#e3f2fd` background, `#1976d2` text

### 4. **Action Buttons**
- Admin users: Edit/Delete buttons visible
- Non-admin users: "👁️ View Only" text displayed

### 5. **Empty State**
- Shows lock icon
- Different message for "No screens assigned" vs "No results"

---

## 🔑 localStorage Keys Used

| Key | Description | Example |
|-----|-------------|---------|
| `loginId` | User's login ID | `USER001` |
| `userRole` | User's assigned role | `admin`, `manager`, `user` |
| `centreCode` | User's centre code | `01`, `02`, `HQ` |
| `centreName` | User's centre name | `Headquarters`, `Regional Office` |

---

## 🌐 API Endpoints Used

### 1. **GET /api/screens**
Fetches all screens (filters applied on frontend)

### 2. **GET /api/rolerights**
Fetches role-screen assignments
```
Response: [
  {
    roleId: 1,
    rolename: 'admin',
    screenId: 'SCREEN001',
    screenCategory: 'USER_MGMT',
    ...
  },
  ...
]
```

### 3. **POST /api/screens**
Creates new screen (admin only)

### 4. **PUT /api/screens/{screenId}/{screenCategory}**
Updates screen (admin only)

### 5. **DELETE /api/screens/{screenId}/{screenCategory}**
Deletes screen (admin only)

---

## 🔍 Filtering Logic

### Screen Display Rules
```
Show Screen IF:
  1. Screen is in assignedScreens (matched by screenId & screenCategory)
    AND
  2. Screen's centreCode === userCentreCode OR Screen has no centreCode (All)
```

### Example Scenarios

**Scenario 1: Admin User with Centre Code '01'**
- Sees all screens assigned to admin role
- Sees screens with centreCode='01'
- Sees screens with centreCode=null (for all centres)
- Can Add/Edit/Delete

**Scenario 2: Manager User with Centre Code '02'**
- Sees only screens assigned to manager role
- Sees screens with centreCode='02'
- Sees screens with centreCode=null
- Cannot Add/Edit/Delete (View only)

**Scenario 3: User with Role Not in System**
- Sees "No screens assigned to your role"
- Cannot add screens

---

## ✅ Testing Checklist

- [ ] Role-based screen filtering works
- [ ] Centre code filtering works
- [ ] RBAC info bar displays correctly
- [ ] Admin can add/edit/delete screens
- [ ] Non-admin cannot add/edit/delete screens
- [ ] Table shows centre code column
- [ ] Search works on filtered data
- [ ] Pagination works correctly
- [ ] localStorage values are used correctly
- [ ] Error handling for missing role/centre
- [ ] Loading states display correctly

---

## 🚀 Deployment Notes

### Required Frontend Updates
1. Ensure localStorage is set with: `loginId`, `userRole`, `centreCode`, `centreName`
2. These values should be set during login in App.jsx

### Required Backend Updates
1. `/api/rolerights` endpoint must return role-screen mappings
2. `/api/screens` should include `centreCode` and `centreName` fields
3. Ensure role validation is implemented

### Example localStorage Setup (in App.jsx)
```jsx
localStorage.setItem('loginId', userData.loginId);
localStorage.setItem('userRole', userData.rolename);
localStorage.setItem('centreCode', userData.centreCode);
localStorage.setItem('centreName', userData.centreName);
```

---

## 🛡️ Security Considerations

1. **Frontend Filtering Only** - Add backend validation too!
2. **API Endpoints** - Should validate user role on every request
3. **Role Verification** - Compare requested screens with user's role
4. **Centre Authorization** - Verify user has access to centre before saving
5. **Audit Logging** - Log all add/edit/delete operations with user info

---

## 📋 Summary

The ScreensPage is now **fully RBAC-enabled** with:
- ✅ Role-based screen visibility
- ✅ Centre-based filtering
- ✅ Admin-only operations
- ✅ Enhanced UI showing centre information
- ✅ Proper access control indicators
- ✅ User-friendly RBAC status display
