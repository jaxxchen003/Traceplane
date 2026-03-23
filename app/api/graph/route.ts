import { NextRequest, NextResponse } from "next/server";

import { buildEpisodeGraph } from "@/lib/demo-data";

export async function GET(request: NextRequest) {
  const episodeId = request.nextUrl.searchParams.get("episodeId");
  const locale = (request.nextUrl.searchParams.get("locale") ?? "zh") as "zh" | "en";

  if (!episodeId) {
    return NextResponse.json({ error: "episodeId is required" }, { status: 400 });
  }

  const graph = await buildEpisodeGraph(episodeId, locale);

  if (!graph) {
    return NextResponse.json({ error: "Episode not found" }, { status: 404 });
  }

  return NextResponse.json(graph);
}
