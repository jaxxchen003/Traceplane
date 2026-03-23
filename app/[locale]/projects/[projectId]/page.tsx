import Link from "next/link";
import { notFound } from "next/navigation";

import { ProjectControlPanel } from "@/components/demo-control-panel";
import { Panel } from "@/components/panel";
import { StatusBadge } from "@/components/status-badge";
import { formatDate } from "@/lib/format";
import { getProjectAgents, getProjectOverview } from "@/lib/demo-data";
import { getDictionary, isLocale } from "@/lib/i18n";

export default async function ProjectOverviewPage({
  params
}: {
  params: Promise<{ locale: string; projectId: string }>;
}) {
  const { locale, projectId } = await params;
  if (!isLocale(locale)) notFound();

  const [project, agents, dict] = await Promise.all([
    getProjectOverview(projectId, locale),
    getProjectAgents(projectId, locale),
    Promise.resolve(getDictionary(locale))
  ]);
  if (!project) notFound();

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-[30px] border border-white/60 bg-white/90 px-6 py-7 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="mb-3 flex items-center gap-3">
            <h1 className="text-3xl font-semibold text-slate-950">{project.name}</h1>
            <StatusBadge label={dict.statuses[project.status]} raw={project.status} />
          </div>
          <p className="max-w-3xl text-sm leading-7 text-slate-600">{project.description}</p>
          <div className="mt-5 grid gap-3 text-sm text-slate-600 lg:grid-cols-3">
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400">{dict.common.policyVersion}</div>
              <div className="mt-1 font-medium text-slate-900">{project.activePolicyVersion}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400">{dict.common.status}</div>
              <div className="mt-1 font-medium text-slate-900">{project.ownerName}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Created</div>
              <div className="mt-1 font-medium text-slate-900">{formatDate(project.createdAt, locale)}</div>
            </div>
          </div>
        </div>

        <Panel title={dict.common.riskSummary} eyebrow={dict.common.risk}>
          <div className="grid gap-3 text-sm text-slate-700">
            <div>{project.riskSummary.permissionDeniedCount} permission denials</div>
            <div>{project.riskSummary.policyHitCount} policy hits</div>
            <div>{project.riskSummary.failedEpisodeCount} failed episodes</div>
            <div>{project.riskSummary.pendingApprovalCount} pending approvals</div>
            <Link href={`/${locale}/audit?projectId=${project.id}`} className="mt-2 font-medium text-amber-700">
              {dict.common.viewAudit}
            </Link>
          </div>
        </Panel>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Panel title={dict.projectOverview.agents} eyebrow="Agents">
          <div className="grid gap-3">
            {project.agents.map((agent) => (
              <div key={agent.id} className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-slate-950">{agent.name}</div>
                    <div className="mt-1 text-sm text-slate-600">{agent.role}</div>
                  </div>
                  <div className="text-right text-sm text-slate-600">
                    <div>{agent.episodesInvolvedCount} episodes</div>
                    <div>{agent.artifactsGeneratedCount} artifacts</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title={dict.common.recentArtifacts} eyebrow={dict.common.artifacts}>
          <div className="grid gap-3">
            {project.artifacts.map((artifact) => (
              <Link key={artifact.id} href={`/${locale}/artifacts/${artifact.id}`} className="rounded-[20px] border border-slate-200 bg-white px-4 py-4 hover:border-slate-900">
                <div className="font-medium text-slate-950">{artifact.title}</div>
                <div className="mt-1 text-sm text-slate-600">
                  {artifact.type} · {artifact.generatedByAgent}
                </div>
                <div className="mt-2 text-xs uppercase tracking-[0.15em] text-slate-400">{artifact.episodeTitle}</div>
              </Link>
            ))}
          </div>
        </Panel>
      </div>

      <ProjectControlPanel locale={locale} projectId={project.id} policyVersion={project.activePolicyVersion} agents={agents} />

      <Panel title={dict.common.recentEpisodes} eyebrow="Episodes">
        {project.episodes.length === 0 ? (
          <p className="text-sm text-slate-600">{dict.projectOverview.noEpisodes}</p>
        ) : (
          <div className="grid gap-4">
            {project.episodes.map((episode) => (
              <Link
                key={episode.id}
                href={`/${locale}/projects/${project.id}/episodes/${episode.id}`}
                className="rounded-[24px] border border-slate-200 bg-white px-5 py-5 transition hover:-translate-y-0.5 hover:border-slate-900"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="mb-2 flex items-center gap-3">
                      <h2 className="text-lg font-semibold text-slate-950">{episode.title}</h2>
                      <StatusBadge label={dict.statuses[episode.status]} raw={episode.status} />
                    </div>
                    <p className="max-w-2xl text-sm leading-6 text-slate-600">{episode.summary}</p>
                  </div>
                  <div className="min-w-[220px] text-sm text-slate-600">
                    <div>{episode.primaryAgent}</div>
                    <div>{formatDate(episode.updatedAt, locale)}</div>
                    <div>{episode.artifactCount} artifacts</div>
                    {episode.riskFlag ? <div className="mt-1 font-semibold text-rose-700">Risk flagged</div> : null}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
