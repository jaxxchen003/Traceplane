# Episode Relations

## 1. 为什么 Episode 关系重要

单个 Episode 里的 `memory / trace / artifact` 是一次工作的内部骨架。

多个 Episode 之间的关系，才是整个 `Project` 的工作网络骨架。

## 2. 第一版保留的 6 类关系

- `depends_on`
- `reviews`
- `supersedes`
- `continues`
- `splits_from`
- `references`

## 3. 每类关系的业务含义

### `depends_on`

后一个 Episode 依赖前一个 Episode 的结果才能成立。

### `reviews`

一个 Episode 的职责是审查、校验或复盘另一个 Episode。

### `supersedes`

新 Episode 的结果替代旧 Episode，旧结果不再作为当前有效版本。

### `continues`

后一个 Episode 是前一个 Episode 的继续推进，而不是新的业务目标。

### `splits_from`

一个较大的工作被拆成多个新的 Episode 并行推进。

### `references`

一个 Episode 参考了另一个 Episode 的结果，但不构成强依赖。

## 4. 默认自动化策略

- `depends_on = auto`
- `reviews = assisted`
- `supersedes = assisted`
- `continues = manual`
- `splits_from = manual`
- `references = manual`

## 5. 关系推断总原则

### 原则 1：意图前置声明

涉及工作意图和责任归属的关系，优先在创建 Episode 时声明。

### 原则 2：证据后置推断

涉及实际使用、执行过程和结果事实的部分，可以在运行后由系统补强或验证。

一句话：

意图前置声明，证据后置推断。

## 6. 三类核心关系如何判断

### `depends_on`

核心判断不是“看过”，而是这次工作是否建立在另一条工作结果之上。

### `reviews`

核心判断不是“看了别人”，而是这次工作的主要职责是否就是判断另一条工作的质量、风险或可接受性。

### `supersedes`

核心判断不是“更新了一下”，而是新结果是否替代旧结果成为当前有效版本。
