# ✅ OBJECTIVES AUTO-LOAD UPDATE

## 🎯 What Changed

Your **TARGET SETTING** page now **automatically loads all objectives from the API** as separate rows in the table instead of requiring manual selection from a dropdown.

---

## 🔄 New Workflow

### Before (Old Way)
```
1. Click "Add Row" button
2. Select one Objective from dropdown
3. Objective appears as one row
4. Repeat to add more rows
```

### Now (New Way) ✨
```
1. Page loads automatically
2. API fetches ALL objectives: GET http://localhost:8080/api/objectives
3. EVERY objective automatically becomes a row
4. Each row shows: ObjectiveCode, ObjectiveName
5. No more manual "Add Row" needed!
```

---

## 📊 Table Display

### One Row Per Objective

Example: If your API returns 3 objectives:

| Objective Code | Action | SI | Weight | Excellent | Very Good | Good | Fair | Poor | Actions |
|---|---|---|---|---|---|---|---|---|---|
| OBJ001 | [Select] | [Select] | - | [Input] | [Input] | [Input] | [Input] | [Input] | Save |
| OBJ002 | [Select] | [Select] | - | [Input] | [Input] | [Input] | [Input] | [Input] | Save |
| OBJ003 | [Select] | [Select] | - | [Input] | [Input] | [Input] | [Input] | [Input] | Save |

✅ All rows created automatically from API!

---

## 🚀 How It Works

### 1. On Page Load
```javascript
const [objectives, setObjectives] = useState([]);
const [rows, setRows] = useState([]);

// Fetch objectives on mount
useEffect(() => {
  fetchObjectives();
}, []);

// Create rows when objectives load
useEffect(() => {
  if (objectives.length > 0) {
    const newRows = objectives.map(obj => ({
      id: `obj_${obj.code}`,
      objectCode: obj.code,      // From API
      objectName: obj.name || '',  // From API
      actionCode: '',            // User fills this
      // ... other fields
    }));
    setRows(newRows);
  }
}, [objectives]);
```

### 2. API Call
```
GET http://localhost:8080/api/objectives
```

**Expected Response:**
```json
[
  {
    "code": "OBJ001",
    "name": "Research Excellence"
  },
  {
    "code": "OBJ002",
    "name": "Publication Quality"
  },
  {
    "code": "OBJ003",
    "name": "Technology Transfer"
  }
]
```

**Result:** 3 rows instantly created!

---

## 📝 What You Need to Do

### For Each Objective Row:

1. **Objective Code** ✅ (Already filled from API)
   - Display-only, cannot edit
   - Shows code and name

2. **Action Code** (You select)
   - Dropdown auto-populates from: `GET /api/actions/{objectCode}`
   - Select which action to track

3. **Success Indicator** (You select)
   - Dropdown auto-populates from: `GET /api/successindicator/{objectCode}/{actionCode}`
   - Select which indicator to measure

4. **Weight Type** ✅ (Auto from API)
   - Shows: 📅 Date, 📊 %, or 🔢 #
   - Based on: `GET /api/successindicator/getWeight/{objectCode}`

5. **Performance Values** (You enter)
   - Excellent (100%)
   - Very Good (90%)
   - Good (80%)
   - Fair (70%)
   - Poor (60%)

6. **Save** 
   - Click "Save" to submit to backend
   - Row freezes (turns green)
   - POST to: `http://localhost:8081/api/target-setting`

---

## 🎨 Visual Changes

### Before
- Table empty by default
- "Add Row" button visible at top
- Manual row creation required

### Now
- ✅ Table pre-populated with ALL objectives
- ✅ "Add Row" button removed
- ✅ Counter shows: "📊 Target Settings by Objective (3 objectives)"
- ✅ Each objective as a row ready to fill in

---

## 📌 Key Points

| Aspect | Detail |
|--------|--------|
| **Auto-load** | Yes - happens on page load |
| **Objective Selection** | No selection needed - all objectives shown |
| **Row Creation** | Automatic - one row per API objective |
| **Add Row Button** | Removed - not needed anymore |
| **Edit/Delete** | Still available after saving |
| **API Used** | Only `objectiveCode` field from API response |

---

## 🔗 API Integration

### On Page Load Sequence:

```
1. Page mounts
   ↓
2. fetchObjectives()
   GET http://localhost:8080/api/objectives
   ↓
3. Response: Array of objectives with code, name, etc.
   ↓
4. Auto-create rows
   {
     objectCode: "OBJ001",    ← From API
     objectName: "Research Excellence"  ← From API
     actionCode: "",          ← Empty, user selects
     successIndicatorCode: "", ← Empty, user selects
     ...more fields
   }
   ↓
5. For each objective, also auto-fetch:
   - fetchActions(objectCode)
   - fetchWeight(objectCode)
   ↓
6. Table displays ALL objectives ready to edit
```

---

## 💡 Example Scenario

### Your Backend Returns:
```json
[
  { "code": "OBJ001", "name": "Research Excellence" },
  { "code": "OBJ002", "name": "Student Mentoring" },
  { "code": "OBJ003", "name": "Community Service" }
]
```

### Instant Result:
✅ 3 rows appear in table
✅ Each shows: `OBJ001 | Research Excellence`
✅ Each shows: `OBJ002 | Student Mentoring`
✅ Each shows: `OBJ003 | Community Service`
✅ User clicks to select Action for each
✅ User clicks to select SI for each
✅ User fills in performance values
✅ User clicks Save for each row

---

## 🎯 Benefits

✅ **Faster data entry** - No manual row creation
✅ **All objectives visible** - Nothing gets missed
✅ **Consistent structure** - Same format for each objective
✅ **Single action** - One save per objective
✅ **Better UX** - Pre-populated interface
✅ **API-driven** - Objectives always current from backend

---

## ⚙️ Configuration

If you want to adjust:

### Change what's shown from API
Currently using: `objectiveCode` and name
Edit row initialization:
```javascript
const newRows = objectives.map(obj => ({
  // Add more fields from API here
  objectCode: obj.code,
  objectName: obj.name,
  // Could also add:
  // description: obj.description,
  // department: obj.department,
}));
```

### Change how many objectives display
Currently: All from API
Edit:
```javascript
// Show only first 5
const newRows = objectives.slice(0, 5).map(...)

// Filter by department
const newRows = objectives
  .filter(o => o.department === 'Research')
  .map(...)
```

---

## 🧪 Testing

1. ✅ Page loads
2. ✅ Objectives appear as rows (should match your API response count)
3. ✅ Each row shows ObjectiveCode and Name
4. ✅ Click on Action dropdown - auto-populated from API
5. ✅ Select Action - SI dropdown auto-populates
6. ✅ Select SI - values fill in
7. ✅ Fill performance values
8. ✅ Click Save - row freezes and turns green
9. ✅ Check Network tab - POST request sent to backend

---

## 📱 Responsive

✅ Desktop: Full table with all columns
✅ Tablet: Horizontal scroll
✅ Mobile: Responsive table

---

## Summary

**From:** Manual row addition with dropdown selection  
**To:** Automatic API-driven objective loading  

🎉 **Objectives are now auto-loaded! No more "Add Row" needed!**
