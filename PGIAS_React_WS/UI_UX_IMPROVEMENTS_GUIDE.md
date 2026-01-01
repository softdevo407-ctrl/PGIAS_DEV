# Improved Data Entry Page - UI/UX Guide

## Overview
The target setting page has been redesigned with a focus on simplicity and beauty while maintaining all required functionality.

---

## Key UI Improvements

### 1. **Financial Year Date Validation**
**What Changed:**
- Date inputs now show a green check mark when within FY range
- Red border and warning message when date is outside FY range
- Browser date picker only allows selecting dates within FY boundaries

**Example:**
```
FY: 2026-2027
Valid Range: 01/04/2026 to 31/03/2027
User selects: 15/05/2025 → ❌ Red border + Warning
User selects: 15/06/2026 → ✅ Green checkmark (valid)
```

### 2. **Date Input Interaction**
**What Changed:**
- Keyboard input completely disabled
- Users must click the date picker to select dates
- This prevents typos and ensures correct date format

**User Experience:**
```
Click on date field → Calendar picker opens → Select date → Closes
(NO typing allowed)
```

### 3. **Single-Entry vs Multi-Entry Objectives**

#### Single-Entry Objectives (multipleEntries = No)
**Display:**
- Action Code: Shows as read-only text (e.g., "001AA000001")
- Success Indicator: Shows as read-only text (e.g., "Quarterly Review")
- Performance Levels: **All start EMPTY** - user must enter values
- Row displays in expanded form automatically on page load

**Example Row:**
```
Action Code: 001AA000001 (read-only)
Success Indicator: Quarterly Review (read-only)
Excellent: [empty] ← User enters value
Very Good: [empty] ← User enters value  
Good: [empty] ← User enters value
Fair: [empty] ← User enters value
Poor: [empty] ← User enters value
```

#### Multi-Entry Objectives (multipleEntries = Yes)
**Display:**
- Action Code: Dropdown with selection options
- Success Indicator: Dropdown with selection options
- Performance Levels: Editable fields
- Add Entry button appears after first save

### 4. **Weight Type Select**

**Improvements:**
- ✅ Removed browser's default dropdown arrow
- ✅ Clean, minimal design
- ✅ Icons for quick visual identification:
  - 📅 Date
  - 📊 % (Percentage)
  - 🔢 Number
- ✅ Disabled state has gray background for clarity
- ✅ Full-width select for better touch targets

**CSS Styling:**
```css
appearance: none;              /* Remove default arrow */
backgroundImage: none;         /* No browser styling */
paddingRight: 0.3rem;         /* Minimal padding */
cursor: pointer;              /* Pointer on enabled */
cursor: not-allowed;          /* Not-allowed on disabled */
backgroundColor: #f8f9fa;     /* Gray on disabled */
border: 1px solid #dee2e6;    /* Clean border */
borderRadius: 3px;            /* Subtle corners */
```

### 5. **Form Field Styling**

**Mandatory Fields:**
- Excellent field has visual emphasis
- Error messages shown in red with custom tooltip
- 3px red top border when field has error

**Optional Fields:**
- Lighter styling
- Same validation logic as mandatory but not required
- Only validated if 2+ fields are entered

**Disabled Fields:**
- Gray background (#e9ecef)
- cursor: not-allowed
- opacity: reduced
- Text shows as read-only when in view mode

### 6. **Error Display & Validation**

**Real-time Validation:**
```
Field: excellent (DATE type, FY 2026-2027)
User enters: 15/05/2025

❌ INVALID:
- Red top border: 3px solid #dc3545
- Background: #fff5f5 (light red)
- Tooltip message: "📅 Date must be within FY 2026-2027 (01/04/2026 to 31/03/2027)"
- Warning text: "⚠️ Date outside FY range"

✅ VALID:
- Normal border: 1px solid #dee2e6
- Background: #fff (white)
- No warning message
```

### 7. **Row State Indicators**

**Unsaved Row (New Entry):**
- Light blue border on left: 4px solid #007bff
- Editable fields enabled
- SAVE button enabled
- Background: #fff (white)

**Saved Row (Frozen):**
- Green border on left: 5px solid #28a745
- All fields show as read-only text
- Background: #f0f8f0 (light green)
- EDIT button enabled
- DELETE button enabled (for multi-entry only)

**Editing Saved Row:**
- Green border maintained
- Fields become editable
- SAVE button shows update state
- Can revert by not saving

### 8. **Action Buttons Layout**

**Button Arrangement (Horizontal):**
```
[ ✅ SAVE ] [ ➕ ADD ENTRY ] [ ✏️ EDIT ] [ 🗑️ DELETE ]
```

**Button States:**
- SAVE: ✅ Green - Enabled when changes made
- ADD ENTRY: 🟢 Highlighted with pulse animation - Only after first save
- EDIT: 🔵 Primary - Enabled for saved rows
- DELETE: 🔴 Danger - Only for multi-entry objectives

### 9. **Objective Expansion/Collapse**

**Behavior:**
- Single-entry objectives (multipleEntries = No) → **Auto-expanded** on load
- Multi-entry objectives (multipleEntries = Yes) → Collapsed initially
- Click header to toggle
- Chevron icon shows state: ▶ (collapsed) or ▼ (expanded)

### 10. **Centre Selection & Dependency**

**Centre Selection Panel:**
```
💼 Centre [SELECT CENTRE...] ← REQUIRED
- Disables entire data entry until selected
- Shows all assigned centres
- Highlights currently selected centre
- All data refreshes when centre changes
```

**Dependent Actions:**
1. User selects centre
2. Page fetches saved targets for that centre
3. Single-entry objectives auto-expand
4. Data entry becomes enabled
5. Success indicators auto-populate

---

## Color Scheme

| Color | Use Case | Example |
|-------|----------|---------|
| 🟢 #28a745 | Success/Saved rows | Green left border, Excellent column background |
| 🔵 #007bff | New rows/Primary action | Blue left border, SAVE button |
| 🟡 #ffc107 | Good/Fair columns | Performance level grouping |
| 🔴 #dc3545 | Error/Danger | Delete button, Error messages |
| ⚫ #495057 | Neutral/Muted | Column headers, Disabled text |
| ⚪ #f8f9fa | Background | Field backgrounds, Light sections |

---

## Performance Level Columns

```
┌─────────────────────────────────────────────────────────────┐
│ 📊 EXCELLENT    📈 VERY GOOD    ✓ GOOD    ↓ FAIR    ✗ POOR │
│ (Green)         (Cyan)           (Yellow)  (Orange)  (Red)  │
│ Mandatory       Optional         Optional  Optional  Optional│
│ (Excellent %)   (Very Good %)   (Good %)  (Fair %)  (Poor %) │
└─────────────────────────────────────────────────────────────┘
```

**For DATE Type:**
- Earlier date = Better performance
- Validation: Excellent < Very Good < Good < Fair < Poor
- All dates must be within FY range

**For NUMBER/PERCENTAGE Type:**
- Higher value = Better performance
- Validation: Excellent > Very Good > Good > Fair > Poor
- Percentage range: 0-100

---

## User Experience Flow

### New Target Entry (Single-Entry Objective)
```
1. Select Centre
   ↓
2. Objective auto-expands
   ↓
3. Action Code shows (read-only)
   ↓
4. Success Indicator shows (read-only)
   ↓
5. Select Weight Type
   ↓
6. Enter Performance Levels (Excellent mandatory, others optional)
   ↓
7. Click SAVE
   ↓
8. Row freezes (becomes read-only)
   ↓
9. Can EDIT or view as saved record
```

### Edit Existing Entry
```
1. Click EDIT button on saved row
   ↓
2. Confirm dialog: "Are you sure you want to edit?"
   ↓
3. Fields become editable
   ↓
4. Make changes
   ↓
5. Click SAVE to update
   ↓
6. Row freezes again
```

### Delete Entry
```
1. Click DELETE button (multi-entry only)
   ↓
2. Confirm dialog: "Are you sure you want to delete?"
   ↓
3. Row removed from table
   ↓
4. Success message shown
```

---

## Responsive Behavior

**Desktop (1024px+):**
- All columns visible
- Full table layout
- Buttons in row
- Inline editing

**Tablet (768px-1024px):**
- Scrollable table
- Same layout, may need horizontal scroll
- Buttons stack if needed

**Mobile (< 768px):**
- Stacked form layout
- Full-width inputs
- Buttons stack vertically
- Collapsible sections

---

## Accessibility Features

✅ **Color + Text Labels**: Not relying on color alone
✅ **ARIA Labels**: Form fields have proper labels
✅ **Keyboard Navigation**: Tab between fields
✅ **Error Messages**: Clear, descriptive text
✅ **Contrast**: WCAG AA compliant colors
✅ **Focus Indicators**: Visible focus rings on inputs
✅ **Date Picker**: Native browser control

---

## Summary

The redesigned page focuses on:
1. **Clarity**: Clear distinction between view and edit modes
2. **Simplicity**: Minimal distractions, focused on data entry
3. **Beauty**: Clean colors, proper spacing, professional appearance
4. **Usability**: Intuitive flows, helpful validation, clear feedback
5. **Accessibility**: WCAG compliant, keyboard navigable
