# Role-Based Page Access - Test Scenarios & Examples

## Example 1: Assign Manager Role with Specific Pages

**Scenario**: Assign MANAGER role to employee IS03651 with access to Dashboard and User Management

### Endpoint
```
POST http://localhost:8080/api/userroles
```

### Request
```json
{
  "loginId": "IS03651",
  "roleCode": "MANAGER",
  "centreCode": "CENTER01",
  "fromDate": "2025-01-01",
  "toDate": "2026-12-31",
  "screens": [
    {
      "screenCode": "SCR001",
      "screenName": "Dashboard",
      "accessType": "WRITE",
      "status": "ACTIVE",
      "fromDate": "2025-01-01"
    },
    {
      "screenCode": "SCR002",
      "screenName": "User Management",
      "accessType": "READ",
      "status": "ACTIVE",
      "fromDate": "2025-01-01"
    },
    {
      "screenCode": "SCR003",
      "screenName": "Reports",
      "accessType": "WRITE",
      "status": "ACTIVE",
      "fromDate": "2025-01-01"
    }
  ]
}
```

### Response (201 Created)
```json
{
  "loginId": "IS03651",
  "roleCode": "MANAGER",
  "centreCode": "CENTER01",
  "regStatus": "ACTIVE",
  "regTime": "2025-01-01T10:30:00"
}
```

---

## Example 2: Assign Admin Role (Auto-Access All Pages)

**Scenario**: Promote IS02345 to ADMIN role

### Endpoint
```
POST http://localhost:8080/api/userroles
```

### Request (Simple - No screens needed)
```json
{
  "loginId": "IS02345",
  "roleCode": "ADMIN",
  "centreCode": "CENTER01",
  "fromDate": "2025-01-01",
  "toDate": "2026-12-31"
}
```

### Response
```json
{
  "loginId": "IS02345",
  "roleCode": "ADMIN",
  "centreCode": "CENTER01",
  "regStatus": "ACTIVE",
  "regTime": "2025-01-01T10:30:00"
}
```

**Note**: When you fetch pages for this ADMIN user, all screens will be returned automatically:

### Verify Admin Has All Pages
```
GET http://localhost:8080/api/userroles/IS02345/ADMIN/CENTER01/screens
```

### Response
```json
[
  {
    "loginId": "IS02345",
    "roleCode": "ADMIN",
    "centreCode": "CENTER01",
    "screenCode": "SCR001",
    "screenName": "Dashboard",
    "accessType": "ALL",
    "status": "ACTIVE",
    "fromDate": "2025-01-01"
  },
  {
    "loginId": "IS02345",
    "roleCode": "ADMIN",
    "centreCode": "CENTER01",
    "screenCode": "SCR002",
    "screenName": "User Management",
    "accessType": "ALL",
    "status": "ACTIVE",
    "fromDate": "2025-01-01"
  },
  {
    "loginId": "IS02345",
    "roleCode": "ADMIN",
    "centreCode": "CENTER01",
    "screenCode": "SCR003",
    "screenName": "Reports",
    "accessType": "ALL",
    "status": "ACTIVE",
    "fromDate": "2025-01-01"
  }
]
```

---

## Example 3: View Pages Assigned to a User-Role

**Scenario**: Check what pages employee IS03651 can access

### Endpoint
```
GET http://localhost:8080/api/userroles/IS03651/MANAGER/CENTER01/screens
```

### Response
```json
[
  {
    "id": 1,
    "loginId": "IS03651",
    "roleCode": "MANAGER",
    "centreCode": "CENTER01",
    "screenCode": "SCR001",
    "screenName": "Dashboard",
    "accessType": "WRITE",
    "status": "ACTIVE",
    "fromDate": "2025-01-01",
    "toDate": null,
    "createdBy": "SYSTEM",
    "createdDate": "2025-01-01T10:30:00",
    "modifiedBy": null,
    "modifiedDate": null
  },
  {
    "id": 2,
    "loginId": "IS03651",
    "roleCode": "MANAGER",
    "centreCode": "CENTER01",
    "screenCode": "SCR002",
    "screenName": "User Management",
    "accessType": "READ",
    "status": "ACTIVE",
    "fromDate": "2025-01-01",
    "toDate": null,
    "createdBy": "SYSTEM",
    "createdDate": "2025-01-01T10:30:01",
    "modifiedBy": null,
    "modifiedDate": null
  },
  {
    "id": 3,
    "loginId": "IS03651",
    "roleCode": "MANAGER",
    "centreCode": "CENTER01",
    "screenCode": "SCR003",
    "screenName": "Reports",
    "accessType": "WRITE",
    "status": "ACTIVE",
    "fromDate": "2025-01-01",
    "toDate": null,
    "createdBy": "SYSTEM",
    "createdDate": "2025-01-01T10:30:02",
    "modifiedBy": null,
    "modifiedDate": null
  }
]
```

---

## Example 4: Add a Page to Existing User-Role

**Scenario**: Grant IS03651 access to Analytics screen (READ only)

### Endpoint
```
POST http://localhost:8080/api/userroles/IS03651/MANAGER/CENTER01/screens
```

### Request
```json
{
  "screenCode": "SCR004",
  "screenName": "Analytics",
  "accessType": "READ",
  "status": "ACTIVE",
  "fromDate": "2025-01-05"
}
```

### Response (201 Created)
```json
{
  "id": 4,
  "loginId": "IS03651",
  "roleCode": "MANAGER",
  "centreCode": "CENTER01",
  "screenCode": "SCR004",
  "screenName": "Analytics",
  "accessType": "READ",
  "status": "ACTIVE",
  "fromDate": "2025-01-05",
  "toDate": null,
  "createdBy": "SYSTEM",
  "createdDate": "2025-01-05T14:20:00",
  "modifiedBy": null,
  "modifiedDate": null
}
```

---

## Example 5: Update Page Access Level

**Scenario**: Change IS03651's Dashboard access from WRITE to READ

### Endpoint
```
PUT http://localhost:8080/api/userroles/screens/{id}
```

### Request
```json
{
  "accessType": "READ",
  "status": "ACTIVE",
  "modifiedBy": "ADMIN_USER"
}
```

### Response
```json
{
  "id": 1,
  "loginId": "IS03651",
  "roleCode": "MANAGER",
  "centreCode": "CENTER01",
  "screenCode": "SCR001",
  "screenName": "Dashboard",
  "accessType": "READ",
  "status": "ACTIVE",
  "fromDate": "2025-01-01",
  "toDate": null,
  "createdBy": "SYSTEM",
  "createdDate": "2025-01-01T10:30:00",
  "modifiedBy": "ADMIN_USER",
  "modifiedDate": "2025-01-05T14:25:00"
}
```

---

## Example 6: Revoke Page Access

**Scenario**: Remove Analytics access from IS03651

### Endpoint
```
DELETE http://localhost:8080/api/userroles/IS03651/MANAGER/CENTER01/screens/SCR004
```

### Response
```
200 OK (No content)
```

---

## Example 7: Get All Available Pages/Screens

**Scenario**: List all pages in the system

### Endpoint
```
GET http://localhost:8080/api/screens
```

### Response
```json
[
  {
    "screenId": "SCR001",
    "screenName": "Dashboard",
    "screenCategory": "MAIN",
    "status": "ACTIVE",
    "fromDate": "2024-01-01",
    "toDate": null,
    "userId": "SYSTEM",
    "regTime": "2024-01-01T00:00:00"
  },
  {
    "screenId": "SCR002",
    "screenName": "User Management",
    "screenCategory": "ADMIN",
    "status": "ACTIVE",
    "fromDate": "2024-01-01",
    "toDate": null,
    "userId": "SYSTEM",
    "regTime": "2024-01-01T00:00:00"
  },
  {
    "screenId": "SCR003",
    "screenName": "Reports",
    "screenCategory": "REPORTING",
    "status": "ACTIVE",
    "fromDate": "2024-01-01",
    "toDate": null,
    "userId": "SYSTEM",
    "regTime": "2024-01-01T00:00:00"
  },
  {
    "screenId": "SCR004",
    "screenName": "Analytics",
    "screenCategory": "REPORTING",
    "status": "ACTIVE",
    "fromDate": "2024-06-01",
    "toDate": null,
    "userId": "SYSTEM",
    "regTime": "2024-06-01T00:00:00"
  },
  {
    "screenId": "SCR005",
    "screenName": "Settings",
    "screenCategory": "CONFIG",
    "status": "ACTIVE",
    "fromDate": "2024-01-01",
    "toDate": null,
    "userId": "SYSTEM",
    "regTime": "2024-01-01T00:00:00"
  }
]
```

---

## Example 8: Complex Scenario - Multiple Roles with Different Pages

**Scenario**: Create organization structure

### Step 1: Assign REVIEWER role with minimal access
```
POST http://localhost:8080/api/userroles

{
  "loginId": "IS04567",
  "roleCode": "REVIEWER",
  "centreCode": "CENTER02",
  "fromDate": "2025-01-01",
  "screens": [
    {
      "screenCode": "SCR001",
      "screenName": "Dashboard",
      "accessType": "READ",
      "status": "ACTIVE",
      "fromDate": "2025-01-01"
    },
    {
      "screenCode": "SCR003",
      "screenName": "Reports",
      "accessType": "READ",
      "status": "ACTIVE",
      "fromDate": "2025-01-01"
    }
  ]
}
```

### Step 2: Assign COORDINATOR role with more permissions
```
POST http://localhost:8080/api/userroles

{
  "loginId": "IS05678",
  "roleCode": "COORDINATOR",
  "centreCode": "CENTER02",
  "fromDate": "2025-01-01",
  "screens": [
    {
      "screenCode": "SCR001",
      "screenName": "Dashboard",
      "accessType": "WRITE",
      "status": "ACTIVE",
      "fromDate": "2025-01-01"
    },
    {
      "screenCode": "SCR002",
      "screenName": "User Management",
      "accessType": "READ",
      "status": "ACTIVE",
      "fromDate": "2025-01-01"
    },
    {
      "screenCode": "SCR003",
      "screenName": "Reports",
      "accessType": "WRITE",
      "status": "ACTIVE",
      "fromDate": "2025-01-01"
    },
    {
      "screenCode": "SCR004",
      "screenName": "Analytics",
      "accessType": "WRITE",
      "status": "ACTIVE",
      "fromDate": "2025-01-01"
    }
  ]
}
```

### Step 3: Assign HEAD role with admin access
```
POST http://localhost:8080/api/userroles

{
  "loginId": "IS01234",
  "roleCode": "HEAD",
  "centreCode": "CENTER02",
  "fromDate": "2025-01-01"
}
```

Then verify:
```
GET http://localhost:8080/api/userroles/IS01234/HEAD/CENTER02/screens
```

Returns all screens automatically!

---

## Access Level Reference

| Level | Permissions | When to Use |
|-------|-----------|-----------|
| **No Access** | Cannot view page | Sensitive pages user shouldn't access |
| **Read** | View-only, no editing | Viewers, reviewers, auditors |
| **Write** | View and edit data | Managers, operators, coordinators |
| **Admin** | Full access including admin functions | Administrators, system managers |
| **All** | (Auto-assigned to ADMIN role) | Admin users get all pages |

---

## Testing with cURL

### Quick Test - Create Role with Pages
```bash
curl -X POST http://localhost:8080/api/userroles \
  -H "Content-Type: application/json" \
  -H "X-USER-ID: admin" \
  -d '{
    "loginId":"TESTUSER",
    "roleCode":"MANAGER",
    "centreCode":"CENTER01",
    "screens":[
      {"screenCode":"SCR001","screenName":"Dashboard","accessType":"WRITE","status":"ACTIVE","fromDate":"2025-01-01"}
    ]
  }'
```

### Quick Test - Get Assigned Pages
```bash
curl -X GET http://localhost:8080/api/userroles/TESTUSER/MANAGER/CENTER01/screens \
  -H "X-USER-ID: admin"
```

### Quick Test - Get All Pages
```bash
curl -X GET http://localhost:8080/api/screens \
  -H "X-USER-ID: admin"
```

---

## Expected Database State After Examples

### `generic.user_roles` table
```
| login_id | role_code | centre_code | reg_status | reg_time            |
|----------|-----------|-------------|------------|-------------------|
| IS03651  | MANAGER   | CENTER01    | ACTIVE     | 2025-01-01 10:30  |
| IS02345  | ADMIN     | CENTER01    | ACTIVE     | 2025-01-01 10:30  |
| IS04567  | REVIEWER  | CENTER02    | ACTIVE     | 2025-01-01 10:30  |
| IS05678  | COORDINATOR| CENTER02   | ACTIVE     | 2025-01-01 10:30  |
| IS01234  | HEAD      | CENTER02    | ACTIVE     | 2025-01-01 10:30  |
```

### `generic.userrole_screens` table
```
| id | login_id | role_code | centre_code | screen_code | screen_name      | access_type | status |
|----|----------|-----------|-------------|-------------|------------------|-------------|--------|
| 1  | IS03651  | MANAGER   | CENTER01    | SCR001      | Dashboard        | WRITE       | ACTIVE |
| 2  | IS03651  | MANAGER   | CENTER01    | SCR002      | User Management  | READ        | ACTIVE |
| 3  | IS03651  | MANAGER   | CENTER01    | SCR003      | Reports          | WRITE       | ACTIVE |
| 4  | IS04567  | REVIEWER  | CENTER02    | SCR001      | Dashboard        | READ        | ACTIVE |
| 5  | IS04567  | REVIEWER  | CENTER02    | SCR003      | Reports          | READ        | ACTIVE |
| 6  | IS05678  | COORDINATOR| CENTER02   | SCR001      | Dashboard        | WRITE       | ACTIVE |
| ... |
```

---

## Important Notes

1. **Admin Role Auto-Behavior**: When accessing pages for an ADMIN role, the system returns ALL screens dynamically
2. **Access Types**: Use exact case matching in database (READ, WRITE, ADMIN, ALL)
3. **Screens Required**: Pass screenCode and screenName in screens array
4. **Dates**: Use ISO format (YYYY-MM-DD) for fromDate/toDate
5. **Status**: Always set to "ACTIVE" unless deactivating access
6. **Headers**: Include `X-USER-ID` header for audit trail

---

**Last Updated**: December 11, 2025
