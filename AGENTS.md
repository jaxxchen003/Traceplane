# AGENTS.md

本文件定义本仓库内 Agent 的实现规则。目标不是做大而全平台，而是尽快证明 Enterprise Agent Work Graph 的最小闭环。

## 1. 实现顺序
1. 先实现 schema
2. 再实现 migrations / fixtures / tests
3. 再实现 episode / memory / trace / artifact API
4. 再补 permission / audit
5. 最后接 MCP / CLI 和最小 demo

## 2. 绝对约束
- 不先做重 UI
- 不做与 MVP 无关的抽象层
- 所有核心对象都必须可回链到 `episode`
- 所有写接口都必须产生日志或审计事件
- 所有输出都必须能回链到来源 trace
- 历史记录默认不可静默覆盖

## 3. 保底字段
以下字段原则上应成为核心对象的通用字段：

- `workspace_id`
- `project_id`
- `episode_id`
- `agent_id`
- `sensitivity`
- `policy_version`
- `created_at`
- `created_by`

## 4. 模块边界

### Data Plane
- `episodes`
- `memory_items`
- `trace_events`
- `artifacts`
- `node_edges`

### Control Plane
- `policies`
- `access_grants`
- `audit_events`

## 5. API 约束
- `create_episode` 必须记录触发者和生效 policy
- `write_memory` 必须带来源和敏感级别
- `append_trace` 必须支持引用已有 memory / artifact / policy
- `create_artifact` 必须声明来源 episode 和生成 agent
- `grant_access` 必须写入审计
- `read_audit_events` 必须受严格权限控制

## 6. 审计规则
- 读取敏感数据要审计
- 写入核心对象要审计
- 删除、导出、分享必须审计
- 权限拒绝和策略命中必须审计

## 7. 测试优先级
- Episode 主链路能否跑通
- Artifact 是否可追溯到 trace 和 memory
- 权限拒绝是否留下审计证据
- 历史 policy version 是否被正确固化

## 8. 默认技术假设
- Postgres 作为主库
- Object Storage 承载 artifact 文件
- Vector 索引异步构建
- Queue 处理蒸馏、索引、归档和重试

## 9. 交付标准
任何新功能提交前，至少要回答：

- 它挂在哪个 episode 主线上？
- 它会产生哪些节点和边？
- 它是否会影响权限或审计？
- 管理者是否能复盘这次行为？
