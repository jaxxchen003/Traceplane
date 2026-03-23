type Tone = "neutral" | "success" | "warning" | "danger";

function getTone(value: string): Tone {
  if (["ACTIVE", "RUNNING", "COMPLETED", "SUCCESS"].includes(value)) return "success";
  if (["AT_RISK", "PENDING_REVIEW", "WARNING"].includes(value)) return "warning";
  if (["FAILED", "denied"].includes(value)) return "danger";
  return "neutral";
}

const toneClasses: Record<Tone, string> = {
  neutral: "bg-slate-100 text-slate-700",
  success: "bg-emerald-100 text-emerald-800",
  warning: "bg-amber-100 text-amber-900",
  danger: "bg-rose-100 text-rose-900"
};

export function StatusBadge({ label, raw }: { label: string; raw: string }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${toneClasses[getTone(raw)]}`}>
      {label}
    </span>
  );
}
