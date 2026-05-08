import { describe, it, expect, beforeAll } from 'vitest';

const API_BASE = 'http://localhost:3000';
const runHttpIntegration = process.env.TRACEPLANE_RUN_HTTP_INTEGRATION === 'true';

describe.skipIf(!runHttpIntegration)('Memory API Integration', () => {
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

    const episodeRes = await fetch(`${API_BASE}/api/episodes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId,
        primaryAgentId: agentId,
        titleI18n: { zh: 'Memory 测试', en: 'Memory Test' },
        goalI18n: { zh: '目标', en: 'Goal' },
        successCriteriaI18n: { zh: '标准', en: 'Criteria' },
        status: 'IN_PROGRESS'
      })
    });
    const episode = await episodeRes.json();
    episodeId = episode.id;
  });

  describe('POST /api/memory', () => {
    it('should create memory item', async () => {
      const response = await fetch(`${API_BASE}/api/memory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          episodeId,
          agentId,
          titleI18n: { zh: '关键发现', en: 'Key Finding' },
          contentI18n: { zh: '重要洞察', en: 'Important insight' },
          type: 'SEMANTIC',
          source: 'test',
          importance: 8,
          sensitivity: 'internal'
        })
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.id).toBeDefined();
      expect(data.titleI18n.zh).toBe('关键发现');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await fetch(`${API_BASE}/api/memory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          episodeId
        })
      });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/memory', () => {
    it('should query memory items by episode', async () => {
      const response = await fetch(`${API_BASE}/api/memory?episodeId=${episodeId}`);
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });
  });
});
