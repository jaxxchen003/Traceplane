import type { ReactNode } from "react";

export function Panel({
  title,
  eyebrow,
  children
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-white/60 bg-white/85 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
      {eyebrow ? <div className="mb-2 text-[11px] uppercase tracking-[0.28em] text-slate-500">{eyebrow}</div> : null}
      <h2 className="mb-4 text-lg font-semibold text-slate-950">{title}</h2>
      {children}
    </section>
  );
}
