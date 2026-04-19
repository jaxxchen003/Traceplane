import type { ReactNode } from "react";

export function Panel({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
}) {
  return (
    <section className="bg-void-800 border border-void-600 rounded overflow-hidden">
      <div className="px-4 py-3 border-b border-void-600 bg-void-700">
        {eyebrow ? (
          <div className="text-xs font-medium text-ink-faint uppercase tracking-wider mb-1">
            {eyebrow}
          </div>
        ) : null}
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}
