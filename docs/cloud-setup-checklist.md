# Cloud Setup Checklist

这份清单只回答一件事：

要把 `Traceplane` 从本地 demo runtime 推到正式的云端工作平面，你现在还需要准备哪些实际值。

## 当前已经有的

- `SUPABASE_PROJECT_URL`
- `SUPABASE_POOLER_URL`
- `SUPABASE_DB_URL`
- `SUPABASE_SECRET_KEY`
- `SUPABASE_ANON_KEY`
- `CLOUDFLARE_ACCOUNT_ID`
- `R2_BUCKET`
- `R2_ENDPOINT`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `APP_BASE_URL`
- `DEFAULT_REGION`
- `SYNC_ROOT_PATH`

## 当前已验证通过

### 1. 本地云端配置完整性
下面这些检查已经可以在本地通过：

```bash
npm run cloud:verify
```

### 2. R2 连接
R2 凭证和 endpoint 已经验证通过：

```bash
npm run cloud:verify:r2
```

### 3. 云端 Postgres schema 命令路径
仓库已经有：

```bash
npm run db:cloud:push
```

这条命令现在会优先使用 `SUPABASE_POOLER_URL`，否则回退到 `SUPABASE_DB_URL`。

## 当前剩余的硬阻塞

### Supabase Postgres 连接入口
当前已经不是 secret 缺失，而是云端激活仍在 fallback。

最新 Railway 启动日志已经明确：

- 直连 `db.<project-ref>.supabase.co:5432` 时，云端 Postgres 激活失败
- Traceplane 会自动回退到 sqlite，保持服务在线

根据 Supabase 官方连接文档，Railway 这类 IPv4 / serverless 环境更适合使用 **session pooler**。

来源：
- https://supabase.com/docs/guides/database/connecting-to-postgres

所以当前剩余的真正阻塞是：

- 还没有把 `SUPABASE_POOLER_URL` 配进部署环境

## 推荐最终本地配置

```env
DATABASE_URL=
SUPABASE_PROJECT_URL=
SUPABASE_POOLER_URL=
SUPABASE_SECRET_KEY=
SUPABASE_ANON_KEY=

CLOUDFLARE_ACCOUNT_ID=
R2_BUCKET=
R2_ENDPOINT=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=

APP_BASE_URL=https://traceplane.cc
DEFAULT_REGION=global-us-cn
SYNC_ROOT_PATH=~/Traceplane
```

## 当前建议

### 然后我会继续做
1. 从 SQLite 切到 Postgres
2. 把 artifact/blob 抽到对象存储 runtime
3. 给本地 sync workspace 预留第一版实现

## 安全提醒

你已经把 `SUPABASE_SECRET_KEY` 发到聊天里了。

建议在我完成当前阶段接入后，尽快去 Supabase 轮换这枚 key。
