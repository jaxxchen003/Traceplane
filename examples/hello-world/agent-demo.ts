import { TraceplaneSDK } from '@traceplane/agent-sdk';

async function main() {
  const baseUrl = process.env.TRACEPLANE_BASE_URL || 'http://localhost:3000';
  const projectId = process.env.TRACEPLANE_PROJECT_ID || 'q2-customer-pulse';
  const agentId = process.env.TRACEPLANE_AGENT_ID || 'research-agent';

  console.log('🚀 Starting Traceplane Hello World Demo\n');
  console.log(`   Base URL: ${baseUrl}`);
  console.log(`   Project ID: ${projectId}`);
  console.log(`   Agent ID: ${agentId}\n`);

  const sdk = new TraceplaneSDK({
    baseUrl,
    projectId,
    agentId,
    debug: true
  });

  try {
    const session = await sdk.startEpisode({
      title: { zh: 'Hello World 演示', en: 'Hello World Demo' },
      goal: { zh: '演示 Traceplane Agent SDK 的基本用法', en: 'Demonstrate basic Traceplane Agent SDK usage' },
      successCriteria: { zh: '成功创建 Episode 并上报 Trace', en: 'Successfully create Episode and report traces' },
      summary: { zh: '这是一个简单的 Hello World 演示任务', en: 'This is a simple Hello World demo task' },
      workType: 'GENERATE'
    });

    console.log('\n📋 Episode created successfully');
    console.log(`   Episode ID: ${session.getCurrentEpisode()?.id}\n`);

    await session.step(
      { zh: '初始化 Agent', en: 'Initialize Agent' },
      { zh: 'Agent 初始化完成', en: 'Agent initialized successfully' },
      { eventType: 'UserPromptSubmit', status: 'SUCCESS' }
    );

    await session.step(
      { zh: '分析输入数据', en: 'Analyze input data' },
      { zh: '数据格式验证通过', en: 'Data format validation passed' },
      { eventType: 'Thinking', status: 'SUCCESS' }
    );

    await session.toolUse(
      'data-processor',
      { zh: '处理数据', en: 'Process data' },
      { zh: '处理完成，生成 42 条记录', en: 'Processing complete, generated 42 records' },
      'SUCCESS'
    );

    await session.memory(
      { zh: '关键数据点', en: 'Key data points' },
      { zh: '发现了 3 个异常值，已标记处理', en: 'Found 3 outliers, marked for processing' },
      { type: 'SEMANTIC', importance: 8 }
    );

    await session.artifact(
      'hello-world-report',
      { zh: 'Hello World 报告', en: 'Hello World Report' },
      { zh: '# Hello World\n\n这是一个演示报告。\n\n## 执行摘要\n- 步骤 1: 初始化 ✓\n- 步骤 2: 分析 ✓\n- 步骤 3: 处理 ✓\n\n## 结果\n所有步骤执行成功！', en: '# Hello World\n\nThis is a demo report.\n\n## Execution Summary\n- Step 1: Initialize ✓\n- Step 2: Analyze ✓\n- Step 3: Process ✓\n\n## Results\nAll steps executed successfully!' },
      { fileType: 'MARKDOWN', sensitivity: 'internal', shareScope: 'project' }
    );

    await session.complete(
      { zh: 'Hello World 演示成功完成！', en: 'Hello World demo completed successfully!' }
    );

    console.log('\n✅ Demo completed successfully!');
    console.log(`   Check the episode at: ${baseUrl}/zh/projects/${projectId}/episodes/${session.getCurrentEpisode()?.id}`);

  } catch (error) {
    console.error('\n❌ Demo failed:', error);
    process.exit(1);
  }
}

main();
