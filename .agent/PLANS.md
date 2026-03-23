# PLANS

## Phase 0: 项目对齐
目标：把产品边界、对象模型和工程约束固定下来。

交付：
- `README.md`
- `docs/product-spec.md`
- `docs/architecture.md`
- `docs/mvp-plan.md`
- `docs/open-questions.md`
- `AGENTS.md`

完成标准：
- 团队对“这不是 memory API，而是 enterprise work graph”达成一致
- MVP 范围和非目标明确
- 默认决策和第一版路线图明确

## Phase 1: Schema + Migrations + Fixtures + Tests
目标：先把最小数据骨架搭起来。

交付：
- `workspaces`
- `projects`
- `agents`
- `episodes`
- `memory_items`
- `trace_events`
- `artifacts`
- `policies`
- `access_grants`
- `audit_events`
- `node_edges`

完成标准：
- 所有核心对象都有 migration
- 能插入一条完整 demo 数据
- 基础测试覆盖主链路

## Phase 2: Core APIs
目标：打通最小工作闭环。

交付：
- `create_episode`
- `write_memory`
- `query_memory`
- `append_trace`
- `create_artifact`
- `list_episode_graph`
- `grant_access`
- `read_audit_events`

完成标准：
- 单个 episode 可完整写入和回放
- artifact 能回链到 trace / memory
- audit 可按项目和对象检索

## Phase 3: Governance
目标：把“企业可管理性”补上。

交付：
- policy version 生效记录
- permission check
- audit 完整写入
- 风险动作审批占位能力

完成标准：
- 高风险读写动作有证据链
- 权限拒绝事件可被查询
- 历史任务保留旧 policy 关联

## Phase 4: MCP / CLI / Demo
目标：做一个能对外演示的最小产品闭环。

交付：
- MCP 接入
- CLI 或 HTTP demo
- manager 视角的 episode graph demo

完成标准：
- 至少 2 个 Agent 在同一 project 下共享一条数据主线
- 管理者可以完成一次任务复盘

## Phase 5: 第二阶段候选
暂不进入 MVP，但可作为后续路线：

- 自动记忆蒸馏
- 更细粒度 node 级授权
- 审批工作流
- 图谱可视化 UI
- 私有部署能力
- 多项目跨图谱分析
