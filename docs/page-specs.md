# Page Specs

这份文档是第一版产品的低保真页面规格。

目标不是画视觉稿，而是定义：

- 每个页面给谁用
- 页面有哪些区块
- 每个区块展示哪些字段
- 用户在页面上能做什么
- 页面之间怎么跳转
- 最低数据依赖是什么

## 1. 设计原则

### 1.1 页面数量最少化
第一版只围绕 5 个页面展开：

1. Project List
2. Project Overview
3. Episode Review
4. Artifact Detail
5. Audit View

### 1.2 页面围绕 `Project` 和 `Episode`
第一版不要围绕文件树，也不要围绕聊天窗口。

主导航逻辑应该是：

`Project -> Episode -> Artifact / Audit`

### 1.3 字段优先于视觉
先定义信息密度和交互路径，再决定 UI 风格。

## 2. Page 1: Project List

### 2.1 页面目标
给 manager / lead 一个项目入口，快速判断哪些项目值得进入。

### 2.2 页面区块

#### 顶部栏
字段：
- Workspace 名称
- 当前用户身份
- 搜索框
- 过滤按钮

操作：
- 搜索 project
- 过滤状态

#### 项目列表区
每个 project card / row 显示：
- `project_name`
- `project_status`
- `last_active_at`
- `agent_count`
- `episode_count`
- `artifact_count`
- `risk_event_count`
- `policy_version_summary`

操作：
- 点击进入 Project Overview

#### 过滤区
支持：
- 最近活跃
- 有风险事件
- 有待审批
- 最近 7 天有 artifact

### 2.3 空状态
- 暂无项目
- 建议文案：先创建一个项目并接入至少一个 Agent

### 2.4 最低数据依赖
- `projects`
- `agents` 聚合计数
- `episodes` 聚合计数
- `artifacts` 聚合计数
- `audit_events` 风险计数
- `policies` 当前版本摘要

### 2.5 关键跳转
- `Project List -> Project Overview`

## 3. Page 2: Project Overview

### 3.1 页面目标
给 manager / lead 看项目级总览，不直接掉进原始事件流。

### 3.2 页面区块

#### 顶部摘要区
字段：
- `project_name`
- `workspace_name`
- `project_owner`
- `project_status`
- `created_at`
- `active_policy_version`

操作：
- 查看项目设置
- 查看策略摘要

#### Agent 列表区
每个 agent 显示：
- `agent_name`
- `agent_role`
- `last_active_at`
- `episodes_involved_count`
- `artifacts_generated_count`

操作：
- 按 agent 过滤 episode

#### Recent Episodes 区
每个 episode row 显示：
- `episode_title`
- `episode_status`
- `primary_agent`
- `updated_at`
- `artifact_count`
- `risk_flag`
- `summary_snippet`

操作：
- 进入 Episode Review

#### Recent Artifacts 区
字段：
- `artifact_title`
- `artifact_type`
- `episode_title`
- `generated_by_agent`
- `updated_at`

操作：
- 进入 Artifact Detail

#### Risk Summary 区
字段：
- `permission_denied_count`
- `policy_hit_count`
- `failed_episode_count`
- `pending_approval_count`

操作：
- 跳转 Audit View 并带过滤条件

### 3.3 空状态
- 项目已创建但还没有 episode
- 建议文案：接入第一个 Agent，创建第一条 episode

### 3.4 最低数据依赖
- `projects`
- `agents`
- `episodes`
- `artifacts`
- `audit_events`
- `policies`

### 3.5 关键跳转
- `Project Overview -> Episode Review`
- `Project Overview -> Artifact Detail`
- `Project Overview -> Audit View`

## 4. Page 3: Episode Review

这是第一版最关键的页面。

### 4.1 页面目标
给 manager / lead / operator 复盘一条完整任务主线。

### 4.2 页面区块

#### 顶部摘要区
字段：
- `episode_title`
- `episode_status`
- `project_name`
- `started_at`
- `ended_at`
- `duration`
- `primary_agent`
- `participating_agents`
- `policy_version`
- `risk_summary`

操作：
- 复制 episode id
- 查看原始 JSON
- 跳转 audit filtered view

#### Summary 区
字段：
- `episode_summary`
- `goal`
- `final_outcome`
- `manager_note` 占位

#### Timeline 主区
每个 timeline item 显示：
- `event_time`
- `event_type`
- `actor`
- `tool_name`
- `step_title`
- `status`
- `short_result`
- `linked_memory_count`
- `linked_artifact_count`
- `policy_hit_badge`
- `permission_denied_badge`

操作：
- 展开事件详情
- 查看关联 memory
- 查看关联 artifact
- 查看命中的 policy / 审计事件

#### Memory Panel
字段：
- `memory_title`
- `memory_type`
- `source`
- `importance`
- `sensitivity`
- `ttl`
- `used_in_step_count`

操作：
- 展开 memory 内容
- 高亮它在 timeline 中被引用的位置

#### Artifact Panel
字段：
- `artifact_title`
- `artifact_type`
- `version`
- `generated_by`
- `generated_at`
- `shared_status`

操作：
- 打开 Artifact Detail
- 预览当前版本

#### Audit Summary Panel
字段：
- `read_count`
- `write_count`
- `permission_denied_count`
- `policy_hit_count`
- `approval_event_count`

操作：
- 跳转 Audit View

#### Relationship 区
字段：
- `generated_from`
- `used_in`
- `references`
- `supersedes`

操作：
- 点击关系节点跳转对应 artifact / episode

### 4.3 展开单个 Trace Event 时的字段
- `event_id`
- `step_index`
- `actor`
- `input_summary`
- `decision_summary`
- `tool_call_payload_summary`
- `result_summary`
- `error_summary`
- `linked_memory_ids`
- `linked_artifact_ids`
- `linked_policy_hits`
- `linked_audit_events`

### 4.4 空状态
- episode 已创建但还没有 trace
- 建议文案：等待 Agent 写入执行过程

### 4.5 最低数据依赖
- `episodes`
- `trace_events`
- `memory_items`
- `artifacts`
- `node_edges`
- `audit_events`
- `policies`

### 4.6 关键跳转
- `Episode Review -> Artifact Detail`
- `Episode Review -> Audit View`
- `Episode Review -> Project Overview`

## 5. Page 4: Artifact Detail

### 5.1 页面目标
查看单个产物的当前版本、历史版本和来源链路。

### 5.2 页面区块

#### 顶部摘要区
字段：
- `artifact_title`
- `artifact_type`
- `current_version`
- `created_by_agent`
- `created_at`
- `updated_at`
- `source_episode`
- `sensitivity`

操作：
- 预览
- 下载
- 复制链接

#### Content Preview 区
按类型显示：
- Markdown 预览
- JSON 结构视图
- HTML / SVG 预览
- 文件占位信息

#### Version History 区
每个版本显示：
- `version_number`
- `created_at`
- `generated_by_agent`
- `change_note` 占位
- `supersedes_previous`

操作：
- 切换版本
- 比较版本 占位

#### Provenance 区
字段：
- `source_episode`
- `source_trace_events`
- `source_memory_items`
- `policy_version`

操作：
- 回到 Episode Review
- 跳到相关 trace event

#### Reuse 区
字段：
- `consumed_by_agents`
- `referenced_in_episodes`
- `share_scope`

### 5.3 空状态
- 产物元数据存在，但文件预览不可用
- 建议文案：显示 metadata，不阻塞来源回链

### 5.4 最低数据依赖
- `artifacts`
- `episodes`
- `trace_events`
- `memory_items`
- `node_edges`

### 5.5 关键跳转
- `Artifact Detail -> Episode Review`
- `Artifact Detail -> Audit View`

## 6. Page 5: Audit View

### 6.1 页面目标
给 manager / security / auditor 一个可过滤的证据视图。

### 6.2 页面区块

#### 顶部过滤栏
过滤字段：
- `project`
- `episode`
- `agent`
- `action_type`
- `result`
- `date_range`
- `sensitivity`

操作：
- 应用过滤
- 清空过滤

#### Audit Table
每行显示：
- `occurred_at`
- `actor_type`
- `actor_id`
- `action`
- `target_type`
- `target_id`
- `result`
- `policy_hit_reason`
- `permission_decision`

操作：
- 展开查看详情
- 跳到对应 episode / artifact

#### Audit Detail Drawer
字段：
- `audit_id`
- `request_id`
- `workspace_id`
- `project_id`
- `episode_id`
- `actor`
- `action`
- `target`
- `before_after_summary` 占位
- `policy_version`
- `hit_reason`
- `deny_reason`

### 6.3 默认视图
建议默认打开“最近 7 天 + 当前项目”的视图，避免第一屏信息过载。

### 6.4 空状态
- 当前过滤条件下无审计记录

### 6.5 最低数据依赖
- `audit_events`
- `episodes`
- `projects`
- `agents`
- `artifacts`

### 6.6 关键跳转
- `Audit View -> Episode Review`
- `Audit View -> Artifact Detail`

## 7. 最小导航结构

建议第一版导航非常克制：

- `Projects`
- `Audit`

进入 Project 后再看到：
- `Overview`
- `Episodes`
- `Artifacts`

不要在一级导航里堆：
- Settings
- Analytics
- Integrations
- Templates

这些都不是第一版核心。

## 8. 关键跨页链路

第一版最重要的不是单页完整，而是链路完整。

### 8.1 管理者复盘链路
`Project List -> Project Overview -> Episode Review -> Artifact Detail -> Audit View`

### 8.2 产物回链链路
`Artifact Detail -> Episode Review -> Trace Event -> Memory`

### 8.3 风险定位链路
`Project Overview Risk Summary -> Audit View -> Episode Review`

## 9. 最低可做版

如果资源不足，可以把第一版压成 3 个页面：

1. `Project Overview`
2. `Episode Review`
3. `Audit View`

在这种情况下：
- Artifact Detail 变成 Episode Review 内的 drawer
- Project List 用 mock 或简单列表替代

## 10. 一句话总结

这套页面规格的目的不是做复杂产品，而是确保第一版用户始终沿着同一条路径理解系统：

先看项目，再看任务主线，再看产物与审计。
