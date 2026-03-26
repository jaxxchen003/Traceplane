# Claude First Episode Playbook

目标：
用 Claude Code 跑出第一条真实可复盘的 Episode，而不是只验证模型回答。

## Before You Start

先在仓库根目录执行：

```bash
npm run claude:setup -- q2-customer-pulse research-agent
npm run claude:verify
```

## Trial Prompt

把下面这段直接给 Claude Code：

```text
You are working inside a Traceplane project.

Your task:
Review the current customer feedback material in this repository and create a short management-facing research note.

Behavior requirements:
- create or continue the correct episode
- query context before major work
- record key facts as memory
- record important steps as trace
- register the final note as an artifact
- do not log every tiny step; log only meaningful decisions, tool usage, and outputs
```

## What Good Looks Like

成功不是“输出很长”，而是：

1. Claude 自动创建或接入了一条 Episode
2. 首页出现新的 attention / activity 信号
3. Episode Review 里能看到：
- user prompt
- tool events
- final stop event
4. 产物页面能看到研究 note

## What To Check After The Run

### Episode Review
- 是否有一条新的 Episode
- 状态是否合理
- trace 是否不是空的
- 是否能看出 Claude 用了哪些工具

### Audit View
- 是否有 `claude_hook_event`
- 是否有 episode / trace 写入证据

### Artifact Detail
- 是否能打开最终 note
- 是否能回链到来源 Episode

## What Counts As A Failed Trial

下面任意一个出现，都不算通过：

- Claude 没有写入 Episode
- 只有最终结果，没有过程
- 有过程但没有 artifact
- 页面里看不到新的工作主线
