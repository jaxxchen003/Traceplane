import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.projectId || !body.goal) {
    return NextResponse.json({ error: "projectId and goal are required" }, { status: 400 });
  }

  const limit = typeof body.limit === "number" ? body.limit : 5;
  const includeMemory = body.includeMemory ?? true;
  const includeArtifacts = body.includeArtifacts ?? true;
  const includeRelatedEpisodes = body.includeRelatedEpisodes ?? true;

  const project = await prisma.project.findUnique({
    where: { id: body.projectId },
    include: {
      episodes: {
        include: {
          memoryItems: includeMemory ? { orderBy: { createdAt: "desc" }, take: limit } : false,
          artifacts: includeArtifacts ? { orderBy: { updatedAt: "desc" }, take: limit } : false
        },
        orderBy: { updatedAt: "desc" },
        take: limit
      }
    }
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const response = {
    projectContext: {
      projectId: project.id,
      nameI18n: project.nameI18n,
      descriptionI18n: project.descriptionI18n,
      activePolicyVersion: project.activePolicyVersion
    },
    relevantMemories: includeMemory
      ? project.episodes.flatMap((episode) =>
          episode.memoryItems.map((memory) => ({
            id: memory.id,
            episodeId: episode.id,
            titleI18n: memory.titleI18n,
            contentI18n: memory.contentI18n,
            type: memory.type,
            importance: memory.importance
          }))
        )
      : [],
    relevantArtifacts: includeArtifacts
      ? project.episodes.flatMap((episode) =>
          episode.artifacts.map((artifact) => ({
            id: artifact.id,
            episodeId: episode.id,
            titleI18n: artifact.titleI18n,
            fileType: artifact.fileType,
            version: artifact.version,
            uri: artifact.uri
          }))
        )
      : [],
    relatedEpisodes: includeRelatedEpisodes
      ? project.episodes.map((episode) => ({
          id: episode.id,
          titleI18n: episode.titleI18n,
          goalI18n: episode.goalI18n,
          status: episode.status,
          workType: episode.workType,
          primaryActor: episode.primaryActor
        }))
      : [],
    notes: {
      queryGoal: body.goal,
      workType: body.workType ?? null,
      sourceEpisodeIds: Array.isArray(body.sourceEpisodeIds) ? body.sourceEpisodeIds : []
    }
  };

  return NextResponse.json(response);
}
