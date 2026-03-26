# Product Spec

## 1. 产品定义

### 1.1 One-liner
A continuity layer for multi-agent work, turning scattered sessions into one connected, replayable work spine.

### 1.2 产品定位
本产品当前第一层是多 Agent 工作连续层，不是单点记忆层，不是聊天前端，也不是网盘替代品。

它先面向已经开始同时使用多个 Agent 工作的个人用户和小团队，统一组织三类内容：

- 输入：Memory
- 过程：Trace
- 输出：Artifact

并为后续团队治理预留两类能力：

- 控制：Policy Injection
- 治理：Permission + Audit

### 1.3 核心价值
- 对个人操作者：多个 Agent 共享同一条工作主线，减少重复解释和重复劳动。
- 对重度使用者：每次任务都有 brief、trace、artifact，可以回看、复用、继续交接。
- 对后续团队版：为 review、audit、permission 和 policy 留出统一主线。

### 1.4 当前产品视角
- 默认主视角是 `Episode`
- `Project` 提供归属、汇总语义和长期上下文
- `Episode` 提供执行主线、handoff 主线和复盘主线

### 1.5 当前阶段判断
- 第一层先把 continuity 做深做透
- 第一层先服务单人多 Agent 操作者和 10 人以下小团队
- 第一层先验证 handoff、brief、replay 是否成立
- 治理、审批、权限仍然重要，但不是第一层主叙事

## 2. 问题定义

### 2.1 现有方案缺口
- 传统网盘擅长文件存储，但不理解 Agent 上下文。
- Notion / Obsidian 偏向人类内容工作台，不是 Agent 工作闭环。
- 现有 memory 产品大多只覆盖“记住了什么”，不覆盖“做了什么、产出了什么、为何这样做”。

### 2.2 用户痛点
- 多个 Agent 重复向用户询问相同背景。
- Agent 之间无法复用已有上下文和产物。
- 运行过程散落在日志系统和聊天记录中。
- 输出文件与来源记忆、过程轨迹、权限规则脱节。
- 出现误操作或越权访问时，缺少可读、可追责的证据链。

### 2.3 核心假设
- 企业真正需要的是“可管理的 Agent 工作体系”。
- Episode 必须是系统里的第一主索引。
- 权限和审计需要挂在节点与关系上，而不是只挂在文件夹上。
- 第一阶段最值得验证的不是自有 runtime，而是跨 Agent 的工作证据链。

## 3. 目标用户

### 3.1 第一优先
已经在日常工作里同时使用多个 Agent 的个人操作者和 AI native builder。

### 3.2 第二优先
用多个 Agent 做研究、创作、开发、分析的小团队。

### 3.3 第三优先
准备把 Agent 工作纳入团队协作和 review 流程的试点团队。

## 4. 用户角色

| 角色 | 主要目标 | 核心权限 |
| --- | --- | --- |
| Admin / Boss | 看全局、定规则、做审计 | 全局查看、策略配置、审批高风险行为 |
| Team Lead | 管项目、分配 Agent、看结果 | 项目范围查看、策略继承、结果复盘 |
| Operator / Employee | 调用 Agent 完成工作 | 创建任务、授权数据读取、消费产物 |
| Agent | 执行任务、读写上下文、产生产物 | 按权限受控读写 |
| Auditor / Security | 复盘与合规审计 | 只读审计、日志导出 |

## 5. 核心场景

### 场景 A：单人管理多个 Agent
一个用户同时使用研究 Agent、写作 Agent、数据 Agent、汇报 Agent。它们不需要共享同一聊天窗口，但需要共享同一条工作主线和可交接的上下文摘要。

### 场景 B：项目级协作
多个 Agent 围绕同一项目目标分工协作。研究结果、关键结论、工具调用记录和输出文件能沿着同一 episode 主线串起来。

### 场景 C：管理者视角
当一个人或小团队已经积累了很多 episode 时，需要从更高层回看项目进度、异常、关键决策和输出文件。

### 场景 D：Bring Your Own Agent
团队继续使用已有 Agent，如 Claude Code、Codex、Gemini CLI、OpenCode。它们通过 MCP 或 adapter 把工作沉淀进统一的 Episode 体系，而不是迁移到全新 runtime。

### 场景 E：Session Resume / Handoff
昨天在 Claude 做到一半，今天换到 OpenCode 或 Gemini 继续做，不需要重新解释背景。Traceplane 会把当前目标、最近产物和关键步骤组织成可继续工作的 handoff brief。

## 6. MVP 范围

### 6.1 必做能力
- Workspace / Project / Agent / Episode 基础建模
- Episode 创建字段、状态和关系模型
- Memory 写入与检索
- Trace 持续追加与时间线回放
- Artifact 创建、版本记录与回链
- 自动 handoff brief
- Episode 图谱查询
- MCP v1 接入

### 6.2 MVP 闭环
1. Agent 通过 API 或 MCP 创建 `episode`
2. 调用 `query_context` 获取当前工作上下文
3. 运行过程写入 `trace_event` 和关键 `memory_item`
4. 生成 `artifact`
5. 自动形成可交接的 `episode brief`
6. 下一个 Agent 可以直接继续这条工作主线

### 6.3 明确不做
- 不做完整 Web 办公套件
- 不做通用 IM
- 不替代 Notion / Obsidian / 企业网盘
- 不做复杂 BI 分析平台
- 不在 MVP 阶段追求完整私有化部署产品
- 不在 MVP 阶段做全量端到端加密
- 不在 MVP 阶段做完整自有 Agent runtime

## 7. 功能需求

### 7.1 Memory
- 支持 `semantic`、`episodic`、`procedural` 三类记忆。
- 每条记忆带 `workspace_id`、`project_id`、`episode_id`、`agent_id`、`sensitivity`、`ttl`、`importance`、`source`。
- 支持语义检索、时间检索、项目检索、Agent 检索。
- 支持从 trace 或对话提炼结构化记忆。
- 支持过期、归档和蒸馏。

### 7.2 Trace
- 记录触发、输入摘要、上下文引用、工具调用、模型响应、错误、人工干预、结果状态。
- 每个事件可回链到 Memory、Artifact、Policy。
- 支持 episode 级 timeline 回放。
- 支持异常聚合：失败重试、权限拒绝、越权访问、策略命中、审批等待。

### 7.2.1 Episode 状态
第一版主状态收敛为：

- `planned`
- `in_progress`
- `blocked`
- `in_review`
- `completed`
- `failed`

并通过 `blocked_reason`、`failure_reason`、`review_outcome` 补充细粒度事实。

### 7.3 Artifact
- 支持 Markdown、JSON、CSV、HTML、SVG、PDF、脚本、图片。
- 每个 Artifact 记录来源 episode、生成 Agent、依赖记忆、关联 trace、版本信息。
- 支持版本历史、引用关系和共享。
- 支持在权限允许下被其他 Agent 复用。

### 7.4 Policy Injection
- 支持全局、项目、任务三级规则注入。
- 规则类型至少包括：访问限制、引用要求、人工审批、风险确认、日志保留。
- 每次执行都记录 `policy_version`。
- 历史任务固定引用旧版本策略。

### 7.5 Permission + Audit
- 支持 Workspace / Project / Episode / Node 四级授权。
- 支持按角色、Agent、标签、敏感级别控制访问。
- 所有读取、写入、删除、导出、分享都生成审计事件。
- 审计日志默认不可变更、可检索、可导出。

### 7.5.1 第一层范围收敛
虽然 schema 和系统层保留 Permission / Audit / Policy，但第一层对外主价值不以治理为入口，而以 continuity、handoff、replay 为入口。

### 7.6 主流 Agent 接入
- 第一阶段产品定义为 `BYO Agent`
- 对主流 Agent 的标准接入方式优先为 `MCP`
- 在具备条件时补充 `hooks / plugins / telemetry adapters`
- 对 API-native agent stack 提供更深的 integration

## 8. 非功能需求
- 可追溯性：任一产物能追溯到来源记忆、关键轨迹和策略版本。
- 多租户隔离：Workspace 间强隔离。
- 扩展性：后续可扩展监控指标、A2A 消息、RAG cache。
- 性能：日志和元数据低延迟写入，语义索引异步构建。
- 可靠性：链路可恢复，失败写入进入重试队列。
- 安全性：敏感级别贯穿 schema、API、查询和存储。
- 兼容性：优先支持 MCP、CLI、HTTP API。

## 9. 成功标准

### 9.1 北极星指标
有多少次工作不是从零开始，而是沿着已有 Episode 继续推进。

### 9.2 过程指标
- 每个 episode 的记忆复用次数
- 每个 artifact 的来源可追溯率
- 每个 Agent 的跨 episode 记忆命中率
- 权限拒绝与风险命中事件数
- 审计日志完整率
- 项目内跨 Agent 产物复用率

### 9.3 MVP 验收
- 一个项目内至少 2 个 Agent 能共享上下文工作
- 下一个 Agent 能基于 brief 和上下文直接接上工作
- 同一个输出文件可追溯到来源记忆和关键过程
- 用户能回看统一 episode 视图而不是多个孤立界面

## 10. 产品策略上的一句硬判断
如果这个系统最后只能把 memory 做得更强，那它不会形成企业级产品壁垒。

真正的壁垒是：
把上下文连续性、执行过程、输出产物和治理约束组织成同一个“可操作、可审计、可复盘”的工作图谱。

## 11. 当前阶段战略判断
- 先做 `system of record`
- 再决定是否做 `system of execution`
- 先做 `MCP-first`
- 再补 `skill` 作为 onboarding 和最佳实践层
- 先做 `continuity-first`
- 再逐步打开 `review / governance / managed runtime`
