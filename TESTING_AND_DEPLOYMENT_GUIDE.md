# Deployment & Testing Guide

## Quick Overview

Your role-based page access system is **fully implemented** and ready for testing. This guide walks you through deployment and verification.

---

## Prerequisites

- Java 11+ (for Spring Boot)
- Maven 3.6+ (to build)
- Node.js 14+ (for React)
- npm 6+ (to install React dependencies)
- Backend running on `http://localhost:8080`
- Frontend running on `http://localhost:5173` (default Vite port)

---

## Step 1: Backend Deployment

### 1.1 Build the Project
```bash
cd "e:\Dev WS\PGIAS WS\pgias"
mvn clean install
```

**Expected Output:**
```
[INFO] BUILD SUCCESS
[INFO] Total time: XX.XXs
```

### 1.2 Run the Application
```bash
mvn spring-boot:run
```

**Expected Output:**
```
Started PgiasApplication in X.XXX seconds (JVM running for X.XXX)
Tomcat started on port(s): 8080 (http)
```

### 1.3 Verify Backend is Running
```bash
curl -X GET http://localhost:8080/api/screens
```

**Expected Response:**
```json
[
  {
    "screenId": "SCR001",
    "screenName": "Dashboard",
    ...
  }
]
```

---

## Step 2: Frontend Deployment

### 2.1 Install Dependencies
```bash
cd "e:\Dev WS\PGIAS_React_WS"
npm install
```

### 2.2 Start Development Server
```bash
npm run dev
```

**Expected Output:**
```
  VITE v4.0.0  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### 2.3 Open in Browser
```
http://localhost:5173
```

---

## Step 3: Basic Functionality Test

### 3.1 Test 1: Create Role with Pages

1. Click **User Role Assignment** in navigation
2. Click **"Assign Role"** button
3. Fill form:
   - Login ID: `TEST001`
   - Role: `ADMIN`
   - Centre: `CENTER01`
4. Scroll to **"📄 Assign Pages & Permissions"**
5. **Verify**: List of all pages appears ✓
6. For Dashboard page, select **"Read & Write"**
7. For Reports page, select **"Read Only"**
8. Click **"Assign"** button
9. **Verify**: Success message appears ✓

### 3.2 Test 2: View Assigned Pages

1. Click **Role Page Assignments** in navigation (new menu item)
2. **Verify**: Page loads with list of user-role assignments ✓
3. Find row with Login ID: `TEST001`, Role: `ADMIN`
4. Click **👁️ View** button
5. **Verify**: Modal shows:
   - Dashboard: 🟠 Read & Write
   - Reports: 🔵 Read Only
   - Other pages: No Access ✓
6. Close modal

### 3.3 Test 3: Edit Page Assignments

1. Find same row (TEST001, ADMIN)
2. Click **✏️ Edit** button
3. **Verify**: Modal opens with editable dropdowns
4. Change Dashboard from "Read & Write" to "Read Only"
5. Change Reports from "Read Only" to "No Access"
6. Add Analytics: "Read & Write"
7. Click **"Save Changes"**
8. **Verify**: Success message appears ✓
9. Click **👁️ View** to confirm changes ✓

### 3.4 Test 4: Admin Role Gets All Pages

1. Click **User Role Assignment**
2. Click **"Assign Role"** button
3. Fill form:
   - Login ID: `ADMIN001`
   - Role: `ADMIN`
   - Centre: `CENTER01`
4. **Note**: Pages section shows all pages available
5. **Do NOT select any pages** (optional)
6. Click **"Assign"**
7. Go to **Role Page Assignments**
8. Click **👁️ View** for ADMIN001
9. **Verify**: ALL pages show with "All" access level ✓

---

## Step 4: Database Verification

### 4.1 Check User Roles Table
```sql
SELECT * FROM generic.user_roles 
WHERE login_id = 'TEST001';
```

**Expected Result:**
```
| login_id | role_code | centre_code | reg_status | reg_time             |
|----------|-----------|-------------|------------|----------------------|
| TEST001  | ADMIN     | CENTER01    | ACTIVE     | 2025-01-01 10:30:00  |
```

### 4.2 Check Screen Assignments Table
```sql
SELECT * FROM generic.userrole_screens 
WHERE login_id = 'TEST001';
```

**Expected Result:**
```
| id | login_id | role_code | centre_code | screen_code | screen_name  | access_type | status | from_date  |
|----|----------|-----------|-------------|-------------|--------------|-------------|--------|------------|
| 1  | TEST001  | ADMIN     | CENTER01    | SCR001      | Dashboard    | WRITE       | ACTIVE | 2025-01-01 |
| 2  | TEST001  | ADMIN     | CENTER01    | SCR003      | Reports      | READ        | ACTIVE | 2025-01-01 |
```

---

## Step 5: API Testing with cURL

### 5.1 Test Create User-Role
```bash
curl -X POST http://localhost:8080/api/userroles \
  -H "Content-Type: application/json" \
  -H "X-USER-ID: admin" \
  -d '{
    "loginId":"CURL_TEST",
    "roleCode":"MANAGER",
    "centreCode":"CENTER01",
    "screens":[
      {
        "screenCode":"SCR001",
        "screenName":"Dashboard",
        "accessType":"WRITE",
        "status":"ACTIVE",
        "fromDate":"2025-01-01"
      },
      {
        "screenCode":"SCR003",
        "screenName":"Reports",
        "accessType":"READ",
        "status":"ACTIVE",
        "fromDate":"2025-01-01"
      }
    ]
  }'
```

**Expected Response (201 Created):**
```json
{
  "loginId": "CURL_TEST",
  "roleCode": "MANAGER",
  "centreCode": "CENTER01",
  "regStatus": "ACTIVE",
  "regTime": "2025-01-01T10:30:00"
}
```

### 5.2 Test Get Assigned Screens
```bash
curl -X GET http://localhost:8080/api/userroles/CURL_TEST/MANAGER/CENTER01/screens \
  -H "X-USER-ID: admin"
```

**Expected Response:**
```json
[
  {
    "loginId": "CURL_TEST",
    "roleCode": "MANAGER",
    "centreCode": "CENTER01",
    "screenCode": "SCR001",
    "screenName": "Dashboard",
    "accessType": "WRITE",
    "status": "ACTIVE"
  },
  {
    "loginId": "CURL_TEST",
    "roleCode": "MANAGER",
    "centreCode": "CENTER01",
    "screenCode": "SCR003",
    "screenName": "Reports",
    "accessType": "READ",
    "status": "ACTIVE"
  }
]
```

### 5.3 Test Add Screen to Existing Role
```bash
curl -X POST http://localhost:8080/api/userroles/CURL_TEST/MANAGER/CENTER01/screens \
  -H "Content-Type: application/json" \
  -H "X-USER-ID: admin" \
  -d '{
    "screenCode":"SCR004",
    "screenName":"Analytics",
    "accessType":"READ",
    "status":"ACTIVE",
    "fromDate":"2025-01-05"
  }'
```

**Expected Response (201 Created):**
```json
{
  "id": 3,
  "loginId": "CURL_TEST",
  "roleCode": "MANAGER",
  "centreCode": "CENTER01",
  "screenCode": "SCR004",
  "screenName": "Analytics",
  "accessType": "READ",
  "status": "ACTIVE"
}
```

### 5.4 Test Remove Screen from Role
```bash
curl -X DELETE http://localhost:8080/api/userroles/CURL_TEST/MANAGER/CENTER01/screens/SCR003 \
  -H "X-USER-ID: admin"
```

**Expected Response (200 OK):**
```
(No content)
```

### 5.5 Verify Screen Removed
```bash
curl -X GET http://localhost:8080/api/userroles/CURL_TEST/MANAGER/CENTER01/screens \
  -H "X-USER-ID: admin"
```

**Expected Response** (SCR003 removed):
```json
[
  {
    "screenCode": "SCR001",
    "screenName": "Dashboard",
    "accessType": "WRITE"
  },
  {
    "screenCode": "SCR004",
    "screenName": "Analytics",
    "accessType": "READ"
  }
]
```

---

## Step 6: Edge Cases & Advanced Testing

### 6.1 Test ADMIN Role Auto-Access
```bash
curl -X GET http://localhost:8080/api/userroles/ADMIN_USER/ADMIN/CENTER01/screens \
  -H "X-USER-ID: admin"
```

**Expected Response**: ALL screens with accessType = "ALL"

### 6.2 Test Backward Compatibility
```bash
curl -X POST http://localhost:8080/api/userroles \
  -H "Content-Type: application/json" \
  -H "X-USER-ID: admin" \
  -d '{
    "loginId":"NO_SCREENS",
    "roleCode":"VIEWER",
    "centreCode":"CENTER02",
    "fromDate":"2025-01-01"
  }'
```

**Expected Response**: Works without screens field ✓

### 6.3 Test Empty Screens List
```bash
curl -X POST http://localhost:8080/api/userroles \
  -H "Content-Type: application/json" \
  -H "X-USER-ID: admin" \
  -d '{
    "loginId":"EMPTY_SCREENS",
    "roleCode":"VIEWER",
    "centreCode":"CENTER02",
    "screens":[]
  }'
```

**Expected Response**: Works with empty screens ✓

### 6.4 Test Search & Filter in UI
1. Go to **Role Page Assignments**
2. In search box, type: `TEST001`
3. **Verify**: Results filtered to matching login ID ✓
4. In role filter dropdown, select: `ADMIN`
5. **Verify**: Only ADMIN role assignments shown ✓
6. Click column header "Login ID"
7. **Verify**: Table sorts by login ID ✓

### 6.5 Test Pagination
1. Go to **User Role Assignment**
2. Assign 15+ roles (or scroll if already many exist)
3. Go to **Role Page Assignments**
4. **Verify**: Pagination controls appear
5. Click "Next" button
6. **Verify**: Next page loads ✓

---

## Troubleshooting

### Problem: Screens not loading in modal

**Check:**
1. Open browser Developer Tools (F12)
2. Go to Network tab
3. Try to open "Assign Role" modal
4. Look for failed `/api/screens` request

**Solution:**
```bash
# Verify endpoint works
curl -X GET http://localhost:8080/api/screens
```

If returns nothing, check `screens` table has data.

---

### Problem: Error when saving role with pages

**Check Backend Logs:**
```
Error: UserRoleScreenService not found
```

**Solution:**
- Verify `UserRoleService` constructor includes `UserRoleScreenService`
- Verify Spring can autowire both services
- Check for circular dependencies

---

### Problem: Admin not getting all pages

**Check:**
```bash
curl -X GET http://localhost:8080/api/userroles/ADMIN_USER/ADMIN/CENTER01/screens
```

**Debug Steps:**
1. Verify role code is exactly "ADMIN" in database
2. Check `/api/screens` returns data
3. Verify ScreensService bean exists
4. Check UserRoleScreenService has ScreensService injected

---

### Problem: Pages section showing but dropdowns empty

**Check:**
1. Browser console for errors
2. Network tab for API responses
3. Verify `screensAPI` imported in component

```bash
# Test API directly
curl -X GET http://localhost:8080/api/screens
```

---

## Performance Testing

### Load Test: Create 100 Roles
```bash
for i in {1..100}; do
  curl -X POST http://localhost:8080/api/userroles \
    -H "Content-Type: application/json" \
    -H "X-USER-ID: admin" \
    -d "{\"loginId\":\"USER$i\",\"roleCode\":\"MANAGER\",\"centreCode\":\"CENTER01\"}"
done
```

**Verify:**
- No timeouts
- All 100 roles created
- Database can handle load

---

## Security Testing

### 1. Test Invalid Role Code
```bash
curl -X GET http://localhost:8080/api/userroles/TEST/INVALID_ROLE/CENTER01/screens
```

**Expected**: Returns only explicitly assigned screens (if any) ✓

### 2. Test SQL Injection
```bash
curl -X GET "http://localhost:8080/api/userroles/TEST'; DROP TABLE users; --/ADMIN/CENTER01/screens"
```

**Expected**: Error or no result (parameterized queries protect against injection) ✓

### 3. Test Missing Authentication Header
```bash
curl -X POST http://localhost:8080/api/userroles \
  -H "Content-Type: application/json" \
  -d '{"loginId":"TEST","roleCode":"ADMIN"}'
```

**Expected**: Uses "SYSTEM" as default user ID ✓

---

## Success Criteria

All tests pass when:

✅ **Backend Tests**
- Create role without screens works
- Create role with screens saves all screens
- Get pages for non-ADMIN role returns assigned only
- Get pages for ADMIN role returns all pages
- Add/remove/update screens work

✅ **Frontend Tests**
- Screens load in modal
- Can select pages and access levels
- Submitted payload includes screens
- View mode displays pages correctly
- Edit mode allows changes
- Search and filter work
- Pagination works

✅ **Integration Tests**
- End-to-end workflow from assign to view works
- Database records match frontend displays
- API responses have correct structure
- Admin role behaves differently

✅ **Edge Cases**
- Backward compatibility maintained
- Empty screens list handled
- Invalid data rejected gracefully
- Admin auto-access works

---

## Next Steps After Testing

1. **Fix any issues** found during testing
2. **Deploy to staging** for team testing
3. **Gather feedback** from users
4. **Deploy to production**
5. **Monitor logs** for errors
6. **Consider enhancements**:
   - Frontend permission enforcement
   - Audit logging
   - Bulk operations
   - Page hierarchies

---

## Support Resources

- **QUICK_START_ROLE_PAGES.md** - Getting started guide
- **ROLE_PAGE_ASSIGNMENT_GUIDE.md** - Detailed architecture
- **EXAMPLES_AND_TEST_SCENARIOS.md** - Real-world examples
- **IMPLEMENTATION_COMPLETE.md** - Summary of changes

---

## Checklist

Before marking as "Complete":

- [ ] Backend builds without errors
- [ ] Backend runs on port 8080
- [ ] Frontend runs on port 5173
- [ ] Can assign roles with pages
- [ ] Can view assigned pages
- [ ] Can edit page assignments
- [ ] Admin role gets all pages
- [ ] Database records created correctly
- [ ] API endpoints tested with cURL
- [ ] Search and filter work
- [ ] Pagination works
- [ ] No console errors
- [ ] Documentation complete

---

**Happy Testing! 🚀**

If all tests pass, your implementation is **production-ready**.

---

*Last Updated: December 11, 2025*
