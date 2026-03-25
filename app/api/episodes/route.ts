import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.projectId || !body.primaryAgentId) {
    return NextResponse.json({ error: "projectId and primaryAgentId are required" }, { status: 400 });
  }

  const titleI18n = body.titleI18n ?? body.goalI18n ?? null;
  const goalI18n = body.goalI18n ?? body.titleI18n ?? null;
  const successCriteriaI18n = body.successCriteriaI18n ?? goalI18n ?? null;

  if (!titleI18n?.zh || !goalI18n?.zh || !successCriteriaI18n?.zh) {
    return NextResponse.json(
      { error: "titleI18n.zh or goalI18n.zh, plus successCriteriaI18n.zh, are required" },
      { status: 400 }
    );
  }

  const project = await prisma.project.findUnique({
    where: { id: body.projectId },
    include: { workspace: true }
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const episode = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const created = await tx.episode.create({
      data: {
        projectId: body.projectId,
        primaryAgentId: body.primaryAgentId,
        titleI18n,
        summaryI18n: body.summaryI18n ?? null,
        goalI18n,
        successCriteriaI18n,
        finalOutcomeI18n: body.finalOutcomeI18n ?? null,
        primaryActor: body.primaryActor ?? null,
        workType: body.workType ?? "GENERATE",
        relationIntent: body.relationIntent ?? null,
        status: body.status ?? "PLANNED",
        policyVersion: body.policyVersion ?? project.activePolicyVersion,
        startedAt: new Date()
      }
    });

    await tx.episodeAgent.create({
      data: {
        episodeId: created.id,
        agentId: body.primaryAgentId
      }
    });

    await tx.auditEvent.create({
      data: {
        workspaceId: project.workspaceId,
        projectId: project.id,
        episodeId: created.id,
        occurredAt: new Date(),
        actorType: "agent",
        actorId: body.primaryAgentId,
        action: "create_episode",
        targetType: "episode",
        targetId: created.id,
        result: "success",
        policyVersion: body.policyVersion ?? project.activePolicyVersion,
        permissionDecision: "allow"
      }
    });

    if (body.targetEpisodeId && body.relationIntent) {
      await tx.nodeEdge.create({
        data: {
          fromNodeType: "episode",
          fromNodeId: created.id,
          toNodeType: "episode",
          toNodeId: body.targetEpisodeId,
          edgeType: body.relationIntent
        }
      });
    }

    return created;
  });

  return NextResponse.json(episode, { status: 201 });
}
