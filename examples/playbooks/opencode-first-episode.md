# OpenCode First Episode Playbook

目标：
用 OpenCode 跑出第一条真实可复盘的 Episode。

## Before You Start

先在仓库根目录执行：

```bash
npm run opencode:setup
npm run opencode:verify
```

## Trial Prompt

把下面这段直接给 OpenCode：

```text
You are working inside an Enterprise Agent Work Graph project.

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

1. OpenCode 接入了 `agentWorkGraph`
2. 新建或继续了一条合理的 Episode
3. Episode Review 里有关键 trace
4. 产物页面能打开最终 note

## Alternative Trial Path

如果你当前不方便做实时试跑，也可以先走离线路径：

```bash
npm run normalize:opencode -- \
  examples/imports/opencode-export.json \
  q2-customer-pulse \
  research-agent \
  .tmp/opencode-normalized.json

npm run import:transcript -- .tmp/opencode-normalized.json
```

这条链主要验证：

- OpenCode export 能否稳定被标准化
- 导入后能否形成完整 Episode / trace / artifact
