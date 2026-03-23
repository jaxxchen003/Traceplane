import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const memory = await prisma.memoryItem.create({
    data: {
      episodeId: body.episodeId,
      agentId: body.agentId ?? null,
      titleI18n: body.titleI18n,
      contentI18n: body.contentI18n,
      type: body.type ?? "SEMANTIC",
      source: body.source ?? "manual",
      importance: body.importance ?? 5,
      sensitivity: body.sensitivity ?? "Internal",
      ttlDays: body.ttlDays ?? null
    }
  });

  return NextResponse.json(memory, { status: 201 });
}

export async function GET(request: NextRequest) {
  const episodeId = request.nextUrl.searchParams.get("episodeId");
  const projectId = request.nextUrl.searchParams.get("projectId");

  const memory = await prisma.memoryItem.findMany({
    where: {
      episodeId: episodeId || undefined,
      episode: projectId ? { projectId } : undefined
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(memory);
}
