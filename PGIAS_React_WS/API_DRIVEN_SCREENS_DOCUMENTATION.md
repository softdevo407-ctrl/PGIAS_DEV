# API-Driven Screens Implementation

## Overview
All screens are now fetched from the API `http://localhost:8080/api/screens` instead of being hardcoded. Screen names displayed throughout the UI are dynamically populated from the API response.

## Changes Made

### 1. Created Screens Service (`src/services/screensService.js`)
- **Purpose**: Centralized management of screens data
- **Key Functions**:
  - `fetchScreens()` - Fetches all screens from API with fallback to hardcoded defaults
  - `getScreenNameByPageKey(pageKey, screens)` - Gets screen name by page key
  - `getScreenNameByScreenId(screenId, screens)` - Gets screen name by screen ID
  - `pageKeyToScreenId(pageKey)` - Converts page key to screen ID
  - `screenIdToPageKey(screenId)` - Converts screen ID to page key

- **Mappings**:
  - `SCREEN_TO_PAGE_KEY` - Maps screen IDs to internal page keys for routing
  - `PAGE_KEY_TO_SCREEN` - Maps internal page keys to screen IDs
  - `FALLBACK_SCREENS` - Hardcoded screens as fallback if API fails

### 2. Created Screens Context
- **Location**: `App.jsx`
- **Context**: `ScreensContext`
- **Hook**: `useScreens()`
- **Provider**: `ScreensProvider` component

### 3. Updated Sidebar Component
- Now uses `useScreens()` to get screens from API
- Dynamic screen names displayed in:
  - Main navigation buttons
  - Operations submenu items
  - Generic Entry submenu items
- Gracefully falls back to PAGES configuration if screens not loaded

### 4. Updated App Component Structure
```
PGIASApp
  ├─ AuthProvider
  │   └─ ScreensProvider (NEW)
  │       └─ App
  │           ├─ LoginPage (when not logged in)
  │           └─ MainLayout (when logged in)
  │               ├─ Sidebar (uses screens from context)
  │               └─ PageRouter
```

### 5. API Response Format
The API at `http://localhost:8080/api/screens` should return an array like:
```json
[
  {
    "fromDate": "2025-01-01",
    "regStatus": "R",
    "regTime": "2025-01-01T00:00:00",
    "screenCategory": "Admin",
    "screenId": "AD001",
    "screenName": "Roles",
    "toDate": null,
    "userId": "IS03651"
  },
  {
    "fromDate": "2025-01-01",
    "regStatus": "R",
    "regTime": "2025-01-01T00:00:00",
    "screenCategory": "Admin",
    "screenId": "AD002",
    "screenName": "User Roles",
    "toDate": null,
    "userId": "IS03651"
  }
  // ... more screens
]
```

## Screen ID to Page Key Mapping

| Screen ID | Page Key | Display Name (from API) |
|-----------|----------|------------------------|
| SCR001 | dashboard | Dashboard |
| SCR002 | users | User Management |
| SCR003 | operations | Operations |
| SCR004 | operationsDataEntry | Data Entry |
| SCR005 | operationsReview | Review & Approve |
| SCR006 | operationsReport | Reports |
| SCR007 | operationsApproval | Approval Queue |
| SCR008 | genericEntry | Generic Entry |
| SCR009 | roleManagement | Role Management |
| SCR010 | userRoleAssignment | User Role Assignment |
| SCR011 | centres | Centres |
| SCR012 | centreTypes | Centre Types |
| SCR013 | objectives | Objectives |
| SCR014 | screens | Screens |
| SCR015 | successIndicator | Success Indicators |
| SCR016 | actions | Actions |
| SCR017 | statusCodes | Status Codes |
| SCR018 | unitDatatypeCodes | Unit Datatype Codes |

## Error Handling

### Fallback Mechanism
If API fails or returns invalid data:
1. Service catches error and logs it
2. Returns `FALLBACK_SCREENS` array with default screen configurations
3. UI components fall back to `PAGES` configuration names
4. User sees default names but application continues to work

### Loading State
- `ScreensProvider` manages loading state
- Components can check `screensLoading` flag if needed
- Sidebar doesn't block rendering while screens load

## How to Use in Components

### Using the Screens Context
```jsx
import { useScreens } from './App'; // if exported
// OR
const { screens, screensLoading, screensError } = useScreens();
```

### Getting Screen Names
```jsx
import { getScreenNameByPageKey } from './services/screensService';

const displayName = getScreenNameByPageKey('dashboard', screens) || 'Dashboard';
```

## Files Modified/Created

### Created:
- `src/services/screensService.js` - Screens management service

### Modified:
- `src/App.jsx` - Added ScreensContext, ScreensProvider, updated Sidebar, updated exports

## Benefits

1. **Dynamic Configuration**: Screen names can be changed in database without code changes
2. **Centralized Management**: All screens managed in one place (API)
3. **Role-Based Screens**: Can add role-based screen filtering in future
4. **Audit Trail**: Screen access tracked through database records (fromDate, toDate, regStatus, userId)
5. **Maintainability**: Easier to add/remove screens without modifying code

## Future Enhancements

1. Filter screens by user role from API
2. Add screen permissions/access levels
3. Implement screen visibility based on user attributes
4. Add screen categories in sidebar grouping
5. Cache screens data in localStorage for performance
6. Implement real-time screen updates via WebSocket

## Testing

### Test API Response
```bash
curl http://localhost:8080/api/screens
```

### Test Fallback
1. Start app with API down
2. Verify sidebar displays default names from PAGES config
3. Verify console shows "Failed to fetch screens" warning

### Test Dynamic Names
1. Update screen name in API
2. Refresh application
3. Verify new name appears in sidebar
