# Episode Model

## 1. 先说结论

- `Project` 是价值归属层和汇报层
- `Episode` 是执行层、监督层和复盘层
- 默认主视角应该是 `Episode-first`

一句话定义：

`Episode` 是在某个 `Project` 下，由一个或多个 Agent 围绕一个明确目标完成的一次可追溯工作闭环。

它不是：

- 一次聊天
- 一次 API 请求
- 一次 tool call
- 一个文件夹

它更像：

- 一次最小业务闭环
- 一次值得被复盘的工作链
- 一次有输入、过程、输出和责任边界的任务执行

## 2. Project 和 Episode 的分工

### Project 负责回答

- 我们总体在做什么
- 为什么做
- 做到哪里了
- 整体风险和产出如何

### Episode 负责回答

- 这一次具体在做什么
- 谁参与了
- 用了哪些上下文
- 中间发生了什么
- 产出了什么
- 为什么成功或失败

一句更硬的判断：

- `Project` 是价值归属层
- `Episode` 是工作证据层

## 3. Episode 的产品定义

一个好的 Episode 必须同时满足：

- 对业务可感知
- 对结果可验收
- 对过程可回链
- 对管理值得复盘
- 对责任边界足够清楚

这意味着 Episode 的边界首先是管理边界，而不是技术边界。

## 4. Episode 切分五原则

### 原则 1：最小可感知业务进展

它应该对应一个用户或管理者能理解的最小成果，而不是内部执行步骤。

### 原则 2：可独立判断成败

结束时必须能回答：

- 这次完成了吗
- 结果达标了吗
- 如果失败，失败在哪里

### 原则 3：有完整输入-过程-输出闭环

Episode 里应该能看到：

- 输入是什么
- 过程如何推进
- 最终输出是什么

### 原则 4：值得单独复盘

不是每个步骤都值得单独形成 Episode。只有那些值得被看、被讲、被追责、被总结经验的工作，才应该独立成 Episode。

### 原则 5：拆出来后责任边界更清楚

如果拆分后更容易说明：

- 谁负责
- 谁审批
- 哪条规则生效
- 哪个产物对应哪段过程

那它通常值得独立成 Episode。

## 5. 什么应该新开 Episode

### 应该新开

- 新的明确业务目标
- 新的独立交付物
- 新的高风险审核或审批流程
- 新的周期性工作单元

### 不应该新开

- 单次工具调用
- 一次摘要或中间推理
- 一条 memory 写入
- 同一目标里的局部修改
- 仅用于格式导出的重复动作

## 6. Episode 创建最小字段

### 必填

- `project_id`
- `goal`
- `work_type`
- `primary_actor`
- `relation_intent`
- `success_criteria`

### 选填

- `source_episode_ids`
- `priority_or_risk`

## 7. Episode 状态模型

第一版主状态建议收敛为 6 个：

- `planned`
- `in_progress`
- `blocked`
- `in_review`
- `completed`
- `failed`

配套原因字段：

- `blocked_reason`
- `failure_reason`
- `review_outcome`

## 8. 状态推进原则

默认系统自动推进：

- `planned -> in_progress`
- `in_progress -> blocked`
- `blocked -> in_progress`
- `in_progress -> in_review`
- `in_progress -> failed`

默认受控推进：

- `in_review -> completed`
- `in_review -> failed`

一句话：

系统负责告诉你工作发生了什么，人或 policy 负责决定结果是否成立。
