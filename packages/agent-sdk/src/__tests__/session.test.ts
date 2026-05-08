import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TraceplaneSession } from '../session';

const { mockClient } = vi.hoisted(() => ({
  mockClient: {
    createEpisode: vi.fn(),
    getEpisode: vi.fn(),
    appendTrace: vi.fn(),
    createMemory: vi.fn(),
    createArtifact: vi.fn(),
    updateEpisodeStatus: vi.fn()
  }
}));

vi.mock('../client', () => ({
  TraceplaneClient: vi.fn(function () {
    return mockClient;
  })
}));

describe('TraceplaneSession', () => {
  const mockConfig = {
    baseUrl: 'http://localhost:3000',
    projectId: 'test-project',
    agentId: 'test-agent'
  };

  let session: TraceplaneSession;

  beforeEach(() => {
    vi.clearAllMocks();
    
    session = new TraceplaneSession(mockConfig, {
      autoFlushInterval: 0, // Disable auto flush for testing
      autoCaptureErrors: false
    });
  });

  describe('start', () => {
    it('should create new episode', async () => {
      const mockEpisode = {
        id: 'episode-123',
        status: 'IN_PROGRESS'
      };
      mockClient.createEpisode.mockResolvedValueOnce(mockEpisode);

      const result = await session.start({
        titleI18n: { zh: '测试', en: 'Test' },
        goalI18n: { zh: '目标', en: 'Goal' },
        successCriteriaI18n: { zh: '标准', en: 'Criteria' }
      });

      expect(result).toEqual(mockEpisode);
      expect(mockClient.createEpisode).toHaveBeenCalledWith(expect.objectContaining({
        titleI18n: { zh: '测试', en: 'Test' }
      }));
    });

    it('should throw if session already active', async () => {
      mockClient.createEpisode.mockResolvedValueOnce({ id: 'episode-123' });
      await session.start({
        titleI18n: { zh: '测试', en: 'Test' },
        goalI18n: { zh: '目标', en: 'Goal' },
        successCriteriaI18n: { zh: '标准', en: 'Criteria' }
      });

      await expect(session.start({
        titleI18n: { zh: '测试2', en: 'Test 2' },
        goalI18n: { zh: '目标2', en: 'Goal 2' },
        successCriteriaI18n: { zh: '标准2', en: 'Criteria 2' }
      })).rejects.toThrow('Session already active');
    });
  });

  describe('step', () => {
    it('should record step when session is active', async () => {
      mockClient.createEpisode.mockResolvedValueOnce({ id: 'episode-123' });
      mockClient.appendTrace.mockResolvedValueOnce({ id: 'trace-123', stepIndex: 0 });

      await session.start({
        titleI18n: { zh: '测试', en: 'Test' },
        goalI18n: { zh: '目标', en: 'Goal' },
        successCriteriaI18n: { zh: '标准', en: 'Criteria' }
      });

      const result = await session.step('Test Step', 'Test Result');

      expect(result).toEqual({ id: 'trace-123', stepIndex: 0 });
      expect(mockClient.appendTrace).toHaveBeenCalledWith(expect.objectContaining({
        stepTitleI18n: { zh: 'Test Step', en: 'Test Step' },
        shortResultI18n: { zh: 'Test Result', en: 'Test Result' }
      }));
    });

    it('should return null when session is not active', async () => {
      const result = await session.step('Test Step', 'Test Result');
      expect(result).toBeNull();
    });
  });

  describe('toolUse', () => {
    it('should record tool use', async () => {
      mockClient.createEpisode.mockResolvedValueOnce({ id: 'episode-123' });
      mockClient.appendTrace.mockResolvedValueOnce({ id: 'trace-123' });

      await session.start({
        titleI18n: { zh: '测试', en: 'Test' },
        goalI18n: { zh: '目标', en: 'Goal' },
        successCriteriaI18n: { zh: '标准', en: 'Criteria' }
      });

      await session.toolUse('openai', 'Generate text', 'Text generated');

      expect(mockClient.appendTrace).toHaveBeenCalledWith(expect.objectContaining({
        eventType: 'PostToolUse',
        toolName: 'openai'
      }));
    });
  });

  describe('complete', () => {
    it('should mark episode as completed', async () => {
      mockClient.createEpisode.mockResolvedValueOnce({ id: 'episode-123' });
      mockClient.updateEpisodeStatus.mockResolvedValueOnce({ id: 'episode-123', status: 'COMPLETED' });

      await session.start({
        titleI18n: { zh: '测试', en: 'Test' },
        goalI18n: { zh: '目标', en: 'Goal' },
        successCriteriaI18n: { zh: '标准', en: 'Criteria' }
      });

      const result = await session.complete('Task done');

      expect(result).toEqual({ id: 'episode-123', status: 'COMPLETED' });
      expect(mockClient.updateEpisodeStatus).toHaveBeenCalledWith(expect.objectContaining({
        status: 'COMPLETED',
        reviewOutcome: 'APPROVED'
      }));
    });
  });

  describe('fail', () => {
    it('should mark episode as failed', async () => {
      mockClient.createEpisode.mockResolvedValueOnce({ id: 'episode-123' });
      mockClient.updateEpisodeStatus.mockResolvedValueOnce({ id: 'episode-123', status: 'FAILED' });

      await session.start({
        titleI18n: { zh: '测试', en: 'Test' },
        goalI18n: { zh: '目标', en: 'Goal' },
        successCriteriaI18n: { zh: '标准', en: 'Criteria' }
      });

      const result = await session.fail('API timeout');

      expect(result).toEqual({ id: 'episode-123', status: 'FAILED' });
      expect(mockClient.updateEpisodeStatus).toHaveBeenCalledWith(expect.objectContaining({
        status: 'FAILED',
        failureReasonI18n: { zh: 'API timeout', en: 'API timeout' }
      }));
    });
  });
});
