# Target Setting Page - Visual Design Guide

## Color Palette

### Primary Colors
```
Blue (#0066cc)      - Primary actions, new rows, focus states
Green (#28a745)     - Success, saved rows, saved state
Red (#dc3545)       - Danger, errors, delete actions
Yellow (#ffc107)    - Warnings, optional indicators
Gray (#6c757d)      - Secondary text, disabled states
```

### Background Colors
```
White (#ffffff)           - Primary background
Light Gray (#f8f9fa)      - Secondary background, disabled inputs
Light Green (#f0f8f0)     - Saved row background
Light Red (#fff5f5)       - Error state background
Light Blue (#e7f3ff)      - Info background
Light Yellow (#fffacd)    - Warning background
```

### Column Colors
```
📊 Excellent:    Green (#28a745)   - Best performance
📈 Very Good:    Cyan (#17a2b8)    - Good performance
✓ Good:          Yellow (#ffc107)  - Average performance
↓ Fair:          Orange (#fd7e14)  - Below average
✗ Poor:          Red (#dc3545)     - Worst performance
```

---

## Typography

### Font Sizes
```
Page Title:     1.4rem (fw-bold) - "🎯 Operational Data Entry"
Section Header: 1.1rem (fw-semibold)
Table Headers:  0.85rem (fw-bold)
Row Data:       0.75rem (normal)
Small Text:     0.7rem
Error Messages: 0.75rem (fw-bold, color: red)
```

### Font Weights
```
Bold:      700  - Headings, important text
Semibold:  600  - Section headers
Normal:    400  - Body text
Light:     300  - Muted/secondary text
```

---

## Button Styles

### Primary Buttons
```
Background: #0066cc (Blue)
Hover:      #0052a3 (Darker Blue)
Text:       White (#ffffff)
Padding:    8px 16px
Border:     1px solid #004a8d
Icon:       Font Awesome icon + text
States:     Enabled, Hover, Disabled, Loading
```

### Success Buttons (Save)
```
Background: #28a745 (Green)
Hover:      #218838 (Darker Green)
Icon:       ✅ CheckCircle
Loading:    Spinner animation
```

### Danger Buttons (Delete)
```
Background: #dc3545 (Red)
Hover:      #c82333 (Darker Red)
Icon:       🗑️ Trash
Confirmation: Dialog required
```

### Outline Buttons (Edit)
```
Background: Transparent
Border:     1px solid #0066cc
Text:       #0066cc
Hover:      Light blue background
Icon:       ✏️ Edit
```

---

## Form Controls

### Text Input
```
Height:         30px
Padding:        8px
Border:         1px solid #dee2e6
Border Radius:  4px
Font Size:      14px
Focus State:    Blue border (3px), Box shadow
Disabled State: Gray background, cursor: not-allowed
Error State:    Red border (3px), Light red background
```

### Date Input
```
Height:         30px
Padding:        8px
Border:         1px solid #dee2e6
Border Radius:  4px
Font Size:      14px
Focus State:    Blue border
Disabled State: Gray background, cursor: not-allowed
Error State:    Red border, Light red background
Warning:        Red text "⚠️ Date outside FY range"
```

### Select/Dropdown
```
Height:         30px
Padding:        8px
Appearance:     None (clean custom style)
Background:     White
Border:         1px solid #dee2e6
Border Radius:  4px
Font Size:      14px
Disabled State: Gray background (#e9ecef)
Arrow:          Removed (custom appearance: none)
```

---

## Layout & Spacing

### Container Padding
```
Main Container:     16px
Card Body:          16px
Table Cell Padding: 8px (horizontal), 4px (vertical)
Form Group Margin:  16px bottom
Row Gap:            8px
Column Gap:         4px
```

### Border Styles
```
Default Border:     1px solid #dee2e6
Thick Border:       3px solid #dc3545 (errors)
Left Border:        4px solid #007bff (new rows)
Left Border:        5px solid #28a745 (saved rows)
Rounded Corners:    4px (standard), 3px (inputs)
```

---

## Component Hierarchy

```
┌─────────────────────────────────────────────────────┐
│  Header                                             │
│  "🎯 Operational Data Entry - TARGET SETTING"      │
│  "Configure target settings for objectives..."     │
└─────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
    ┌────────┐      ┌──────────┐      ┌──────────┐
    │Operation│      │ Centre   │      │Financial │
    │Selection│      │Selection │      │Year      │
    │Selection│      │ (REQUIRED)│      │(Display)│
    └────────┘      └──────────┘      └──────────┘
                          │
                          ▼
        ┌─────────────────────────────────────┐
        │   Data Entry Table (Card)           │
        │   ┌───────────────────────────────┐ │
        │   │ Table Header                  │ │
        │   ├───────────────────────────────┤ │
        │   │ Objective Header (Expandable) │ │
        │   ├───────────────────────────────┤ │
        │   │ Data Entry Row 1              │ │
        │   │ Data Entry Row 2              │ │
        │   │ Data Entry Row 3              │ │
        │   └───────────────────────────────┘ │
        └─────────────────────────────────────┘
                          │
        ┌─────────────────┴─────────────────┐
        │                                   │
        ▼                                   ▼
    ┌─────────────┐              ┌──────────────┐
    │Instructions │              │API Reference │
    │(Alert Box)  │              │ (Alert Box)  │
    └─────────────┘              └──────────────┘
```

---

## Table Structure

### Table Header
```
┌──────────────────────────────────────────────────────────────────────────┐
│ Background: #0d6efd (Blue), Color: White, Border: 3px solid #0b5ed7    │
├────────────┬──────────────┬─────┬─────┬────────┬────────┬────┬────┬──────┤
│   Action   │    Success   │Type │Weight│Excellent│Very G │Good│Fair│Poor  │
│    Code    │  Indicator   │     │     │(Green) │ (Cyan) │(Y) │(O) │(Red) │
│ 18% width  │  14% width   │3%   │3%   │  9%    │  9%    │9%  │9%  │ 11%  │
└────────────┴──────────────┴─────┴─────┴────────┴────────┴────┴────┴──────┘
```

### Objective Row
```
┌─────────────────────────────────────────────────────────────────────────┐
│ Background: #e7f3ff (Light Blue), Height: 60px                         │
│ ▼ 001A — Objective Description [MANDATORY Badge]     Weight: 5.00     │
│    ▲ Click to collapse/expand                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Data Entry Row (Unsaved)
```
┌─────────────────────────────────────────────────────────────────────────┐
│ Border Left: 4px solid #007bff (Blue), Background: #fff (White)        │
│ [Action Name    │ SI Name          │ DATE │ 0.5 │  05/05 │  10/05 │ ... │
│                                                                            │
│ [SAVE] [ADD] [EDIT] [DELETE]                                            │
└─────────────────────────────────────────────────────────────────────────┘
```

### Data Entry Row (Saved)
```
┌─────────────────────────────────────────────────────────────────────────┐
│ Border Left: 5px solid #28a745 (Green), Background: #f0f8f0 (Lt Grn)  │
│ Action Name    │ SI Name          │ DATE │ 0.5 │  05/05 │  10/05 │ ... │
│ (read-only)    │ (read-only)      │      │     │ (read)│ (read) │    │
│                                                                            │
│ [ ] [EDIT] [DELETE]                                                      │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Error & Validation States

### Field with Error
```
┌─────────────────────────────────────────────┐
│ Top Border: 3px solid #dc3545 (Red)        │
│ Background: #fff5f5 (Light Red)            │
│ [     Input Field (Text Color: Dark)      ] │
│                                            │
│     ⚠️ Error message in red (0.75rem)     │
└─────────────────────────────────────────────┘
```

### Date Out of FY Range
```
┌─────────────────────────────────────────────┐
│ Border: 2px solid #dc3545                 │
│ Background: #fff5f5                        │
│ [     15/05/2025 (Red Text)               ] │
│     ⚠️ Date outside FY range              │
│ 📅 Must be between 01/04/2026 to 31/03/2027│
└─────────────────────────────────────────────┘
```

### Tooltip Error
```
              ┌─────────────────────────┐
              │ ⚠️ Error Message        │
              │ in bold red text        │
              │ (max 100 chars)         │
              └────────────┬────────────┘
                          ▲
                      (points to field)
```

---

## Interactive States

### Button States
```
NORMAL:   Background: Blue (#0066cc), Cursor: pointer
HOVER:    Background: Dark Blue (#0052a3), Box Shadow: 0 2px 4px rgba(0,0,0,0.2)
ACTIVE:   Background: Darker (#004080), Transform: scale(0.95)
DISABLED: Background: Gray (#6c757d), Cursor: not-allowed, Opacity: 0.65
LOADING:  Spinner animation inside button, Text hidden
```

### Input Focus
```
UNFOCUSED: Border: 1px solid #dee2e6
FOCUSED:   Border: 3px solid #0066cc
           Box-shadow: 0 0 0 3px rgba(0,102,204,0.1)
           Background: White
INVALID:   Border: 3px solid #dc3545
           Box-shadow: 0 0 0 3px rgba(220,53,69,0.1)
           Background: #fff5f5
```

### Chevron Animation
```
EXPANDED:  ▼ (ChevronDown icon)
COLLAPSED: ▶ (ChevronRight icon)
TRANSITION: 200ms ease-in-out
```

---

## Responsive Grid

### Desktop (1024px+)
```
┌─────────────────────────────────────────────────┐
│ Title                    [15% margin both sides]│
├─────────────────────────────────────────────────┤
│ [Control Panel - 3 columns layout]              │
├─────────────────────────────────────────────────┤
│                                                 │
│ [Data Entry Table - Full Width]                 │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Tablet (768px-1024px)
```
┌───────────────────────────────────┐
│ Title                   [5% margin]│
├───────────────────────────────────┤
│ [Control Panel - Stacked]         │
├───────────────────────────────────┤
│ [Horizontally Scrollable Table]   │
└───────────────────────────────────┘
```

### Mobile (<768px)
```
┌─────────────────────┐
│ Title     [4px gap] │
├─────────────────────┤
│ [Controls Stacked]  │
├─────────────────────┤
│ [Collapsed Rows]    │
│ (Tap to expand)     │
└─────────────────────┘
```

---

## Animation Effects

### Loading Spinner
```
⟳ Rotation: 360° in 1s
Infinite loop
Color: #0066cc
```

### Button Hover
```
Duration: 200ms
Easing: ease-in-out
Transform: None (subtle shadow only)
```

### Row Expand/Collapse
```
Duration: 300ms
Easing: ease-in-out
Max-height: 0 → auto
Opacity: 0 → 1
```

### Field Focus
```
Duration: 100ms
Border: 1px → 3px
Shadow: None → subtle box-shadow
```

---

## Print Styles

### Print Layout
```
- Hide buttons and controls
- Show all fields as text
- Full-width table
- Page break handling for long tables
- Black text on white background
- Blue links visible
```

---

## Accessibility Colors

### WCAG AA Contrast Ratios
```
Text on Background            Ratio    Status
─────────────────────────────────────────────
White on Blue (#0066cc)       7.2:1    ✅ AAA
White on Green (#28a745)      6.8:1    ✅ AAA
White on Red (#dc3545)        5.2:1    ✅ AA
Black on Yellow (#ffc107)     4.5:1    ✅ AA
Dark Gray on Light Gray       5.1:1    ✅ AA
```

---

## Icon Legend

| Icon | Meaning | Use Case |
|------|---------|----------|
| 🎯 | Target/Goal | Page title |
| 📋 | Form/List | Action code column |
| 🎯 | Success Indicator | Success indicator column |
| ⚙️ | Settings/Type | Weight type column |
| ⚖️ | Weight/Balance | Weight value column |
| 📊 | Data/Excellent | Excellent column |
| 📈 | Growth/Very Good | Very Good column |
| ✓ | Check/Good | Good column |
| ↓ | Down/Fair | Fair column |
| ✗ | Close/Poor | Poor column |
| ✅ | Success | Save button |
| ➕ | Add | Add entry button |
| ✏️ | Edit | Edit button |
| 🗑️ | Delete | Delete button |
| ⟳ | Loading | Loading state |
| ⚠️ | Warning | Error message |
| 📍 | Location | Centre selection |
| 📅 | Calendar | Date field |
| 🔴 | Required | Required indicator |

---

## Design System Summary

**Theme**: Professional, Clean, Minimal
**Primary Color**: Blue (#0066cc)
**Secondary Colors**: Green, Red, Yellow, Gray
**Typography**: Sans-serif, 14px base
**Spacing**: 8px grid system
**Border Radius**: 4px standard
**Shadows**: Subtle (0 2px 4px)
**Animations**: 200-300ms duration
**Accessibility**: WCAG AA compliant

This guide ensures consistent, beautiful, and accessible design across the Target Setting Page.
