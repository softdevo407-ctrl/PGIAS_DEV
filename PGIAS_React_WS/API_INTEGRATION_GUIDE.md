# API Integration Guide

This document provides a comprehensive guide for integrating the PGIAS React application with the Spring Boot backend APIs.

## Quick Start

### 1. Configure API Base URL

Update `src/config/config.js` with your backend server URL:

```javascript
api: {
  baseURL: 'http://localhost:8081', // Change to your backend URL
  timeout: 30000,
  
  endpoints: {
    roles: '/api/roles',
    userRoles: '/api/userroles',
    // ... other endpoints
  }
},
```

### 2. API Service Layer

The application includes two main API services:

#### Role API (`roleAPI`)
```javascript
import { roleAPI } from './services/api';

// Get all roles
const roles = await roleAPI.getAll();

// Get role by ID
const role = await roleAPI.getById(1);

// Create role
const newRole = await roleAPI.create({
  roleCode: 'APPROVER',
  roleName: 'Approver',
  description: 'Can approve incentives',
  isActive: true
});

// Update role
const updated = await roleAPI.update(1, {
  roleName: 'Updated Name',
  isActive: false
});

// Delete role
await roleAPI.delete(1);
```

#### User Role API (`userRoleAPI`)
```javascript
import { userRoleAPI } from './services/api';

// Get all user-role assignments
const allAssignments = await userRoleAPI.getAll();

// Get roles for a specific user
const userRoles = await userRoleAPI.getByLoginId('IS03651');

// Get specific assignment
const assignment = await userRoleAPI.getById('IS03651', 'ADMIN', 'All');

// Assign role to user
const assigned = await userRoleAPI.create({
  loginId: 'IS03651',
  roleCode: 'ADMIN',
  centreCode: 'All',
  effectiveFrom: '2024-01-01',
  effectiveTo: null
});

// Update assignment
const updated = await userRoleAPI.update('IS03651', 'ADMIN', 'All', {
  effectiveFrom: '2024-06-01'
});

// Revoke role
await userRoleAPI.delete('IS03651', 'ADMIN', 'All');
```

## Component Integration

### RoleManagementPage

Located at `src/pages/RoleManagementPage.jsx`, this component provides:

- List all roles with search and filter
- Create new roles with validation
- Edit existing roles
- Delete roles with confirmation
- Real-time API error handling

**Features:**
- Form validation for Role Code (uppercase, alphanumeric)
- Form validation for Role Name (required)
- Status toggle (Active/Inactive)
- Search functionality
- Loading states and error messages

### UserRoleAssignmentPage

Located at `src/pages/UserRoleAssignmentPage.jsx`, this component provides:

- List all user-role assignments
- Assign roles to users by login ID
- Manage role assignments by centre
- Edit effective dates for assignments
- Revoke roles from users

**Features:**
- Auto-populated role dropdown from API
- Centre code selection
- Effective date range management
- Search by login ID, role, or centre
- Real-time validation

## Authentication Flow

The authentication system integrates with the User Role API:

1. User enters credentials on LoginPage
2. System verifies credentials (mock or API)
3. System calls `/api/userroles/login/{loginId}` to fetch user roles
4. User is granted access to pages based on their roles
5. Roles are stored in localStorage

**Note:** Currently using mock authentication. Replace with real authentication endpoint.

## Error Handling

The API service includes comprehensive error handling:

```javascript
try {
  const roles = await roleAPI.getAll();
} catch (error) {
  console.error('Error:', error.message); // "HTTP 500"
  console.error('Status:', error.status);   // 500
  console.error('Data:', error.data);       // { error: "..." }
}
```

## Adding New API Services

To add a new API service (e.g., for Users):

```javascript
// In src/services/api.js
export const userAPI = {
  getAll: async () => {
    return apiCall(`${API_BASE_URL}/api/users`);
  },

  getById: async (id) => {
    return apiCall(`${API_BASE_URL}/api/users/${id}`);
  },

  create: async (userData) => {
    return apiCall(`${API_BASE_URL}/api/users`, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  update: async (id, userData) => {
    return apiCall(`${API_BASE_URL}/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  delete: async (id) => {
    return apiCall(`${API_BASE_URL}/api/users/${id}`, {
      method: 'DELETE',
    });
  },
};
```

Then import and use in your component:

```javascript
import { userAPI } from '../services/api';

const users = await userAPI.getAll();
```

## CORS Configuration

Ensure your Spring Boot backend has CORS enabled for the React application:

```java
@Configuration
public class CorsConfig {
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

## Future API Integrations

The application is ready for integration with the following backend APIs:

- **User Management**: `/api/users` - User CRUD operations
- **Generic Entry**: `/api/generic-entry` - Generic data entry
- **Incentives**: `/api/incentives` - Incentive calculations
- **Reports**: `/api/reports` - Report generation
- **Inventory**: `/api/inventory` - Inventory management
- **Centers**: `/api/centres` - Center/branch management
- **Objectives**: `/api/objectives` - Performance objectives
- **Actions**: `/api/actions` - Action management
- **Success Indicators**: `/api/successindicator` - KPI definitions

Each can be implemented following the same pattern as `roleAPI` and `userRoleAPI`.

## Troubleshooting

### Issue: CORS errors
**Solution:** Check backend CORS configuration and ensure your frontend URL is whitelisted.

### Issue: 404 errors on API calls
**Solution:** Verify the API base URL and endpoint paths match your backend configuration.

### Issue: Authentication failures
**Solution:** Check mock user credentials in `src/App.jsx` or implement real authentication endpoint.

### Issue: Roles not loading on login
**Solution:** Ensure the user has roles assigned in the database and the `/api/userroles/login/{loginId}` endpoint returns data.

## API Response Format

### Success Response (Role)
```json
{
  "id": 1,
  "roleCode": "ADMIN",
  "roleName": "Administrator",
  "description": "Full system access",
  "isActive": true,
  "createdAt": "2024-01-01T10:00:00",
  "updatedAt": "2024-01-01T10:00:00"
}
```

### Success Response (User Role)
```json
{
  "loginId": "IS03651",
  "roleCode": "ADMIN",
  "centreCode": "All",
  "effectiveFrom": "2024-01-01",
  "effectiveTo": null,
  "createdAt": "2024-01-01T10:00:00",
  "updatedAt": "2024-01-01T10:00:00"
}
```

### Error Response
```json
{
  "error": "Role not found",
  "status": 404,
  "timestamp": "2024-01-01T10:00:00"
}
```

## Testing APIs

### Using cURL

```bash
# Get all roles
curl http://localhost:8081/api/roles

# Create a role
curl -X POST http://localhost:8081/api/roles \
  -H "Content-Type: application/json" \
  -d '{
    "roleCode": "APPROVER",
    "roleName": "Approver",
    "description": "Can approve incentives",
    "isActive": true
  }'

# Get user roles
curl http://localhost:8081/api/userroles/login/IS03651
```

### Using Postman

Import the provided Postman collection (if available) or create requests manually using the API endpoints documented above.

## Additional Resources

- Spring Boot Backend Repository: [Link to backend repo]
- API Documentation: [Link to API docs]
- Frontend Repository: [Link to frontend repo]
