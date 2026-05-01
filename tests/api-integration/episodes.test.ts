import { describe, it, expect, beforeAll } from 'vitest';

const API_BASE = 'http://localhost:3000';
const runHttpIntegration = process.env.TRACEPLANE_RUN_HTTP_INTEGRATION === 'true';

describe.skipIf(!runHttpIntegration)('Episodes API Integration', () => {
  let projectId: string;
  let agentId: string;

  beforeAll(async () => {
    const response = await fetch(`${API_BASE}/api/projects`);
    const projects = await response.json();
    projectId = projects[0]?.id;
    
    const agentsRes = await fetch(`${API_BASE}/api/agents`);
    const agents = await agentsRes.json();
    agentId = agents[0]?.id;
  });

  describe('POST /api/episodes', () => {
    it('should create new episode', async () => {
      const response = await fetch(`${API_BASE}/api/episodes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          primaryAgentId: agentId,
          titleI18n: { zh: '测试 Episode', en: 'Test Episode' },
          goalI18n: { zh: '测试目标', en: 'Test Goal' },
          successCriteriaI18n: { zh: '测试标准', en: 'Test Criteria' },
          status: 'IN_PROGRESS'
        })
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.id).toBeDefined();
      expect(data.status).toBe('IN_PROGRESS');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await fetch(`${API_BASE}/api/episodes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          primaryAgentId: agentId
        })
      });

      expect(response.status).toBe(400);
    });

    it('should return 404 for invalid project', async () => {
      const response = await fetch(`${API_BASE}/api/episodes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: 'invalid-project',
          primaryAgentId: agentId,
          titleI18n: { zh: '测试', en: 'Test' },
          goalI18n: { zh: '目标', en: 'Goal' },
          successCriteriaI18n: { zh: '标准', en: 'Criteria' }
        })
      });

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/traces', () => {
    let episodeId: string;

    beforeAll(async () => {
      const response = await fetch(`${API_BASE}/api/episodes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          primaryAgentId: agentId,
          titleI18n: { zh: 'Trace 测试', en: 'Trace Test' },
          goalI18n: { zh: '目标', en: 'Goal' },
          successCriteriaI18n: { zh: '标准', en: 'Criteria' },
          status: 'IN_PROGRESS'
        })
      });
      const data = await response.json();
      episodeId = data.id;
    });

    it('should append trace event', async () => {
      const response = await fetch(`${API_BASE}/api/traces`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          episodeId,
          stepIndex: 0,
          eventType: 'Thinking',
          stepTitleI18n: { zh: '步骤 1', en: 'Step 1' },
          status: 'SUCCESS',
          shortResultI18n: { zh: '成功', en: 'Success' }
        })
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.id).toBeDefined();
      expect(data.stepIndex).toBe(0);
    });
  });

  describe('GET /api/events/stream', () => {
    it('should establish SSE connection', async () => {
      const response = await fetch(`${API_BASE}/api/events/stream?projectId=${projectId}`);
      
      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toBe('text/event-stream');
    });
  });
});
