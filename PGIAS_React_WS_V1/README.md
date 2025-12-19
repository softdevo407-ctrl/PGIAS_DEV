# PGIAS React Application

Performance & Growth Incentive Analysis System built with React.

## Features

- **Authentication**: Login system with role-based access control
- **Role Management**: Define roles and manage role assignments
- **User Management**: Add, edit, and delete users with role assignments
- **User Role Assignment**: Assign roles to users by login ID and centre
- **Form Validation**: Comprehensive form validation with real-time error feedback
- **Dashboard**: Main dashboard with statistics and recent activity
- **Multiple Pages**: Dashboard, Users, Roles, Incentives, Reports, Inventory, Settings, and Analytics
- **API Integration**: Integrated with Spring Boot backend APIs
- **Responsive UI**: Built with Bootstrap 5 for a modern, responsive interface
- **Icons**: Lucide React icons for beautiful UI elements

## Demo Credentials

- **Login ID**: IS03651 or IS03652
- **Password**: password

## Tech Stack

- React 18
- Vite (build tool)
- Bootstrap 5
- Lucide React (icons)

## API Integration

### Backend API Configuration

The application is configured to connect to Spring Boot APIs at `http://localhost:8081`. You can change this in `src/services/api.js`:

```javascript
const API_BASE_URL = 'http://localhost:8081';
```

### Available APIs

#### Role Management APIs
- **GET /api/roles** - Get all roles
- **GET /api/roles/{id}** - Get role by ID
- **POST /api/roles** - Create new role
- **PUT /api/roles/{id}** - Update role
- **DELETE /api/roles/{id}** - Delete role

#### User Role Assignment APIs
- **GET /api/userroles** - Get all user-role assignments
- **GET /api/userroles/login/{loginId}** - Get roles for a user by login ID
- **GET /api/userroles/{loginId}/{roleCode}/{centreCode}** - Get specific assignment
- **POST /api/userroles** - Assign role to user
- **PUT /api/userroles/{loginId}/{roleCode}/{centreCode}** - Update assignment
- **DELETE /api/userroles/{loginId}/{roleCode}/{centreCode}** - Revoke role

### API Service Layer

The application includes a comprehensive API service layer in `src/services/api.js`:

```javascript
import { roleAPI, userRoleAPI } from './services/api';

// Fetch all roles
const roles = await roleAPI.getAll();

// Get user roles
const userRoles = await userRoleAPI.getByLoginId('IS03651');

// Create new role
const newRole = await roleAPI.create({
  roleCode: 'APPROVER',
  roleName: 'Approver',
  description: 'Can approve incentives',
  isActive: true
});

// Assign role to user
const assignment = await userRoleAPI.create({
  loginId: 'IS03651',
  roleCode: 'ADMIN',
  centreCode: 'All'
});
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Spring Boot backend running on http://localhost:8081

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run preview` - Preview the production build

## Project Structure

```
src/
├── App.jsx                 # Main application component
├── main.jsx                # Entry point
├── services/
│   └── api.js              # API service layer
├── pages/
│   ├── RoleManagementPage.jsx
│   └── UserRoleAssignmentPage.jsx
index.html                  # HTML template
vite.config.js              # Vite configuration
package.json                # Project dependencies
```

## Components

### Authentication System
- **LoginPage**: Authentication interface with Spring Boot integration
- Uses user credentials to fetch roles from API
- Falls back to mock data if API is unavailable

### Role Management
- **RoleManagementPage**: Complete CRUD for system roles
  - Create new roles with validation
  - Edit existing roles
  - Delete roles
  - Search and filter roles
  - Real-time API integration

### User Role Assignment
- **UserRoleAssignmentPage**: Manage user-role assignments
  - Assign roles to users by login ID
  - Assign roles to specific centres
  - Set effective dates for role assignments
  - Real-time API integration

### Other Components
- **DashboardPage**: Dashboard with statistics
- **UsersPage**: User management interface
- **Sidebar**: Navigation menu with role-based pages
- **Other Pages**: Placeholder pages for Incentives, Reports, Inventory, Settings, and Analytics

## Role-Based Access Control

The application implements role-based page access:

- **ADMIN**: Access to all pages including role management
- **APPROVER**: Access to Dashboard, Incentives, Reports, Analytics
- **SANCTIONER**: Access to Dashboard, Incentives, Reports, Analytics
- **REVIEWER**: Access to Dashboard, Reports, Analytics
- **USER**: Access to Dashboard, Incentives, Reports

## Environment Configuration

To change the API base URL, edit `src/services/api.js`:

```javascript
const API_BASE_URL = 'http://your-backend-url:port';
```

## Troubleshooting

### CORS Issues
If you encounter CORS errors, ensure your Spring Boot backend has CORS enabled for `http://localhost:5173`.

### API Connection Issues
- Verify the Spring Boot backend is running on `http://localhost:8081`
- Check network connectivity
- Review browser console for detailed error messages

### Missing Roles
If roles are not loading from the API, the application will use mock data for initial login. Check:
1. Spring Boot server is running
2. The user exists in the database with assigned roles
3. API endpoint `/api/userroles/login/{loginId}` is accessible

## License

MIT

