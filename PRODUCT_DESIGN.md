# Traceplane Product Design Document

## Product Understanding

### What is Traceplane?
A **work control plane** for enterprise multi-agent systems.

### Core Concepts
```
Workspace → Project → Episode → Trace → Artifact
                     ↓
                Memory (context)
                     ↓
                Policy (governance)
                     ↓
                Audit (compliance)
```

### User Personas
1. **Manager/Operator** - 监控多个 Agent 协作，关心：
   - 哪些 Episode 可以继续？
   - 哪些 Agent 在工作？
   - 是否合规？是否有风险？
   - 如何从当前状态继续推进？

2. **Agent Developer** - 调试和优化 Agent 行为

### Key User Flow
1. 进入 Project → 看到所有 Episode
2. 快速识别：**哪个 Episode 可以继续？**
3. 查看 Episode → 看到 Timeline (执行历史)
4. 在某一步 Fork → 创建新的实验分支
5. 比较不同分支的结果

---

## Information Architecture

### Project Page Structure

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER (Project Level)                                      │
│ Project Name · Status · Last Activity · Quick Actions       │
├─────────────────────────────────────────────────────────────┤
│ METRICS GRID (Health Overview)                              │
│ Episodes | Active | Completed | Agents | Artifacts | Time  │
├─────────────────────────────────────────────────────────────┤
│ MAIN CONTENT                                                │
│ ┌──────────────────────────────┬──────────────────────────┐ │
│ │ EPISODE LIST                 │ SIDEBAR                  │ │
│ │ (Most Important - 60%)       │ (Secondary Info - 40%)   │ │
│ │                              │                          │ │
│ │ ▶ Active Episodes            │ • Project Info           │ │
│ │ ▶ Ready to Continue          │ • Participating Agents   │ │
│ │ ▶ Recent Completed           │ • Policy Version         │ │
│ │ ▶ Blocked/Failed             │ • Audit Summary            │ │
│ │                              │                          │ │
│ │ [Table/List View]            │ [Quick Actions Panel]      │ │
│ └──────────────────────────────┴──────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Episode Detail Structure

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER (Episode Level)                                      │
│ Episode Title · Status · Duration · Fork Count               │
├─────────────────────────────────────────────────────────────┤
│ METRICS BAR (Snapshot)                                      │
│ Steps | Artifacts | Memory Items | Policy Hits              │
├─────────────────────────────────────────────────────────────┤
│ MAIN CONTENT                                                │
│ ┌──────────────────────────────┬──────────────────────────┐ │
│ │ TIMELINE                     │ INSPECTOR PANEL          │ │
│ │ (Most Important - 55%)       │ (State & Diff - 45%)     │ │
│ │                              │                          │ │
│ │ Step 1: Initialize           │ • State Snapshot         │ │
│ │ Step 2: Fetch Data           │ • State Diff             │ │
│ │ Step 3: Generate Report     │ • Fork from Here         │ │
│ │                              │                          │ │
│ │ [Trace Details]              │ [Fork Input]             │ │
│ └──────────────────────────────┴──────────────────────────┘ │
│                                                             │
│ HANDBOFF PANEL (Continue Episode)                           │
│ • Latest Step · Next Action · Agent Continuation Packet     │
└─────────────────────────────────────────────────────────────┘
```

---

## Visual Design Principles

### 1. Color System (Applied)
- **void-950** (#030303) - Deepest background
- **void-900** (#0a0a0a) - Primary background  
- **void-800** (#111111) - Card background
- **void-700** (#1a1a1a) - Hover states
- **void-600** (#222222) - Borders
- **ink** (#fafafa) - Primary text
- **ink-muted** (#a1a1aa) - Secondary text
- **ink-faint** (#71717a) - Metadata
- **accent** (#6366f1) - Primary actions
- **signal-info** (#3b82f6) - Active/Running
- **signal-success** (#22c55e) - Done/Complete
- **signal-warning** (#f59e0b) - Paused/Warning
- **signal-error** (#ef4444) - Failed/Error

### 2. Typography
- **Font**: Inter (sans-serif), JetBrains Mono (code)
- **Headings**: 24-32px, semibold, tight tracking
- **Body**: 14px, regular
- **Labels**: 11-12px, uppercase, wide tracking (0.05em)
- **Mono**: IDs, timestamps, durations

### 3. Spacing & Layout
- **Container**: max-w-[1600px], centered
- **Padding**: 24px (page), 16-20px (cards)
- **Gap**: 16-24px between sections
- **Border radius**: 4px (sharp, professional)
- **Borders**: 1px solid void-600

### 4. Component Patterns

#### Status Badge
```
[● Active] - Blue dot + pulse animation
[● Done] - Green dot
[● Paused] - Amber dot
[● Failed] - Red dot
```

#### Episode Row
```
┌─────────────────────────────────────────────────────────────┐
│ ●  [Title]                    [Status]  [Duration]  [Time]   │
│    [Description snippet...]    [Agent]  [Artifacts]         │
└─────────────────────────────────────────────────────────────┘
Hover: bg-void-700 border-accent
Click: Open Episode Detail
```

#### Metric Card
```
┌─────────────────┐
│ LABEL           │
│                 │
│ Value           │
│ ↑ +3 this week  │
└─────────────────┘
```

#### Timeline Item
```
  ●────●────●
     │
  Step N: [Title]
  [Duration] · [Result]
  [Expand for details]
```

---

## Key Design Decisions

### 1. Remove Graph Theater (Current 3D Visualization)
**Why**: 
- 过于花哨，信息密度低
- 管理者无法快速获取关键信息
- 与 Playground 风格不符

**Replace with**: Data table + Metrics cards

### 2. Episode-First Navigation
**Current**: Sidebar has Dashboard, Projects, Connect, Audit
**Proposed**: Sidebar focuses on "Work Items" (Episodes by status)

### 3. Status-Based Grouping
Group Episodes by:
1. **Active Now** (running, need attention)
2. **Ready to Continue** (paused, can resume)
3. **Recently Completed** (done, for reference)
4. **Blocked** (failed, needs investigation)

### 4. Quick Actions Prominent
Place "New Episode" button in:
- Project header (primary CTA)
- Episode list empty state
- Global nav

### 5. Fork Feature Discovery
Make "Fork from here" more visible:
- Icon button on each trace step
- Highlight on hover
- Modal for fork configuration

---

## Implementation Priority

### Phase 1: Layout Restructure
1. [ ] Rewrite app-shell.tsx - simpler sidebar
2. [ ] Rewrite Project page - table view instead of graph
3. [ ] Rewrite Episode detail - timeline focus

### Phase 2: Component Polish  
4. [ ] Update all cards to new design system
5. [ ] Fix typography consistency
6. [ ] Add status indicators

### Phase 3: Interactions
7. [ ] Episode status filters
8. [ ] Quick fork action
9. [ ] State inspector improvements

---

## Success Metrics
- Manager can identify "which Episode to continue" in < 5 seconds
- Episode list loads < 1 second
- Fork action takes < 3 clicks
- Zero visual inconsistencies
