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

  await fs.writeFile(
    path.join(workspacePath, "episode.json"),
    JSON.stringify(
      {
        product: "Traceplane",
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

  return {
    workspacePath,
    artifactCount: episode.artifacts.length,
    traceCount: episode.traceEvents.length,
    artifactFiles
  };
}
