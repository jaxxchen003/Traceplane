# Traceplane Design System

> A work control plane for enterprise agents. Clean, precise, agile.

---

## 1. Visual Theme & Atmosphere

### Design Philosophy
- **Precision over decoration**: Every element serves a function
- **Density with clarity**: Information-rich but never cluttered
- **Agile-native**: Data presentation follows project management conventions
- **Dark-first**: Deep backgrounds reduce eye strain during long sessions
- **Semantic color**: Status colors mean something, not just decoration

### Mood & Density
- **High information density** with generous breathing room between sections
- **Monospace accents** for technical data (IDs, timestamps, code)
- **Sharp corners** (0-2px radius max) - avoid "friendly" rounded UI tropes
- **Border-based separation** over shadow-based elevation

---

## 2. Color Palette & Roles

### Core Surfaces
| Token | Hex | Usage |
|-------|-----|-------|
| `surface-0` | `#0a0a0a` | Deepest background (viewport) |
| `surface-1` | `#111111` | Primary cards, panels |
| `surface-2` | `#1a1a1a` | Secondary cards, inputs |
| `surface-3` | `#222222` | Borders, dividers, hover states |
| `surface-4` | `#2a2a2a` | Active states, focus rings |

### Semantic Colors
| Token | Hex | Role |
|-------|-----|------|
| `text-primary` | `#ffffff` | Headlines, primary content (95% opacity) |
| `text-secondary` | `#a0a0a0` | Body text, descriptions (60% opacity) |
| `text-tertiary` | `#666666` | Timestamps, metadata (40% opacity) |
| `text-muted` | `#444444` | Disabled, placeholder (25% opacity) |

### Status Colors (Semantic meaning)
| Status | Hex | Usage |
|--------|-----|-------|
| `status-planned` | `#6b7280` | Gray - Not started |
| `status-active` | `#3b82f6` | Blue - In progress, healthy |
| `status-paused` | `#f59e0b` | Amber - Blocked, needs attention |
| `status-done` | `#10b981` | Emerald - Completed successfully |
| `status-failed` | `#ef4444` | Red - Failed, error state |

### Accent Color
| Token | Hex | Usage |
|-------|-----|-------|
| `accent` | `#6366f1` | Primary actions, links, highlights |
| `accent-hover` | `#818cf8` | Hover state for accent elements |
| `accent-subtle` | `rgba(99, 102, 241, 0.1)` | Subtle accent backgrounds |

---

## 3. Typography Rules

### Font Stack
```css
--font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
--font-mono: "SF Mono", Monaco, "Cascadia Code", "Courier New", monospace;
--font-display: "SF Pro Display", -apple-system, sans-serif; /* For large headlines */
```

### Type Scale
| Level | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `display` | 32px | 600 | 1.2 | Page titles, hero headlines |
| `title-1` | 24px | 600 | 1.3 | Section headers |
| `title-2` | 18px | 600 | 1.4 | Card titles, panel headers |
| `title-3` | 14px | 600 | 1.4 | Subsection headers |
| `body` | 14px | 400 | 1.6 | Primary text, descriptions |
| `body-sm` | 13px | 400 | 1.5 | Secondary content |
| `caption` | 12px | 400 | 1.4 | Metadata, timestamps |
| `label` | 11px | 500 | 1.2 | Uppercase labels, tags (letter-spacing: 0.05em) |
| `mono` | 13px | 400 | 1.5 | IDs, timestamps, code (font-family: var(--font-mono)) |

### Typography Patterns
- **Uppercase + letter-spacing** for section labels ("EPISODE DETAIL", "TIMELINE")
- **Monospace** for technical identifiers (episode IDs, trace IDs)
- **Tabular numbers** (`font-variant-numeric: tabular-nums`) for counts and timestamps

---

## 4. Component Stylings

### Cards
```css
/* Primary Card - for main content areas */
.card {
  background: var(--surface-1);
  border: 1px solid var(--surface-3);
  border-radius: 4px; /* Sharp, not rounded */
  padding: 20px;
}

/* Secondary Card - for nested content */
.card-secondary {
  background: var(--surface-2);
  border: 1px solid var(--surface-3);
  border-radius: 2px;
  padding: 16px;
}

/* Hover state */
.card:hover {
  border-color: var(--surface-4);
}
```

### Status Badges
```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 2px;
  font-size: 12px;
  font-weight: 500;
}

/* Status variants use 10% opacity background + solid text */
.badge-active {
  background: rgba(59, 130, 246, 0.1);
  color: #60a5fa;
}

.badge-done {
  background: rgba(16, 185, 129, 0.1);
  color: #34d399;
}

.badge-paused {
  background: rgba(245, 158, 11, 0.1);
  color: #fbbf24;
}
```

### Buttons
```css
/* Primary Button */
.btn-primary {
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
}

.btn-primary:hover {
  background: var(--accent-hover);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--surface-3);
  border-radius: 4px;
  padding: 10px 16px;
}

.btn-secondary:hover {
  border-color: var(--surface-4);
  color: var(--text-primary);
}

/* Ghost Button */
.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  border: none;
  padding: 8px 12px;
}

.btn-ghost:hover {
  color: var(--text-primary);
  background: var(--surface-2);
}
```

### Timeline / Trace List
```css
/* Timeline container */
.timeline {
  position: relative;
  padding-left: 24px;
}

/* Vertical line */
.timeline::before {
  content: '';
  position: absolute;
  left: 7px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--surface-3);
}

/* Timeline item */
.timeline-item {
  position: relative;
  padding: 16px 0;
}

/* Timeline dot */
.timeline-item::before {
  content: '';
  position: absolute;
  left: -20px;
  top: 20px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--surface-3);
  border: 2px solid var(--surface-1);
}

/* Active dot */
.timeline-item.active::before {
  background: var(--accent);
}
```

### Data Table / List
```css
/* Clean list without zebra striping */
.list-row {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--surface-3);
}

.list-row:last-child {
  border-bottom: none;
}

.list-row:hover {
  background: var(--surface-2);
}

/* Selection state */
.list-row.selected {
  background: var(--accent-subtle);
  border-left: 2px solid var(--accent);
}
```

---

## 5. Layout Principles

### Spacing Scale (4px base)
| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Tight gaps, icon padding |
| `space-2` | 8px | Inline element gaps |
| `space-3` | 12px | Compact padding |
| `space-4` | 16px | Standard padding |
| `space-5` | 20px | Card padding |
| `space-6` | 24px | Section gaps |
| `space-8` | 32px | Major section spacing |
| `space-10` | 40px | Page-level spacing |

### Grid System
- **12-column grid** for dashboards
- **Sidebar + Main** layout for detail views
- **Card grid**: 1 column mobile, 2 tablet, 3-4 desktop

### Layout Patterns

#### Dashboard Layout
```
┌─────────────────────────────────────────┐
│ HEADER                                  │
├──────────┬──────────────────────────────┤
│ SIDEBAR  │ MAIN CONTENT                 │
│          │  ┌────────┬────────┐         │
│          │  │ CARD   │ CARD   │         │
│          │  └────────┴────────┘         │
│          │  ┌──────────────────┐          │
│          │  │ PANEL            │          │
│          │  └──────────────────┘          │
└──────────┴──────────────────────────────┘
```

#### Episode Detail Layout
```
┌────────────────────────────────────────────┐
│ EPISODE HEADER                             │
│ Title · Status Badge · Meta                │
├───────────────┬────────────────────────────┤
│ TIMELINE      │ INSPECTOR PANEL            │
│ (40% width)   │ (60% width)                │
│               │                            │
│ • Step 1      │ State Snapshot             │
│ • Step 2      │ Diff View                  │
│ • Step 3      │ Actions                    │
└───────────────┴────────────────────────────┘
```

### Agile Data Presentation Patterns

#### Kanban-style Status Columns
- Three-column layout: To Do | In Progress | Done
- Cards draggable between columns
- Each column shows count badge
- Color-coded column headers

#### Sprint Timeline View
- Horizontal timeline with sprint dates
- Episode cards positioned by start/end dates
- Progress bar showing completion %
- Milestone markers

#### Burndown / Metrics Mini-charts
- Sparkline charts in card headers
- Simple bar charts for counts
- No complex chart libraries - use CSS/SVG

---

## 6. Depth & Elevation

### NO Shadow System
- **Avoid box-shadows** entirely
- Use **borders** and **background color changes** for depth
- Single exception: subtle inset shadow on focused inputs

### Elevation Hierarchy
| Level | Technique |
|-------|-----------|
| `level-0` | Base surface color |
| `level-1` | Lighter background + border |
| `level-2` | Same background, brighter border |
| `level-3` | Hover: slight background lighten |

### Focus States
```css
/* Clear focus rings */
:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

/* Input focus */
input:focus {
  border-color: var(--accent);
  box-shadow: inset 0 0 0 1px var(--accent); /* Subtle inset only */
}
```

---

## 7. Do's and Don'ts

### ✅ Do
- Use **tabular numbers** for timestamps and counts
- **Truncate** long text with ellipsis, don't wrap
- Show **relative time** ("2 hours ago") with full timestamp on hover
- Use **icon + text** combinations for clarity
- Maintain **consistent alignment** within columns
- Use **monospace** for IDs and technical data
- **Group related actions** in dropdown menus

### ❌ Don't
- Don't use rounded corners > 4px (avoid "friendly" aesthetic)
- Don't use gradient backgrounds (avoid "AI slop" look)
- Don't use shadows for elevation (use borders)
- Don't use emojis as icons (use SVG icons)
- Don't center-align text in data tables
- Don't use more than 2 font weights per screen
- Don't add decorative elements that don't serve a function

---

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Behavior |
|------|-------|----------|
| Mobile | < 640px | Single column, stacked layout |
| Tablet | 640-1024px | 2-column grids |
| Desktop | > 1024px | Full layout |

### Touch Targets
- Minimum 44px touch targets
- Increase spacing between interactive elements on mobile

### Responsive Patterns
- **Sidebar**: Collapse to hamburger menu on mobile
- **Timeline**: Stack vertically on mobile
- **Cards**: Single column on mobile, grid on desktop
- **Tables**: Horizontal scroll or card conversion on mobile

---

## 9. Agent Prompt Guide

### Quick Color Reference
```
Background: #0a0a0a -> #111111 -> #1a1a1a
Text: #ffffff (95%) -> #a0a0a0 (60%) -> #666666 (40%)
Accent: #6366f1
Status: Gray (#6b7280) -> Blue (#3b82f6) -> Amber (#f59e0b) -> Emerald (#10b981) -> Red (#ef4444)
```

### Tailwind Config Reference
```javascript
// tailwind.config.js colors extension
colors: {
  surface: {
    0: '#0a0a0a',
    1: '#111111',
    2: '#1a1a1a',
    3: '#222222',
    4: '#2a2a2a',
  },
  accent: {
    DEFAULT: '#6366f1',
    hover: '#818cf8',
  },
  status: {
    planned: '#6b7280',
    active: '#3b82f6',
    paused: '#f59e0b',
    done: '#10b981',
    failed: '#ef4444',
  }
}
```

### Component Prompts
- "Create a timeline component with vertical line and dots"
- "Status badge with 10% opacity background and solid text color"
- "Sharp-cornered cards with 1px borders"
- "Data table with monospace for IDs, hover states on rows"
- "Kanban board with three columns and draggable cards"

---

## 10. Traceplane-Specific Patterns

### Episode Card
```
┌────────────────────────────────────────────┐
│ [Badge: Active]  Episode Title              │
│ Agent Name · 3 artifacts · 12 traces        │
│                                             │
│ ┌────────────────────────────────────┐   │
│ │ Progress bar showing completion    │   │
│ └────────────────────────────────────┘   │
│                                             │
│ Started: 2 hours ago              [Open →] │
└────────────────────────────────────────────┘
```

### Trace Timeline Item
```
  ●  Step 3: Tool Execution
     │  Actor: Claude-Code
     │  Duration: 1.2s
     │  [View Details →]
```

### Agent Handoff Panel
```
┌────────────────────────────────────────────┐
│ HANDOFF BRIEF                              │
│                                            │
│ Latest: Generated customer report         │
│ Status: Ready to continue                 │
│                                            │
│ [Copy Brief]  [Continue →]                │
└────────────────────────────────────────────┘
```

---

## Design Principles Summary

1. **Dark first, borders over shadows**
2. **Sharp corners, clear hierarchy**
3. **Semantic colors mean something**
4. **Monospace for tech, sans-serif for UI**
5. **Agile-native data presentation**
6. **No decoration without function**

---

*This design system is optimized for agent work control plane interfaces. Clean, precise, functional.*
