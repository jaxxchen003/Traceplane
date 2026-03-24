import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.episodeId || !body.stepTitleI18n?.zh || !body.shortResultI18n?.zh) {
    return NextResponse.json({ error: "episodeId, stepTitleI18n.zh, and shortResultI18n.zh are required" }, { status: 400 });
  }

  const episode = await prisma.episode.findUnique({
    where: { id: body.episodeId },
    include: { project: true, traceEvents: true }
  });

  if (!episode) {
    return NextResponse.json({ error: "Episode not found" }, { status: 404 });
  }

  const stepIndex =
    typeof body.stepIndex === "number"
      ? body.stepIndex
      : episode.traceEvents.length > 0
        ? Math.max(...episode.traceEvents.map((item) => item.stepIndex)) + 1
        : 1;

  const trace = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const created = await tx.traceEvent.create({
      data: {
        episodeId: body.episodeId,
        actorAgentId: body.actorAgentId ?? null,
        stepIndex,
        eventType: body.eventType ?? "SYNTHESIS",
        toolName: body.toolName ?? null,
        stepTitleI18n: body.stepTitleI18n,
        status: body.status ?? "SUCCESS",
        shortResultI18n: body.shortResultI18n,
        inputSummaryI18n: body.inputSummaryI18n ?? null,
        decisionSummaryI18n: body.decisionSummaryI18n ?? null,
        toolPayloadSummaryI18n: body.toolPayloadSummaryI18n ?? null,
        resultSummaryI18n: body.resultSummaryI18n ?? null,
        errorSummaryI18n: body.errorSummaryI18n ?? null,
        policyHitReasonI18n: body.policyHitReasonI18n ?? null,
        permissionDeniedI18n: body.permissionDeniedI18n ?? null,
        eventTime: new Date()
      }
    });

    if (Array.isArray(body.linkedMemoryIds) && body.linkedMemoryIds.length > 0) {
      await tx.nodeEdge.createMany({
        data: body.linkedMemoryIds.map((memoryId: string) => ({
          fromNodeType: "memory",
          fromNodeId: memoryId,
          toNodeType: "trace",
          toNodeId: created.id,
          edgeType: "USED_IN"
        }))
      });
    }

    await tx.auditEvent.create({
      data: {
        workspaceId: episode.project.workspaceId,
        projectId: episode.projectId,
        episodeId: body.episodeId,
        traceEventId: created.id,
        occurredAt: new Date(),
        actorType: body.actorAgentId ? "agent" : "user",
        actorId: body.actorAgentId ?? "manager-ui",
        action: "append_trace",
        targetType: "trace",
        targetId: created.id,
        result: created.status === "FAILED" ? "warning" : "success",
        policyVersion: episode.policyVersion,
        policyHitReasonI18n: body.policyHitReasonI18n ?? null,
        permissionDecision: body.permissionDeniedI18n ? "deny" : "allow",
        denyReasonI18n: body.permissionDeniedI18n ?? null
      }
    });

    return created;
  });

  return NextResponse.json(trace, { status: 201 });
}
