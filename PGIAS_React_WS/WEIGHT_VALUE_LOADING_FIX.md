# Weight Value Loading Fix - multipleEntries Logic

## Problem Statement
- **For `multipleEntries = yes`**: Weight values should show "—" initially and populate with API data after SI selection ✓ (already working)
- **For `multipleEntries = no`**: Weight values should load immediately with fixed performance level values (⭐ Excellent, 📈 Very Good, ✓ Good, ⬇️ Fair, ❌ Poor)

## Changes Made

### 1. Updated `handleSIChange()` Function (Line 1137)
**Purpose**: When user selects a Success Indicator

**Logic**:
- For `multipleEntries = yes`: Keep existing behavior - just fetch and load weight value
- For `multipleEntries = no`: Auto-populate fixed performance level values when SI is selected:
  ```javascript
  excellent: '⭐ Excellent'
  veryGood: '📈 Very Good'
  good: '✓ Good'
  fair: '⬇️ Fair'
  poor: '❌ Poor'
  ```

**Code**:
```javascript
fetchWeightValue(objectCode, siCode).then(weightData => {
  if (weightData) {
    setRows(prev => prev.map(row =>
      row.id === rowId 
        ? { 
            ...row, 
            weightValue: weightData,
            // For single-entry (multipleEntries = No): Load fixed performance level values
            ...(isMultipleEntries === false && {
              excellent: '⭐ Excellent',
              veryGood: '📈 Very Good',
              good: '✓ Good',
              fair: '⬇️ Fair',
              poor: '❌ Poor'
            })
          } 
        : row
    ));
  }
});
```

### 2. Updated Auto-Select SI Effect (Line 469)
**Purpose**: When objectives load and SI data becomes available

**For Single-Entry Objectives**:
- Auto-selects first SI from the list
- Immediately loads fixed performance level values
- Also fetches weight value from API

**Updates**:
```javascript
// In return statement:
excellent: '⭐ Excellent',
veryGood: '📈 Very Good',
good: '✓ Good',
fair: '⬇️ Fair',
poor: '❌ Poor'

// In fetchWeightValue callback:
setRows(prev2 => prev2.map(r =>
  r.id === row.id ? { 
    ...r, 
    weightValue: weightData,
    excellent: '⭐ Excellent',
    veryGood: '📈 Very Good',
    good: '✓ Good',
    fair: '⬇️ Fair',
    poor: '❌ Poor'
  } : r
));
```

### 3. Updated Saved Row Loading (Line 815)
**Purpose**: When previously saved data is loaded from API

**Logic**:
- For `multipleEntries = no`: Use fixed values as fallback if database values are empty
- For `multipleEntries = yes`: Use database values as-is

**Code**:
```javascript
excellent: !isMultipleEntries ? (item.targetcriteriavalueexcellent || '⭐ Excellent') : (item.targetcriteriavalueexcellent || ''),
veryGood: !isMultipleEntries ? (item.targetcriteriavalueverygood || '📈 Very Good') : (item.targetcriteriavalueverygood || ''),
good: !isMultipleEntries ? (item.targetcriteriavaluegood || '✓ Good') : (item.targetcriteriavaluegood || ''),
fair: !isMultipleEntries ? (item.targetcriteriavaluefair || '⬇️ Fair') : (item.targetcriteriavaluefair || ''),
poor: !isMultipleEntries ? (item.targetcriteriavaluepoor || '❌ Poor') : (item.targetcriteriavaluepoor || ''),
```

## Behavior Summary

### Multiple Entries (multipleEntries = yes)
| Stage | Excellent | Very Good | Good | Fair | Poor |
|-------|-----------|-----------|------|------|------|
| Initial Load | — | — | — | — | — |
| After SI Selection | (user enters) | (user enters) | (user enters) | (user enters) | (user enters) |
| Saved Data Load | (from DB) | (from DB) | (from DB) | (from DB) | (from DB) |

### Single Entry (multipleEntries = no)
| Stage | Excellent | Very Good | Good | Fair | Poor |
|-------|-----------|-----------|------|------|------|
| Initial Load | — | — | — | — | — |
| After SI Auto-Select | ⭐ Excellent | 📈 Very Good | ✓ Good | ⬇️ Fair | ❌ Poor |
| Saved Data Load | (from DB or fixed) | (from DB or fixed) | (from DB or fixed) | (from DB or fixed) | (from DB or fixed) |

## Test Checklist

- [ ] Create new entry for single-entry objective → values should appear immediately
- [ ] Create new entry for multi-entry objective → values should remain "—" until user enters them
- [ ] Load existing data for single-entry objective → should show saved or fixed values
- [ ] Load existing data for multi-entry objective → should show saved values
- [ ] Weight Value column shows correctly (with API weight value)
- [ ] Weight Type column shows correctly (emoji-labeled)
- [ ] Form submission includes all performance level values
