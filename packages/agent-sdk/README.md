# Traceplane Agent SDK

用于向 Traceplane 平台上报多 Agent 工作流遥测数据的官方 SDK。

## 安装

```bash
npm install @traceplane/agent-sdk
```

## 快速开始

```typescript
import { TraceplaneSDK } from '@traceplane/agent-sdk';

// 初始化 SDK
const sdk = new TraceplaneSDK({
  baseUrl: 'https://your-traceplane-instance.com',
  projectId: 'your-project-id',
  agentId: 'your-agent-id',
  apiKey: 'your-api-key', // 可选
  debug: true              // 开启调试日志
});

// 创建 Episode 并获取 Session
const session = await sdk.startEpisode({
  title: '数据分析任务',
  goal: '分析用户行为数据',
  successCriteria: '生成分析报告'
});

// 记录执行步骤
await session.step('加载数据', '成功加载 1000 条记录');
await session.toolUse('data-analyzer', '运行分析', '分析完成');

// 创建 Memory
await session.memory(
  '关键发现',
  '用户活跃度在周末提升 25%'
);

// 创建 Artifact
await session.artifact(
  'analysis-report',
  '分析报告',
  '# 用户行为分析报告\n\n## 关键发现...'
);

// 标记完成
await session.complete('分析完成，报告已生成');
```

## API 参考

### TraceplaneSDK

主类，提供便捷的 Episode 管理 API。

#### constructor(config: TraceplaneConfig)

- `baseUrl`: Traceplane 实例地址
- `projectId`: 项目 ID
- `agentId`: Agent ID
- `apiKey`: API 密钥（可选）
- `debug`: 是否开启调试（可选）

#### startEpisode(params): Promise<TraceplaneSession>

创建新的 Episode 并开始 Session。

### TraceplaneSession

Session 管理器，自动处理 Episode 生命周期。

#### step(title, result, options)

记录一个执行步骤。

```typescript
await session.step(
  '处理数据',                    // 步骤标题
  '处理了 100 条记录',            // 结果
  { 
    status: 'SUCCESS',          // 状态
    toolName: 'data-processor', // 使用的工具
    eventType: 'PostToolUse'    // 事件类型
  }
);
```

#### toolUse(toolName, input, result, status)

记录工具调用。

```typescript
await session.toolUse(
  'openai',
  '生成摘要',
  '摘要已生成'
);
```

#### memory(title, content, options)

创建 Memory Item。

```typescript
await session.memory(
  '用户偏好',
  '用户偏好深色主题'
);
```

#### artifact(key, title, content, options)

创建 Artifact。

```typescript
await session.artifact(
  'summary.md',
  '摘要文档',
  '# 摘要\n\n内容...'
);
```

#### complete(outcome)

标记 Episode 完成。

```typescript
await session.complete('任务成功完成');
```

#### fail(reason)

标记 Episode 失败。

```typescript
await session.fail('API 调用超时');
```

## 高级用法

### 使用底层 Client

```typescript
import { TraceplaneClient } from '@traceplane/agent-sdk';

const client = new TraceplaneClient({
  baseUrl: 'https://...',
  projectId: '...',
  agentId: '...'
});

// 直接调用 API
const episode = await client.createEpisode({...});
const trace = await client.appendTrace({...});
```

### 订阅实时事件

```typescript
const unsubscribe = client.subscribeEvents(
  episodeId,
  (event) => {
    console.log('收到事件:', event);
  }
);

// 取消订阅
unsubscribe();
```

### 上传文件

```typescript
import fs from 'fs';

const fileContent = fs.readFileSync('./report.pdf');

await client.createArtifact({
  episodeId: '...',
  artifactKey: 'report',
  titleI18n: { zh: '报告', en: 'Report' },
  fileType: 'PDF',
  sensitivity: 'internal',
  shareScope: 'project',
  fileContent,
  fileName: 'report.pdf'
});
```

## 环境变量

SDK 支持从环境变量读取配置：

```bash
TRACEPLANE_BASE_URL=https://your-instance.com
TRACEPLANE_PROJECT_ID=your-project-id
TRACEPLANE_AGENT_ID=your-agent-id
TRACEPLANE_API_KEY=your-api-key
```

## 许可证

MIT
