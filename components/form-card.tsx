import type { ReactNode } from "react";

export function FormCard({
  title,
  children
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="tp-soft-card rounded-[24px] px-4 py-4">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">{title}</h3>
      {children}
    </div>
  );
}
