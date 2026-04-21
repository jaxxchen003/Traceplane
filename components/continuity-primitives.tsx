import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/status-badge";

export function EmptyPanelState({ children }: { children: ReactNode }) {
  return (
    <div className="border border-dashed border-void-700 rounded-2xl px-5 py-8 text-sm text-zinc-500">
      {children}
    </div>
  );
}

const pillToneMap: Record<string, string> = {
  neutral: "border-void-700 bg-void-800 text-ink-faint",
  cyan: "border-signal-info/30 bg-signal-info/5 text-signal-info",
  amber: "border-signal-warning/30 bg-signal-warning/5 text-signal-warning",
  emerald: "border-signal-success/30 bg-signal-success/5 text-signal-success",
  rose: "border-signal-error/30 bg-signal-error/5 text-signal-error",
};

export function SurfacePill({
  children,
  tone,
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "cyan" | "amber" | "emerald" | "rose";
  className?: string;
}) {
  const toneClass = pillToneMap[tone ?? "neutral"] ?? pillToneMap.neutral;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-[10px] font-medium border",
        toneClass,
        className
      )}
    >
      {children}
    </span>
  );
}

export function RuntimeSignal({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "good" | "warn";
}) {
  const borderTone = tone === "good" ? "border-emerald-500/30" : tone === "warn" ? "border-amber-500/30" : "border-void-700";
  const textTone = tone === "good" ? "text-emerald-400" : tone === "warn" ? "text-amber-400" : "text-zinc-500";

  return (
    <div className={cn("bg-void-900 rounded-lg px-4 py-4 border", borderTone)}>
      <div className={cn("text-[10px] uppercase tracking-[0.2em]", textTone)}>{label}</div>
      <div className="mt-2 text-sm font-medium text-white">{value}</div>
    </div>
  );
}

const toneMap: Record<string, { border: string; label: string; value: string }> = {
  cyan: { border: "border-signal-info/30", label: "text-signal-info", value: "text-signal-info" },
  amber: { border: "border-signal-warning/30", label: "text-signal-warning", value: "text-signal-warning" },
  emerald: { border: "border-signal-success/30", label: "text-signal-success", value: "text-signal-success" },
  rose: { border: "border-signal-error/30", label: "text-signal-error", value: "text-signal-error" },
  neutral: { border: "border-void-700", label: "text-ink-faint", value: "text-ink" },
};

export function MetricCard({
  label,
  value,
  detail,
  tone,
  className,
}: {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  tone?: "cyan" | "amber" | "emerald" | "rose" | "neutral";
  className?: string;
}) {
  const t = toneMap[tone ?? "neutral"] ?? toneMap.neutral;
  return (
    <div className={cn("bg-void-900 rounded-lg px-5 py-5 border", t.border, className)}>
      <div className={cn("text-[10px] uppercase tracking-[0.2em]", t.label)}>{label}</div>
      <div className={cn("mt-2 text-2xl font-semibold", t.value)}>{value}</div>
      {detail ? <div className="mt-1 text-xs text-ink-muted">{detail}</div> : null}
    </div>
  );
}

export function HostTile({
  name,
  status,
  labels,
  note,
}: {
  name: string;
  status: string;
  labels: string[];
  note: string;
}) {
  return (
    <div className="bg-void-900 rounded-lg px-5 py-5 border border-void-700 hover:border-indigo-500/30 transition">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="text-sm font-medium text-white">{name}</div>
        <SurfacePill className="text-indigo-400 border-indigo-500/20 bg-indigo-500/10">{status}</SurfacePill>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {labels.map((label) => (
          <SurfacePill key={label}>{label}</SurfacePill>
        ))}
      </div>
      <p className="text-xs leading-6 text-zinc-400">{note}</p>
    </div>
  );
}


export function TokenList({
  items,
  tone = "neutral",
}: {
  items: string[];
  tone?: "neutral" | "cyan" | "amber" | "emerald" | "rose";
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {items.map((item) => (
        <SurfacePill key={item} tone={tone}>
          {item}
        </SurfacePill>
      ))}
    </div>
  );
}

export function LabeledValue({
  label,
  value,
  className,
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="text-[11px] uppercase tracking-wider text-ink-faint">{label}</div>
      <div className="mt-2 text-base font-medium text-ink">{value}</div>
    </div>
  );
}

export function TimelineEntry({
  index,
  statusLabel,
  statusRaw,
  title,
  summary,
  meta,
  details,
}: {
  index: number;
  statusLabel: string;
  statusRaw: string;
  title: string;
  summary: string;
  meta: ReactNode;
  details: Array<{
    label: string;
    value: string;
    tone?: "default" | "warn" | "danger";
  }>;
}) {
  return (
    <div className="bg-void-800 border border-void-700 rounded px-5 py-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
              Step {index}
            </div>
            <StatusBadge label={statusLabel} raw={statusRaw} />
          </div>
          <h2 className="text-lg font-semibold text-ink">{title}</h2>
          <p className="mt-2 text-sm leading-7 text-ink-muted">{summary}</p>
        </div>
        <div className="min-w-[220px] text-sm leading-7 text-ink-muted">{meta}</div>
      </div>
      {details.length > 0 ? (
        <div className="mt-4 grid gap-3 text-sm text-ink-muted lg:grid-cols-2">
          {details.map((detail) => {
            const toneClass =
              detail.tone === "danger"
                ? "text-signal-error"
                : detail.tone === "warn"
                ? "text-signal-warning"
                : "";

            return (
              <div key={`${detail.label}-${detail.value}`} className={toneClass}>
                <span className="font-medium text-ink">{detail.label}:</span> {detail.value}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function ContinuityCard({
  label,
  title,
  detail,
  tone = "neutral",
  className,
  children,
}: {
  label: string;
  title?: ReactNode;
  detail?: ReactNode;
  tone?: "neutral" | "cyan" | "emerald" | "amber" | "rose";
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "bg-void-900 rounded-lg px-5 py-5 border border-void-700",
        className
      )}
    >
      <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </div>
      {title ? <div className="mt-2 text-lg font-semibold text-white">{title}</div> : null}
      {detail ? <div className="mt-1 text-xs text-zinc-400">{detail}</div> : null}
      {children}
    </div>
  );
}

export function CodePathBlock({
  label,
  code,
}: {
  label: string;
  code: string;
}) {
  return (
    <div>
      <div className="mb-2 text-[11px] uppercase tracking-wider text-ink-faint">{label}</div>
      <pre className="bg-void-800 border border-void-700 overflow-x-auto rounded px-4 py-3 text-xs font-mono text-ink">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function PromptBlock({
  label,
  content,
}: {
  label: string;
  content: string;
}) {
  return (
    <div className="bg-void-800 border border-void-700 rounded px-4 py-4">
      <div className="text-[11px] uppercase tracking-wider text-ink-faint">{label}</div>
      <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words rounded bg-void-950 border border-void-700 p-4 text-[12px] leading-6 font-mono text-ink-muted">
        {content}
      </pre>
    </div>
  );
}

export function ActionLink({
  href,
  children,
  tone = "primary",
}: {
  href: string;
  children: ReactNode;
  tone?: "primary" | "secondary";
}) {
  return (
    <Link
      href={href}
      className={cx(
        "inline-flex items-center px-4 py-2 text-xs font-medium rounded transition-colors",
        tone === "secondary"
          ? "border border-void-700 text-ink-muted hover:border-void-500 hover:text-ink"
          : "bg-accent text-white hover:bg-accent-glow"
      )}
    >
      {children}
    </Link>
  );
}
