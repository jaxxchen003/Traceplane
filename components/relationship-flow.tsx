"use client";

interface FlowNode {
  id: string;
  label: string;
  meta?: string;
}

const toneColors: Record<string, { border: string; label: string; bg: string }> = {
  Memory: {
    border: "border-signal-info/30",
    label: "text-signal-info",
    bg: "bg-signal-info/5",
  },
  Trace: {
    border: "border-signal-success/30",
    label: "text-signal-success",
    bg: "bg-signal-success/5",
  },
  Artifact: {
    border: "border-signal-warning/30",
    label: "text-signal-warning",
    bg: "bg-signal-warning/5",
  },
};

export function RelationshipFlow({
  memories,
  traces,
  artifacts,
}: {
  memories: FlowNode[];
  traces: FlowNode[];
  artifacts: FlowNode[];
}) {
  const columns = [
    { title: "Memory", items: memories },
    { title: "Trace", items: traces },
    { title: "Artifact", items: artifacts },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {columns.map((column, columnIndex) => {
        const tone = toneColors[column.title];
        return (
          <div key={column.title} className="relative">
            {columnIndex < columns.length - 1 ? (
              <div className="pointer-events-none absolute right-[-18px] top-1/2 hidden h-px w-9 bg-void-600 lg:block" />
            ) : null}
            <div className="bg-void-800 border border-void-600 rounded p-4">
              <div className={`mb-3 text-[11px] uppercase tracking-wider ${tone.label}`}>
                {column.title}
              </div>
              <div className="space-y-3">
                {column.items.length > 0 ? (
                  column.items.map((item) => (
                    <div
                      key={item.id}
                      className={`bg-void-900 border ${tone.border} rounded px-4 py-3`}
                    >
                      <div className="font-medium text-ink">{item.label}</div>
                      {item.meta ? (
                        <div className="mt-1 text-xs text-ink-faint">{item.meta}</div>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <div className="border border-dashed border-void-600 rounded px-4 py-6 text-sm text-ink-faint text-center">
                    No nodes
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

