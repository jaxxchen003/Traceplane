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
  const [dict, events] = await Promise.all([
    Promise.resolve(getDictionary(locale)),
    getAuditEvents({ locale, projectId, episodeId })
  ]);

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] border border-white/60 bg-slate-950 px-6 py-7 text-white shadow-[0_30px_80px_rgba(15,23,42,0.2)]">
        <div className="text-[11px] uppercase tracking-[0.26em] text-amber-200/80">{dict.audit.title}</div>
        <h1 className="mt-3 text-3xl font-semibold">{dict.common.auditTrail}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">{dict.audit.subtitle}</p>
      </section>

      <Panel title={dict.audit.title} eyebrow="Audit">
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-3 text-left">
            <thead className="text-xs uppercase tracking-[0.16em] text-slate-400">
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
                <tr key={event.id} className="rounded-2xl bg-white">
                  <td className="rounded-l-2xl px-3 py-4">
                    <div className="space-y-2">
                      <StatusBadge label={event.result} raw={event.result} />
                      <div className="text-xs text-slate-500">{formatDate(event.occurredAt, locale)}</div>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-sm text-slate-700">{event.action}</td>
                  <td className="px-3 py-4 text-sm text-slate-700">{event.actorType} · {event.actorId.slice(-6)}</td>
                  <td className="px-3 py-4 text-sm text-slate-700">{event.targetType} · {event.targetId.slice(-8)}</td>
                  <td className="px-3 py-4 text-sm text-slate-700">{event.permissionDecision ?? "allow"}</td>
                  <td className="rounded-r-2xl px-3 py-4 text-sm text-slate-700">
                    {event.policyHitReason || event.denyReason || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {events.length === 0 ? <p className="pt-4 text-sm text-slate-600">{dict.audit.noEvents}</p> : null}
        </div>
      </Panel>
    </div>
  );
}
