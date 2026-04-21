import { cn } from "@/lib/utils";

export type StatusTone = "neutral" | "info" | "success" | "warning" | "danger" | "ghost";

export function getStatusTone(value: string): StatusTone {
  const status = value?.toUpperCase() || "";
  
  if (["IN_PROGRESS", "RUNNING", "ACTIVE", "LIVE"].includes(status)) return "info";
  if (["COMPLETED", "DONE", "SUCCESS", "APPROVED", "HEALTHY"].includes(status)) return "success";
  if (["IN_REVIEW", "PAUSED", "PENDING", "AT_RISK", "PLANNED", "BLOCKED", "WARNING"].includes(status)) return "warning";
  if (["FAILED", "ERROR", "DENIED", "REJECTED", "CRITICAL"].includes(status)) return "danger";
  if (["NEUTRAL", "GHOST", "DISABLED"].includes(status)) return "ghost";
  
  return "neutral";
}

const toneClasses: Record<StatusTone, { text: string; dot: string }> = {
  neutral: { text: "text-zinc-500", dot: "bg-zinc-500" },
  info: { text: "text-indigo-400", dot: "bg-indigo-400" },
  success: { text: "text-emerald-400", dot: "bg-emerald-400" },
  warning: { text: "text-amber-400", dot: "bg-amber-400" },
  danger: { text: "text-rose-400", dot: "bg-rose-400" },
  ghost: { text: "text-zinc-600", dot: "bg-zinc-600" },
};

function formatStatusLabel(label: string): string {
  return label
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());
}

export function StatusBadge({ label, raw, pulse, className }: { label: string; raw: string; pulse?: boolean; className?: string }) {
  const tone = getStatusTone(raw);
  const styles = toneClasses[tone];

  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.1em]", styles.text, className)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", styles.dot, pulse && "animate-status-pulse")} />
      {formatStatusLabel(label)}
    </span>
  );
}
