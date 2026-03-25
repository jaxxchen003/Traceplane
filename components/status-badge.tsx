type Tone = "neutral" | "success" | "warning" | "danger";

function getTone(value: string): Tone {
  if (["ACTIVE", "IN_PROGRESS", "COMPLETED", "SUCCESS"].includes(value)) return "success";
  if (["AT_RISK", "PLANNED", "BLOCKED", "IN_REVIEW", "WARNING"].includes(value)) return "warning";
  if (["FAILED", "denied"].includes(value)) return "danger";
  return "neutral";
}

const toneClasses: Record<Tone, string> = {
  neutral: "border border-slate-500/35 bg-slate-400/12 text-slate-200",
  success: "border border-emerald-400/35 bg-emerald-400/12 text-emerald-200",
  warning: "border border-amber-400/35 bg-amber-400/12 text-amber-200",
  danger: "border border-rose-400/35 bg-rose-400/12 text-rose-200"
};

export function StatusBadge({ label, raw }: { label: string; raw: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${toneClasses[getTone(raw)]}`}
    >
      {label}
    </span>
  );
}
