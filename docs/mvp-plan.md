# MVP Plan

这份文档回答四个问题：

- MVP 到底做什么
- MVP 按什么逻辑实现
- MVP 怎么分阶段推进
- 最终第一版交付出来的产品形态是什么

## 1. MVP 的一句话

做一个面向企业多 Agent 协作场景的最小工作控制平面，让多个 Agent 围绕同一条 `episode` 主线共享上下文、过程和产物，并让管理者能查看、审计和复盘。

## 2. MVP 的最小价值证明

MVP 不是为了证明“我们能存数据”，而是为了证明下面这条链路成立：

1. 两个 Agent 在同一个 `project` 下工作
2. 它们共享同一条任务主线上的 context 和部分产物
3. 每一步关键动作都被记录为 trace 和 audit
4. 最终 artifact 能回链到来源 memory 和关键过程
5. 管理者能在统一视图中完成复盘
6. 外部 Agent 能通过 MCP 把工作沉淀进这条主线

如果这五点能跑通，MVP 就有成立基础。

## 3. MVP 的实现逻辑

### 3.1 系统的最小闭环
MVP 的实现逻辑不是“先做完整平台”，而是先做一条闭环主线：

`Project -> Episode -> Memory -> Trace -> Artifact -> Audit -> Graph View`

也就是说：

- `Project` 提供协作边界
- `Episode` 提供任务主线
- `Memory` 提供输入上下文
- `Trace` 提供执行过程
- `Artifact` 提供输出结果
- `Audit` 提供治理证据
- `Graph View` 提供统一复盘入口

### 3.2 第一版最重要的产品策略
第一阶段不是做完整自有 Agent runtime，而是做 `BYO Agent` 的工作证据链。

也就是说：

- 用户继续使用已有 Agent
- 我们提供统一 `Episode` 主线
- 通过 `MCP` 和 adapter 把工作沉淀进来
- 正式产品存储优先放在云端，本地只做同步工作区和文件投影

### 3.3 第一版最重要的用户流
建议 MVP 围绕一个固定场景打通，而不是做泛化平台。

**推荐 demo 场景**
- 一个项目里有 `Research Agent` 和 `Writer Agent`
- `Research Agent` 读取项目背景，生成研究结论
- `Writer Agent` 读取研究结论和部分 trace，生成汇报文档
- 管理者查看这次 episode 的 timeline、来源记忆、最终产物和访问记录

这个场景足够小，但已经覆盖：
- 多 Agent 共享
- 输入到输出的回链
- 管理者复盘
- 权限与审计占位

### 3.4 第一版技术实现顺序
推荐顺序不是先做所有入口，而是先把数据主线做对。

1. 先实现核心 schema
2. 再实现核心写入 API
3. 再实现 graph 查询
4. 再补权限和审计检查
5. 再接 MCP v1
6. 最后打磨 CLI / demo 界面

原因很简单：
- 如果 schema 不稳，后面所有接口都会反复改
- 如果 graph query 不成立，就无法证明产品差异化
- 如果先做 UI，会把团队拉向展示层而不是产品核心

## 4. MVP 范围

### 4.1 In Scope
- Workspace / Project / Agent / Episode 基础对象
- Episode 创建字段、状态和关系模型
- Memory 的写入、检索、低信任蒸馏占位
- Trace 的追加写入和 timeline 查询
- Artifact 的创建、版本记录、来源回链
- Policy version 记录
- Project / Episode 级权限控制
- Audit 事件写入和检索
- `query_context`
- `get_episode_brief`
- 最小 manager 视图或 manager summary
- 第一版 MCP v1
- 云端优先的数据平面设计
- 本地工作区投影 / sync 设计占位

### 4.2 Out of Scope
- 通用办公套件
- 复杂图谱可视化
- Node 级精细授权
- 完整审批流引擎
- 完整私有部署产品
- 全量 E2EE
- 高级自动记忆蒸馏
- 多项目跨图谱分析
- 完整自有 Agent runtime

## 5. MVP 的核心接口

MVP 先围绕 8 个 MCP / API 动作构建：

- `create_episode`
- `update_episode_status`
- `link_episode`
- `write_memory`
- `append_trace`
- `create_artifact`
- `query_context`
- `get_episode_brief`

### 5.1 实际上最关键的 3 个接口
如果要判断产品是否有独特性，最关键的是：

- `append_trace`
- `create_artifact`
- `get_episode_brief`

原因是：
- `write_memory` 很容易退化成普通 memory layer
- 只有当 trace、artifact 和 graph 连起来，才体现“工作图谱”的差异

## 6. MVP 的数据与权限策略

### 6.1 当前默认策略
- `Episode` 是主索引
- 所有 Memory / Trace / Artifact 都必须归属于 `Episode`
- 权限先做到 Workspace / Project / Episode
- Node 级授权只预留 schema
- 审计默认记录关键读写和权限拒绝
- 关系推断默认采用 `auto / assisted / manual` 分层

### 6.2 为什么这样收敛
- 这是能同时兼顾可实现性和企业价值的最小平衡点
- 太早做 Node 级权限，会把项目拖进复杂 ACL 系统
- 太早做完整审批流，会把项目拖进流程引擎
- 太早做复杂 UI，会掩盖产品其实还没跑通主链路

## 7. MVP 路线图

### Phase 0: 定义期
目标：把产品定义、核心对象和默认决策固定下来。

交付：
- Product Spec
- Architecture
- Discussion Insights
- Open Questions / 默认决策
- MVP Plan

完成标志：
- 团队对“这不是 memory API，而是 enterprise work graph”达成一致

### Phase 1: Data Skeleton
目标：把最小数据骨架和事件链路建立起来。

交付：
- 数据表 / migration
- 基础 fixtures
- 核心对象创建逻辑
- `node_edges` 关系写入

完成标志：
- 一条 demo episode 可以完整落库

### Phase 2: Core Write Path
目标：打通写入主链路。

交付：
- `create_episode`
- `update_episode_status`
- `link_episode`
- `write_memory`
- `append_trace`
- `create_artifact`
- 基础 audit 写入

完成标志：
- 一个 Agent 可以完成从输入到输出的完整写入

### Phase 3: Shared Work Graph
目标：证明这是“多 Agent 工作图谱 + MCP 接入层”，不是单 Agent 存储层。

交付：
- `query_context`
- `get_episode_brief`
- MCP v1 server / adapter skeleton
- 第二个 Agent 消费第一个 Agent 的 memory / artifact
- Project / Episode 级权限检查

完成标志：
- 两个 Agent 可以在同一条任务主线上共享工作

### Phase 4: Manager View
目标：把企业价值表达出来。

交付：
- manager summary
- timeline 复盘
- artifact 来源回链展示
- audit 查询

完成标志：
- 管理者可以在不进入聊天窗口的情况下完成任务复盘

### Phase 5: Access Layer
目标：把系统变成可接入产品，而不是内部模型或孤立 demo。

交付：
- HTTP API
- MCP 接入
- onboarding skill / playbook skeleton
- CLI 或 demo harness

完成标志：
- 外部 Agent 可以稳定接入并写入统一数据平面

### Phase 6: Cloud + Sync
目标：从 demo runtime 过渡到正式产品的数据形态。

交付：
- Postgres + Object Storage 的云端主存储
- Local Workspace Projection 原型
- 云端到本地的 artifact / trace 投影
- 本地变更回写的最小同步链路

完成标志：
- 系统权威数据在云端
- 本地目录只作为工作副本和同步视图

## 8. 最终第一版产品形态

MVP 最终不应该表现成“大而全平台”，而应该是一个三层产品。

### 8.1 Agent Access Surface
这是给 Agent 和开发者用的接入层：

- HTTP API
- MCP Server
- CLI / SDK
- onboarding skill / role templates

它的价值是：
- 低摩擦接入
- 标准化写入
- 可调试、可扩展

### 8.2 Shared Work Graph
这是产品核心，不一定一开始有很复杂的 UI，但一定要有统一视图能力：

- episode 基础信息
- memory 节点
- trace timeline
- artifact 节点
- 节点间边关系
- policy / access / audit 摘要

这是“产品内核”，不是装饰层。

### 8.3 Manager Control Surface
这是给管理者和平台团队看的控制面：

- 项目视图
- 任务复盘
- 风险动作和权限拒绝
- 生效策略版本
- 访问审计

MVP 阶段它可以很轻，但不能缺席。

## 9. 第一版 demo 应该长什么样

如果第一版做得对，最终用户看到的不是一个泛化网盘，而是下面这个形态：

### 对 Agent / 开发者
- 可以通过 API / MCP 创建 episode
- 可以把 memory、trace、artifact 写进系统
- 可以查询当前工作的上下文和某个 episode 的管理摘要

### 对管理者
- 可以看到需要关注的 episodes
- 点开一个 episode，看到 timeline、产物、来源和审计摘要
- 能知道哪个 Agent 读取了什么、产出了什么、有没有命中策略

### 对团队
- 能证明多个 Agent 不是在孤立工作，而是在共享同一条数据主线

## 10. 第一版最理想的交付物

如果按最务实的方式交付，MVP 最后应该至少包含：

- 一套稳定 schema
- 一组核心 API
- 一个 MCP 或 CLI 接入方式
- 一个 manager summary / episode review demo
- 一个标准化演示场景

## 11. 当前最值得坚持的产品纪律

- 不把 memory 做成产品全部
- 不把 UI 当作产品进度
- 不为了“企业级”三个字过早堆复杂权限和审批
- 不退化回泛化 workspace
- 不偏离“多 Agent 共享工作主线”这个最小证明目标

## 12. 一句话总结

MVP 的任务不是做一个完整企业平台。

MVP 的任务是证明：
我们可以把多个 Agent 的上下文、执行过程、输出产物和治理证据，组织成一条企业可管理、可复盘的工作图谱。
