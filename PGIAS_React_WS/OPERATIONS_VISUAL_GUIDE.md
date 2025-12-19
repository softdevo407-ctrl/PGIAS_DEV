# OPERATIONS SIDEBAR - VISUAL PREVIEW

## What You'll See When You Click "Operations"

```
┌─────────────────────────────┐
│         PGIAS               │
├─────────────────────────────┤
│👤 User: John Doe           │
│   john.doe@isro.gov.in      │
│ [Admin] [User]              │
├─────────────────────────────┤
│                             │
│  🏠 Dashboard               │
│  👥 User Management         │
│  📁 Operations ▼            │  ← CLICK TO EXPAND
│    ├─ 📄 Data Entry         │
│    ├─ 📊 Review & Approve   │
│    ├─ 📈 Reports            │
│    └─ ✅ Approval Queue     │
│  ⚙️ Generic Entry           │
│    ├─ Shield Role Mgmt      │
│    ├─ Shield User Role Asg  │
│    └─ ...more items         │
│                             │
│                             │
│                             │
├─────────────────────────────┤
│   [🔓 Logout]               │
└─────────────────────────────┘
```

## Step-by-Step: How to Use Operations Menu

### Step 1: Expand Operations Menu
```
Click on: 📁 Operations
Result:   Submenu appears with 4 options
Icon:     Chevron rotates from ▶ to ▼
```

### Step 2: Click "Data Entry"
```
Click on: 📄 Data Entry
Result:   Opens OperationsPage with full data entry form
```

### Step 3: Fill Out 5-Step Form
```
┌─────────────────────────────────────┐
│ 📋 Step 1: Select Master Data        │ ← Select FY, Centre, Objective, etc.
├─────────────────────────────────────┤
│ 🎯 Step 2: Target Values             │ ← Enter target numbers and ranges
├─────────────────────────────────────┤
│ 📊 Step 3: Target Criteria            │ ← Set performance level ranges
├─────────────────────────────────────┤
│ ✅ Step 4: Achievement Values         │ ← Enter actual achievements
├─────────────────────────────────────┤
│ 👥 Step 5: Committee Review          │ ← Add committee remarks & points
├─────────────────────────────────────┤
│ [Submit Data]  [View Submissions]    │ ← Action buttons
└─────────────────────────────────────┘
```

### Step 4: Toggle Between Form & Table View
```
Form View                          Table View
┌─────────────────┐              ┌──────────────────────┐
│ [Submit] [View] │    Click     │ Submitted Data Table │
│                 │   View  →    │ [FY24] [C001] [✓]    │
│ Data entry form │              │ [FY24] [C002] [✓]    │
│ with 40+ fields │   Click      │ [FY23] [C003] [✗]    │
│                 │   Form   ←   │ [Add New Entry]      │
└─────────────────┘              └──────────────────────┘
```

## Cascading Dropdown Example

```
1️⃣ Select Objective
   ├─ Research Excellence
   ├─ Publication Quality
   └─ Technology Transfer

2️⃣ Select Action (auto-filtered by Objective)
   └─ If "Research Excellence" selected:
      ├─ Research Publication
      └─ Patent Filing

3️⃣ Select Success Indicator (auto-filtered by Action)
   └─ If "Research Publication" selected:
      └─ Number of Publications

4️⃣ All dependent fields automatically update
   └─ Shows: "Number of Publications"
      Description: "Count of published papers"
```

## Form Validation

```
REQUIRED FIELDS (Must be filled):
❌ Cannot submit without these:
   • Financial Year
   • Centre Code
   • Objective Code
   • Action Code
   • Success Indicator Code
   • Unit of Measurement

✅ Optional Fields (Can leave blank):
   • Target Value Date
   • Target Value Number
   • Achievement remarks
   • Committee remarks
   (All other Step 2, 3, 4, 5 fields)

⚠️ On Submit:
   • Validates required fields
   • Creates submission with timestamp
   • Clears form for next entry
   • Shows success message
```

## Different Views Based on Your Role

### If You're an ADM (Admin)
```
Sidebar shows:
└─ Operations ▼
   ├─ Data Entry
   ├─ Review & Approve
   ├─ Reports
   └─ Approval Queue
└─ Generic Entry
   ├─ Role Management
   ├─ User Role Assignment
   └─ ... more admin pages
```

### If You're a Regular USER
```
Sidebar shows:
└─ Operations ▼
   ├─ Data Entry
   ├─ Review & Approve
   ├─ Reports
   └─ Approval Queue
```

## Features You Can Access Right Now

✅ **Working Features**:
- Click Operations to expand/collapse submenu
- Click Data Entry to open operational form
- Fill all 5 steps of the form
- Submit data with validation
- View submitted entries in table
- Switch between form and table views
- Cascading dropdowns (Objective → Action → Indicator)
- Master data with hardcoded sample values

🔄 **In Development**:
- Review & Approve page (shows pending items)
- Reports page (generates summaries)
- Approval Queue (workflow tracking)
- Backend API integration
- Excel import/export
- Edit/Delete submitted entries

## Keyboard Shortcuts (Future Enhancement)
```
Will support:
- Alt+O: Toggle Operations menu
- Alt+D: Go to Data Entry
- Alt+R: Go to Review
- Alt+P: Go to Reports
- Alt+A: Go to Approval Queue
```

## Mobile Responsive Design

```
Desktop (Full Width)           Mobile (Responsive)
┌─────────┬──────────┐        ┌─────────┐
│ Sidebar │ Content  │   →    │☰ Menu   │
│ 260px   │ 100% ~   │        │(Drawer) │
│         │          │        │         │
│         │          │        │Content  │
└─────────┴──────────┘        │(Full)   │
                              └─────────┘
Sidebar collapses to 80px icons on medium screens
```

## Accessibility Features

```
✓ Keyboard Navigation: Tab through menu items
✓ ARIA Labels: Screen readers announce menu items
✓ Color Contrast: Buttons meet WCAG AA standards
✓ Hover States: Clear visual feedback on interactive elements
✓ Focus Indicators: Visible focus on keyboard navigation
✓ Icons + Text: Dual labeling for clarity
```

---

## Ready to Explore?

1. **Start here**: Click "Operations" in the sidebar
2. **Then click**: "Data Entry"
3. **Fill the form**: Complete the 5 steps with sample data
4. **Submit**: Click "Submit Data"
5. **Review**: Click "View Submissions" to see your entry

The complete operational data management system is now accessible from your sidebar! 🚀
