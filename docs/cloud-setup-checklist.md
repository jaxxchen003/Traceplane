# Cloud Setup Checklist

这份清单只回答一件事：

要把 `Traceplane` 从本地 demo runtime 推到正式的云端工作平面，你现在还需要准备哪些实际值。

## 当前已经有的

- `SUPABASE_PROJECT_URL`
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

这条命令现在会真正尝试用 `prisma/schema.postgres.prisma` 连 `SUPABASE_DB_URL`。

## 当前剩余的硬阻塞

### Supabase Postgres 连接性
当前已经不是配置缺失，而是：

- 本机 / 当前执行环境无法真正连上 `db.jtwbhglweyebzyvkyasr.supabase.co:5432`

现象是：

- `npm run db:cloud:push`
- `npm run cloud:verify:supabase`

都会落到数据库 reachability 错误，而不是变量缺失错误。

也就是说，现在剩下的问题是：

- 网络 / DNS / 可达性
- 或 Supabase 连接入口本身需要调整

## 推荐最终本地配置

```env
DATABASE_URL=
SUPABASE_PROJECT_URL=
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
