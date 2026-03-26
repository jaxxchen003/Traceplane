# Demo Workflow

## 1. 目标

这份文档定义一条最小但完整的对外演示链路：

`Research Agent -> Writer Agent -> Manager Review`

目标不是展示所有功能，而是展示：

- 多 Agent 共享同一条 Episode 主线
- 输入、过程、输出被系统化记录
- 管理者可以复盘和追责

## 2. 演示步骤

### Step 1：Research Agent 创建 Episode

调用：

- `create_episode`

建议参数：

- `work_type = RESEARCH` 或 `GENERATE`
- 明确 `goal`
- 明确 `success_criteria`

### Step 2：Research Agent 查询上下文

调用：

- `query_context`

输出：

- 项目上下文
- 可复用 memories
- 历史 artifacts
- 相关 episodes

### Step 3：Research Agent 写入关键记忆

调用：

- `write_memory`

写入：

- 项目背景
- 研究结论
- 关键事实

### Step 4：Research Agent 追加 trace

调用：

- `append_trace`

写入：

- 做了哪些分析
- 用了哪些工具
- 得出了哪些关键判断

### Step 5：Research Agent 产出研究 artifact

调用：

- `create_artifact`

### Step 6：Writer Agent 继续同一主线工作

可以有两种方式：

- 在同一个 Episode 里继续追加 trace / artifact
- 或创建新 Episode，并用 `depends_on` / `continues` 关联研究 Episode

### Step 7：Writer Agent 生成管理周报

调用：

- `create_artifact`
- `update_episode_status`

### Step 8：Manager 查看 Episode brief

读取：

- `get_episode_brief`

展示：

- 目标
- 当前状态
- 关键关系
- 关键记忆
- 最新产物
- attention items

## 3. 演示成功标准

演示时至少要能回答：

- 这次工作目标是什么
- 哪些上下文被用了
- 中间发生了什么
- 最终产出了什么
- 哪个 Agent 做了什么
- 管理者现在应该关注什么
