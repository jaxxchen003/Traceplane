import Link from "next/link";
import { notFound } from "next/navigation";

import { Panel } from "@/components/panel";
import { StatusBadge } from "@/components/status-badge";
import { formatDate } from "@/lib/format";
import { getProjects, getWorkspaceSummary } from "@/lib/demo-data";
import { getDictionary, isLocale } from "@/lib/i18n";

export default async function ProjectsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [workspace, projects] = await Promise.all([getWorkspaceSummary(), getProjects(locale)]);
  const dict = getDictionary(locale);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[1.6fr_1fr_1fr]">
        <div className="rounded-[30px] border border-white/60 bg-slate-950 px-6 py-7 text-white shadow-[0_30px_80px_rgba(15,23,42,0.18)]">
          <div className="text-[11px] uppercase tracking-[0.28em] text-amber-200/80">{dict.projectList.title}</div>
          <h1 className="mt-3 text-3xl font-semibold">{workspace?.name}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">{dict.projectList.subtitle}</p>
        </div>
        <Panel title={`${projects.filter((item) => item.riskEventCount > 0).length}`} eyebrow={dict.projectList.riskProjects}>
          <div className="text-sm leading-6 text-slate-600">{locale === "zh" ? "存在权限拒绝、策略命中或待审批事件。" : "Projects with denials, policy hits, or pending approvals."}</div>
        </Panel>
        <Panel title={`${projects.reduce((sum, item) => sum + item.artifactCount, 0)}`} eyebrow={dict.projectList.recentArtifacts}>
          <div className="text-sm leading-6 text-slate-600">{locale === "zh" ? "跨项目累计产物数。" : "Total artifact count across projects."}</div>
        </Panel>
      </section>

      <Panel title={dict.common.allProjects} eyebrow={dict.common.project}>
        <div className="grid gap-4">
          {projects.map((project: {
            id: string;
            name: string;
            status: string;
            description: string;
            activePolicyVersion: string;
            lastActiveAt: Date;
            agentCount: number;
            episodeCount: number;
            artifactCount: number;
            riskEventCount: number;
          }) => (
            <Link
              key={project.id}
              href={`/${locale}/projects/${project.id}`}
              className="rounded-[26px] border border-slate-200 bg-white px-5 py-5 transition hover:-translate-y-0.5 hover:border-slate-900"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-3">
                    <h2 className="text-xl font-semibold text-slate-950">{project.name}</h2>
                    <StatusBadge label={dict.statuses[project.status]} raw={project.status} />
                  </div>
                  <p className="max-w-2xl text-sm leading-6 text-slate-600">{project.description}</p>
                </div>
                <div className="grid min-w-[280px] grid-cols-2 gap-3 text-sm text-slate-600">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{dict.common.policyVersion}</div>
                    <div className="mt-1 font-medium text-slate-900">{project.activePolicyVersion}</div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{dict.common.status}</div>
                    <div className="mt-1 font-medium text-slate-900">{formatDate(project.lastActiveAt, locale)}</div>
                  </div>
                  <div>{project.agentCount} agents</div>
                  <div>{project.episodeCount} episodes</div>
                  <div>{project.artifactCount} artifacts</div>
                  <div className={project.riskEventCount > 0 ? "font-semibold text-rose-700" : ""}>
                    {project.riskEventCount} risk events
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Panel>
    </div>
  );
}
