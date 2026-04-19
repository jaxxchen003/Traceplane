"use client";

import React, { useState } from "react";
import { TimelineEntry } from "@/components/continuity-primitives";
import { StateInspector } from "./state-inspector";
import { Panel } from "./panel";

interface TraceItem {
  id: string;
  stepIndex: number;
  status: string;
  stepTitle: string;
  shortResult: string;
  actor: string;
  eventTime: Date;
  toolName: string | null;
  inputSummary: string | null;
  decisionSummary: string | null;
  resultSummary: string | null;
  errorSummary: string | null;
  policyHitReason: string | null;
  permissionDeniedReason: string | null;
  snapshot?: any;
}

export function TimelineDebugWrapper({
  timeline,
  episodeId,
  locale,
  dict,
}: {
  timeline: TraceItem[];
  episodeId: string;
  locale: string;
  dict: any;
}) {
  const [selectedTraceId, setSelectedTraceId] = useState<string | null>(null);

  const selectedTrace = timeline.find((t) => t.id === selectedTraceId);

  const currentIndex = timeline.findIndex((t) => t.id === selectedTraceId);
  const actualPrevTrace = currentIndex > 0 ? timeline[currentIndex - 1] : null;

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
      <div className="space-y-4">
        {timeline.map((item) => {
          const details = [];
          if (item.inputSummary)
            details.push({ label: "Input", value: item.inputSummary });
          if (item.decisionSummary)
            details.push({ label: "Decision", value: item.decisionSummary });
          if (item.resultSummary)
            details.push({ label: "Result", value: item.resultSummary });
          if (item.errorSummary)
            details.push({ label: "Error", value: item.errorSummary, tone: "danger" as const });
          if (item.policyHitReason)
            details.push({ label: "Policy", value: item.policyHitReason, tone: "warn" as const });
          if (item.permissionDeniedReason)
            details.push({
              label: "Denied",
              value: item.permissionDeniedReason,
              tone: "danger" as const,
            });

          return (
            <div
              key={item.id}
              className={`cursor-pointer transition-all ${
                selectedTraceId === item.id
                  ? "ring-2 ring-accent bg-accent-dim"
                  : "hover:bg-void-800/50"
              }`}
              onClick={() => setSelectedTraceId(item.id)}
            >
              <TimelineEntry
                index={item.stepIndex}
                statusLabel={dict.statuses[item.status]}
                statusRaw={item.status}
                title={item.stepTitle}
                summary={item.shortResult}
                meta={
                  <>
                    <div>{item.actor}</div>
                    <div>{new Date(item.eventTime).toLocaleString()}</div>
                    {item.toolName ? <div>{item.toolName}</div> : null}
                  </>
                }
                details={details}
              />
            </div>
          );
        })}
      </div>

      <div className="space-y-6">
        <Panel title="Surgical Inspector" eyebrow="State & Diff">
          {selectedTrace ? (
            <StateInspector
              traceId={selectedTrace.id}
              snapshot={selectedTrace.snapshot}
              prevSnapshot={actualPrevTrace?.snapshot}
              episodeId={episodeId}
              locale={locale}
            />
          ) : (
            <div className="h-64 flex items-center justify-center text-ink-faint text-sm italic">
              Select a trace node to inspect its state and diff.
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
