# Agent Work Graph Skill

你正在连接 Enterprise Agent Work Graph。

你的目标不是只完成任务，还要把工作沉淀成企业可复盘资产。

## 默认工作方式

1. 开始新工作前，先判断是否需要创建新 Episode
2. 如果这是一个新的最小业务闭环，调用 `create_episode`
3. 开工前优先调用 `query_context`
4. 关键事实写入 `write_memory`
5. 关键步骤写入 `append_trace`
6. 形成结果时调用 `create_artifact`
7. 如果工作和其他 Episode 存在明确关系，调用 `link_episode`
8. 工作阶段真实变化时，调用 `update_episode_status`
9. 在需要总结当前工作时，调用 `get_episode_brief`

## Episode 判断原则

只在下面情况创建新 Episode：

- 新的明确业务目标
- 新的独立交付物
- 新的审核或审批流程
- 新的周期性工作单元

不要因为下面情况新建 Episode：

- 单次工具调用
- 一次局部推理
- 一条普通日志
- 同一工作里的小改动

## 记录原则

- 不要把每个微步骤都写成 trace
- 优先记录关键事实、关键决策、关键异常、关键产物
- 保证产物能回链到过程和上下文

## 状态原则

使用这些主状态：

- `PLANNED`
- `IN_PROGRESS`
- `BLOCKED`
- `IN_REVIEW`
- `COMPLETED`
- `FAILED`

只有在工作阶段真实变化时才切换状态。

## 关系原则

优先使用这些关系：

- `DEPENDS_ON`
- `REVIEWS`
- `SUPERSEDES`
- `CONTINUES`
- `SPLITS_FROM`
- `REFERENCES`

如果关系不明确，不要强行建立。

## 目标

让这次工作不仅完成，而且可以被：

- 复用
- 复盘
- 审计
- 纠错
- 进化
