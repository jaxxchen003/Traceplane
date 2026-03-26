# Deploying The Cloud Runtime

## 目标

把 `Traceplane` 从本地 demo runtime 部署成正式云端工作平面时，明确：

- 哪些环境变量必须放在部署平台
- 哪些只属于服务端
- 哪些不是部署平台必需，而是本地同步代理使用

当前默认目标平台先按：

- `Railway`

来描述，但这份约定同样适用于其他支持服务端环境变量的平台。

## Railway 上必须配置的变量

### 服务端 secret
- `SUPABASE_SECRET_KEY`
- `SUPABASE_DB_URL`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`

### 服务端 runtime config
- `SUPABASE_PROJECT_URL`
- `SUPABASE_ANON_KEY`
- `CLOUDFLARE_ACCOUNT_ID`
- `R2_BUCKET`
- `R2_ENDPOINT`
- `APP_BASE_URL`
- `DEFAULT_REGION`

## 可以暂时不进 Railway 的变量

### 本地投影 / sync agent 专用
- `SYNC_ROOT_PATH`

这类值对本地 CLI 和 sync agent 有意义，但对 Railway 容器内的 Web 服务本身不是强依赖。

## 当前建议的 Railway 变量集合

```env
SUPABASE_PROJECT_URL=
SUPABASE_DB_URL=
SUPABASE_SECRET_KEY=
SUPABASE_ANON_KEY=

CLOUDFLARE_ACCOUNT_ID=
R2_BUCKET=
R2_ENDPOINT=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=

APP_BASE_URL=https://traceplane.cc
DEFAULT_REGION=global-us-cn
```

## 当前是否要配置 DATABASE_URL

短期内：

- 可以不在 Railway 上单独配置 `DATABASE_URL`
- 仍以 `SUPABASE_DB_URL` 作为云端 Postgres 准备值

等 Prisma 正式从 SQLite 切到 Postgres 时，再统一收敛。

## 安全原则

### 1. 不要把 secret 暴露到前端
以下变量只能在服务端使用：

- `SUPABASE_SECRET_KEY`
- `SUPABASE_DB_URL`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`

### 2. 对象存储保持私有
- `R2` bucket 默认私有
- 通过后端读写
- 未来如果需要下载，再由后端签发受控 URL

### 3. 权限不要依赖对象存储目录结构
企业权限仍应建立在：

- `workspace`
- `project`
- `episode`
- `access_grants`
- `policies`

以及应用层鉴权逻辑之上。

## 运行前建议检查

```bash
npm run cloud:verify
npm run cloud:manifest
npm run cloud:verify:r2
npm run cloud:verify:supabase
```

## 当前阶段结论

`Traceplane` 的正式产品运行模式应该是：

- 云端 `Supabase + R2` 作为 system of record
- Railway 仅承载 web / api / MCP service
- 本地 `~/Traceplane` 作为投影和 working copy
