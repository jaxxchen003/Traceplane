# Codex Integration

`Traceplane` 当前对 `Codex` 的判断是：

- `MCP` 可行
- `skills` 可行
- `OpenAI API / Agents SDK trace` 可行
- `Codex CLI / app` 本地 hooks 级过程捕获，当前不应假设存在

## 这意味着什么

对第一层 continuity 产品来说，Codex 现在适合：

1. 作为 `MCP host`
2. 作为 `skill` 消费方
3. 作为 handoff 的下一位 agent

但它当前不适合被表述成：

- 与 Claude Code hooks 同等级的本地 capture 对象
- 可直接吐出完整本地执行事件流的 host

## 当前推荐用法

1. 在 Codex 中接入 Traceplane MCP
2. 使用 Traceplane onboarding skill / handoff brief
3. 让 Codex 消费 `query_context` 和 `get_episode_brief`
4. 把输出继续写回 `Episode`

## 如果需要更深的过程数据

更现实的路线不是等待 Codex 本地开放 hooks，
而是：

- 用 `OpenAI API / Agents SDK`
- 在 Traceplane 自己的 runtime / orchestration 层里调用 OpenAI 能力
- 让输入、过程、输出天然落到 Traceplane 的 work plane

一句话：

`Claude Code` 更适合外接监听，`Codex` 更适合未来内嵌运行。
