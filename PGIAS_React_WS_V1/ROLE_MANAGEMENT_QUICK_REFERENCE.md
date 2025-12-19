# Role Management - Quick Reference

## Backend Structure (Spring Boot)

```java
@Entity
@Table(name = "roles", schema = "generic")
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String name;
}
```

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/roles` | Get all roles |
| GET | `/api/roles/{id}` | Get specific role |
| POST | `/api/roles` | Create new role |
| PUT | `/api/roles/{id}` | Update role |
| DELETE | `/api/roles/{id}` | Delete role |

## Request/Response Format

### Create/Update Request
```json
{
  "name": "Administrator"
}
```

### Response
```json
{
  "id": 1,
  "name": "Administrator"
}
```

## React Component Usage

```javascript
import RoleManagementPage from './pages/RoleManagementPage';

// In App.jsx or router:
<RoleManagementPage />
```

## Features

| Feature | Status |
|---------|--------|
| List All Roles | ✅ Complete |
| Create Role | ✅ Complete |
| Edit Role | ✅ Complete |
| Delete Role | ✅ Complete |
| Search/Filter | ✅ Complete |
| Error Handling | ✅ Complete |
| Loading States | ✅ Complete |
| Form Validation | ✅ Complete |

## Form Fields

| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| name | String | Yes | Min 2 chars |

## Test Data

### Sample Roles
```json
[
  { "id": 1, "name": "Administrator" },
  { "id": 2, "name": "Approver" },
  { "id": 3, "name": "Sanctioner" },
  { "id": 4, "name": "Reviewer" },
  { "id": 5, "name": "User" }
]
```

## Configuration

**Backend URL**: `http://localhost:8081`

To change, edit `src/config/config.js`:
```javascript
api: {
  baseURL: 'http://your-backend-url:port'
}
```

## Database Schema

```sql
CREATE TABLE generic.roles (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Error Handling

- HTTP Error Responses: Displayed to user
- Network Errors: "Failed to fetch roles" message
- Validation Errors: Shown in form
- Success Messages: Auto-dismiss after 3 seconds

## Access Control

**Admin Only**: Role Management page is only accessible to users with ADMIN role

Current Demo:
- IS03651 (ADMIN) → Can access Role Management
- IS03652 (APPROVER) → Cannot access Role Management

## Performance

- Roles loaded on component mount
- Lazy loading implemented with React.lazy()
- Search debouncing for optimal performance
- Automatic refresh after CRUD operations

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile: ✅ Responsive design

## Keyboard Shortcuts

- Enter key: Submit form (in modal)
- Esc key: Close modal
- Ctrl+A: Select all in search field

## Accessibility

- ARIA labels for interactive elements
- Keyboard navigation support
- Screen reader friendly
- Proper contrast ratios
- Semantic HTML

## Debugging

### Enable Console Logs
```javascript
// In RoleManagementPage.jsx
console.error('Error fetching roles:', err);
```

### Check Network Requests
1. Open DevTools (F12)
2. Go to Network tab
3. Watch API calls to `/api/roles`
4. Check Response/Preview tabs

### Test API with cURL
```bash
# Get all roles
curl http://localhost:8081/api/roles

# Create role
curl -X POST http://localhost:8081/api/roles \
  -H "Content-Type: application/json" \
  -d '{"name":"NewRole"}'

# Update role
curl -X PUT http://localhost:8081/api/roles/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"UpdatedName"}'

# Delete role
curl -X DELETE http://localhost:8081/api/roles/1
```

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| 404 Not Found | Check endpoint URL and backend running |
| CORS Error | Verify backend CORS config allows http://localhost:5173 |
| Empty Table | Check backend has data, verify API response |
| Create fails | Check form validation, check backend logs |
| Search not working | Ensure role name matches search term |
| Can't access page | Check if user has ADMIN role |

## API Service Reference

```javascript
import { roleAPI } from './services/api';

// Get all
const roles = await roleAPI.getAll();

// Get by ID
const role = await roleAPI.getById(1);

// Create
const newRole = await roleAPI.create({ name: "Test" });

// Update
const updated = await roleAPI.update(1, { name: "Updated" });

// Delete
await roleAPI.delete(1);
```

## Next Steps

After Role Management is working:

1. ☐ Update User Role Assignment API structure
2. ☐ Implement User Management with your API
3. ☐ Add authentication API integration
4. ☐ Implement remaining modules
5. ☐ Add pagination if needed
6. ☐ Add sorting capabilities
7. ☐ Add bulk operations
8. ☐ Add export functionality

---

**Last Updated**: December 8, 2025
**Status**: Ready for Production
