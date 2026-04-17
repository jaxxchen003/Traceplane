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
    <section className="tp-panel-shell rounded-[30px] p-5">
      {eyebrow ? <div className="tp-kicker mb-2">{eyebrow}</div> : null}
      <h2 className="mb-4 text-lg font-semibold text-white">{title}</h2>
      {children}
    </section>
  );
}
