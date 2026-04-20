/**
 * SSE Event Stream API
 * 
 * 提供实时事件流，用于 Event Stream 组件
 */

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const episodeId = searchParams.get("episodeId");
  const projectId = searchParams.get("projectId");

  if (!episodeId && !projectId) {
    return new Response(
      JSON.stringify({ error: "episodeId or projectId is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // 发送初始连接确认
      controller.enqueue(
        encoder.encode(`event: connected\ndata: ${JSON.stringify({ status: "connected", timestamp: new Date().toISOString() })}\n\n`)
      );

      // 发送最近的事件
      try {
        const recentEvents = await prisma.auditEvent.findMany({
          where: episodeId ? { episodeId } : projectId ? { projectId } : {},
          orderBy: { occurredAt: "desc" },
          take: 20,
          include: {
            episode: {
              select: {
                titleI18n: true
              }
            }
          }
        });

        for (const event of recentEvents.reverse()) {
          const data = {
            id: event.id,
            type: "audit",
            episodeId: event.episodeId,
            occurredAt: event.occurredAt.toISOString(),
            data: {
              action: event.action,
              actorType: event.actorType,
              actorId: event.actorId,
              targetType: event.targetType,
              targetId: event.targetId,
              result: event.result,
              episodeTitle: event.episode?.titleI18n
            }
          };

          controller.enqueue(
            encoder.encode(`event: audit\ndata: ${JSON.stringify(data)}\n\n`)
          );
        }
      } catch (error) {
        console.error("[SSE] Error fetching recent events:", error);
      }

      // 设置心跳以保持连接
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`event: heartbeat\ndata: ${JSON.stringify({ timestamp: new Date().toISOString() })}\n\n`));
        } catch {
          // 连接已关闭
          clearInterval(heartbeat);
        }
      }, 30000);

      // 清理
      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    }
  });
}
