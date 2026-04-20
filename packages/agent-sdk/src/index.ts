/**
 * Traceplane Agent SDK
 * 
 * 用于向 Traceplane 平台上报多 Agent 工作流遥测数据的官方 SDK
 * 
 * @example
 * ```typescript
 * import { TraceplaneSDK } from '@traceplane/agent-sdk';
 * 
 * const sdk = new TraceplaneSDK({
 *   baseUrl: 'https://traceplane.example.com',
 *   projectId: 'your-project-id',
 *   agentId: 'your-agent-id'
 * });
 * 
 * // 创建并执行 Episode
 * const session = await sdk.startEpisode({
 *   titleI18n: { zh: '数据分析任务', en: 'Data Analysis Task' },
 *   goalI18n: { zh: '分析用户行为数据', en: 'Analyze user behavior data' },
 *   successCriteriaI18n: { zh: '生成分析报告', en: 'Generate analysis report' }
 * });
 * 
 * // 记录执行步骤
 * await session.step('加载数据', '成功加载 1000 条记录');
 * await session.toolUse('analyze', { zh: '运行分析' }, { zh: '完成' });
 * 
 * // 创建产物
 * await session.artifact('report', { zh: '分析报告' }, { zh: '# 分析报告...' });
 * 
 * // 完成 Episode
 * await session.complete({ zh: '分析完成' });
 * ```
 */

// 导出所有类型
export * from './types';

// 导出 Client
export { TraceplaneClient } from './client';

// 导出 Session Manager
export { TraceplaneSession } from './session';
export type { SessionOptions } from './session';

// 导出便捷函数
import { TraceplaneConfig } from './types';
import { TraceplaneSession } from './session';

/**
 * SDK 主类 - 提供便捷的 API 入口
 */
export class TraceplaneSDK {
  private config: TraceplaneConfig;

  constructor(config: TraceplaneConfig) {
    this.config = config;
  }

  /**
   * 创建新的 Session
   * 
   * 简化的 API，直接创建 Session 并开始 Episode
   */
  async startEpisode(params: {
    title: string | { zh?: string; en?: string };
    goal: string | { zh?: string; en?: string };
    successCriteria: string | { zh?: string; en?: string };
    summary?: string | { zh?: string; en?: string };
    primaryActor?: string;
    workType?: 'RESEARCH' | 'GENERATE' | 'REVIEW' | 'REVISE' | 'APPROVE' | 'SUMMARIZE';
  }): Promise<TraceplaneSession> {
    const session = new TraceplaneSession(this.config);
    
    await session.start({
      titleI18n: typeof params.title === 'string' ? { zh: params.title, en: params.title } : params.title,
      goalI18n: typeof params.goal === 'string' ? { zh: params.goal, en: params.goal } : params.goal,
      successCriteriaI18n: typeof params.successCriteria === 'string' 
        ? { zh: params.successCriteria, en: params.successCriteria } 
        : params.successCriteria,
      summaryI18n: params.summary 
        ? (typeof params.summary === 'string' ? { zh: params.summary, en: params.summary } : params.summary)
        : undefined,
      primaryActor: params.primaryActor,
      workType: params.workType
    });

    return session;
  }

  /**
   * 恢复已有的 Episode
   */
  async resumeEpisode(episodeId: string): Promise<TraceplaneSession> {
    const session = new TraceplaneSession(this.config);
    await session.resume(episodeId);
    return session;
  }
}

/**
 * 创建 SDK 实例
 * 
 * 工厂函数，用于快速创建 SDK 实例
 */
export function createTraceplaneSDK(config: TraceplaneConfig): TraceplaneSDK {
  return new TraceplaneSDK(config);
}

// 默认导出
export default TraceplaneSDK;
