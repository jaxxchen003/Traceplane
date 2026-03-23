# Product Spec

## 1. 产品定义

### 1.1 One-liner
A shared data plane and control plane for enterprise AI agents, unifying memory, traces, and artifacts into a connected, auditable work graph.

### 1.2 产品定位
本产品是企业级 Agent 工作图谱，不是单点记忆层，不是聊天前端，也不是网盘替代品。

它面向企业多 Agent 协作场景，统一组织三类内容：

- 输入：Memory
- 过程：Trace
- 输出：Artifact

并在其上增加两类治理能力：

- 控制：Policy Injection
- 治理：Permission + Audit

### 1.3 核心价值
- 对管理者：看见输入、过程、输出，能审、能管、能复盘。
- 对一线使用者：多个 Agent 共享上下文和产物，减少重复输入和重复劳动。
- 对平台团队：把 memory、logs、artifacts、policies、permissions 收敛到同一个抽象下。

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

## 3. 目标用户

### 3.1 第一优先
已经在企业内部使用多个 Agent / Copilot / 自动化工作流的 AI 原生团队。

### 3.2 第二优先
需要对 Agent 进行项目化管理的产品、运营、研究、客服、销售支持团队。

### 3.3 第三优先
构建企业 Agent 平台的数据与治理团队。

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
一个用户同时使用研究 Agent、写作 Agent、数据 Agent、汇报 Agent。它们不需要共享同一聊天窗口，但要共享同一项目上下文和部分产物。

### 场景 B：项目级协作
多个 Agent 围绕同一项目目标分工协作。研究结果、关键结论、工具调用记录和输出文件能沿着同一 episode 主线串起来。

### 场景 C：管理者视角
管理者不进入每个 Agent 的对话框，而是在控制面看见项目进度、异常事件、关键决策、输出文件和访问记录，并能注入规则或要求审批。

## 6. MVP 范围

### 6.1 必做能力
- Workspace / Project / Agent / Episode 基础建模
- Memory 写入与检索
- Trace 持续追加与时间线回放
- Artifact 创建、版本记录与回链
- Policy 注入记录
- Permission 授权
- Audit 读写留痕
- Episode 图谱查询

### 6.2 MVP 闭环
1. Agent 通过 API 或 MCP 创建 `episode`
2. 写入初始 `memory_item`
3. 运行过程写入 `trace_event`
4. 生成 `artifact`
5. 控制面可查看 episode 时间线、引用上下文、产物来源和审计记录

### 6.3 明确不做
- 不做完整 Web 办公套件
- 不做通用 IM
- 不替代 Notion / Obsidian / 企业网盘
- 不做复杂 BI 分析平台
- 不在 MVP 阶段追求完整私有化部署产品
- 不在 MVP 阶段做全量端到端加密

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
每个活跃项目中，平均有多少 Agent 在共享同一条数据主线工作。

### 9.2 过程指标
- 每个 episode 的记忆复用次数
- 每个 artifact 的来源可追溯率
- 每个 Agent 的跨 episode 记忆命中率
- 权限拒绝与风险命中事件数
- 审计日志完整率
- 项目内跨 Agent 产物复用率

### 9.3 MVP 验收
- 一个项目内至少 2 个 Agent 能共享上下文工作
- 同一个输出文件可追溯到来源记忆和关键过程
- 管理者能看到统一 episode 视图而不是多个孤立界面
- 风险动作、访问行为和审批记录有完整证据链

## 10. 产品策略上的一句硬判断
如果这个系统最后只能把 memory 做得更强，那它不会形成企业级产品壁垒。

真正的壁垒是：
把上下文连续性、执行过程、输出产物和治理约束组织成同一个“可操作、可审计、可复盘”的工作图谱。
