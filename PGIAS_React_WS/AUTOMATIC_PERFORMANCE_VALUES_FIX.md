# Fixed: Automatic Loading of Performance Values for Single-Entry Objectives

## Problem
For new entries where `multipleEntries = no`, the fixed performance level values (⭐ Excellent, 📈 Very Good, ✓ Good, ⬇️ Fair, ❌ Poor) were not loading automatically at row creation time. Users had to wait for SI selection to see these values.

## Solution
Updated the code to automatically populate the fixed performance level values at the moment template rows are created, for all single-entry objectives (`multipleEntries = no`).

## Changes Made

### 1. Initial Template Rows Creation (Lines 299-345)
**When objectives first load**, template rows now include pre-populated fixed values:

```javascript
// For single-entry objectives (multipleEntries = No): Pre-load fixed performance level values
// For multi-entry objectives (multipleEntries = Yes): Leave empty for user to enter
excellent: !hasMultipleEntries ? '⭐ Excellent' : '',
veryGood: !hasMultipleEntries ? '📈 Very Good' : '',
good: !hasMultipleEntries ? '✓ Good' : '',
fair: !hasMultipleEntries ? '⬇️ Fair' : '',
poor: !hasMultipleEntries ? '❌ Poor' : '',
```

### 2. Template Rows During Centre Selection (Lines 2156-2200)
**When a centre is selected**, the created template rows also include the fixed values immediately:

```javascript
// For single-entry objectives (multipleEntries = No): Pre-load fixed performance level values
// For multi-entry objectives (multipleEntries = Yes): Leave empty for user to enter
excellent: isSingleEntry ? '⭐ Excellent' : '',
veryGood: isSingleEntry ? '📈 Very Good' : '',
good: isSingleEntry ? '✓ Good' : '',
fair: isSingleEntry ? '⬇️ Fair' : '',
poor: isSingleEntry ? '❌ Poor' : '',
```

## Behavior Flow

### Single-Entry Objectives (multipleEntries = no)
1. **Page loads** → Template rows created with fixed values already visible ✅
2. **Centre selected** → New template rows created with fixed values already visible ✅
3. **SI selected** → Values remain (already present, API weight value also loaded)
4. **Form saved** → Values preserved in database

### Multi-Entry Objectives (multipleEntries = yes)
1. **Page loads** → Template rows created with empty values
2. **Centre selected** → New template rows created with empty values
3. **SI selected** → User enters values manually
4. **Form saved** → Values preserved in database

## Testing Checklist

- [ ] Create new entry for single-entry objective → Fixed values should appear immediately
- [ ] Select centre → Template for single-entry should have values
- [ ] Create new entry for multi-entry objective → Values should remain empty
- [ ] Save and reload → Single-entry shows fixed or saved values
- [ ] Weight Value column displays API weight data correctly
- [ ] Form submission includes all values
