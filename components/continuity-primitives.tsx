import Link from "next/link";
import type { ReactNode } from "react";

import { StatusBadge } from "@/components/status-badge";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

const toneClasses = {
  neutral: {
    card: "bg-void-800 border border-void-600",
    label: "text-ink-faint",
    pill: "bg-void-700 border border-void-600 text-ink-muted",
  },
  cyan: {
    card: "bg-signal-info/5 border border-signal-info/20",
    label: "text-signal-info",
    pill: "bg-signal-info/10 border border-signal-info/20 text-signal-info",
  },
  emerald: {
    card: "bg-signal-success/5 border border-signal-success/20",
    label: "text-signal-success",
    pill: "bg-signal-success/10 border border-signal-success/20 text-signal-success",
  },
  amber: {
    card: "bg-signal-warning/5 border border-signal-warning/20",
    label: "text-signal-warning",
    pill: "bg-signal-warning/10 border border-signal-warning/20 text-signal-warning",
  },
  rose: {
    card: "bg-signal-error/5 border border-signal-error/20",
    label: "text-signal-error",
    pill: "bg-signal-error/10 border border-signal-error/20 text-signal-error",
  },
} as const;

type Tone = keyof typeof toneClasses;

export function EmptyPanelState({ children }: { children: ReactNode }) {
  return (
    <div className="border border-dashed border-void-600 rounded px-5 py-8 text-sm text-ink-faint">
      {children}
    </div>
  );
}

export function SurfacePill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  return (
    <span
      className={cx(
        "inline-flex rounded px-2 py-1 text-[10px] font-medium",
        toneClasses[tone].pill
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
  const toneClass =
    tone === "good"
      ? "bg-signal-success/5 border border-signal-success/20"
      : tone === "warn"
      ? "bg-signal-warning/5 border border-signal-warning/20"
      : "bg-void-800 border border-void-600";

  const labelTone =
    tone === "good"
      ? "text-signal-success"
      : tone === "warn"
      ? "text-signal-warning"
      : "text-ink-faint";

  return (
    <div className={cx("rounded px-4 py-4", toneClass)}>
      <div className={cx("text-[11px] uppercase tracking-wider", labelTone)}>{label}</div>
      <div className="mt-2 text-sm font-medium text-ink">{value}</div>
    </div>
  );
}

export function MetricCard({
  label,
  value,
  detail,
  tone = "neutral",
  className,
}: {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <ContinuityCard label={label} title={value} detail={detail} tone={tone} className={className} />
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
    <div className="bg-void-800 border border-void-600 rounded px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-medium text-ink">{name}</div>
        <SurfacePill tone="cyan">{status}</SurfacePill>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {labels.map((label) => (
          <SurfacePill key={label}>{label}</SurfacePill>
        ))}
      </div>
      <p className="mt-3 text-sm leading-6 text-ink-muted">{note}</p>
    </div>
  );
}

export function TokenList({
  items,
  tone = "neutral",
}: {
  items: string[];
  tone?: Tone;
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
    <div className="bg-void-800 border border-void-600 rounded px-5 py-5">
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
  tone?: Tone;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cx(
        "rounded px-4 py-4",
        tone === "neutral" ? toneClasses.neutral.card : toneClasses[tone].card,
        className
      )}
    >
      <div className={cx("text-[11px] uppercase tracking-wider", toneClasses[tone].label)}>
        {label}
      </div>
      {title ? <div className="mt-3 text-lg font-semibold text-ink">{title}</div> : null}
      {detail ? <div className="mt-2 text-sm leading-7 text-ink-muted">{detail}</div> : null}
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
      <pre className="bg-void-800 border border-void-600 overflow-x-auto rounded px-4 py-3 text-xs font-mono text-ink">
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
    <div className="bg-void-800 border border-void-600 rounded px-4 py-4">
      <div className="text-[11px] uppercase tracking-wider text-ink-faint">{label}</div>
      <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words rounded bg-void-950 border border-void-600 p-4 text-[12px] leading-6 font-mono text-ink-muted">
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
          ? "border border-void-600 text-ink-muted hover:border-void-500 hover:text-ink"
          : "bg-accent text-white hover:bg-accent-glow"
      )}
    >
      {children}
    </Link>
  );
}
