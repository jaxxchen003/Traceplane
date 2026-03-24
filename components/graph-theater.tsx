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
  }
> = {
  memory: {
    glow: "from-cyan-400/35 via-sky-400/15 to-transparent",
    border: "border-cyan-300/40",
    text: "text-cyan-50",
    pill: "bg-cyan-400/14 text-cyan-100"
  },
  trace: {
    glow: "from-emerald-400/35 via-teal-400/15 to-transparent",
    border: "border-emerald-300/40",
    text: "text-emerald-50",
    pill: "bg-emerald-400/14 text-emerald-100"
  },
  artifact: {
    glow: "from-fuchsia-400/35 via-violet-400/15 to-transparent",
    border: "border-fuchsia-300/40",
    text: "text-fuchsia-50",
    pill: "bg-fuchsia-400/14 text-fuchsia-100"
  },
  policy: {
    glow: "from-amber-400/35 via-orange-400/15 to-transparent",
    border: "border-amber-300/40",
    text: "text-amber-50",
    pill: "bg-amber-400/14 text-amber-100"
  },
  audit: {
    glow: "from-rose-400/35 via-pink-400/15 to-transparent",
    border: "border-rose-300/40",
    text: "text-rose-50",
    pill: "bg-rose-400/14 text-rose-100"
  },
  agent: {
    glow: "from-indigo-400/35 via-blue-400/15 to-transparent",
    border: "border-indigo-300/40",
    text: "text-indigo-50",
    pill: "bg-indigo-400/14 text-indigo-100"
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
  stats
}: {
  title: string;
  subtitle: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  stats?: Array<{ label: string; value: string }>;
}) {
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));

  return (
    <section className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[#08111f] px-6 py-6 shadow-[0_40px_120px_rgba(2,6,23,0.55)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(56,189,248,0.18),transparent_24%),radial-gradient(circle_at_85%_18%,rgba(192,132,252,0.18),transparent_22%),radial-gradient(circle_at_50%_78%,rgba(52,211,153,0.12),transparent_26%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:42px_42px]" />

      <div className="relative z-10 flex flex-col gap-6 xl:flex-row">
        <div className="xl:max-w-[340px]">
          <div className="text-[11px] uppercase tracking-[0.34em] text-cyan-200/68">
            Agent Work Graph
          </div>
          <h2 className="mt-3 text-[30px] font-semibold tracking-[-0.03em] text-white">
            {title}
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">{subtitle}</p>

          {stats?.length ? (
            <div className="mt-6 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[22px] border border-white/10 bg-white/6 px-4 py-4 backdrop-blur"
                >
                  <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
                    {stat.label}
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-white">{stat.value}</div>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="relative min-h-[480px] flex-1 overflow-hidden rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(15,23,42,0.52),rgba(2,6,23,0.9))]">
          <div className="pointer-events-none absolute inset-0 [perspective:1800px]">
            <div className="absolute left-[8%] top-[12%] h-[74%] w-[84%] rounded-[36px] border border-cyan-400/10 [transform:rotateX(70deg)]" />
            <div className="absolute left-[16%] top-[24%] h-[54%] w-[68%] rounded-[999px] border border-fuchsia-400/10 [transform:rotateX(72deg)]" />
            <div className="absolute left-[22%] top-[31%] h-[40%] w-[56%] rounded-[999px] border border-emerald-400/10 [transform:rotateX(74deg)]" />
          </div>

          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {edges.map((edge, index) => {
              const from = nodeMap.get(edge.from);
              const to = nodeMap.get(edge.to);

              if (!from || !to) return null;

              const fromDepth = clampDepth(from.z);
              const toDepth = clampDepth(to.z);
              const opacity = edge.emphasis === "strong" ? 0.8 : 0.36;

              return (
                <line
                  key={`${edge.from}-${edge.to}-${index}`}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke="rgba(148,163,184,0.8)"
                  strokeWidth={0.18 + ((fromDepth + toDepth) / 2) * 0.24}
                  strokeOpacity={opacity}
                />
              );
            })}
          </svg>

          <div className="absolute inset-0">
            {nodes.map((node) => {
              const depth = clampDepth(node.z);
              const scale = 0.78 + depth * 0.62;
              const style = toneStyles[node.tone];

              return (
                <div
                  key={node.id}
                  className="absolute"
                  style={{
                    left: `${node.x}%`,
                    top: `${node.y}%`,
                    transform: `translate(-50%, -50%) scale(${scale})`
                  }}
                >
                  <div
                    className={`absolute inset-[-18px] rounded-full bg-gradient-to-br ${style.glow} blur-2xl`}
                  />
                  <div
                    className={`relative w-[168px] rounded-[22px] border ${style.border} bg-slate-950/72 px-4 py-4 backdrop-blur-xl`}
                  >
                    <div className={`inline-flex rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.24em] ${style.pill}`}>
                      {node.tone}
                    </div>
                    <div className={`mt-3 text-sm font-semibold ${style.text}`}>{node.label}</div>
                    {node.meta ? (
                      <div className="mt-2 text-xs leading-5 text-slate-300">{node.meta}</div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
