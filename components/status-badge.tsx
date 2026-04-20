import { cn } from "@/lib/utils";

export type StatusTone = "neutral" | "info" | "success" | "warning" | "danger" | "ghost";

export function getStatusTone(value: string): StatusTone {
  const status = value?.toUpperCase() || "";
  
  if (["IN_PROGRESS", "RUNNING", "ACTIVE", "LIVE"].includes(status)) {
    return "info";
  }
  
  if (["COMPLETED", "DONE", "SUCCESS", "APPROVED", "HEALTHY"].includes(status)) {
    return "success";
  }
  
  if (["IN_REVIEW", "PAUSED", "PENDING", "AT_RISK", "PLANNED", "BLOCKED", "WARNING"].includes(status)) {
    return "warning";
  }
  
  if (["FAILED", "ERROR", "DENIED", "REJECTED", "CRITICAL"].includes(status)) {
    return "danger";
  }
  
  if (["NEUTRAL", "GHOST", "DISABLED"].includes(status)) {
    return "ghost";
  }
  
  return "neutral";
}

const toneClasses: Record<StatusTone, { bg: string; text: string; border: string; dot: string }> = {
  neutral: {
    bg: "bg-signal-neutral/10",
    text: "text-signal-neutral",
    border: "border-signal-neutral/20",
    dot: "bg-signal-neutral",
  },
  info: {
    bg: "bg-signal-info/10",
    text: "text-signal-info",
    border: "border-signal-info/20",
    dot: "bg-signal-info",
  },
  success: {
    bg: "bg-signal-success/10",
    text: "text-signal-success",
    border: "border-signal-success/20",
    dot: "bg-signal-success",
  },
  warning: {
    bg: "bg-signal-warning/10",
    text: "text-signal-warning",
    border: "border-signal-warning/20",
    dot: "bg-signal-warning",
  },
  danger: {
    bg: "bg-signal-error/10",
    text: "text-signal-error",
    border: "border-signal-error/20",
    dot: "bg-signal-error",
  },
  ghost: {
    bg: "bg-ink-ghost/10",
    text: "text-ink-ghost",
    border: "border-ink-ghost/20",
    dot: "bg-ink-ghost",
  },
};

function formatStatusLabel(label: string): string {
  return label
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());
}

interface StatusBadgeProps {
  label: string;
  raw: string;
  size?: "sm" | "md" | "lg";
  pulse?: boolean;
  className?: string;
}

export function StatusBadge({
  label,
  raw,
  size = "sm",
  pulse = false,
  className,
}: StatusBadgeProps) {
  const tone = getStatusTone(raw);
  const styles = toneClasses[tone];
  
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-2.5 py-1.5 text-sm",
    lg: "px-3 py-2 text-base",
  };

  const dotSizeClasses = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-2.5 h-2.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded font-medium border",
        sizeClasses[size],
        styles.bg,
        styles.text,
        styles.border,
        className
      )}
    >
      <span
        className={cn(
          "rounded-full",
          dotSizeClasses[size],
          styles.dot,
          pulse && "animate-status-pulse"
        )}
      />
      {formatStatusLabel(label)}
    </span>
  );
}

interface StatusDotProps {
  status: StatusTone;
  size?: "sm" | "md" | "lg";
  pulse?: boolean;
  className?: string;
}

export function StatusDot({
  status,
  size = "sm",
  pulse = false,
  className,
}: StatusDotProps) {
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-2.5 h-2.5",
    lg: "w-3 h-3",
  };

  const colorClasses = {
    neutral: "bg-signal-neutral",
    info: "bg-signal-info",
    success: "bg-signal-success",
    warning: "bg-signal-warning",
    danger: "bg-signal-error",
    ghost: "bg-ink-ghost",
  };

  return (
    <span
      className={cn(
        "rounded-full inline-block",
        sizeClasses[size],
        colorClasses[status],
        pulse && "animate-status-pulse",
        className
      )}
    />
  );
}

interface ProgressBarProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  tone?: StatusTone;
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  size = "sm",
  tone = "info",
  showLabel = false,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const heightClasses = {
    sm: "h-1",
    md: "h-1.5",
    lg: "h-2",
  };

  const colorClasses = {
    neutral: "bg-signal-neutral",
    info: "bg-signal-info",
    success: "bg-signal-success",
    warning: "bg-signal-warning",
    danger: "bg-signal-error",
    ghost: "bg-ink-ghost",
  };

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between text-xs mb-1">
          <span className="text-ink-faint">Progress</span>
          <span className={cn("font-medium", toneClasses[tone].text)}>
            {percentage.toFixed(0)}%
          </span>
        </div>
      )}
      <div className={cn("w-full bg-void-600 rounded overflow-hidden", heightClasses[size])}>
        <div
          className={cn("h-full rounded transition-all duration-500", colorClasses[tone])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface HealthIndicatorProps {
  status: "healthy" | "degraded" | "unhealthy" | "unknown";
  label?: string;
  showPulse?: boolean;
}

export function HealthIndicator({
  status,
  label,
  showPulse = true,
}: HealthIndicatorProps) {
  const config = {
    healthy: { tone: "success" as const, text: "Healthy" },
    degraded: { tone: "warning" as const, text: "Degraded" },
    unhealthy: { tone: "danger" as const, text: "Unhealthy" },
    unknown: { tone: "ghost" as const, text: "Unknown" },
  };

  const { tone, text } = config[status];
  const styles = toneClasses[tone];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 px-2 py-1 rounded text-xs font-medium border",
        styles.bg,
        styles.text,
        styles.border
      )}
    >
      <StatusDot status={tone} pulse={showPulse && status === "healthy"} />
      {label || text}
    </span>
  );
}
