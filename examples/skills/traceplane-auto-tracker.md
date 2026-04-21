# TracePlane Auto-Tracker Skill

自动检测任务意图并创建 Episode 追踪执行过程。无需固定句式，自然描述即可开始追踪。

## 功能特性

1. **意图检测** - 自动识别实现任务、bug 修复、重构、配置等任务类型
2. **自动 Episode 创建** - 检测到任务时自动创建 Episode 并开始追踪
3. **操作痕迹记录** - 每一步操作都被记录为 Trace
4. **生命周期管理** - 自动状态更新（PLANNED → IN_PROGRESS → COMPLETED）
5. **Memory 记录** - 重要决策自动存储为 Memory
6. **制品注册** - 生成的代码文件自动注册为 Artifact

## 工作原理

```
你：帮我重写注册状态机的错误处理逻辑
    ↓
[Auto-Tracker] 检测到实现任务
[Auto-Tracker] 创建 Episode: "重写注册状态机错误处理逻辑"
[Auto-Tracker] 开始追踪...
    ↓
[执行过程中每次文件修改自动 trace]
    ↓
你：完成了
[Auto-Tracker] Episode 标记为 COMPLETED
```

## 意图检测模式

### 实现任务
- "帮我实现..." / "帮我创建..." / "帮我写..."
- "implement X" / "create Y" / "add feature"

### Bug 修复
- "修复..." / "修一下..." / "fix X"
- "X 不工作了" / "X is broken"

### 重构
- "重构..." / "重写..." / "refactor X"
- "优化..." / "improve X"

### 配置
- "配置..." / "设置..." / "setup X"

## 安装方式

### 方式一：用户级安装（推荐）

```bash
# 复制 skill 到 Claude Code 用户目录
cp -r examples/skills/traceplane-auto-tracker.md ~/.claude/skills/

# 或创建目录结构
mkdir -p ~/.claude/skills/traceplane-auto-tracker
cp examples/skills/traceplane-auto-tracker.md ~/.claude/skills/traceplane-auto-tracker/SKILL.md
```

### 方式二：项目级安装

```bash
# 在项目目录
mkdir -p .claude/skills
cp examples/skills/traceplane-auto-tracker.md .claude/skills/traceplane-auto-tracker/SKILL.md
```

### 方式三：复制 CLAUDE.md 规则

如果只想使用规则而不安装完整 skill：

```bash
cp examples/CLAUDE.md.example CLAUDE.md
# 然后根据项目情况修改
```

## 两种追踪模式

| | 自动追踪（Skill） | CLAUDE.md 规则 |
|---|---|---|
| 创建时机 | Skill 检测到任务意图时自动 | Agent 判断后自动 |
| 追踪精度 | 更精准的模式匹配 | 依赖 Agent 判断 |
| 配置成本 | 需安装 Skill | 仅复制文件 |
| 适用场景 | 日常开发、长期使用 | 轻度使用、快速体验 |

## 使用示例

### 自动追踪（无需固定句式）

```
你：帮我把代理池改成按成功率排序
↓ 自动创建 Episode 并追踪所有修改

你：完成后说"完成了"或"done"
↓ Episode 自动标记为 COMPLETED
```

### 手动控制

```
你：创建一个 Episode，目标是优化代理池排序策略
你：任务完成了，结束追踪
```

### 查询状态

```
你：当前任务状态？
你：显示 trace 历史
你：记得有哪些决策？
```

## 核心原则

1. **Episode 判断** - 只为新的业务目标、独立交付物创建 Episode
2. **记录粒度** - 优先记录关键事实、关键决策、关键异常、关键产物
3. **状态切换** - 只在工作阶段真实变化时切换状态
4. **关系建立** - 关系明确时才使用 `link_episode`

## Episode 状态

- `PLANNED` - 已规划
- `IN_PROGRESS` - 执行中
- `BLOCKED` - 被阻塞
- `IN_REVIEW` - 审核中
- `COMPLETED` - 已完成
- `FAILED` - 失败

## 相关资源

- [Agent Work Graph Skill](agent-work-graph-skill.md) - Traceplane 基础接入指南
- [Claude Code 集成示例](../claude-integration/README.md) - Claude Code + Traceplane 完整集成方案
- [Traceplane 官网](https://traceplane.cc) - 更多信息

---

**版本**: 1.0.0
**更新日期**: 2026-04-22
**兼容性**: Claude Code + Traceplane MCP