import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.episodeId || !body.status) {
    return NextResponse.json({ error: "episodeId and status are required" }, { status: 400 });
  }

  const episode = await prisma.episode.findUnique({
    where: { id: body.episodeId },
    include: { project: true }
  });

  if (!episode) {
    return NextResponse.json({ error: "Episode not found" }, { status: 404 });
  }

  const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const record = await tx.episode.update({
      where: { id: body.episodeId },
      data: {
        status: body.status,
        blockedReasonI18n: body.blockedReasonI18n ?? episode.blockedReasonI18n,
        failureReasonI18n: body.failureReasonI18n ?? episode.failureReasonI18n,
        reviewOutcome: body.reviewOutcome ?? episode.reviewOutcome,
        endedAt: body.status === "COMPLETED" || body.status === "FAILED" ? new Date() : episode.endedAt
      }
    });

    await tx.auditEvent.create({
      data: {
        workspaceId: episode.project.workspaceId,
        projectId: episode.projectId,
        episodeId: episode.id,
        occurredAt: new Date(),
        actorType: body.actorType ?? "agent",
        actorId: body.actorId ?? episode.primaryAgentId,
        action: "update_episode_status",
        targetType: "episode",
        targetId: episode.id,
        result: "success",
        policyVersion: episode.policyVersion,
        permissionDecision: "allow"
      }
    });

    return record;
  });

  return NextResponse.json(updated);
}
