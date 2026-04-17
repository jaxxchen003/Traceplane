type FlowNode = {
  id: string;
  label: string;
  meta?: string;
};

export function RelationshipFlow({
  memories,
  traces,
  artifacts
}: {
  memories: FlowNode[];
  traces: FlowNode[];
  artifacts: FlowNode[];
}) {
  const columns = [
    { title: "Memory", items: memories },
    { title: "Trace", items: traces },
    { title: "Artifact", items: artifacts }
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {columns.map((column, columnIndex) => (
        <div key={column.title} className="relative">
          {columnIndex < columns.length - 1 ? (
            <div className="pointer-events-none absolute right-[-18px] top-1/2 hidden h-px w-9 bg-cyan-200/12 lg:block" />
          ) : null}
          <div className="tp-soft-card rounded-[24px] p-4">
            <div className="mb-3 text-[11px] uppercase tracking-[0.18em] text-slate-500">{column.title}</div>
            <div className="space-y-3">
              {column.items.length > 0 ? (
                column.items.map((item) => (
                  <div key={item.id} className="tp-deep-card rounded-2xl px-4 py-3">
                    <div className="font-medium text-white">{item.label}</div>
                    {item.meta ? <div className="mt-1 text-xs text-slate-400">{item.meta}</div> : null}
                  </div>
                ))
              ) : (
                <div className="tp-empty-state rounded-2xl px-4 py-6 text-sm text-slate-500">
                  No nodes
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
