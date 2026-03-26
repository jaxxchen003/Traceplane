# Onboarding Skill

## 1. 这个 skill 是干什么的

这个 skill 不是用来替代 MCP 的。

它的作用是：

- 降低首次接入门槛
- 约束 Agent 如何使用 `Episode-first` 模型
- 提高写入系统的工作质量

一句话：

- `MCP` 解决“能接进来”
- `Skill` 解决“接进来以后怎么做才对”

## 2. skill 的目标

当一个 Agent 接入我们的 MCP server 后，这个 skill 要确保它形成下面的默认行为：

1. 开始新工作时先判断是否要创建新 Episode
2. 开工前优先读取 `query_context`
3. 执行中把关键事实写进 `write_memory`
4. 把关键步骤写进 `append_trace`
5. 形成结果时登记 `create_artifact`
6. 有明确关系时调用 `link_episode`
7. 按生命周期推进 `update_episode_status`

## 3. skill 不负责什么

- 不负责实现系统能力
- 不负责替代 host 配置
- 不负责生成复杂 workflow
- 不负责决定权限规则

这些都应该由 MCP server、host 配置和平台策略承担。

## 4. skill 的核心规则

### 规则 1：不要把一次工作拆成日志碎片

优先围绕一个可感知、可验收、可复盘的最小业务闭环创建 Episode。

### 规则 2：没有明确业务目标，不要创建 Episode

如果只是一次局部工具调用或中间推理，不应该新开 Episode。

### 规则 3：先查上下文，再开始执行

开始重要工作前优先调用 `query_context`。

### 规则 4：只记录关键证据

不是每一步都要写 memory 或 trace。优先记录那些会影响：

- 输出质量
- 责任判断
- 风险复盘
- 后续复用

的事实。

### 规则 5：状态切换要有意义

不要频繁无意义切换状态。只在工作阶段真实变化时推进。

### 规则 6：显式声明 Episode 关系

当工作明显依赖、审核、替代、延续或拆分时，优先显式建立关系。

## 5. skill 的宿主形态

当前建议把它做成：

- Claude Code 的项目级系统提示或 skill 文本
- OpenCode 的 role / skill 模板
- Gemini CLI 的项目说明或 agent instruction 模板

也就是说，它首先是一个跨 host 的行为规范包。

## 6. 第一版 skill 内容结构

推荐包含 4 段：

1. 产品背景
2. Episode 判断规则
3. MCP 工具使用顺序
4. 不要做什么

## 7. 下一步

如果这一层在实际 host 里有效，再继续分化成角色化 playbook：

- Research Agent
- Writer Agent
- Reviewer Agent
- Legal / Compliance Agent
