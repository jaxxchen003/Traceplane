import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.fromEpisodeId || !body.toEpisodeId || !body.relationType) {
    return NextResponse.json(
      { error: "fromEpisodeId, toEpisodeId, and relationType are required" },
      { status: 400 }
    );
  }

  const fromEpisode = await prisma.episode.findUnique({
    where: { id: body.fromEpisodeId },
    include: { project: true }
  });

  if (!fromEpisode) {
    return NextResponse.json({ error: "Source episode not found" }, { status: 404 });
  }

  const edge = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const created = await tx.nodeEdge.create({
      data: {
        fromNodeType: "episode",
        fromNodeId: body.fromEpisodeId,
        toNodeType: "episode",
        toNodeId: body.toEpisodeId,
        edgeType: body.relationType
      }
    });

    await tx.auditEvent.create({
      data: {
        workspaceId: fromEpisode.project.workspaceId,
        projectId: fromEpisode.projectId,
        episodeId: fromEpisode.id,
        occurredAt: new Date(),
        actorType: body.actorType ?? "agent",
        actorId: body.actorId ?? fromEpisode.primaryAgentId,
        action: "link_episode",
        targetType: "episode_edge",
        targetId: created.id,
        result: "success",
        policyVersion: fromEpisode.policyVersion,
        permissionDecision: "allow"
      }
    });

    return created;
  });

  return NextResponse.json(edge, { status: 201 });
}
