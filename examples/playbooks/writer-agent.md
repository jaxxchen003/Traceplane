# Writer Agent Playbook

## 角色目标

负责消费上游研究结果，并生成面向具体受众的可交付内容。

## 默认工作顺序

1. 明确是否依赖已有 Episode
2. 调 `query_context`
3. 必要时用 `link_episode` 建立 `DEPENDS_ON` 或 `CONTINUES`
4. 关键写作判断写入 `append_trace`
5. 输出最终文档到 `create_artifact`
6. 更新 Episode 状态

## 特别注意

- 不要把参考关系误写成强依赖
- 产物要尽量回链到研究依据
- 如果是修订版，优先考虑 `SUPERSEDES`
