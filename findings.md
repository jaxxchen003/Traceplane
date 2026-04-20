# Findings & Decisions

## Requirements

来自用户的请求：
- 让 Traceplane 从演示项目转变为真正可用的 MVP
- 需要实现真实的遥测数据上报
- 实现实时 Event Stream 更新
- 实现 Fork/Resume 引擎
- 创建 Hello World 演示

## Research Findings

### 项目现状
- 技术栈：Next.js + TypeScript + Tailwind + Prisma + NextAuth
- UI 已完成 Premium Sentry 风格改造（dark, industrial）
- 当前使用 lib/demo-data.ts 的模拟数据
- 构建和部署正常

### 现有架构
- 前端：app/[locale] 路由，使用 Server Components
- 数据库：Prisma schema 定义 Episode, Span, Event, Artifact 等模型
- 认证：NextAuth + 持久化会话
- 国际化：next-intl 支持多语言

### 待实现功能缺口
1. Agent 没有 SDK 来上报遥测数据
2. Event Stream 是静态的（使用 demo-data）
3. Fork/Resume 按钮是占位符，无实际操作
4. Artifact 没有真实存储集成
5. 没有实时通信机制

## Technical Decisions

| Decision | Rationale |
|----------|-----------|
| SSE 代替 WebSocket | 单向推送足够；Agent 只上报，前端只接收；SSE 更简单 |
| 从 Node.js SDK 开始 | 项目本身是 TS/JS，目标用户也是 |
| Webhook 方式触发 Fork | Agent 自己实现接收端，更灵活 |
| 继续使用 Prisma | 已有 schema，迁移成本高 |
| R2 用于 Artifact 存储 | Cloudflare R2 便宜，SDK 支持好 |

## Issues Encountered

| Issue | Resolution |
|-------|------------|
| 原 Graph Theater 信息密度太低 | 已替换为 Episode Table |

## Resources

- 项目目录：/Users/jaxxchen/projects/enterprise-agent-work-graph/
- Playground：http://localhost:3000/playground/premium-sentry.html
- 实际页面：http://localhost:3000/zh/projects/q2-customer-pulse
- Design 文档：DESIGN.md

## Visual/Browser Findings

- Premium Sentry 风格：深色主题、高信息密度、工业美学
- 主色调：void-950/900/800，ink/ink-muted，signal 颜色用于状态
- Episode Table 已替换 Graph Theater，更实用

---
*Update this file after every 2 view/browser/search operations*
