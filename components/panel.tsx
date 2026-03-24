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
    <section className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.84),rgba(2,6,23,0.92))] p-5 shadow-[0_30px_90px_rgba(2,6,23,0.34)] backdrop-blur-xl">
      {eyebrow ? (
        <div className="mb-2 text-[11px] uppercase tracking-[0.28em] text-slate-400">{eyebrow}</div>
      ) : null}
      <h2 className="mb-4 text-lg font-semibold text-white">{title}</h2>
      {children}
    </section>
  );
}
