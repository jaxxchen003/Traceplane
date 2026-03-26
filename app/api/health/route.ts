import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getRuntimeConfig } from "@/lib/runtime-config";

export async function GET() {
  try {
    const runtime = getRuntimeConfig();
    const [workspaceCount, projectCount, episodeCount] = await Promise.all([
      prisma.workspace.count(),
      prisma.project.count(),
      prisma.episode.count()
    ]);

    return NextResponse.json({
      service: runtime.service,
      status: "ok",
      timestamp: new Date().toISOString(),
      database: {
        status: "ok",
        provider: runtime.database.provider,
        source: runtime.database.source
      },
      storage: {
        provider: runtime.objectStorage.provider,
        configured: runtime.objectStorage.configured,
        bucket: runtime.objectStorage.bucket
      },
      runtime,
      counts: {
        workspaces: workspaceCount,
        projects: projectCount,
        episodes: episodeCount
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        service: "traceplane",
        status: "degraded",
        timestamp: new Date().toISOString(),
        database: {
          status: "error"
        },
        error: error instanceof Error ? error.message : "Unknown database error"
      },
      { status: 503 }
    );
  }
}
