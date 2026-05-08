# OpenCode Quickstart

这份文档的目标是让你尽快把 OpenCode 接进 Traceplane，
并跑出第一条可复盘的 Episode。

## 1. 前提

先保证仓库可以正常运行：

```bash
npm install
cp .env.example .env
# 确保 .env 里的 DATABASE_URL 指向可访问的 Postgres 实例
npm run db:setup
```

## 2. 一键写入 OpenCode 项目配置

在仓库根目录执行：

```bash
npm run opencode:setup
```

它会生成：

- `opencode.jsonc`

这个文件会把 `agentWorkGraph` 作为本地 MCP server 暴露给 OpenCode。

## 3. 验证配置

```bash
npm run opencode:verify
```

如果配置正确，再跑：

```bash
npm run mcp:test
```

这一步会确认 OpenCode 至少能看到并调用 MCP server 暴露的 8 个工具。

## 4. 在 OpenCode 里跑第一条 Episode

第一条试跑不要做太大的任务。

建议目标：

- 读取一份客户反馈材料
- 生成一段 management-facing note
- 把关键结果沉淀为 Episode artifact

推荐 prompt：

```text
Review the customer feedback notes in this repository and produce a short management-facing research note.

Use the Traceplane tools in this project:
- create or continue the right episode
- query context before major work
- write memory only for meaningful facts
- append trace for important tool usage and decisions
- register the final note as an artifact
```

## 5. 如果你已经有 OpenCode export

OpenCode 还支持另一条更适合历史记录导入的路径：

```bash
npm run normalize:opencode -- \
  examples/imports/opencode-export.json \
  q2-customer-pulse \
  research-agent \
  .tmp/opencode-normalized.json

npm run import:transcript -- .tmp/opencode-normalized.json
```

也就是说：

- 实时使用：`OpenCode + MCP`
- 历史导入：`OpenCode export -> normalize -> import`

## 6. 试跑结束后看哪里

跑完后优先看：

1. `/{locale}`
应该出现新的 Episode activity signal

2. `/{locale}/projects/{projectId}/episodes/{episodeId}`
这里应该能看到：
- 新 Episode
- 关键 trace
- 生成的 artifact

3. `/{locale}/artifacts/{artifactId}`
应该能打开最终输出

## 7. 第一条试跑的成功标准

第一条试跑不是比模型强弱，而是验证：

1. OpenCode 能稳定接入 MCP
2. 能围绕同一条 Episode 工作
3. 最终结果能登记成 artifact
4. 管理者可以在页面里回看这条工作主线
