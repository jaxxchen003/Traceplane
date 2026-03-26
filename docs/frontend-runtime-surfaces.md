# Frontend Runtime Surfaces

这份文档回答一个更具体的问题：

当 `Traceplane` 从 demo 进入正式产品阶段时，首页和管理台前端到底应该承载哪些“运行时状态”。

目标不是马上画视觉稿，而是先把：

- 页面真正要表达的状态
- 用户第一眼要看到的信号
- 云端工作平面和本地投影之间的关系

定义清楚。

## 1. 当前前端的阶段判断

当前 UI 已经有：

- `Episode-first` 首页
- `Project` 汇总页
- `Episode Review`
- `Artifact Detail`
- `Audit View`
- `Connect`

但这些页面目前更多还是：

- demo data
- demo control surface
- 接入能力展示

下一阶段要升级成：

**真正围绕云端 runtime 状态组织的管理前端**

而不是只是好看的 demo。

## 2. 首页必须承载的四类状态

### A. Attention State
这是首页第一优先级。

不是“有哪些任务”，而是：

- 哪些 `Episode` 需要人介入
- 哪些卡住了
- 哪些正在等待 review / approval
- 哪些刚发生了关键异常

这是当前首页已经有雏形，但后面要更明确的主层。

### B. Runtime Health State
首页和管理台都必须开始看到：

- 当前是否 `demo-local`
- 当前是否 `cloud-ready`
- 数据库当前是 `sqlite` 还是 `postgres`
- 对象存储是否已接上 `R2`
- 当前是否存在本地投影目录

也就是说，正式产品不能让用户只看业务，不看工作平面是否真的处于正确运行模式。

### C. Integration State
需要让用户直接看到：

- `Claude Code`
- `OpenCode`
- `Gemini CLI`

这些 host 当前分别支持到什么层级：

- `MCP`
- `Setup`
- `Capture`
- `Import`

并明确：

- 当前已连接几个 host
- 最近一次接入写入发生在哪个 host
- 哪些 host 只是配置了但还没开始产生 episode

### D. Local Projection State
因为正式产品已经明确是：

- 云端为 system of record
- 本地为工作区投影

所以前端必须能表达：

- 当前同步根目录是什么
- 最近投影了哪些 episode
- 哪些 artifact 已落地到本地
- 哪些内容仍只在云端

这层不是首页第一优先级，但在 manager surface 和 connect surface 里必须出现。

## 3. 首页推荐结构

### 3.1 Top Ribbon: Work Plane Status
这是新的顶部状态条，不是营销文案。

建议显示：

- `runtime_mode`
  - `demo-local` / `cloud-ready`
- `database_provider`
  - `sqlite` / `postgres`
- `database_source`
  - `DATABASE_URL` / `SUPABASE_DB_URL`
- `object_storage_provider`
  - `none` / `r2`
- `sync_root_path`
  - `~/Traceplane`
- `app_base_url`

这一栏的作用是：

**让 operator 和 manager 明确知道：当前看到的是不是正式工作平面，而不是演示模式。**

### 3.2 Hero: Episode Attention Model
这仍然是首页主舞台。

建议保留现在的四大区块：

- `Needs Attention`
- `Blocked / Risk`
- `Active Work`
- `Recent Activity`

但每个数字卡要更像 runtime dashboard，而不是只有描述文案。

建议补：

- waiting review count
- failed count
- policy hit count
- permission denied count

### 3.3 Runtime Signals Panel
新增一个右侧或次级区块，显示：

- 最近一次 R2 artifact write
- 最近一次 transcript import
- 最近一次 hook capture
- 最近一次 workspace projection

这块是“系统真的在工作”的证据。

### 3.4 Connected Hosts Panel
首页可以有一个轻量版，不必展开细节，只显示：

- `Claude Code`
- `OpenCode`
- `Gemini`

每个 host 卡片显示：

- status
- last seen
- latest episode count
- capture mode

### 3.5 Project Summary Strip
`Project` 仍然保留，但退居汇总层。

建议只显示：

- 当前活跃项目数
- 有风险项目数
- 最近有产出的项目数

而不是让首页重新掉回 project-first。

## 4. Project Overview 需要新增的状态

下一阶段的 `Project Overview` 不应只看：

- recent episodes
- recent artifacts
- risk summary

还应该能看：

### Project Runtime Posture
- 当前项目最近有哪些 host 写入过
- 当前项目最近是否有本地投影
- 当前项目 artifact 的云端存储覆盖率
- 当前项目 review/approval 压力

### Project Continuity Signals
- 多少 episode 是跨 host handoff
- 多少 artifact 被 downstream episode 复用
- 最近一次 `depends_on / reviews / supersedes`

这会让 `Project` 真正变成价值与连续性的汇总层。

## 5. Episode Review 需要新增的状态

`Episode Review` 仍是最关键页面。

但正式产品里要新增三组状态：

### A. Storage Status
- artifact 当前来自 inline / r2 / inline+r2
- trace 是否已落入本地 projection
- 当前 episode 是否已投影到 `~/Traceplane`

### B. Runtime Provenance
- 这个 episode 是来自：
  - MCP
  - hook capture
  - transcript import
  - local UI create

### C. Environment State
- 当前 episode 所属工作平面模式
- 使用了哪个 host
- 使用了哪类接入方式

这样一来，`Episode Review` 不只是业务复盘，也能解释：

**这条证据链是怎么进入系统的。**

## 6. Connect 页面要升级成什么

`Connect` 现在已经存在，但下一阶段应该从静态 onboarding 页，升级成：

**Host Runtime Console**

建议包含：

- host support matrix
- setup status
- verify status
- latest ingestion event
- latest imported episode
- latest projected workspace

也就是说，它不只是“怎么接”，而是：

**接了之后现在什么状态。**

## 7. 本地同步工作区在前端中的角色

不要把本地同步目录做成另一个文件浏览器。

前端只需要表达：

- 这个 episode 是否已投影
- 投影路径是什么
- 最近一次投影时间
- 当前有哪些 artifact 已同步到本地

本地文件真正的浏览和编辑行为，交给：

- Finder / 文件系统
- Agent runtime
- 本地 IDE

前端不需要重做一套坚果云。

## 8. 下一轮前端实现的优先顺序

### 第一优先级
首页加 `Work Plane Status`

### 第二优先级
`Episode Review` 加 `Storage / Provenance / Projection` 状态

### 第三优先级
`Connect` 升级成 host runtime console

### 第四优先级
`Project Overview` 增加 continuity/runtime summary

## 9. 当前结论

`Traceplane` 的下一阶段前端不该只是更好看，
而应该更明确地表达这件事：

**它不仅在管理 Episode，也在管理承载这些 Episode 的工作平面。**
