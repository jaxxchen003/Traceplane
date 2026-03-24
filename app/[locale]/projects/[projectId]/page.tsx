import Link from "next/link";
import { notFound } from "next/navigation";

import { ProjectControlPanel } from "@/components/demo-control-panel";
import { GraphTheater } from "@/components/graph-theater";
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

  const graphNodes = [
    {
      id: "project-core",
      label: project.name,
      meta:
        locale === "zh"
          ? `${project.episodes.length} 条 episode 主线`
          : `${project.episodes.length} episode spines`,
      x: 48,
      y: 24,
      z: 0.98,
      tone: "agent" as const
    },
    ...project.agents.slice(0, 3).map((agent: {
      id: string;
      name: string;
      role: string;
      episodesInvolvedCount: number;
    }, index: number) => ({
      id: `agent-${agent.id}`,
      label: agent.name,
      meta:
        locale === "zh"
          ? `${agent.role} · ${agent.episodesInvolvedCount} 条链路`
          : `${agent.role} · ${agent.episodesInvolvedCount} linked episodes`,
      x: [24, 52, 76][index] ?? 30,
      y: 48,
      z: 0.8 - index * 0.08,
      tone: "agent" as const
    })),
    ...project.artifacts.slice(0, 2).map((artifact: {
      id: string;
      title: string;
      type: string;
      generatedByAgent: string;
    }, index: number) => ({
      id: `artifact-${artifact.id}`,
      label: artifact.title,
      meta:
        locale === "zh"
          ? `${artifact.type} · ${artifact.generatedByAgent}`
          : `${artifact.type} · ${artifact.generatedByAgent}`,
      x: index === 0 ? 28 : 72,
      y: 76,
      z: 0.5,
      tone: "artifact" as const
    })),
    {
      id: "policy-node",
      label: locale === "zh" ? "Policy Envelope" : "Policy Envelope",
      meta: project.activePolicyVersion,
      x: 82,
      y: 24,
      z: 0.72,
      tone: "policy" as const
    },
    {
      id: "audit-node",
      label: locale === "zh" ? "Audit Surface" : "Audit Surface",
      meta:
        locale === "zh"
          ? `${project.riskSummary.policyHitCount + project.riskSummary.permissionDeniedCount} 个风险信号`
          : `${project.riskSummary.policyHitCount + project.riskSummary.permissionDeniedCount} risk signals`,
      x: 16,
      y: 24,
      z: 0.72,
      tone: "audit" as const
    }
  ];
  const graphEdges = [
    ...project.agents.slice(0, 3).map((agent: { id: string }) => ({
      from: "project-core",
      to: `agent-${agent.id}`,
      emphasis: "strong" as const
    })),
    ...project.artifacts.slice(0, 2).map((artifact: { id: string }) => ({
      from: "project-core",
      to: `artifact-${artifact.id}`,
      emphasis: "soft" as const
    })),
    { from: "project-core", to: "policy-node", emphasis: "soft" as const },
    { from: "project-core", to: "audit-node", emphasis: "soft" as const }
  ];

  return (
    <div className="space-y-6">
      <GraphTheater
        title={project.name}
        subtitle={
          locale === "zh"
            ? "这里不是项目详情页，而是项目的工作舞台。Agent、政策、产物和审计信号都围绕同一条执行主线被观察。"
            : "This is not a project detail page. It is the operating stage where agents, policy, outputs, and audit signals orbit around one execution spine."
        }
        nodes={graphNodes}
        edges={graphEdges}
        stats={[
          { label: dict.common.policyVersion, value: project.activePolicyVersion },
          {
            label: locale === "zh" ? "Owner" : "Owner",
            value: project.ownerName
          },
          {
            label: locale === "zh" ? "Created" : "Created",
            value: formatDate(project.createdAt, locale)
          }
        ]}
      />

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel title={locale === "zh" ? "Mission Brief" : "Mission Brief"} eyebrow={dict.common.summary}>
          <div className="space-y-5 text-sm leading-7 text-slate-300">
            <div className="flex items-center gap-3">
              <StatusBadge label={dict.statuses[project.status]} raw={project.status} />
              <div className="text-white">{project.description}</div>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-4">
                <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                  {dict.common.policyVersion}
                </div>
                <div className="mt-2 text-base font-semibold text-white">{project.activePolicyVersion}</div>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-4">
                <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                  {dict.common.status}
                </div>
                <div className="mt-2 text-base font-semibold text-white">{project.ownerName}</div>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-4">
                <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Created</div>
                <div className="mt-2 text-base font-semibold text-white">
                  {formatDate(project.createdAt, locale)}
                </div>
              </div>
            </div>
          </div>
        </Panel>

        <Panel title={dict.common.riskSummary} eyebrow={dict.common.risk}>
          <div className="grid gap-3 text-sm text-slate-300">
            <div className="rounded-[20px] border border-rose-400/16 bg-rose-400/8 px-4 py-4">
              {project.riskSummary.permissionDeniedCount} permission denials
            </div>
            <div className="rounded-[20px] border border-amber-400/16 bg-amber-400/8 px-4 py-4">
              {project.riskSummary.policyHitCount} policy hits
            </div>
            <div className="rounded-[20px] border border-fuchsia-400/16 bg-fuchsia-400/8 px-4 py-4">
              {project.riskSummary.failedEpisodeCount} failed episodes
            </div>
            <div className="rounded-[20px] border border-cyan-400/16 bg-cyan-400/8 px-4 py-4">
              {project.riskSummary.pendingApprovalCount} pending approvals
            </div>
            <Link
              href={`/${locale}/audit?projectId=${project.id}`}
              className="mt-2 inline-flex rounded-full border border-white/10 bg-white/6 px-4 py-2 font-medium text-cyan-100"
            >
              {dict.common.viewAudit}
            </Link>
          </div>
        </Panel>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Panel title={dict.projectOverview.agents} eyebrow="Agents">
          <div className="grid gap-3">
            {project.agents.map((agent: {
              id: string;
              name: string;
              role: string;
              episodesInvolvedCount: number;
              artifactsGeneratedCount: number;
            }) => (
              <div key={agent.id} className="rounded-[24px] border border-white/10 bg-white/5 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-white">{agent.name}</div>
                    <div className="mt-1 text-sm text-slate-300">{agent.role}</div>
                  </div>
                  <div className="text-right text-sm text-slate-300">
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
            {project.artifacts.map((artifact: {
              id: string;
              title: string;
              type: string;
              generatedByAgent: string;
              episodeTitle: string;
            }) => (
              <Link key={artifact.id} href={`/${locale}/artifacts/${artifact.id}`} className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-4 hover:border-cyan-300/30">
                <div className="font-medium text-white">{artifact.title}</div>
                <div className="mt-1 text-sm text-slate-300">
                  {artifact.type} · {artifact.generatedByAgent}
                </div>
                <div className="mt-2 text-xs uppercase tracking-[0.15em] text-slate-500">{artifact.episodeTitle}</div>
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
            {project.episodes.map((episode: {
              id: string;
              title: string;
              status: string;
              summary: string;
              primaryAgent: string;
              updatedAt: Date;
              artifactCount: number;
              riskFlag: boolean;
            }) => (
              <Link
                key={episode.id}
                href={`/${locale}/projects/${project.id}/episodes/${episode.id}`}
                className="rounded-[26px] border border-white/10 bg-white/5 px-5 py-5 transition hover:-translate-y-0.5 hover:border-cyan-300/30 hover:bg-white/7"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="mb-2 flex items-center gap-3">
                      <h2 className="text-lg font-semibold text-white">{episode.title}</h2>
                      <StatusBadge label={dict.statuses[episode.status]} raw={episode.status} />
                    </div>
                    <p className="max-w-2xl text-sm leading-7 text-slate-300">{episode.summary}</p>
                  </div>
                  <div className="min-w-[220px] text-sm text-slate-300">
                    <div>{episode.primaryAgent}</div>
                    <div>{formatDate(episode.updatedAt, locale)}</div>
                    <div>{episode.artifactCount} artifacts</div>
                    {episode.riskFlag ? <div className="mt-1 font-semibold text-rose-300">Risk flagged</div> : null}
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
