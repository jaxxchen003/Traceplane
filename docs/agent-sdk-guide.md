# Traceplane Agent SDK 使用指南

Traceplane Agent SDK 让 Agent 能够直接向 Traceplane 平台上报遥测数据。

## 安装

```bash
npm install @traceplane/agent-sdk
```

## 快速开始

### 1. 初始化 SDK

```typescript
import { TraceplaneSDK } from '@traceplane/agent-sdk';

const sdk = new TraceplaneSDK({
  baseUrl: 'http://localhost:3000',  // Traceplane 实例地址
  projectId: 'q2-customer-pulse',     // 项目 ID
  agentId: 'claude-code',             // Agent ID
  debug: true                         // 开启调试日志
});
```

### 2. 创建 Episode

```typescript
const session = await sdk.startEpisode({
  title: '数据分析任务',
  goal: '分析用户行为数据',
  successCriteria: '生成分析报告',
  workType: 'RESEARCH'  // RESEARCH | GENERATE | REVIEW | REVISE | APPROVE | SUMMARIZE
});

console.log('Episode created:', session.getCurrentEpisode()?.id);
```

### 3. 记录执行步骤

```typescript
// 普通步骤
await session.step(
  '加载数据',                    // 步骤标题
  '成功加载 1000 条记录'         // 结果
);

// 工具调用
await session.toolUse(
  'data-analyzer',               // 工具名称
  '运行分析',                    // 输入
  '分析完成',                    // 结果
  'SUCCESS'                      // 状态
);

// 错误记录
await session.error(
  'API 调用失败',                // 错误信息
  'Connection timeout after 30s' // 详细原因
);
```

### 4. 创建 Memory

```typescript
await session.memory(
  '关键发现',                    // 标题
  '用户活跃度在周末提升 25%',     // 内容
  {
    type: 'SEMANTIC',            // SEMANTIC | EPISODIC | PROCEDURAL
    importance: 8                // 1-10
  }
);
```

### 5. 创建 Artifact

```typescript
await session.artifact(
  'analysis-report',             // 唯一 key
  '分析报告',                   // 标题
  '# 分析报告\n\n## 关键发现...', // 内容 (Markdown)
  {
    fileType: 'MARKDOWN',       // MARKDOWN | JSON | CSV | HTML | PDF
    sensitivity: 'internal',    // public | internal | confidential
    shareScope: 'project'       // project | workspace | public
  }
);
```

### 6. 完成 Episode

```typescript
await session.complete('任务成功完成');
// 或
await session.fail('API 调用超时');
```

## 完整示例

```typescript
import { TraceplaneSDK } from '@traceplane/agent-sdk';

async function main() {
  const sdk = new TraceplaneSDK({
    baseUrl: 'http://localhost:3000',
    projectId: 'my-project',
    agentId: 'my-agent',
    debug: true
  });

  try {
    const session = await sdk.startEpisode({
      title: 'Weekly Report Generation',
      goal: 'Generate weekly customer feedback report',
      successCriteria: 'Report approved and delivered',
      workType: 'GENERATE'
    });

    console.log('Started episode:', session.getCurrentEpisode()?.id);

    await session.step('Collect feedback', 'Collected 500 responses');
    await session.toolUse('sentiment-analyzer', 'Analyze sentiment', 'Completed');
    await session.memory('Key insight', 'Positive sentiment up 15%');
    
    await session.artifact(
      'weekly-report',
      'Weekly Report',
      '# Weekly Report\n\nPositive sentiment: 85%',
      { fileType: 'MARKDOWN' }
    );

    await session.complete('Report generated successfully');
    console.log('Episode completed');
    
  } catch (error) {
    console.error('Failed:', error);
    process.exit(1);
  }
}

main();
```

## 查看结果

运行后，在浏览器中打开：

```
http://localhost:3000/zh/projects/{projectId}/episodes/{episodeId}
```

你将看到：
- Episode 执行时间线
- 创建的 Memory 条目
- 生成的 Artifact
- 实时 Event Stream

## 环境变量

SDK 支持从环境变量读取配置：

```bash
TRACEPLANE_BASE_URL=http://localhost:3000
TRACEPLANE_PROJECT_ID=my-project
TRACEPLANE_AGENT_ID=my-agent
```

## API 参考

### TraceplaneSession

| 方法 | 说明 |
|------|------|
| `startEpisode(params)` | 创建新 Episode |
| `resume(episodeId)` | 恢复已有 Episode |
| `step(title, result, options)` | 记录执行步骤 |
| `toolUse(name, input, result, status)` | 记录工具调用 |
| `error(message, details)` | 记录错误 |
| `memory(title, content, options)` | 创建 Memory |
| `artifact(key, title, content, options)` | 创建 Artifact |
| `complete(outcome)` | 标记完成 |
| `fail(reason)` | 标记失败 |

### 配置选项

| 选项 | 类型 | 必需 | 说明 |
|------|------|------|------|
| baseUrl | string | Yes | Traceplane API 地址 |
| projectId | string | Yes | 项目 ID |
| agentId | string | Yes | Agent ID |
| apiKey | string | No | API 密钥 |
| timeout | number | No | 请求超时（默认 30s）|
| debug | boolean | No | 调试日志 |

---

更多示例见 `examples/hello-world/`
