# Cloud-First Sync Architecture

## 目标

回答一个已经明确的产品要求：

`Traceplane` 的正式产品不应以本地数据库为主，而应以云端工作平面为主，本地则提供类似坚果云的同步工作区体验。

## 当前状态

当前仓库里的可运行 demo 仍然是：

- `SQLite`
- 本地 Next.js 应用
- 本地 seed 数据

这只是 demo runtime，不代表正式产品架构。

## 正式产品原则

### 1. 云端优先
正式产品中的权威状态应始终在云端：

- `projects`
- `episodes`
- `memory`
- `trace`
- `artifacts`
- `audit`
- `node_edges`

### 2. 本地工作区是投影，不是主库
本地目录更像：

- sync workspace
- cache
- working copy
- agent-friendly file view

而不是最终主记录。

### 3. 用户看到的是“同步后的工作文件”
体验上可以接近坚果云 / Dropbox：

- 本地能看到文件
- 本地能打开和编辑
- 云端保持最新权威状态
- 历史版本、权限、审计和关系仍由云端控制

## 推荐分层

### Cloud System of Record
- `Postgres`
- `Object Storage`
- `Vector / Retrieval`
- `Queue / Workers`

### Local Projection Layer
- `Traceplane Sync Agent`
- 本地目录映射：

```txt
~/Traceplane/
  {workspace}/
    {project}/
      {episode}/
        artifacts/
        trace/
        snapshots/
        exports/
```

### UI / Manager Surface
- Manager UI 看的是云端 graph 和治理状态
- 本地目录只是补充工作面，不是唯一入口

## 为什么这样更对

### 对正式产品
- 企业更容易接受云端统一治理
- 权限、审计、审批都不容易失控
- 多 Agent 和多人协作共享的是同一份权威状态

### 对本地体验
- Agent 仍然可以在本地文件系统上工作
- 用户仍然可以像操作同步盘一样查看和编辑文件
- 不需要强迫所有工作都只能在浏览器里完成

## 推荐的产品表达

不要说：

`我们把所有内容存到本地，再同步上云`

而要说：

`Traceplane uses a cloud-first work plane, then projects the relevant episode workspace back to local files for agents and operators.`

中文可以说：

`Traceplane 采用云端优先的工作平面，再把相关 episode 工作区同步映射到本地文件系统。`

## 当前建议

### 现在
- 继续保留本地 demo runtime 方便开发和演示

### 下一阶段
- 把 artifact/blob 先抽到对象存储抽象
- 再补 local projection / sync agent
- 最后再考虑完整的冲突处理和离线模式

## 当前已落地的第一步

仓库里现在已经有一条最小可运行链路：

- artifact 内容可优先写入 `R2`
- artifact 详情页可从 `R2` 回读内容
- 可通过命令把某个 `Episode` 投影到本地同步目录

```bash
npm run workspace:sync -- <episodeId> zh
```

默认路径：

```txt
~/Traceplane/{workspace}/{project}/{episode}/
  episode.json
  artifacts/
  trace/timeline.jsonl
```

这还不是最终双向同步器，但已经把“云端为主，本地为投影”的产品方向落实成了第一条真实路径。
