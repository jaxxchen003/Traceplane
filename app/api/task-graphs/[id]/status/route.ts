import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getTaskGraphStatus, TaskGraphServiceError } from "@/lib/services/task-graph";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const status = await getTaskGraphStatus(prisma, id);
    return NextResponse.json(status);
  } catch (error) {
    if (error instanceof TaskGraphServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    console.error("[TASK_GRAPH_STATUS_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
