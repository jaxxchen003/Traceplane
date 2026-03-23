import { prisma } from "@/lib/prisma";
import { localize } from "@/lib/format";
import type { Locale } from "@/lib/i18n";

function statusWeight(status: string) {
  return status === "denied" ? 2 : status === "warning" ? 1 : 0;
}

export async function getWorkspaceSummary() {
  const workspace = await prisma.workspace.findFirst();
  return workspace;
}

export async function getProjects(locale: Locale) {
  const projects = await prisma.project.findMany({
    include: {
      projectAgents: true,
      episodes: {
        include: {
          artifacts: true
        }
      },
      auditEvents: true
    },
    orderBy: { updatedAt: "desc" }
  });

  return projects.map((project) => {
    const riskEvents = project.auditEvents.filter((event) => event.result !== "success");
    return {
      id: project.id,
      slug: project.slug,
      name: localize(project.nameI18n, locale),
      description: localize(project.descriptionI18n, locale),
      status: project.status,
      lastActiveAt: project.updatedAt,
      agentCount: project.projectAgents.length,
      episodeCount: project.episodes.length,
      artifactCount: project.episodes.reduce((sum, episode) => sum + episode.artifacts.length, 0),
      riskEventCount: riskEvents.length,
      activePolicyVersion: project.activePolicyVersion
    };
  });
}

export async function getProjectOverview(projectId: string, locale: Locale) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      projectAgents: {
        include: { agent: true }
      },
      episodes: {
        include: {
          primaryAgent: true,
          artifacts: true
        },
        orderBy: { updatedAt: "desc" }
      },
      auditEvents: true
    }
  });

  if (!project) return null;

  const flattenedArtifacts = project.episodes
    .flatMap((episode) =>
      episode.artifacts.map((artifact) => ({
        id: artifact.id,
        title: localize(artifact.titleI18n, locale),
        type: artifact.fileType,
        episodeTitle: localize(episode.titleI18n, locale),
        generatedByAgent: episode.primaryAgent.name,
        updatedAt: artifact.updatedAt
      }))
    )
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  return {
    id: project.id,
    name: localize(project.nameI18n, locale),
    description: localize(project.descriptionI18n, locale),
    ownerName: project.ownerName,
    status: project.status,
    createdAt: project.createdAt,
    activePolicyVersion: project.activePolicyVersion,
    agents: project.projectAgents.map(({ agent }) => ({
      id: agent.id,
      name: agent.name,
      role: localize(agent.roleI18n, locale),
      lastActiveAt: agent.lastActiveAt,
      episodesInvolvedCount: project.episodes.filter((episode) => episode.primaryAgentId === agent.id).length,
      artifactsGeneratedCount: project.episodes.reduce(
        (sum, episode) => sum + episode.artifacts.filter((artifact) => artifact.createdByAgentId === agent.id).length,
        0
      )
    })),
    episodes: project.episodes.map((episode) => ({
      id: episode.id,
      title: localize(episode.titleI18n, locale),
      status: episode.status,
      primaryAgent: episode.primaryAgent.name,
      updatedAt: episode.updatedAt,
      artifactCount: episode.artifacts.length,
      riskFlag: project.auditEvents.some(
        (event) => event.episodeId === episode.id && event.result !== "success"
      ),
      summary: localize(episode.summaryI18n, locale)
    })),
    artifacts: flattenedArtifacts.slice(0, 4),
    riskSummary: {
      permissionDeniedCount: project.auditEvents.filter((event) => event.permissionDecision === "deny")
        .length,
      policyHitCount: project.auditEvents.filter((event) => event.policyHitReasonI18n).length,
      failedEpisodeCount: project.episodes.filter((episode) => episode.status === "FAILED").length,
      pendingApprovalCount: project.episodes.filter((episode) => episode.status === "PENDING_REVIEW").length
    }
  };
}

export async function getEpisodeReview(episodeId: string, locale: Locale) {
  const episode = await prisma.episode.findUnique({
    where: { id: episodeId },
    include: {
      project: true,
      primaryAgent: true,
      episodeAgents: { include: { agent: true } },
      memoryItems: { orderBy: { createdAt: "asc" } },
      traceEvents: { include: { actorAgent: true }, orderBy: { stepIndex: "asc" } },
      artifacts: { include: { createdByAgent: true }, orderBy: [{ artifactKey: "asc" }, { version: "desc" }] },
      auditEvents: { orderBy: { occurredAt: "desc" } }
    }
  });

  if (!episode) return null;

  const edges = await prisma.nodeEdge.findMany({
    where: {
      OR: [
        { fromNodeId: episodeId },
        { toNodeId: episodeId },
        { fromNodeId: { in: episode.traceEvents.map((item) => item.id) } },
        { toNodeId: { in: episode.traceEvents.map((item) => item.id) } },
        { fromNodeId: { in: episode.memoryItems.map((item) => item.id) } },
        { toNodeId: { in: episode.memoryItems.map((item) => item.id) } },
        { fromNodeId: { in: episode.artifacts.map((item) => item.id) } },
        { toNodeId: { in: episode.artifacts.map((item) => item.id) } }
      ]
    }
  });

  return {
    id: episode.id,
    title: localize(episode.titleI18n, locale),
    status: episode.status,
    projectId: episode.projectId,
    projectName: localize(episode.project.nameI18n, locale),
    startedAt: episode.startedAt,
    endedAt: episode.endedAt,
    summary: localize(episode.summaryI18n, locale),
    goal: localize(episode.goalI18n, locale),
    finalOutcome: localize(episode.finalOutcomeI18n, locale),
    primaryAgent: episode.primaryAgent.name,
    participatingAgents: episode.episodeAgents.map((item) => item.agent.name),
    policyVersion: episode.policyVersion,
    riskSummary: {
      denied: episode.auditEvents.filter((event) => event.permissionDecision === "deny").length,
      policyHits: episode.auditEvents.filter((event) => event.policyHitReasonI18n).length
    },
    timeline: episode.traceEvents.map((event) => ({
      id: event.id,
      stepIndex: event.stepIndex,
      eventTime: event.eventTime,
      eventType: event.eventType,
      actor: event.actorAgent?.name ?? "System",
      toolName: event.toolName,
      status: event.status,
      stepTitle: localize(event.stepTitleI18n, locale),
      shortResult: localize(event.shortResultI18n, locale),
      inputSummary: localize(event.inputSummaryI18n, locale),
      decisionSummary: localize(event.decisionSummaryI18n, locale),
      toolPayloadSummary: localize(event.toolPayloadSummaryI18n, locale),
      resultSummary: localize(event.resultSummaryI18n, locale),
      errorSummary: localize(event.errorSummaryI18n, locale),
      policyHitReason: localize(event.policyHitReasonI18n, locale),
      permissionDeniedReason: localize(event.permissionDeniedI18n, locale),
      linkedMemoryIds: edges
        .filter((edge) => edge.toNodeId === event.id && edge.toNodeType === "trace" && edge.fromNodeType === "memory")
        .map((edge) => edge.fromNodeId),
      linkedArtifactIds: edges
        .filter((edge) =>
          (edge.fromNodeId === event.id && edge.fromNodeType === "trace" && edge.toNodeType === "artifact") ||
          (edge.toNodeId === event.id && edge.toNodeType === "trace" && edge.fromNodeType === "artifact")
        )
        .map((edge) => (edge.fromNodeType === "artifact" ? edge.fromNodeId : edge.toNodeId))
    })),
    memories: episode.memoryItems.map((memory) => ({
      id: memory.id,
      title: localize(memory.titleI18n, locale),
      content: localize(memory.contentI18n, locale),
      type: memory.type,
      source: memory.source,
      importance: memory.importance,
      sensitivity: memory.sensitivity,
      ttlDays: memory.ttlDays,
      usedInStepCount: edges.filter((edge) => edge.fromNodeId === memory.id && edge.edgeType === "USED_IN").length
    })),
    artifacts: episode.artifacts.map((artifact) => ({
      id: artifact.id,
      artifactKey: artifact.artifactKey,
      title: localize(artifact.titleI18n, locale),
      content: localize(artifact.contentI18n, locale),
      type: artifact.fileType,
      version: artifact.version,
      generatedBy: artifact.createdByAgent.name,
      generatedAt: artifact.createdAt,
      shareScope: artifact.shareScope,
      sensitivity: artifact.sensitivity,
      uri: artifact.uri
    })),
    auditSummary: {
      readCount: episode.auditEvents.filter((event) => event.action.startsWith("read")).length,
      writeCount: episode.auditEvents.filter((event) => event.action.startsWith("append") || event.action.startsWith("create")).length,
      permissionDeniedCount: episode.auditEvents.filter((event) => event.permissionDecision === "deny").length,
      policyHitCount: episode.auditEvents.filter((event) => event.policyHitReasonI18n).length,
      approvalEventCount: episode.auditEvents.filter((event) => statusWeight(event.result) > 0).length
    },
    relationships: edges
  };
}

export async function getArtifactDetail(artifactId: string, locale: Locale) {
  const artifact = await prisma.artifact.findUnique({
    where: { id: artifactId },
    include: {
      episode: { include: { project: true } },
      createdByAgent: true,
      sourceTraceEvent: true
    }
  });

  if (!artifact) return null;

  const versions = await prisma.artifact.findMany({
    where: { artifactKey: artifact.artifactKey },
    include: { createdByAgent: true },
    orderBy: { version: "desc" }
  });

  const edges = await prisma.nodeEdge.findMany({
    where: {
      OR: [{ fromNodeId: artifact.id }, { toNodeId: artifact.id }]
    }
  });

  const memoryIds = edges.filter((edge) => edge.toNodeId === artifact.id && edge.fromNodeType === "memory").map((edge) => edge.fromNodeId);
  const traceIds = edges
    .filter((edge) =>
      (edge.toNodeId === artifact.id && edge.fromNodeType === "trace") ||
      (edge.fromNodeId === artifact.id && edge.toNodeType === "trace")
    )
    .map((edge) => (edge.fromNodeType === "trace" ? edge.fromNodeId : edge.toNodeId));

  const memories = memoryIds.length
    ? await prisma.memoryItem.findMany({ where: { id: { in: memoryIds } } })
    : [];
  const traces = traceIds.length
    ? await prisma.traceEvent.findMany({ where: { id: { in: traceIds } }, orderBy: { stepIndex: "asc" } })
    : [];

  return {
    id: artifact.id,
    title: localize(artifact.titleI18n, locale),
    content: localize(artifact.contentI18n, locale),
    type: artifact.fileType,
    currentVersion: artifact.version,
    createdBy: artifact.createdByAgent.name,
    createdAt: artifact.createdAt,
    updatedAt: artifact.updatedAt,
    sourceEpisodeId: artifact.episodeId,
    sourceEpisodeTitle: localize(artifact.episode.titleI18n, locale),
    sourceProjectId: artifact.episode.projectId,
    sensitivity: artifact.sensitivity,
    shareScope: artifact.shareScope,
    uri: artifact.uri,
    versions: versions.map((version) => ({
      id: version.id,
      version: version.version,
      createdAt: version.createdAt,
      generatedBy: version.createdByAgent.name
    })),
    sourceTraces: traces.map((trace) => ({
      id: trace.id,
      stepIndex: trace.stepIndex,
      title: localize(trace.stepTitleI18n, locale)
    })),
    sourceMemories: memories.map((memory) => ({
      id: memory.id,
      title: localize(memory.titleI18n, locale)
    })),
    consumedByAgents: edges
      .filter((edge) => edge.fromNodeId === artifact.id && edge.toNodeType === "agent")
      .map((edge) => edge.toNodeId)
  };
}

export async function getAuditEvents({
  locale,
  projectId,
  episodeId
}: {
  locale: Locale;
  projectId?: string;
  episodeId?: string;
}) {
  const events = await prisma.auditEvent.findMany({
    where: {
      projectId: projectId || undefined,
      episodeId: episodeId || undefined
    },
    orderBy: { occurredAt: "desc" }
  });

  return events.map((event) => ({
    id: event.id,
    occurredAt: event.occurredAt,
    actorType: event.actorType,
    actorId: event.actorId,
    action: event.action,
    targetType: event.targetType,
    targetId: event.targetId,
    result: event.result,
    policyVersion: event.policyVersion,
    policyHitReason: localize(event.policyHitReasonI18n, locale),
    permissionDecision: event.permissionDecision,
    denyReason: localize(event.denyReasonI18n, locale),
    projectId: event.projectId,
    episodeId: event.episodeId,
    artifactId: event.artifactId
  }));
}

export async function buildEpisodeGraph(episodeId: string, locale: Locale) {
  const episode = await getEpisodeReview(episodeId, locale);
  if (!episode) return null;

  const nodes = [
    ...episode.memories.map((memory) => ({ id: memory.id, type: "memory", label: memory.title })),
    ...episode.timeline.map((trace) => ({ id: trace.id, type: "trace", label: trace.stepTitle })),
    ...episode.artifacts.map((artifact) => ({ id: artifact.id, type: "artifact", label: artifact.title }))
  ];

  return {
    episode: {
      id: episode.id,
      title: episode.title,
      status: episode.status,
      policyVersion: episode.policyVersion
    },
    summary: {
      goal: episode.goal,
      finalOutcome: episode.finalOutcome,
      riskSummary: episode.riskSummary
    },
    timeline: episode.timeline,
    nodes,
    edges: episode.relationships
  };
}
