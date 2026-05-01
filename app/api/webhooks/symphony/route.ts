import { NextResponse } from "next/server";

import {
  handleSymphonyWebhook,
  SymphonyIntegrationError,
  verifySymphonySignature
} from "@/lib/services/symphony-integration";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const secret = process.env.SYMPHONY_WEBHOOK_SECRET;

  if (!secret) {
    return NextResponse.json({ error: "SYMPHONY_WEBHOOK_SECRET is not configured" }, { status: 500 });
  }

  if (!verifySymphonySignature(rawBody, request.headers.get("x-symphony-signature"), secret)) {
    return NextResponse.json({ error: "Invalid Symphony signature" }, { status: 401 });
  }

  try {
    const event = JSON.parse(rawBody);
    const result = await handleSymphonyWebhook(prisma, event);
    const wasCreated = "created" in result && result.created === true;
    return NextResponse.json(result, { status: event.event_type === "task.started" && wasCreated ? 201 : 200 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    if (error instanceof SymphonyIntegrationError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    console.error("[SYMPHONY_WEBHOOK_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
