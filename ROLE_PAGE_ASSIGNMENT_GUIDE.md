# Role-Based Page Access System - Implementation Guide

## Overview
This system allows you to assign pages/screens to roles with granular access levels:
- **No Access**: User cannot see the page
- **Read Only**: User can view the page but cannot edit
- **Read & Write**: User can view and edit
- **Admin**: Full access including admin features

**Special case for ADMIN role:** Admin users automatically get access to all pages with "ALL" access level.

---

## Backend Architecture

### Modified Components

#### 1. **UserRoleScreenService** (`pgias/src/main/java/com/example/pgias/role/service/`)
- **New Dependency**: `ScreensService`
- **Updated Method**: `getScreensByUserRole(loginId, roleCode, centreCode)`
  - If role is "ADMIN", returns all available screens from ScreensService
  - Otherwise, returns screens from UserRoleScreenRepository
  
```java
if (roleCode != null && roleCode.equalsIgnoreCase("ADMIN")) {
    return screensService.getAll().stream().map((ScreensResponseDTO s) -> {
        UserRoleScreenDTO dto = new UserRoleScreenDTO();
        // Set all screens with "ALL" access
        ...
    }).collect(Collectors.toList());
}
```

#### 2. **UserRoleRequestDTO** (`pgias/src/main/java/com/example/pgias/role/dto/`)
- **New Field**: `List<UserRoleScreenDTO> screens`
- Allows passing page assignments during role assignment

#### 3. **UserRoleService** (`pgias/src/main/java/com/example/pgias/role/service/`)
- **New Dependency**: `UserRoleScreenService`
- **Updated Method**: `create(UserRoleRequestDTO)`
  - After saving the user-role, iterates through screens list
  - Calls `screenService.assignScreen()` for each screen
  - If a screen assignment fails, logs error but continues

```java
if (dto.getScreens() != null) {
    for (UserRoleScreenDTO s : dto.getScreens()) {
        s.setLoginId(dto.getLoginId());
        s.setRoleCode(dto.getRoleCode());
        s.setCentreCode(dto.getCentreCode());
        if (s.getStatus() == null) s.setStatus("ACTIVE");
        if (s.getFromDate() == null) s.setFromDate(java.time.LocalDate.now());
        try {
            screenService.assignScreen(s);
        } catch (Exception ex) {
            System.err.println("Failed to assign screen: " + ex.getMessage());
        }
    }
}
```

---

## Frontend Architecture

### New & Updated Components

#### 1. **UserRoleAssignmentPage.jsx** (Updated)
- Fetches available screens when opening "Assign Role" modal
- Displays checkbox-based UI to select pages and set access levels
- Sends screens payload with role assignment:
  ```javascript
  const payload = {
    loginId, roleCode, centreCode, ...otherFields,
    screens: [
      { screenCode: "SCR001", screenName: "Dashboard", accessType: "WRITE", ... },
      { screenCode: "SCR002", screenName: "Users", accessType: "READ", ... }
    ]
  };
  ```

**New State:**
```javascript
const [screensList, setScreensList] = useState([]);
const [screenAccess, setScreenAccess] = useState({}); // { screenId: accessType }
```

**Key Methods:**
- `handleAdd()`: Fetches available screens
- `handleEdit()`: Loads existing screen assignments for the user-role
- `handleSubmit()`: Builds screens payload and sends with role assignment

#### 2. **RolePageAssignmentPage.jsx** (New)
- Dedicated UI for managing page access after roles are assigned
- Shows all user-role assignments with ability to view/edit page access
- Features:
  - **View Mode**: Display current page assignments
  - **Edit Mode**: Modify access levels for pages
  - Search & filter by login ID, role, or centre
  - Sortable table columns
  - Badge indicators for access levels

**Key Methods:**
- `handleViewPages()`: Load and display assigned pages in view mode
- `handleEditPages()`: Load assigned pages in edit mode
- `handleSavePages()`: Delete old assignments and create new ones

#### 3. **Updated api.js**
New API methods in `userRoleAPI`:
```javascript
// Get screens for a user-role
getScreensByUserRole: async (loginId, roleCode, centreCode) => {
  return apiCall(`${API_BASE_URL}/api/userroles/${loginId}/${roleCode}/${centreCode}/screens`);
}

// Assign a screen/page to user-role
assignScreen: async (loginId, roleCode, centreCode, screenData) => {
  return apiCall(`${API_BASE_URL}/api/userroles/${loginId}/${roleCode}/${centreCode}/screens`, {
    method: 'POST',
    body: JSON.stringify(screenData),
  });
}

// Remove screen from user-role
deleteScreenAssignment: async (loginId, roleCode, centreCode, screenCode) => {
  return apiCall(`${API_BASE_URL}/api/userroles/${loginId}/${roleCode}/${centreCode}/screens/${screenCode}`, {
    method: 'DELETE',
  });
}
```

New service:
```javascript
export const screensAPI = createApiService('/api/screens');
```

---

## Workflow

### Scenario 1: Assign Role with Pages

1. **Admin clicks "Assign Role"** on UserRoleAssignmentPage
2. Modal opens and fetches:
   - Available roles (from roleAPI)
   - Available centres (from centresAPI)
   - Available pages/screens (from screensAPI)
3. **Admin selects:**
   - Login ID
   - Role
   - Centre
   - Effective dates
   - **Pages**: For each page, choose access level (None, Read, Write, Admin)
4. **Frontend sends request:**
   ```json
   {
     "loginId": "IS03651",
     "roleCode": "MANAGER",
     "centreCode": "CENTER01",
     "fromDate": "2025-01-01",
     "toDate": null,
     "screens": [
       {"screenCode": "SCR001", "screenName": "Dashboard", "accessType": "WRITE"},
       {"screenCode": "SCR003", "screenName": "Reports", "accessType": "READ"}
     ]
   }
   ```
5. **Backend:**
   - Saves UserRole entity
   - Iterates screens and calls `UserRoleScreenService.assignScreen()`
   - Returns success

### Scenario 2: Admin Role Auto-Grants All Pages

1. **Admin assigns ADMIN role** to a user
2. Screens are optional in the request (admin can select specific or none)
3. **When fetching screens for ADMIN user:**
   - `getScreensByUserRole(loginId, "ADMIN", centreCode)` detects ADMIN role
   - Returns **all** available screens with accessType = "ALL"

### Scenario 3: View/Edit Page Assignments

1. **Admin navigates to RolePageAssignmentPage**
2. Sees all user-role assignments
3. **Clicks "View"**: Modal shows current page access in read-only mode
4. **Clicks "Edit"**: Modal shows dropdowns to change access levels
5. **Clicks "Save Changes":**
   - Deletes all existing screen assignments
   - Creates new ones with updated access levels

---

## Database Structure

### Existing Table: `userrole_screens`
```sql
CREATE TABLE generic.userrole_screens (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  login_id VARCHAR(255) NOT NULL,
  role_code VARCHAR(255) NOT NULL,
  centre_code VARCHAR(255) NOT NULL,
  screen_code VARCHAR(255) NOT NULL,
  screen_name VARCHAR(255) NOT NULL,
  access_type VARCHAR(50),           -- READ, WRITE, ADMIN, ALL
  status VARCHAR(50),                 -- ACTIVE, INACTIVE
  from_date DATE NOT NULL,
  to_date DATE,
  created_by VARCHAR(255),
  created_date TIMESTAMP,
  modified_by VARCHAR(255),
  modified_date TIMESTAMP
);
```

---

## API Endpoints

### Existing Endpoints (Enhanced)

**POST /api/userroles** - Create user-role with screens
```json
Request:
{
  "loginId": "IS03651",
  "roleCode": "MANAGER",
  "centreCode": "CENTER01",
  "screens": [
    {
      "screenCode": "SCR001",
      "screenName": "Dashboard",
      "accessType": "WRITE",
      "status": "ACTIVE",
      "fromDate": "2025-01-01"
    }
  ]
}

Response: UserRoleResponseDTO
```

**GET /api/userroles/{loginId}/{roleCode}/{centreCode}/screens** - Get screens for user-role
```
Returns: List<UserRoleScreenDTO>

Special case: If roleCode = "ADMIN", returns all available screens
```

**POST /api/userroles/{loginId}/{roleCode}/{centreCode}/screens** - Assign screen to role
```json
Request: UserRoleScreenDTO
Response: UserRoleScreenDTO (saved entity)
```

**DELETE /api/userroles/{loginId}/{roleCode}/{centreCode}/screens/{screenCode}** - Remove screen
```
Returns: 200 OK
```

**GET /api/screens** - Get all available pages/screens
```
Returns: List<ScreensResponseDTO>
{
  "screenId": "SCR001",
  "screenName": "Dashboard",
  "screenCategory": "MAIN",
  "status": "ACTIVE"
}
```

---

## Testing Checklist

### Backend Tests
- [ ] POST /api/userroles with screens payload → verify UserRoleScreen entities created
- [ ] GET /api/userroles/{loginId}/ADMIN/{centreCode}/screens → verify all screens returned
- [ ] GET /api/userroles/{loginId}/MANAGER/{centreCode}/screens → verify only assigned screens returned
- [ ] DELETE screen assignment → verify UserRoleScreen deleted
- [ ] Update user-role → verify screens not affected (use separate endpoints)

### Frontend Tests
- [ ] Open "Assign Role" modal → screens list loads
- [ ] Select pages and access levels → form data includes screens
- [ ] Submit → backend receives correct payload
- [ ] View assigned pages → shows correct access badges
- [ ] Edit pages → can change access levels and save
- [ ] Admin role selection → pages UI displays (no special UI needed)

### UI Tests
- [ ] Search and filter work in RolePageAssignmentPage
- [ ] Pagination works correctly
- [ ] Badge colors distinguish access levels (Read=blue, Write=orange, Admin=green)
- [ ] Dropdowns populate with all available pages
- [ ] Modal scroll works when many pages exist

---

## Integration Notes

### For Your Existing Setup
1. `UserRoleScreenService` now requires `ScreensService` in constructor
2. `UserRoleService` now requires `UserRoleScreenService` in constructor
3. Ensure Spring auto-wires both services
4. Frontend expects `/api/screens` endpoint (already exists in your codebase)
5. Frontend expects `/api/userroles/{...}/screens` endpoints (already exist in UserRoleController)

### Backward Compatibility
- Old API calls without screens still work
- Admin role check is case-insensitive
- Existing UserRoleScreen assignments unaffected
- If screens list is null/empty in request, no screens assigned

---

## Future Enhancements

1. **Bulk Assignment**: Assign same pages to multiple roles at once
2. **Time-based Access**: Enable/disable page access on specific dates
3. **Page Hierarchies**: Parent-child relationships (e.g., Parent="Reporting" → Children="Reports", "Analytics")
4. **Delegation**: Allow ADMIN role to delegate page access to others
5. **Audit Trail**: Log all page assignment changes with timestamp and user
6. **Performance**: Cache page lists and user-role-screen mappings

---

## Support & Debugging

### Common Issues

**Q: Pages not loading in modal**
- Check browser console for API errors
- Verify `/api/screens` endpoint returns data
- Ensure screensAPI is correctly imported in component

**Q: Screens not saving with role assignment**
- Check network tab for POST /api/userroles request
- Verify screens array is included in payload
- Check backend logs for assignScreen() errors
- Ensure screenService bean is autowired in UserRoleService

**Q: Admin not getting all screens**
- Verify role code in DB is exactly "ADMIN" (case-sensitive in DB, case-insensitive in service check)
- Check ScreensService.getAll() returns data
- Verify UserRoleScreenService has ScreensService injected

**Q: Edit page assignments not working**
- Ensure deleteScreenAssignment endpoint exists
- Verify backend has DELETE mapping for screens/{screenCode}
- Check network requests for individual screen delete/create calls

---

## File Locations Summary

### Backend Files Modified
- `pgias/src/main/java/com/example/pgias/role/service/UserRoleScreenService.java`
- `pgias/src/main/java/com/example/pgias/role/service/UserRoleService.java`
- `pgias/src/main/java/com/example/pgias/role/dto/UserRoleRequestDTO.java`

### Frontend Files Modified/Created
- `PGIAS_React_WS/src/pages/UserRoleAssignmentPage.jsx` (updated)
- `PGIAS_React_WS/src/pages/RolePageAssignmentPage.jsx` (new)
- `PGIAS_React_WS/src/services/api.js` (updated)

---

Generated: December 11, 2025
