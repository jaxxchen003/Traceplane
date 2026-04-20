import { TraceplaneSDK, TraceplaneSession } from '@traceplane/agent-sdk';

interface ReporterConfig {
  baseUrl: string;
  projectId: string;
  agentId: string;
  debug?: boolean;
}

export class ClaudeTraceplaneReporter {
  private sdk: TraceplaneSDK;
  private session: TraceplaneSession | null = null;
  private config: ReporterConfig;

  constructor(config: ReporterConfig) {
    this.config = config;
    this.sdk = new TraceplaneSDK({
      baseUrl: config.baseUrl,
      projectId: config.projectId,
      agentId: config.agentId,
      debug: config.debug ?? false
    });
  }

  async startTask(
    title: string,
    goal: string,
    options?: {
      successCriteria?: string;
      workType?: 'RESEARCH' | 'GENERATE' | 'REVIEW' | 'REVISE' | 'APPROVE' | 'SUMMARIZE';
    }
  ) {
    this.session = await this.sdk.startEpisode({
      title,
      goal,
      successCriteria: options?.successCriteria ?? 'Task completed successfully',
      workType: options?.workType ?? 'GENERATE'
    });

    const episode = this.session.getCurrentEpisode();
    if (this.config.debug) {
      console.log(`[Traceplane] Episode started: ${episode?.id}`);
    }

    return episode?.id;
  }

  async recordStep(step: string, result: string, status?: 'SUCCESS' | 'WARNING' | 'FAILED') {
    if (!this.session) {
      console.warn('[Traceplane] No active session');
      return;
    }

    await this.session.step(step, result, {
      status: status ?? 'SUCCESS'
    });

    if (this.config.debug) {
      console.log(`[Traceplane] Step recorded: ${step}`);
    }
  }

  async recordToolUse(tool: string, input: string, output: string, status?: 'SUCCESS' | 'WARNING' | 'FAILED') {
    if (!this.session) {
      console.warn('[Traceplane] No active session');
      return;
    }

    await this.session.toolUse(tool, input, output, status ?? 'SUCCESS');

    if (this.config.debug) {
      console.log(`[Traceplane] Tool use recorded: ${tool}`);
    }
  }

  async recordMemory(title: string, content: string, importance?: number) {
    if (!this.session) {
      console.warn('[Traceplane] No active session');
      return;
    }

    await this.session.memory(title, content, {
      importance: importance ?? 5
    });

    if (this.config.debug) {
      console.log(`[Traceplane] Memory recorded: ${title}`);
    }
  }

  async createArtifact(key: string, title: string, content: string, fileType?: string) {
    if (!this.session) {
      console.warn('[Traceplane] No active session');
      return;
    }

    await this.session.artifact(key, title, content, {
      fileType: (fileType as any) ?? 'MARKDOWN'
    });

    if (this.config.debug) {
      console.log(`[Traceplane] Artifact created: ${key}`);
    }
  }

  async completeTask(outcome: string) {
    if (!this.session) {
      console.warn('[Traceplane] No active session');
      return;
    }

    await this.session.complete(outcome);
    this.session = null;

    if (this.config.debug) {
      console.log('[Traceplane] Episode completed');
    }
  }

  async failTask(reason: string) {
    if (!this.session) {
      console.warn('[Traceplane] No active session');
      return;
    }

    await this.session.fail(reason);
    this.session = null;

    if (this.config.debug) {
      console.log('[Traceplane] Episode failed');
    }
  }

  getCurrentEpisodeId(): string | null {
    return this.session?.getCurrentEpisode()?.id ?? null;
  }

  isActive(): boolean {
    return this.session?.isSessionActive() ?? false;
  }
}
