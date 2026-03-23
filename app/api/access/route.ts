import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const grant = await prisma.accessGrant.create({
    data: {
      projectId: body.projectId ?? null,
      episodeId: body.episodeId ?? null,
      subjectType: body.subjectType,
      subjectId: body.subjectId,
      scopeType: body.scopeType,
      effect: body.effect ?? "allow"
    }
  });

  return NextResponse.json(grant, { status: 201 });
}
