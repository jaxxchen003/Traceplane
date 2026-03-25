# MCP Spec v1

## 1. 设计目标

第一版 MCP 的目标不是把整个平台都暴露出去，而是先让主流 Agent 能完成一件事：

在不改变原有工作方式的前提下，把一次工作沉淀成可追溯、可回链、可复盘的 Episode。

一句话：

第一版 MCP 只做三件事：

- 开工
- 留痕
- 交付

## 2. 第一版范围

### 写入类

- `create_episode`
- `update_episode_status`
- `link_episode`
- `write_memory`
- `append_trace`
- `create_artifact`

### 读取类

- `query_context`
- `get_episode_brief`

## 3. 工具定义

### `create_episode`

必填字段：

- `project_id`
- `goal`
- `work_type`
- `primary_actor`
- `success_criteria`

### `update_episode_status`

必填字段：

- `episode_id`
- `status`

### `link_episode`

必填字段：

- `from_episode_id`
- `to_episode_id`
- `relation_type`

允许关系：

- `depends_on`
- `reviews`
- `supersedes`
- `continues`
- `splits_from`
- `references`

### `write_memory`

必填字段：

- `episode_id`
- `content`
- `memory_type`

### `append_trace`

必填字段：

- `episode_id`
- `event_type`
- `summary`

### `create_artifact`

必填字段：

- `episode_id`
- `title`
- `artifact_type`

至少二选一：

- `content`
- `uri`

### `query_context`

必填字段：

- `project_id`
- `goal`

### `get_episode_brief`

必填字段：

- `episode_id`

## 4. 第一版先不做

- `grant_access`
- `read_audit_events`
- `list_episode_graph`
- `approve_episode`
- `distill_memory`
- `archive_episode`
- 细粒度 node / edge CRUD

## 5. 和 Skill 的关系

MCP v1 提供系统能力。

后续 onboarding skill 的职责是：

- 教 Agent 什么时候该创建 Episode
- 什么时候写 memory
- 什么时候追加 trace
- 什么时候建立 Episode 关系
- 什么时候推进状态

也就是说：

- MCP 是接入层
- Skill 是最佳实践层
