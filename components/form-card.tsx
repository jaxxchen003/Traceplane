import type { ReactNode } from "react";

export function FormCard({
  title,
  children
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="bg-void-800 border border-void-700 rounded rounded px-4 py-4">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-ink-faint">{title}</h3>
      {children}
    </div>
  );
}
