# Product Surface

这份文档回答一个更具体的问题：

第一版产品如果真的做出来，用户看到的页面、视图、交互和演示形态应该是什么样。

目标不是设计完整 UI，而是定义第一版产品的“可见形态”。

## 1. 第一版产品的整体形态

MVP 最终应表现成一个轻量的三层产品：

1. Agent 接入面
2. Episode 工作图视图
3. Manager 复盘面

下一阶段则要再补上一层：

4. Work Plane Runtime Surface

也就是：

- 当前工作平面是不是云端模式
- 当前 host 接入是否活跃
- 当前本地工作区投影是否存在
- 当前 artifact/blob 是否已进入正式存储层

它不是通用 workspace，不是文件管理器，也不是聊天前端。

## 2. 用户会看到的核心对象

第一版用户真正会接触到的对象，应该只有这些：

- Workspace
- Project
- Agent
- Episode
- Memory
- Trace
- Artifact
- Audit Event

其中真正的主角只有两个：

- `Project`
- `Episode`

`Project` 是协作边界，`Episode` 是工作主线。

## 3. 第一版页面清单

MVP 不需要很多页面。建议只做下面 6 个页面或 6 个主视图。

### 3.1 Episode Command Center
**用途**
- 作为默认首页，先展示需要处理的 Episode，而不是先展示项目目录
- 把管理者注意力优先分配给待处理、异常和关键运行中的工作

**用户看到什么**
- `Needs Attention`
- `Blocked / Risk`
- `Active Work`
- `Recent Activity`
- 顶部 graph theater 和 attention model 摘要

**用户能做什么**
- 直接进入某条 Episode
- 快速定位阻塞、风险、待 review 的工作
- 再向上切换到 Project 视图

**为什么要有**
- 高频用户是执行管理，不是纯项目浏览
- 首页的职责不是“列目录”，而是“分配注意力”

### 3.2 Project List
**用途**
- 展示当前有哪些项目
- 作为 manager 查看项目边界和价值归属的入口

**用户看到什么**
- Project 名称
- 最近活跃时间
- Agent 数量
- Episode 数量
- 最近产物数
- 风险事件或待处理提示

**用户能做什么**
- 进入某个项目
- 过滤最近活跃 / 风险较高项目

**为什么要有**
- 没有 project list，产品会看起来像一堆零散任务
- 企业管理视角首先要看到项目边界

### 3.3 Project Overview
**用途**
- 提供某个项目的总览，而不是直接掉进单条任务

**用户看到什么**
- 项目基本信息
- 关联 Agent 列表
- 最近 episodes 列表
- 最近产物
- 风险事件摘要
- 生效 policy 版本摘要

**用户能做什么**
- 点进某个 episode
- 查看某个 agent 最近参与了哪些任务
- 快速筛选“失败 / 待审批 / 最近生成过 artifact”的 episode

**这一页的价值**
- 证明系统不是单任务查看器，而是项目级管理入口

### 3.4 Episode Review
这是第一版最重要的页面。

**用途**
- 展示单条 `episode` 的完整工作链路

**用户看到什么**
- Episode 标题、状态、开始时间、结束时间
- 参与 Agent
- 关键 summary
- 生效 policy 版本
- 风险命中 / 权限拒绝摘要
- 最终 artifact 列表

**核心内容区**
- Timeline
- Memory Panel
- Artifact Panel
- Audit Summary

**用户能做什么**
- 沿 timeline 回看任务执行过程
- 点开某个 trace event 看它引用了哪些 memory
- 点开某个 artifact 看它来源于哪些 trace / memory
- 查看是否有权限拒绝、策略命中、人工审批事件

**为什么这是产品核心**
- 如果这一页做不成立，整个产品就会退化成日志系统 + 文件列表

### 3.5 Artifact Detail
**用途**
- 让用户查看单个产物的当前状态和来源链路

**用户看到什么**
- Artifact 类型
- 当前版本
- 历史版本
- 生成 Agent
- 来源 episode
- 关联 trace
- 依赖 memory
- 共享范围

**用户能做什么**
- 预览 artifact
- 查看版本历史
- 回链到来源 episode
- 看这个产物被哪些其他 Agent 使用过

**为什么要单独有**
- 企业管理中，“产物”往往比“过程”更接近业务价值
- 第一版必须证明 artifact 不是孤立文件，而是可追溯工作资产

### 3.6 Audit View
**用途**
- 提供治理和合规的最小可见面

**用户看到什么**
- 时间
- Actor
- Action
- Target
- Result
- Policy hit / Permission deny

**用户能做什么**
- 过滤某个 episode 的审计记录
- 过滤某个 agent 的访问行为
- 查看敏感动作和失败动作

**为什么要有**
- 没有 audit view，就无法对外证明“治理能力”不是口头承诺

## 4. Episode Review 页的推荐布局

如果只定义一张最重要的页面，应该是这个布局。

### 顶部摘要区
- Episode 名称
- 状态
- 时间范围
- 参与 Agent
- 项目
- policy version

### 中间主区：Timeline
- 触发事件
- 关键 memory 引用
- 工具调用
- 决策节点
- 错误 / 重试
- artifact 生成

### 右侧辅助区
- Memory Summary
- Artifact Summary
- Audit Summary

### 底部关系区
- 来源与去向关系
- 当前 episode 与其他 episode / artifact 的引用关系

第一版不必做复杂图谱画布，但要让用户看到“这是连起来的”。

## 5. 第一版最重要的交互动作

MVP 不靠花哨交互取胜，只需要把几个关键动作做顺。

### 5.1 从首页进入 Episode
用户先在 Episode Command Center 里看到需要处理的工作，再进入单条任务复盘。

### 5.2 从 Project 进入 Episode
用户点击某个项目，查看项目级上下文，再进入最近 episode。

### 5.3 从 Timeline 点回来源 Memory
用户在 trace 中点开一次决策，能知道它用了哪些上下文。

### 5.4 从 Artifact 回链到来源过程
用户点开一个产物，能知道它是谁生成的、依据什么生成的。

### 5.5 查看权限拒绝和策略命中
用户能快速定位“为什么这个动作没执行”。

### 5.6 看见多 Agent 的接力关系
用户能明确看出：
- 第一个 Agent 产出了什么
- 第二个 Agent 消费了什么
- 最终形成了什么结果

这一步直接决定产品是不是“共享工作图谱”。

## 6. 第一版 demo 的推荐脚本

为了保证展示足够聚焦，建议 demo 只演一条固定剧本。

### 角色
- Manager
- Research Agent
- Writer Agent

### 剧本
1. Manager 创建一个项目
2. Research Agent 创建 episode 并写入项目背景 memory
3. Research Agent 追加多个 trace event，并生成研究结论 artifact
4. Writer Agent 在同一 project 下读取前面的结论和部分 trace
5. Writer Agent 生成最终周报或汇报文档 artifact
6. Manager 进入 project overview
7. Manager 点开 episode review，查看 timeline、来源、产物和 audit

### 这一套剧本证明什么
- 不是单 Agent
- 不是只存 memory
- 不是文件散落
- 管理者不看聊天窗口也能完成复盘

## 7. 对不同用户，第一版产品看起来分别像什么

### 对开发者
像一个可接入的 Agent 工作数据 API：
- 有固定对象模型
- 有清晰写入入口
- 有统一 graph 查询入口

### 对管理者
像一个任务复盘和工作资产查看台：
- 看项目
- 看任务
- 看产物
- 看风险
- 看审计

### 对企业平台团队
像一个 Agent 数据平面和治理平面原型：
- 有边界
- 有主线
- 有证据链

## 8. 第一版不要长成什么样

### 不要长成网盘
- 不要把首页做成文件树
- 不要让 artifact 列表替代任务主线

### 不要长成日志后台
- 不要只有 trace table
- 不要让用户只能看原始事件流

### 不要长成聊天前端
- 不要让核心价值变成对话 UI
- 不要让 episode 被误解成 conversation thread

### 不要长成 BI 仪表盘
- 第一版不需要大量 KPI 卡片
- 不需要复杂 cross-project analytics

## 9. 第一版最小可交付视觉清单

如果只做一个可演示的最小产品，建议至少有：

- 一个 Project List
- 一个 Project Overview
- 一个 Episode Review
- 一个 Artifact Detail
- 一个 Audit View

如果资源更紧，可以压成 3 个主页面：

1. Project Overview
2. Episode Review
3. Audit View

## 10. 第一版产品的“用户感知”

如果第一版做对，用户的直觉不应该是：
“这是另一个文件系统”。

而应该是：
“这是一个能把 Agent 工作过程、结果和责任链串起来的系统”。

## 11. 一句话总结

第一版产品的可见形态，不应该是一个大平台。

它应该像一个很克制的工作图谱查看器：
- 上面能接 Agent
- 中间能看 episode 主线
- 下面能查产物和审计

只要这三个面成立，MVP 的产品形态就成立。
