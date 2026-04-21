"use client";

import { useMemo, useState } from "react";

import { Panel } from "@/components/panel";

type BriefingTone = "memory" | "trace" | "artifact" | "policy" | "audit" | "agent";

type BriefingNode = {
  id: string;
  label: string;
  meta?: string;
  tone: BriefingTone;
  detail: string;
};

const toneStyles: Record<BriefingTone, { border: string; label: string }> = {
  memory: {
    border: "border-signal-info/30 bg-signal-info/5",
    label: "text-signal-info",
  },
  trace: {
    border: "border-signal-success/30 bg-signal-success/5",
    label: "text-signal-success",
  },
  artifact: {
    border: "border-signal-warning/30 bg-signal-warning/5",
    label: "text-signal-warning",
  },
  policy: {
    border: "border-signal-warning/30 bg-signal-warning/5",
    label: "text-signal-warning",
  },
  audit: {
    border: "border-signal-error/30 bg-signal-error/5",
    label: "text-signal-error",
  },
  agent: {
    border: "border-accent/30 bg-accent-dim",
    label: "text-accent",
  },
};

export function GraphBriefing({
  title,
  nodes,
  emptyLabel,
}: {
  title: string;
  nodes: BriefingNode[];
  emptyLabel: string;
}) {
  const [selectedId, setSelectedId] = useState(nodes[0]?.id ?? "");

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedId) ?? nodes[0] ?? null,
    [nodes, selectedId]
  );

  return (
    <Panel title={title} eyebrow="Graph Briefing">
      {nodes.length === 0 ? (
        <div className="border border-dashed border-void-700 rounded px-4 py-4 text-sm text-ink-faint">
          {emptyLabel}
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-2">
            {nodes.map((node) => {
              const active = selectedNode?.id === node.id;
              const styles = toneStyles[node.tone];

              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => setSelectedId(node.id)}
                  className={`block w-full rounded border px-4 py-4 text-left transition ${
                    active
                      ? styles.border
                      : "bg-void-800 border-void-700 hover:border-void-500"
                  }`}
                >
                  <div className="text-[10px] uppercase tracking-wider text-ink-ghost">{node.tone}</div>
                  <div className="mt-2 text-sm font-semibold text-ink">{node.label}</div>
                  {node.meta ? <div className="mt-1 text-xs text-ink-faint">{node.meta}</div> : null}
                </button>
              );
            })}
          </div>

          <div className="bg-void-800 border border-void-700 rounded px-5 py-5">
            {selectedNode ? (
              <>
                <div className={`text-[10px] uppercase tracking-wider ${toneStyles[selectedNode.tone].label}`}>
                  {selectedNode.tone}
                </div>
                <div className="mt-2 text-xl font-semibold text-ink">{selectedNode.label}</div>
                {selectedNode.meta ? (
                  <div className="mt-2 text-sm text-ink-faint">{selectedNode.meta}</div>
                ) : null}
                <div className="mt-5 text-sm leading-7 text-ink-muted">{selectedNode.detail}</div>
              </>
            ) : (
              <div className="text-sm text-ink-faint">{emptyLabel}</div>
            )}
          </div>
        </div>
      )}
    </Panel>
  );
}
