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

export function GraphBriefing({
  title,
  nodes,
  emptyLabel
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
        <div className="tp-soft-card rounded-[22px] px-4 py-4 text-sm text-slate-400">
          {emptyLabel}
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-2">
            {nodes.map((node) => {
              const active = selectedNode?.id === node.id;

              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => setSelectedId(node.id)}
                  className={`block w-full rounded-[22px] border px-4 py-4 text-left transition ${
                    active
                      ? "border-cyan-300/28 bg-cyan-400/10"
                      : "tp-soft-card hover:border-white/16 hover:bg-white/7"
                  }`}
                >
                  <div className="text-[10px] uppercase tracking-[0.24em] text-slate-500">{node.tone}</div>
                  <div className="mt-2 text-sm font-semibold text-white">{node.label}</div>
                  {node.meta ? <div className="mt-1 text-xs text-slate-400">{node.meta}</div> : null}
                </button>
              );
            })}
          </div>

          <div className="tp-soft-card rounded-[24px] px-5 py-5">
            {selectedNode ? (
              <>
                <div className="text-[10px] uppercase tracking-[0.24em] text-cyan-200/80">
                  {selectedNode.tone}
                </div>
                <div className="mt-2 text-xl font-semibold text-white">{selectedNode.label}</div>
                {selectedNode.meta ? (
                  <div className="mt-2 text-sm text-slate-400">{selectedNode.meta}</div>
                ) : null}
                <div className="mt-5 text-sm leading-7 text-slate-300">{selectedNode.detail}</div>
              </>
            ) : (
              <div className="text-sm text-slate-400">{emptyLabel}</div>
            )}
          </div>
        </div>
      )}
    </Panel>
  );
}
