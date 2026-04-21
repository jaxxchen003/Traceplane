import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Panel({
  title,
  eyebrow,
  children,
  className,
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("bg-void-900 border border-void-700 rounded-lg p-5", className)}>
      <div className="mb-5">
        {eyebrow ? (
          <div className="text-[10px] font-medium text-accent uppercase tracking-widest mb-1.5">
            {eyebrow}
          </div>
        ) : null}
        <h2 className="text-base font-semibold text-ink">{title}</h2>
      </div>
      {children}
    </section>
  );
}
