# ✅ Conditional Centre Validation - Explained

## What Changed

The centre validation now works **conditionally based on user role**:

### **If User's Role = "ALL" (Can Select Any Centre)**
- ⚠️ Show yellow warning banner: "CENTRE SELECTION REQUIRED"
- 🔴 Show "*REQUIRED" label on centre dropdown
- 🔴 Show red border and pink background on dropdown
- 🔴 Show "🔴 SELECT CENTRE FIRST..." placeholder
- 🔴 Show red helper text: "👆 Select your centre to proceed"
- 🔴 Disable data table (50% opacity, no clicks)
- **Result:** User MUST select a centre before operations

### **If User's Role = Specific Centre (Pre-assigned from localStorage)**
- ✅ Hide yellow warning banner (no warning needed)
- ✅ Hide "*REQUIRED" label (centre already selected)
- ✅ Show centre in green success box (locked in)
- ✅ Enable data table immediately (full opacity, clickable)
- **Result:** User's centre is already selected, can proceed directly

---

## User Role Logic

**From localStorage:**
```javascript
const centreCodeFromStorage = localStorage.getItem('centreCode');

// If centreCode is 'ALL' or 'all'
String(centreCodeFromStorage).toUpperCase() === 'ALL'
  → User can select ANY centre
  → Show validation/warning

// If centreCode is specific (e.g., '01', '13', 'URSC', etc.)
String(centreCodeFromStorage).toUpperCase() !== 'ALL'
  → User is locked to that specific centre
  → Skip validation, centre pre-selected
  → Enable operations immediately
```

---

## Code Changes Made

### **1. Centre Label - Conditional "*REQUIRED"**
**Before:**
```javascript
💼 Centre *REQUIRED  (Always shows)
```

**After:**
```javascript
💼 Centre {String(assignedCentre).toUpperCase() === 'ALL' && (!centrecode || centrecode.trim() === '') && <span>*REQUIRED</span>}

// Shows "*REQUIRED" ONLY when:
// 1. assignedCentre === 'ALL' (user can select)
// 2. AND centrecode is empty (not yet selected)
```

---

### **2. Warning Banner - Conditional Display**
**Before:**
```javascript
{(!centrecode || centrecode.trim() === '') && (
  <div className="alert alert-warning">
    CENTRE SELECTION REQUIRED
  </div>
)}
// Shows whenever centre is empty
```

**After:**
```javascript
{String(assignedCentre).toUpperCase() === 'ALL' && (!centrecode || centrecode.trim() === '') && (
  <div className="alert alert-warning">
    CENTRE SELECTION REQUIRED
  </div>
)}
// Shows ONLY when:
// 1. assignedCentre === 'ALL' (user can select)
// 2. AND centrecode is empty (not yet selected)
```

---

### **3. Data Table Disable - Conditional**
**Before:**
```javascript
className={`card ${(!centrecode || centrecode.trim() === '') ? 'opacity-50' : ''}`}
style={{pointerEvents: (!centrecode || centrecode.trim() === '') ? 'none' : 'auto'}}

// Disables whenever centre is empty
```

**After:**
```javascript
className={`card ${(String(assignedCentre).toUpperCase() === 'ALL' && (!centrecode || centrecode.trim() === '')) ? 'opacity-50' : ''}`}
style={{pointerEvents: (String(assignedCentre).toUpperCase() === 'ALL' && (!centrecode || centrecode.trim() === '')) ? 'none' : 'auto'}}

// Disables ONLY when:
// 1. assignedCentre === 'ALL' (user can select)
// 2. AND centrecode is empty (not yet selected)
```

---

## User Scenarios

### **Scenario A: User with Role-Based Centre Assignment**
```
Login → Role assigns centre '01' (URSC)
         ↓
localStorage.setItem('centreCode', '01')
         ↓
Page loads → assignedCentre = '01'
         ↓
String(assignedCentre).toUpperCase() !== 'ALL'
         ↓
✅ No warning banner
✅ No "*REQUIRED" label
✅ Centre shown as: "✅ URSC - University RSC"
✅ Data table ENABLED (100% opacity, clickable)
         ↓
User can IMMEDIATELY:
  • See their objectives
  • Save target settings
  • Edit entries
  • Delete entries
```

### **Scenario B: User with "ALL" Centre Access**
```
Login → Role allows selecting ANY centre
        ↓
localStorage.setItem('centreCode', 'ALL')
         ↓
Page loads → assignedCentre = 'ALL', centrecode = ''
         ↓
String(assignedCentre).toUpperCase() === 'ALL'
         ↓
⚠️ Yellow warning banner appears
🔴 "*REQUIRED" label shows
🔴 Dropdown has red border + pink bg
🔴 Data table DISABLED (50% opacity, no clicks)
         ↓
User MUST:
  1. Click centre dropdown
  2. Select centre (e.g., "URSC")
  3. Press Enter or click option
         ↓
THEN:
  ✅ Warning disappears
  ✅ Dropdown turns green
  ✅ Data table enables
  ✅ Objectives load for selected centre
```

---

## Benefits

✅ **Role-Based UX:** Different experience based on user's permissions
✅ **Prevents Confusion:** Admin users with "ALL" access know they must select
✅ **Smooth Flow:** Role-based users don't see unnecessary warnings
✅ **Security:** Respects role assignments from localStorage
✅ **User-Friendly:** Clear indication of what's required vs. what's locked in

---

## Files Modified

**File:** `e:\Dev WS\PGIAS_React_WS\src\pages\OperationsTargetSettingPage.jsx`

**Changes:**
1. **Line ~1300:** Centre label with conditional "*REQUIRED"
   ```javascript
   💼 Centre {String(assignedCentre).toUpperCase() === 'ALL' && (!centrecode || centrecode.trim() === '') && <span>*REQUIRED</span>}
   ```

2. **Line ~1266:** Warning banner with condition
   ```javascript
   {String(assignedCentre).toUpperCase() === 'ALL' && (!centrecode || centrecode.trim() === '') && (...)}
   ```

3. **Line ~1401:** Data table disable logic
   ```javascript
   className={`... ${(String(assignedCentre).toUpperCase() === 'ALL' && (!centrecode || centrecode.trim() === '')) ? 'opacity-50' : ''}`}
   style={{pointerEvents: (String(assignedCentre).toUpperCase() === 'ALL' && (!centrecode || centrecode.trim() === '')) ? 'none' : 'auto'}}
   ```

4. **Line ~1412:** Data table error message condition
   ```javascript
   {(String(assignedCentre).toUpperCase() === 'ALL' && (!centrecode || centrecode.trim() === '')) ? (...) : ...}
   ```

---

## Testing

Test with different user roles:

### **Test Case 1: Role-Based Centre User**
```
1. Set localStorage: centreCode = '01'
2. Load page
3. Verify: No warning banner
4. Verify: No "*REQUIRED" label
5. Verify: Centre shows "✅ URSC - University RSC"
6. Verify: Data table is enabled (clickable)
7. Verify: Objectives load immediately
✅ PASS: User can proceed without selecting centre
```

### **Test Case 2: "ALL" Centre User**
```
1. Set localStorage: centreCode = 'ALL'
2. Load page
3. Verify: Yellow warning banner appears
4. Verify: "*REQUIRED" label appears
5. Verify: Dropdown has red border (3px) + pink background
6. Verify: Data table is disabled (50% opacity, no clicks)
7. User clicks dropdown and selects "URSC"
8. Verify: Warning disappears
9. Verify: Label and dropdown turn green
10. Verify: Data table enables
11. Verify: Objectives load for selected centre
✅ PASS: User must select centre before operations
```

### **Test Case 3: Centre Change**
```
1. User has 'ALL' access, selects "URSC"
2. Table is enabled, user enters data
3. User clicks centre dropdown and selects "RSC-2"
4. Verify: Old data cleared
5. Verify: New centre's data loads
6. Verify: Table remains enabled
7. Verify: Operations continue to work
✅ PASS: Changing centre works seamlessly
```

---

## Summary

The validation now respects user roles:
- **Role-based users** → Centre pre-selected, no warnings, immediate access
- **Admin users (ALL)** → Must select centre, shows warnings, prevents data confusion

This provides the best UX for both user types while preventing errors!

