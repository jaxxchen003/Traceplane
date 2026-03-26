# Enterprise Agent Work Graph

## 项目一句话
面向企业多 Agent 协作场景的共享数据中枢，统一承载 memory、trace、artifact，并通过 policy、permission、audit 形成可管理、可复用、可追溯的工作图谱。

## 这是什么
这不是单点 Agent memory，也不是企业网盘或通用 workspace。

它要解决的是企业在 Agent 进入生产后出现的核心问题：

- Agent 记住了什么
- Agent 做了什么
- Agent 产出了什么
- Agent 依据什么规则访问了哪些数据
- 出问题时如何追溯、审计与归责

## 核心判断
- 企业买的不是“更强记忆”，而是“可管理的 Agent 工作体系”。
- Memory、Trace、Artifact 必须挂在同一条任务主线上，否则只是三个存储桶。
- `Episode` 是系统主索引，不是附件字段。
- 默认产品视角应该是 `Episode-first`，`Project` 负责价值归属与汇报。
- Policy、Permission、Audit 是产品主能力，不是后补治理层。

## MVP 聚焦
MVP 只做一件事：跑通企业多 Agent 共享工作资产中心的最小闭环。

1. Agent 创建 `episode`
2. 写入 `memory`
3. 持续追加 `trace`
4. 生成 `artifact`
5. 管理者查看 episode 全链路和访问审计

## 当前交付
当前仓库已经包含一个可本地运行的 MVP：

- Next.js 全栈应用
- Prisma + SQLite 本地数据层
- 中英文切换
- 6 个核心页面
- 13 个基础 API 路由
- 一套可演示的 seeded demo 数据
- 项目页与 Episode 页内嵌交互式写入控制面

当前代码仍然是 demo runtime：

- `Next.js`
- `Prisma`
- `SQLite`

目标生产架构则是：

- `Postgres`
- `Object Storage`
- `Vector Layer`
- `Queue / Workers`

## 本地运行
```bash
npm install
cp .env.example .env
npm run db:setup
npm run dev
```

默认入口：
- `http://localhost:3000/zh`
- `http://localhost:3000/en`

## 当前 MVP 页面
- `/{locale}`: Episode Command Center
- `/{locale}/projects`: 项目列表
- `/{locale}/projects/{projectId}`: 项目总览
- `/{locale}/projects/{projectId}/episodes/{episodeId}`: Episode 复盘
- `/{locale}/artifacts/{artifactId}`: Artifact 详情
- `/{locale}/audit`: 审计视图

## 当前 MVP API
- `POST /api/episodes`
- `POST /api/episodes/status`
- `POST /api/episodes/link`
- `GET /api/episodes/brief?episodeId=...&locale=zh|en`
- `POST /api/memory`
- `GET /api/memory`
- `POST /api/traces`
- `POST /api/artifacts`
- `POST /api/context`
- `GET /api/graph?episodeId=...&locale=zh|en`
- `POST /api/access`
- `GET /api/audit?projectId=...&episodeId=...&locale=zh|en`
- `GET /api/health`

## 当前 MCP Server
仓库现在已经包含一个可运行的 stdio MCP server，暴露 8 个 v1 工具：

- `create_episode`
- `update_episode_status`
- `link_episode`
- `write_memory`
- `append_trace`
- `create_artifact`
- `query_context`
- `get_episode_brief`

本地启动：

```bash
npm run mcp:start
```

本地自测：

```bash
npm run mcp:test
```

生成 host 配置：

```bash
npm run mcp:host -- claude-code
npm run mcp:host -- opencode
npm run mcp:host -- gemini
```

如需直接写入文件：

```bash
npm run mcp:host -- claude-code .mcp.json
npm run mcp:host -- gemini .gemini/settings.json
```

导入标准化 transcript：

```bash
npm run import:transcript -- examples/imports/normalized-episode.json
```

把 OpenCode export 转成标准化 transcript：

```bash
npm run normalize:opencode -- \
  examples/imports/opencode-export.json \
  q2-customer-pulse \
  research-agent \
  .tmp/opencode-normalized.json
```

运行 Claude hook bridge 自测：

```bash
npm run claude:hook:test
```

一键生成 Claude 项目配置：

```bash
npm run claude:setup -- q2-customer-pulse research-agent
```

它会生成：

- `.mcp.json`
- `.claude/settings.json`

验证 Claude 配置：

```bash
npm run claude:verify
```

一键生成 OpenCode 项目配置：

```bash
npm run opencode:setup
```

验证 OpenCode 配置：

```bash
npm run opencode:verify
```

Claude Code hooks 示例配置：

- [examples/hooks/claude/settings.json](/Users/jaxxchen/projects/enterprise-agent-work-graph/examples/hooks/claude/settings.json)

## 环境变量
- `DATABASE_URL`: Prisma 数据库连接。默认本地示例为 `file:./dev.db`
- `NEXT_PUBLIC_DEFAULT_LOCALE`: 默认语言，当前示例为 `zh`
- `DEMO_RESET_ENABLED`: 仅用于 demo 容器首次启动或强制重置时自动重建 demo 数据

可直接从 `.env.example` 复制一份：
```bash
cp .env.example .env
```

## Docker 运行
```bash
docker build -t enterprise-agent-work-graph .
docker run --rm -p 3000:3000 --env-file .env enterprise-agent-work-graph
```

容器默认会在 SQLite 文件不存在时自动执行：
- `prisma db push`
- `node prisma/seed.mjs`

然后启动应用。

## 持续集成
仓库已包含 GitHub Actions CI：
- `npm ci`
- `npm run db:generate`
- `npm run lint`
- `npm run build`

工作流文件位于 `.github/workflows/ci.yml`。

## 产品边界
做：
- 多 Agent 共享上下文
- Episode 级任务链路追踪
- Artifact 来源可回链
- Policy 注入
- Permission + Audit 治理

不做：
- 完整 Web 办公套件
- 通用 IM
- 替代 Notion / Obsidian / 企业网盘
- 复杂 BI 仪表盘
- MVP 阶段完整私有化产品

## 仓库结构
- `docs/product-spec.md`: 产品定义、场景、范围、验收标准
- `docs/architecture.md`: 对象模型、关系模型、数据流、存储抽象、API
- `docs/episode-model.md`: `Project` / `Episode` 分工、Episode 边界、状态、创建字段
- `docs/episode-relations.md`: Episode 关系类型、推断原则、自动化默认策略
- `docs/agent-integration-strategy.md`: 主流 Agent 接入策略、MCP-first 路线、BYO Agent 到 managed runtime 的演进
- `docs/mcp-spec-v1.md`: 第一版 MCP 工具范围与字段定义
- `docs/mcp-host-setup.md`: Claude Code、OpenCode、Gemini CLI 的 MCP 接入模板
- `docs/claude-quickstart.md`: Claude Code 的最小试跑路径和首条 Episode 验证标准
- `docs/opencode-quickstart.md`: OpenCode 的最小试跑路径，以及 export/import 双路径说明
- `examples/hooks/claude/`: Claude Code hooks 示例配置
- `docs/onboarding-skill.md`: onboarding skill 的职责、结构和边界
- `docs/demo-workflow.md`: 对外演示用的最小多 Agent 工作链路
- `docs/transcript-import.md`: 标准化 transcript / session 导入层，定义 host export 如何落成统一 episode package
- `docs/platform-architecture-v1.md`: 平台级底层架构判断，明确为什么默认自建而不是直接押注 db9
- `docs/storage-runtime-interface.md`: 存储运行时接口边界，定义未来如何支持可替换 backend
- `docs/mvp-plan.md`: MVP 的实现逻辑、范围、路线图和最终产品形态
- `docs/product-surface.md`: 第一版产品的页面、视图、交互和 demo 形态
- `docs/page-specs.md`: 第一版 5 个核心页面的字段级规格
- `docs/brand-options.md`: 对外产品命名备选，以及当前推荐名
- `docs/discussion-insights.md`: 从原始讨论中提炼出的关键洞察和思路演进
- `docs/open-questions.md`: 当前关键未决问题
- `AGENTS.md`: 实现约束与工程规则
- `.agent/PLANS.md`: 分阶段执行计划
- `examples/mcp/`: 主流 Agent host 的 MCP 配置模板
- `examples/imports/`: 标准化 transcript 导入样例
- `examples/skills/`: host-agnostic skill 模板
- `examples/playbooks/`: Research / Writer / Reviewer 等角色 playbook
- `examples/playbooks/claude-first-episode.md`: Claude Code 的第一条 Episode 试跑剧本
- `examples/playbooks/opencode-first-episode.md`: OpenCode 的第一条 Episode 试跑剧本

## 当前命名
- 推荐对外名：`Traceplane`
- 对外描述：`Enterprise Agent Work Graph`
- 中文描述：`Agent 工作控制平面`
- 仓库目录名：`enterprise-agent-work-graph`

## 当前平台判断
- 默认路线：自建底层产品架构
- 借鉴对象：吸收 `db9` 在 `table + files + agent-native runtime` 上的设计优点
- 当前不做：把 `db9` 作为唯一核心底层引擎
- 未来预留：通过 runtime adapter 支持 `db9` 这类 backend

## 当前接入判断
- 第一阶段：`BYO Agent`
- 第一优先级：`MCP`
- 第二优先级：`hooks / plugins / telemetry adapters`
- 第三优先级：`API-native integrations`
- 当前不做：完整自有 Agent runtime
- 未来路线：先占住 system of record，再考虑成为 system of execution

## 现在最重要的不是
不是先做炫 UI，不是先做全能平台，不是先接很多协议。

最重要的是先证明一件事：
一个项目内，至少两个 Agent 能围绕同一条 `episode` 主线共享上下文、产物和治理约束，并且管理者能完整复盘。
