# Traceplane 测试指南

## 快速开始

```bash
# 1. 启动开发服务器
npm run dev

# 2. 运行所有测试
npm test

# 3. 查看覆盖率
npm run test:coverage
```

## 测试类型

### 1. SDK 单元测试

**位置**: `packages/agent-sdk/src/__tests__/`

测试 SDK 的各个模块：

```bash
cd packages/agent-sdk
npm test
```

### 2. API 集成测试

**位置**: `tests/api-integration/`

测试 API 端点与数据库集成：

```bash
# 需要开发服务器运行
npm run test
```

### 3. E2E 测试

**位置**: `tests/e2e/`

测试完整工作流：

```bash
npm run test:e2e
```

## 测试覆盖率

当前测试覆盖：

| 模块 | 覆盖率 | 状态 |
|------|--------|------|
| SDK Client | 85% | ✅ |
| SDK Session | 90% | ✅ |
| API Episodes | 80% | ✅ |
| API Memory | 75% | ✅ |
| E2E Workflow | 100% | ✅ |

## 接入真实 Agent 测试

### Claude Code 集成测试

```bash
# 运行 Claude hook bridge 测试
npm run claude:hook:test

# 完整集成测试
npm run test:integration:claude
```

### 手动测试步骤

1. **启动 Traceplane**
   ```bash
   npm run dev
   ```

2. **运行 Hello World Demo**
   ```bash
   cd examples/hello-world
   npm run demo
   ```

3. **验证结果**
   - 打开 http://localhost:3000/zh/projects/q2-customer-pulse
   - 检查新 Episode 是否出现
   - 查看 Timeline、Memory、Artifact

4. **测试 Event Stream**
   - 打开项目页面
   - 观察 Event Stream 侧边栏
   - 确认实时事件推送

## 常见问题

### 测试超时

增加超时时间：

```typescript
vi.setConfig({ testTimeout: 30000 });
```

### API 测试需要数据库

确保数据库已初始化：

```bash
npm run db:setup
```

### E2E 测试需要服务器

确保开发服务器在运行：

```bash
npm run dev
```

## 持续集成

测试已集成到 GitHub Actions：

```yaml
- name: Run tests
  run: npm run test:run

- name: Check coverage
  run: npm run test:coverage
```
