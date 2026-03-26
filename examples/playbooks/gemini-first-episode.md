# Gemini First Episode Playbook

目标：
用 Gemini CLI 跑出第一条真实可复盘的 Episode。

## Before You Start

先在仓库根目录执行：

```bash
npm run gemini:setup
npm run gemini:verify
```

## Trial Prompt

把下面这段直接给 Gemini CLI：

```text
You are working inside a Traceplane project.

Your task:
Review the customer feedback material in this repository and create a short management-facing weekly research note.

Behavior requirements:
- create or continue the correct episode
- query context before major work
- only write meaningful memory items
- append trace for key tool usage and decisions
- register the final note as an artifact
```

## What Good Looks Like

通过标准：

1. Gemini CLI 接入了 `agentWorkGraph`
2. 新建或继续了一条合理的 Episode
3. Episode Review 里有关键 trace
4. 产物页面能打开最终 note

## What To Check After The Run

### Episode Review
- 是否有一条新的 Episode
- 状态是否合理
- trace 是否不是空的
- 是否能看出 Gemini CLI 做了哪些关键步骤

### Artifact Detail
- 是否能打开最终 note
- 是否能回链到来源 Episode

### Home Attention Model
- 首页是否出现了新的 attention / activity signal
