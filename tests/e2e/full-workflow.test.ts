import { describe, it, expect, beforeAll } from 'vitest';

const API_BASE = 'http://localhost:3000';

describe('E2E: Full Agent Workflow', () => {
  let projectId: string;
  let agentId: string;
  let episodeId: string;

  beforeAll(async () => {
    const projectsRes = await fetch(`${API_BASE}/api/projects`);
    const projects = await projectsRes.json();
    projectId = projects[0]?.id;
    
    const agentsRes = await fetch(`${API_BASE}/api/agents`);
    const agents = await agentsRes.json();
    agentId = agents[0]?.id;
  });

  it('should complete full agent task workflow', async () => {
    const taskTitle = 'E2E Test Task ' + Date.now();
    
    const episodeRes = await fetch(`${API_BASE}/api/episodes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId,
        primaryAgentId: agentId,
        titleI18n: { zh: taskTitle, en: taskTitle },
        goalI18n: { zh: '测试完整工作流', en: 'Test full workflow' },
        successCriteriaI18n: { zh: '完成测试', en: 'Complete test' },
        status: 'IN_PROGRESS',
        workType: 'RESEARCH'
      })
    });
    
    expect(episodeRes.status).toBe(201);
    const episode = await episodeRes.json();
    episodeId = episode.id;
    expect(episode.status).toBe('IN_PROGRESS');

    const trace1Res = await fetch(`${API_BASE}/api/traces`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        episodeId,
        stepIndex: 0,
        eventType: 'UserPromptSubmit',
        stepTitleI18n: { zh: '初始化', en: 'Initialize' },
        status: 'SUCCESS',
        shortResultI18n: { zh: '初始化完成', en: 'Initialization complete' }
      })
    });
    expect(trace1Res.status).toBe(201);

    const trace2Res = await fetch(`${API_BASE}/api/traces`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        episodeId,
        stepIndex: 1,
        eventType: 'PostToolUse',
        stepTitleI18n: { zh: '工具调用', en: 'Tool use' },
        toolName: 'analyzer',
        status: 'SUCCESS',
        shortResultI18n: { zh: '分析完成', en: 'Analysis complete' }
      })
    });
    expect(trace2Res.status).toBe(201);

    const memoryRes = await fetch(`${API_BASE}/api/memory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        episodeId,
        agentId,
        titleI18n: { zh: '关键发现', en: 'Key Finding' },
        contentI18n: { zh: '重要洞察', en: 'Important insight' },
        type: 'SEMANTIC',
        source: 'e2e-test',
        importance: 8
      })
    });
    expect(memoryRes.status).toBe(201);

    const artifactRes = await fetch(`${API_BASE}/api/artifacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        episodeId,
        createdByAgentId: agentId,
        artifactKey: 'test-report',
        titleI18n: { zh: '测试报告', en: 'Test Report' },
        contentI18n: { zh: '# 报告内容', en: '# Report Content' },
        fileType: 'MARKDOWN',
        sensitivity: 'internal',
        shareScope: 'project'
      })
    });
    expect(artifactRes.status).toBe(201);

    const completeRes = await fetch(`${API_BASE}/api/episodes/${episodeId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'COMPLETED',
        reviewOutcome: 'APPROVED',
        finalOutcomeI18n: { zh: '任务完成', en: 'Task completed' }
      })
    });
    expect(completeRes.status).toBe(200);
    const completed = await completeRes.json();
    expect(completed.status).toBe('COMPLETED');

    const episodeDetailRes = await fetch(`${API_BASE}/api/episodes/brief?episodeId=${episodeId}&locale=zh`);
    expect(episodeDetailRes.status).toBe(200);
    const detail = await episodeDetailRes.json();
    expect(detail.episode.title).toBe(taskTitle);
    expect(detail.timeline.length).toBeGreaterThanOrEqual(2);
  });

  it('should fork episode and continue', async () => {
    const originalRes = await fetch(`${API_BASE}/api/episodes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId,
        primaryAgentId: agentId,
        titleI18n: { zh: '原始任务', en: 'Original Task' },
        goalI18n: { zh: '原始目标', en: 'Original Goal' },
        successCriteriaI18n: { zh: '原始标准', en: 'Original Criteria' }
      })
    });
    const original = await originalRes.json();

    const traceRes = await fetch(`${API_BASE}/api/traces`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        episodeId: original.id,
        stepIndex: 0,
        eventType: 'Thinking',
        stepTitleI18n: { zh: '步骤1', en: 'Step 1' },
        status: 'SUCCESS',
        shortResultI18n: { zh: '结果1', en: 'Result 1' }
      })
    });
    const trace = await traceRes.json();

    const forkRes = await fetch(`${API_BASE}/api/episodes/fork`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        parentEpisodeId: original.id,
        traceId: trace.id,
        titleI18n: { zh: 'Fork 任务', en: 'Forked Task' },
        actorId: agentId
      })
    });
    
    expect(forkRes.status).toBe(201);
    const forked = await forkRes.json();
    expect(forked.parentEpisodeId).toBe(original.id);
    expect(forked.status).toBe('IN_PROGRESS');
  });
});
