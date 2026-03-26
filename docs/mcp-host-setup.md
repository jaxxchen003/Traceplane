# MCP Host Setup

这份文档回答一个实际问题：

我们的 stdio MCP server 已经有了，那怎么把它接进主流 Agent host。

当前先覆盖三类最值得立即试的 host：

- Claude Code
- OpenCode
- Gemini CLI

## 1. 启动前提

先保证本地仓库可运行：

```bash
npm install
cp .env.example .env
npm run db:setup
```

可以先用下面命令确认 MCP server 正常：

```bash
npm run mcp:test
```

也可以先用脚本生成对应 host 的配置：

```bash
npm run mcp:host -- claude-code
npm run mcp:host -- opencode
npm run mcp:host -- gemini
```

如果你希望直接写入文件：

```bash
npm run mcp:host -- claude-code .mcp.json
npm run mcp:host -- gemini .gemini/settings.json
```

## 2. Claude Code

Anthropic 官方支持用 `.mcp.json` 在项目根目录配置 project-scoped MCP server。

如果你希望一步到位把 MCP 和 hooks 都配好，优先直接运行：

```bash
npm run claude:setup -- q2-customer-pulse research-agent
```

它会在项目根目录写入：

- `.mcp.json`
- `.claude/settings.json`

建议把下面模板保存为项目根目录的 `.mcp.json`，或者直接运行：

```bash
npm run mcp:host -- claude-code .mcp.json
```

模板内容：

```json
{
  "mcpServers": {
    "agentWorkGraph": {
      "command": "node",
      "args": ["scripts/mcp-server.mjs"],
      "env": {
        "DATABASE_URL": "file:./dev.db"
      }
    }
  }
}
```

也可以通过 CLI 添加：

```bash
claude mcp add agentWorkGraph --scope project -- node scripts/mcp-server.mjs
```

接入后建议在 `AGENTS.md` 或系统提示里增加一条约束：

- 在开始新工作时优先创建 Episode
- 生成关键结果前先查询上下文
- 关键步骤要写入 trace 和 artifact

### 可选：同时打开 Claude hooks

如果你不只想让 Claude 调用 MCP，还想让它把运行中的关键事件写进当前 Episode，
可以配合仓库里的 hook bridge：

```bash
node scripts/claude-hook-bridge.mjs
```

示例配置见：

- `examples/hooks/claude/settings.json`

当前 bridge 会消费这些 hook 事件：

- `UserPromptSubmit`
- `PreToolUse`
- `PostToolUse`
- `Stop`

并把它们写成：

- Episode 自动创建或绑定
- trace events
- audit events

最小自测命令：

```bash
npm run claude:hook:test
```

## 3. OpenCode

OpenCode 官方在 `opencode.json` / `opencode.jsonc` 里通过 `mcp` 字段配置本地 MCP server。

建议模板，或者直接运行：

```bash
npm run mcp:host -- opencode opencode.jsonc
```

模板内容：

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "agentWorkGraph": {
      "type": "local",
      "command": ["node", "scripts/mcp-server.mjs"],
      "enabled": true,
      "environment": {
        "DATABASE_URL": "file:./dev.db"
      }
    }
  }
}
```

如果后续你只想让某些 agent 用这个 MCP，可以全局关掉，再在 agent 级配置里单独启用。

## 4. Gemini CLI

Gemini CLI 官方使用 `settings.json` 的 `mcpServers` 配置。

建议模板，或者直接运行：

```bash
npm run mcp:host -- gemini .gemini/settings.json
```

模板内容：

```json
{
  "mcpServers": {
    "agentWorkGraph": {
      "command": "node",
      "args": ["scripts/mcp-server.mjs"],
      "cwd": "/ABSOLUTE/PATH/TO/enterprise-agent-work-graph",
      "env": {
        "DATABASE_URL": "file:./dev.db"
      },
      "timeout": 30000,
      "trust": false
    }
  }
}
```

如果你希望它只在当前项目启用，优先放到项目级配置。

## 5. 当前建议

### 最先实际试接

1. Claude Code
2. OpenCode
3. Gemini CLI

### 为什么这样排

- Claude Code：MCP 和 hooks 都成熟
- OpenCode：本地插件和 MCP 组合最灵活
- Gemini CLI：MCP + telemetry 能力都不错

## 6. 当前不在这份文档里细写的 host

### Codex

Codex 官方明确支持 MCP，但我这轮没有在官方文档里拿到一份和 Claude / OpenCode / Gemini 一样完整、明确的本地 stdio 配置示例，所以当前先不在这里放模板，避免用猜测污染接入文档。

### OpenClaw

OpenClaw 更适合作为 session/runtime 平台接入对象，不适合先按“本地 host MCP 配置模板”来写。

## 7. 下一步怎么试

最小试验建议：

1. 在 Claude Code 里接入 `agentWorkGraph`
2. 让它围绕一个固定 project 做一条完整 Episode
3. 检查是否稳定调用：
   - `create_episode`
   - `query_context`
   - `append_trace`
   - `create_artifact`
   - `get_episode_brief`

如果这条链能成立，说明第一阶段的 `BYO Agent + MCP-first` 路线已经开始具备真实使用价值。
