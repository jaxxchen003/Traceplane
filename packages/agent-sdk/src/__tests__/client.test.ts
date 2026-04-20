import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TraceplaneClient } from '../client';
import { TraceplaneError } from '../types';

global.fetch = vi.fn();

describe('TraceplaneClient', () => {
  const mockConfig = {
    baseUrl: 'http://localhost:3000',
    projectId: 'test-project',
    agentId: 'test-agent',
    debug: false
  };

  let client: TraceplaneClient;

  beforeEach(() => {
    client = new TraceplaneClient(mockConfig);
    vi.resetAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with config', () => {
      expect(client).toBeDefined();
    });

    it('should merge default options', () => {
      const clientWithDefaults = new TraceplaneClient({
        baseUrl: 'http://localhost:3000',
        projectId: 'test',
        agentId: 'test'
      });
      expect(clientWithDefaults).toBeDefined();
    });
  });

  describe('createEpisode', () => {
    it('should create episode successfully', async () => {
      const mockEpisode = {
        id: 'episode-123',
        projectId: 'test-project',
        status: 'IN_PROGRESS',
        titleI18n: { zh: '测试', en: 'Test' }
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockEpisode
      });

      const result = await client.createEpisode({
        titleI18n: { zh: '测试', en: 'Test' },
        goalI18n: { zh: '目标', en: 'Goal' },
        successCriteriaI18n: { zh: '标准', en: 'Criteria' }
      });

      expect(result).toEqual(mockEpisode);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/episodes',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
      );
    });

    it('should throw TraceplaneError on failure', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Project not found' })
      });

      await expect(client.createEpisode({
        titleI18n: { zh: '测试', en: 'Test' },
        goalI18n: { zh: '目标', en: 'Goal' },
        successCriteriaI18n: { zh: '标准', en: 'Criteria' }
      })).rejects.toThrow(TraceplaneError);
    });
  });

  describe('appendTrace', () => {
    it('should append trace successfully', async () => {
      const mockTrace = {
        id: 'trace-123',
        episodeId: 'episode-123',
        status: 'SUCCESS'
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTrace
      });

      const result = await client.appendTrace({
        episodeId: 'episode-123',
        stepIndex: 0,
        eventType: 'Thinking',
        stepTitleI18n: { zh: '步骤', en: 'Step' },
        status: 'SUCCESS',
        shortResultI18n: { zh: '成功', en: 'Success' }
      });

      expect(result).toEqual(mockTrace);
    });
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(client.createEpisode({
        titleI18n: { zh: '测试', en: 'Test' },
        goalI18n: { zh: '目标', en: 'Goal' },
        successCriteriaI18n: { zh: '标准', en: 'Criteria' }
      })).rejects.toThrow('Network error');
    });

    it('should handle timeout', async () => {
      (global.fetch as any).mockImplementationOnce(() => {
        const error = new Error('AbortError');
        (error as any).name = 'AbortError';
        throw error;
      });

      await expect(client.createEpisode({
        titleI18n: { zh: '测试', en: 'Test' },
        goalI18n: { zh: '目标', en: 'Goal' },
        successCriteriaI18n: { zh: '标准', en: 'Criteria' }
      })).rejects.toThrow('Request timeout');
    });
  });
});
