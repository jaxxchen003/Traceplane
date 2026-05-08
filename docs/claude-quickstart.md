# Claude Quickstart

这份文档的目标不是解释 MCP 或 hooks 原理，
而是让你在 Claude Code 里尽快跑出第一条可复盘的 Episode。

## 1. 前提

先保证仓库可以正常运行：

```bash
npm install
cp .env.example .env
# 确保 .env 里的 DATABASE_URL 指向可访问的 Postgres 实例
npm run db:setup
```

## 2. 一键写入 Claude 项目配置

在仓库根目录执行：

```bash
npm run claude:setup -- q2-customer-pulse research-agent
```

它会生成：

- `.mcp.json`
- `.claude/settings.json`

其中：

- `.mcp.json` 负责把 Traceplane MCP server 暴露给 Claude
- `.claude/settings.json` 负责把 Claude 的关键 hook 事件回写成 Episode trace

## 3. 验证配置

```bash
npm run claude:verify
```

如果配置正确，再跑：

```bash
npm run claude:hook:test
```

这一步会模拟：

- `UserPromptSubmit`
- `PreToolUse`
- `PostToolUse`
- `Stop`

并确认它们被写成一条 `IN_REVIEW` Episode。

## 4. 在 Claude Code 里跑第一条 Episode

打开这个仓库后，不要直接让 Claude “随便开始做”。

第一条试跑建议只做一个很小的闭环：

- 读取一份客户反馈摘要
- 生成一段管理层可读的研究 note
- 把关键过程沉淀为 Episode

推荐 prompt：

```text
Review the current customer feedback notes in this repo and produce a short management-facing research note.

Use the Traceplane tools in this project:
- create or continue the right episode
- query context before major work
- record key facts with memory
- record key steps with trace
- register the final note as an artifact
```

## 5. 试跑结束后看哪里

跑完后优先看这三个地方：

1. `/{locale}`
默认首页应该出现新的 Episode attention signal

2. `/{locale}/projects/{projectId}/episodes/{episodeId}`
这里应该能看到：
- Claude prompt
- tool events
- stop event
- 状态进入 `IN_REVIEW`

3. `/{locale}/audit`
这里应该能看到 Claude hook 写入的 audit event

## 6. 第一条试跑的成功标准

不要把成功标准定成“Claude 非常聪明”。

第一条试跑只验证这四件事：

1. Claude 能接入 MCP
2. Claude 的关键运行事件能被写进 Episode
3. 最终结果能登记成 artifact
4. 管理者可以回看这条工作证据链

## 7. 如果你只试一条链

最小闭环就是：

`claude:setup -> claude:verify -> Claude Code prompt -> Episode Review`

这条链成立，就说明：

`Claude Code + Traceplane`

已经具备第一阶段真实试用价值。
