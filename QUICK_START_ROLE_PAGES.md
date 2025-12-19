# Quick Start Guide - Role-Based Page Access

## What's Been Implemented

Your system now supports **granular page/screen access control** when assigning roles:
- Assign roles to users with specific page permissions
- Choose access levels: **None**, **Read Only**, **Read & Write**, **Admin**
- Admin users automatically get access to all pages
- View and edit page assignments after role creation

---

## Getting Started

### 1. Backend Setup (Java/Spring Boot)

**No additional dependencies needed!** The code uses your existing services.

**Modified Java Files:**
```
pgias/src/main/java/com/example/pgias/
├── role/
│   ├── service/
│   │   ├── UserRoleScreenService.java (updated)
│   │   └── UserRoleService.java (updated)
│   └── dto/
│       └── UserRoleRequestDTO.java (updated)
```

**Build & Run:**
```bash
cd "e:\Dev WS\PGIAS WS\pgias"
mvn clean install
mvn spring-boot:run
```

### 2. Frontend Setup (React)

**New Files:**
```
PGIAS_React_WS/src/pages/
└── RolePageAssignmentPage.jsx  (new)

PGIAS_React_WS/src/services/
└── api.js  (updated with new endpoints)
```

**Updated Files:**
```
PGIAS_React_WS/src/pages/
└── UserRoleAssignmentPage.jsx  (updated with page selector)
```

**Install & Run:**
```bash
cd "e:\Dev WS\PGIAS_React_WS"
npm install
npm run dev
```

---

## User Workflows

### Workflow 1: Assign Role with Pages

1. Go to **User Role Assignment** page
2. Click **"Assign Role"** button
3. Fill in:
   - **Login ID**: Employee code (e.g., IS03651)
   - **Role**: Select from dropdown
   - **Centre**: Select from dropdown
   - **Effective From/To**: Date range (optional)
4. **NEW:** Scroll down to **"Assign Pages & Permissions"** section
5. For each page, select access level:
   - **No Access**: User won't see this page
   - **Read Only**: View-only (no editing)
   - **Read & Write**: Can view and edit
   - **Admin**: Full administrative access
6. Click **"Assign"** to save

**Example:**
```
User: IS03651
Role: MANAGER
Centre: CENTER01
Pages:
  ✓ Dashboard       → Read & Write
  ✓ User Management → Read Only
  ✓ Reports        → Read & Write
  ✗ Settings       → No Access
```

### Workflow 2: View Assigned Pages

1. Go to new **"Role Page Assignments"** page (📄 icon in navigation)
2. See all user-role-page mappings
3. Click **👁️ View** button to see page access in read-only mode
4. See badge indicators:
   - 🔵 **Read Only**
   - 🟠 **Read & Write**  
   - 🟢 **Admin** / **All** (full access)

### Workflow 3: Edit Page Assignments

1. Go to **"Role Page Assignments"** page
2. Click **✏️ Edit** button for a user-role
3. Modal opens showing all available pages
4. Change access levels using dropdowns
5. Click **"Save Changes"** to update

---

## Admin Role Special Behavior

**When assigning ADMIN role:**
- Admin users **automatically get access to ALL pages** with "ALL" access level
- No need to manually select each page
- You can optionally customize individual page access in the modal
- When viewing an admin user's pages, they'll show all available pages

---

## Database

No new tables needed! Uses your existing:
- `generic.userrole_screens` - stores page assignments with access types
- `generic.screens` - available pages
- `generic.user_roles` - user-role mappings

---

## API Endpoints (Quick Reference)

All endpoints on your existing backend (port 8080):

### Assign Role with Pages
```bash
POST /api/userroles
Content-Type: application/json

{
  "loginId": "IS03651",
  "roleCode": "MANAGER",
  "centreCode": "CENTER01",
  "fromDate": "2025-01-01",
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
```

### Get Pages for User-Role
```bash
GET /api/userroles/IS03651/MANAGER/CENTER01/screens
```

### Assign Page to Role
```bash
POST /api/userroles/IS03651/MANAGER/CENTER01/screens
{
  "screenCode": "SCR001",
  "screenName": "Dashboard",
  "accessType": "WRITE"
}
```

### Remove Page from Role
```bash
DELETE /api/userroles/IS03651/MANAGER/CENTER01/screens/SCR001
```

### Get All Pages
```bash
GET /api/screens
```

---

## Testing Your Setup

### Test 1: Create User-Role with Pages
```bash
curl -X POST http://localhost:8080/api/userroles \
  -H "Content-Type: application/json" \
  -H "X-USER-ID: admin" \
  -d '{
    "loginId": "TEST001",
    "roleCode": "MANAGER",
    "centreCode": "CENTER01",
    "screens": [
      {"screenCode": "SCR001", "screenName": "Dashboard", "accessType": "WRITE"}
    ]
  }'
```

### Test 2: View Pages for User
```bash
curl -X GET http://localhost:8080/api/userroles/TEST001/MANAGER/CENTER01/screens \
  -H "X-USER-ID: admin"
```

### Test 3: Assign ADMIN Role (Should Auto-Return All Screens)
```bash
curl -X GET http://localhost:8080/api/userroles/ADMIN_USER/ADMIN/CENTER01/screens \
  -H "X-USER-ID: admin"
```

---

## Features Summary

| Feature | Status | Notes |
|---------|--------|-------|
| Assign pages during role assignment | ✅ | Integrated in UserRoleAssignmentPage |
| Select access levels per page | ✅ | Read, Write, Admin dropdowns |
| View assigned pages | ✅ | New RolePageAssignmentPage component |
| Edit page assignments | ✅ | Click-to-edit functionality |
| Admin auto-access all pages | ✅ | Backend logic in UserRoleScreenService |
| Search & filter pages | ✅ | Included in RolePageAssignmentPage |
| Pagination | ✅ | Both pages support pagination |
| CRUD operations | ✅ | Full create, read, update, delete |

---

## File Changes Summary

### Backend (3 files changed)
1. **UserRoleScreenService.java**: Inject ScreensService, return all screens for ADMIN
2. **UserRoleService.java**: Persist screens from request when creating role
3. **UserRoleRequestDTO.java**: Add screens list field

### Frontend (2 files created, 1 updated)
1. **RolePageAssignmentPage.jsx**: New page for viewing/editing assignments
2. **UserRoleAssignmentPage.jsx**: Updated modal with page selector
3. **api.js**: New API methods for screen endpoints

---

## Troubleshooting

### Pages not showing in modal?
```
✓ Start backend: mvn spring-boot:run (port 8080)
✓ Check browser console for API errors
✓ Verify /api/screens returns data
✓ Ensure screensAPI is imported in component
```

### Error when saving role?
```
✓ Check backend logs for exceptions
✓ Verify UserRoleScreenService is autowired
✓ Ensure screen codes match existing screens
✓ Verify loginId is valid format
```

### Admin not getting all pages?
```
✓ Verify role code is exactly "ADMIN" in database
✓ Check that /api/screens endpoint works
✓ Ensure ScreensService bean exists
✓ Check browser network tab for API responses
```

---

## Next Steps

1. **Test locally** with your existing data
2. **Add page navigation** - Respect assigned pages in sidebar/navigation
3. **Implement permission checks** - Frontend and backend validation
4. **Add audit logging** - Track who changed what permissions
5. **Bulk operations** - Assign same pages to multiple roles at once

---

## Support

Refer to **ROLE_PAGE_ASSIGNMENT_GUIDE.md** for:
- Detailed architecture explanation
- Complete API reference
- Database schema details
- Advanced features and enhancements

---

**Last Updated**: December 11, 2025
**Status**: ✅ Ready for Testing
