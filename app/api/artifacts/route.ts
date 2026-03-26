import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { persistArtifactBlob } from "@/lib/artifact-storage";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.episodeId || !body.createdByAgentId || !body.artifactKey || !body.titleI18n?.zh) {
    return NextResponse.json({ error: "episodeId, createdByAgentId, artifactKey, and titleI18n.zh are required" }, { status: 400 });
  }

  const episode = await prisma.episode.findUnique({
    where: { id: body.episodeId },
    include: { project: true }
  });

  if (!episode) {
    return NextResponse.json({ error: "Episode not found" }, { status: 404 });
  }

  const latest = await prisma.artifact.findFirst({
    where: { artifactKey: body.artifactKey },
    orderBy: { version: "desc" }
  });

  const nextVersion = latest ? latest.version + 1 : 1;
  const contentI18n = body.contentI18n ?? null;
  const blobResult = await persistArtifactBlob({
    workspaceId: episode.project.workspaceId,
    projectId: episode.projectId,
    episodeId: body.episodeId,
    artifactKey: body.artifactKey,
    version: nextVersion,
    fileType: body.fileType ?? "MARKDOWN",
    titleI18n: body.titleI18n,
    contentI18n
  });

  const artifact = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const created = await tx.artifact.create({
      data: {
        episodeId: body.episodeId,
        createdByAgentId: body.createdByAgentId,
        sourceTraceEventId: body.sourceTraceEventId ?? null,
        artifactKey: body.artifactKey,
        titleI18n: body.titleI18n,
        contentI18n,
        fileType: body.fileType ?? "MARKDOWN",
        version: nextVersion,
        uri: body.uri ?? blobResult.uri ?? null,
        sensitivity: body.sensitivity ?? "Internal",
        shareScope: body.shareScope ?? "project"
      }
    });

    const edgePayload = [];

    if (body.sourceTraceEventId) {
      edgePayload.push({
        fromNodeType: "trace",
        fromNodeId: body.sourceTraceEventId,
        toNodeType: "artifact",
        toNodeId: created.id,
        edgeType: "GENERATED_FROM" as const
      });
    }

    if (Array.isArray(body.linkedMemoryIds) && body.linkedMemoryIds.length > 0) {
      edgePayload.push(
        ...body.linkedMemoryIds.map((memoryId: string) => ({
          fromNodeType: "memory",
          fromNodeId: memoryId,
          toNodeType: "artifact",
          toNodeId: created.id,
          edgeType: "GENERATED_FROM" as const
        }))
      );
    }

    if (edgePayload.length > 0) {
      await tx.nodeEdge.createMany({ data: edgePayload });
    }

    await tx.auditEvent.create({
      data: {
        workspaceId: episode.project.workspaceId,
        projectId: episode.projectId,
        episodeId: body.episodeId,
        artifactId: created.id,
        occurredAt: new Date(),
        actorType: "agent",
        actorId: body.createdByAgentId,
        action: "create_artifact",
        targetType: "artifact",
        targetId: created.id,
        result: "success",
        policyVersion: episode.policyVersion,
        permissionDecision: "allow"
      }
    });

    return created;
  });

  return NextResponse.json(
    {
      ...artifact,
      storageMode: blobResult.storageMode,
      storageWarning: blobResult.warning ?? null
    },
    { status: 201 }
  );
}
