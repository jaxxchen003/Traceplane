import { notFound } from "next/navigation";

import { Panel } from "@/components/panel";
import { StatusBadge } from "@/components/status-badge";
import { formatDate } from "@/lib/format";
import { getAuditEvents } from "@/lib/demo-data";
import { getDictionary, isLocale } from "@/lib/i18n";

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
      <section className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,15,32,0.92),rgba(2,6,23,0.96))] px-6 py-7 text-white shadow-[0_30px_90px_rgba(2,6,23,0.45)]">
        <div className="text-[11px] uppercase tracking-[0.26em] text-cyan-200/80">{dict.audit.title}</div>
        <h1 className="mt-3 text-3xl font-semibold">{dict.common.auditTrail}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">{dict.audit.subtitle}</p>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <Panel title={locale === "zh" ? "Governance Pressure" : "Governance Pressure"} eyebrow="Runtime">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-4">
              <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                {locale === "zh" ? "Events" : "Events"}
              </div>
              <div className="mt-2 text-2xl font-semibold text-white">{summary.totalEvents}</div>
            </div>
            <div className="rounded-[22px] border border-rose-400/16 bg-rose-400/8 px-4 py-4">
              <div className="text-[11px] uppercase tracking-[0.16em] text-rose-100/70">
                {locale === "zh" ? "Denied" : "Denied"}
              </div>
              <div className="mt-2 text-2xl font-semibold text-rose-50">{summary.deniedCount}</div>
            </div>
            <div className="rounded-[22px] border border-amber-400/16 bg-amber-400/8 px-4 py-4">
              <div className="text-[11px] uppercase tracking-[0.16em] text-amber-100/70">
                {locale === "zh" ? "Policy Hits" : "Policy Hits"}
              </div>
              <div className="mt-2 text-2xl font-semibold text-amber-50">{summary.policyHitCount}</div>
            </div>
            <div className="rounded-[22px] border border-cyan-400/16 bg-cyan-400/8 px-4 py-4">
              <div className="text-[11px] uppercase tracking-[0.16em] text-cyan-100/70">
                {locale === "zh" ? "Warnings" : "Warnings"}
              </div>
              <div className="mt-2 text-2xl font-semibold text-cyan-50">{summary.warningCount}</div>
            </div>
          </div>
        </Panel>

        <Panel title={locale === "zh" ? "Audit Runtime State" : "Audit Runtime State"} eyebrow="Control Surface">
          <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
            <div className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-4">
              <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                {locale === "zh" ? "Cloud Mode" : "Cloud Mode"}
              </div>
              <div className="mt-2 text-lg font-semibold text-white">{runtimeSummary.cloudMode}</div>
              <div className="mt-2 text-slate-400">{runtimeSummary.databaseProvider}</div>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-4">
              <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                {locale === "zh" ? "Object Store" : "Object Store"}
              </div>
              <div className="mt-2 text-lg font-semibold text-white">{runtimeSummary.objectStorageProvider}</div>
              <div className="mt-2 break-all text-slate-400">{runtimeSummary.syncRoot}</div>
            </div>
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
              }) => (
                <tr key={event.id} className="rounded-2xl bg-white/5">
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
              ))}
            </tbody>
          </table>
          {events.length === 0 ? <p className="pt-4 text-sm text-slate-400">{dict.audit.noEvents}</p> : null}
        </div>
      </Panel>
    </div>
  );
}
