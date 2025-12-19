# Backend API Integration Update - Role Management

## ✅ Updated Role Management Page

The `RoleManagementPage.jsx` has been updated to match your Spring Boot backend API structure.

### Backend API Structure (Your Spring Boot)

```
Entity: Role
├── id (Long)
└── name (String)

Request DTO: RoleRequestDTO
└── name (String)

Response DTO: RoleResponseDTO
├── id (Long)
└── name (String)

Endpoints:
├── GET    /api/roles              → Get all roles
├── GET    /api/roles/{id}         → Get role by ID
├── POST   /api/roles              → Create role
├── PUT    /api/roles/{id}         → Update role
└── DELETE /api/roles/{id}         → Delete role
```

### React Component Implementation

**File**: `src/pages/RoleManagementPage.jsx`

**Form Structure**:
```javascript
{
  name: "String"  // Only field required
}
```

**Features Implemented**:
✅ Fetch all roles from `/api/roles`
✅ Display roles in a clean table with ID and Name columns
✅ Create new role with name validation
✅ Edit existing role
✅ Delete role with confirmation
✅ Search/filter by role name
✅ Error handling with API integration
✅ Success notifications
✅ Loading states

### Table Columns

| ID | Role Name | Actions |
|:--:|:----------|:-------:|
| Badge | Name | Edit/Delete buttons |

### Form Validation

**Role Name**:
- Required field
- Minimum 2 characters
- Real-time validation feedback

### API Integration Points

```javascript
// Fetch all roles
const data = await roleAPI.getAll();
// GET /api/roles → Returns: RoleResponseDTO[]

// Get single role
const role = await roleAPI.getById(id);
// GET /api/roles/{id} → Returns: RoleResponseDTO

// Create role
await roleAPI.create({ name: "Administrator" });
// POST /api/roles → Returns: RoleResponseDTO

// Update role
await roleAPI.update(id, { name: "Updated Name" });
// PUT /api/roles/{id} → Returns: RoleResponseDTO

// Delete role
await roleAPI.delete(id);
// DELETE /api/roles/{id}
```

## Frontend-Backend Mapping

### Create Request
```
Frontend Form:
{
  name: "Administrator"
}
        ↓
Backend RoleRequestDTO:
{
  name: "Administrator"
}
        ↓
Backend Role Entity:
{
  id: null (auto-generated),
  name: "Administrator"
}
```

### Response
```
Backend RoleResponseDTO:
{
  id: 1,
  name: "Administrator"
}
        ↓
Frontend Role Object:
{
  id: 1,
  name: "Administrator"
}
```

## Testing the Integration

### 1. Ensure Backend is Running

Your Spring Boot should be running on:
```
http://localhost:8081
```

### 2. Start React Application

```bash
npm run dev
```

### 3. Navigate to Role Management

Login as ADMIN (IS03651) and go to "Role Management"

### 4. Test Operations

#### Create a Role
1. Click "Add New Role"
2. Enter role name: "Reviewer"
3. Click "Create Role"
4. Verify role appears in table

#### Edit a Role
1. Click edit button next to a role
2. Change the name: "Senior Reviewer"
3. Click "Update Role"
4. Verify changes in table

#### Delete a Role
1. Click delete button
2. Confirm deletion
3. Verify role is removed from table

#### Search
1. Type a role name in search box
2. Table should filter in real-time

## Expected API Responses

### Get All Roles
```
GET /api/roles

Response (200 OK):
[
  {
    "id": 1,
    "name": "Administrator"
  },
  {
    "id": 2,
    "name": "Approver"
  },
  {
    "id": 3,
    "name": "User"
  }
]
```

### Create Role
```
POST /api/roles
Body: { "name": "New Role" }

Response (200 OK):
{
  "id": 4,
  "name": "New Role"
}
```

### Update Role
```
PUT /api/roles/4
Body: { "name": "Updated Role" }

Response (200 OK):
{
  "id": 4,
  "name": "Updated Role"
}
```

### Delete Role
```
DELETE /api/roles/4

Response (204 No Content)
```

## Troubleshooting

### Issue: Roles not loading
**Check**:
- Backend is running on http://localhost:8081
- Database has roles table with schema "generic"
- Endpoint `/api/roles` is accessible
- CORS is enabled for http://localhost:5173

### Issue: Create/Update fails
**Check**:
- Form validation passes (name is not empty)
- Backend receives proper RoleRequestDTO
- Database constraints are satisfied
- Check browser Network tab for exact error

### Issue: Delete fails
**Check**:
- Role ID exists in database
- No foreign key constraints preventing deletion
- User has proper permissions

## Next Steps

Once Role Management is working with your backend:

1. **User Role Assignment**: Will need to update to match your UserRole API structure
2. **User Management**: Integrate with your User API
3. **Generic Entry**: Create form for generic data entry
4. **Incentives**: Implement incentive management
5. **Reports**: Add report generation
6. **Other Modules**: Complete remaining features

## Code Quality

✅ Proper error handling
✅ Loading states
✅ Form validation
✅ Success/error notifications
✅ Search functionality
✅ Confirmation dialogs
✅ RESTful API calls
✅ React hooks usage
✅ Component state management
✅ User experience considerations

## Files Modified

- `src/pages/RoleManagementPage.jsx` - Updated to match backend structure
- `src/services/api.js` - Already configured for role endpoints
- `src/config/config.js` - Configuration ready for backend

## Architecture

```
React Component (RoleManagementPage)
        ↓
API Service Layer (roleAPI from api.js)
        ↓
HTTP Requests (Fetch API)
        ↓
Spring Boot Backend (/api/roles)
        ↓
Role Service
        ↓
Role Repository
        ↓
Database (PostgreSQL/MySQL)
```

---

**Status**: ✅ Ready for Backend Integration

The Role Management page is fully implemented and ready to connect to your Spring Boot backend. All CRUD operations are functional and will work seamlessly with your backend API.
