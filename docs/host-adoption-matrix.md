# Host Adoption Matrix

这份文档回答一个非常实际的问题：

`Traceplane` 当前和主流 Agent / host 的接入成熟度分别到了哪一层。

## 成熟度分层

### 1. `MCP`
Agent 能直接调用 Traceplane 的 v1 工具：

- `create_episode`
- `update_episode_status`
- `link_episode`
- `write_memory`
- `append_trace`
- `create_artifact`
- `query_context`
- `get_episode_brief`

### 2. `Setup`
仓库里已经有一键配置或验证脚本，能让用户更快接入 host。

### 3. `Capture`
除了 MCP 调用，还能把 host 的真实运行事件回写成 Episode 证据链。

### 4. `Import`
能把 host 的历史 transcript、session export 或离线记录导入 Traceplane。

## 当前矩阵

| Host | MCP | Setup | Capture | Import | 说明 |
|---|---|---|---|---|---|
| Claude Code | Yes | Yes | Yes | Planned | 已有 `.mcp.json` + hooks + bridge + verify |
| OpenCode | Yes | Yes | Partial | Yes | 已有本地 MCP 配置、verify、export normalize/import |
| Gemini CLI | Template | Template | Planned | Planned | 已有 host config 模板，后续补真实验证 |
| Codex | Planned | Planned | Planned | Planned | 保持 MCP-first，等待更稳的 host 接入层 |
| OpenClaw | Planned | Planned | Planned | Planned | 更像 gateway/runtime 集成对象 |

## 结论

当前最适合优先推进的两条路径是：

1. `Claude Code`
2. `OpenCode`

原因很直接：

- 已经有 MCP 入口
- 已经有可试用的 setup 路径
- 已经能拿到一部分真实过程证据
- 最容易验证“多 Agent 工作证据链”这件事的实际价值

## 当前建议

### 第一优先
- Claude Code
- OpenCode

### 第二优先
- Gemini CLI

### 暂缓深入
- Codex
- OpenClaw

不是因为它们不重要，而是因为当前阶段更重要的是先验证：

- 用户是否愿意把 Agent 工作沉淀进 Traceplane
- 多 Agent continuity 是否真的成立
- manager replay / review 是否真的被频繁使用

## 对产品路线的意义

这份矩阵也对应当前产品路线：

- 先做 `BYO Agent`
- 用 `MCP + setup + capture/import` 建立工作证据链
- 再决定是否进入更深的 runtime 层
