/**
 * Traceplane Agent SDK - HTTP Client
 * 
 * 封装与 Traceplane API 的 HTTP 通信
 */

import {
  TraceplaneConfig,
  TraceplaneError,
  Episode,
  CreateEpisodeParams,
  TraceEvent,
  AppendTraceParams,
  MemoryItem,
  CreateMemoryParams,
  Artifact,
  CreateArtifactParams,
  UpdateEpisodeStatusParams,
  ForkEpisodeParams,
  StreamEvent,
  OrchestratorContext
} from './types';

/**
 * HTTP Client 类
 * 处理与 Traceplane 后端的所有 HTTP 通信
 */
export class TraceplaneClient {
  private config: Required<TraceplaneConfig>;

  constructor(config: TraceplaneConfig) {
    this.config = {
      timeout: 30000,
      debug: false,
      apiKey: '',
      ...config
    };

    if (this.config.debug) {
      console.log('[Traceplane] SDK initialized with config:', {
        baseUrl: this.config.baseUrl,
        projectId: this.config.projectId,
        agentId: this.config.agentId
      });
    }
  }

  /**
   * 发送 HTTP 请求
   */
  private async request<T>(
    method: string,
    path: string,
    body?: Record<string, unknown>
  ): Promise<T> {
    const url = `${this.config.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    if (this.config.debug) {
      console.log(`[Traceplane] ${method} ${url}`, body ? { body } : '');
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

    const data = await response.json().catch(() => null) as { error?: string } | null;

    if (!response.ok) {
      throw new TraceplaneError(
        data?.error || `HTTP ${response.status}`,
        'REQUEST_FAILED',
        response.status,
        data
      );
    }

      if (this.config.debug) {
        console.log(`[Traceplane] Response:`, data);
      }

      return data as T;
    } catch (error) {
      if (error instanceof TraceplaneError) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new TraceplaneError(
          'Request timeout',
          'TIMEOUT',
          undefined,
          error
        );
      }

      throw new TraceplaneError(
        error instanceof Error ? error.message : 'Unknown error',
        'NETWORK_ERROR',
        undefined,
        error
      );
    }
  }

  // ===== Episode API =====

  /**
   * 创建新的 Episode
   */
  async createEpisode(params: CreateEpisodeParams): Promise<Episode> {
    const body = {
      projectId: this.config.projectId,
      primaryAgentId: this.config.agentId,
      ...params
    };

    return this.request<Episode>('POST', '/api/episodes', body);
  }

  /**
   * 获取 Episode 详情
   */
  async getEpisode(episodeId: string): Promise<Episode> {
    return this.request<Episode>('GET', `/api/episodes/${episodeId}`);
  }

  async getOrchestratorContext(episodeId: string): Promise<OrchestratorContext> {
    return this.request<OrchestratorContext>('GET', `/api/episodes/${encodeURIComponent(episodeId)}/context`);
  }

  async updateEpisodeStatus(params: UpdateEpisodeStatusParams): Promise<Episode> {
    const { episodeId, ...body } = params;
    return this.request<Episode>('PATCH', `/api/episodes/${episodeId}/status`, body);
  }

  // ===== Trace API =====

  /**
   * 追加 Trace Event
   */
  async appendTrace(params: AppendTraceParams): Promise<TraceEvent> {
    const body = {
      ...params,
      actorAgentId: this.config.agentId,
      eventTime: new Date().toISOString()
    };

    return this.request<TraceEvent>('POST', '/api/traces', body);
  }

  // ===== Memory API =====

  /**
   * 创建 Memory Item
   */
  async createMemory(params: CreateMemoryParams): Promise<MemoryItem> {
    const body = {
      ...params,
      agentId: this.config.agentId
    };

    return this.request<MemoryItem>('POST', '/api/memory', body);
  }

  // ===== Artifact API =====

  /**
   * 创建 Artifact
   */
  async createArtifact(params: CreateArtifactParams): Promise<Artifact> {
    const body = {
      ...params,
      createdByAgentId: this.config.agentId
    };

    // 如果有文件内容，使用 multipart/form-data
    if (params.fileContent) {
      return this.uploadArtifactWithFile(params);
    }

    return this.request<Artifact>('POST', '/api/artifacts', body);
  }

  /**
   * 上传带文件的 Artifact
   */
  private async uploadArtifactWithFile(params: CreateArtifactParams): Promise<Artifact> {
    const url = `${this.config.baseUrl}/api/artifacts`;
    
    const formData = new FormData();
    formData.append('episodeId', params.episodeId);
    formData.append('artifactKey', params.artifactKey);
    formData.append('titleI18n', JSON.stringify(params.titleI18n));
    formData.append('fileType', params.fileType);
    formData.append('sensitivity', params.sensitivity);
    formData.append('shareScope', params.shareScope);
    formData.append('createdByAgentId', this.config.agentId);
    
    if (params.contentI18n) {
      formData.append('contentI18n', JSON.stringify(params.contentI18n));
    }
    if (params.sourceTraceEventId) {
      formData.append('sourceTraceEventId', params.sourceTraceEventId);
    }
    if (params.fileContent && params.fileName) {
      const blob = new Blob([new Uint8Array(params.fileContent)]);
      formData.append('file', blob, params.fileName);
    }

    const headers: Record<string, string> = {};
    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null) as { error?: string } | null;
      throw new TraceplaneError(
        data?.error || `Upload failed: HTTP ${response.status}`,
        'UPLOAD_FAILED',
        response.status,
        data
      );
    }

    return response.json() as Promise<Artifact>;
  }

  // ===== Fork API =====

  /**
   * Fork Episode
   */
  async forkEpisode(params: ForkEpisodeParams): Promise<Episode> {
    const body = {
      ...params,
      actorId: this.config.agentId
    };

    return this.request<Episode>('POST', '/api/episodes/fork', body);
  }

  // ===== Event Stream =====

  /**
   * 订阅 Event Stream (SSE)
   * @param episodeId 要监听的 Episode ID
   * @param callback 事件回调函数
   * @returns 取消订阅函数
   */
  subscribeEvents(
    episodeId: string,
    callback: (event: StreamEvent) => void
  ): () => void {
    const url = `${this.config.baseUrl}/api/events/stream?episodeId=${episodeId}`;
    
    const headers: Record<string, string> = {};
    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    const eventSource = new EventSource(url, { withCredentials: true });

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as StreamEvent;
        callback(data);
      } catch (error) {
        console.error('[Traceplane] Failed to parse SSE message:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('[Traceplane] SSE error:', error);
    };

    if (this.config.debug) {
      console.log(`[Traceplane] Subscribed to events for episode ${episodeId}`);
    }

    // 返回取消订阅函数
    return () => {
      eventSource.close();
      if (this.config.debug) {
        console.log(`[Traceplane] Unsubscribed from events for episode ${episodeId}`);
      }
    };
  }
}
