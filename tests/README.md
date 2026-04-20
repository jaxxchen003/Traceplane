# Traceplane 测试套件

本目录包含 Traceplane 的完整测试套件，包括 SDK 单元测试、API 集成测试和 E2E 测试。

## 目录结构

```
tests/
├── README.md                 # 本文件
├── setup.ts                 # 全局测试配置
├── vitest.config.ts         # Vitest 配置
├── api-integration/         # API 集成测试
│   ├── episodes.test.ts   # Episode API 测试
│   ├── memory.test.ts     # Memory API 测试
│   └── artifacts.test.ts  # Artifact API 测试
└── e2e/                     # 端到端测试
    └── full-workflow.test.ts
```

## 运行测试

### 1. 单元测试（SDK）

```bash
cd packages/agent-sdk
npm test
```

### 2. 集成测试（API）

确保开发服务器在运行：

```bash
npm run dev

# 在另一个终端运行测试
npm test
```

### 3. E2E 测试

```bash
npm run test:e2e
```

### 4. 覆盖率报告

```bash
npm run test:coverage
```

## 测试分类

### 单元测试

- **位置**: `packages/agent-sdk/src/__tests__/`
- **目标**: SDK 的各个模块
- **特点**: 快速、独立、使用 Mock

### 集成测试

- **位置**: `tests/api-integration/`
- **目标**: API 端点
- **特点**: 需要运行中的服务器、真实数据库

### E2E 测试

- **位置**: `tests/e2e/`
- **目标**: 完整用户工作流
- **特点**: 模拟真实 Agent 使用场景

## 编写新测试

### SDK 单元测试示例

```typescript
import { describe, it, expect } from 'vitest';
import { TraceplaneClient } from '../client';

describe('TraceplaneClient', () => {
  it('should create episode', async () => {
    const client = new TraceplaneClient(config);
    const episode = await client.createEpisode({...});
    expect(episode.id).toBeDefined();
  });
});
```

### API 集成测试示例

```typescript
import { describe, it, expect } from 'vitest';

describe('Episodes API', () => {
  it('should create episode', async () => {
    const response = await fetch('/api/episodes', {...});
    expect(response.status).toBe(201);
  });
});
```

## CI 集成

测试已集成到 CI 流程：

```bash
npm run ci
# 等价于: npm run lint && npm run build && npm run test:run
```
