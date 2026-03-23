import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const artifact = await prisma.artifact.create({
    data: {
      episodeId: body.episodeId,
      createdByAgentId: body.createdByAgentId,
      sourceTraceEventId: body.sourceTraceEventId ?? null,
      artifactKey: body.artifactKey,
      titleI18n: body.titleI18n,
      contentI18n: body.contentI18n ?? null,
      fileType: body.fileType ?? "MARKDOWN",
      version: body.version ?? 1,
      uri: body.uri ?? null,
      sensitivity: body.sensitivity ?? "Internal",
      shareScope: body.shareScope ?? "project"
    }
  });

  return NextResponse.json(artifact, { status: 201 });
}
