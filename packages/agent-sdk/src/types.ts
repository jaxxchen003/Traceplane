/**
 * Traceplane Agent SDK 类型定义
 * 
 * 本文件定义 Agent 与 Traceplane 平台交互所需的所有数据类型
 */

// ===== 基础类型 =====

/** 国际化字段 - 支持多语言的字符串 */
export interface I18nField {
  zh?: string;
  en?: string;
  [key: string]: string | undefined;
}

/** Trace 状态 */
export type TraceStatus = 'SUCCESS' | 'WARNING' | 'FAILED';

/** Episode 状态 */
export type EpisodeStatus = 'PLANNED' | 'IN_PROGRESS' | 'BLOCKED' | 'IN_REVIEW' | 'COMPLETED' | 'FAILED';

/** 工作类型 */
export type WorkType = 'RESEARCH' | 'GENERATE' | 'REVIEW' | 'REVISE' | 'APPROVE' | 'SUMMARIZE';

/** 文件类型 */
export type FileType = 'MARKDOWN' | 'JSON' | 'CSV' | 'HTML' | 'SVG' | 'PDF' | 'SCRIPT' | 'IMAGE';

/** 内存项类型 */
export type MemoryType = 'SEMANTIC' | 'EPISODIC' | 'PROCEDURAL';

// ===== SDK 配置 =====

/**
 * SDK 配置选项
 */
export interface TraceplaneConfig {
  /** Traceplane API 基础地址，例如 https://traceplane.example.com */
  baseUrl: string;
  /** API 密钥（可选，取决于服务端配置） */
  apiKey?: string;
  /** 项目 ID */
  projectId: string;
  /** Agent ID */
  agentId: string;
  /** 请求超时时间（毫秒），默认 30000 */
  timeout?: number;
  /** 是否开启调试日志 */
  debug?: boolean;
}

// ===== Episode 相关 =====

/**
 * 创建 Episode 请求参数
 */
export interface CreateEpisodeParams {
  /** Episode 标题（多语言） */
  titleI18n: I18nField;
  /** 目标描述（多语言） */
  goalI18n: I18nField;
  /** 成功标准（多语言） */
  successCriteriaI18n: I18nField;
  /** 摘要（可选） */
  summaryI18n?: I18nField;
  /** 执行角色名称（可选） */
  primaryActor?: string;
  /** 工作类型 */
  workType?: WorkType;
  /** 初始状态 */
  status?: EpisodeStatus;
}

/**
 * Episode 响应
 */
export interface Episode {
  id: string;
  projectId: string;
  primaryAgentId: string;
  titleI18n: I18nField;
  goalI18n: I18nField;
  successCriteriaI18n: I18nField;
  status: EpisodeStatus;
  workType: WorkType;
  policyVersion: string;
  startedAt: string;
  createdAt: string;
  updatedAt: string;
}

// ===== Trace Event 相关 =====

/**
 * Trace Event 类型
 * 对应 Agent 执行过程中的各种事件
 */
export type TraceEventType = 
  | 'UserPromptSubmit'    // 用户提交提示
  | 'PreToolUse'          // 使用工具前
  | 'PostToolUse'         // 使用工具后
  | 'Stop'                // 停止/完成
  | 'Thinking'            // 思考中
  | 'Decision'            // 做出决策
  | 'Error';              // 发生错误

/**
 * 上报 Trace Event 参数
 */
export interface AppendTraceParams {
  /** 所属 Episode ID */
  episodeId: string;
  /** 事件类型 */
  eventType: TraceEventType | string;
  /** 执行步骤序号 */
  stepIndex: number;
  /** 步骤标题（多语言） */
  stepTitleI18n: I18nField;
  /** 结果状态 */
  status: TraceStatus;
  /** 简短结果摘要（多语言） */
  shortResultI18n: I18nField;
  /** 输入摘要（可选） */
  inputSummaryI18n?: I18nField;
  /** 决策摘要（可选） */
  decisionSummaryI18n?: I18nField;
  /** 工具载荷摘要（可选） */
  toolPayloadSummaryI18n?: I18nField;
  /** 结果摘要（可选） */
  resultSummaryI18n?: I18nField;
  /** 错误摘要（可选） */
  errorSummaryI18n?: I18nField;
  /** 策略命中原因（可选） */
  policyHitReasonI18n?: I18nField;
  /** 权限拒绝原因（可选） */
  permissionDeniedI18n?: I18nField;
  /** 工具名称（可选） */
  toolName?: string;
  /** 引用的 Memory ID 列表（可选） */
  linkedMemoryIds?: string[];
  /** 引用的 Artifact ID 列表（可选） */
  linkedArtifactIds?: string[];
}

/**
 * Trace Event 响应
 */
export interface TraceEvent {
  id: string;
  episodeId: string;
  actorAgentId: string;
  stepIndex: number;
  eventType: string;
  status: TraceStatus;
  eventTime: string;
  createdAt: string;
}

// ===== Memory 相关 =====

/**
 * 创建 Memory Item 参数
 */
export interface CreateMemoryParams {
  /** 所属 Episode ID */
  episodeId: string;
  /** 标题（多语言） */
  titleI18n: I18nField;
  /** 内容（多语言） */
  contentI18n: I18nField;
  /** 内存类型 */
  type: MemoryType;
  /** 来源 */
  source: string;
  /** 重要性（1-10） */
  importance: number;
  /** 敏感级别 */
  sensitivity: string;
  /** 存活天数（可选） */
  ttlDays?: number;
}

/**
 * Memory Item 响应
 */
export interface MemoryItem {
  id: string;
  episodeId: string;
  titleI18n: I18nField;
  contentI18n: I18nField;
  type: MemoryType;
  createdAt: string;
}

// ===== Artifact 相关 =====

/**
 * 创建 Artifact 参数
 */
export interface CreateArtifactParams {
  /** 所属 Episode ID */
  episodeId: string;
  /** Artifact 唯一键（用于版本管理） */
  artifactKey: string;
  /** 标题（多语言） */
  titleI18n: I18nField;
  /** 内容（多语言，可选） */
  contentI18n?: I18nField;
  /** 文件类型 */
  fileType: FileType;
  /** 敏感级别 */
  sensitivity: string;
  /** 分享范围 */
  shareScope: string;
  /** 来源 Trace Event ID（可选） */
  sourceTraceEventId?: string;
  /** 文件内容（二进制，可选）- 用于直接上传 */
  fileContent?: Buffer;
  /** 文件名（与 fileContent 一起使用） */
  fileName?: string;
}

/**
 * Artifact 响应
 */
export interface Artifact {
  id: string;
  episodeId: string;
  artifactKey: string;
  titleI18n: I18nField;
  fileType: FileType;
  version: number;
  uri: string | null;
  createdAt: string;
}

// ===== Episode 状态更新 =====

/**
 * 更新 Episode 状态参数
 */
export interface UpdateEpisodeStatusParams {
  /** Episode ID */
  episodeId: string;
  /** 新状态 */
  status: EpisodeStatus;
  /** 阻塞原因（当状态为 BLOCKED 时必填） */
  blockedReasonI18n?: I18nField;
  /** 失败原因（当状态为 FAILED 时必填） */
  failureReasonI18n?: I18nField;
  /** 最终成果（当状态为 COMPLETED 时可选） */
  finalOutcomeI18n?: I18nField;
  /** 审核结果（当状态为 IN_REVIEW 或 COMPLETED 时可选） */
  reviewOutcome?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

// ===== Fork/Resume =====

/**
 * Fork Episode 参数
 */
export interface ForkEpisodeParams {
  /** 父 Episode ID */
  parentEpisodeId: string;
  /** Fork 点 Trace ID */
  traceId: string;
  /** 新 Episode 标题（可选，默认从父 Episode 继承） */
  titleI18n?: I18nField;
  /** 新目标（可选，默认从父 Episode 继承） */
  goalI18n?: I18nField;
  /** 新成功标准（可选，默认从父 Episode 继承） */
  successCriteriaI18n?: I18nField;
  /** 执行者 ID（可选） */
  actorId?: string;
  /** 工作类型（可选） */
  workType?: WorkType;
}

// ===== Event Stream =====

/**
 * Event Stream 回调函数类型
 */
export type EventStreamCallback = (event: StreamEvent) => void;

/**
 * Stream Event 类型
 */
export interface StreamEvent {
  /** 事件 ID */
  id: string;
  /** 事件类型 */
  type: 'trace' | 'artifact' | 'memory' | 'status' | 'audit';
  /** 所属 Episode ID */
  episodeId: string;
  /** 事件发生时间 */
  occurredAt: string;
  /** 事件数据 */
  data: Record<string, unknown>;
}

// ===== SDK 错误 =====

/**
 * SDK 错误类型
 */
export class TraceplaneError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public responseData?: unknown
  ) {
    super(message);
    this.name = 'TraceplaneError';
  }
}
