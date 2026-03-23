import Link from "next/link";
import { notFound } from "next/navigation";

import { EpisodeControlPanel } from "@/components/demo-control-panel";
import { Panel } from "@/components/panel";
import { StatusBadge } from "@/components/status-badge";
import { formatDate, formatDuration } from "@/lib/format";
import { getEpisodeReview, getProjectAgents } from "@/lib/demo-data";
import { getDictionary, isLocale } from "@/lib/i18n";

export default async function EpisodeReviewPage({
  params
}: {
  params: Promise<{ locale: string; projectId: string; episodeId: string }>;
}) {
  const { locale, projectId, episodeId } = await params;
  if (!isLocale(locale)) notFound();

  const [episode, agents] = await Promise.all([
    getEpisodeReview(episodeId, locale),
    getProjectAgents(projectId, locale)
  ]);
  if (!episode || episode.projectId !== projectId) notFound();

  const dict = getDictionary(locale);

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] border border-white/60 bg-slate-950 px-6 py-7 text-white shadow-[0_30px_80px_rgba(15,23,42,0.2)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <h1 className="text-3xl font-semibold">{episode.title}</h1>
              <StatusBadge label={dict.statuses[episode.status]} raw={episode.status} />
            </div>
            <p className="max-w-3xl text-sm leading-7 text-slate-300">{episode.summary}</p>
          </div>
          <div className="grid min-w-[320px] grid-cols-2 gap-4 text-sm text-slate-300">
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-amber-200/70">{dict.common.project}</div>
              <div className="mt-1 font-medium text-white">{episode.projectName}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-amber-200/70">{dict.common.policyVersion}</div>
              <div className="mt-1 font-medium text-white">{episode.policyVersion}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-amber-200/70">{dict.common.startedAt}</div>
              <div className="mt-1 font-medium text-white">{formatDate(episode.startedAt, locale)}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-amber-200/70">{dict.common.duration}</div>
              <div className="mt-1 font-medium text-white">{formatDuration(episode.startedAt, episode.endedAt)}</div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
        <div className="space-y-6">
          <Panel title={dict.common.timeline} eyebrow={dict.episode.title}>
            <div className="space-y-4">
              {episode.timeline.map((item) => (
                <div key={item.id} className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-5">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="mb-2 flex items-center gap-3">
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          Step {item.stepIndex}
                        </div>
                        <StatusBadge label={dict.statuses[item.status]} raw={item.status} />
                      </div>
                      <h2 className="text-lg font-semibold text-slate-950">{item.stepTitle}</h2>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{item.shortResult}</p>
                    </div>
                    <div className="min-w-[220px] text-sm text-slate-600">
                      <div>{item.actor}</div>
                      <div>{formatDate(item.eventTime, locale)}</div>
                      {item.toolName ? <div>{item.toolName}</div> : null}
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 text-sm text-slate-700 lg:grid-cols-2">
                    {item.inputSummary ? <div><span className="font-medium">Input:</span> {item.inputSummary}</div> : null}
                    {item.decisionSummary ? <div><span className="font-medium">Decision:</span> {item.decisionSummary}</div> : null}
                    {item.resultSummary ? <div><span className="font-medium">Result:</span> {item.resultSummary}</div> : null}
                    {item.errorSummary ? <div className="text-rose-700"><span className="font-medium">Error:</span> {item.errorSummary}</div> : null}
                    {item.policyHitReason ? <div className="text-amber-700"><span className="font-medium">Policy:</span> {item.policyHitReason}</div> : null}
                    {item.permissionDeniedReason ? <div className="text-rose-700"><span className="font-medium">Denied:</span> {item.permissionDeniedReason}</div> : null}
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title={dict.episode.relationshipMap} eyebrow="Edges">
            <div className="grid gap-3 text-sm text-slate-700">
              {episode.relationships.map((edge) => (
                <div key={edge.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <span className="font-medium text-slate-900">{edge.edgeType}</span>
                  <span className="mx-2 text-slate-400">·</span>
                  <span>{edge.fromNodeType}:{edge.fromNodeId.slice(-6)}</span>
                  <span className="mx-2 text-slate-400">→</span>
                  <span>{edge.toNodeType}:{edge.toNodeId.slice(-6)}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title={dict.controls.continueEpisode} eyebrow="Write Path">
            <EpisodeControlPanel
              locale={locale}
              episodeId={episode.id}
              projectId={projectId}
              agents={agents}
              traces={episode.timeline.map((item) => ({
                id: item.id,
                label: `Step ${item.stepIndex} · ${item.stepTitle}`
              }))}
              memories={episode.memories.map((item) => ({
                id: item.id,
                label: item.title
              }))}
            />
          </Panel>

          <Panel title={dict.common.summary} eyebrow={dict.episode.goal}>
            <div className="space-y-4 text-sm leading-6 text-slate-700">
              <div>{episode.goal}</div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="mb-2 text-[11px] uppercase tracking-[0.18em] text-slate-400">{dict.episode.finalOutcome}</div>
                <div>{episode.finalOutcome}</div>
              </div>
              <div>
                <div className="mb-2 text-[11px] uppercase tracking-[0.18em] text-slate-400">{dict.common.participatingAgents}</div>
                <div>{episode.participatingAgents.join(" · ")}</div>
              </div>
            </div>
          </Panel>

          <Panel title={dict.common.memories} eyebrow="Memory">
            <div className="space-y-3">
              {episode.memories.map((memory) => (
                <div key={memory.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                  <div className="font-medium text-slate-950">{memory.title}</div>
                  <div className="mt-1 text-sm leading-6 text-slate-600">{memory.content}</div>
                  <div className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-400">
                    {memory.type} · {memory.sensitivity} · {memory.usedInStepCount} steps
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title={dict.common.artifacts} eyebrow="Outputs">
            <div className="space-y-3">
              {episode.artifacts.map((artifact) => (
                <Link
                  key={artifact.id}
                  href={`/${locale}/artifacts/${artifact.id}`}
                  className="block rounded-2xl border border-slate-200 bg-white px-4 py-4 hover:border-slate-900"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-slate-950">{artifact.title}</div>
                      <div className="mt-1 text-sm text-slate-600">{artifact.generatedBy}</div>
                    </div>
                    <div className="text-right text-xs uppercase tracking-[0.16em] text-slate-400">
                      {artifact.type} v{artifact.version}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Panel>

          <Panel title={dict.episode.auditSummary} eyebrow={dict.common.auditTrail}>
            <div className="grid gap-3 text-sm text-slate-700">
              <div>{episode.auditSummary.readCount} reads</div>
              <div>{episode.auditSummary.writeCount} writes</div>
              <div>{episode.auditSummary.permissionDeniedCount} denials</div>
              <div>{episode.auditSummary.policyHitCount} policy hits</div>
              <Link href={`/${locale}/audit?episodeId=${episode.id}`} className="mt-2 font-medium text-amber-700">
                {dict.common.viewAudit}
              </Link>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
