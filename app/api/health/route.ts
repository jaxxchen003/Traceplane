import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [workspaceCount, projectCount, episodeCount] = await Promise.all([
      prisma.workspace.count(),
      prisma.project.count(),
      prisma.episode.count()
    ]);

    return NextResponse.json({
      service: "enterprise-agent-work-graph",
      status: "ok",
      timestamp: new Date().toISOString(),
      database: {
        status: "ok",
        provider: "sqlite"
      },
      counts: {
        workspaces: workspaceCount,
        projects: projectCount,
        episodes: episodeCount
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        service: "enterprise-agent-work-graph",
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
