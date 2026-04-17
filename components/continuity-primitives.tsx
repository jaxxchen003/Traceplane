import Link from "next/link";
import type { ReactNode } from "react";

import { StatusBadge } from "@/components/status-badge";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

const toneClasses = {
  neutral: {
    card: "tp-soft-card text-slate-100",
    label: "text-slate-500",
    pill: "border-white/10 bg-white/6 text-slate-100"
  },
  cyan: {
    card: "border border-cyan-400/16 bg-cyan-400/8 text-cyan-50",
    label: "text-cyan-200/78",
    pill: "border-cyan-300/25 bg-cyan-400/10 text-cyan-100"
  },
  emerald: {
    card: "border border-emerald-400/16 bg-emerald-400/8 text-emerald-50",
    label: "text-emerald-200/78",
    pill: "border-emerald-300/25 bg-emerald-400/10 text-emerald-100"
  },
  amber: {
    card: "border border-amber-400/16 bg-amber-400/8 text-amber-50",
    label: "text-amber-200/78",
    pill: "border-amber-300/25 bg-amber-400/10 text-amber-100"
  },
  rose: {
    card: "border border-rose-400/16 bg-rose-400/8 text-rose-50",
    label: "text-rose-200/78",
    pill: "border-rose-300/25 bg-rose-400/10 text-rose-100"
  }
} as const;

type Tone = keyof typeof toneClasses;

export function EmptyPanelState({ children }: { children: ReactNode }) {
  return (
    <div className="tp-empty-state rounded-[24px] px-5 py-8 text-sm leading-7 text-slate-400">
      {children}
    </div>
  );
}

export function SurfacePill({
  children,
  tone = "neutral"
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  return (
    <span
      className={cx(
        "inline-flex rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.18em]",
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
  tone = "neutral"
}: {
  label: string;
  value: string;
  tone?: "neutral" | "good" | "warn";
}) {
  const toneClass =
    tone === "good"
      ? "border border-emerald-400/16 bg-emerald-400/8 text-emerald-50"
      : tone === "warn"
        ? "border border-amber-400/16 bg-amber-400/8 text-amber-50"
        : "tp-soft-card text-slate-100";

  const labelTone =
    tone === "good"
      ? "text-emerald-200/78"
      : tone === "warn"
        ? "text-amber-200/78"
        : "text-slate-500";

  return (
    <div className={cx("rounded-[20px] px-4 py-4", toneClass)}>
      <div className={cx("text-[11px] uppercase tracking-[0.2em]", labelTone)}>{label}</div>
      <div className="mt-2 text-sm font-medium text-white">{value}</div>
    </div>
  );
}

export function MetricCard({
  label,
  value,
  detail,
  tone = "neutral",
  className
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
  note
}: {
  name: string;
  status: string;
  labels: string[];
  note: string;
}) {
  return (
    <div className="tp-soft-card rounded-[22px] px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-medium text-white">{name}</div>
        <SurfacePill tone="cyan">{status}</SurfacePill>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {labels.map((label) => (
          <SurfacePill key={label}>{label}</SurfacePill>
        ))}
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-300">{note}</p>
    </div>
  );
}

export function TokenList({
  items,
  tone = "neutral"
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
  className
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{label}</div>
      <div className="mt-2 text-base font-medium text-white">{value}</div>
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
  details
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
    <div className="tp-soft-card rounded-[24px] px-5 py-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Step {index}
            </div>
            <StatusBadge label={statusLabel} raw={statusRaw} />
          </div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <p className="mt-2 text-sm leading-7 text-slate-300">{summary}</p>
        </div>
        <div className="min-w-[220px] text-sm leading-7 text-slate-300">{meta}</div>
      </div>
      {details.length > 0 ? (
        <div className="mt-4 grid gap-3 text-sm text-slate-300 lg:grid-cols-2">
          {details.map((detail) => {
            const toneClass =
              detail.tone === "danger"
                ? "text-rose-300"
                : detail.tone === "warn"
                  ? "text-amber-200"
                  : "";

            return (
              <div key={`${detail.label}-${detail.value}`} className={toneClass}>
                <span className="font-medium text-white">{detail.label}:</span> {detail.value}
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
  children
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
        "rounded-[24px] px-4 py-4",
        tone === "neutral" ? toneClasses.neutral.card : toneClasses[tone].card,
        className
      )}
    >
      <div className={cx("text-[11px] uppercase tracking-[0.18em]", toneClasses[tone].label)}>
        {label}
      </div>
      {title ? <div className="mt-3 text-lg font-semibold text-white">{title}</div> : null}
      {detail ? <div className="mt-2 text-sm leading-7 text-slate-300">{detail}</div> : null}
      {children}
    </div>
  );
}

export function CodePathBlock({
  label,
  code
}: {
  label: string;
  code: string;
}) {
  return (
    <div>
      <div className="mb-2 text-[11px] uppercase tracking-[0.18em] text-slate-500">{label}</div>
      <pre className="tp-code-block overflow-x-auto rounded-[18px] px-4 py-3 text-xs">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function PromptBlock({
  label,
  content
}: {
  label: string;
  content: string;
}) {
  return (
    <div className="tp-deep-card rounded-[20px] px-4 py-4">
      <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{label}</div>
      <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words rounded-2xl border border-white/8 bg-slate-950/80 p-4 text-[12px] leading-6 text-slate-200">
        {content}
      </pre>
    </div>
  );
}

export function ActionLink({
  href,
  children,
  tone = "primary"
}: {
  href: string;
  children: ReactNode;
  tone?: "primary" | "secondary";
}) {
  return (
    <Link
      href={href}
      className={cx(
        "tp-action-link px-4 py-2 text-xs font-medium",
        tone === "secondary" && "tp-action-link--secondary"
      )}
    >
      {children}
    </Link>
  );
}
