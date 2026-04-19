"use client";

import { useMemo, useState } from "react";

import { brand } from "@/lib/brand";

type GraphNodeTone = "memory" | "trace" | "artifact" | "policy" | "audit" | "agent";

type GraphNode = {
  id: string;
  label: string;
  meta?: string;
  x: number;
  y: number;
  z?: number;
  tone: GraphNodeTone;
};

type GraphEdge = {
  from: string;
  to: string;
  emphasis?: "soft" | "strong";
};

const toneStyles: Record<
  GraphNodeTone,
  {
    glow: string;
    border: string;
    text: string;
    pill: string;
    tab: string;
  }
> = {
  memory: {
    glow: "from-signal-info/35 via-signal-info/15 to-transparent",
    border: "border-signal-info/40",
    text: "text-signal-info",
    pill: "bg-signal-info/10 text-signal-info",
    tab: "border-signal-info/20 bg-signal-info/5 text-signal-info"
  },
  trace: {
    glow: "from-signal-success/35 via-signal-success/15 to-transparent",
    border: "border-signal-success/40",
    text: "text-signal-success",
    pill: "bg-signal-success/10 text-signal-success",
    tab: "border-signal-success/20 bg-signal-success/5 text-signal-success"
  },
  artifact: {
    glow: "from-signal-warning/35 via-signal-warning/15 to-transparent",
    border: "border-signal-warning/40",
    text: "text-signal-warning",
    pill: "bg-signal-warning/10 text-signal-warning",
    tab: "border-signal-warning/20 bg-signal-warning/5 text-signal-warning"
  },
  policy: {
    glow: "from-signal-warning/35 via-signal-warning/15 to-transparent",
    border: "border-signal-warning/40",
    text: "text-signal-warning",
    pill: "bg-signal-warning/10 text-signal-warning",
    tab: "border-signal-warning/20 bg-signal-warning/5 text-signal-warning"
  },
  audit: {
    glow: "from-signal-error/35 via-signal-error/15 to-transparent",
    border: "border-signal-error/40",
    text: "text-signal-error",
    pill: "bg-signal-error/10 text-signal-error",
    tab: "border-signal-error/20 bg-signal-error/5 text-signal-error"
  },
  agent: {
    glow: "from-accent/35 via-accent/15 to-transparent",
    border: "border-accent/40",
    text: "text-accent",
    pill: "bg-accent/10 text-accent",
    tab: "border-accent/20 bg-accent-dim text-accent"
  }
};

function clampDepth(z = 0.5) {
  return Math.max(0, Math.min(1, z));
}

export function GraphTheater({
  title,
  subtitle,
  nodes,
  edges,
  stats,
}: {
  title: string;
  subtitle: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  stats: { label: string; value: string }[];
}) {
  const [filter, setFilter] = useState<GraphNodeTone | "all">("all");
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const filteredNodes = useMemo(
    () => (filter === "all" ? nodes : nodes.filter((n) => n.tone === filter)),
    [nodes, filter]
  );

  const nodeMap = useMemo(
    () => new Map(nodes.map((n) => [n.id, n])),
    [nodes]
  );

  const nodeElements = filteredNodes.map((node) => {
    const depth = clampDepth(node.z);
    const scale = 0.9 + depth * 0.2;
    const styles = toneStyles[node.tone];
    const isHovered = hoveredNode === node.id;

    return (
      <button
        key={node.id}
        type="button"
        onClick={() => {}}
        onMouseEnter={() => setHoveredNode(node.id)}
        onMouseLeave={() => setHoveredNode(null)}
        className="absolute text-left transition-all duration-300 pointer-events-auto"
        style={{
          left: `${node.x}%`,
          top: `${node.y}%`,
          transform: `translate(-50%, -50%) scale(${scale})`,
          zIndex: Math.floor(depth * 100),
        }}
      >
        <div
          className={`absolute inset-[-18px] rounded-full bg-gradient-to-br ${styles.glow} blur-2xl ${isHovered ? "opacity-100" : "opacity-70"}`}
        />
        <div
          className={`relative w-[168px] rounded border ${styles.border} bg-void-900/90 px-4 py-4 backdrop-blur transition-all ${isHovered ? "shadow-[0_0_0_1px_rgba(99,102,241,0.45),0_20px_50px_rgba(99,102,241,0.18)]" : "shadow-[0_16px_36px_rgba(0,0,0,0.26)]"}`}
        >
          <div className={`inline-flex rounded px-2.5 py-1 text-[10px] uppercase tracking-wider ${styles.pill}`}>
            {node.tone}
          </div>
          <div className={`mt-3 text-sm font-semibold ${styles.text}`}>{node.label}</div>
          {node.meta ? (
            <div className="mt-2 text-xs leading-5 text-ink-muted">{node.meta}</div>
          ) : null}
        </div>
      </button>
    );
  });

  const edgeLines = edges.map((edge, idx) => {
    const fromNode = nodeMap.get(edge.from);
    const toNode = nodeMap.get(edge.to);
    if (!fromNode || !toNode) return null;

    const isVisible =
      filter === "all" ||
      (filteredNodes.some((n) => n.id === edge.from) &&
        filteredNodes.some((n) => n.id === edge.to));

    return (
      <line
        key={`${edge.from}-${edge.to}-${idx}`}
        x1={fromNode.x}
        y1={fromNode.y}
        x2={toNode.x}
        y2={toNode.y}
        stroke="rgba(99,102,241,0.6)"
        strokeWidth={edge.emphasis === "strong" ? 0.8 : 0.4}
        strokeOpacity={isVisible ? 0.9 : 0.2}
      />
    );
  });

  const tabs: { key: GraphNodeTone | "all"; label: string }[] = [
    { key: "all", label: "all" },
    { key: "agent", label: "agent" },
    { key: "memory", label: "memory" },
    { key: "trace", label: "trace" },
    { key: "artifact", label: "artifact" },
    { key: "policy", label: "policy" },
  ];

  return (
    <section className="relative overflow-hidden rounded border border-void-600 bg-void-900 px-6 py-6">
      <div className="pointer-events-none absolute inset-0 bg-dot" />
      
      <div className="relative z-10 flex flex-col gap-6 xl:flex-row">
        <div className="xl:max-w-[360px]">
          <div className="flex items-center gap-3 text-[11px] uppercase tracking-wider text-accent/80">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-accent text-[10px] font-semibold text-white">
              T
            </span>
            <span>{brand.name}</span>
          </div>
          <h2 className="mt-3 text-[28px] font-semibold tracking-tight text-ink">{title}</h2>
          <p className="mt-4 text-sm leading-7 text-ink-muted">{subtitle}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                className={`rounded border px-3 py-1.5 text-[11px] uppercase tracking-wider transition ${
                  filter === tab.key
                    ? "border-accent/30 bg-accent-dim text-accent"
                    : "border-void-600 bg-void-800 text-ink-faint hover:border-void-500 hover:text-ink"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded border border-void-600 bg-void-800 px-4 py-4">
                <div className="text-[11px] uppercase tracking-wider text-ink-faint">{stat.label}</div>
                <div className="mt-2 text-2xl font-semibold text-ink">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative min-h-[480px] flex-1 overflow-hidden rounded border border-void-600 bg-void-800">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {edgeLines}
          </svg>
          <div className="absolute inset-0">{nodeElements}</div>
        </div>
      </div>
    </section>
  );
}
