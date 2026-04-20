/**
 * Episode Status API
 * 
 * 用于更新 Episode 状态
 */

import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  if (!body.status) {
    return NextResponse.json(
      { error: "status is required" },
      { status: 400 }
    );
  }

  const validStatuses = [
    "PLANNED",
    "IN_PROGRESS",
    "BLOCKED",
    "IN_REVIEW",
    "COMPLETED",
    "FAILED"
  ];

  if (!validStatuses.includes(body.status)) {
    return NextResponse.json(
      { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
      { status: 400 }
    );
  }

  const episode = await prisma.episode.findUnique({
    where: { id },
    include: { project: true }
  });

  if (!episode) {
    return NextResponse.json(
      { error: "Episode not found" },
      { status: 404 }
    );
  }

  const updateData: Prisma.EpisodeUpdateInput = {
    status: body.status,
    updatedAt: new Date()
  };

  // 根据状态设置额外字段
  if (body.status === "COMPLETED") {
    updateData.endedAt = new Date();
    updateData.reviewOutcome = body.reviewOutcome || "APPROVED";
    if (body.finalOutcomeI18n) {
      updateData.finalOutcomeI18n = body.finalOutcomeI18n;
    }
  } else if (body.status === "FAILED") {
    updateData.endedAt = new Date();
    if (body.failureReasonI18n) {
      updateData.failureReasonI18n = body.failureReasonI18n;
    }
  } else if (body.status === "BLOCKED") {
    if (body.blockedReasonI18n) {
      updateData.blockedReasonI18n = body.blockedReasonI18n;
    }
  }

  const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const updatedEpisode = await tx.episode.update({
      where: { id },
      data: updateData
    });

    // 创建审计事件
    await tx.auditEvent.create({
      data: {
        workspaceId: episode.project.workspaceId,
        projectId: episode.projectId,
        episodeId: id,
        occurredAt: new Date(),
        actorType: body.actorId ? "agent" : "user",
        actorId: body.actorId ?? "manager-ui",
        action: "update_episode_status",
        targetType: "episode",
        targetId: id,
        result: "success",
        policyVersion: episode.policyVersion
      }
    });

    return updatedEpisode;
  });

  return NextResponse.json(updated);
}
