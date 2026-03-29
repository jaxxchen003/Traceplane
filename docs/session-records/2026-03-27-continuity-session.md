# Session Record · 2026-03-27

## 当前阶段结论

Traceplane 当前已明确收敛到第一层产品：

- `continuity-first`
- `episode-first`
- `MCP-first`

当前主语不是“企业治理平台”，而是：

**让多个 Agent 的工作接成一条不断档、可回放、可交接的工作主线。**

## 本轮完成内容

### 1. 产品叙事收敛

已把主文档收敛到 continuity 方向：

- `README.md`
- `docs/product-spec.md`
- `docs/mvp-plan.md`
- `lib/brand.ts`

新增：

- `docs/continuity-tier.md`

核心判断：

- 第一层先卖 continuity，不先卖治理
- 第一层最重要的产物不是图谱，而是 `handoff brief`
- 第一层优先服务单人多 Agent 操作者和小团队

### 2. Handoff Brief 成为一等能力

已完成：

- `lib/demo-data.ts`
  - 新增 `handoffSummary`
- `app/api/episodes/brief/route.ts`
  - 返回 `handoffBrief`
- `app/[locale]/projects/[projectId]/episodes/[episodeId]/page.tsx`
  - 新增 `Next Agent Handoff` 面板

当前 `handoff brief` 至少包含：

- goal
- latest step
- latest result
- latest artifact
- memory titles
- caution items
- next action
- readyForHandoff

### 3. 首页与 Connect 页改为闭环导向

已完成：

- `app/[locale]/page.tsx`
  - 新增 `First Continuity Loop`
- `app/[locale]/connect/page.tsx`
  - 新增 `First Handoff Path`

当前首页和接入页已经开始明确表达：

1. 接一个 Agent
2. 自动沉淀 Episode
3. 生成 handoff brief
4. 下一个 Agent 继续

### 4. 本地投影链路改为 runtime-aware

已完成：

- `scripts/_lib/cloud-database.mjs`
- `scripts/sync-local-workspace.mjs`
- `lib/default-runtime.ts`

现在本地工作区投影会带 runtime 元数据，不再只是静态文件导出。

## 云端状态

线上健康检查已经确认：

- `cloud-active`
- `database.provider = postgres`
- `database.source = SUPABASE_POOLER_URL`
- `storage.provider = r2`

线上健康接口：

- `https://web-production-19ae.up.railway.app/api/health`

注意：

- 健康状态已经切到 continuity-first
- 网站正文 UI 正在继续追平最新版本

## 已完成验证

本地通过：

- `npm run lint`
- `npm run build`

云端已确认：

- Railway 运行正常
- Supabase pooler 已接入
- R2 已接入

## 最新相关提交

- `d9e7899` `Refocus the product around continuity-first`
- `741c54c` `Slim down Railway deploy context`
- `63bda8e` `Make episode handoff briefs first-class`
- `593e34c` `Show the first continuity loop in the UI`

## 下一步

1. 继续把线上 UI 切到最新 continuity-first 版本
2. 把 Project 页面也补成 continuity / handoff 视角
3. 把 Codex 的 `MCP + skill` 接入路径补进 Connect 页和文档
4. 继续保持：
   - 不扩大到完整企业治理叙事
   - 不提前进入 managed runtime 叙事


### 5. 首页改成 continuity queues

已完成：

- `lib/demo-data.ts`
  - `getEpisodeCommandCenter()` 改成 continuity-first 分组
- `app/[locale]/page.tsx`
  - 首页改成 `readyToContinue / contextRepair / liveHandoffs / recentSpines`

当前首页已经不再按传统“任务列表”表达，而是按：

- 可继续的工作
- 先修复上下文
- 进行中的接力
- 最近主线

并且每条卡片都开始明确显示：

- 这条 spine 是否适合交接
- 下一步怎么继续
- 当前应该进入哪个 continuity queue

补充修正：

- 带 `policy hit` 的主线不再同时进入“可继续”和“先修复”
- 现在会优先落在修复队列，避免首页 attention model 相互冲突

### 6. Codex 接入层级已校准

已完成：

- `docs/codex-integration.md`
- `docs/host-adoption-matrix.md`
- `app/[locale]/connect/page.tsx`

当前结论：

- `Codex` 现在适合按 `MCP + skills` 接入
- 不应对外表述成与 `Claude Code hooks` 同等级的本地过程捕获
- 更深的过程 trace 更适合未来走 `OpenAI API / Agents SDK` 路线

### 7. Continuation Packet 成为下一层 handoff 产物

已完成：

- `lib/demo-data.ts`
  - 新增 `continuationPacket`
- `app/api/episodes/brief/route.ts`
  - 新增 `continuationPacket` 返回
- `app/[locale]/projects/[projectId]/episodes/[episodeId]/page.tsx`
  - `Next Agent Handoff` 面板内新增 `Agent Continuation Packet`

这意味着当前 handoff 已经分成两层：

- `handoff brief`：给人快速理解当前工作主线
- `continuation packet`：给下一位 Agent 直接继续执行

### 8. 部署状态补充

当前线上状态：

- continuity-first 首页文案已经上线
- 云端 runtime 仍稳定在 `cloud-active`
- Railway 最近多次出现上传超时，不是代码错误，而是部署链路不稳定

因此当前策略是：

- 本地和 GitHub 继续保持最新
- 线上在不稳定时保持上一版稳定可用版本
- 新一轮 Railway 上传成功后再同步最新 continuity UI

### 9. Continuation Packet 进入本地投影和项目入口

已完成：

- `scripts/sync-local-workspace.mjs`
  - 本地同步时会额外写出 `continuation-packet.txt` 和 `handoff-brief.json`
- `lib/default-runtime.ts`
  - 应用内的本地投影 runtime 也会写同样的 continuity 文件
- `app/[locale]/projects/[projectId]/page.tsx`
  - `Best Next Handoff` 面板新增 `Project Handoff Starter`

这意味着第一层 continuity 现在不只停留在 UI：

- 页面里有 handoff brief
- API 里有 continuation packet
- 本地 `~/Traceplane/...` 目录里也有可以直接交给下一个 Agent 的 continuation 文件

当前这条闭环已经更接近真实使用：

1. Agent 工作形成 episode
2. Traceplane 生成 handoff brief / continuation packet
3. 本地同步目录出现 continuation 文件
4. 下一位 Agent 可以直接从文件或页面继续

### 10. 首页与 Connect 页进入 Continuity Launchpad 阶段

已完成：

- `lib/demo-data.ts`
  - `getEpisodeCommandCenter()` 现在会返回 `continuityLaunchpad`
  - launchpad 会自动挑选当前最适合继续的一条主线
  - 同时给出：
    - `briefHref`
    - `continuation-packet.txt` 路径
    - `handoff-brief.json` 路径
    - packet 是否已存在
    - 推荐接力 host
- `app/[locale]/page.tsx`
  - 新增 `Continue From Brief or File` 面板
  - 首页不再只讲“Connect -> Work -> Brief -> Continue”抽象流程
  - 现在会直接展示：
    - 当前最适合继续的 episode
    - 本地 continuation packet 路径
    - 下一步建议和推荐 host
  - 首页 `Connected Hosts` 里也正式补上了 `Codex`
- `app/[locale]/connect/page.tsx`
  - 新增 `Continue Into The Next Agent` 面板
  - 用户接完 host 后，可以直接看到：
    - 应该打开哪条 brief
    - 本地 packet 路径
    - 建议如何把 packet 交给下一个 Agent

这一轮的意义是：

- 首页开始真正像“continuity 入口”，而不是“continuity 说明页”
- Connect 页开始真正像“接入后立刻继续工作”的控制台，而不是 setup 文档列表
- 第一层产品的主叙事进一步收紧成：
  - 连接一个 Agent
  - 自动形成 Episode
  - 生成 handoff brief / continuation packet
  - 让下一个 Agent 继续，而不是重新开始
