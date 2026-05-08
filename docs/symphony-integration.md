# Symphony × Traceplane 集成设计

本文档说明 Symphony 与 Traceplane 的组合价值、当前已实现能力，以及后续扩展边界。

## 1. 背景

Symphony 负责多 Agent 编排：任务拆分、Orchestrator 分配、Worker 并行执行、结果回收。它关注的是“当前这次任务怎么跑”。

Traceplane 负责多 Agent 连续性：Episode 主线、Trace 证据、Memory / Artifact 沉淀、Handoff Brief、审计与复盘。它关注的是“这次任务的状态怎么留下来，下一轮怎么续接”。

两者组合后：

```text
Symphony:   task orchestration and execution
Traceplane: durable episode state and handoff context
```

## 2. 场景价值

### 大型代码重构

Orchestrator 将一个重构任务分配给多个 Worker。Traceplane 为 Orchestrator 和 Worker 都创建 Episode，并把 step、artifact、failure、审计事件写入同一条工作图。中断后，下一个 Agent 可以读取结构化 context 续接。

### 跨天长期项目

今天的 Claude Code、明天的 Gemini CLI、后天的 OpenCode 可以通过同一个 project / episode / memory 主线共享上下文，不需要反复复述背景。

### 错误回溯

当某一步走错时，Traceplane 可以从具体 trace 节点 fork 出新 Episode。Symphony 后续可以从修正后的上下文重新编排，而不是重跑整个任务。

### 企业审计

所有核心写入都落到 audit event，管理者可以按 episode、agent、project 和时间线复盘 Agent 做了什么、读了什么、产出了什么。

## 3. 当前实现状态

当前分支已经实现 Phase 1 和 Phase 2 的最小闭环。

### Symphony Webhook

`POST /api/webhooks/symphony`

要求：

- 必须配置 `SYMPHONY_WEBHOOK_SECRET`
- 使用 `x-symphony-signature` 验证 HMAC-SHA256
- header 可传原始 64 位 hex digest，或 `sha256=<digest>`

支持事件：

| Event | Traceplane effect |
| --- | --- |
| `task.started` | 创建或复用以 `task_id` 为 id 的 Episode |
| `task.step_completed` | 向 Episode 追加 TraceEvent snapshot |
| `task.failed` | 将 Episode 标记为 `FAILED` 并记录失败上下文 |
| `task.completed` | 将 Episode 标记为 `COMPLETED` 并记录最终结果 |

最小 `task.started` payload：

```json
{
  "event_type": "task.started",
  "orchestrator_id": "symphony-orchestrator",
  "task_id": "task_123",
  "agent_id": "research-agent",
  "timestamp": "2026-04-30T10:00:00.000Z",
  "payload": {
    "project_id": "q2-customer-pulse",
    "title": "Analyze customer feedback",
    "goal": "Summarize churn risks",
    "success_criteria": "Produce a manager-readable brief"
  }
}
```

### Orchestrator Context API

`GET /api/episodes/{id}/context`

返回机器可读的续接上下文：

- normalized episode status
- completed / pending trace steps
- recent memory snapshot
- recent artifacts with source trace links
- risk flags from failed traces, denied permissions, or policy hits
- resume hint

Agent SDK 提供 `get_orchestrator_context` helper。

### Task Graph

Task Graph 表达一个 Symphony task 与其 Orchestrator / Worker Episodes 的持久关系。

REST endpoints:

| Endpoint | Purpose |
| --- | --- |
| `POST /api/task-graphs` | 创建 Task Graph |
| `GET /api/task-graphs/{id}/status` | 查询 worker counts 和聚合状态 |

MCP tools:

| Tool | Purpose |
| --- | --- |
| `register_subtask` | 创建 worker Episode 并挂到 Task Graph |
| `report_subtask_result` | 更新 worker Episode 状态、追加 trace、刷新 graph 状态 |
| `get_task_graph_status` | 查询 Task Graph 聚合进度 |
| `get_orchestrator_context` | 查询 Orchestrator 续接上下文 |

## 4. 关键代码路径

| Path | Role |
| --- | --- |
| `app/api/webhooks/symphony/route.ts` | Symphony webhook endpoint |
| `lib/services/symphony-integration.ts` | webhook signature, event mapping, context builder |
| `app/api/episodes/[id]/context/route.ts` | Orchestrator Context API |
| `lib/services/task-graph.ts` | Task Graph creation, worker registration, status aggregation |
| `app/api/task-graphs/route.ts` | Task Graph create endpoint |
| `app/api/task-graphs/[id]/status/route.ts` | Task Graph status endpoint |
| `scripts/mcp-server.mjs` | MCP tools for episode, context, task graph |
| `tests/symphony-integration.test.ts` | webhook and context tests |
| `tests/task-graph.test.ts` | task graph service tests |

## 5. 当前边界

- 尚未提供独立 Symphony runtime client。
- UI 尚未可视化 Task Graph。
- `/api/episodes/fork` 已支持 trace fork 基础字段，但 `inherit_memory`、`inherit_artifacts`、`fork_reason` 等增强仍属于后续工作。
- `request_fork` MCP tool 尚未实现。
- 公开 SaaS 前仍需要补齐 auth、tenant-aware permission enforcement、sensitive read audit 和 rate limit。

## 6. 后续规划

### Phase 3: Replay enhancement

- 增强 `/api/episodes/fork`
- 支持从指定 trace 节点继承 memory / artifact
- 记录 fork reason 和审计事件
- 增加 `request_fork` MCP tool

### Phase 4: Task Graph UI

- 在项目页展示 Orchestrator / Worker Episode graph
- 展示 worker status、dependency、failed trace、artifact output
- 提供 manager-readable execution summary

### Phase 5: SaaS hardening

- user / workspace membership / API key
- route 和 MCP tool 统一权限检查
- denied read/write audit
- preview smoke test 和 production migration flow

## 7. 验证

```bash
npx vitest run tests/symphony-integration.test.ts tests/task-graph.test.ts
npx prisma validate --schema prisma/schema.prisma
npx prisma validate --schema prisma/schema.postgres.prisma
npm run lint
npm run build
```
