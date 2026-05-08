import { NextResponse } from "next/server";

import { buildOrchestratorContext, SymphonyIntegrationError } from "@/lib/services/symphony-integration";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") === "en" ? "en" : "zh";

  try {
    const context = await buildOrchestratorContext(prisma, id, locale);
    return NextResponse.json(context);
  } catch (error) {
    if (error instanceof SymphonyIntegrationError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    console.error("[ORCHESTRATOR_CONTEXT_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
