/**
 * Traceplane Agent SDK - Session Manager
 * 
 * 提供高级别的会话管理，自动处理 Episode 生命周期
 */

import { TraceplaneClient } from './client';
import {
  TraceplaneConfig,
  Episode,
  TraceEvent,
  MemoryItem,
  Artifact,
  CreateEpisodeParams,
  AppendTraceParams,
  CreateMemoryParams,
  CreateArtifactParams,
  TraceStatus,
  TraceEventType,
  I18nField
} from './types';

/**
 * Session 配置选项
 */
export interface SessionOptions {
  /** 自动上报步骤间隔（毫秒），默认 5000 */
  autoFlushInterval?: number;
  /** 是否自动捕获错误 */
  autoCaptureErrors?: boolean;
  /** 是否自动创建 traces */
  autoCreateTraces?: boolean;
}

/**
 * Session 管理器
 * 
 * 封装 Episode 生命周期管理，提供高级 API
 */
export class TraceplaneSession {
  private client: TraceplaneClient;
  private episode: Episode | null = null;
  private stepIndex: number = 0;
  private options: Required<SessionOptions>;
  private pendingTraces: AppendTraceParams[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private isActive: boolean = false;

  constructor(
    config: TraceplaneConfig,
    options: SessionOptions = {}
  ) {
    this.client = new TraceplaneClient(config);
    this.options = {
      autoFlushInterval: 5000,
      autoCaptureErrors: true,
      autoCreateTraces: true,
      ...options
    };

    // 设置自动刷新定时器
    if (this.options.autoFlushInterval > 0) {
      this.flushTimer = setInterval(() => {
        this.flush();
      }, this.options.autoFlushInterval);
    }

    // 设置错误捕获
    if (this.options.autoCaptureErrors) {
      this.setupErrorHandling();
    }
  }

  /**
   * 开始新的 Episode
   */
  async start(params: CreateEpisodeParams): Promise<Episode> {
    if (this.isActive) {
      throw new Error('Session already active. Call end() before starting a new episode.');
    }

    this.episode = await this.client.createEpisode({
      status: 'IN_PROGRESS',
      ...params
    });

    this.isActive = true;
    this.stepIndex = 0;

    console.log(`[Traceplane] Episode started: ${this.episode.id}`);
    
    return this.episode;
  }

  /**
   * 恢复已有的 Episode
   */
  async resume(episodeId: string): Promise<Episode> {
    if (this.isActive) {
      throw new Error('Session already active. Call end() before resuming.');
    }

    this.episode = await this.client.getEpisode(episodeId);
    
    // 从现有 traces 计算下一步序号
    // 这里简化处理，实际应该从服务端获取最新 stepIndex
    this.stepIndex = 0;
    this.isActive = true;

    console.log(`[Traceplane] Episode resumed: ${episodeId}`);
    
    return this.episode;
  }

  /**
   * 记录一个执行步骤
   */
  async step(
    title: string | I18nField,
    result: string | I18nField,
    options: {
      status?: TraceStatus;
      toolName?: string;
      eventType?: TraceEventType;
      input?: string | I18nField;
      decision?: string | I18nField;
      error?: string | I18nField;
    } = {}
  ): Promise<TraceEvent | null> {
    if (!this.episode) {
      console.warn('[Traceplane] No active episode. Call start() first.');
      return null;
    }

    const titleI18n = typeof title === 'string' ? { zh: title, en: title } : title;
    const resultI18n = typeof result === 'string' ? { zh: result, en: result } : result;

    const traceParams: AppendTraceParams = {
      episodeId: this.episode.id,
      stepIndex: this.stepIndex++,
      eventType: options.eventType || 'Thinking',
      stepTitleI18n: titleI18n,
      status: options.status || 'SUCCESS',
      shortResultI18n: resultI18n,
      toolName: options.toolName,
      inputSummaryI18n: options.input ? (typeof options.input === 'string' ? { zh: options.input, en: options.input } : options.input) : undefined,
      decisionSummaryI18n: options.decision ? (typeof options.decision === 'string' ? { zh: options.decision, en: options.decision } : options.decision) : undefined,
      errorSummaryI18n: options.error ? (typeof options.error === 'string' ? { zh: options.error, en: options.error } : options.error) : undefined
    };

    if (this.options.autoCreateTraces) {
      const trace = await this.client.appendTrace(traceParams);
      console.log(`[Traceplane] Step ${trace.stepIndex}: ${title}`);
      return trace;
    } else {
      this.pendingTraces.push(traceParams);
      return null;
    }
  }

  /**
   * 记录工具调用
   */
  async toolUse(
    toolName: string,
    input: string | I18nField,
    result: string | I18nField,
    status: TraceStatus = 'SUCCESS'
  ): Promise<TraceEvent | null> {
    return this.step(
      typeof input === 'string' ? `使用工具: ${toolName}` : { zh: `使用工具: ${toolName}`, en: `Using tool: ${toolName}` },
      result,
      {
        eventType: 'PostToolUse',
        toolName,
        status,
        input
      }
    );
  }

  /**
   * 记录错误
   */
  async error(
    message: string | I18nField,
    details?: string | I18nField
  ): Promise<TraceEvent | null> {
    return this.step(
      typeof message === 'string' ? `错误: ${message}` : { zh: `错误`, en: 'Error' },
      message,
      {
        status: 'FAILED',
        eventType: 'Error',
        error: details || message
      }
    );
  }

  /**
   * 创建 Memory
   */
  async memory(
    title: string | I18nField,
    content: string | I18nField,
    options: Partial<CreateMemoryParams> = {}
  ): Promise<MemoryItem | null> {
    if (!this.episode) {
      console.warn('[Traceplane] No active episode. Call start() first.');
      return null;
    }

    const titleI18n = typeof title === 'string' ? { zh: title, en: title } : title;
    const contentI18n = typeof content === 'string' ? { zh: content, en: content } : content;

    const memory = await this.client.createMemory({
      episodeId: this.episode.id,
      titleI18n,
      contentI18n,
      type: 'SEMANTIC',
      source: 'agent-sdk',
      importance: 5,
      sensitivity: 'internal',
      ...options
    });

    console.log(`[Traceplane] Memory created: ${title}`);
    return memory;
  }

  /**
   * 创建 Artifact
   */
  async artifact(
    key: string,
    title: string | I18nField,
    content: string | I18nField,
    options: Partial<CreateArtifactParams> = {}
  ): Promise<Artifact | null> {
    if (!this.episode) {
      console.warn('[Traceplane] No active episode. Call start() first.');
      return null;
    }

    const titleI18n = typeof title === 'string' ? { zh: title, en: title } : title;
    const contentI18n = typeof content === 'string' ? { zh: content, en: content } : content;

    const artifact = await this.client.createArtifact({
      episodeId: this.episode.id,
      artifactKey: key,
      titleI18n,
      contentI18n,
      fileType: 'MARKDOWN',
      sensitivity: 'internal',
      shareScope: 'project',
      ...options
    });

    console.log(`[Traceplane] Artifact created: ${key}`);
    return artifact;
  }

  /**
   * 标记 Episode 完成
   */
  async complete(outcome?: string | I18nField): Promise<Episode | null> {
    if (!this.episode) {
      console.warn('[Traceplane] No active episode.');
      return null;
    }

    await this.flush();

    const finalOutcomeI18n = outcome 
      ? (typeof outcome === 'string' ? { zh: outcome, en: outcome } : outcome)
      : undefined;

    const result = await this.client.updateEpisodeStatus({
      episodeId: this.episode.id,
      status: 'COMPLETED',
      reviewOutcome: 'APPROVED',
      finalOutcomeI18n
    });

    this.isActive = false;
    console.log(`[Traceplane] Episode completed: ${this.episode.id}`);
    
    return result;
  }

  /**
   * 标记 Episode 失败
   */
  async fail(reason: string | I18nField): Promise<Episode | null> {
    if (!this.episode) {
      console.warn('[Traceplane] No active episode.');
      return null;
    }

    await this.flush();

    const failureReasonI18n = typeof reason === 'string' ? { zh: reason, en: reason } : reason;

    const result = await this.client.updateEpisodeStatus({
      episodeId: this.episode.id,
      status: 'FAILED',
      failureReasonI18n
    });

    this.isActive = false;
    console.log(`[Traceplane] Episode failed: ${this.episode.id}`);
    
    return result;
  }

  /**
   * 结束 Session
   */
  async end(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    if (this.isActive && this.episode) {
      await this.flush();
    }

    this.episode = null;
    this.isActive = false;
    this.stepIndex = 0;

    console.log('[Traceplane] Session ended');
  }

  /**
   * 强制刷新待发送的 traces
   */
  async flush(): Promise<void> {
    if (this.pendingTraces.length === 0) return;

    const traces = [...this.pendingTraces];
    this.pendingTraces = [];

    await Promise.all(
      traces.map(params => this.client.appendTrace(params))
    );

    console.log(`[Traceplane] Flushed ${traces.length} traces`);
  }

  /**
   * 获取当前 Episode
   */
  getCurrentEpisode(): Episode | null {
    return this.episode;
  }

  /**
   * 检查 Session 是否活跃
   */
  isSessionActive(): boolean {
    return this.isActive;
  }

  /**
   * 设置全局错误处理
   */
  private setupErrorHandling(): void {
    process.on('uncaughtException', async (error) => {
      console.error('[Traceplane] Uncaught exception:', error);
      if (this.isActive && this.episode) {
        await this.error(error.message, error.stack || '');
        await this.fail(`Uncaught exception: ${error.message}`);
      }
    });

    process.on('unhandledRejection', async (reason) => {
      console.error('[Traceplane] Unhandled rejection:', reason);
      if (this.isActive && this.episode) {
        const message = reason instanceof Error ? reason.message : String(reason);
        await this.error(message);
        await this.fail(`Unhandled rejection: ${message}`);
      }
    });
  }
}
