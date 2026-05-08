import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { createTaskGraph, TaskGraphServiceError } from "@/lib/services/task-graph";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const graph = await createTaskGraph(prisma, body);
    return NextResponse.json(graph, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    if (error instanceof TaskGraphServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    console.error("[TASK_GRAPH_CREATE_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
