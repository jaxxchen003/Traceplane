import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.projectId || !body.primaryAgentId || !body.titleI18n?.zh) {
    return NextResponse.json({ error: "projectId, primaryAgentId, and titleI18n.zh are required" }, { status: 400 });
  }

  const project = await prisma.project.findUnique({
    where: { id: body.projectId },
    include: { workspace: true }
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const episode = await prisma.$transaction(async (tx) => {
    const created = await tx.episode.create({
      data: {
        projectId: body.projectId,
        primaryAgentId: body.primaryAgentId,
        titleI18n: body.titleI18n,
        summaryI18n: body.summaryI18n ?? null,
        goalI18n: body.goalI18n ?? null,
        finalOutcomeI18n: body.finalOutcomeI18n ?? null,
        status: body.status ?? "RUNNING",
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

    return created;
  });

  return NextResponse.json(episode, { status: 201 });
}
