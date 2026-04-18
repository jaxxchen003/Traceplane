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
  snapshot: any;
}

export function TimelineDebugWrapper({ 
  timeline, 
  episodeId, 
  locale, 
  dict 
}: { 
  timeline: TraceItem[]; 
  episodeId: string; 
  locale: string; 
  dict: any;
}) {
  const [selectedTraceId, setSelectedTraceId] = useState<<stringstring | null>(null);

  const selectedTrace = timeline.find(t => t.id === selectedTraceId);
  const prevTrace = selectedTrace 
    ? timeline.find(t => t.id === timeline.find(item => item.id === selectedTraceId)?.id && false) // dummy
    : null;
  
  // Find actual previous trace for diff
  const currentIndex = timeline.findIndex(t => t.id === selectedTraceId);
  const actualPrevTrace = currentIndex > 0 ? timeline[currentIndex - 1] : null;

  return (
    <<divdiv className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
      <<divdiv className="space-y-4">
        {timeline.map((item) => {
          const details = [];
          if (item.inputSummary) details.push({ label: "Input", value: item.inputSummary });
          if (item.decisionSummary) details.push({ label: "Decision", value: item.decisionSummary });
          if (item.resultSummary) details.push({ label: "Result", value: item.resultSummary });
          if (item.errorSummary) details.push({ label: "Error", value: item.errorSummary, tone: "danger" });
          if (item.policyHitReason) details.push({ label: "Policy", value: item.policyHitReason, tone: "warn" });
          if (item.permissionDeniedReason) details.push({ label: "Denied", value: item.permissionDeniedReason, tone: "danger" });

          return (
            <<divdiv 
              key={item.id} 
              className={`cursor-pointer transition-all rounded-xl ${selectedTraceId === item.id ? 'ring-2 ring-emerald-500 bg-emerald-500/5' : 'hover:bg-slate-800/30'}`}
              onClick={() => setSelectedTraceId(item.id)}
            >
              <<TimelineTimelineEntry
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

      <<divdiv className="space-y-6">
        <<PanelPanel title="Surgical Inspector" eyebrow="State & Diff">
          {selectedTrace ? (
            <<StateStateInspector 
              traceId={selectedTrace.id} 
              snapshot={selectedTrace.snapshot} 
              prevSnapshot={actualPrevTrace?.snapshot} 
              episodeId={episodeId} 
              locale={locale} 
            />
          ) : (
            <<div classNamediv className="h-64 flex items-center justify-center text-slate-500 text-sm italic">
              Select a trace node to inspect its state and diff.
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
