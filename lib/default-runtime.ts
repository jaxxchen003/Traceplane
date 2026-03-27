import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { localize } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { getRuntimeConfig } from "@/lib/runtime-config";

import { readArtifactBlob } from "@/lib/artifact-storage";

function expandHomePath(input: string) {
  if (!input.startsWith("~/")) return input;
  return path.join(os.homedir(), input.slice(2));
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "episode";
}

function getArtifactExtension(fileType: string) {
  switch (fileType) {
    case "MARKDOWN":
      return "md";
    case "JSON":
      return "json";
    case "CSV":
      return "csv";
    case "HTML":
      return "html";
    case "SVG":
      return "svg";
    case "PDF":
      return "pdf";
    case "SCRIPT":
      return "txt";
    case "IMAGE":
      return "txt";
    default:
      return "txt";
  }
}

function buildContinuationPacket({
  locale,
  projectName,
  episodeTitle,
  goal,
  successCriteria,
  primaryActor,
  latestStepTitle,
  latestResult,
  latestArtifactTitle,
  latestArtifactType,
  nextAction,
  memories,
  artifacts,
  recentSteps,
  cautionItems
}: {
  locale: Locale;
  projectName: string;
  episodeTitle: string;
  goal: string;
  successCriteria: string;
  primaryActor: string;
  latestStepTitle: string;
  latestResult: string;
  latestArtifactTitle: string;
  latestArtifactType: string;
  nextAction: string;
  memories: string[];
  artifacts: string[];
  recentSteps: string[];
  cautionItems: string[];
}) {
  const lines = locale === "zh"
    ? [
        "你正在接手 Traceplane 中的一条工作主线。",
        `项目：${projectName}`,
        `Episode：${episodeTitle}`,
        `目标：${goal}`,
        `成功标准：${successCriteria}`,
        `当前主执行角色：${primaryActor}`,
        `最新一步：${latestStepTitle}`,
        `最新结果：${latestResult}`,
        `最新产物：${latestArtifactTitle} (${latestArtifactType})`,
        `下一步建议：${nextAction}`,
        `优先带上的上下文：${memories.join("；") || "无"}`,
        `最近工作脉络：${recentSteps.join("；") || "无"}`,
        `可直接复用的产物：${artifacts.join("；") || "无"}`,
        `交接注意：${cautionItems.join("；") || "当前没有显式风险提示"}`,
        "工作要求：不要重新收集已经存在的上下文，先基于现有 brief、memory 和 artifact 继续。"
      ]
    : [
        "You are taking over an active Traceplane work spine.",
        `Project: ${projectName}`,
        `Episode: ${episodeTitle}`,
        `Goal: ${goal}`,
        `Success criteria: ${successCriteria}`,
        `Current execution role: ${primaryActor}`,
        `Latest step: ${latestStepTitle}`,
        `Latest result: ${latestResult}`,
        `Latest artifact: ${latestArtifactTitle} (${latestArtifactType})`,
        `Recommended next action: ${nextAction}`,
        `Carry forward these context nodes: ${memories.join("; ") || "None"}`,
        `Recent work path: ${recentSteps.join("; ") || "None"}`,
        `Reusable artifacts: ${artifacts.join("; ") || "None"}`,
        `Cautions: ${cautionItems.join("; ") || "No explicit caution items"}`,
        "Instruction: do not re-collect existing context. Continue from the current brief, memories, and artifacts."
      ];

  return lines.join("\n");
}

export async function resolveArtifactLocalizedContent(
  artifact: {
    contentI18n?: unknown | null;
    uri?: string | null;
  },
  locale: Locale
) {
  const inline = localize(artifact.contentI18n, locale);
  if (inline) {
    return {
      content: inline,
      storageMode: artifact.uri?.startsWith("r2://") ? ("inline+r2" as const) : ("inline" as const)
    };
  }

  if (artifact.uri?.startsWith("r2://")) {
    try {
      const blob = await readArtifactBlob(artifact.uri);
      return {
        content: localize(blob?.contentI18n, locale),
        storageMode: "r2" as const
      };
    } catch {
      return {
        content: "",
        storageMode: "r2-unavailable" as const
      };
    }
  }

  return {
    content: "",
    storageMode: "empty" as const
  };
}

export async function projectEpisodeToLocalWorkspace({
  episodeId,
  locale = "zh"
}: {
  episodeId: string;
  locale?: Locale;
}) {
  const episode = await prisma.episode.findUnique({
    where: { id: episodeId },
    include: {
      project: {
        include: {
          workspace: true
        }
      },
      primaryAgent: true,
      memoryItems: {
        orderBy: {
          createdAt: "asc"
        }
      },
      traceEvents: {
        orderBy: {
          stepIndex: "asc"
        }
      },
      artifacts: {
        orderBy: [{ artifactKey: "asc" }, { version: "asc" }]
      }
    }
  });

  if (!episode) {
    throw new Error(`Episode not found: ${episodeId}`);
  }

  const syncRoot = expandHomePath(getRuntimeConfig().syncRootPath);
  const episodeDirName = `${slugify(localize(episode.titleI18n, locale)) || episode.id}--${episode.id.slice(-6)}`;
  const workspacePath = path.join(syncRoot, episode.project.workspace.slug, episode.project.slug, episodeDirName);
  const artifactRoot = path.join(workspacePath, "artifacts");
  const traceRoot = path.join(workspacePath, "trace");

  await fs.mkdir(artifactRoot, { recursive: true });
  await fs.mkdir(traceRoot, { recursive: true });

  const artifactFiles: string[] = [];
  for (const artifact of episode.artifacts) {
    const resolved = await resolveArtifactLocalizedContent(artifact, locale);
    const extension = getArtifactExtension(artifact.fileType);
    const artifactDir = path.join(artifactRoot, slugify(artifact.artifactKey));
    const targetPath = path.join(artifactDir, `v${artifact.version}.${extension}`);
    await fs.mkdir(artifactDir, { recursive: true });
    await fs.writeFile(targetPath, resolved.content || "", "utf8");
    artifactFiles.push(targetPath);
  }

  const traceLines = episode.traceEvents.map((trace) =>
    JSON.stringify({
      stepIndex: trace.stepIndex,
      eventType: trace.eventType,
      toolName: trace.toolName,
      status: trace.status,
      title: localize(trace.stepTitleI18n, locale),
      result: localize(trace.shortResultI18n, locale),
      decision: localize(trace.decisionSummaryI18n, locale),
      error: localize(trace.errorSummaryI18n, locale),
      eventTime: trace.eventTime
    })
  );
  await fs.writeFile(path.join(traceRoot, "timeline.jsonl"), traceLines.join("\n"), "utf8");

  const latestTrace = episode.traceEvents.at(-1);
  const latestArtifact = episode.artifacts.at(-1);
  const continuationPacket = buildContinuationPacket({
    locale,
    projectName: localize(episode.project.nameI18n, locale),
    episodeTitle: localize(episode.titleI18n, locale),
    goal: localize(episode.goalI18n, locale),
    successCriteria: localize(episode.successCriteriaI18n, locale),
    primaryActor: episode.primaryActor ?? episode.primaryAgent.name,
    latestStepTitle: localize(latestTrace?.stepTitleI18n, locale) || (locale === "zh" ? "尚无执行步骤" : "No execution step yet"),
    latestResult: localize(latestTrace?.shortResultI18n, locale) || (locale === "zh" ? "这条主线还没有可交接的最新结果。" : "This spine has no latest result to hand off yet."),
    latestArtifactTitle: localize(latestArtifact?.titleI18n, locale) || (locale === "zh" ? "尚无可交接产物" : "No handoff artifact yet"),
    latestArtifactType: latestArtifact?.fileType ?? "none",
    nextAction:
      episode.status === "COMPLETED"
        ? locale === "zh"
          ? "把这条 brief 交给下一位 Agent，直接基于现有产物继续工作。"
          : "Hand this brief to the next agent and continue from the existing artifacts."
        : episode.status === "IN_REVIEW"
          ? locale === "zh"
            ? "把最新产物交给下一位 Agent 或人工 reviewer 做确认。"
            : "Hand the latest artifact to the next agent or a human reviewer for confirmation."
          : locale === "zh"
            ? "沿当前主线继续推进，不要重新解释背景。"
            : "Continue along the current spine without re-explaining the context.",
    memories: episode.memoryItems.slice(0, 3).map((memory) => localize(memory.titleI18n, locale)).filter(Boolean),
    artifacts: episode.artifacts.slice(0, 3).map((artifact) => `${localize(artifact.titleI18n, locale)} v${artifact.version}`),
    recentSteps: episode.traceEvents.slice(-3).map((trace) => `${localize(trace.stepTitleI18n, locale)} -> ${localize(trace.shortResultI18n, locale)}`),
    cautionItems: episode.traceEvents.flatMap((trace) => [localize(trace.errorSummaryI18n, locale), localize(trace.permissionDeniedI18n, locale), localize(trace.policyHitReasonI18n, locale)]).filter(Boolean).slice(-3)
  });

  await fs.writeFile(path.join(workspacePath, "continuation-packet.txt"), continuationPacket, "utf8");
  await fs.writeFile(
    path.join(workspacePath, "handoff-brief.json"),
    JSON.stringify(
      {
        episodeId: episode.id,
        title: localize(episode.titleI18n, locale),
        goal: localize(episode.goalI18n, locale),
        successCriteria: localize(episode.successCriteriaI18n, locale),
        status: episode.status,
        primaryActor: episode.primaryActor ?? episode.primaryAgent.name,
        continuationPacket
      },
      null,
      2
    ),
    "utf8"
  );

  await fs.writeFile(
    path.join(workspacePath, "episode.json"),
    JSON.stringify(
      {
        product: "Traceplane",
        runtime: {
          sourceOfTruth: getRuntimeConfig().database.provider === "postgres" ? "cloud" : "local",
          databaseProvider: getRuntimeConfig().database.provider,
          databaseSource: getRuntimeConfig().database.source,
          objectStorageProvider: getRuntimeConfig().objectStorage.provider,
          deploymentStage: getRuntimeConfig().cloud.deploymentStage,
          syncRootPath: getRuntimeConfig().syncRootPath
        },
        episodeId: episode.id,
        projectId: episode.projectId,
        workspaceSlug: episode.project.workspace.slug,
        projectSlug: episode.project.slug,
        title: localize(episode.titleI18n, locale),
        goal: localize(episode.goalI18n, locale),
        successCriteria: localize(episode.successCriteriaI18n, locale),
        status: episode.status,
        primaryActor: episode.primaryActor ?? episode.primaryAgent.name,
        workType: episode.workType,
        reviewOutcome: episode.reviewOutcome,
        policyVersion: episode.policyVersion,
        artifactCount: episode.artifacts.length,
        traceCount: episode.traceEvents.length,
        projectedAt: new Date().toISOString()
      },
      null,
      2
    ),
    "utf8"
  );

  await fs.writeFile(
    path.join(workspacePath, "traceplane.runtime.json"),
    JSON.stringify(
      {
        product: "Traceplane",
        sourceOfTruth: getRuntimeConfig().database.provider === "postgres" ? "cloud" : "local",
        databaseProvider: getRuntimeConfig().database.provider,
        databaseSource: getRuntimeConfig().database.source,
        objectStorageProvider: getRuntimeConfig().objectStorage.provider,
        deploymentStage: getRuntimeConfig().cloud.deploymentStage,
        syncRootPath: getRuntimeConfig().syncRootPath,
        projectedAt: new Date().toISOString()
      },
      null,
      2
    ),
    "utf8"
  );

  return {
    workspacePath,
    artifactCount: episode.artifacts.length,
    traceCount: episode.traceEvents.length,
    artifactFiles
  };
}
