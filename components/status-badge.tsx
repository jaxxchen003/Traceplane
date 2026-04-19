type Tone = "neutral" | "success" | "warning" | "danger";

function getTone(value: string): Tone {
  if (["ACTIVE", "IN_PROGRESS", "RUNNING", "HEALTHY"].includes(value))
    return "success";
  if (["AT_RISK", "PLANNED", "BLOCKED", "IN_REVIEW", "PAUSED", "PENDING"].includes(value))
    return "warning";
  if (["FAILED", "ERROR", "denied", "DENIED"].includes(value)) return "danger";
  if (["COMPLETED", "DONE", "SUCCESS"].includes(value)) return "success";
  return "neutral";
}

const toneClasses: Record<Tone, string> = {
  neutral:
    "bg-signal-neutral/10 text-signal-neutral border border-signal-neutral/20",
  success:
    "bg-signal-success/10 text-signal-success border border-signal-success/20",
  warning:
    "bg-signal-warning/10 text-signal-warning border border-signal-warning/20",
  danger:
    "bg-signal-error/10 text-signal-error border border-signal-error/20",
};

export function StatusBadge({
  label,
  raw,
}: {
  label: string;
  raw: string;
}) {
  const tone = getTone(raw);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${toneClasses[tone]}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          tone === "success"
            ? "bg-signal-success animate-status-pulse"
            : tone === "warning"
            ? "bg-signal-warning"
            : tone === "danger"
            ? "bg-signal-error"
            : "bg-signal-neutral"
        }`}
      />
      {label}
    </span>
  );
}

export function StatusDot({
  status,
  pulse = false,
}: {
  status: Tone;
  pulse?: boolean;
}) {
  const colorClass =
    status === "success"
      ? "bg-signal-success"
      : status === "warning"
      ? "bg-signal-warning"
      : status === "danger"
      ? "bg-signal-error"
      : "bg-signal-neutral";

  return (
    <span
      className={`w-2 h-2 rounded-full ${colorClass} ${
        pulse ? "animate-status-pulse" : ""
      }`}
    />
  );
}
