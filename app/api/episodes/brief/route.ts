import { NextRequest, NextResponse } from "next/server";

import { buildEpisodeGraph, getEpisodeReview } from "@/lib/demo-data";

export async function GET(request: NextRequest) {
  const episodeId = request.nextUrl.searchParams.get("episodeId");
  const locale = (request.nextUrl.searchParams.get("locale") ?? "zh") as "zh" | "en";

  if (!episodeId) {
    return NextResponse.json({ error: "episodeId is required" }, { status: 400 });
  }

  const episode = await getEpisodeReview(episodeId, locale);

  if (!episode) {
    return NextResponse.json({ error: "Episode not found" }, { status: 404 });
  }

  const graph = await buildEpisodeGraph(episodeId, locale);

  return NextResponse.json({
    episodeId: episode.id,
    title: episode.title,
    goal: episode.goal,
    status: episode.status,
    workType: episode.workType,
    primaryActor: episode.primaryActor,
    successCriteria: episode.successCriteria,
    projectId: episode.projectId,
    projectName: episode.projectName,
    keyRelations: graph?.edges.filter(
      (edge) => edge.fromNodeType === "episode" || edge.toNodeType === "episode"
    ) ?? [],
    handoffBrief: episode.handoffSummary,
    continuationPacket: episode.continuationPacket,
    keyMemories: episode.memories.slice(0, 3),
    latestArtifacts: episode.artifacts.slice(0, 3),
    attentionItems: [
      ...(episode.riskSummary.denied > 0 ? [`${episode.riskSummary.denied} denied actions`] : []),
      ...(episode.riskSummary.policyHits > 0 ? [`${episode.riskSummary.policyHits} policy hits`] : [])
    ]
  });
}
