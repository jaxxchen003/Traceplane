import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const episode = await prisma.episode.create({
    data: {
      projectId: body.projectId,
      primaryAgentId: body.primaryAgentId,
      titleI18n: body.titleI18n,
      summaryI18n: body.summaryI18n ?? null,
      goalI18n: body.goalI18n ?? null,
      finalOutcomeI18n: body.finalOutcomeI18n ?? null,
      status: body.status ?? "RUNNING",
      policyVersion: body.policyVersion ?? "policy.unspecified",
      startedAt: new Date()
    }
  });

  return NextResponse.json(episode, { status: 201 });
}
