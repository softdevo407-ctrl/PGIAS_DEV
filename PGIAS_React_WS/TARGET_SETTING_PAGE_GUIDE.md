# 🎯 TARGET SETTING PAGE - Backend Integration Complete

## ✅ NEWLY IMPLEMENTED PAGE

Your **Operational Data Entry - TARGET SETTING** page has been completely rebuilt with:
- ✅ Backend API integration (5 endpoints)
- ✅ Table-based data entry
- ✅ Row-by-row save & freeze functionality
- ✅ Cascading dropdown filtering
- ✅ Dynamic input types based on weight type
- ✅ Full API connectivity

---

## 📍 File Location

**New Component File**: `src/pages/OperationsTargetSettingPage.jsx`
**Integrated Into**: `src/App.jsx` (PageRouter updated)

---

## 🔗 Backend API Endpoints

The page uses **5 API endpoints** for full backend integration:

### 1. **Get All Objectives**
```
GET http://localhost:8080/api/objectives
Response: Array of objectives with code, name, description
```

### 2. **Get Actions by Objective**
```
GET http://localhost:8081/api/actions/{objectcode}
Parameters: objectcode (required)
Response: Array of actions for that objective
```

### 3. **Get Success Indicators**
```
GET http://localhost:8081/api/successindicator/{objectcode}/{actioncode}
Parameters: objectcode, actioncode (required)
Response: Array of success indicators for that objective+action combo
```

### 4. **Get Weight Type**
```
GET http://localhost:8081/api/successindicator/getWeight/{objectcode}
Parameters: objectcode (required)
Response: Weight object with type (DATE/NUMBER/PERCENTAGE)
```

### 5. **Save Target Setting**
```
POST http://localhost:8081/api/target-setting
Body: {
  financialYear: "FY2024-25",
  objectCode: "OBJ001",
  actionCode: "ACT001",
  successIndicatorCode: "SI001",
  weightInfo: { type: "NUMBER" },
  excellent: "100",
  veryGood: "90",
  good: "80",
  fair: "70",
  poor: "60",
  status: "SAVED"
}
Response: Saved row object with ID
```

---

## 📊 Table Structure

The data entry table has these columns:

| Column | Type | Input | Source | Behavior |
|--------|------|-------|--------|----------|
| **Objective Code** | Dropdown | Select | API #1 | When changed, fetches Actions & Weight |
| **Action Code** | Dropdown | Select | API #2 | When changed, fetches Success Indicators |
| **Success Indicator** | Dropdown | Select | API #3 | Display-only once selected |
| **Weight Type** | Badge | Display | API #4 | Shows 📅 Date, 📊 %, or 🔢 # |
| **Excellent (100%)** | Input | Dynamic | User | Type changes based on Weight Type |
| **Very Good (90%)** | Input | Dynamic | User | Type changes based on Weight Type |
| **Good (80%)** | Input | Dynamic | User | Type changes based on Weight Type |
| **Fair (70%)** | Input | Dynamic | User | Type changes based on Weight Type |
| **Poor (60%)** | Input | Dynamic | User | Type changes based on Weight Type |
| **Actions** | Buttons | Save/Edit/Delete | UI | Save freezes row, Edit unfreezes |

---

## 🎯 How It Works

### Step 1: Add a New Row
```
User clicks: "Add Row" button
Result: New empty row appears at bottom of table
Row State: isEditing=true (editable mode)
```

### Step 2: Select Objective
```
User selects: Objective Code from dropdown
Triggers:
  1. Action dropdown auto-populated (API #2)
  2. Weight type loaded (API #4)
Row updates: objectCode, objectName set
```

### Step 3: Select Action
```
User selects: Action Code from dropdown
Triggers:
  1. Success Indicator dropdown auto-populated (API #3)
Row updates: actionCode, actionName set
```

### Step 4: Select Success Indicator
```
User selects: Success Indicator from dropdown
Row updates: successIndicatorCode, siName, siDescription set
```

### Step 5: Fill Performance Level Values
```
User enters: Values in Excellent/VeryGood/Good/Fair/Poor columns
Input type automatically adjusts based on Weight Type:
  - If Weight Type = "DATE": Shows date picker (📅)
  - If Weight Type = "PERCENTAGE": Shows number input 0-100 (📊 %)
  - If Weight Type = "NUMBER": Shows number input (🔢)
```

### Step 6: Save Row
```
User clicks: "Save" button
Validation:
  - Check: Objective Code selected ✓
  - Check: Action Code selected ✓
  - Check: Success Indicator selected ✓
If valid:
  1. POST to API #5 (Save backend)
  2. Freeze row (isEditing=false, isSaved=true)
  3. Show success message
  4. Row becomes read-only (highlighted in green)
  5. Buttons change to "Edit" & "Delete"
```

### Step 7: Edit or Delete
```
If Saved:
  - User clicks "Edit" → Row becomes editable again
  - User clicks "Delete" → Row removed from table
```

---

## 🔄 State Management

### Row Object Structure
```javascript
{
  id: 1733968750000,              // Unique timestamp
  objectCode: "OBJ001",           // Selected objective code
  actionCode: "ACT001",           // Selected action code
  successIndicatorCode: "SI001",  // Selected indicator code
  weightInfo: {                   // From API
    type: "NUMBER"
  },
  excellent: "100",              // User input
  veryGood: "90",                // User input
  good: "80",                    // User input
  fair: "70",                    // User input
  poor: "60",                    // User input
  isEditing: false,              // Editing mode flag
  isSaved: true,                 // Saved to backend flag
  objectName: "Research Excellence",      // From API
  actionName: "Research Publication",     // From API
  siName: "Number of Publications",       // From API
  siDescription: "Count of published..."  // From API
}
```

### Page-Level State
```javascript
const [operation, setOperation] = useState('TARGET_SETTING');
const [selectedFY, setSelectedFY] = useState('FY2024-25');
const [objectives, setObjectives] = useState([]);        // API #1
const [actions, setActions] = useState({});              // API #2
const [successIndicators, setSuccessIndicators] = useState({}); // API #3
const [weights, setWeights] = useState({});              // API #4
const [rows, setRows] = useState([]);                    // Table rows
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
```

---

## 💻 Key Functions

### `addNewRow()`
Creates new row with default empty values and enters edit mode

### `handleObjectiveChange(rowId, objectCode)`
- Updates row with selected objective
- Calls `fetchActions(objectCode)`
- Calls `fetchWeight(objectCode)`

### `handleActionChange(rowId, objectCode, actionCode)`
- Updates row with selected action
- Calls `fetchSuccessIndicators(objectCode, actionCode)`

### `handleSIChange(rowId, objectCode, actionCode, siCode)`
- Updates row with selected success indicator
- Sets siName and siDescription

### `handleFieldChange(rowId, field, value)`
- Updates excellent/veryGood/good/fair/poor values

### `saveRow(row)`
- Validates required selections
- Calls `saveRowToBackend(row)`
- Freezes row if successful

### `editRow(rowId)`
- Toggles isEditing to true

### `deleteRow(rowId)`
- Removes row from array

### `renderWeightInput(row, field)`
- Returns appropriate input type based on weight type
- Shows date picker for DATE type
- Shows 0-100 input for PERCENTAGE type
- Shows regular number input for NUMBER type

---

## 🎨 UI Features

### Operation Selection
- Two radio buttons: "TARGET SETTING" (enabled) and "TARGET ACHIEVED" (disabled)
- TARGET ACHIEVED coming in next phase

### Financial Year Selection
- Dropdown shows only **current year** for TARGET SETTING
- When TARGET ACHIEVED implemented, will show current + previous years

### Row Visual States
- **Editing** (Yellow): Row with input fields, "Save" button visible
- **Saved** (Green): Row highlighted, "Edit" & "Delete" buttons visible

### Weight Type Badge
- 📅 **Date** - When weight type is DATE
- 📊 **%** - When weight type is PERCENTAGE
- 🔢 **#** - When weight type is NUMBER

### Instructions & API Reference
- Built-in "How to Use" guide
- API endpoints reference
- Row status legend

---

## 🚀 How to Use It

### Quick Start
1. **Click Operations** in sidebar
2. **Click Data Entry** (or it opens by default)
3. **Click "Add Row"** button
4. **Fill the form**:
   - Select Objective Code
   - Select Action Code
   - Select Success Indicator
   - Fill Excellent, Very Good, Good, Fair, Poor values
5. **Click "Save"** to save to backend
6. **Row freezes** (becomes read-only, highlighted green)
7. **Click "Add Row"** again to add more objectives
8. **Click "Edit"** to modify a saved row
9. **Click "Delete"** to remove a row

### Example Workflow
```
1. Click "Add Row"
   ↓ (New empty row appears)
2. Select Objective: "Research Excellence"
   ↓ (Actions auto-populate for this objective)
3. Select Action: "Research Publication"
   ↓ (Success Indicators auto-populate)
4. Select SI: "Number of Publications"
   ↓ (Weight type loads: NUMBER)
5. Enter values:
   - Excellent: 100
   - Very Good: 90
   - Good: 80
   - Fair: 70
   - Poor: 60
6. Click "Save"
   ↓ (Saved to backend, row freezes in green)
7. Click "Add Row" again for next objective
```

---

## 🔄 API Call Sequence

```
1. Page loads
   → fetchObjectives() → Populate objective dropdown

2. User selects Objective
   → fetchActions(objectCode) → Populate action dropdown
   → fetchWeight(objectCode) → Get weight type

3. User selects Action
   → fetchSuccessIndicators(objectCode, actionCode)
     → Populate success indicator dropdown

4. User selects Success Indicator
   → Set indicator name & description

5. User fills values & clicks Save
   → Validate selections
   → saveRowToBackend(row) POST request
   → If success: Freeze row
```

---

## ✨ Smart Features

### 1. **Cascading Dropdowns**
- Objective → Action → Success Indicator
- Each level depends on previous selection
- Dropdowns disabled until parent is selected

### 2. **Dynamic Input Types**
- Input type auto-adjusts based on weight type from API
- No need to manually select input type
- Consistent with backend data

### 3. **Row State Management**
- Each row tracks its own editing state
- Can edit one row while others are saved
- Visual feedback (color coding) shows row status

### 4. **Auto-population**
- As users select, relevant data populates from APIs
- No need to type code/name pairs
- Reduces errors

### 5. **Lazy Loading**
- APIs called only when needed
- Actions loaded only when objective selected
- Indicators loaded only when action selected

---

## 🔒 Backend Integration

### What Happens When Saving
```javascript
{
  method: 'POST',
  url: 'http://localhost:8081/api/target-setting',
  headers: { 'Content-Type': 'application/json' },
  body: {
    financialYear: selectedFY,     // "FY2024-25"
    objectCode: row.objectCode,    // "OBJ001"
    actionCode: row.actionCode,    // "ACT001"
    successIndicatorCode: row.successIndicatorCode,  // "SI001"
    weightInfo: row.weightInfo,    // { type: "NUMBER" }
    excellent: row.excellent,      // "100"
    veryGood: row.veryGood,        // "90"
    good: row.good,                // "80"
    fair: row.fair,                // "70"
    poor: row.poor,                // "60"
    status: 'SAVED'
  }
}
```

### Error Handling
- Network errors caught and displayed in alert
- API errors logged to console
- User-friendly error messages shown
- Loading spinner during API calls

---

## 📱 Responsive Design

- ✅ Desktop: Full table with all columns visible
- ✅ Tablet: Horizontal scroll for overflow
- ✅ Mobile: Responsive table with collapse options

---

## 🎯 Next Phase: TARGET ACHIEVED

When implemented, TARGET ACHIEVED page will:
- Allow current year AND previous year selection
- Load existing target settings as base
- Show actual achieved values
- Track achievement percentage
- Compare target vs actual

---

## 🔍 Testing Checklist

- [ ] Verify page loads without errors
- [ ] Click "Add Row" - new row appears
- [ ] Select Objective - Actions dropdown populates
- [ ] Select Action - Success Indicators populate
- [ ] Select SI - Weight type displays
- [ ] Fill values in all 5 columns
- [ ] Click Save - row freezes (turns green)
- [ ] Click Edit - row becomes editable again
- [ ] Click Delete - row removed
- [ ] Check browser console for no errors
- [ ] Check Network tab in DevTools for API calls
- [ ] Verify POST request to target-setting endpoint
- [ ] Add multiple rows and save all
- [ ] Check backend database for saved data

---

## 📊 Performance

- Lazy loading of APIs (called on demand)
- Efficient state updates
- No unnecessary re-renders
- Smooth dropdown cascading
- Fast row save/freeze operations

---

## 🚀 Summary

Your **TARGET SETTING** page is now **fully backend-integrated** with:
✅ 5 API endpoints connected
✅ Table-based data entry
✅ Dynamic cascading dropdowns
✅ Row-level save & freeze
✅ Weight-type aware input fields
✅ Error handling & loading states
✅ User-friendly interface

**Ready to use!** Start adding target settings rows. 🎉

---

## 📞 File Structure

```
src/
├── pages/
│   └── OperationsTargetSettingPage.jsx  ← New component
├── App.jsx (updated with import & router)
```

All API endpoints are in the component and ready to connect to your backend.
