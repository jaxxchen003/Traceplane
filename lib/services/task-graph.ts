type I18nField = Record<string, string | undefined>;
type EpisodeStatus = "PLANNED" | "IN_PROGRESS" | "BLOCKED" | "IN_REVIEW" | "COMPLETED" | "FAILED";
type TaskGraphStatus = "RUNNING" | "COMPLETED" | "FAILED";
type TraceStatus = "SUCCESS" | "WARNING" | "FAILED";

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
  taskGraph: {
    findUnique(args: unknown): Promise<any>;
  };
  taskGraphEpisode: {
    findFirst(args: unknown): Promise<any>;
  };
  $transaction<T>(callback: (tx: any) => Promise<T>): Promise<T>;
}

interface CreateTaskGraphInput {
  projectId?: string;
  project_id?: string;
  symphonyTaskId?: string;
  symphony_task_id?: string;
  orchestratorEpisodeId?: string;
  orchestrator_episode_id?: string;
  createdByAgentId?: string;
  created_by_agent_id?: string;
  sensitivity?: string;
  policyVersion?: string;
  policy_version?: string;
}

interface RegisterSubtaskInput {
  taskGraphId?: string;
  task_graph_id?: string;
  agentId?: string;
  agent_id?: string;
  assignedSubtask?: string | I18nField;
  assigned_subtask?: string | I18nField;
  dependencyEpisodeIds?: string[];
  dependency_episode_ids?: string[];
  workType?: string;
  work_type?: string;
  title?: string | I18nField;
  goal?: string | I18nField;
  successCriteria?: string | I18nField;
  success_criteria?: string | I18nField;
  actorId?: string;
  actor_id?: string;
}

interface ReportSubtaskResultInput {
  taskGraphId?: string;
  task_graph_id?: string;
  episodeId?: string;
  episode_id?: string;
  status?: string;
  summary?: string | I18nField;
  actorId?: string;
  actor_id?: string;
  failureReason?: string | I18nField;
  failure_reason?: string | I18nField;
}

export class TaskGraphServiceError extends Error {
  constructor(
    message: string,
    public statusCode = 400
  ) {
    super(message);
    this.name = "TaskGraphServiceError";
  }
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

function localize(value: unknown) {
  if (!isObject(value)) return "";
  const zh = value.zh;
  const en = value.en;
  return typeof zh === "string" ? zh : typeof en === "string" ? en : "";
}

function requiredString(value: unknown, fieldName: string) {
  const parsed = stringValue(value);
  if (!parsed) {
    throw new TaskGraphServiceError(`${fieldName} is required`, 400);
  }
  return parsed;
}

function normalizeWorkType(value: unknown) {
  const allowed = new Set(["RESEARCH", "GENERATE", "REVIEW", "REVISE", "APPROVE", "SUMMARIZE"]);
  const raw = stringValue(value)?.toUpperCase();
  return raw && allowed.has(raw) ? raw : "GENERATE";
}

function normalizeEpisodeStatus(value: unknown): EpisodeStatus {
  const raw = stringValue(value)?.toUpperCase();
  if (
    raw === "PLANNED" ||
    raw === "IN_PROGRESS" ||
    raw === "BLOCKED" ||
    raw === "IN_REVIEW" ||
    raw === "COMPLETED" ||
    raw === "FAILED"
  ) {
    return raw;
  }

  if (raw === "RUNNING" || raw === "ACTIVE") return "IN_PROGRESS";
  if (raw === "DONE" || raw === "SUCCESS") return "COMPLETED";
  if (raw === "ERROR") return "FAILED";

  throw new TaskGraphServiceError("status must be a valid episode status", 400);
}

function traceStatusFor(status: EpisodeStatus): TraceStatus {
  if (status === "COMPLETED") return "SUCCESS";
  if (status === "FAILED") return "FAILED";
  return "WARNING";
}

function toGraphStatus(status: TaskGraphStatus) {
  return status.toLowerCase();
}

function toEpisodeStatus(status: EpisodeStatus | string | null | undefined) {
  if (status === "COMPLETED") return "completed";
  if (status === "FAILED") return "failed";
  if (status === "PLANNED") return "planned";
  return "running";
}

function normalizeDependencyIds(value: unknown) {
  return Array.isArray(value) ? value.map((item) => stringValue(item)).filter((item): item is string => Boolean(item)) : [];
}

function taskGraphInclude() {
  return {
    project: true,
    episodes: {
      include: {
        episode: {
          include: {
            project: true,
            traceEvents: true
          }
        },
        agent: true
      }
    }
  };
}

async function resolveProject(db: PrismaLike, identity: string) {
  const project = await db.project.findFirst({
    where: {
      OR: [{ id: identity }, { slug: identity }]
    },
    include: { workspace: true }
  });

  if (!project) {
    throw new TaskGraphServiceError("Project not found", 404);
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
    throw new TaskGraphServiceError("Agent not found", 404);
  }

  return agent;
}

async function findEpisode(db: PrismaLike, episodeId: string) {
  const episode = await db.episode.findUnique({
    where: { id: episodeId },
    include: {
      project: true,
      traceEvents: true
    }
  });

  if (!episode) {
    throw new TaskGraphServiceError("Episode not found", 404);
  }

  return episode;
}

async function findTaskGraph(db: PrismaLike, identity: string) {
  const byId = await db.taskGraph.findUnique({
    where: { id: identity },
    include: taskGraphInclude()
  });

  if (byId) return byId;

  const bySymphonyTaskId = await db.taskGraph.findUnique({
    where: { symphonyTaskId: identity },
    include: taskGraphInclude()
  });

  if (!bySymphonyTaskId) {
    throw new TaskGraphServiceError("Task graph not found", 404);
  }

  return bySymphonyTaskId;
}

function workerLinks(graph: any) {
  return (graph.episodes ?? []).filter((link: any) => link.role === "WORKER");
}

function aggregateTaskGraphStatus(graph: any, overrides: Record<string, EpisodeStatus> = {}): TaskGraphStatus {
  const workers = workerLinks(graph);
  if (workers.length === 0) return graph.status ?? "RUNNING";

  const statuses: Array<EpisodeStatus | undefined> = workers.map(
    (link: any) => overrides[link.episodeId] ?? link.episode?.status
  );
  if (statuses.some((status) => status === "FAILED")) return "FAILED";
  if (statuses.every((status) => status === "COMPLETED")) return "COMPLETED";
  return "RUNNING";
}

function buildWorkerCounts(graph: any) {
  return workerLinks(graph).reduce(
    (counts: { total: number; completed: number; failed: number; running: number; planned: number }, link: any) => {
      counts.total += 1;
      const status = link.episode?.status;
      if (status === "COMPLETED") counts.completed += 1;
      else if (status === "FAILED") counts.failed += 1;
      else if (status === "PLANNED") counts.planned += 1;
      else counts.running += 1;
      return counts;
    },
    { total: 0, completed: 0, failed: 0, running: 0, planned: 0 }
  );
}

function mapTaskGraph(graph: any, status?: TaskGraphStatus) {
  return {
    id: graph.id,
    task_graph_id: graph.id,
    symphony_task_id: graph.symphonyTaskId,
    orchestrator_episode_id: graph.orchestratorEpisodeId,
    status: toGraphStatus(status ?? graph.status),
    project_id: graph.projectId,
    workspace_id: graph.workspaceId,
    policy_version: graph.policyVersion,
    created_by_agent_id: graph.createdByAgentId
  };
}

function mapTaskGraphEpisode(link: any) {
  return {
    id: link.id,
    task_graph_id: link.taskGraphId,
    episode_id: link.episodeId,
    role: typeof link.role === "string" ? link.role.toLowerCase() : link.role,
    agent_id: link.agentId,
    assigned_subtask: link.assignedSubtask,
    dependency_episode_ids: link.dependencyEpisodeIds ?? [],
    status: toEpisodeStatus(link.episode?.status)
  };
}

export async function createTaskGraph(db: PrismaLike, input: CreateTaskGraphInput) {
  const projectId = requiredString(input.projectId ?? input.project_id, "projectId");
  const symphonyTaskId = requiredString(input.symphonyTaskId ?? input.symphony_task_id, "symphonyTaskId");
  const orchestratorEpisodeId = requiredString(
    input.orchestratorEpisodeId ?? input.orchestrator_episode_id,
    "orchestratorEpisodeId"
  );

  const existing = await db.taskGraph.findUnique({
    where: { symphonyTaskId },
    include: taskGraphInclude()
  });
  if (existing) {
    return mapTaskGraph(existing, aggregateTaskGraphStatus(existing));
  }

  const project = await resolveProject(db, projectId);
  const orchestratorEpisode = await findEpisode(db, orchestratorEpisodeId);
  if (orchestratorEpisode.projectId !== project.id) {
    throw new TaskGraphServiceError("Orchestrator episode does not belong to the project", 400);
  }

  const createdByIdentity = stringValue(input.createdByAgentId ?? input.created_by_agent_id) ?? orchestratorEpisode.primaryAgentId;
  const createdByAgent = await resolveAgent(db, createdByIdentity);
  const policyVersion = stringValue(input.policyVersion ?? input.policy_version) ?? orchestratorEpisode.policyVersion ?? project.activePolicyVersion;
  const sensitivity = stringValue(input.sensitivity) ?? "Internal";

  const graph = await db.$transaction(async (tx) => {
    const created = await tx.taskGraph.create({
      data: {
        workspaceId: project.workspaceId,
        projectId: project.id,
        symphonyTaskId,
        orchestratorEpisodeId: orchestratorEpisode.id,
        status: "RUNNING",
        sensitivity,
        policyVersion,
        createdByAgentId: createdByAgent.id
      }
    });

    await tx.taskGraphEpisode.create({
      data: {
        taskGraphId: created.id,
        episodeId: orchestratorEpisode.id,
        role: "ORCHESTRATOR",
        agentId: orchestratorEpisode.primaryAgentId,
        assignedSubtask:
          localize(orchestratorEpisode.goalI18n) || localize(orchestratorEpisode.titleI18n) || "Orchestrate task graph",
        dependencyEpisodeIds: []
      }
    });

    await tx.auditEvent.create({
      data: {
        workspaceId: project.workspaceId,
        projectId: project.id,
        episodeId: orchestratorEpisode.id,
        occurredAt: new Date(),
        actorType: "agent",
        actorId: createdByAgent.id,
        action: "create_task_graph",
        targetType: "task_graph",
        targetId: created.id,
        result: "success",
        policyVersion,
        permissionDecision: "allow"
      }
    });

    return created;
  });

  return mapTaskGraph(graph);
}

export async function registerSubtask(db: PrismaLike, input: RegisterSubtaskInput) {
  const taskGraphId = requiredString(input.taskGraphId ?? input.task_graph_id, "taskGraphId");
  const agentId = requiredString(input.agentId ?? input.agent_id, "agentId");
  const assignedSubtaskRaw = input.assignedSubtask ?? input.assigned_subtask;
  const assignedSubtask = requiredString(localize(assignedSubtaskRaw) || assignedSubtaskRaw, "assignedSubtask");
  const graph = await findTaskGraph(db, taskGraphId);
  const agent = await resolveAgent(db, agentId);
  const dependencyEpisodeIds = normalizeDependencyIds(input.dependencyEpisodeIds ?? input.dependency_episode_ids);
  const graphEpisodeIds = new Set((graph.episodes ?? []).map((link: any) => link.episodeId));
  const missingDependency = dependencyEpisodeIds.find((episodeId) => !graphEpisodeIds.has(episodeId));
  if (missingDependency) {
    throw new TaskGraphServiceError(`Dependency episode ${missingDependency} is not part of the task graph`, 400);
  }

  const titleI18n = toI18n(input.title, toI18n(assignedSubtask, { zh: "Subtask", en: "Subtask" }));
  const goalI18n = toI18n(input.goal, toI18n(assignedSubtask, titleI18n));
  const successCriteriaI18n = toI18n(input.successCriteria ?? input.success_criteria, goalI18n);
  const actorId = stringValue(input.actorId ?? input.actor_id) ?? agent.id;

  const created = await db.$transaction(async (tx) => {
    const episode = await tx.episode.create({
      data: {
        projectId: graph.projectId,
        primaryAgentId: agent.id,
        parentEpisodeId: graph.orchestratorEpisodeId,
        titleI18n,
        summaryI18n: null,
        goalI18n,
        successCriteriaI18n,
        finalOutcomeI18n: null,
        primaryActor: agent.id,
        workType: normalizeWorkType(input.workType ?? input.work_type),
        relationIntent: dependencyEpisodeIds.length > 0 ? "DEPENDS_ON" : null,
        status: "PLANNED",
        policyVersion: graph.policyVersion,
        startedAt: new Date()
      }
    });

    await tx.episodeAgent.create({
      data: {
        episodeId: episode.id,
        agentId: agent.id
      }
    });

    const link = await tx.taskGraphEpisode.create({
      data: {
        taskGraphId: graph.id,
        episodeId: episode.id,
        role: "WORKER",
        agentId: agent.id,
        assignedSubtask,
        dependencyEpisodeIds
      }
    });

    if (dependencyEpisodeIds.length > 0) {
      await tx.nodeEdge.createMany({
        data: dependencyEpisodeIds.map((dependencyEpisodeId) => ({
          fromNodeType: "episode",
          fromNodeId: episode.id,
          toNodeType: "episode",
          toNodeId: dependencyEpisodeId,
          edgeType: "DEPENDS_ON"
        }))
      });
    }

    await tx.auditEvent.create({
      data: {
        workspaceId: graph.workspaceId,
        projectId: graph.projectId,
        episodeId: episode.id,
        occurredAt: new Date(),
        actorType: "agent",
        actorId,
        action: "register_subtask",
        targetType: "task_graph_episode",
        targetId: link.id,
        result: "success",
        policyVersion: graph.policyVersion,
        permissionDecision: "allow"
      }
    });

    return { episode, link };
  });

  return {
    task_graph_id: graph.id,
    episode_id: created.episode.id,
    role: "worker",
    status: toEpisodeStatus(created.episode.status),
    assigned_subtask: created.link.assignedSubtask,
    dependency_episode_ids: created.link.dependencyEpisodeIds
  };
}

export async function reportSubtaskResult(db: PrismaLike, input: ReportSubtaskResultInput) {
  const taskGraphId = requiredString(input.taskGraphId ?? input.task_graph_id, "taskGraphId");
  const episodeId = requiredString(input.episodeId ?? input.episode_id, "episodeId");
  const status = normalizeEpisodeStatus(input.status);
  const graph = await findTaskGraph(db, taskGraphId);
  const link = await db.taskGraphEpisode.findFirst({
    where: {
      taskGraphId: graph.id,
      episodeId
    },
    include: {
      episode: {
        include: {
          project: true,
          traceEvents: true
        }
      }
    }
  });

  if (!link) {
    throw new TaskGraphServiceError("Episode is not part of the task graph", 404);
  }

  const summary = toI18n(input.summary, { zh: "Subtask status reported", en: "Subtask status reported" });
  const failureReason = toI18n(input.failureReason ?? input.failure_reason ?? input.summary);
  const stepIndex =
    (link.episode?.traceEvents ?? []).length > 0
      ? Math.max(...link.episode.traceEvents.map((trace: any) => trace.stepIndex)) + 1
      : 1;
  const graphStatus = aggregateTaskGraphStatus(graph, { [episodeId]: status });
  const actorId = stringValue(input.actorId ?? input.actor_id) ?? link.agentId;

  const result = await db.$transaction(async (tx) => {
    const updatedEpisode = await tx.episode.update({
      where: { id: episodeId },
      data: {
        status,
        finalOutcomeI18n: status === "COMPLETED" ? summary : link.episode?.finalOutcomeI18n ?? null,
        failureReasonI18n: status === "FAILED" ? failureReason : link.episode?.failureReasonI18n ?? null,
        reviewOutcome: status === "COMPLETED" ? "APPROVED" : link.episode?.reviewOutcome ?? null,
        endedAt: status === "COMPLETED" || status === "FAILED" ? new Date() : link.episode?.endedAt ?? null
      }
    });

    const trace = await tx.traceEvent.create({
      data: {
        episodeId,
        actorAgentId: actorId,
        stepIndex,
        eventType: "symphony.subtask.result",
        toolName: "symphony",
        stepTitleI18n: toI18n("Subtask result"),
        status: traceStatusFor(status),
        shortResultI18n: summary,
        inputSummaryI18n: null,
        decisionSummaryI18n: null,
        toolPayloadSummaryI18n: null,
        resultSummaryI18n: status === "COMPLETED" ? summary : null,
        errorSummaryI18n: status === "FAILED" ? failureReason : null,
        policyHitReasonI18n: null,
        permissionDeniedI18n: null,
        snapshot: input,
        eventTime: new Date()
      }
    });

    const updatedGraph = await tx.taskGraph.update({
      where: { id: graph.id },
      data: {
        status: graphStatus
      }
    });

    await tx.auditEvent.create({
      data: {
        workspaceId: graph.workspaceId,
        projectId: graph.projectId,
        episodeId,
        traceEventId: trace.id,
        occurredAt: new Date(),
        actorType: "agent",
        actorId,
        action: "report_subtask_result",
        targetType: "episode",
        targetId: episodeId,
        result: status === "FAILED" ? "warning" : "success",
        policyVersion: graph.policyVersion,
        permissionDecision: "allow"
      }
    });

    return { updatedEpisode, trace, updatedGraph };
  });

  return {
    task_graph_id: graph.id,
    episode_id: result.updatedEpisode.id,
    trace_event_id: result.trace.id,
    status: toGraphStatus(result.updatedGraph.status),
    episode_status: toEpisodeStatus(result.updatedEpisode.status)
  };
}

export async function getTaskGraphStatus(db: PrismaLike, taskGraphId: string) {
  const graph = await findTaskGraph(db, taskGraphId);
  const status = aggregateTaskGraphStatus(graph);

  return {
    task_graph_id: graph.id,
    symphony_task_id: graph.symphonyTaskId,
    status: toGraphStatus(status),
    project_id: graph.projectId,
    workspace_id: graph.workspaceId,
    worker_counts: buildWorkerCounts(graph),
    episodes: (graph.episodes ?? []).map(mapTaskGraphEpisode)
  };
}
