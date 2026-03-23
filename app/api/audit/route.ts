import { NextRequest, NextResponse } from "next/server";

import { getAuditEvents } from "@/lib/demo-data";

export async function GET(request: NextRequest) {
  const projectId = request.nextUrl.searchParams.get("projectId") ?? undefined;
  const episodeId = request.nextUrl.searchParams.get("episodeId") ?? undefined;
  const locale = (request.nextUrl.searchParams.get("locale") ?? "zh") as "zh" | "en";

  const events = await getAuditEvents({ locale, projectId, episodeId });
  return NextResponse.json(events);
}
