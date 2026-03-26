import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import "./_lib/load-env.mjs";
import { readArtifactBlob } from "./_lib/artifact-storage.mjs";
import { createRuntimePrismaClient } from "./_lib/cloud-database.mjs";

function localize(value, locale) {
  if (!value || typeof value !== "object") return "";
  return value?.[locale] ?? value?.zh ?? value?.en ?? "";
}

function expandHomePath(input) {
  if (!input.startsWith("~/")) return input;
  return path.join(os.homedir(), input.slice(2));
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "episode";
}

function getArtifactExtension(fileType) {
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
    default:
      return "txt";
  }
}

async function resolveArtifactContent(artifact, locale) {
  const inline = localize(artifact.contentI18n, locale);
  if (inline) {
    return {
      content: inline,
      storageMode: artifact.uri?.startsWith("r2://") ? "inline+r2" : "inline"
    };
  }

  if (artifact.uri?.startsWith("r2://")) {
    const blob = await readArtifactBlob(artifact.uri);
    return {
      content: localize(blob?.contentI18n, locale),
      storageMode: "r2"
    };
  }

  return {
    content: "",
    storageMode: "empty"
  };
}

async function syncEpisodeWorkspace(episodeId, locale = "zh") {
  const runtimeClient = await createRuntimePrismaClient();
  const prisma = runtimeClient.prisma;
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

  const syncRoot = expandHomePath(process.env.SYNC_ROOT_PATH || "~/Traceplane");
  const episodeDirName = `${slugify(localize(episode.titleI18n, locale))}--${episode.id.slice(-6)}`;
  const root = path.join(syncRoot, episode.project.workspace.slug, episode.project.slug, episodeDirName);
  const traceDir = path.join(root, "trace");
  const artifactDir = path.join(root, "artifacts");

  await fs.mkdir(traceDir, { recursive: true });
  await fs.mkdir(artifactDir, { recursive: true });

  const writtenArtifacts = [];
  for (const artifact of episode.artifacts) {
    const resolved = await resolveArtifactContent(artifact, locale);
    const targetDir = path.join(artifactDir, slugify(artifact.artifactKey));
    const filename = `v${artifact.version}.${getArtifactExtension(artifact.fileType)}`;
    const fullPath = path.join(targetDir, filename);
    await fs.mkdir(targetDir, { recursive: true });
    await fs.writeFile(fullPath, resolved.content || "", "utf8");
    writtenArtifacts.push({
      artifactKey: artifact.artifactKey,
      version: artifact.version,
      filePath: fullPath,
      storageMode: resolved.storageMode
    });
  }

  const traceLines = episode.traceEvents.map((trace) =>
    JSON.stringify({
      stepIndex: trace.stepIndex,
      eventType: trace.eventType,
      toolName: trace.toolName,
      status: trace.status,
      title: localize(trace.stepTitleI18n, locale),
      shortResult: localize(trace.shortResultI18n, locale),
      decision: localize(trace.decisionSummaryI18n, locale),
      result: localize(trace.resultSummaryI18n, locale),
      error: localize(trace.errorSummaryI18n, locale),
      eventTime: trace.eventTime
    })
  );
  await fs.writeFile(path.join(traceDir, "timeline.jsonl"), traceLines.join("\n"), "utf8");

  await fs.writeFile(
    path.join(root, "episode.json"),
    JSON.stringify(
      {
        product: "Traceplane",
        runtime: {
          sourceOfTruth: runtimeClient.sourceOfTruth,
          provider: runtimeClient.provider,
          databaseSource: runtimeClient.source
        },
        episodeId: episode.id,
        title: localize(episode.titleI18n, locale),
        goal: localize(episode.goalI18n, locale),
        successCriteria: localize(episode.successCriteriaI18n, locale),
        status: episode.status,
        reviewOutcome: episode.reviewOutcome,
        workType: episode.workType,
        primaryActor: episode.primaryActor ?? episode.primaryAgent.name,
        project: {
          id: episode.project.id,
          slug: episode.project.slug,
          workspaceSlug: episode.project.workspace.slug
        },
        projectedAt: new Date().toISOString(),
        artifacts: writtenArtifacts.map((item) => ({
          artifactKey: item.artifactKey,
          version: item.version,
          filePath: item.filePath,
          storageMode: item.storageMode
        }))
      },
      null,
      2
    ),
    "utf8"
  );

  await prisma.$disconnect();

  return {
    root,
    artifactCount: writtenArtifacts.length,
    traceCount: episode.traceEvents.length,
    runtime: runtimeClient
  };
}

async function main() {
  const episodeId = process.argv[2];
  const locale = process.argv[3] || "zh";

  if (!episodeId) {
    throw new Error("Usage: node scripts/sync-local-workspace.mjs <episodeId> [locale]");
  }

  const result = await syncEpisodeWorkspace(episodeId, locale);
  console.log(
    JSON.stringify(
      {
        ok: true,
        episodeId,
        locale,
        syncRoot: result.root,
        artifactCount: result.artifactCount,
        traceCount: result.traceCount,
        runtime: {
          sourceOfTruth: result.runtime.sourceOfTruth,
          provider: result.runtime.provider,
          databaseSource: result.runtime.source
        }
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error(
      JSON.stringify(
        {
          ok: false,
          error: error instanceof Error ? error.message : String(error)
        },
        null,
        2
      )
    );
    process.exitCode = 1;
  });
