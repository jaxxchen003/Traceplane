import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  
  // Validation
  if (!body.parentEpisodeId || !body.traceId) {
    return NextResponse.json({ error: "parentEpisodeId and traceId are required" }, { status: 400 });
  }

  try {
    const parentEpisode = await prisma.episode.findUnique({
      where: { id: body.parentEpisodeId },
      include: { project: true }
    });

    if (!parentEpisode) {
      return NextResponse.json({ error: "Parent Episode not found" }, { status: 404 });
    }

    const forkPointTrace = await prisma.traceEvent.findUnique({
      where: { id: body.traceId },
    });

    if (!forkPointTrace) {
      return NextResponse.json({ error: "Fork point Trace not found" }, { status: 404 });
    }

    const newEpisode = await prisma.$transaction(async (tx) => {
      // 1. Create the child episode
      const created = await tx.episode.create({
        data: {
          projectId: parentEpisode.projectId,
          primaryAgentId: parentEpisode.primaryAgentId,
          parentEpisodeId: parentEpisode.id,
          forkPointTraceId: body.traceId,
          titleI18n: body.titleI18n ?? { 
            zh: `分叉自: ${parentEpisode.titleI18n.zh}`, 
            en: `Forked from: ${parentEpisode.titleI18n.en}` 
          },
          goalI18n: body.goalI18n ?? parentEpisode.goalI18n,
          successCriteriaI18n: body.successCriteriaI18n ?? parentEpisode.successCriteriaI18n,
          status: "PLANNED",
          policyVersion: parentEpisode.policyVersion,
          startedAt: new Date(),
          workType: body.workType ?? parentEpisode.workType,
        }
      });

      // 2. Copy primary agent relation
      await tx.episodeAgent.create({
        data: {
          episodeId: created.id,
          agentId: parentEpisode.primaryAgentId
        }
      });

      // 3. Audit log
      await tx.auditEvent.create({
        data: {
          workspaceId: parentEpisode.project.workspaceId,
          projectId: parentEpisode.projectId,
          episodeId: created.id,
          occurredAt: new Date(),
          actorType: body.actorId ? "agent" : "user",
          actorId: body.actorId ?? "manager-ui",
          action: "fork_episode",
          targetType: "episode",
          targetId: created.id,
          result: "success",
          policyVersion: parentEpisode.policyVersion,
          permissionDecision: "allow"
        }
      });

      return created;
    });

    return NextResponse.json(newEpisode, { status: 201 });
  } catch (error: any) {
    console.error("[FORK_ERROR]", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
