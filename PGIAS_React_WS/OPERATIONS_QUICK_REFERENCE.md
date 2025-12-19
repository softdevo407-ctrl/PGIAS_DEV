# OPERATIONS SIDEBAR QUICK REFERENCE

## 🎯 Quick Start

**Click "Operations" in sidebar → Submenu expands → Choose sub-page**

---

## 📍 The 4 Operations Pages

| Page | Route | Purpose | Status |
|------|-------|---------|--------|
| **Data Entry** | `/operations/data-entry` | Enter operational performance data | ✅ LIVE |
| **Review & Approve** | `/operations/review` | Review & approve submissions | 🟡 READY |
| **Reports** | `/operations/report` | Generate performance reports | 🟡 READY |
| **Approval Queue** | `/operations/approval` | Track approval workflow | 🟡 READY |

---

## 🔄 Form Workflow (Data Entry)

```
START
  ↓
Step 1: Select Master Data
  (FY, Centre, Objective, Action, Success Indicator, Unit)
  ↓
Step 2: Enter Target Values
  (Date, Number, Range, Weight)
  ↓
Step 3: Define Performance Levels
  (Excellent/VeryGood/Good/Fair/Poor ranges)
  ↓
Step 4: Record Achievement
  (Status, Date, Number, %, Document)
  ↓
Step 5: Committee Review
  (Remarks, Recommendations, Points, Status)
  ↓
SUBMIT
  ↓
VIEW SUBMITTED DATA IN TABLE
```

---

## 🎨 Visual State

### Menu Collapsed
```
[📁 Operations]  ← Single button, no submenu visible
```

### Menu Expanded
```
[📁 Operations ▼]
  ├─ 📄 Data Entry
  ├─ 📊 Review & Approve
  ├─ 📈 Reports
  └─ ✅ Approval Queue
```

### Active Selection
```
[📁 Operations ▼]  ← Primary blue (expanded)
  ├─ 📄 Data Entry     ← Primary blue (active)
  ├─ 📊 Review...
  ├─ 📈 Reports
  └─ ✅ Approval...
```

---

## 📋 Master Data Available

### Financial Years
- FY 2024-25
- FY 2023-24
- FY 2022-23

### Centres
- C001 - Mumbai
- C002 - Delhi
- C003 - Bangalore

### Objectives
- OBJ001 - Research Excellence
- OBJ002 - Publication Quality
- OBJ003 - Technology Transfer

### Actions (4 total)
- ACT001 - Research Publication (→ Research Excellence)
- ACT002 - Patent Filing (→ Research Excellence)
- ACT003 - Journal Articles (→ Publication Quality)
- ACT004 - Technology Licensing (→ Tech Transfer)

### Success Indicators (4 total)
- SI001 - Number of Publications (← Research Publication)
- SI002 - Number of Patents (← Patent Filing)
- SI003 - Journal Impact Factor (← Journal Articles)
- SI004 - License Agreements (← Tech Licensing)

### Units
- Number (Count)
- Percentage (%)
- Amount (₹)

---

## 🔗 Cascading Relationships

```
Objective Selected
    ↓
Action dropdown filters by Objective
    ↓
Action Selected
    ↓
Success Indicator dropdown filters by Action
    ↓
All 3 are required to unlock Step 2-5 form sections
```

---

## ✅ Form Requirements

**REQUIRED** (Must have to submit):
- Financial Year ✓
- Centre Code ✓
- Objective Code ✓
- Action Code ✓
- Success Indicator Code ✓
- Unit Code ✓

**OPTIONAL** (Leave blank if not applicable):
- All target value fields
- All criteria ranges
- All achievement fields
- All committee fields

---

## 🚀 Code Locations

```
src/App.jsx:

Line 24-34:     PAGES configuration with Operations submenu
Line 490-491:   operationsOpen state in Sidebar
Line 542-590:   Operations menu rendering in Sidebar
Line 1232-1550: OperationsPage component (full form)
Line 1819-1865: OperationsReview/Report/Approval components
Line 1830-1834: PageRouter routes to components
```

---

## 🔧 Configuration

### Enable for All Users
```javascript
// Current: Available for all users
const pageKeysToShow = user && user.roleCode === 'ADM' 
  ? ['dashboard', 'users', 'operations', 'genericEntry']
  : ['dashboard', 'users', 'operations'];  // ← Operations here
```

### Modify Master Data
Edit lines 1233-1290 in OperationsPage component

### Change Form Fields
Modify `formData` state structure around line 1305

### Customize Validation
Update `handleSubmit` function (line 1352)

---

## 📊 Submitted Data Table

**Shows when you click "View Submissions"**

Columns:
- Financial Year
- Centre
- Objective
- Success Indicator
- Target Value
- Achievement Value
- Achievement %
- Points Earned
- Status (Draft/Submitted/Approved/Rejected)
- Submission Date

---

## 🎮 User Interactions

| Action | Result |
|--------|--------|
| Click "Operations" | Menu expands/collapses |
| Click sub-item | Page loads, button highlights |
| Fill form fields | State updates in real-time |
| Select Objective | Actions dropdown auto-updates |
| Select Action | Success Indicators auto-update |
| Submit form | Data saves, form clears, success message |
| Click "View Submissions" | Toggle to table view |
| Click "Add New Entry" | Toggle back to form |

---

## ⚡ Performance Tips

1. **Master Data**: Currently hardcoded for quick loading
2. **Form State**: All fields in single state object for efficiency
3. **Cascading**: Uses `.filter()` for fast lookups
4. **Rendering**: Components re-render only when state changes
5. **Validation**: Happens on submit, not on every keystroke

---

## 🐛 Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Submenu not appearing | operationsOpen state false | Click Operations button |
| Action dropdown empty | No objective selected | Select objective first |
| Can't submit | Missing required field | Check all 6 master data fields |
| Page doesn't change | activePage state not updating | Check sidebar click handler |
| Styling looks off | Bootstrap CSS not loaded | Verify link in App.jsx line 1943 |

---

## 📱 Responsive Design

```
Desktop (1024px+):      Tablet (768-1023px):   Mobile (<768px):
┌─────┬──────────┐     ┌───┬─────────┐        ┌────────────┐
│ 260 │ Content  │     │80 │ Content │        │☰ + Content│
│ px  │          │     │px │         │        │            │
└─────┴──────────┘     └───┴─────────┘        └────────────┘
Full width            Collapsed width        Drawer navigation
```

---

## 🔐 Security Notes

- Form data stored in React state (session memory)
- No persistence without backend
- No authentication checks in form itself
- User info from AuthContext
- File uploads not yet functional

---

## 📚 Documentation Files Created

1. **OPERATIONS_SIDEBAR_ROUTING.md** - Complete routing guide
2. **OPERATIONS_VISUAL_GUIDE.md** - Visual previews
3. **OPERATIONS_PAGE_TEMPLATE.jsx** - Standalone component template
4. **OPERATIONS_SETUP_SUMMARY.md** - Setup details
5. **This file** - Quick reference

---

**Ready to use!** Click "Operations" in your sidebar now. 🚀
