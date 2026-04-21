"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface StreamEvent {
  id: string;
  type: "audit" | "trace" | "artifact" | "memory" | "status";
  episodeId: string | null;
  occurredAt: string;
  data: {
    action?: string;
    actorType?: string;
    actorId?: string;
    targetType?: string;
    targetId?: string;
    result?: string;
    episodeTitle?: Record<string, string>;
    [key: string]: unknown;
  };
}

interface EventStreamProps {
  projectId?: string;
  episodeId?: string;
  maxEvents?: number;
}

export function EventStream({
  projectId,
  episodeId,
  maxEvents = 50,
}: EventStreamProps) {
  type EventStatus = "info" | "success" | "warning" | "error" | "ghost";

  interface DisplayEvent {
    id: string;
    time: string;
    type: string;
    label: string;
    status: EventStatus;
    dur?: string;
    val?: string;
  }

  const [events, setEvents] = useState<DisplayEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const params = episodeId
      ? `episodeId=${episodeId}`
      : projectId
        ? `projectId=${projectId}`
        : "";
    const url = `/api/events/stream?${params}`;

    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onopen = () => setConnected(true);
    es.addEventListener("audit", (e) => {
      try {
        const data = JSON.parse(e.data) as StreamEvent;
        const status: EventStatus = data.data.result === "success" ? "success" : data.data.result === "warning" ? "warning" : "info";
        const newEvent: DisplayEvent = {
          id: data.id,
          time: new Date(data.occurredAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
          type: "AUDIT",
          label: data.data.action || "unknown",
          status,
          val: data.data.result,
        };
        setEvents((prev) => [newEvent, ...prev].slice(0, maxEvents));
      } catch (err) {
        console.error("Failed to parse audit event:", err);
      }
    });

    es.onerror = () => setConnected(false);
    return () => es.close();
  }, [episodeId, projectId, maxEvents]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success": return "bg-emerald-500";
      case "warning": return "bg-amber-500";
      case "error": return "bg-rose-500";
      default: return "bg-indigo-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${connected ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
        <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">{connected ? "实时同步" : "连接中断"}</span>
      </div>

      <div className="relative pl-4 space-y-6">
        <div className="absolute left-[7px] top-2 bottom-0 w-[1px] bg-white/10" />
        <AnimatePresence initial={false}>
          {events.map((ev) => (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative flex gap-4"
            >
              <div className={`absolute -left-[18px] top-1.5 w-3 h-3 rounded-full border-2 border-[#030303] ${getStatusColor(ev.status)}`} />
              <div className="bg-void-900 rounded-lg p-3 flex-1 border border-void-700">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-mono text-zinc-500">{ev.time}</span>
                  <span className="text-[9px] font-medium text-indigo-400">{ev.type}</span>
                </div>
                <div className="text-xs text-white">{ev.label}</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
