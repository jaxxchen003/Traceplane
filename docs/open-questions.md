# Open Questions

这份文档不再泛泛记录“还有哪些问题”，而是专门列出会影响 MVP 边界、schema 设计和接口抽象的决策项。

目标是把未决问题压成一份可拍板清单。

## 0. 当前默认决策

下面这组默认值，作为当前项目继续推进的基线设定。

1. `Episode` 按“单次完整任务链路”定义，MVP 不做嵌套，只预留 `parent_episode_id`
2. Agent 采用“注册实体 + 运行 session / run”双层模型
3. Permission 在 MVP 先做到 Workspace / Project / Episode，Node 级只做 schema 预留
4. Policy 在 MVP 采用结构化 JSON，强制记录 `policy_version` 和 `hit_reason`
5. `list_episode_graph` 采用“节点 + 边 + timeline 摘要”的混合返回结构
6. Memory 允许显式写入和自动蒸馏，但自动蒸馏默认低信任
7. Artifact 采用 append-only 版本历史
8. 审批先做事件模型和状态字段，不做完整审批引擎
9. 运行形态可以是单租户 demo，但 schema 按多租户设计

如果后续没有明确推翻，这些默认值就是当前项目的工作基准。

## 1. 先拍板的 5 个问题

这 5 个问题最影响 MVP，如果不先定，后面的 schema、API、demo 都会反复改。

### 1.1 Episode 的粒度
**要决定什么**
- `episode` 是一次用户请求，还是一条完整任务链路
- 是否允许 parent-child episode

**建议默认值**
- 先定义为“单次完整任务链路”
- MVP 不做嵌套，只预留 `parent_episode_id`

**为什么先这样定**
- 如果把 episode 定得太细，会退化成聊天消息容器
- 如果一开始做嵌套，schema 和查询会明显变复杂
- 当前产品的核心是把输入、过程、输出挂在同一主线上，任务链路比单次消息更合适

**推迟代价**
- `memory_items`、`trace_events`、`artifacts` 的归属关系会反复变
- `list_episode_graph` 的返回结构无法稳定

### 1.2 Agent 身份模型
**要决定什么**
- Agent 是固定注册实体，还是临时运行实例
- 同一 Agent 在不同 project 下如何标识

**建议默认值**
- 采用“注册 Agent + 运行 session”双层模型
- `agent_id` 表示长期身份，运行态用 `agent_run_id` 或 `session_id`

**为什么先这样定**
- 企业管理和审计需要稳定主体
- 运行日志又必须区分同一个 Agent 的不同执行实例

**推迟代价**
- 审计、权限、trace 归因会混乱
- 后面补 session 层通常要改表结构

### 1.3 Permission 的 MVP 粒度
**要决定什么**
- 权限做到 Project / Episode 级，还是 Node 级一步到位
- `shared_with` 是真实授权能力，还是图谱上的语义描述

**建议默认值**
- MVP 先做 Workspace / Project / Episode 三级权限
- Node 级授权只做 schema 预留
- `shared_with` 先视为关系表达，不单独成为授权真源

**为什么先这样定**
- Node 级授权是对的，但太早做会显著拖慢 MVP
- 先把“能管住 episode 级共享”跑通，更接近第一阶段价值验证

**推迟代价**
- 如果完全不预留 Node 级，会影响后续精细授权扩展
- 但如果现在就做 Node 级，MVP 极容易失控

### 1.4 Policy 的表达形式
**要决定什么**
- 策略是结构化 JSON，还是半结构化文本 + tags
- 策略命中是否返回可解释原因

**建议默认值**
- MVP 使用结构化 JSON 规则
- 每次命中保留 `policy_version` 和 `hit_reason`

**为什么先这样定**
- 结构化规则更容易在 API、trace、audit 中落地
- 没有 `hit_reason`，后续管理者就很难复盘“为什么被拦住”

**推迟代价**
- 一旦先用自由文本，后面很容易出现不可机读、不可审计的问题

### 1.5 Graph Query 的交付形式
**要决定什么**
- `list_episode_graph` 返回扁平节点边列表，还是 timeline 混合视图
- 是否需要 manager summary

**建议默认值**
- 先返回“节点 + 边 + timeline 摘要”的混合结构
- manager summary 不单独做接口，先作为响应中的 summary 字段

**为什么先这样定**
- 纯节点边列表对人不友好
- 纯 timeline 又会丢掉图关系表达

**推迟代价**
- 没有统一返回形态，后面 demo 和控制面都无法稳定开发

## 2. 第二批要定的问题

这些问题不一定阻塞立项，但会影响 Phase 1 到 Phase 2 的边界。

### 2.1 Memory 的写入来源
**问题**
- 只允许显式写入，还是允许从 trace / chat 自动蒸馏
- 自动蒸馏是否需要低信任标记

**当前建议**
- MVP 同时支持显式写入和自动蒸馏
- 自动蒸馏默认打上 `source=distilled` 和低信任标记

### 2.2 Artifact 版本策略
**问题**
- 每次覆盖都生成新版本，还是显式发布才生成版本
- 如何区分“当前版本”和“历史版本”

**当前建议**
- MVP 采用 append-only 版本策略
- 每次写入都是新版本，`current_version` 通过指针或状态字段标识

### 2.3 审批工作流
**问题**
- 审批只记结果，还是要完整生命周期
- 审批是同步阻断还是异步挂起

**当前建议**
- MVP 只做审批事件模型和状态字段
- 不做完整工作流引擎
- 高风险动作先支持 `pending / approved / rejected`

### 2.4 多租户与部署
**问题**
- MVP 是单租户 demo，还是一开始就按多租户 schema 设计
- 私有部署预留做到哪一层

**当前建议**
- 演示可以单租户运行
- schema 必须按多租户设计
- 私有部署先做到字段和存储抽象预留，不做完整产品化

## 3. 暂时不要过早决定的问题

这些问题重要，但不应该在当前阶段消耗太多设计精力。

### 3.1 Developer-first 还是 Manager-first
当前更合理的理解不是二选一，而是：
- 底层接入偏 developer-first
- 上层价值展示偏 manager-first

### 3.2 MCP / CLI / HTTP API 的顺序
当前不必绝对绑定单一路径，先保持：
- schema 和核心 API 抽象独立
- 入口层后定顺序

### 3.3 Obsidian / Notion 的关系
当前不必把它们定义成竞品或主渠道，先按：
- 非替代品
- 可作为输入和分发入口

## 4. 推荐的默认决策集

如果你想快速进入下一步，这里是一套建议直接采用的默认值：

1. `Episode` = 单次完整任务链路，MVP 不做嵌套
2. Agent = 注册实体；执行实例 = session / run
3. Permission = 先做到 Workspace / Project / Episode，Node 级只预留
4. Policy = 结构化 JSON + `policy_version` + `hit_reason`
5. Graph Query = 节点、边、timeline 摘要混合返回
6. Memory = 支持显式写入和自动蒸馏，但自动蒸馏低信任
7. Artifact = append-only 版本历史
8. 审批 = 先做状态模型，不做完整审批引擎
9. 部署 = 运行可单租户，schema 必须多租户

## 5. 拍板顺序建议

如果你下一轮只想决定最关键的内容，建议按这个顺序来：

1. `Episode` 粒度
2. Agent 身份模型
3. Permission 粒度
4. Policy 表达形式
5. `list_episode_graph` 返回结构

这五项一旦定下来，后面的 schema、API 和 demo 路径基本就能稳定。
