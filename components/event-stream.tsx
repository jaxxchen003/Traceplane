"use client";

import { useEffect, useRef, useState } from "react";

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
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = episodeId
      ? `episodeId=${episodeId}`
      : projectId
        ? `projectId=${projectId}`
        : "";
    const url = `/api/events/stream?${params}`;

    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onopen = () => {
      setConnected(true);
      setError(null);
    };

    es.addEventListener("connected", () => {
      setConnected(true);
    });

    es.addEventListener("audit", (e) => {
      try {
        const data = JSON.parse(e.data) as StreamEvent;
        const status: EventStatus =
          data.data.result === "success"
            ? "success"
            : data.data.result === "warning"
              ? "warning"
              : "info";
        const newEvent: DisplayEvent = {
          id: data.id,
          time: new Date(data.occurredAt).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          type: "AUDIT",
          label: data.data.action || "unknown",
          status,
          val: data.data.result,
        };

        setEvents((prev) => {
          const next = [newEvent, ...prev];
          return next.slice(0, maxEvents);
        });
      } catch (err) {
        console.error("Failed to parse audit event:", err);
      }
    });

    es.addEventListener("heartbeat", () => {
      // Heartbeat event to keep connection alive
    });

    es.onerror = () => {
      setConnected(false);
      setError("Connection lost. Reconnecting...");
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, [episodeId, projectId, maxEvents]);

  // Load historical events on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const params = episodeId
          ? `episodeId=${episodeId}`
          : projectId
            ? `projectId=${projectId}`
            : "";
        const res = await fetch(`/api/audit?${params}`);
        if (!res.ok) return;
        const data = await res.json();

        if (data.events?.length) {
          const historyEvents: DisplayEvent[] = data.events
            .slice(0, 20)
            .map(
              (ev: {
                id: string;
                occurredAt: string;
                action: string;
                result: string;
              }) => {
                const status: EventStatus =
                  ev.result === "success"
                    ? "success"
                    : ev.result === "warning"
                      ? "warning"
                      : "info";
                return {
                  id: ev.id,
                  time: new Date(ev.occurredAt).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  }),
                  type: "AUDIT",
                  label: ev.action,
                  status,
                  val: ev.result,
                };
              },
            );

          setEvents(historyEvents);
        }
      } catch (err) {
        console.error("Failed to load history:", err);
      }
    };

    loadHistory();
  }, [episodeId, projectId]);

  // Auto-scroll to show latest events
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [events.length]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-signal-success";
      case "warning":
        return "text-signal-warning";
      case "error":
        return "text-signal-error";
      case "ghost":
        return "text-ink-faint";
      default:
        return "text-signal-info";
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              connected ? "bg-signal-success animate-pulse" : "bg-signal-error"
            }`}
          />
          <span
            className={`text-xs ${connected ? "text-signal-success" : "text-signal-error"}`}
          >
            {connected ? "Live" : error || "Connecting..."}
          </span>
        </div>
        <span className="text-xs text-ink-faint">{events.length} events</span>
      </div>

      <div
        ref={containerRef}
        className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar"
      >
        {events.length === 0 ? (
          <div className="text-center text-ink-faint text-sm py-4">
            No events yet
          </div>
        ) : (
          events.map((ev) => (
            <div
              key={ev.id}
              className={`flex items-start gap-3 text-sm ${
                ev.status === "ghost" ? "opacity-60" : ""
              }`}
            >
              <span className="text-ink-faint font-mono text-xs mt-0.5">
                {ev.time}
              </span>
              <div className="flex-1 min-w-0">
                <span
                  className={`${getStatusColor(ev.status)} font-semibold text-xs`}
                >
                  {ev.type}
                </span>
                <span className="text-ink-muted ml-2 truncate">{ev.label}</span>
                {ev.dur && (
                  <span className="text-signal-success ml-2 font-mono text-xs">
                    {ev.dur}
                  </span>
                )}
                {ev.val && (
                  <span className="text-signal-success ml-2 text-xs">
                    {ev.val}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
