     1|# Traceplane
     2|
     3|> Multi-Agent Continuity Layer
     4|
     5|## 项目一句话
     6|让多个 Agent 的工作接成一条不断档、可回看、可交接的工作主线。
     7|
     8|## 这是什么
     9|这不是单点 Agent memory，也不是网盘、聊天前端或通用 workspace。
    10|
    11|它当前第一层要解决的是多 Agent 实践者最常遇到的三个问题：
    12|
    13|- 同样的背景信息，要反复讲给不同 Agent
    14|- 一个 Agent 做到一半，另一个 Agent 很难无缝接上
    15|- 做过的工作散落在聊天、日志和文件里，回看很痛苦
    16|
    17|## 核心判断
    18|- 第一层先卖 continuity，不先卖治理。
    19|- Memory、Trace、Artifact 必须挂在同一条任务主线上，否则只是三个存储桶。
    20|- `Episode` 是系统主索引，不是附件字段。
    21|- 默认产品视角应该是 `Episode-first`，`Project` 负责归属和汇总。
    22|- 第一层最重要的产物不是图谱，而是 handoff brief。
    23|
    24|## MVP 聚焦
    25|MVP 第一层只做一件事：跑通多 Agent continuity 的最小闭环。
    26|
    27|1. Agent 创建 `episode`
    28|2. 自动沉淀关键 `memory / trace / artifact`
    29|3. 生成可交接的 `episode brief`
    30|4. 下一个 Agent 直接基于 brief 和上下文继续工作
    31|5. 用户可以回看这条工作主线，而不是重新解释
    32|
    33|## 当前交付
    34|当前仓库已经包含一个可本地运行的 MVP：
    35|
    36|- Next.js 全栈应用
    37|- Prisma + SQLite 本地数据层
    38|- 中英文切换
    39|- 6 个核心页面
    40|- 13 个基础 API 路由
    41|- 一套可演示的 seeded demo 数据
    42|- 项目页与 Episode 页内嵌交互式写入控制面
    43|
    44|当前代码仍然是 demo runtime：
    45|
    46|- `Next.js`
    47|- `Prisma`
    48|- `SQLite`
    49|
    50|目标生产架构则是：
    51|
    52|- `Postgres`
    53|- `Object Storage`
    54|- `Vector Layer`
    55|- `Queue / Workers`
    56|
    57|
## 🚀 新增核心功能：手术级调试 (Surgical Replay)
Traceplane 已从简单的记录仪进化为 Agent 调试操作系统。
- **版本树架构 (Version Tree)**: 支持 Episode Forking，允许从任意 Trace 节点分叉出新的执行路径。
- **状态快照 (State Snapshots)**: 每次 Trace 自动捕捉 Global State，记录 Agent 的“意识状态”。
- **智能状态 Diff**: 可视化对比两个节点间的状态变更，瞬间定位“状态漂移”故障点。
- **分叉重放 (Surgical Replay)**: 在 UI 中修改历史节点输入 $ightarrow$ 一键 Fork $ightarrow$ 瞬时验证修正结果，无需全量重启。


## 本地运行
    58|```bash
    59|npm install
    60|cp .env.example .env
    61|npm run db:setup
    62|npm run dev
    63|```
    64|
    65|默认入口：
    66|- `http://localhost:3000/zh`
    67|- `http://localhost:3000/en`
    68|
    69|## 当前 MVP 页面
    70|- `/{locale}`: Episode Continuity Home
    71|- `/{locale}/projects`: 项目列表
    72|- `/{locale}/projects/{projectId}`: 项目总览
    73|- `/{locale}/projects/{projectId}/episodes/{episodeId}`: Episode 复盘
    74|- `/{locale}/artifacts/{artifactId}`: Artifact 详情
    75|- `/{locale}/audit`: 审计视图
    76|
    77|## 当前 MVP API
    78|- `POST /api/episodes`
    79|- `POST /api/episodes/status`
    80|- `POST /api/episodes/link`
    81|- `GET /api/episodes/brief?episodeId=...&locale=zh|en`
    82|- `POST /api/memory`
    83|- `GET /api/memory`
    84|- `POST /api/traces`
    85|- `POST /api/artifacts`
    86|- `POST /api/context`
    87|- `GET /api/graph?episodeId=...&locale=zh|en`
    88|- `POST /api/access`
    89|- `GET /api/audit?projectId=...&episodeId=...&locale=zh|en`
    90|- `GET /api/health`
    91|
    92|## 当前 MCP Server
    93|仓库现在已经包含一个可运行的 stdio MCP server，暴露 8 个 v1 工具，目标是让主流 Agent 在不改变工作方式的前提下把工作主线沉淀进 Traceplane：
    94|
    95|- `create_episode`
    96|- `update_episode_status`
    97|- `link_episode`
    98|- `write_memory`
    99|- `append_trace`
   100|- `create_artifact`
   101|- `query_context`
   102|- `get_episode_brief`
   103|
   104|## Host Adoption Matrix
   105|
   106|当前接入层分成 4 个成熟度等级：
   107|
   108|- `MCP`: 能读取和写入 Traceplane 的工作主线
   109|- `Setup`: 有一键配置和环境校验
   110|- `Capture`: 能把 host 的真实运行事件带回 Episode
   111|- `Import`: 能把历史 transcript / export 导入 Traceplane
   112|
   113|| Host | MCP | Setup | Capture | Import | 当前状态 |
   114||---|---|---|---|---|---|
   115|| Claude Code | Yes | Yes | Yes | Planned | 第一优先接入，已具备 hooks bridge |
   116|| OpenCode | Yes | Yes | Partial | Yes | 实时接入 + export 标准化都可用 |
   117|| Gemini CLI | Yes | Yes | Planned | Planned | 已有 quickstart、setup、verify 和 MCP config |
   118|| Codex | Planned | Planned | Planned | Planned | 当前先保留 MCP-first 策略 |
   119|| OpenClaw | Planned | Planned | Planned | Planned | 更适合作为 session/runtime 级接入 |
   120|
   121|更详细的分层说明见：
   122|- [mcp-host-setup.md](/Users/jaxxchen/projects/enterprise-agent-work-graph/docs/mcp-host-setup.md)
   123|- [agent-integration-strategy.md](/Users/jaxxchen/projects/enterprise-agent-work-graph/docs/agent-integration-strategy.md)
   124|- [host-adoption-matrix.md](/Users/jaxxchen/projects/enterprise-agent-work-graph/docs/host-adoption-matrix.md)
   125|
   126|本地启动：
   127|
   128|```bash
   129|npm run mcp:start
   130|```
   131|
   132|本地自测：
   133|
   134|```bash
   135|npm run mcp:test
   136|```
   137|
   138|生成 host 配置：
   139|
   140|```bash
   141|npm run mcp:host -- claude-code
   142|npm run mcp:host -- opencode
   143|npm run mcp:host -- gemini
   144|```
   145|
   146|如需直接写入文件：
   147|
   148|```bash
   149|npm run mcp:host -- claude-code .mcp.json
   150|npm run mcp:host -- gemini .gemini/settings.json
   151|```
   152|
   153|导入标准化 transcript：
   154|
   155|```bash
   156|npm run import:transcript -- examples/imports/normalized-episode.json
   157|```
   158|
   159|把 OpenCode export 转成标准化 transcript：
   160|
   161|```bash
   162|npm run normalize:opencode -- \
   163|  examples/imports/opencode-export.json \
   164|  q2-customer-pulse \
   165|  research-agent \
   166|  .tmp/opencode-normalized.json
   167|```
   168|
   169|运行 Claude hook bridge 自测：
   170|
   171|```bash
   172|npm run claude:hook:test
   173|```
   174|
   175|一键生成 Claude 项目配置：
   176|
   177|```bash
   178|npm run claude:setup -- q2-customer-pulse research-agent
   179|```
   180|
   181|它会生成：
   182|
   183|- `.mcp.json`
   184|- `.claude/settings.json`
   185|
   186|验证 Claude 配置：
   187|
   188|```bash
   189|npm run claude:verify
   190|```
   191|
   192|一键生成 OpenCode 项目配置：
   193|
   194|```bash
   195|npm run opencode:setup
   196|```
   197|
   198|验证 OpenCode 配置：
   199|
   200|```bash
   201|npm run opencode:verify
   202|```
   203|
   204|一键生成 Gemini 项目配置：
   205|
   206|```bash
   207|npm run gemini:setup
   208|```
   209|
   210|验证 Gemini 配置：
   211|
   212|```bash
   213|npm run gemini:verify
   214|```
   215|
   216|Claude Code hooks 示例配置：
   217|
   218|- [examples/hooks/claude/settings.json](/Users/jaxxchen/projects/enterprise-agent-work-graph/examples/hooks/claude/settings.json)
   219|
   220|## 环境变量
   221|- `DATABASE_URL`: Prisma 数据库连接。默认本地示例为 `file:./dev.db`
   222|- `NEXT_PUBLIC_DEFAULT_LOCALE`: 默认语言，当前示例为 `zh`
   223|- `DEMO_RESET_ENABLED`: 仅用于 demo 容器首次启动或强制重置时自动重建 demo 数据
   224|- `SUPABASE_PROJECT_URL`: 云端工作平面的 Supabase 项目地址
   225|- `SUPABASE_SECRET_KEY`: 仅后端使用的 Supabase 服务密钥
   226|- `R2_BUCKET / R2_ENDPOINT / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY`: 云端 artifact/blob 存储
   227|- `APP_BASE_URL`: 对外服务地址，建议使用完整 `https://...`
   228|- `DEFAULT_REGION`: 当前默认可写成 `global-us-cn`
   229|- `SYNC_ROOT_PATH`: 本地同步工作区目录，建议统一成 `~/Traceplane`
   230|
   231|可直接从 `.env.example` 复制一份：
   232|```bash
   233|cp .env.example .env
   234|```
   235|
   236|如果要从本地 demo 过渡到正式云端准备，先看：
   237|- [cloud-sync-architecture.md](/Users/jaxxchen/projects/enterprise-agent-work-graph/docs/cloud-sync-architecture.md)
   238|- [cloud-setup-checklist.md](/Users/jaxxchen/projects/enterprise-agent-work-graph/docs/cloud-setup-checklist.md)
   239|
   240|验证云端准备度：
   241|```bash
   242|npm run cloud:verify
   243|npm run cloud:verify:supabase
   244|npm run cloud:verify:r2
   245|```
   246|
   247|把云端 Postgres schema 推到 Supabase：
   248|```bash
   249|npm run db:cloud:push
   250|```
   251|
   252|把某个 Episode 投影到本地同步工作区：
   253|```bash
   254|npm run workspace:sync -- <episodeId> zh
   255|```
   256|
   257|默认会写到：
   258|- `~/Traceplane/{workspace}/{project}/{episode}/...`
   259|
   260|进一步的切库路径见：
   261|- [postgres-cutover-plan.md](/Users/jaxxchen/projects/enterprise-agent-work-graph/docs/postgres-cutover-plan.md)
   262|
   263|健康检查接口现在会返回当前 runtime 是否已经 `cloud-ready`：
   264|
   265|```bash
   266|curl -sS http://127.0.0.1:3000/api/health
   267|```
   268|
   269|另外还可以直接跑两条云端校验脚本：
   270|
   271|```bash
   272|npm run cloud:verify
   273|npm run cloud:verify:supabase
   274|npm run cloud:verify:r2
   275|```
   276|
   277|## Docker 运行
   278|```bash
   279|docker build -t enterprise-agent-work-graph .
   280|docker run --rm -p 3000:3000 --env-file .env enterprise-agent-work-graph
   281|```
   282|
   283|容器默认会在 SQLite 文件不存在时自动执行：
   284|- `prisma db push`
   285|- `node prisma/seed.mjs`
   286|
   287|然后启动应用。
   288|
   289|## 持续集成
   290|仓库已包含 GitHub Actions CI：
   291|- `npm ci`
   292|- `npm run db:generate`
   293|- `npm run lint`
   294|- `npm run build`
   295|
   296|工作流文件位于 `.github/workflows/ci.yml`。
   297|
   298|## 产品边界
   299|做：
   300|- 多 Agent continuity / handoff
   301|- 自动 Episode brief
   302|- Episode 级任务链路追踪
   303|- Artifact 来源可回链
   304|- 本地工作区投影
   305|
   306|不做：
   307|- 完整 Web 办公套件
   308|- 通用 IM
   309|- 替代 Notion / Obsidian / 企业网盘
   310|- 复杂 BI 仪表盘
   311|- MVP 阶段完整私有化产品
   312|
   313|## 仓库结构
   314|- `docs/product-spec.md`: 产品定义、场景、范围、验收标准
   315|- `docs/architecture.md`: 对象模型、关系模型、数据流、存储抽象、API
   316|- `docs/episode-model.md`: `Project` / `Episode` 分工、Episode 边界、状态、创建字段
   317|- `docs/episode-relations.md`: Episode 关系类型、推断原则、自动化默认策略
   318|- `docs/agent-integration-strategy.md`: 主流 Agent 接入策略、MCP-first 路线、BYO Agent 到 managed runtime 的演进
   319|- `docs/mcp-spec-v1.md`: 第一版 MCP 工具范围与字段定义
   320|- `docs/continuity-tier.md`: 第一层 continuity 产品的核心价值、边界、北极星和升级钩子
   321|- `docs/mcp-host-setup.md`: Claude Code、OpenCode、Gemini CLI 的 MCP 接入模板
   322|- `docs/claude-quickstart.md`: Claude Code 的最小试跑路径和首条 Episode 验证标准
   323|- `docs/opencode-quickstart.md`: OpenCode 的最小试跑路径，以及 export/import 双路径说明
   324|- `examples/hooks/claude/`: Claude Code hooks 示例配置
   325|- `docs/onboarding-skill.md`: onboarding skill 的职责、结构和边界
   326|- `docs/demo-workflow.md`: 对外演示用的最小多 Agent 工作链路
   327|- `docs/transcript-import.md`: 标准化 transcript / session 导入层，定义 host export 如何落成统一 episode package
   328|- `docs/platform-architecture-v1.md`: 平台级底层架构判断，明确为什么默认自建而不是直接押注 db9
   329|- `docs/storage-runtime-interface.md`: 存储运行时接口边界，定义未来如何支持可替换 backend
   330|- `docs/mvp-plan.md`: MVP 的实现逻辑、范围、路线图和最终产品形态
   331|- `docs/product-surface.md`: 第一版产品的页面、视图、交互和 demo 形态
   332|- `docs/page-specs.md`: 第一版 5 个核心页面的字段级规格
   333|- `docs/brand-options.md`: 对外产品命名备选，以及当前推荐名
   334|- `docs/discussion-insights.md`: 从原始讨论中提炼出的关键洞察和思路演进
   335|- `docs/open-questions.md`: 当前关键未决问题
   336|- `AGENTS.md`: 实现约束与工程规则
   337|- `.agent/PLANS.md`: 分阶段执行计划
   338|- `examples/mcp/`: 主流 Agent host 的 MCP 配置模板
   339|- `examples/imports/`: 标准化 transcript 导入样例
   340|- `examples/skills/`: host-agnostic skill 模板
   341|- `examples/playbooks/`: Research / Writer / Reviewer 等角色 playbook
   342|- `examples/playbooks/claude-first-episode.md`: Claude Code 的第一条 Episode 试跑剧本
   343|- `examples/playbooks/opencode-first-episode.md`: OpenCode 的第一条 Episode 试跑剧本
   344|
   345|## 当前命名
   346|- 推荐对外名：`Traceplane`
   347|- 对外描述：`Multi-Agent Continuity Layer`
   348|- 中文描述：`多 Agent 工作连续层`
   349|- 仓库目录名：`enterprise-agent-work-graph`
   350|
   351|## 当前平台判断
   352|- 默认路线：自建底层产品架构
   353|- 借鉴对象：吸收 `db9` 在 `table + files + agent-native runtime` 上的设计优点
   354|- 当前不做：把 `db9` 作为唯一核心底层引擎
   355|- 未来预留：通过 runtime adapter 支持 `db9` 这类 backend
   356|
   357|## 当前接入判断
   358|- 第一阶段：`BYO Agent`
   359|- 第一优先级：`MCP`
   360|- 第二优先级：`hooks / plugins / telemetry adapters`
   361|- 第三优先级：`API-native integrations`
   362|- 当前不做：完整自有 Agent runtime
   363|- 未来路线：先占住 system of record，再考虑成为 system of execution
   364|
   365|## 现在最重要的不是
   366|不是先做炫 UI，不是先做全能平台，不是先接很多协议。
   367|
   368|最重要的是先证明一件事：
   369|一个项目内，至少两个 Agent 能围绕同一条 `episode` 主线共享上下文、产物和执行证据，并且下一个 Agent 能直接接上工作。
   370|