# Operations Sidebar Routing Guide

## Overview
The Operations menu has been configured with expandable submenu routing so you can navigate between different operational data management pages.

## Sidebar Navigation Structure

```
PGIAS (Main Menu)
├── Dashboard
├── User Management  
└── Operations ▶ (EXPANDABLE SUBMENU)
    ├── 📄 Data Entry
    ├── 📊 Review & Approve
    ├── 📈 Reports
    └── ✅ Approval Queue
```

## Operations Submenu Routes

### 1. **Data Entry** (`operationsDataEntry`)
- **Route**: `/operations/data-entry`
- **Component**: `OperationsPage`
- **Purpose**: Main data entry form with cascading selects
- **Features**:
  - Master Data Selection (FY, Centre, Objective, Action, Success Indicator, Unit)
  - Target Value Entry
  - Target Criteria (5 performance levels)
  - Achievement Values
  - Committee Review Section
  - Form submission and data persistence
  - View submitted data table

### 2. **Review & Approve** (`operationsReview`)
- **Route**: `/operations/review`
- **Component**: `OperationsReviewPage`
- **Purpose**: Review submitted operational data
- **Features** (To be implemented):
  - Display all submitted operational entries
  - Add committee remarks
  - Approve/Reject entries
  - Track approval status

### 3. **Reports** (`operationsReport`)
- **Route**: `/operations/report`
- **Component**: `OperationsReportPage`
- **Purpose**: Generate and view operational data reports
- **Features** (To be implemented):
  - Generate reports by centre, objective, time period
  - Export to Excel format
  - Performance summary views
  - Trend analysis

### 4. **Approval Queue** (`operationsApproval`)
- **Route**: `/operations/approval`
- **Component**: `OperationsApprovalPage`
- **Purpose**: Track pending approvals and workflow status
- **Features** (To be implemented):
  - View items pending approval
  - Approval workflow status
  - Approval history tracking
  - SLA monitoring

## Implementation Details

### Sidebar Configuration (PAGES Object)
```javascript
operations: { 
  name: 'Operations', 
  icon: FileText, 
  path: '/operations', 
  submenu: ['operationsDataEntry', 'operationsReview', 'operationsReport', 'operationsApproval'] 
}
```

### Submenu Items Definitions
```javascript
operationsDataEntry: { name: 'Data Entry', icon: FileText, path: '/operations/data-entry' },
operationsReview: { name: 'Review & Approve', icon: BarChart, path: '/operations/review' },
operationsReport: { name: 'Reports', icon: FileText, path: '/operations/report' },
operationsApproval: { name: 'Approval Queue', icon: Shield, path: '/operations/approval' },
```

### Page Router Configuration
```javascript
const pages = {
  operations: <OperationsPage />,
  operationsDataEntry: <OperationsPage />,
  operationsReview: <OperationsReviewPage />,
  operationsReport: <OperationsReportPage />,
  operationsApproval: <OperationsApprovalPage />,
};
```

## How to Use

### Expanding the Operations Menu
1. Click on **Operations** in the sidebar to expand submenu
2. A chevron icon (▶) rotates to show expanded state
3. Four sub-items appear below with their respective icons

### Navigating Between Operations Pages
1. Click any sub-item (Data Entry, Review & Approve, Reports, Approval Queue)
2. The corresponding page loads in the main content area
3. Current selection is highlighted with primary (blue) button styling

### Sidebar States
- **Collapsed**: Shows only icons (80px width)
- **Expanded**: Shows full menu with text labels (260px width)
- **Operations Open**: Submenu expanded, showing all 4 sub-items

## Current Status

✅ **Completed**:
- Sidebar infrastructure for Operations submenu
- Page routing configuration
- Navigation state management (operationsOpen state)
- Placeholder components for Review, Reports, and Approval pages
- Full Data Entry page with all Excel fields and cascading selects

🟡 **In Development**:
- Review & Approve page functionality
- Reports generation page
- Approval Queue workflow page

## Data Entry Form Structure

The **Data Entry** page includes 5 steps:

### Step 1: Master Data Selection
- Financial Year (dropdown)
- Centre Code (dropdown)
- Objective Code (dropdown)
- Action Code (cascading dropdown)
- Success Indicator (cascading dropdown)
- Unit of Measurement (dropdown)

### Step 2: Target Values
- Target Value Date
- Target Value Number
- Value in Range? (Y/N)
- Range From/To (conditional)
- Weight Per Unit of Activity

### Step 3: Target Criteria (Performance Levels)
- Excellent (From/To)
- Very Good (From/To)
- Good (From/To)
- Fair (From/To)
- Poor (From/To)

### Step 4: Achievement Values
- Achievement Status (Y/N)
- Achievement Value Date
- Achievement Value Number
- Actual Achievement %
- Supporting Document (file upload)
- Remarks from Centre Unit

### Step 5: Committee Review
- Recommended Achievement Value Date
- Recommended Achievement Value Number
- Recommended Weight Per Unit
- Recommended Achievement %
- Points Earned
- Status (Draft/Submitted/Approved/Rejected)
- Committee Remarks

## Navigation Tips

- **Hotkeys**: Click Operations once to expand, click again to collapse
- **Mobile**: Collapsed sidebar helps save space on smaller screens
- **Quick Access**: Data Entry is the first submenu item for quick access

## Next Steps

To fully utilize the Operations menu:

1. **Backend Integration**: Connect form submissions to Java API
2. **Excel Import**: Load master data from actual Excel files
3. **Review Workflow**: Implement approval process logic
4. **Report Generation**: Add Excel export and advanced filtering
5. **Dashboard Widgets**: Add operational stats to main dashboard

---
**Note**: All routing is functional and ready for component enhancement. The pages will render when selected from the sidebar.
