import type { Locale } from "@/lib/i18n";

type I18nValue = { zh?: string; en?: string } | null | undefined;

export function localize(value: unknown, locale: Locale) {
  if (!value || typeof value !== "object") return "";
  const i18n = value as I18nValue;
  return i18n?.[locale] ?? i18n?.zh ?? i18n?.en ?? "";
}

export function formatDate(date: Date | string | null | undefined, locale: Locale) {
  if (!date) return "—";
  const formatter = new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
  return formatter.format(new Date(date));
}

export function formatDuration(start: Date | string, end: Date | string | null | undefined) {
  if (!end) return "—";
  const durationMinutes = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000);
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

export function toSentenceCase(value: string) {
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/^\w/, (match) => match.toUpperCase());
}
