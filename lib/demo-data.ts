import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { getRuntimeConfig } from "@/lib/runtime-config";
import { prisma } from "@/lib/prisma";
import { resolveArtifactLocalizedContent } from "@/lib/default-runtime";
import { localize } from "@/lib/format";
import type { Locale } from "@/lib/i18n";

async function findProjectsForList() {
  return prisma.project.findMany({
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
}

async function findProjectForOverview(projectId: string) {
  return prisma.project.findUnique({
    where: { id: projectId },
    include: {
      workspace: true,
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
}

async function findEpisodesForCommandCenter() {
  return prisma.episode.findMany({
    include: {
      project: true,
      primaryAgent: true,
      artifacts: true,
      auditEvents: true
    },
    orderBy: { updatedAt: "desc" }
  });
}

async function findProjectAgentList(projectId: string) {
  return prisma.project.findUnique({
    where: { id: projectId },
    include: {
      projectAgents: {
        include: { agent: true }
      }
    }
  });
}

async function findEpisodeForReview(episodeId: string) {
  return prisma.episode.findUnique({
    where: { id: episodeId },
    include: {
      project: {
        include: {
          workspace: true
        }
      },
      primaryAgent: true,
      episodeAgents: { include: { agent: true } },
      memoryItems: { orderBy: { createdAt: "asc" } },
      traceEvents: { include: { actorAgent: true }, orderBy: { stepIndex: "asc" } },
      artifacts: { include: { createdByAgent: true }, orderBy: [{ artifactKey: "asc" }, { version: "desc" }] },
      auditEvents: { orderBy: { occurredAt: "desc" } }
    }
  });
}

async function findArtifactForDetail(artifactId: string) {
  return prisma.artifact.findUnique({
    where: { id: artifactId },
    include: {
      episode: { include: { project: true } },
      createdByAgent: true,
      sourceTraceEvent: true
    }
  });
}

async function findArtifactVersions(artifactKey: string) {
  return prisma.artifact.findMany({
    where: { artifactKey },
    include: { createdByAgent: true },
    orderBy: { version: "desc" }
  });
}

type ProjectListRecord = Awaited<ReturnType<typeof findProjectsForList>>[number];
type ProjectOverviewRecord = NonNullable<Awaited<ReturnType<typeof findProjectForOverview>>>;
type ProjectAgentsRecord = NonNullable<Awaited<ReturnType<typeof findProjectAgentList>>>;
type EpisodeReviewRecord = NonNullable<Awaited<ReturnType<typeof findEpisodeForReview>>>;
type ArtifactDetailRecord = NonNullable<Awaited<ReturnType<typeof findArtifactForDetail>>>;
type ArtifactVersionRecord = Awaited<ReturnType<typeof findArtifactVersions>>[number];
type CommandCenterEpisodeRecord = Awaited<ReturnType<typeof findEpisodesForCommandCenter>>[number];
type EdgeRecord = Awaited<ReturnType<typeof prisma.nodeEdge.findMany>>[number];
type TraceRecord = Awaited<ReturnType<typeof prisma.traceEvent.findMany>>[number];
type MemoryRecord = Awaited<ReturnType<typeof prisma.memoryItem.findMany>>[number];
type AuditRecord = Awaited<ReturnType<typeof prisma.auditEvent.findMany>>[number];

function statusWeight(status: string) {
  return status === "denied" ? 2 : status === "warning" ? 1 : 0;
}

export async function getWorkspaceSummary() {
  const workspace = await prisma.workspace.findFirst();
  return workspace;
}

function expandHomePath(input: string) {
  if (!input.startsWith("~/")) return input;
  return path.join(os.homedir(), input.slice(2));
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function summarizeEpisodeForCommandCenter(
  episode: CommandCenterEpisodeRecord,
  locale: Locale
) {
  const permissionDeniedCount = episode.auditEvents.filter((event: AuditRecord) => event.permissionDecision === "deny").length;
  const policyHitCount = episode.auditEvents.filter((event: AuditRecord) => event.policyHitReasonI18n).length;

  return {
    id: episode.id,
    title: localize(episode.titleI18n, locale),
    goal: localize(episode.goalI18n, locale),
    summary: localize(episode.summaryI18n, locale),
    successCriteria: localize(episode.successCriteriaI18n, locale),
    status: episode.status,
    workType: episode.workType,
    primaryActor: episode.primaryActor ?? episode.primaryAgent.name,
    primaryAgent: episode.primaryAgent.name,
    projectId: episode.projectId,
    projectName: localize(episode.project.nameI18n, locale),
    updatedAt: episode.updatedAt,
    startedAt: episode.startedAt,
    reviewOutcome: episode.reviewOutcome,
    artifactCount: episode.artifacts.length,
    permissionDeniedCount,
    policyHitCount
  };
}

function attentionScore(episode: ReturnType<typeof summarizeEpisodeForCommandCenter>) {
  let score = 0;
  if (episode.status === "IN_REVIEW") score += 60;
  if (episode.status === "BLOCKED") score += 55;
  if (episode.reviewOutcome === "PENDING") score += 35;
  score += episode.permissionDeniedCount * 10;
  score += episode.policyHitCount * 6;
  return score;
}

export async function getEpisodeCommandCenter(locale: Locale) {
  const episodes = await findEpisodesForCommandCenter();
  const summarized = episodes.map((episode) => summarizeEpisodeForCommandCenter(episode, locale));

  const needsAttention = summarized
    .filter(
      (episode) =>
        episode.status === "IN_REVIEW" ||
        episode.status === "BLOCKED" ||
        episode.reviewOutcome === "PENDING"
    )
    .sort((a, b) => attentionScore(b) - attentionScore(a) || b.updatedAt.getTime() - a.updatedAt.getTime());

  const blockedRisk = summarized
    .filter(
      (episode) =>
        episode.status === "BLOCKED" ||
        episode.status === "FAILED" ||
        episode.permissionDeniedCount > 0 ||
        episode.policyHitCount > 0
    )
    .sort(
      (a, b) =>
        b.permissionDeniedCount + b.policyHitCount - (a.permissionDeniedCount + a.policyHitCount) ||
        b.updatedAt.getTime() - a.updatedAt.getTime()
    );

  const activeWork = summarized
    .filter((episode) => episode.status === "IN_PROGRESS" || episode.status === "PLANNED")
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  const recentActivity = [...summarized]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 6);

  const graphNodes = summarized.slice(0, 5).flatMap((episode, index) => [
    {
      id: `${episode.id}-episode`,
      label: episode.title,
      meta:
        locale === "zh"
          ? `${episode.projectName} · ${episode.workType}`
          : `${episode.projectName} · ${episode.workType}`,
      x: [24, 53, 77, 35, 68][index] ?? 50,
      y: [24, 38, 30, 67, 72][index] ?? 50,
      z: 0.96 - index * 0.08,
      tone: "agent" as const
    },
    {
      id: `${episode.id}-artifact`,
      label: locale === "zh" ? "Output Layer" : "Output Layer",
      meta:
        locale === "zh"
          ? `${episode.artifactCount} 个产物`
          : `${episode.artifactCount} artifacts`,
      x: [16, 44, 84, 28, 72][index] ?? 50,
      y: [48, 60, 54, 86, 88][index] ?? 68,
      z: 0.58 - index * 0.04,
      tone: "artifact" as const
    }
  ]);

  const graphEdges = summarized.slice(0, 5).map((episode) => ({
    from: `${episode.id}-episode`,
    to: `${episode.id}-artifact`,
    emphasis: episode.artifactCount > 0 ? ("strong" as const) : ("soft" as const)
  }));

  return {
    stats: {
      needsAttention: needsAttention.length,
      blockedRisk: blockedRisk.length,
      activeWork: activeWork.length,
      recentActivity: recentActivity.length
    },
    needsAttention,
    blockedRisk,
    activeWork,
    recentActivity,
    graphNodes,
    graphEdges
  };
}

export async function getRuntimeSurfaceSummary() {
  const runtime = getRuntimeConfig();
  const [artifactCount, r2ArtifactCount, inReviewCount, failedCount] = await Promise.all([
    prisma.artifact.count(),
    prisma.artifact.count({
      where: {
        uri: {
          startsWith: "r2://"
        }
      }
    }),
    prisma.episode.count({
      where: {
        status: "IN_REVIEW"
      }
    }),
    prisma.episode.count({
      where: {
        status: "FAILED"
      }
    })
  ]);

  const syncRoot = expandHomePath(runtime.syncRootPath);
  let syncRootExists = false;
  let projectedWorkspaceCount = 0;

  try {
    const stat = await fs.stat(syncRoot);
    syncRootExists = stat.isDirectory();
    if (syncRootExists) {
      const entries = await fs.readdir(syncRoot);
      projectedWorkspaceCount = entries.length;
    }
  } catch {
    syncRootExists = false;
  }

  return {
    runtime,
    counts: {
      artifactCount,
      r2ArtifactCount,
      inlineArtifactCount: artifactCount - r2ArtifactCount,
      inReviewCount,
      failedCount
    },
    localProjection: {
      rootPath: runtime.syncRootPath,
      rootExists: syncRootExists,
      projectedWorkspaceCount
    }
  };
}

export async function getConnectSurfaceSummary() {
  const runtimeSurface = await getRuntimeSurfaceSummary();
  const [episodeCount, artifactCount, importedEpisodes, capturedEpisodes] = await Promise.all([
    prisma.episode.count(),
    prisma.artifact.count(),
    prisma.episode.count({
      where: {
        policyVersion: {
          contains: "import"
        }
      }
    }),
    prisma.traceEvent.count({
      where: {
        eventType: {
          in: ["UserPromptSubmit", "PreToolUse", "PostToolUse", "Stop"]
        }
      }
    })
  ]);

  return {
    runtimeSurface,
    totals: {
      episodeCount,
      artifactCount,
      importedEpisodes,
      capturedEvents: capturedEpisodes
    },
    hosts: [
      {
        id: "claude",
        name: "Claude Code",
        stage: "Capture",
        status: "ready",
        levels: ["MCP", "Setup", "Hooks"],
        latestSignal:
          capturedEpisodes > 0 ? "Hook capture available" : "Hook bridge ready, awaiting live events"
      },
      {
        id: "opencode",
        name: "OpenCode",
        stage: "Import+MCP",
        status: "ready",
        levels: ["MCP", "Setup", "Import"],
        latestSignal:
          importedEpisodes > 0 ? "Normalized import path verified" : "Import pipeline prepared"
      },
      {
        id: "gemini",
        name: "Gemini CLI",
        stage: "Setup",
        status: "prepared",
        levels: ["MCP", "Verify"],
        latestSignal: "Setup and verification commands available"
      }
    ]
  };
}

export async function getProjects(locale: Locale) {
  const projects = await findProjectsForList();

  return projects.map((project: ProjectListRecord) => {
    const riskEvents = project.auditEvents.filter((event: AuditRecord) => event.result !== "success");
    return {
      id: project.id,
      slug: project.slug,
      name: localize(project.nameI18n, locale),
      description: localize(project.descriptionI18n, locale),
      status: project.status,
      lastActiveAt: project.updatedAt,
      agentCount: project.projectAgents.length,
      episodeCount: project.episodes.length,
      artifactCount: project.episodes.reduce(
        (sum: number, episode: ProjectListRecord["episodes"][number]) => sum + episode.artifacts.length,
        0
      ),
      riskEventCount: riskEvents.length,
      activePolicyVersion: project.activePolicyVersion
    };
  });
}

export async function getProjectOverview(projectId: string, locale: Locale) {
  const project = await findProjectForOverview(projectId);

  if (!project) return null;

  const flattenedArtifacts = project.episodes
    .flatMap((episode: ProjectOverviewRecord["episodes"][number]) =>
      episode.artifacts.map((artifact: ProjectOverviewRecord["episodes"][number]["artifacts"][number]) => ({
        id: artifact.id,
        title: localize(artifact.titleI18n, locale),
        type: artifact.fileType,
        episodeTitle: localize(episode.titleI18n, locale),
        generatedByAgent: episode.primaryAgent.name,
        updatedAt: artifact.updatedAt
      }))
    )
    .sort(
      (
        a: { updatedAt: Date },
        b: { updatedAt: Date }
      ) => b.updatedAt.getTime() - a.updatedAt.getTime()
    );

  const runtime = getRuntimeConfig();
  const syncRoot = expandHomePath(runtime.syncRootPath);
  let projectionExists = false;

  try {
    const stat = await fs.stat(path.join(syncRoot, project.workspace?.slug ?? "", project.slug));
    projectionExists = stat.isDirectory();
  } catch {
    projectionExists = false;
  }

  const artifactUris = project.episodes.flatMap((episode) => episode.artifacts.map((artifact) => artifact.uri));
  const r2ArtifactCount = artifactUris.filter((uri) => typeof uri === "string" && uri.startsWith("r2://")).length;
  const totalArtifactCount = project.episodes.reduce(
    (sum, episode) => sum + episode.artifacts.length,
    0
  );
  const inlineArtifactCount = totalArtifactCount - r2ArtifactCount;

  const continuitySummary = {
    dependsOnCount: project.auditEvents.filter((event) => event.action === "link_episode").length,
    reviewPressureCount: project.episodes.filter((episode) => episode.status === "IN_REVIEW").length,
    failedEpisodesCount: project.episodes.filter((episode) => episode.status === "FAILED").length
  };

  return {
    id: project.id,
    name: localize(project.nameI18n, locale),
    description: localize(project.descriptionI18n, locale),
    ownerName: project.ownerName,
    status: project.status,
    createdAt: project.createdAt,
    activePolicyVersion: project.activePolicyVersion,
    agents: project.projectAgents.map(({ agent }: ProjectOverviewRecord["projectAgents"][number]) => ({
      id: agent.id,
      name: agent.name,
      role: localize(agent.roleI18n, locale),
      lastActiveAt: agent.lastActiveAt,
      episodesInvolvedCount: project.episodes.filter(
        (episode: ProjectOverviewRecord["episodes"][number]) => episode.primaryAgentId === agent.id
      ).length,
      artifactsGeneratedCount: project.episodes.reduce(
        (sum: number, episode: ProjectOverviewRecord["episodes"][number]) =>
          sum +
          episode.artifacts.filter(
            (artifact: ProjectOverviewRecord["episodes"][number]["artifacts"][number]) =>
              artifact.createdByAgentId === agent.id
          ).length,
        0
      )
    })),
    episodes: project.episodes.map((episode: ProjectOverviewRecord["episodes"][number]) => ({
      id: episode.id,
      title: localize(episode.titleI18n, locale),
      status: episode.status,
      primaryAgent: episode.primaryAgent.name,
      updatedAt: episode.updatedAt,
      artifactCount: episode.artifacts.length,
      riskFlag: project.auditEvents.some(
        (event: AuditRecord) => event.episodeId === episode.id && event.result !== "success"
      ),
      summary: localize(episode.summaryI18n, locale)
    })),
    artifacts: flattenedArtifacts.slice(0, 4),
    runtimeSummary: {
      cloudMode: runtime.cloud.mode,
      databaseProvider: runtime.database.provider,
      objectStorageProvider: runtime.objectStorage.provider,
      projectionRoot: runtime.syncRootPath,
      projectionExists,
      r2ArtifactCount,
      inlineArtifactCount
    },
    continuitySummary,
    riskSummary: {
      permissionDeniedCount: project.auditEvents.filter(
        (event: AuditRecord) => event.permissionDecision === "deny"
      )
        .length,
      policyHitCount: project.auditEvents.filter((event: AuditRecord) => event.policyHitReasonI18n).length,
      failedEpisodeCount: project.episodes.filter(
        (episode: ProjectOverviewRecord["episodes"][number]) => episode.status === "FAILED"
      ).length,
      pendingApprovalCount: project.episodes.filter(
        (episode: ProjectOverviewRecord["episodes"][number]) => episode.status === "IN_REVIEW"
      ).length
    }
  };
}

export async function getProjectAgents(projectId: string, locale: Locale) {
  const project = await findProjectAgentList(projectId);

  if (!project) return [];

  return project.projectAgents.map(({ agent }: ProjectAgentsRecord["projectAgents"][number]) => ({
    id: agent.id,
    name: agent.name,
    role: localize(agent.roleI18n, locale)
  }));
}

export async function getEpisodeReview(episodeId: string, locale: Locale) {
  const episode = await findEpisodeForReview(episodeId);

  if (!episode) return null;

  const edges = await prisma.nodeEdge.findMany({
    where: {
      OR: [
        { fromNodeId: episodeId },
        { toNodeId: episodeId },
        { fromNodeId: { in: episode.traceEvents.map((item: EpisodeReviewRecord["traceEvents"][number]) => item.id) } },
        { toNodeId: { in: episode.traceEvents.map((item: EpisodeReviewRecord["traceEvents"][number]) => item.id) } },
        { fromNodeId: { in: episode.memoryItems.map((item: EpisodeReviewRecord["memoryItems"][number]) => item.id) } },
        { toNodeId: { in: episode.memoryItems.map((item: EpisodeReviewRecord["memoryItems"][number]) => item.id) } },
        { fromNodeId: { in: episode.artifacts.map((item: EpisodeReviewRecord["artifacts"][number]) => item.id) } },
        { toNodeId: { in: episode.artifacts.map((item: EpisodeReviewRecord["artifacts"][number]) => item.id) } }
      ]
    }
  });

  const runtime = getRuntimeConfig();
  const syncRoot = expandHomePath(runtime.syncRootPath);
  const localizedEpisodeTitle = localize(episode.titleI18n, locale);
  const episodeDirName = `${slugify(localizedEpisodeTitle)}--${episode.id.slice(-6)}`;
  const projectionPath = path.join(
    syncRoot,
    episode.project.workspace.slug,
    episode.project.slug,
    episodeDirName
  );

  let projectionExists = false;
  try {
    const stat = await fs.stat(projectionPath);
    projectionExists = stat.isDirectory();
  } catch {
    projectionExists = false;
  }

  const artifactUris = episode.artifacts.map((artifact) => artifact.uri);
  const r2ArtifactCount = artifactUris.filter((uri) => typeof uri === "string" && uri.startsWith("r2://")).length;
  const inlineArtifactCount = episode.artifacts.length - r2ArtifactCount;
  const hasHookCapture = episode.traceEvents.some((event) =>
    ["UserPromptSubmit", "PreToolUse", "PostToolUse", "Stop"].includes(event.eventType)
  );
  const isImported = episode.policyVersion.includes("import");
  const provenanceMode = isImported
    ? "transcript-import"
    : hasHookCapture
      ? "hook-capture"
      : "local-ui";
  const provenanceHost = isImported
    ? "OpenCode / import pipeline"
    : hasHookCapture
      ? "Claude Code"
      : "Traceplane local control panel";

  return {
    id: episode.id,
    title: localizedEpisodeTitle,
    status: episode.status,
    projectId: episode.projectId,
    projectName: localize(episode.project.nameI18n, locale),
    startedAt: episode.startedAt,
    endedAt: episode.endedAt,
    summary: localize(episode.summaryI18n, locale),
    goal: localize(episode.goalI18n, locale),
    successCriteria: localize(episode.successCriteriaI18n, locale),
    finalOutcome: localize(episode.finalOutcomeI18n, locale),
    workType: episode.workType,
    primaryActor: episode.primaryActor ?? episode.primaryAgent.name,
    primaryAgent: episode.primaryAgent.name,
    participatingAgents: episode.episodeAgents.map((item: EpisodeReviewRecord["episodeAgents"][number]) => item.agent.name),
    policyVersion: episode.policyVersion,
    reviewOutcome: episode.reviewOutcome,
    riskSummary: {
      denied: episode.auditEvents.filter((event: AuditRecord) => event.permissionDecision === "deny").length,
      policyHits: episode.auditEvents.filter((event: AuditRecord) => event.policyHitReasonI18n).length
    },
    runtimeSummary: {
      cloudMode: runtime.cloud.mode,
      databaseProvider: runtime.database.provider,
      objectStorageProvider: runtime.objectStorage.provider,
      projectionRoot: runtime.syncRootPath,
      projectionPath,
      projectionExists
    },
    storageSummary: {
      totalArtifacts: episode.artifacts.length,
      r2ArtifactCount,
      inlineArtifactCount,
      projectionExists
    },
    provenanceSummary: {
      mode: provenanceMode,
      host: provenanceHost,
      signals: {
        hasHookCapture,
        isImported,
        traceEventCount: episode.traceEvents.length
      }
    },
    timeline: episode.traceEvents.map((event: EpisodeReviewRecord["traceEvents"][number]) => ({
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
        .filter(
          (edge: EdgeRecord) =>
            edge.toNodeId === event.id && edge.toNodeType === "trace" && edge.fromNodeType === "memory"
        )
        .map((edge: EdgeRecord) => edge.fromNodeId),
      linkedArtifactIds: edges
        .filter((edge: EdgeRecord) =>
          (edge.fromNodeId === event.id && edge.fromNodeType === "trace" && edge.toNodeType === "artifact") ||
          (edge.toNodeId === event.id && edge.toNodeType === "trace" && edge.fromNodeType === "artifact")
        )
        .map((edge: EdgeRecord) => (edge.fromNodeType === "artifact" ? edge.fromNodeId : edge.toNodeId))
    })),
    memories: episode.memoryItems.map((memory: EpisodeReviewRecord["memoryItems"][number]) => ({
      id: memory.id,
      title: localize(memory.titleI18n, locale),
      content: localize(memory.contentI18n, locale),
      type: memory.type,
      source: memory.source,
      importance: memory.importance,
      sensitivity: memory.sensitivity,
      ttlDays: memory.ttlDays,
      usedInStepCount: edges.filter(
        (edge: EdgeRecord) => edge.fromNodeId === memory.id && edge.edgeType === "USED_IN"
      ).length
    })),
    artifacts: episode.artifacts.map((artifact: EpisodeReviewRecord["artifacts"][number]) => ({
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
      readCount: episode.auditEvents.filter((event: AuditRecord) => event.action.startsWith("read")).length,
      writeCount: episode.auditEvents.filter(
        (event: AuditRecord) => event.action.startsWith("append") || event.action.startsWith("create")
      ).length,
      permissionDeniedCount: episode.auditEvents.filter(
        (event: AuditRecord) => event.permissionDecision === "deny"
      ).length,
      policyHitCount: episode.auditEvents.filter((event: AuditRecord) => event.policyHitReasonI18n).length,
      approvalEventCount: episode.auditEvents.filter((event: AuditRecord) => statusWeight(event.result) > 0).length
    },
    relationships: edges
  };
}

export async function getArtifactDetail(artifactId: string, locale: Locale) {
  const artifact = await findArtifactForDetail(artifactId);

  if (!artifact) return null;

  const versions = await findArtifactVersions(artifact.artifactKey);

  const edges = await prisma.nodeEdge.findMany({
    where: {
      OR: [{ fromNodeId: artifact.id }, { toNodeId: artifact.id }]
    }
  });

  const memoryIds = edges
    .filter((edge: EdgeRecord) => edge.toNodeId === artifact.id && edge.fromNodeType === "memory")
    .map((edge: EdgeRecord) => edge.fromNodeId);
  const traceIds = edges
    .filter((edge: EdgeRecord) =>
      (edge.toNodeId === artifact.id && edge.fromNodeType === "trace") ||
      (edge.fromNodeId === artifact.id && edge.toNodeType === "trace")
    )
    .map((edge: EdgeRecord) => (edge.fromNodeType === "trace" ? edge.fromNodeId : edge.toNodeId));

  const memories = memoryIds.length
    ? await prisma.memoryItem.findMany({ where: { id: { in: memoryIds } } })
    : [];
  const traces = traceIds.length
    ? await prisma.traceEvent.findMany({ where: { id: { in: traceIds } }, orderBy: { stepIndex: "asc" } })
    : [];
  const resolvedContent = await resolveArtifactLocalizedContent(artifact, locale);

  return {
    id: artifact.id,
    title: localize(artifact.titleI18n, locale),
    content: resolvedContent.content,
    storageMode: resolvedContent.storageMode,
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
    versions: versions.map((version: ArtifactVersionRecord) => ({
      id: version.id,
      version: version.version,
      createdAt: version.createdAt,
      generatedBy: version.createdByAgent.name
    })),
    sourceTraces: traces.map((trace: TraceRecord) => ({
      id: trace.id,
      stepIndex: trace.stepIndex,
      title: localize(trace.stepTitleI18n, locale)
    })),
    sourceMemories: memories.map((memory: MemoryRecord) => ({
      id: memory.id,
      title: localize(memory.titleI18n, locale)
    })),
    consumedByAgents: edges
      .filter((edge: EdgeRecord) => edge.fromNodeId === artifact.id && edge.toNodeType === "agent")
      .map((edge: EdgeRecord) => edge.toNodeId)
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

  return events.map((event: AuditRecord) => ({
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
    ...episode.memories.map((memory: { id: string; title: string }) => ({ id: memory.id, type: "memory", label: memory.title })),
    ...episode.timeline.map((trace: { id: string; stepTitle: string }) => ({ id: trace.id, type: "trace", label: trace.stepTitle })),
    ...episode.artifacts.map((artifact: { id: string; title: string }) => ({ id: artifact.id, type: "artifact", label: artifact.title }))
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
      successCriteria: episode.successCriteria,
      finalOutcome: episode.finalOutcome,
      riskSummary: episode.riskSummary
    },
    timeline: episode.timeline,
    nodes,
    edges: episode.relationships
  };
}
