# PGIAS Security Implementation Guide

## Overview
This document details the security measures implemented in the PGIAS system after login authentication and session management.

---

## 1. Session Management (15-Minute Timeout)

### Implementation Details
- **Timeout Duration**: 15 minutes of inactivity
- **Token Storage**: 
  - User data in `localStorage` (for persistence across tab refresh)
  - Session token in `sessionStorage` (cleared on browser close)
  - Session token is randomly generated on each login

### How It Works

```javascript
// Session Configuration
const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds

// Session Token Generation on Login
const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
sessionStorage.setItem('pgias_session_token', sessionToken);
```

### Activity Monitoring
The system monitors these user activities to reset the timeout timer:
- Mouse movement (`mousedown`)
- Keyboard input (`keydown`)
- Page scrolling (`scroll`)
- Touch events (`touchstart`)
- Clicks (`click`)

### Session Expiry Alert
- Users are warned **2 minutes before** session expires
- Warning message: "Your session will expire in X:XX due to inactivity"
- Timer display updates every second
- Auto-logout on session expiry with clear message

---

## 2. Authentication Flow

### Login Process
```
1. User enters credentials (Login ID + Password)
2. Frontend sends request to /api/auth/login
3. Backend validates credentials
4. Fetch user roles from /api/userroles/{loginId}
5. Generate secure session token
6. Store in localStorage and sessionStorage
7. Record login timestamp
8. Redirect to Dashboard
```

### Post-Login Navigation
- **Default Page**: Dashboard (not home page)
- **URL After Login**: `http://localhost:5173/` → Dashboard
- **Route Protection**: Only authenticated users can access MainLayout
- **Page Visibility**: Shows only assigned pages based on user roles

---

## 3. Role-Based Access Control (RBAC)

### User Roles Fetched From
- **Endpoint**: `GET /api/userroles/{loginId}`
- **Response**: Array of role objects with `roleCode` property
- **Storage**: Roles stored in user context with `loginId` as identifier

### Assigned Pages Display
The system uses role information to:
1. Filter available pages in sidebar
2. Display only screens assigned to user's roles
3. Hide unauthorized pages from navigation
4. Prevent direct URL access to unauthorized pages

---

## 4. Storage Security

### localStorage (Persistent)
```javascript
{
  pgias_user: {
    loginId: "IS03651",
    name: "User Name",
    email: "user@isro.gov.in",
    roles: ["ADM", "APR"],
    roleCode: "ADM",
    centreCode: "CENTRE01",
    loginTime: "2025-01-01T10:30:00.000Z"
  }
}
```

### sessionStorage (Session-Only)
```javascript
{
  pgias_session_token: "session_1234567890_abc123def"
}
```

### Cleanup on Logout
- Both localStorage and sessionStorage cleared
- Session timer cleared
- User redirected to login page
- All user data removed from memory

---

## 5. Request Headers & Security

### API Call Headers
All API requests include:
```javascript
{
  'Content-Type': 'application/json',
  'Authorization': 'Bearer {sessionToken}' // (recommended to implement on backend)
}
```

### Backend Should Validate
1. Session token presence in sessionStorage
2. User exists in database
3. Session not expired on server side
4. User has permission for requested resource
5. Audit log the API call with timestamp

---

## 6. Protection Mechanisms

### CSRF Protection
- Session token is random and unique per login
- API calls should use POST/PUT/DELETE for state-changing operations
- Backend should validate CSRF tokens (not yet implemented - add to backend)

### XSS Protection
- React automatically escapes template strings
- Input validation on all form fields
- No `dangerouslySetInnerHTML` used anywhere
- Content Security Policy (CSP) should be configured on server

### SQL Injection Prevention
- All API calls use parameterized queries (backend responsibility)
- No direct SQL string concatenation
- Input validation and sanitization required on backend

---

## 7. Password Security

### Current Implementation
- Password sent over HTTPS (localhost in dev, production HTTPS required)
- Password not stored in localStorage or sessionStorage
- Password cleared from form on successful login
- Minimum 6 characters validation on frontend

### Backend Should Implement
1. Password hashing (bcrypt/argon2)
2. Password salt generation
3. Password expiry policies
4. Failed login attempt tracking
5. Account lockout after N failed attempts

---

## 8. Session Timeout Configuration

### To Adjust Timeout Period
Edit in `App.jsx`:
```javascript
// Change this value (in milliseconds)
const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes

// Warning threshold (show warning 2 minutes before timeout)
const WARNING_TIME = 2 * 60 * 1000; // 2 minutes

// Examples:
// 5 minutes: 5 * 60 * 1000
// 30 minutes: 30 * 60 * 1000
// 1 hour: 60 * 60 * 1000
```

---

## 9. Login Page Security

### Input Validation
- **Login ID**: 6+ alphanumeric characters
- **Password**: 6+ characters (no character restriction)
- Real-time validation feedback
- Form validation before submission

### Feedback Messages
- Specific error messages for:
  - Invalid credentials
  - Service unavailable
  - Session expired (on re-login)
- No user enumeration (same message for invalid ID or password)

---

## 10. Dashboard Redirect

### Current Flow
```
Login Success → Dashboard (default page)
               ↓
         Sidebar shows assigned pages
               ↓
         User can access only permitted pages
```

### Previously (Removed)
- Home page navigation after login ❌
- No automatic dashboard redirect ❌
- Unclear routing ❌

---

## 11. Audit & Logging

### What Should Be Logged (Backend)
1. **Login Events**
   - loginId, timestamp, IP address, success/failure
   - Failed attempts, lockout events

2. **API Calls**
   - User ID, endpoint, method, timestamp
   - Request/response status, data accessed

3. **Session Events**
   - Login time, logout time, session timeout
   - Activity timestamps

4. **Permission Changes**
   - Role assignments/modifications
   - Page/screen permission changes

### Log Retention
- Keep logs for compliance (typically 2+ years)
- Secure storage (encrypted, access-controlled)
- Regular backup of audit logs

---

## 12. Recommended Backend Enhancements

### Authentication API
```
POST /api/auth/login
  Request: { loginId, password }
  Response: { user, sessionToken, expiresIn }

POST /api/auth/logout
  Request: { sessionToken }
  Response: { success }

POST /api/auth/verify-session
  Request: { sessionToken }
  Response: { valid, user, timeRemaining }
```

### Role-Based Authorization
```
GET /api/userroles/{loginId}
  Headers: { Authorization: 'Bearer sessionToken' }
  Response: [{ roleCode, roleDescription, ...}]

GET /api/user-assigned-pages/{loginId}
  Headers: { Authorization: 'Bearer sessionToken' }
  Response: [{ pageCode, pageName, ... }]
```

### API Security Headers (All Responses)
```javascript
{
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'"
}
```

---

## 13. Production Deployment Checklist

- [ ] HTTPS enabled (SSL/TLS certificate)
- [ ] Environment variables for API endpoints
- [ ] Backend session validation on every API call
- [ ] Rate limiting on login endpoint
- [ ] CORS properly configured (specific domains only)
- [ ] Database encryption enabled
- [ ] Audit logging implemented
- [ ] Password policy enforced
- [ ] Account lockout mechanism
- [ ] Two-factor authentication (optional but recommended)
- [ ] Session timeout synced between frontend & backend
- [ ] CSP headers configured
- [ ] Security headers set on all responses
- [ ] Regular security audits scheduled
- [ ] Penetration testing completed

---

## 14. Testing Security

### Test Cases
1. **Session Timeout**: Wait 15 minutes without activity → Auto-logout
2. **Activity Reset**: Perform action within 15 min → Timer resets
3. **Warning Display**: Check warning at 13 minutes mark
4. **Invalid Credentials**: Enter wrong password → Error message
5. **Session Expiry Message**: Force logout → Show session expired message
6. **Role-Based Access**: Switch users with different roles → See different pages
7. **Direct URL Access**: Try accessing unauthorized page → Redirect or error
8. **Browser Close**: Close and reopen → Require re-login
9. **Multiple Tabs**: Login in one tab → Other tabs show session active
10. **Cross-Tab Logout**: Logout in one tab → Other tabs logout too

---

## 15. Security Contacts & Escalation

### For Security Issues
1. **Report to**: security@isro.gov.in
2. **Include**: Vulnerability description, reproduction steps, impact
3. **Do NOT**: Publicly disclose vulnerabilities
4. **Responsible Disclosure**: 90-day disclosure timeline

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-01-01 | Initial security implementation with 15-min timeout |

---

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [React Security Best Practices](https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
