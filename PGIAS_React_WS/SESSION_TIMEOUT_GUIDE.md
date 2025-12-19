# Session Timeout & Routing Quick Reference

## What Changed

### Before
- ❌ After login, redirected to home page (http://localhost:5173/)
- ❌ No session timeout
- ❌ No security measures
- ❌ Unclear routing

### After (NEW)
- ✅ After login, redirected to **Dashboard** immediately
- ✅ **15-minute session timeout** on inactivity
- ✅ **2-minute warning** before timeout
- ✅ **Secure session tokens** generated
- ✅ **Role-based page filtering** (only assigned pages shown)
- ✅ Auto-logout on session expiry

---

## How It Works

### 1. Login Flow
```
User enters credentials
        ↓
POST /api/auth/login
        ↓
Validate & fetch user roles
        ↓
Generate session token
        ↓
Store: localStorage (pgias_user) + sessionStorage (pgias_session_token)
        ↓
Redirect to Dashboard (default page)
```

### 2. Session Timeout Logic
```
User Activity Detected (mouse, keyboard, scroll, touch)
        ↓
Reset 15-minute timer
        ↓
If inactive for 15 minutes:
        ↓
Show 2-minute warning at 13 minutes
        ↓
Auto-logout & return to Login page
        ↓
Message: "Your session has expired due to inactivity"
```

### 3. Dashboard Default Page
```
MainLayout component
        ↓
const [activePage, setActivePage] = useState('dashboard');
        ↓
PageRouter renders based on activePage
        ↓
Dashboard displayed by default
```

---

## Configuration

### Adjust Session Timeout (in minutes)

**File**: `src/App.jsx`

**Find**:
```javascript
const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes
```

**Examples**:
```javascript
// 5 minutes
const SESSION_TIMEOUT = 5 * 60 * 1000;

// 10 minutes
const SESSION_TIMEOUT = 10 * 60 * 1000;

// 30 minutes
const SESSION_TIMEOUT = 30 * 60 * 1000;

// 1 hour
const SESSION_TIMEOUT = 60 * 60 * 1000;
```

### Adjust Warning Time

**Find**:
```javascript
const WARNING_TIME = 2 * 60 * 1000; // 2 minutes before timeout
```

**Examples**:
```javascript
// Show warning 5 minutes before timeout
const WARNING_TIME = 5 * 60 * 1000;

// Show warning 30 seconds before timeout
const WARNING_TIME = 30 * 1000;
```

---

## Key Files Modified

| File | Change | Impact |
|------|--------|--------|
| `src/App.jsx` | AuthProvider added session timeout logic | User auto-logout after 15 min inactivity |
| `src/App.jsx` | LoginPage shows session expired message | Clear feedback on re-login |
| `src/App.jsx` | MainLayout defaults to dashboard | Users see dashboard first |
| `src/App.jsx` | Removed HomePage navigation | Direct routing to login/dashboard |

---

## Security Features

### ✅ What's Protected

1. **Session Timeout**: Auto-logout prevents unauthorized access to unattended terminals
2. **Activity Monitoring**: Detects user presence via mouse, keyboard, scroll, touch, click
3. **Session Token**: Unique token generated per login (not reusable)
4. **Secure Storage**: 
   - User data in `localStorage` (survives refresh)
   - Session token in `sessionStorage` (cleared on browser close)
5. **Role-Based Access**: Only assigned pages shown in sidebar
6. **Logout Cleanup**: All data cleared from storage on logout
7. **Warning System**: 2-minute advance notice before timeout

### ⚠️ Still Need (Backend Implementation)

1. **HTTPS**: All communication must be encrypted
2. **CSRF Token Validation**: On API requests
3. **Rate Limiting**: Prevent brute force login attempts
4. **Password Hashing**: bcrypt/argon2 on backend
5. **Account Lockout**: After N failed login attempts
6. **Audit Logging**: Track all access and changes
7. **2FA (Optional)**: Two-factor authentication for higher security

---

## Testing the Implementation

### Test 1: Session Timeout
1. Login successfully
2. Wait 15 minutes without doing anything
3. ✅ System should auto-logout & show "session expired" message

### Test 2: Activity Reset Timer
1. Login successfully
2. Wait 10 minutes
3. Move mouse or type something
4. Wait 10 more minutes (timer resets)
5. ✅ System should NOT logout (timer was reset)

### Test 3: Warning Display
1. Login successfully
2. Wait 13 minutes without activity
3. ✅ Yellow warning banner should appear
4. Shows time remaining (e.g., "1:45")

### Test 4: Immediate Dashboard
1. Login successfully
2. ✅ Dashboard should load (not home page)
3. Verify URL shows `/` with dashboard content

### Test 5: Role-Based Pages
1. Login with user role "ADM" (Admin)
2. ✅ Sidebar shows all pages
3. Logout, login with user role "USR" (User)
4. ✅ Sidebar shows only assigned pages for that role

### Test 6: Session Token Cleanup
1. Login successfully
2. Open browser DevTools → Application → sessionStorage
3. ✅ Should see: `pgias_session_token`
4. Logout
5. ✅ `pgias_session_token` should be gone

### Test 7: Browser Close
1. Login successfully (incognito window recommended)
2. Close the browser window completely
3. Reopen browser
4. ✅ Should require login again (sessionStorage cleared)
5. Note: localStorage still has user data (for fast re-login, but sessionStorage is cleared)

---

## Common Issues & Troubleshooting

### Issue: Not redirecting to dashboard after login
**Solution**: Check that `MainLayout` sets default page to 'dashboard'
```javascript
const [activePage, setActivePage] = useState('dashboard'); // ✅ Should be dashboard
```

### Issue: Session timeout not working
**Solution**: Verify event listeners are attached
```javascript
const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
// All these events should reset the timer
```

### Issue: Session token missing
**Solution**: Check sessionStorage has token after login
```javascript
sessionStorage.getItem('pgias_session_token') // Should not be null
```

### Issue: User still logged in after 15 minutes
**Solution**: Verify timer is set correctly
```javascript
const SESSION_TIMEOUT = 15 * 60 * 1000; // Check this is 15 minutes (in milliseconds)
```

### Issue: Warning appears too early or too late
**Solution**: Adjust `WARNING_TIME`
```javascript
const WARNING_TIME = 2 * 60 * 1000; // Currently 2 minutes before timeout
```

---

## API Integration Checklist

- [ ] Backend `/api/auth/login` validates credentials
- [ ] Backend `/api/auth/login` returns user data + roles
- [ ] Backend `/api/userroles/{loginId}` returns assigned pages/screens
- [ ] Backend validates session token on every API request
- [ ] Backend implements rate limiting on login endpoint
- [ ] Backend implements account lockout after N failed attempts
- [ ] Backend logs all authentication events
- [ ] Backend returns proper error messages (no user enumeration)

---

## Next Steps

1. **Test all scenarios** from "Testing the Implementation" section above
2. **Backend Enhancement**: Add session token validation to `/api` endpoints
3. **Implement Rate Limiting**: Prevent brute force attacks on login
4. **Add Audit Logging**: Log all login, logout, page access events
5. **HTTPS Configuration**: Ensure production uses HTTPS
6. **Security Headers**: Configure CORS, CSP, and other security headers
7. **Password Policy**: Enforce minimum complexity requirements
8. **2FA Implementation**: Optional but recommended for high-security roles

---

## Support & Documentation

- Full security guide: See `SECURITY_IMPLEMENTATION.md`
- Session code location: `src/App.jsx` - `AuthProvider` component
- Login page code: `src/App.jsx` - `LoginPage` component
- Dashboard routing: `src/App.jsx` - `MainLayout` component

---

**Status**: ✅ Ready for Testing
**Security Level**: Medium (Frontend) + Needs Backend Enhancement
**Session Duration**: 15 minutes (configurable)
