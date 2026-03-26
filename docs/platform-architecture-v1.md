# Platform Architecture v1

## 目标
为 `Enterprise Agent Work Graph` 定义一个适合当前产品方向的默认底层架构。

这个架构必须满足三件事：

- 支撑 `memory + trace + artifact + graph + audit`
- 保持企业级控制权，不把核心数据平面锁死在第三方 runtime 上
- 允许未来接入 agent-native backend，例如 `db9`
- 正式产品默认云端优先，同时允许本地同步工作区做文件投影与离线缓存

## 核心判断

### 我们不是什么
- 不是 agent database
- 不是 memory API
- 不是 object storage 产品

### 我们是什么
- 企业级 Agent 工作图谱
- 面向管理、治理、追踪与复盘的上层系统
- 建立在底层数据平面之上的 control plane + graph plane

因此，底层存储和运行时很重要，但不是产品核心本身。

## 默认架构

### 1. Metadata Plane: Postgres
默认使用 `Postgres` 作为系统主数据库。

存储对象：
- `workspaces`
- `projects`
- `agents`
- `episodes`
- `memory_items`
- `trace_events`
- `artifacts`
- `policies`
- `access_grants`
- `audit_events`
- `node_edges`

Postgres 负责：
- 主业务对象
- 关系查询
- graph 边表
- 权限元数据
- 审计元数据
- artifact 与原始文件的映射

### 2. Blob Plane: Object Storage
默认使用对象存储保存大体积或非结构化内容。

典型内容：
- Markdown / HTML / SVG / PDF
- CSV / JSON / JSONL
- trace 原始日志
- screenshot / image
- snapshot / transcript

对象存储负责：
- artifact 正文
- trace blob
- raw context
- 大文件版本

### 2.5 Sync Plane: Local Workspace Projection
正式产品不应把本地目录当成主存储，而应把它当成：

- 本地缓存
- 文件投影
- agent 可直接读写的工作区镜像
- 离线查看和局部编辑层

推荐模式：

- 云端是 `system of record`
- 本地是 `working copy`

这更接近：

- 坚果云 / Dropbox 的同步工作区
- 但同步对象不是泛文件夹，而是带 `project / episode / artifact / trace` 语义的工作命名空间

本地同步层负责：

- 把云端 artifact 映射到本地目录
- 把 trace / snapshot / transcript 投影成本地文件
- 监听本地新增或修改并回写云端
- 处理冲突、版本和最近一次同步状态

### 3. Retrieval Plane: Vector Layer
默认将向量检索设计为可替换层。

第一版优先顺序：
1. `pgvector`
2. 外部向量服务适配器

这个层仅服务于：
- memory semantic search
- artifact content retrieval
- trace distillation recall

### 4. Async Plane: Queue + Workers
异步能力不应耦合在主请求链路里。

异步任务包括：
- embedding 生成
- memory distillation
- archive / TTL cleanup
- risk scoring
- artifact indexing
- graph summary generation

### 5. Governance Plane: Application Layer
这是产品核心，必须由我们自己控制。

负责：
- policy evaluation
- permission enforcement
- audit generation
- episode graph assembly
- manager review summaries
- node / edge readable explanations

## 设计原则

### 表和文件分层
借鉴 `db9` 的优点，但不依赖 `db9` 本身：

- structured state in tables
- raw context and outputs in files

对我们来说，对应为：
- 表：状态、索引、关系、授权、审计
- 文件：正文、快照、日志、产物、原始上下文

### Episode 是行，也是命名空间
每个 `episode` 既是一条数据库记录，也是一段稳定的存储路径空间。

推荐路径约定：

```txt
/workspaces/{workspace_id}/projects/{project_id}/episodes/{episode_id}/
  memory/
  trace/
  artifacts/
  snapshots/
```

这样做的价值：
- agent 侧路径直观
- manager 侧图谱稳定
- artifact / trace / audit 更容易回链
- 云端与本地同步层都能围绕同一命名空间工作

### Graph 在应用层，而不是数据库品牌层
我们不把“图谱能力”外包给某种底层数据库叙事。

当前默认做法：
- 用主表 + `node_edges`
- 在应用层组装 episode graph
- 后续再判断是否需要专门图数据库

### 治理优先于底层炫技
企业采购更在意：
- 谁访问了什么
- 哪个 policy 生效
- 哪个 artifact 由什么生成
- 哪条链路出了问题

这些都必须由我们在应用层定义，而不是寄希望于底层 runtime 自动提供。

## 为什么不直接押注 db9

## 1. 层级不对
`db9` 是 agent-native storage/runtime。  
我们是 enterprise work graph + governance product。

## 2. 多租户原语不完全匹配
`db9` 更偏 `database-per-*`。  
我们需要统一的 `workspace/project/episode` 管理视图。

## 3. 企业控制权风险
后续很可能会遇到：
- 私有化部署
- 数据驻留
- 更复杂 IAM
- 企业审计要求

如果一开始就把核心数据平面建立在第三方专有 runtime 之上，迁移成本会很高。

## 4. 护城河不在底层 database runtime
我们的核心不在：
- 内建 vector
- 内建 fs
- SQL 内建 HTTP

而在：
- episode spine
- work graph model
- policy / permission / audit
- manager-readable workflow governance

## 我们应该吸收 db9 的什么

### 1. Memory in tables, context in files
这是正确方向，应当成为我们的默认设计。

### 2. Outputs in files, history in Postgres
artifact 正文与 artifact 元数据要彻底分离。

### 3. Agent-native path model
episode 对应稳定路径命名空间，方便 agent 与系统协作。

### 4. Branch / snapshot 思维
高风险 agent 执行需要可预演、可丢弃、可审批的副本机制。

### 5. Async primitives as product defaults
embedding、distill、archive 不应该是后补脚本。

## v1 默认技术选择

### 当前建议
- `Postgres`：主元数据与关系层
- `Object Storage`：artifact 和 raw blob
- `pgvector`：默认语义检索
- `Queue + Worker`：异步任务
- `Sync Agent / Local Projection Service`：本地工作区同步
- `Next.js / API layer`：产品与控制层

### 当前不建议
- 把底层直接绑定在 `db9`
- 把 multi-tenant 设计成 `database-per-episode`
- 把 graph model 下沉成“数据库能力问题”

## 长期演进

### Phase A
默认栈跑通可管理的 work graph

### Phase B
引入 snapshot / branch abstraction

### Phase C
把存储运行时抽象成 adapter interface

### Phase D
按场景选择是否支持 `db9 runtime`

## 最终结论
当前产品阶段应采用：

**自建底层架构 + 吸收 db9 的设计优点 + 为未来 adapter 留口**

而不是：

**直接把 db9 当作唯一底层引擎**
