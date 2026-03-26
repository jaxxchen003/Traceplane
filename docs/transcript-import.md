# Transcript Import

这份文档定义一个中间层：

不是直接绑 Claude Code、OpenCode 或 Gemini CLI 的原始导出格式，
而是先把它们转换成统一的 `episode transcript package`，再导入 Enterprise Agent Work Graph。

## 1. 为什么需要这层

第一阶段我们优先走：

- `MCP`
- `hooks / plugins / telemetry`
- `session export / transcript import`

其中前两类适合实时接入，第三类适合：

- 先离线验证价值
- 导入历史工作记录
- 在 host 没有完整 hook 能力时补全证据链

## 2. 导入脚本

仓库现在包含：

```bash
node scripts/import-transcript.mjs <path-to-json>
```

它会把一个标准化 JSON 导入为：

- `episode`
- `episode_agents`
- `memory_items`
- `trace_events`
- `artifacts`
- `audit_events`
- `node_edges`

## 3. 当前支持的标准化字段

顶层字段：

- `project_slug`
- `primary_agent_slug`
- `title`
- `summary`
- `goal`
- `success_criteria`
- `final_outcome`
- `primary_actor`
- `work_type`
- `status`
- `review_outcome`
- `policy_version`
- `relation_intent`
- `started_at`
- `ended_at`
- `episode_agent_slugs`
- `memories`
- `traces`
- `artifacts`
- `links`

## 4. 设计原则

### 4.1 先标准化，再导入

不要让每个 host 的原始导出直接污染主库 schema。

更合理的流程是：

`host export -> normalize -> import-transcript`

### 4.2 工作语义优先

导入的重点不是“复制所有原始日志”，而是保留：

- 工作目标
- 关键事实
- 关键步骤
- 关键产物
- 关键关系

### 4.3 审计不能缺席

导入行为本身也要留下：

- `import_episode`
- `import_memory`
- `import_trace`
- `import_artifact`

这些 audit event。

## 5. 当前边界

第一版导入脚本还不做：

- 原始 host transcript 的一键解析
- 复杂 message-level replay
- trace 到 memory 的细粒度自动连边
- artifact diff
- host-specific auth

它当前只负责把标准化后的 episode package 可靠落库。

## 6. 下一步

后续可以按 host 分别补：

- `claude-code export -> normalized transcript`
- `opencode export -> normalized transcript`
- `gemini telemetry/checkpoint -> normalized transcript`

这样每个 host 只需要解决“怎么转”，而不是重新定义数据库写入逻辑。
