# Cloud Setup Checklist

这份清单只回答一件事：

要把 `Traceplane` 从本地 demo runtime 推到正式的云端工作平面，你现在还需要准备哪些实际值。

## 当前已经有的

- `SUPABASE_PROJECT_URL`
- `SUPABASE_SECRET_KEY`
- `SUPABASE_ANON_KEY`
- `CLOUDFLARE_ACCOUNT_ID`
- `R2_BUCKET`
- `R2_ENDPOINT`
- `APP_BASE_URL`
- `DEFAULT_REGION`
- `SYNC_ROOT_PATH`

## 当前还缺的两个硬阻塞

### 1. 真正可用的 Supabase Postgres 连接串
你现在给的：

`SUPABASE_DB_URL=postgresql://postgres:[YOUR-PASSWORD]@...`

这里的数据库密码还是占位符，所以当前还不能真正连云数据库。

你需要补：

- 实际数据库密码
- 最终可用的 `DATABASE_URL` 或 `SUPABASE_DB_URL`

建议直接在本地 `.env.local` 里写：

```env
DATABASE_URL=postgresql://postgres:REAL_PASSWORD@db.xxx.supabase.co:5432/postgres
```

## 2. 真正可用的 R2 Access Key / Secret
你现在给的：

- `R2_ACCESS_KEY_ID=https://...r2.cloudflarestorage.com`
- `R2_SECRET_ACCESS_KEY=https://...r2.cloudflarestorage.com`

这两个现在还是 endpoint，不是 R2 凭证。

你真正需要的是：

- `R2_ACCESS_KEY_ID=<Cloudflare R2 Access Key ID>`
- `R2_SECRET_ACCESS_KEY=<Cloudflare R2 Secret Access Key>`

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

### 先补这两个值
1. `DATABASE_URL` 的真实密码
2. `R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY` 的真实凭证

### 然后我会继续做
1. 从 SQLite 切到 Postgres
2. 把 artifact/blob 抽到对象存储 runtime
3. 给本地 sync workspace 预留第一版实现

## 安全提醒

你已经把 `SUPABASE_SECRET_KEY` 发到聊天里了。

建议在我完成当前阶段接入后，尽快去 Supabase 轮换这枚 key。
