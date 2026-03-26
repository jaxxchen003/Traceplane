# Brand Options

这份文档收敛当前项目的对外产品命名备选。

目标不是一次性决定法律或商标层面的最终名称，
而是先选出一组适合对外讲述、适合产品界面、适合融资和客户沟通的专业名字。

## 推荐默认名

### 1. Traceplane

推荐指数：最高

为什么适合：

- `Trace` 对应可追溯、可审计、可复盘
- `Plane` 对应数据平面 + 控制平面
- 听起来更像基础产品，不像一个 feature
- 和当前产品定义高度一致：不是聊天工具，不是 memory API，而是工作控制平面

适合的产品描述：

- `Traceplane`
- `The work control plane for enterprise agents`

## 备选名

### 2. RelayGraph

为什么可用：

- 强调多 Agent 之间的接力、依赖和关系网络
- 对 Episode 关系模型很贴合

风险：

- 更偏“图谱产品”感，治理和平面感没有 `Traceplane` 强

### 3. Operon

为什么可用：

- 听起来像企业级系统
- 有多单元协同执行的意味

风险：

- 不直接传达 trace / audit / graph 语义
- 需要额外教育成本

### 4. Workspine

为什么可用：

- 非常贴合我们反复强调的“工作主线”
- 能表达 `Project -> Episode -> Trace -> Artifact` 的 spine

风险：

- 听起来比 `Traceplane` 更偏内部代号

### 5. EpisodeOS

为什么可用：

- 很直接地强调 Episode-first
- 对内部产品定义高度贴合

风险：

- 太像系统层概念
- 对外会把产品误解成 runtime 或 orchestration engine

### 6. Provenance One

为什么可用：

- 强调来源链和证据链
- 听起来较偏 enterprise / compliance

风险：

- 更偏合规，不够表达协作与执行

## 当前建议

如果现在就要选一个先落进 UI 和对外演示里，
我建议先用：

- 英文名：`Traceplane`
- 中文描述：`Agent 工作控制平面`

这样最接近我们已经确定的产品定义：

- enterprise
- work graph
- control plane
- traceability
- governance
