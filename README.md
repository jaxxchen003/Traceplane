<div align="center">

# ⚡ Traceplane

**Multi-Agent Continuity Layer**

让多个 Agent 的工作接成一条不断档、可回看、可交接的工作主线。

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/jaxxchen003/Traceplane?style=social)](https://github.com/jaxxchen003/Traceplane)
[![Live Demo](https://img.shields.io/badge/Demo-Live-success)](https://traceplane.cc)

[🌐 官网](https://traceplane.cc) · [📦 文档](https://github.com/jaxxchen003/Traceplane#readme) · [🐛 Issues](https://github.com/jaxxchen003/Traceplane/issues) · [💬 讨论](https://github.com/jaxxchen003/Traceplane/discussions)

</div>

---

## 为什么需要 Traceplane？

当你同时使用多个 AI Agent（Claude Code、OpenCode、Gemini CLI……），你会发现：

| 痛点 | 后果 |
|------|------|
| 同样的上下文反复讲给不同 Agent | 浪费 token，信息不一致 |
| Agent 做到一半，另一个接不上 | 工作断档，重复劳动 |
| 工作散落在聊天记录和文件里 | 无法复盘，无法追溯 |

**Traceplane 解决的核心问题**：不是让 Agent 更聪明，而是让 Agent 之间的工作**不断档**。

---

## 核心概念

### 🧠 Episode — Agent 的意识载体

Episode 是系统主索引。不是附件字段，不是日志行——是一个完整的执行上下文，可恢复、可复用、可交接。

### 🔄 Surgical Replay — 像 git 一样回到过去

从任意执行节点 Fork 出新路径。`git checkout` 回到代码的某个状态，Traceplane 回到 Agent 工作的某个状态。

### 🤝 Handoff Brief — 无损交接

自动生成交接文档：目标、上下文、产物、风险。下一个 Agent 直接基于 brief 继续，不丢信息，不偏意图。

### 👁️ Full-Stack Observability — 一体化追踪

Agent 行为、Artifact 沉淀、风险指标在同一块舞台里被看到。每个事件可回链到来源 trace。

---

## 快速开始

### 安装

```bash
git clone https://github.com/jaxxchen003/Traceplane.git
cd Traceplane
npm install
cp .env.example .env
npm run db:setup
npm run dev
# → http://localhost:3000
```

### Agent SDK（推荐）

```typescript
import { TraceplaneSDK } from '@traceplane/agent-sdk';

const sdk = new TraceplaneSDK({
  baseUrl: 'http://localhost:3000',
  projectId: 'customer-pulse',
  agentId: 'claude-code'
});

// 创建 Episode
const session = await sdk.startEpisode({
  title: '分析客户反馈',
  goal: '生成周报'
});

// 追踪每一步
await session.step('收集数据', '已收集500条反馈');
await session.toolUse('sentiment-analyzer', '分析', '完成');

// 完成 — 上下文已保存，随时可交接
await session.complete('周报生成完毕');
```

### REST API

```bash
# 创建 Episode
curl -X POST http://localhost:3000/api/episodes \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "q2-customer-pulse",
    "primaryAgentId": "research-agent",
    "titleI18n": {"zh": "分析任务", "en": "Analysis Task"},
    "goalI18n": {"zh": "目标", "en": "Goal"}
  }'
```

### MCP 工具

```bash
npm run mcp:host -- claude-code .mcp.json

# Agent 现在可以直接调用：
# create_episode · append_trace · write_memory · create_artifact · get_episode_brief
```

---

## Agent 接入支持

| Agent | SDK | MCP | 状态 |
|-------|:---:|:---:|------|
| Claude Code | ✅ | ✅ | Ready |
| OpenCode | ✅ | ✅ | Ready |
| Gemini CLI | ✅ | ✅ | Ready |
| 自定义 Agent | ✅ | — | Ready |

---

## 技术栈

| 层 | 选型 | 原因 |
|----|------|------|
| Framework | Next.js 16 (App Router) | SSR + API Routes 一体 |
| UI | React 19 + Tailwind v4 | 组件化 + CSS-first 主题 |
| Database | SQLite (dev) / Supabase Postgres (prod) | 本地零配置，云端可扩展 |
| Object Storage | Cloudflare R2 | S3 兼容，无出站费 |
| Agent Protocol | MCP (Model Context Protocol) | Claude / OpenCode / Gemini 通用 |
| SDK | TypeScript | 类型安全，零依赖 |

---

## API 参考

### Core APIs

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/episodes` | POST | 创建 Episode |
| `/api/episodes/{id}/status` | PATCH | 更新状态 |
| `/api/episodes/fork` | POST | Fork Episode |
| `/api/traces` | POST | 上报 Trace |
| `/api/memory` | POST/GET | Memory CRUD |
| `/api/artifacts` | POST | 创建 Artifact |
| `/api/events/stream` | GET | SSE 实时事件 |

### MCP Tools

| 工具 | 说明 |
|------|------|
| `create_episode` | 创建 Episode |
| `append_trace` | 上报 Trace |
| `write_memory` | 写入 Memory |
| `create_artifact` | 创建产物 |
| `get_episode_brief` | 获取交接文档 |

---

## 项目结构

```
traceplane/
├── app/                    # Next.js App Router
│   ├── api/                # REST API 路由
│   └── [locale]/           # i18n 页面路由
├── components/             # React 组件
├── packages/agent-sdk/     # Agent SDK (TypeScript)
├── scripts/                # 工具脚本
├── prisma/                 # 数据模型
├── examples/               # 集成示例
├── tests/                  # 测试套件
└── docs/                   # 文档
```

---

## 测试

```bash
# SDK 单元测试
cd packages/agent-sdk && npm test

# API 集成测试
npm run test:run

# 覆盖率
npm run test:coverage
```

---

## 开源策略

Traceplane 采用 **MIT + Open Core** 模式：

- **Core**（本仓库）：MIT 协议，完全开源免费
- **Enterprise**：高级治理、RBAC、合规审计等功能为付费扩展

详见 [ENTERPRISE_PREVIEW.md](ENTERPRISE_PREVIEW.md)

---

## 贡献

我们欢迎所有形式的贡献！

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/amazing-feature`
3. 提交改动：`git commit -m 'feat: add amazing feature'`
4. 推送分支：`git push origin feature/amazing-feature`
5. 提交 Pull Request

详见 [CONTRIBUTING.md](CONTRIBUTING.md)

---

<div align="center">

## ☕ 支持这个项目

如果 Traceplane 对你有帮助，欢迎请我喝杯咖啡！

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/jaxxchen)

</div>

---

<div align="center">

**让 Agent 工作在一条连续的主线上，不再断档。**

Made with ⚡ by [jaxxchen](https://github.com/jaxxchen003) · MIT License

</div>
