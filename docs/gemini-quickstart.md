# Gemini Quickstart

这份文档的目标是让你尽快把 Gemini CLI 接进 Traceplane，
并跑出第一条可复盘的 Episode。

## 1. 前提

先保证仓库可以正常运行：

```bash
npm install
cp .env.example .env
# 确保 .env 里的 DATABASE_URL 指向可访问的 Postgres 实例
npm run db:setup
```

## 2. 一键写入 Gemini 项目配置

在仓库根目录执行：

```bash
npm run gemini:setup
```

它会生成：

- `.gemini/settings.json`

这个文件会把 `agentWorkGraph` 作为本地 MCP server 暴露给 Gemini CLI。

## 3. 验证配置

```bash
npm run gemini:verify
```

如果配置正确，再跑：

```bash
npm run mcp:test
```

这一步会确认 Gemini CLI 至少能看到并调用 MCP server 暴露的 8 个工具。

## 4. 在 Gemini CLI 里跑第一条 Episode

第一条试跑同样不要做太大的任务。

建议目标：

- 读取一份客户反馈材料
- 生成一段 management-facing note
- 把关键结果沉淀为 Episode artifact

推荐 prompt：

```text
Review the customer feedback material in this repository and produce a short management-facing research note.

Use the Traceplane tools in this project:
- create or continue the right episode
- query context before major work
- only write meaningful memory items
- append trace for key tool usage and decisions
- register the final note as an artifact
```

## 5. 试跑结束后看哪里

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

## 6. 第一条试跑的成功标准

第一条试跑不是比模型强弱，而是验证：

1. Gemini CLI 能稳定接入 MCP
2. 能围绕同一条 Episode 工作
3. 最终结果能登记成 artifact
4. 管理者可以在页面里回看这条工作主线
