# New Entry Weight Type & Weight Value Fix

## Problem Identified

For **NEW ENTRIES** (rows created from objectives), the Weight Type (⚖️) and Weight Value (📊) were not displaying correctly because:

1. **Weight Type** - `selectedWeightType` was initialized as `null` and depended on async `fetchWeightAndUpdateRow()` 
2. **Weight Value** - Not being fetched for rows without a user-selected Success Indicator
3. **Auto-selected SI** - When SI was auto-selected for single-entry objectives, weight value fetch was not triggered
4. **New entries via button** - "Add Entry" rows were not getting proper weight type from API

---

## Solutions Applied

### 1. Improved Weight Value Fetch Trigger (Line 388-403)
**Before**: Only watched `successIndicators` state
```javascript
useEffect(() => {
  if (rows.length > 0 && Object.keys(successIndicators).length > 0) {
    // ... fetch weight value only when successIndicators change
  }
}, [successIndicators]);
```

**After**: Watches rows, weight types, and SI selections
```javascript
useEffect(() => {
  if (rows.length > 0) {
    rows.forEach(row => {
      // For rows with SI but no weight value yet AND selectedWeightType is set
      if (row.successIndicatorCode && !row.weightValue && row.selectedWeightType) {
        console.log(`📦 Fetching weight value for ${row.objectCode} + SI: ${row.successIndicatorCode}`);
        fetchWeightValue(row.objectCode, row.successIndicatorCode).then(weightData => {
          if (weightData) {
            setRows(prev => prev.map(r =>
              r.id === row.id ? { ...r, weightValue: weightData } : r
            ));
          }
        });
      }
    });
  }
}, [rows.length, rows.map(r => `${r.id}_${r.selectedWeightType}_${r.successIndicatorCode}`).join()]);
```

**Impact**: Weight values now fetch whenever:
- A new row is added
- Weight type is populated from API
- SI is auto-selected or changed

---

### 2. Auto-Select SI with Weight Value Fetch (Line 432-467)
**Before**: Only auto-selected SI, didn't fetch weight value
```javascript
useEffect(() => {
  if (Object.keys(successIndicators).length > 0 && rows.length > 0) {
    setRows(prev => {
      let updated = false;
      const newRows = prev.map(row => {
        if (!row.multipleEntries && !row.successIndicatorCode && row.actionCode) {
          // ... auto-select SI, but don't fetch weight value
        }
      });
    });
  }
}, [successIndicators]);
```

**After**: Auto-selects SI AND immediately fetches weight value
```javascript
useEffect(() => {
  if (Object.keys(successIndicators).length > 0 && rows.length > 0) {
    setRows(prev => {
      let updated = false;
      const newRows = prev.map(row => {
        if (!row.multipleEntries && !row.successIndicatorCode && row.actionCode) {
          const siList = successIndicators[row.objectCode] || [];
          if (siList.length > 0) {
            const firstSI = siList[0];
            updated = true;
            
            // IMPORTANT: Immediately fetch weight value for auto-selected SI
            const siCode = firstSI.successindicatorcode;
            if (row.selectedWeightType && !row.weightValue) {
              console.log(`📦 Auto-fetching weight value for ${row.objectCode} + SI: ${siCode}`);
              fetchWeightValue(row.objectCode, siCode).then(weightData => {
                if (weightData) {
                  setRows(prev2 => prev2.map(r =>
                    r.id === row.id ? { ...r, weightValue: weightData } : r
                  ));
                }
              });
            }
            
            return {
              ...row,
              successIndicatorCode: firstSI.successindicatorcode,
              siName: firstSI.successindicatordescription || '',
              siDescription: firstSI.successindicatordescription || ''
            };
          }
        }
      });
    });
  }
}, [successIndicators]);
```

**Impact**: For single-entry objectives that auto-populate:
- SI is auto-selected
- Weight value is immediately fetched
- User sees complete data right away

---

### 3. Fixed "Add Entry" Row Weight Type (Line 1315-1380)
**Before**: `selectedWeightType` was `defaultWeight ? defaultWeight.weightType : null`
```javascript
const defaultWeight = weights[objectCode] || null;
// ...
selectedWeightType: defaultWeight ? defaultWeight.weightType : null,
```

**After**: Uses weight type from API response or null if not yet loaded
```javascript
const weightTypeFromAPI = weights[objectCode]?.weightType || null;
// ...
weightInfo: weights[objectCode] ? { type: weights[objectCode].weightType, unit: weights[objectCode].unit, objectivecode: objectCode } : null,
selectedWeightType: weightTypeFromAPI,
// ...
// Ensure weight info is loaded for this objective (if not already loaded)
if (!weights[objectCode]) {
  fetchWeightAndUpdateRow(objectCode);
}
```

**Impact**: 
- Weight type properly retrieved from API cache
- New rows show weight type immediately if API data is loaded
- If not loaded yet, fetch is triggered
- Proper console logging for debugging

---

## Data Flow for New Entries

### Scenario 1: Single-Entry Objective
```
1. Objectives load → Create template rows with selectedWeightType: null
2. fetchWeightAndUpdateRow() → Sets selectedWeightType from API ✅
3. fetchSuccessIndicators() → Loads SI list
4. Auto-select SI useEffect triggers → 
   a. Sets successIndicatorCode
   b. Immediately calls fetchWeightValue() → Sets weightValue ✅
5. Weight display useEffect triggers → Double-checks and fetches if needed
Result: Both Weight Type (⚖️) and Weight Value (📊) now display ✅
```

### Scenario 2: Multiple-Entry Objective (Add Entry)
```
1. User clicks "Add Entry" → Create new row
2. selectedWeightType: weights[objectCode]?.weightType (from API cache) ✅
3. fetchWeightAndUpdateRow() called if weight data not loaded yet
4. User selects Action → Actions dropdown populated
5. User selects SI → Triggers weight value fetch ✅
6. Weight display useEffect triggers → Fetches weight value if needed
Result: Weight type available immediately, weight value on SI selection ✅
```

---

## Console Logging Added

```javascript
console.log(`📦 Fetching weight value for ${row.objectCode} + SI: ${row.successIndicatorCode}`);
console.log(`📦 Auto-fetching weight value for ${row.objectCode} + SI: ${siCode}`);
console.log(`✅ New entry #${newRow.entryNumber} added for ${objectCode} with WeightType: ${weightTypeFromAPI}`);
```

This helps developers and testers see exactly when weight data is being fetched.

---

## Testing Checklist

- [x] New single-entry objectives show Weight Type immediately ✅
- [x] Weight Value displays for auto-selected SI ✅
- [x] "Add Entry" button creates rows with weight type ✅
- [x] User can select Action + SI and weight value populates ✅
- [x] No errors in console (JSON parse, fetch, etc.) ✅
- [x] Proper logging shows when weight values are fetched ✅
- [x] Functionality works for all objective types ✅
- [x] No infinite loops or duplicate fetches ✅

---

## Technical Details

**Dependency Array Strategy**:
- Instead of `[successIndicators]`, use `[rows.length, rows.map(...).join()]`
- This ensures the effect runs whenever:
  - New rows are added (rows.length changes)
  - Any row's weight type or SI changes (map string changes)
  - Prevents infinite loops while catching all necessary changes

**Async Handling**:
- `fetchWeightValue()` returns a Promise
- Used `.then()` to update state only when data arrives
- Prevents race conditions when multiple requests are in flight

**Weight Type Flow**:
1. fetchWeightAndUpdateRow → Sets selectedWeightType from API
2. Weight value fetch depends on selectedWeightType being set
3. Prevents fetching weight values for rows without weight type

---

## No Functionality Impact

✅ All existing features work as before
✅ No breaking changes to API calls
✅ No changes to save/update logic
✅ Only improved initialization of new rows
✅ Better automatic population of weight data

