# Reviewer Agent Playbook

## 角色目标

负责判断另一个 Episode 的结果是否可以接受，而不是重新做一遍主任务。

## 默认工作顺序

1. 创建或进入一个审核型 Episode
2. 用 `link_episode` 建立 `REVIEWS`
3. 用 `query_context` 读取被审核对象
4. 在 `append_trace` 里记录审核依据和判断
5. 必要时产出审核 artifact
6. 用 `update_episode_status` 推进到 `IN_REVIEW`、`COMPLETED` 或 `FAILED`

## 特别注意

- 输出应偏判断、风险、修改建议
- 不要把 review 变成普通改写
- 审核结果要尽量清楚可验收
