# Postgres Cutover Plan

## 目标

在不破坏当前 `SQLite demo runtime` 的前提下，为 `Traceplane` 的正式云端主库建立一条清晰的迁移路径。

当前仓库的现实状态是：

- 本地运行依赖 `prisma/schema.prisma`
- 该 schema 仍以 `sqlite` 为 provider
- 线上正式产品目标则是 `Supabase Postgres`

所以当前不应直接粗暴替换主 schema，而应先建立：

- `SQLite demo schema`
- `Postgres cloud schema`

并行存在的过渡期。

## 当前做法

仓库里现在新增：

- `prisma/schema.postgres.prisma`

它与当前业务模型保持一致，但 provider 切到：

- `postgresql`
- `SUPABASE_DB_URL`（运行时优先由 `SUPABASE_POOLER_URL` 注入）

## 当前可执行命令

把云端 schema 推到 Supabase：

```bash
npm run db:cloud:push
```

这条命令当前只做：

- `db push`
- `--skip-generate`

如果部署环境里存在：

- `SUPABASE_POOLER_URL`

则应优先把它注入到 `SUPABASE_DB_URL` 再执行。

原因是：

- 当前默认 Prisma client 仍服务于 SQLite demo
- 现在还不应该让本地 app 直接切到 Postgres client

## 为什么现在不做完整 cutover

因为当前仍有两条路径需要并存：

### 1. demo runtime
- 本地开发
- Railway 当前线上 demo
- seeded demo 数据

### 2. cloud runtime
- Supabase Postgres
- R2 blob/object storage
- 后续正式 manager/control plane

## 推荐切换顺序

### Phase 1
- 保持 SQLite demo 不动
- 维护 `schema.postgres.prisma`
- 让云端 schema 先可创建

### Phase 2
- 把 artifact/blob 继续迁移到云端
- 把一部分读路径从 inline 过渡到 `R2`
- 补 Postgres bootstrap / import 流

### Phase 3
- 单独生成 Postgres Prisma client
- 让 cloud runtime 先通过 feature flag 跑起来
- 保持失败自动回退到 sqlite

### Phase 4
- 再决定是否替换默认 Prisma datasource

## 当前结论

`Traceplane` 现在不应该“一步切库”，而应该：

**先让 Postgres 成为正式产品主库候选，再逐步把 demo runtime 从 SQLite 迁走。**
