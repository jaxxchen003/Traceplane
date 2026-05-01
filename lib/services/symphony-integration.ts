import { createHmac, timingSafeEqual } from "node:crypto";

type I18nField = Record<string, string | undefined>;
type Locale = "zh" | "en";
type SymphonyEventType = "task.started" | "task.step_completed" | "task.failed" | "task.completed";
type TraceStatus = "SUCCESS" | "WARNING" | "FAILED";
type EpisodeStatus = "PLANNED" | "IN_PROGRESS" | "BLOCKED" | "IN_REVIEW" | "COMPLETED" | "FAILED";

export class SymphonyIntegrationError extends Error {
  constructor(
    message: string,
    public statusCode = 400
  ) {
    super(message);
    this.name = "SymphonyIntegrationError";
  }
}

export interface SymphonyWebhookPayload {
  event_type: SymphonyEventType;
  orchestrator_id: string;
  task_id: string;
  agent_id: string;
  step_index?: number;
  payload?: Record<string, unknown>;
  timestamp?: string;
}

interface PrismaLike {
  project: {
    findFirst(args: unknown): Promise<any>;
  };
  agent: {
    findFirst(args: unknown): Promise<any>;
  };
  episode: {
    findUnique(args: unknown): Promise<any>;
  };
  $transaction<T>(callback: (tx: any) => Promise<T>): Promise<T>;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function toI18n(value: unknown, fallback?: I18nField | null): I18nField | null {
  const asString = stringValue(value);
  if (asString) {
    return { zh: asString, en: asString };
  }

  if (isObject(value) && typeof value.zh === "string" && value.zh.trim().length > 0) {
    const zh = value.zh.trim();
    const en = typeof value.en === "string" && value.en.trim().length > 0 ? value.en.trim() : zh;
    return { zh, en };
  }

  return fallback ?? null;
}

function localize(value: unknown, locale: Locale) {
  if (!isObject(value)) return "";
  const localized = value[locale];
  const zh = value.zh;
  const en = value.en;
  return typeof localized === "string"
    ? localized
    : typeof zh === "string"
    ? zh
    : typeof en === "string"
    ? en
    : "";
}

function dateFrom(value: unknown) {
  const raw = stringValue(value);
  if (!raw) return new Date();

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function normalizeWorkType(value: unknown) {
  const allowed = new Set(["RESEARCH", "GENERATE", "REVIEW", "REVISE", "APPROVE", "SUMMARIZE"]);
  const raw = stringValue(value)?.toUpperCase();
  return raw && allowed.has(raw) ? raw : "GENERATE";
}

function normalizeTraceStatus(value: unknown, fallback: TraceStatus = "SUCCESS"): TraceStatus {
  const raw = stringValue(value)?.toUpperCase();
  if (raw === "SUCCESS" || raw === "DONE" || raw === "COMPLETED") return "SUCCESS";
  if (raw === "WARNING" || raw === "PENDING" || raw === "BLOCKED") return "WARNING";
  if (raw === "FAILED" || raw === "ERROR") return "FAILED";
  return fallback;
}

function normalizeEpisodeContextStatus(status: EpisodeStatus) {
  if (status === "COMPLETED") return "done";
  if (status === "FAILED") return "failed";
  if (status === "BLOCKED" || status === "IN_REVIEW" || status === "PLANNED") return "paused";
  return "active";
}

function normalizeStepStatus(status: TraceStatus) {
  if (status === "SUCCESS") return "done";
  if (status === "FAILED") return "failed";
  return "pending";
}

function projectIdentity(payload: Record<string, unknown>) {
  return (
    stringValue(payload.project_id) ??
    stringValue(payload.projectId) ??
    stringValue(payload.project_slug) ??
    stringValue(payload.projectSlug)
  );
}

async function resolveProject(db: PrismaLike, payload: Record<string, unknown>) {
  const identity = projectIdentity(payload);
  if (!identity) {
    throw new SymphonyIntegrationError("payload.project_id is required for task.started", 400);
  }

  const project = await db.project.findFirst({
    where: {
      OR: [{ id: identity }, { slug: identity }]
    },
    include: { workspace: true }
  });

  if (!project) {
    throw new SymphonyIntegrationError("Project not found", 404);
  }

  return project;
}

async function resolveAgent(db: PrismaLike, identity: string) {
  const agent = await db.agent.findFirst({
    where: {
      OR: [{ id: identity }, { slug: identity }]
    }
  });

  if (!agent) {
    throw new SymphonyIntegrationError("Agent not found", 404);
  }

  return agent;
}

async function resolveOptionalAgentId(db: PrismaLike, identity: string) {
  const agent = await db.agent.findFirst({
    where: {
      OR: [{ id: identity }, { slug: identity }]
    }
  });
  return agent?.id ?? null;
}

async function findEpisode(db: PrismaLike, taskId: string) {
  const episode = await db.episode.findUnique({
    where: { id: taskId },
    include: {
      project: true,
      traceEvents: true
    }
  });

  if (!episode) {
    throw new SymphonyIntegrationError("Episode not found", 404);
  }

  return episode;
}

function auditAction(eventType: SymphonyEventType) {
  return `symphony.${eventType}`;
}

export function verifySymphonySignature(rawBody: string, signatureHeader: string | null, secret: string | undefined) {
  if (!signatureHeader || !secret) return false;

  const supplied = signatureHeader.startsWith("sha256=") ? signatureHeader.slice("sha256=".length) : signatureHeader;
  if (!/^[a-f0-9]{64}$/i.test(supplied)) return false;

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const suppliedBuffer = Buffer.from(supplied, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");

  return suppliedBuffer.length === expectedBuffer.length && timingSafeEqual(suppliedBuffer, expectedBuffer);
}

export async function handleSymphonyWebhook(db: PrismaLike, event: SymphonyWebhookPayload) {
  if (!event.event_type || !event.task_id || !event.agent_id || !event.orchestrator_id) {
    throw new SymphonyIntegrationError("event_type, orchestrator_id, task_id, and agent_id are required", 400);
  }

  if (event.event_type === "task.started") {
    return handleTaskStarted(db, event);
  }

  if (event.event_type === "task.step_completed") {
    return handleStepCompleted(db, event);
  }

  if (event.event_type === "task.failed") {
    return handleTaskStatus(db, event, "FAILED");
  }

  if (event.event_type === "task.completed") {
    return handleTaskStatus(db, event, "COMPLETED");
  }

  throw new SymphonyIntegrationError(`Unsupported Symphony event: ${event.event_type}`, 400);
}

async function handleTaskStarted(db: PrismaLike, event: SymphonyWebhookPayload) {
  const payload = event.payload ?? {};
  const existing = await db.episode.findUnique({ where: { id: event.task_id } });
  if (existing) {
    return {
      event_type: event.event_type,
      episode_id: existing.id,
      status: existing.status,
      created: false
    };
  }

  const project = await resolveProject(db, payload);
  const agent = await resolveAgent(db, event.agent_id);
  const titleI18n = toI18n(payload.title ?? payload.task_title, {
    zh: `Symphony task ${event.task_id}`,
    en: `Symphony task ${event.task_id}`
  });
  const goalI18n = toI18n(payload.goal ?? payload.description ?? payload.summary, titleI18n);
  const successCriteriaI18n = toI18n(payload.success_criteria ?? payload.successCriteria, goalI18n);
  const occurredAt = dateFrom(event.timestamp);

  const created = await db.$transaction(async (tx) => {
    const episode = await tx.episode.create({
      data: {
        id: event.task_id,
        projectId: project.id,
        primaryAgentId: agent.id,
        titleI18n,
        summaryI18n: toI18n(payload.summary),
        goalI18n,
        successCriteriaI18n,
        finalOutcomeI18n: null,
        primaryActor: event.orchestrator_id,
        workType: normalizeWorkType(payload.work_type ?? payload.workType),
        relationIntent: null,
        status: "IN_PROGRESS",
        policyVersion: stringValue(payload.policy_version) ?? project.activePolicyVersion,
        startedAt: occurredAt
      }
    });

    await tx.episodeAgent.create({
      data: {
        episodeId: episode.id,
        agentId: agent.id
      }
    });

    await tx.auditEvent.create({
      data: {
        workspaceId: project.workspaceId,
        projectId: project.id,
        episodeId: episode.id,
        occurredAt,
        actorType: "agent",
        actorId: event.orchestrator_id,
        action: auditAction(event.event_type),
        targetType: "episode",
        targetId: episode.id,
        result: "success",
        policyVersion: episode.policyVersion,
        permissionDecision: "allow"
      }
    });

    return episode;
  });

  return {
    event_type: event.event_type,
    episode_id: created.id,
    status: created.status,
    created: true
  };
}

async function handleStepCompleted(db: PrismaLike, event: SymphonyWebhookPayload) {
  const episode = await findEpisode(db, event.task_id);
  const payload = event.payload ?? {};
  const occurredAt = dateFrom(event.timestamp);
  const actorAgentId = await resolveOptionalAgentId(db, event.agent_id);
  const existingStepIndexes = (episode.traceEvents ?? []).map((item: { stepIndex: number }) => item.stepIndex);
  const stepIndex =
    typeof event.step_index === "number"
      ? event.step_index
      : existingStepIndexes.length > 0
      ? Math.max(...existingStepIndexes) + 1
      : 1;
  const status = normalizeTraceStatus(payload.status, "SUCCESS");
  const summary = payload.summary ?? payload.result ?? payload.description ?? "Symphony step completed";
  const stepTitle = payload.step_title ?? payload.stepTitle ?? payload.name ?? `Symphony step ${stepIndex}`;

  const trace = await db.$transaction(async (tx) => {
    const created = await tx.traceEvent.create({
      data: {
        episodeId: episode.id,
        actorAgentId,
        stepIndex,
        eventType: "symphony.task.step_completed",
        toolName: stringValue(payload.tool_name) ?? stringValue(payload.toolName),
        stepTitleI18n: toI18n(stepTitle, toI18n(summary)),
        status,
        shortResultI18n: toI18n(summary, { zh: "Symphony step completed", en: "Symphony step completed" }),
        inputSummaryI18n: toI18n(payload.input_summary ?? payload.inputSummary),
        decisionSummaryI18n: toI18n(payload.decision_summary ?? payload.decisionSummary),
        toolPayloadSummaryI18n: toI18n(payload.tool_payload_summary ?? payload.toolPayloadSummary),
        resultSummaryI18n: toI18n(payload.result_summary ?? payload.resultSummary ?? payload.result),
        errorSummaryI18n: toI18n(payload.error_summary ?? payload.errorSummary ?? payload.error),
        policyHitReasonI18n: null,
        permissionDeniedI18n: null,
        snapshot: payload,
        eventTime: occurredAt
      }
    });

    await tx.auditEvent.create({
      data: {
        workspaceId: episode.project.workspaceId,
        projectId: episode.projectId,
        episodeId: episode.id,
        traceEventId: created.id,
        occurredAt,
        actorType: "agent",
        actorId: event.agent_id,
        action: auditAction(event.event_type),
        targetType: "trace",
        targetId: created.id,
        result: status === "FAILED" ? "warning" : "success",
        policyVersion: episode.policyVersion,
        permissionDecision: "allow"
      }
    });

    return created;
  });

  return {
    event_type: event.event_type,
    episode_id: episode.id,
    trace_event_id: trace.id,
    step_index: trace.stepIndex,
    status: trace.status
  };
}

async function handleTaskStatus(db: PrismaLike, event: SymphonyWebhookPayload, status: "FAILED" | "COMPLETED") {
  const episode = await findEpisode(db, event.task_id);
  const payload = event.payload ?? {};
  const occurredAt = dateFrom(event.timestamp);
  const updateData =
    status === "FAILED"
      ? {
          status,
          failureReasonI18n: toI18n(payload.failure_reason ?? payload.failureReason ?? payload.summary ?? payload.error),
          endedAt: occurredAt
        }
      : {
          status,
          finalOutcomeI18n: toI18n(payload.final_outcome ?? payload.finalOutcome ?? payload.summary ?? payload.result),
          reviewOutcome: "APPROVED",
          endedAt: occurredAt
        };

  const updated = await db.$transaction(async (tx) => {
    const record = await tx.episode.update({
      where: { id: episode.id },
      data: updateData
    });

    await tx.auditEvent.create({
      data: {
        workspaceId: episode.project.workspaceId,
        projectId: episode.projectId,
        episodeId: episode.id,
        occurredAt,
        actorType: "agent",
        actorId: event.orchestrator_id,
        action: auditAction(event.event_type),
        targetType: "episode",
        targetId: episode.id,
        result: status === "FAILED" ? "warning" : "success",
        policyVersion: episode.policyVersion,
        permissionDecision: "allow"
      }
    });

    return record;
  });

  return {
    event_type: event.event_type,
    episode_id: updated.id,
    status: updated.status
  };
}

export async function buildOrchestratorContext(db: PrismaLike, episodeId: string, locale: Locale = "zh") {
  const episode = await db.episode.findUnique({
    where: { id: episodeId },
    include: {
      project: true,
      traceEvents: { orderBy: { stepIndex: "asc" } },
      memoryItems: { orderBy: { createdAt: "desc" }, take: 20 },
      artifacts: { orderBy: { updatedAt: "desc" }, take: 20 },
      auditEvents: { orderBy: { occurredAt: "desc" }, take: 50 }
    }
  });

  if (!episode) {
    throw new SymphonyIntegrationError("Episode not found", 404);
  }

  const traces: any[] = [...(episode.traceEvents ?? [])].sort((left, right) => left.stepIndex - right.stepIndex);
  const completedSteps = traces.filter((trace) => trace.status === "SUCCESS").map((trace) => mapTraceStep(trace, locale));
  const pendingSteps = traces.filter((trace) => trace.status !== "SUCCESS").map((trace) => mapTraceStep(trace, locale));
  const auditEvents: any[] = episode.auditEvents ?? [];
  const artifacts: any[] = episode.artifacts ?? [];
  const memoryItems: any[] = episode.memoryItems ?? [];
  const failedTraces = traces.filter((trace) => trace.status === "FAILED");
  const deniedAudits = auditEvents.filter((event) => event.permissionDecision === "deny");
  const policyHitAudits = auditEvents.filter((event) => event.policyHitReasonI18n);

  return {
    episode_id: episode.id,
    status: normalizeEpisodeContextStatus(episode.status),
    completed_steps: completedSteps,
    pending_steps: pendingSteps,
    artifacts: artifacts.map((artifact) => ({
      id: artifact.id,
      artifact_key: artifact.artifactKey,
      title: localize(artifact.titleI18n, locale),
      file_type: artifact.fileType,
      version: artifact.version,
      uri: artifact.uri,
      sensitivity: artifact.sensitivity,
      source_trace_event_id: artifact.sourceTraceEventId ?? null
    })),
    memory_snapshot: memoryItems.map((memory) => ({
      id: memory.id,
      title: localize(memory.titleI18n, locale),
      content: localize(memory.contentI18n, locale),
      type: memory.type,
      source: memory.source,
      importance: memory.importance,
      sensitivity: memory.sensitivity,
      created_at: memory.createdAt
    })),
    risk_flags: [
      ...(episode.status === "FAILED" ? ["episode_failed"] : []),
      ...failedTraces.map((trace) => `failed_trace:${trace.id}`),
      ...deniedAudits.map((event) => `permission_denied:${event.action}`),
      ...policyHitAudits.map((event) => `policy_hit:${event.action}`)
    ],
    resume_hint: buildResumeHint(episode, traces, locale)
  };
}

function mapTraceStep(trace: any, locale: Locale) {
  return {
    id: trace.id,
    step_index: trace.stepIndex,
    event_type: trace.eventType,
    tool_name: trace.toolName ?? null,
    title: localize(trace.stepTitleI18n, locale),
    status: normalizeStepStatus(trace.status),
    summary: localize(trace.shortResultI18n, locale),
    occurred_at: trace.eventTime
  };
}

function buildResumeHint(episode: any, traces: any[], locale: Locale) {
  const lastPending = [...traces].reverse().find((trace) => trace.status !== "SUCCESS");
  if (lastPending) {
    return `Resume from step ${lastPending.stepIndex}: ${localize(lastPending.stepTitleI18n, locale)}`;
  }

  const lastTrace = traces[traces.length - 1];
  if (lastTrace && episode.status === "COMPLETED") {
    return `Episode completed after step ${lastTrace.stepIndex}: ${localize(lastTrace.stepTitleI18n, locale)}`;
  }

  if (lastTrace) {
    return `Continue after step ${lastTrace.stepIndex}: ${localize(lastTrace.stepTitleI18n, locale)}`;
  }

  return `Start from episode goal: ${localize(episode.goalI18n, locale) || localize(episode.titleI18n, locale)}`;
}
