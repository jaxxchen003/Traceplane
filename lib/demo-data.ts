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
      episode: { include: { project: { include: { workspace: true } } } },
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

function buildHandoffSummary(params: {
  locale: Locale;
  goal: string;
  status: string;
  reviewOutcome: string | null;
  primaryActor: string;
  timeline: Array<{
    stepTitle: string;
    shortResult: string;
    errorSummary: string | null;
    permissionDeniedReason: string | null;
    policyHitReason: string | null;
  }>;
  memories: Array<{ title: string }>;
  artifacts: Array<{ title: string; type: string }>;
}) {
  const { locale, goal, status, reviewOutcome, primaryActor, timeline, memories, artifacts } = params;
  const latestStep = timeline.at(-1) ?? null;
  const latestArtifact = artifacts.at(-1) ?? null;

  let nextAction =
    locale === "zh"
      ? `由 ${primaryActor} 继续沿当前 episode 推进。`
      : `Continue the current episode with ${primaryActor}.`;

  if (status === "IN_REVIEW") {
    nextAction =
      locale === "zh"
        ? "把最新产物交给下一位 Agent 或人工 reviewer 做确认。"
        : "Hand the latest artifact to the next agent or a human reviewer for confirmation.";
  } else if (status === "COMPLETED") {
    nextAction =
      locale === "zh"
        ? "把这条 brief 交给下一位 Agent，直接基于现有产物继续工作。"
        : "Hand this brief to the next agent and continue from the existing artifacts.";
  } else if (status === "FAILED") {
    nextAction =
      locale === "zh"
        ? "先处理失败原因，再决定是重试、替代还是拆出新 episode。"
        : "Resolve the failure first, then decide whether to retry, supersede, or split into a new episode.";
  } else if (status === "BLOCKED") {
    nextAction =
      locale === "zh"
        ? "先解除阻塞，再把同一条工作主线交还给执行 Agent。"
        : "Clear the blocker first, then hand the same work spine back to the execution agent.";
  }

  return {
    goal,
    latestStepTitle: latestStep?.stepTitle ?? (locale === "zh" ? "尚无执行步骤" : "No execution step yet"),
    latestResult:
      latestStep?.shortResult ??
      (locale === "zh" ? "这条主线还没有可交接的最新结果。" : "This spine has no latest result to hand off yet."),
    latestArtifactTitle:
      latestArtifact?.title ?? (locale === "zh" ? "尚无可交接产物" : "No handoff artifact yet"),
    latestArtifactType: latestArtifact?.type ?? "none",
    memoryTitles: memories.slice(0, 3).map((memory) => memory.title),
    cautionItems: [
      latestStep?.errorSummary,
      latestStep?.permissionDeniedReason,
      latestStep?.policyHitReason
    ].filter(Boolean) as string[],
    nextAction,
    readyForHandoff:
      status === "COMPLETED" || status === "IN_REVIEW" || (status === "IN_PROGRESS" && Boolean(latestArtifact)),
    reviewOutcome
  };
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
  const handoffReady =
    episode.status === "COMPLETED" ||
    episode.status === "IN_REVIEW" ||
    (episode.status === "IN_PROGRESS" && episode.artifacts.length > 0);

  let nextMove =
    locale === "zh"
      ? "把这条主线继续交给当前执行 Agent。"
      : "Continue this spine with the current execution agent.";

  if (episode.status === "IN_REVIEW") {
    nextMove =
      locale === "zh"
        ? "把最新产物和 brief 交给下一位 Agent 或人工 reviewer。"
        : "Hand the latest artifact and brief to the next agent or a human reviewer.";
  } else if (episode.status === "COMPLETED") {
    nextMove =
      locale === "zh"
        ? "直接从现有产物继续，而不是重新解释背景。"
        : "Continue from the current artifacts instead of re-explaining the context.";
  } else if (episode.status === "BLOCKED") {
    nextMove =
      locale === "zh"
        ? "先修复缺失上下文、权限或依赖，再恢复同一条主线。"
        : "Repair the missing context, permission, or dependency before resuming the same spine.";
  } else if (episode.status === "FAILED") {
    nextMove =
      locale === "zh"
        ? "先判断是重试、替代，还是从当前失败点拆出新主线。"
        : "Decide whether to retry, supersede, or split a new spine from the failure point.";
  } else if (episode.status === "PLANNED") {
    nextMove =
      locale === "zh"
        ? "这条主线已经定义好了目标，下一位 Agent 可以直接开工。"
        : "The goal is already defined, so the next agent can start immediately.";
  }

  let queueHint =
    locale === "zh"
      ? "继续这条主线"
      : "Continue this spine";

  if (episode.status === "BLOCKED" || episode.status === "FAILED" || permissionDeniedCount > 0 || policyHitCount > 0) {
    queueHint = locale === "zh" ? "先修复再接力" : "Repair before handoff";
  } else if (episode.status === "IN_PROGRESS" || episode.status === "PLANNED") {
    queueHint = locale === "zh" ? "保持接力进行中" : "Keep the handoff live";
  }

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
    policyHitCount,
    handoffReady,
    nextMove,
    queueHint
  };
}

function continueScore(episode: ReturnType<typeof summarizeEpisodeForCommandCenter>) {
  let score = 0;
  if (episode.status === "IN_REVIEW") score += 80;
  if (episode.status === "COMPLETED") score += 65;
  if (episode.reviewOutcome === "PENDING") score += 25;
  score += episode.artifactCount * 6;
  return score;
}

function repairScore(episode: ReturnType<typeof summarizeEpisodeForCommandCenter>) {
  let score = 0;
  if (episode.status === "FAILED") score += 75;
  if (episode.status === "BLOCKED") score += 60;
  score += episode.permissionDeniedCount * 14;
  score += episode.policyHitCount * 10;
  return score;
}

function liveHandoffScore(episode: ReturnType<typeof summarizeEpisodeForCommandCenter>) {
  let score = 0;
  if (episode.status === "IN_PROGRESS") score += 50;
  if (episode.status === "PLANNED") score += 30;
  score += episode.artifactCount * 4;
  return score;
}

export async function getEpisodeCommandCenter(locale: Locale) {
  const episodes = await findEpisodesForCommandCenter();
  const summarized = episodes.map((episode) => summarizeEpisodeForCommandCenter(episode, locale));

  const contextRepair = summarized
    .filter(
      (episode) =>
        episode.status === "BLOCKED" ||
        episode.status === "FAILED" ||
        episode.permissionDeniedCount > 0 ||
        episode.policyHitCount > 0
    )
    .sort((a, b) => repairScore(b) - repairScore(a) || b.updatedAt.getTime() - a.updatedAt.getTime());

  const readyToContinue = summarized
    .filter(
      (episode) =>
        episode.handoffReady &&
        episode.status !== "BLOCKED" &&
        episode.status !== "FAILED" &&
        episode.permissionDeniedCount === 0 &&
        episode.policyHitCount === 0
    )
    .sort((a, b) => continueScore(b) - continueScore(a) || b.updatedAt.getTime() - a.updatedAt.getTime());

  const repairIds = new Set(contextRepair.map((episode) => episode.id));
  const continueIds = new Set(readyToContinue.map((episode) => episode.id));

  const liveHandoffs = summarized
    .filter(
      (episode) =>
        (episode.status === "IN_PROGRESS" || episode.status === "PLANNED") &&
        !repairIds.has(episode.id) &&
        !continueIds.has(episode.id)
    )
    .sort((a, b) => liveHandoffScore(b) - liveHandoffScore(a) || b.updatedAt.getTime() - a.updatedAt.getTime());

  const recentSpines = [...summarized]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 6);

  const graphNodes = summarized.slice(0, 5).flatMap((episode, index) => [
    {
      id: `${episode.id}-episode`,
      label: episode.title,
      meta:
        locale === "zh"
          ? `${episode.projectName} · ${episode.queueHint}`
          : `${episode.projectName} · ${episode.queueHint}`,
      x: [24, 53, 77, 35, 68][index] ?? 50,
      y: [24, 38, 30, 67, 72][index] ?? 50,
      z: 0.96 - index * 0.08,
      tone: "agent" as const
    },
    {
      id: `${episode.id}-artifact`,
      label: locale === "zh" ? "Handoff Brief" : "Handoff Brief",
      meta:
        locale === "zh"
          ? `${episode.artifactCount} 个产物 · ${episode.handoffReady ? "可交接" : "继续中"}`
          : `${episode.artifactCount} artifacts · ${episode.handoffReady ? "handoff-ready" : "still live"}`,
      x: [16, 44, 84, 28, 72][index] ?? 50,
      y: [48, 60, 54, 86, 88][index] ?? 68,
      z: 0.58 - index * 0.04,
      tone: "artifact" as const
    }
  ]);

  const graphEdges = summarized.slice(0, 5).map((episode) => ({
    from: `${episode.id}-episode`,
    to: `${episode.id}-artifact`,
    emphasis: episode.handoffReady ? ("strong" as const) : ("soft" as const)
  }));

  return {
    stats: {
      readyToContinue: readyToContinue.length,
      contextRepair: contextRepair.length,
      liveHandoffs: liveHandoffs.length,
      recentSpines: recentSpines.length
    },
    readyToContinue,
    contextRepair,
    liveHandoffs,
    recentSpines,
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
      },
      {
        id: "codex",
        name: "Codex",
        stage: "MCP+Skills",
        status: "scoped",
        levels: ["MCP", "Skills", "API trace"],
        latestSignal: "MCP path is viable; full local capture still requires runtime-side integration"
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

  const timeline = episode.traceEvents.map((event: EpisodeReviewRecord["traceEvents"][number]) => ({
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
  }));

  const memories = episode.memoryItems.map((memory: EpisodeReviewRecord["memoryItems"][number]) => ({
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
  }));

  const artifacts = episode.artifacts.map((artifact: EpisodeReviewRecord["artifacts"][number]) => ({
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
  }));

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
    handoffSummary: buildHandoffSummary({
      locale,
      goal: localize(episode.goalI18n, locale),
      status: episode.status,
      reviewOutcome: episode.reviewOutcome,
      primaryActor: episode.primaryActor ?? episode.primaryAgent.name,
      timeline,
      memories,
      artifacts
    }),
    timeline,
    memories,
    artifacts,
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
  const runtime = getRuntimeConfig();
  const syncRoot = expandHomePath(runtime.syncRootPath);
  const localizedEpisodeTitle = localize(artifact.episode.titleI18n, locale);
  const episodeDirName = `${slugify(localizedEpisodeTitle)}--${artifact.episode.id.slice(-6)}`;
  const projectionRoot = path.join(
    syncRoot,
    artifact.episode.project.workspace.slug,
    artifact.episode.project.slug,
    episodeDirName
  );

  let projectionExists = false;
  try {
    const stat = await fs.stat(projectionRoot);
    projectionExists = stat.isDirectory();
  } catch {
    projectionExists = false;
  }

  const hasHookCapture = traces.some((trace) =>
    ["UserPromptSubmit", "PreToolUse", "PostToolUse", "Stop"].includes(trace.eventType)
  );
  const isImported = artifact.episode.policyVersion.includes("import");
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
    runtimeSummary: {
      cloudMode: runtime.cloud.mode,
      databaseProvider: runtime.database.provider,
      objectStorageProvider: runtime.objectStorage.provider,
      storageMode: resolvedContent.storageMode,
      projectionRoot,
      projectionExists
    },
    provenanceSummary: {
      mode: provenanceMode,
      host: provenanceHost,
      traceCount: traces.length,
      memoryCount: memories.length,
      isImported,
      hasHookCapture
    },
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

  const runtime = getRuntimeConfig();
  const successCount = events.filter((event) => event.result === "success").length;
  const warningCount = events.filter((event) => event.result === "warning").length;
  const deniedCount = events.filter((event) => event.permissionDecision === "deny").length;
  const policyHitCount = events.filter((event) => event.policyHitReasonI18n).length;

  return {
    runtimeSummary: {
      cloudMode: runtime.cloud.mode,
      databaseProvider: runtime.database.provider,
      objectStorageProvider: runtime.objectStorage.provider,
      syncRoot: runtime.syncRootPath
    },
    summary: {
      totalEvents: events.length,
      successCount,
      warningCount,
      deniedCount,
      policyHitCount
    },
    events: events.map((event: AuditRecord) => ({
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
    }))
  };
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
