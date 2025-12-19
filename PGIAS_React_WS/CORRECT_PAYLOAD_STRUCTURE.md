# Fixed: 500 Error - Correct Payload Structure

## Problem
500 errors when assigning screens to user roles due to field mapping and data structure mismatches.

## Root Cause
- Frontend sends `screenId` but backend entity uses `screenCode`
- Status field needs to be single character (R, I, etc.) not full word
- Missing field mappings in payload

---

## ✅ CORRECT Payload Structure

### Frontend → Backend Screen Assignment Payload

```json
{
  "screenId": "AD001",
  "screenCode": "AD001",
  "screenName": "Roles",
  "accessType": "WRITE",
  "status": "R",
  "fromDate": "2024-01-01",
  "toDate": "2025-12-31",
  "createdBy": "IS03651"
}
```

**Field Mapping:**
| Frontend | Backend Entity | Type | Required | Notes |
|----------|---|---|---|---|
| `screenId` | `screenCode` | String | Yes | Primary identifier in DB |
| `screenCode` | `screenCode` | String | Yes | Backup for compatibility |
| `screenName` | `screenName` | String | Yes | Display name |
| `accessType` | `accessType` | String | Yes | READ, WRITE, ADMIN, ALL |
| `status` | `status` | VARCHAR(1) | Yes | R=Regular, I=Inactive |
| `fromDate` | `fromDate` | Date | Yes | Start date (NOT NULL) |
| `toDate` | `toDate` | Date | No | End date (optional) |
| `createdBy` | `createdBy` | String | No | Username who created |

---

## ✅ CORRECT Full User Role Assignment Payload

### POST /api/userroles
```json
{
  "loginId": "IS03651",
  "roleCode": "USR",
  "centreCode": "13",
  "fromDate": "2025-01-01",
  "toDate": "2025-12-31",
  "userId": null,
  "regStatus": "A",
  "regTime": "2025-12-19T16:12:00Z",
  "screens": [
    {
      "screenId": "AD001",
      "screenCode": "AD001",
      "screenName": "Roles",
      "accessType": "WRITE",
      "status": "R",
      "fromDate": "2025-01-01",
      "toDate": "2025-12-31",
      "createdBy": "IS03651"
    },
    {
      "screenId": "OP001",
      "screenCode": "OP001",
      "screenName": "Operations",
      "accessType": "READ",
      "status": "R",
      "fromDate": "2025-01-01",
      "toDate": null,
      "createdBy": "IS03651"
    }
  ]
}
```

**Key Points:**
- `regStatus`: Single character (A=Active, I=Inactive)
- `fromDate`: REQUIRED - never null
- `status` in screens: Single character (R=Regular, I=Inactive)
- `screens` array: Contains all screens with access types
- Both `screenId` and `screenCode` should match

---

## 🔧 Backend Files Updated

### 1. UserRoleScreenMapper.java
**Fix**: Maps `screenId` to `screenCode` in both directions
```java
// toEntity: Use screenId if provided, fallback to screenCode
String screenCode = dto.getScreenId() != null ? dto.getScreenId() : dto.getScreenCode();
entity.setScreenCode(screenCode);

// toDTO: Sync screenId from screenCode
dto.setScreenId(entity.getScreenCode());
```

### 2. UserRoleService.java - create() method
**Fix**: Proper mapping and validation
```java
// Map screenId → screenCode
String screenCode = s.getScreenId() != null ? s.getScreenId() : s.getScreenCode();
s.setScreenCode(screenCode);
s.setScreenId(screenCode);  // Keep both in sync

// Ensure status is single character
String status = s.getStatus();
if (status.length() > 1) {
    status = status.charAt(0) + "";  // Take first char
}
s.setStatus(status);
```

### 3. UserRoleService.java - update() method
**Fix**: Same mappings applied during update

---

## 🔧 Frontend Files Updated

### UserRoleAssignmentPage.jsx - handleSubmit()

**Frontend Payload Builder:**
```javascript
const screenAccessPayload = Object.entries(screenAccess)
  .filter(([screenId, accessType]) => accessType && accessType !== 'NONE')
  .map(([screenId, accessType]) => {
    const screen = screensList.find(s => s.screenId === screenId);
    return {
      screenId: screenId,                                    // From API
      screenCode: screenId,                                  // For backend DB
      screenName: screen?.screenName || screenId,
      accessType: accessType,                                // READ, WRITE, ADMIN, ALL
      status: 'R',                                           // Single char
      fromDate: formData.effectiveFrom || today,             // REQUIRED
      toDate: formData.effectiveTo || null,                  // Optional
      createdBy: localStorage.getItem('loginId') || 'SYSTEM' // Track creator
    };
  });
```

**User Role Payload:**
```javascript
const payload = {
  loginId: formData.loginId,
  roleCode: formData.roleCode,
  centreCode: formData.centreCode,
  fromDate: formData.effectiveFrom || today,  // REQUIRED
  toDate: formData.effectiveTo || null,
  userId: null,
  regStatus: 'A',  // Single character
  regTime: new Date().toISOString()
};

if (screenAccessPayload.length > 0) {
  payload.screens = screenAccessPayload;
}
```

---

## 📊 Data Types by Column

| Field | DB Type | Max Length | Examples |
|-------|---------|-----------|----------|
| regStatus | VARCHAR(1) | 1 | A, I |
| status | VARCHAR(1) | 1 | R, I, X |
| accessType | VARCHAR | 10 | READ, WRITE, ADMIN, ALL |
| screenCode | VARCHAR | 50 | AD001, OP001, SCR001 |
| fromDate | DATE | - | 2025-01-01 |
| toDate | DATE | Nullable | 2025-12-31 |
| loginId | VARCHAR | 50 | IS03651, USR001 |
| roleCode | VARCHAR | 50 | USR, ADMIN, ADM |
| centreCode | VARCHAR | 50 | 13, CTR001 |

---

## ✅ Compilation Status

✅ **ALL FILES COMPILE - NO ERRORS**

- ✅ UserRoleScreenMapper.java - screenId/screenCode mapping
- ✅ UserRoleService.java - create() & update() with proper validation
- ✅ UserRoleAssignmentPage.jsx - correct payload structure

---

## 🧪 Test Cases

### Test 1: Create with screens
```bash
curl -X POST http://localhost:8080/api/userroles \
  -H "Content-Type: application/json" \
  -d '{
    "loginId": "IS03651",
    "roleCode": "USR",
    "centreCode": "13",
    "fromDate": "2025-01-01",
    "regStatus": "A",
    "screens": [
      {
        "screenId": "AD001",
        "screenCode": "AD001",
        "screenName": "Roles",
        "accessType": "WRITE",
        "status": "R",
        "fromDate": "2025-01-01",
        "createdBy": "IS03651"
      }
    ]
  }'
```

Expected Response: ✅ 200 OK with user role details

---

### Test 2: Update user role with new screens
```bash
curl -X PUT http://localhost:8080/api/userroles/IS03651/USR/13 \
  -H "Content-Type: application/json" \
  -d '{
    "fromDate": "2025-02-01",
    "toDate": "2025-12-31",
    "regStatus": "A",
    "screens": [
      {
        "screenId": "OP001",
        "screenCode": "OP001",
        "screenName": "Operations",
        "accessType": "READ",
        "status": "R",
        "fromDate": "2025-02-01"
      }
    ]
  }'
```

Expected Response: ✅ 200 OK with updated details

---

### Test 3: Assign screen to user role
```bash
curl -X POST http://localhost:8080/api/userroles/IS03651/USR/13/screens \
  -H "Content-Type: application/json" \
  -d '{
    "screenId": "AD001",
    "screenCode": "AD001",
    "screenName": "Roles",
    "accessType": "WRITE",
    "status": "R",
    "fromDate": "2025-01-01",
    "createdBy": "IS03651"
  }'
```

Expected Response: ✅ 200 OK with screen assignment details

---

## 🔍 Expected Console Output

**Success:**
```
✅ Screen assigned - screenCode: AD001, accessType: WRITE, status: R
✅ Screen assigned - screenCode: OP001, accessType: READ, status: R
```

**Errors to watch for:**
```
❌ Failed to assign screen AD001 with accessType WRITE: [error message]
```

---

## 📋 Verification Checklist

- [x] screenId maps to screenCode in backend
- [x] regStatus is single character (A, I)
- [x] status in screens is single character (R, I)
- [x] fromDate is NEVER null
- [x] Frontend sends both screenId and screenCode
- [x] Backend converts/syncs properly
- [x] All files compile without errors
- [ ] Test Create user role with screens via API
- [ ] Test Update user role with screens via API
- [ ] Test Assign screen endpoint
- [ ] Test UI form submission
- [ ] Check database records have correct data

---

## 🚀 Next Steps

1. **Restart backend** application
2. **Test via Postman** using curl commands above
3. **Test via React UI** - create/edit user role assignments
4. **Check database** for correct screenCode values
5. **Monitor console** for ✅ or ❌ messages

---

## 💾 Summary of Changes

| File | Change | Reason |
|------|--------|--------|
| UserRoleScreenMapper.java | Map screenId ↔ screenCode | Frontend uses screenId, DB uses screenCode |
| UserRoleService.create() | Sync screenId/screenCode, truncate status | Ensure data matches DB constraints |
| UserRoleService.update() | Same as create() | Consistency |
| UserRoleAssignmentPage.jsx | Send both screenId and screenCode | Backend compatibility |

---

**STATUS**: ✅ **READY FOR TESTING**

All 500 errors should now be resolved. Payload structure aligns with backend entity expectations.
