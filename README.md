# Traceplane

> **Multi-Agent Continuity Layer** | 多 Agent 工作连续层

让多个 Agent 的工作接成一条不断档、可回看、可交接的工作主线。

---

## 🎯 产品核心价值

### 一句话

**解决多 Agent 工作断档问题** —— 不是聊天窗口，不是网盘，而是一个能让 Agent 工作在一条连续主线上被观测、被交接的指挥界面。

### 三个痛点

| 痛点 | Traceplane 解决方式 |
|------|---------------------|
| 同样的背景反复讲给不同 Agent | **Context Sharing** - 同一个 Episode 所有 Agent 共享 |
| Agent 做到一半，另一个 Agent 接不上 | **Handoff Brief** - 自动生成交接文档 |
| 工作散落在聊天记录和文件里 | **Continuity Layer** - 主线可追溯、可回看 |

### 核心设计原则

- **Episode-first** - `Episode` 是系统主索引，不是附件字段
- **Continuity over Governance** - 先让工作连起来，再谈治理
- **Context / Process / Artifact / Risk 一体化** - 在同一块舞台里被看到

---

## 🚀 快速开始

### 方式 1: 使用官方 Agent SDK（推荐）

```bash
# 1. 安装 SDK
npm install @traceplane/agent-sdk

# 2. 在 Agent 代码中集成
import { TraceplaneSDK } from '@traceplane/agent-sdk';

const sdk = new TraceplaneSDK({
  baseUrl: 'http://localhost:3000',
  projectId: 'your-project',
  agentId: 'your-agent'
});

// 创建 Episode
const session = await sdk.startEpisode({
  title: '分析客户反馈',
  goal: '生成周报',
  successCriteria: '报告已交付'
});

// 记录执行步骤
await session.step('收集数据', '已收集500条反馈');
await session.toolUse('sentiment-analyzer', '分析', '完成');

// 完成 Episode
await session.complete('周报生成完毕');
```

### 方式 2: 使用 MCP 工具

```bash
# 生成 MCP 配置
npm run mcp:host -- claude-code .mcp.json

# Agent 现在可以直接调用：
# - create_episode
# - append_trace
# - write_memory
# - create_artifact
```

### 方式 3: 直接调用 REST API

```bash
# 创建 Episode
curl -X POST http://localhost:3000/api/episodes \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "q2-customer-pulse",
    "primaryAgentId": "research-agent",
    "titleI18n": {"zh": "分析任务", "en": "Analysis Task"},
    "goalI18n": {"zh": "目标", "en": "Goal"},
    "successCriteriaI18n": {"zh": "标准", "en": "Criteria"}
  }'
```

---

## 🏗️ 本地部署

### 前置要求

- Node.js 18+
- npm 9+

### 安装步骤

```bash
# 1. 克隆仓库
git clone https://github.com/jaxxchen003/Traceplane.git
cd traceplane

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 设置你的配置

# 4. 初始化数据库
npm run db:setup

# 5. 启动开发服务器
npm run dev

# 6. 访问应用
# http://localhost:3000/zh
```

### Docker 部署

```bash
# 构建镜像
docker build -t traceplane .

# 运行容器
docker run -d \
  -p 3000:3000 \
  --env-file .env \
  -v $(pwd)/data:/app/prisma \
  traceplane
```

---

## 📊 功能特性

### 1. Episode 工作主线

- 创建 Episode 定义任务目标
- 自动沉淀 Trace、Memory、Artifact
- 状态流转：PLANNED → IN_PROGRESS → COMPLETED/FAILED
- 实时 Event Stream 观测执行过程

### 2. Agent SDK

- **Session API** - 简化 Episode 生命周期管理
- **实时事件** - SSE 订阅执行事件
- **错误捕获** - 自动记录异常
- **批量上报** - 支持离线批量上报

### 3. Handoff Brief

- 自动生成交接文档
- 包含：目标、上下文、产物、风险
- 下一个 Agent 直接基于 brief 继续工作

### 4. Surgical Replay

- Episode Forking - 从任意节点分叉新路径
- 状态快照 - 记录 Agent 的"意识状态"
- 智能 Diff - 可视化状态变更

---

## 📖 目录结构

```
traceplane/
├── packages/agent-sdk/       # Agent SDK (TypeScript)
│   ├── src/
│   │   ├── client.ts        # HTTP Client
│   │   ├── session.ts       # Session Manager
│   │   └── types.ts         # 类型定义
│   └── README.md
├── app/                      # Next.js 应用
│   ├── api/                  # API 路由
│   │   ├── episodes/        # Episode CRUD
│   │   ├── traces/          # Trace 上报
│   │   ├── memory/          # Memory 管理
│   │   ├── artifacts/       # Artifact 管理
│   │   └── events/stream    # SSE 实时推送
│   └── [locale]/            # 页面路由
├── components/               # React 组件
│   ├── event-stream.tsx      # 实时事件流
│   ├── status-badge.tsx      # 状态徽章
│   └── episode-table.tsx     # Episode 表格
├── examples/                 # 集成示例
│   ├── hello-world/         # Hello World 演示
│   └── claude-integration/  # Claude Code 集成
├── tests/                    # 测试套件
│   ├── api-integration/     # API 集成测试
│   └── e2e/                 # E2E 测试
└── docs/                     # 文档
    ├── agent-sdk-guide.md   # SDK 使用指南
    └── TESTING.md           # 测试指南
```

---

## 🔧 API 参考

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
| `update_episode_status` | 更新状态 |
| `append_trace` | 上报 Trace |
| `write_memory` | 写入 Memory |
| `create_artifact` | 创建产物 |
| `get_episode_brief` | 获取交接文档 |

---

## 🧪 测试

```bash
# 运行 SDK 单元测试
cd packages/agent-sdk && npm test

# 运行 API 集成测试
npm test

# 运行 E2E 测试
npm run test:e2e

# 查看覆盖率
npm run test:coverage
```

---

## 🎨 产品界面

![Project Overview](docs/assets/project-overview.png)

- **Project Dashboard** - 项目总览，Metrics 卡片 + Episode 表格
- **Episode Timeline** - 执行时间线，Trace 事件可视化
- **Event Stream** - 实时事件流，SSE 推送
- **Audit Trail** - 审计日志，完整操作记录

---

## 📦 版本

当前版本: **v0.1.0** (MVP)

- ✅ Agent SDK
- ✅ REST API
- ✅ 实时 Event Stream
- ✅ Handoff Brief
- ✅ Surgical Replay
- 🚧 Python SDK (计划中)
- 🚧 Webhook 触发 (计划中)

---

## 🤝 接入支持

| Agent | SDK | MCP | 状态 |
|-------|-----|-----|------|
| Claude Code | ✅ | ✅ | Ready |
| OpenCode | ✅ | ✅ | Ready |
| Gemini CLI | ✅ | ✅ | Ready |
| 自定义 Agent | ✅ | - | Ready |

---

## 📄 许可

MIT License - 详见 [LICENSE](LICENSE)

---

## 💬 反馈

- GitHub Issues: [github.com/jaxxchen003/Traceplane/issues](https://github.com/jaxxchen003/Traceplane/issues)
- Email: hello@traceplane.io

---

**让 Agent 工作在一条连续的主线上，不再断档。**
