# Storage Runtime Interface

## 目标
定义一个与具体底层存储引擎解耦的运行时接口。

目的不是过早抽象一切，而是保证：
- 当前默认实现可以稳定推进
- 未来可以接入 `db9`
- 上层 product / graph / governance 不依赖特定存储品牌

## 抽象边界

### 上层系统负责
- workspace / project / episode 业务语义
- graph 节点和边
- policy / permission / audit
- manager review
- API contract

### storage runtime 负责
- 文件命名空间
- blob 读写
- memory 检索支持
- snapshot / branch 原语
- 原始 trace 附件存储

## 默认接口

```ts
type RuntimeScope = {
  workspaceId: string;
  projectId?: string;
  episodeId?: string;
};

type PutBlobInput = {
  path: string;
  contentType: string;
  body: string | Buffer;
  metadata?: Record<string, string>;
};

type SearchMemoryInput = {
  workspaceId: string;
  projectId?: string;
  agentId?: string;
  episodeId?: string;
  query: string;
  topK?: number;
};

interface StorageRuntime {
  createEpisodeNamespace(scope: RuntimeScope): Promise<{ rootPath: string }>;
  putBlob(input: PutBlobInput): Promise<{ uri: string; size: number }>;
  readBlob(uri: string): Promise<{ body: Buffer; contentType?: string }>;
  appendTraceBlob(input: PutBlobInput): Promise<{ uri: string; size: number }>;
  listNamespace(path: string): Promise<Array<{ path: string; size?: number }>>;
  createSnapshot(scope: RuntimeScope, name: string): Promise<{ snapshotId: string }>;
  searchMemory(input: SearchMemoryInput): Promise<
    Array<{ memoryId: string; score: number; excerpt?: string }>
  >;
}
```

## 为什么接口只抽这一层
我们不抽象：
- `episode graph`
- `audit event`
- `access grant`
- `policy hit`

因为这些属于产品核心语义，不应该下沉到 runtime。

我们只抽象：
- namespace
- blob
- retrieval
- snapshot

因为这些是底层实现会变化的地方。

## DefaultRuntime

### 组成
- `Postgres`
- `Object Storage`
- `pgvector`

### 行为
- `createEpisodeNamespace`
  - 只生成路径前缀和索引元数据
- `putBlob`
  - 写对象存储并回写 artifact/blob 元信息
- `appendTraceBlob`
  - 写 JSONL / log append 文件
- `searchMemory`
  - 走 `pgvector` 或全文检索
- `createSnapshot`
  - 先实现为 metadata-level snapshot
  - 后续再升级为更强的 branch/sandbox

### 适用阶段
- 当前 MVP
- 企业可控版本
- 未来私有化 / 合规部署版本

## Db9Runtime

### 对应映射
- table metadata: `db9 postgres`
- blob/files: `fs9`
- embedding / vector search: `embedding()` + `vector`
- snapshot / branch: `db9 branch`
- scheduled jobs: `pg_cron`

### 可利用能力
- files 和 SQL 一体化
- agent-native CLI / skill 接入
- built-in embedding pipeline
- branch 环境复制

### 使用前提
- 接受对 `db9` runtime 的依赖
- 接受其租户模型
- 接受其部署边界

## 我们不应该把什么交给 Db9Runtime
- policy evaluation
- permission graph
- audit explanation
- manager summary
- node / edge 语义组织

即使未来支持 `Db9Runtime`，这些仍由上层系统负责。

## 推荐路径

### 阶段 1
只实现 `DefaultRuntime`

### 阶段 2
让当前代码中的 artifact / trace / memory retrieval 都经由 runtime interface

### 阶段 3
评估 `Db9Runtime` 是否值得作为：
- hosted developer edition
- cloud-only rapid deployment backend
- agent sandbox backend

## 决策原则

### 什么时候优先 DefaultRuntime
- 企业可控性更重要
- 未来私有化概率高
- 需要长期稳定 schema 和迁移权
- graph / governance 是核心

### 什么时候考虑 Db9Runtime
- 更偏 developer-first
- 更偏 cloud-native
- 更偏 agent sandbox / rapid prototyping
- 想快速获得 files + vector + cron + branch 的统一 runtime

## 最终判断
当前项目默认采用：

**DefaultRuntime 作为主实现**

未来如果有明确场景，再增加：

**Db9Runtime 作为可选实现**
