import { notFound } from "next/navigation";

import { ContinuityCard, MetricCard } from "@/components/continuity-primitives";
import { Panel } from "@/components/panel";
import { StatusBadge } from "@/components/status-badge";
import { formatDate } from "@/lib/format";
import { getAuditEvents } from "@/lib/demo-data";
import { getDictionary, isLocale } from "@/lib/i18n";

function AuditEventRow({
  event,
  locale
}: {
  event: {
    id: string;
    occurredAt: Date;
    result: string;
    action: string;
    actorType: string;
    actorId: string;
    targetType: string;
    targetId: string;
    permissionDecision: string | null;
    policyHitReason: string | null;
    denyReason: string | null;
  };
  locale: "zh" | "en";
}) {
  return (
    <tr className="rounded-2xl bg-white/5">
      <td className="rounded-l-2xl px-3 py-4">
        <div className="space-y-2">
          <StatusBadge label={event.result} raw={event.result} />
          <div className="text-xs text-slate-500">{formatDate(event.occurredAt, locale)}</div>
        </div>
      </td>
      <td className="px-3 py-4 text-sm text-slate-200">{event.action}</td>
      <td className="px-3 py-4 text-sm text-slate-200">{event.actorType} · {event.actorId.slice(-6)}</td>
      <td className="px-3 py-4 text-sm text-slate-200">{event.targetType} · {event.targetId.slice(-8)}</td>
      <td className="px-3 py-4 text-sm text-slate-200">{event.permissionDecision ?? "allow"}</td>
      <td className="rounded-r-2xl px-3 py-4 text-sm text-slate-200">
        {event.policyHitReason || event.denyReason || "—"}
      </td>
    </tr>
  );
}

export default async function AuditPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ projectId?: string; episodeId?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const { projectId, episodeId } = await searchParams;
  const [dict, auditSurface] = await Promise.all([
    Promise.resolve(getDictionary(locale)),
    getAuditEvents({ locale, projectId, episodeId })
  ]);
  const { events, summary, runtimeSummary } = auditSurface;

  return (
    <div className="space-y-6">
      <section className="tp-panel-shell rounded-[34px] px-6 py-7 text-white">
        <div className="text-[11px] uppercase tracking-[0.26em] text-cyan-200/80">{dict.audit.title}</div>
        <h1 className="mt-3 text-3xl font-semibold">{dict.common.auditTrail}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">{dict.audit.subtitle}</p>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <Panel title={locale === "zh" ? "Governance Pressure" : "Governance Pressure"} eyebrow="Runtime">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label={locale === "zh" ? "Events" : "Events"} value={summary.totalEvents} />
            <MetricCard label={locale === "zh" ? "Denied" : "Denied"} value={summary.deniedCount} tone="rose" />
            <MetricCard label={locale === "zh" ? "Policy Hits" : "Policy Hits"} value={summary.policyHitCount} tone="amber" />
            <MetricCard label={locale === "zh" ? "Warnings" : "Warnings"} value={summary.warningCount} tone="cyan" />
          </div>
        </Panel>

        <Panel title={locale === "zh" ? "Audit Runtime State" : "Audit Runtime State"} eyebrow="Control Surface">
          <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
            <MetricCard
              label={locale === "zh" ? "Cloud Mode" : "Cloud Mode"}
              value={runtimeSummary.cloudMode}
              detail={runtimeSummary.databaseProvider}
            />
            <MetricCard
              label={locale === "zh" ? "Object Store" : "Object Store"}
              value={runtimeSummary.objectStorageProvider}
              detail={runtimeSummary.syncRoot}
            />
          </div>
        </Panel>
      </section>

      <Panel title={dict.audit.title} eyebrow="Audit">
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-3 text-left">
            <thead className="text-xs uppercase tracking-[0.16em] text-slate-500">
              <tr>
                <th className="px-3">{dict.common.status}</th>
                <th className="px-3">{dict.audit.action}</th>
                <th className="px-3">{dict.audit.actor}</th>
                <th className="px-3">{dict.audit.target}</th>
                <th className="px-3">{dict.audit.permission}</th>
                <th className="px-3">{dict.audit.hitReason}</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event: {
                id: string;
                occurredAt: Date;
                result: string;
                action: string;
                actorType: string;
                actorId: string;
                targetType: string;
                targetId: string;
                permissionDecision: string | null;
                policyHitReason: string | null;
                denyReason: string | null;
              }) => <AuditEventRow key={event.id} event={event} locale={locale} />)}
            </tbody>
          </table>
          {events.length === 0 ? (
            <ContinuityCard label={dict.audit.title} detail={dict.audit.noEvents} className="mt-4 text-sm text-slate-400" />
          ) : null}
        </div>
      </Panel>
    </div>
  );
}
