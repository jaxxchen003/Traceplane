# Symphony × Traceplane 集成设计文档

> 本文档面向 Codex 优化，明确场景、价值、能力补充和完整实现思路。

---

## 1. 背景：两个问题，一个解法

### Symphony 解决什么

OpenAI Symphony 是一个开源的 Codex 多 Agent 编排规范（发布于 2026 年 4 月）。它的核心能力是：

- **任务分解**：将一个大任务（如重构一个模块）拆分成多个子任务，分发给多个 Codex Agent 并行执行
- **Orchestrator 角色**：一个主 Agent 负责规划、分配、合并、解决冲突
- **上下文传递规范**：定义 Agent 之间如何共享状态，避免重复和冲突
- **可观测钩子**：内置 trace 和 event 上报接口，供外部系统监听

**Symphony 的边界**：它只管「当前这次任务跑完」，任务结束后上下文不持久化，下一轮 Agent 无法续接。

### Traceplane 解决什么

Traceplane 是 Multi-Agent Continuity Layer，解决的是：

- **工作不断档**：Episode 作为 Agent 工作的主索引，跨 Agent、跨会话持久化
- **可交接**：Handoff Brief 自动生成，下一个 Agent 直接续接
- **可回溯**：Surgical Replay 从任意节点 Fork，像 git 一样回到过去
- **可观测**：全栈追踪，每个事件可回链到来源 trace

**Traceplane 的边界**：它不管任务如何编排和执行，只管状态的持久化和交接。

### 两者组合

```
 Symphony               Traceplane
 ────────────────       ──────────────────────────
 任务编排与执行    →    状态持久化与可交接
 当前轮次跑完          下一轮可续接
 运行时上下文           跨会话上下文
 Agent 并行协作         Agent 工作主线连续
```

**结合后**：Symphony 负责「这次任务怎么跑」，Traceplane 负责「这次任务的状态怎么留下来」。两者合在一起，构成完整的多 Agent 工程基础设施。

---

## 2. 场景与价值

### 场景一：大型代码重构任务

**痛点**：重构一个认证模块，Orchestrator 把任务分给 3 个 Codex Agent 并行处理路由层、中间件、测试。某个 Agent 跑到一半因为 token 超限中断，下一个 Agent 接不上，要从头来。

**结合后**：
- Traceplane 为每个子任务创建 Episode，每个 step 都上报 trace
- 中断时自动生成 Handoff Brief，包含：已完成节点、未完成节点、产生的 artifact、风险点
- 下一个 Agent 调用 `get_episode_brief` 直接续接，无信息损失

**价值**：任务中断不再等于重来，节省大量 token 和时间。

### 场景二：跨天、跨 Agent 的长期项目

**痛点**：今天用 Claude Code 做了一半需求分析，明天换 Gemini CLI 继续，但 Gemini 不知道昨天做了什么，要重新讲上下文。

**结合后**：
- Symphony Orchestrator 每次启动任务前，先查询 Traceplane 的 `get_episode_brief` 获取历史状态
- Memory 模块存储跨会话的关键决策和约束
- Orchestrator 基于历史状态重新规划子任务，不重复已完成的工作

**价值**：多个 Agent 工具之间无缝切换，项目级的上下文永不丢失。

### 场景三：任务执行出错需要回溯

**痛点**：Agent 在执行第 5 步时走错了方向，产生了错误的 artifact，需要回到第 3 步重新来。但 Symphony 没有历史状态，只能重跑整个任务。

**结合后**：
- Traceplane 的 Surgical Replay 从 Step 3 Fork 出新路径
- 新 Episode 继承 Step 3 之前的所有 memory 和 artifact
- Symphony 重新从 Step 3 开始编排，不需要重跑 Step 1-2

**价值**：调试成本大幅降低，可以像 git bisect 一样精准定位问题。

### 场景四：企业级审计与合规

**痛点**：企业使用多个 AI Agent 处理敏感数据，需要知道每个 Agent 做了什么、读了什么、产生了什么，但 Symphony 没有审计能力。

**结合后**：
- Traceplane 的 Control Plane 自动记录所有核心操作的审计事件
- 权限拒绝、策略命中、敏感数据读取全部留下证据
- 管理者可以按 episode、agent、时间范围查询完整审计链

**价值**：满足企业合规要求，AI Agent 的行为不再是黑盒。

---

## 3. 能力补充：Traceplane 需要新增的功能

为了完整支持 Symphony 集成，Traceplane 需要补充以下能力：

### 3.1 Symphony Webhook 接收器

**现状**：Traceplane 目前通过 SDK 主动上报，没有被动接收外部编排系统事件的能力。

**需要新增**：

```typescript
// 新增 API 端点
POST /api/webhooks/symphony

// Payload 结构
{
  event_type: 'task.started' | 'task.step_completed' | 'task.failed' | 'task.completed',
  orchestrator_id: string,
  task_id: string,        // 映射到 episode_id
  agent_id: string,
  step_index: number,
  payload: object,
  timestamp: ISO8601
}
```

**映射规则**：
- `task.started` → `create_episode`
- `task.step_completed` → `append_trace`
- `task.failed` → `update episode status: failed` + 生成 Handoff Brief
- `task.completed` → `update episode status: done` + 归档 artifacts

### 3.2 Orchestrator Context API

**现状**：Traceplane 的 `get_episode_brief` 返回人类可读的交接文档，不适合 Symphony Orchestrator 机器消费。

**需要新增**：

```typescript
// 新增 API 端点 - 返回结构化上下文供 Orchestrator 使用
GET /api/episodes/{id}/context

// 响应结构
{
  episode_id: string,
  status: 'active' | 'paused' | 'done' | 'failed',
  completed_steps: Step[],      // 已完成的步骤列表
  pending_steps: Step[],        // 未完成的步骤列表
  artifacts: Artifact[],        // 产生的产物
  memory_snapshot: MemoryItem[], // 关键记忆
  risk_flags: string[],         // 风险标记
  resume_hint: string           // 给下一个 Orchestrator 的建议
}
```

### 3.3 Episode Fork API 增强

**现状**：`/api/episodes/fork` 存在，但缺少 Symphony 需要的参数：
- 指定从哪个 trace 节点分叉
- 继承哪些 memory 和 artifact
- 新 Episode 的目标修正

**需要补充字段**：

```typescript
// Fork 请求体增强
{
  source_episode_id: string,
  fork_from_trace_id: string,       // 从哪个 trace 节点分叉（现有字段）
  inherit_memory: boolean,           // 新增：是否继承 memory
  inherit_artifacts: string[],       // 新增：继承哪些 artifact IDs
  revised_goal: string,              // 新增：修正后的目标
  fork_reason: string                // 新增：分叉原因（用于审计）
}
```

### 3.4 Multi-Episode Task Graph

**现状**：Traceplane 的 Episode 是独立的，没有表达「一组 Episode 属于同一个 Symphony Task」的能力。

**需要新增**：Task Graph 层

```typescript
// 新增数据模型
table task_graphs {
  id: string
  project_id: string
  symphony_task_id: string    // Symphony 任务 ID
  orchestrator_episode_id: string  // Orchestrator 自身的 Episode
  status: 'running' | 'completed' | 'failed'
  created_at: timestamp
}

table task_graph_episodes {
  task_graph_id: string
  episode_id: string
  role: 'orchestrator' | 'worker'  // Orchestrator 还是子 Agent
  agent_id: string
  assigned_subtask: string
  dependency_episode_ids: string[]  // 依赖哪些其他 Episode 的输出
}
```

### 3.5 MCP 工具扩展

**现状**：Traceplane MCP 提供 5 个工具。需要新增 Symphony 专用工具：

| 新工具 | 说明 |
|--------|------|
| `get_orchestrator_context` | 获取结构化上下文，供 Orchestrator 规划使用 |
| `register_subtask` | 注册一个子任务，创建对应 Episode 并挂到 Task Graph |
| `report_subtask_result` | 子 Agent 完成后上报结果到 Task Graph |
| `request_fork` | 请求从指定节点分叉，由 Orchestrator 决策是否批准 |
| `get_task_graph_status` | 获取整个 Task Graph 的执行状态 |

---

## 4. 完整实现思路

### 4.1 架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                        Symphony Layer                           │
│  ┌─────────────────┐   分发任务   ┌───────────────────────────┐ │
│  │  Orchestrator   │ ──────────→ │  Worker Agent 1 (Codex)   │ │
│  │  (Codex Agent)  │             │  Worker Agent 2 (Codex)   │ │
│  │                 │ ←────────── │  Worker Agent 3 (Codex)   │ │
│  └────────┬────────┘   上报结果   └──────────────┬────────────┘ │
│           │                                      │              │
└───────────┼──────────────────────────────────────┼──────────────┘
            │ MCP / Webhook                        │ MCP / Webhook
            ↓                                      ↓
┌─────────────────────────────────────────────────────────────────┐
│                       Traceplane Layer                          │
│                                                                 │
│  ┌──────────────────────┐    ┌──────────────────────────────┐  │
│  │   Task Graph API      │    │    Episode + Trace API        │  │
│  │  /api/task-graphs     │    │  /api/episodes               │  │
│  │                       │    │  /api/traces                 │  │
│  └──────────────────────┘    └──────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────┐    ┌──────────────────────────────┐  │
│  │  Handoff Brief Engine │    │   Audit + Policy Engine      │  │
│  │  /api/episodes/context│    │   /api/audit                 │  │
│  └──────────────────────┘    └──────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────┐    ┌──────────────────────────────┐  │
│  │  Surgical Replay      │    │   SSE Event Stream           │  │
│  │  /api/episodes/fork   │    │   /api/events/stream         │  │
│  └──────────────────────┘    └──────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────────────────────────────┐
│                       Persistence Layer                         │
│       Postgres / SQLite  ·  Cloudflare R2 (Artifacts)           │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 实现优先级

遵循 AGENTS.md 的「先最小闭环」原则：

**Phase 1：单向集成（1-2 周）**

优先级最高，让 Symphony 的事件能流进 Traceplane：

1. 实现 `POST /api/webhooks/symphony` 接收器
   - 验证 webhook 签名
   - 映射 Symphony 事件 → Traceplane 操作（create_episode / append_trace / update_status）
   - 所有操作写入审计日志

2. 扩展 `GET /api/episodes/{id}/context`
   - 在现有 episode 数据基础上增加结构化输出
   - 返回 `completed_steps`、`pending_steps`、`artifacts`、`resume_hint`

3. 新增 MCP 工具 `get_orchestrator_context`
   - 包装上述 API，供 Claude Code / Codex 直接调用

**Phase 2：双向集成（2-3 周）**

让 Traceplane 能主动影响 Symphony 的编排决策：

4. 实现 Task Graph 数据模型
   - 新增 `task_graphs` 和 `task_graph_episodes` 表
   - 迁移文件：`prisma/migrations/xxx_add_task_graph.sql`

5. 实现 `POST /api/task-graphs` 和 `GET /api/task-graphs/{id}/status`

6. 新增 MCP 工具：`register_subtask`、`report_subtask_result`、`get_task_graph_status`

**Phase 3：Replay 增强（1 周）**

7. 扩展 `/api/episodes/fork` 支持 `inherit_memory`、`inherit_artifacts`、`fork_reason`
8. 新增 MCP 工具 `request_fork`

### 4.3 关键代码路径

#### Webhook 接收器（新文件）

```
app/api/webhooks/symphony/route.ts
  ↓ 验证签名
  ↓ 解析 event_type
  ↓ 调用对应的内部 service
    - episodeService.create()
    - traceService.append()
    - episodeService.updateStatus()
  ↓ 写入 auditService.log()
```

#### Orchestrator Context API（扩展现有）

```
app/api/episodes/[id]/context/route.ts
  ↓ 读取 episode + traces + memory + artifacts
  ↓ 计算 completed_steps（trace status = 'done'）
  ↓ 计算 pending_steps（trace status = 'pending'）
  ↓ 生成 resume_hint（基于最后一个 active trace）
  ↓ 返回结构化 JSON
```

#### Task Graph 数据模型（新增 Prisma Schema）

```prisma
// prisma/schema.prisma 新增

model TaskGraph {
  id                     String   @id @default(cuid())
  projectId              String
  symphonyTaskId         String   @unique
  orchestratorEpisodeId  String
  status                 String   @default("running")
  createdAt              DateTime @default(now())

  episodes TaskGraphEpisode[]
  project  Project @relation(fields: [projectId], references: [id])
}

model TaskGraphEpisode {
  id                    String   @id @default(cuid())
  taskGraphId           String
  episodeId             String
  role                  String   // 'orchestrator' | 'worker'
  agentId               String
  assignedSubtask       String
  dependencyEpisodeIds  String[] // Postgres array

  taskGraph TaskGraph @relation(fields: [taskGraphId], references: [id])
  episode   Episode   @relation(fields: [episodeId], references: [id])
}
```

### 4.4 测试优先级

遵循 AGENTS.md 的测试原则：

```typescript
// tests/symphony-integration.test.ts

// T1: Webhook 能否正确映射为 Episode
test('symphony task.started creates episode', async () => { ... })

// T2: Episode context 返回正确的 pending_steps
test('context returns correct pending steps after step failure', async () => { ... })

// T3: Fork 继承正确的 memory 和 artifacts
test('fork inherits specified artifacts from source episode', async () => { ... })

// T4: 所有 webhook 事件是否留下审计证据
test('all symphony events create audit records', async () => { ... })

// T5: Task Graph 状态能否正确聚合子 Episode 状态
test('task graph status reflects all worker episode statuses', async () => { ... })
```

---

## 5. 文件变更清单

| 文件 | 类型 | 说明 |
|------|------|------|
| `app/api/webhooks/symphony/route.ts` | 新增 | Symphony webhook 接收器 |
| `app/api/episodes/[id]/context/route.ts` | 新增 | Orchestrator Context API |
| `app/api/task-graphs/route.ts` | 新增 | Task Graph CRUD |
| `app/api/task-graphs/[id]/status/route.ts` | 新增 | Task Graph 状态聚合 |
| `prisma/schema.prisma` | 修改 | 新增 TaskGraph、TaskGraphEpisode 模型 |
| `prisma/migrations/xxx_add_task_graph.sql` | 新增 | 数据库迁移 |
| `packages/agent-sdk/src/tools.ts` | 修改 | 新增 5 个 MCP 工具 |
| `lib/services/symphonyWebhookService.ts` | 新增 | Symphony 事件映射逻辑 |
| `lib/services/taskGraphService.ts` | 新增 | Task Graph 业务逻辑 |
| `tests/symphony-integration.test.ts` | 新增 | 集成测试 |
| `examples/symphony-integration/` | 新增 | 完整集成示例代码 |

---

## 6. 给 Codex 的实现指令

以下是交给 Codex 执行的具体任务描述，可按 Phase 分批提交：

### Phase 1 任务

```
任务：实现 Symphony × Traceplane Phase 1 集成

目标：让 Symphony 的 webhook 事件能被 Traceplane 接收并转换为 Episode/Trace 操作。

具体要求：
1. 创建 app/api/webhooks/symphony/route.ts
   - 接受 POST 请求，验证 x-symphony-signature header（HMAC-SHA256，密钥从 SYMPHONY_WEBHOOK_SECRET env 读取）
   - 解析 event_type 字段，映射到对应操作：
     * task.started → 调用 episode create 逻辑
     * task.step_completed → 调用 trace append 逻辑  
     * task.failed → 更新 episode 状态为 failed，触发 handoff brief 生成
     * task.completed → 更新 episode 状态为 done
   - 所有操作必须写入 audit_events 表，event_type 前缀为 'symphony.'

2. 创建 app/api/episodes/[id]/context/route.ts
   - 返回结构化上下文（详见文档 3.2 节响应结构）
   - completed_steps: 从 trace_events 中筛选 status='done' 的记录
   - pending_steps: 从 trace_events 中筛选 status='pending' 或 'failed' 的记录
   - resume_hint: 取最后一个 active trace 的 description

3. 在 packages/agent-sdk/src/tools.ts 新增 get_orchestrator_context 工具
   - 调用上述 API 并返回结构化结果

4. 在 .env.example 新增 SYMPHONY_WEBHOOK_SECRET=your_webhook_secret_here

约束：
- 遵循 AGENTS.md 的所有约束
- 所有核心对象必须有 episode_id 字段
- 所有写操作必须产生审计事件
- 先写测试，tests/symphony-integration.test.ts
```

---

## 7. 验收标准

每个 Phase 完成后，需要能回答 AGENTS.md 的 4 个问题：

1. **它挂在哪个 episode 主线上？** → Symphony Task 的每个 step 都有对应 Episode/Trace
2. **它会产生哪些节点和边？** → TaskGraph → TaskGraphEpisode → Episode → Trace
3. **它是否会影响权限或审计？** → 是，所有 symphony 事件写入 audit_events
4. **管理者是否能复盘这次行为？** → 是，通过 Task Graph 视图可以看到完整执行链

---

*文档版本：v1.0 | 2026-04-29 | 由 Perplexity 辅助生成，交 Codex 实现*
