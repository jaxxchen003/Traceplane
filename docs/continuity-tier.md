# Continuity Tier

这份文档定义 Traceplane 的第一层产品，而不是完整企业版。

## 一句话

让多个 Agent 的工作接成一条不断档、可回放、可交接的工作主线。

## 这一层卖什么

不是先卖治理，不是先卖审批，也不是先卖企业平台。

这一层只卖三件事：

1. 不用再把同样的背景反复讲给每个 Agent
2. 一个 Agent 做到一半，另一个 Agent 可以直接接上
3. 做过的工作不会散落在聊天、日志和文件夹里

## 核心场景

### 1. Research -> Write
- 研究 Agent 产出结论
- 写作 Agent 直接基于这条主线生成报告或文案

### 2. Build -> Review
- 一个 Agent 生成代码、方案或草稿
- 另一个 Agent 接着 review、补强或修订

### 3. Session Resume
- 昨天在 Claude 做到一半
- 今天换到 OpenCode、Gemini 或别的 host 继续做
- 不需要重新解释背景

## 第一层核心能力

### 1. Episode 自动沉淀
- 接入 MCP 后，任务自动形成 Episode
- 用户不需要手工维护复杂结构

### 2. Context Handoff
- 下一位 Agent 能直接拿到：
  - goal
  - latest brief
  - relevant artifact
  - recent trace summary

### 3. Episode Brief
- 每次任务结束后，自动形成可交接的 brief
- 这是第一层最关键的输出

### 4. Trace + Artifact 回看
- 用户至少能看清：
  - 做了什么
  - 产出了什么
  - 最近一步是什么
  - 哪里失败了

### 5. Local Projection
- 本地 `~/Traceplane` 作为工作区投影
- 让用户和 Agent 都能直接看到工作副本

## 这一层不主打什么

- 不主打复杂 Project 管理
- 不主打多层权限
- 不主打审批流
- 不主打大而全 audit dashboard
- 不主打组织级治理

这些能力会在系统里预留，但不是第一层的主叙事。

## 第一层最关键的产物

### Handoff Brief

如果第一层只能有一个 killer output，那就是 handoff brief。

它至少要回答：
- 这次要完成什么
- 已经做到哪一步
- 有哪些关键上下文
- 最新产物是什么
- 下一个 Agent 应该接着做什么

## 第一层的北极星

不是“存了多少数据”，而是：

**有多少次工作不是从零开始，而是沿着已有 Episode 继续推进。**

## 典型升级信号

当用户开始出现下面这些行为，就说明第一层成立了，也说明可以往更高阶产品升级：

1. Episode 数量持续累积
2. 不同 Agent 频繁复用旧 Episode
3. 用户开始依赖 brief 做 handoff
4. 用户开始让别人 review 或共享结果

## 当前阶段产品判断

- 第一层先做 `continuity-first`
- 默认接入方式先做 `MCP-first`
- 默认产品视角先做 `Episode-first`
- 等 continuity 成立后，再逐步打开 `review / governance / managed runtime`
