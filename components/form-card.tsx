import type { ReactNode } from "react";

export function FormCard({
  title,
  children
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white px-4 py-4">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{title}</h3>
      {children}
    </div>
  );
}
