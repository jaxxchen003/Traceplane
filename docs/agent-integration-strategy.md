# Agent Integration Strategy

## 1. 先说结论

我们不应该把自己定义成某一家 Agent 的插件或 skill。

我们的产品角色是：

- 企业级 Agent 工作控制平面
- Agent 工作的 system of record
- 多 Agent 共享的外部工作图谱和治理层

技术接入上，第一阶段应优先采用：

- `MCP`
- `hooks / plugins / telemetry adapters`
- `API-native integrations`
- `session export / transcript import`

一句话：

MCP 是接入方式，不是产品定义。

## 2. MCP 和 Skill 的分工

### MCP

负责：

- Agent 接入系统
- 读写 `Episode / Memory / Trace / Artifact`
- 调用统一的工作图谱能力

### Skill

负责：

- 指导 Agent 正确使用系统
- 降低 onboarding 成本
- 提供角色模板和最佳实践

一句话：

- MCP 让 Agent 接进来
- Skill 让 Agent 用得对

## 3. 接入层分三层

### Level 1：MCP

让 Agent 能创建 Episode、读取上下文、写回证据链。

### Level 2：Hook / Plugin / Telemetry

拿到更强的过程观测能力，例如：

- 用户输入
- 工具调用
- 权限请求
- 错误和状态变化

### Level 2.5：Session Export / Transcript Import

当 host 还没有稳定的实时 hook，或者企业想先导入历史工作记录时，
使用标准化 transcript package 先把工作沉淀成 episode。

### Level 3：API-native integration

对于直接运行在 API/SDK 上的 agent stack，把过程从一开始就纳入 system of record。

## 4. 第一阶段优先支持的 Agent

推荐顺序：

1. Claude Code
2. OpenCode
3. Gemini CLI
4. Codex
5. OpenClaw

## 5. 长期演进路线

### Phase 1：Bring Your Own Agent

让用户继续使用已有 Agent，我们提供：

- MCP server
- 统一工作图谱
- 证据链沉淀
- review / governance / audit

### Phase 2：Managed Runtime

当用户价值被验证后，再考虑：

- 自有 runtime
- 原生多 Agent orchestration
- 内建 policy / permission / audit

## 6. 当前战略判断

现在不应该做完整自有 Agent runtime。

当前阶段最该做的是：

先占住 system of record，再决定是否成为 system of execution。
