import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.episodeId || !body.titleI18n?.zh || !body.contentI18n?.zh) {
    return NextResponse.json({ error: "episodeId, titleI18n.zh, and contentI18n.zh are required" }, { status: 400 });
  }

  const episode = await prisma.episode.findUnique({
    where: { id: body.episodeId },
    include: { project: true }
  });

  if (!episode) {
    return NextResponse.json({ error: "Episode not found" }, { status: 404 });
  }

  const memory = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const created = await tx.memoryItem.create({
      data: {
        episodeId: body.episodeId,
        agentId: body.agentId ?? null,
        titleI18n: body.titleI18n,
        contentI18n: body.contentI18n,
        type: body.type ?? "SEMANTIC",
        source: body.source ?? "manual",
        importance: body.importance ?? 5,
        sensitivity: body.sensitivity ?? "Internal",
        ttlDays: body.ttlDays ?? null
      }
    });

    await tx.auditEvent.create({
      data: {
        workspaceId: episode.project.workspaceId,
        projectId: episode.projectId,
        episodeId: body.episodeId,
        memoryItemId: created.id,
        occurredAt: new Date(),
        actorType: body.agentId ? "agent" : "user",
        actorId: body.agentId ?? "manager-ui",
        action: "write_memory",
        targetType: "memory",
        targetId: created.id,
        result: "success",
        policyVersion: episode.policyVersion,
        permissionDecision: "allow"
      }
    });

    return created;
  });

  return NextResponse.json(memory, { status: 201 });
}

export async function GET(request: NextRequest) {
  const episodeId = request.nextUrl.searchParams.get("episodeId");
  const projectId = request.nextUrl.searchParams.get("projectId");

  const memory = await prisma.memoryItem.findMany({
    where: {
      episodeId: episodeId || undefined,
      episode: projectId ? { projectId } : undefined
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(memory);
}
