import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const trace = await prisma.traceEvent.create({
    data: {
      episodeId: body.episodeId,
      actorAgentId: body.actorAgentId ?? null,
      stepIndex: body.stepIndex,
      eventType: body.eventType,
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

  return NextResponse.json(trace, { status: 201 });
}
