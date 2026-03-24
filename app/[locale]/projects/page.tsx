import Link from "next/link";
import { notFound } from "next/navigation";

import { GraphTheater } from "@/components/graph-theater";
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
  const riskProjects = projects.filter(
    (item: { riskEventCount: number }) => item.riskEventCount > 0
  ).length;
  const artifactCount = projects.reduce(
    (sum: number, item: { artifactCount: number }) => sum + item.artifactCount,
    0
  );
  const totalEpisodes = projects.reduce(
    (sum: number, item: { episodeCount: number }) => sum + item.episodeCount,
    0
  );
  const graphNodes = projects.flatMap(
    (project: {
      id: string;
      name: string;
      status: string;
      episodeCount: number;
      artifactCount: number;
      riskEventCount: number;
    }, index: number) => [
      {
        id: `${project.id}-project`,
        label: project.name,
        meta:
          locale === "zh"
            ? `${project.episodeCount} 条 episode · ${project.artifactCount} 个产物`
            : `${project.episodeCount} episodes · ${project.artifactCount} artifacts`,
        x: index === 0 ? 30 : 68,
        y: index === 0 ? 28 : 34,
        z: 0.92,
        tone: "agent" as const
      },
      {
        id: `${project.id}-trace`,
        label: locale === "zh" ? "Execution Spine" : "Execution Spine",
        meta:
          locale === "zh"
            ? `${project.status} · ${project.riskEventCount} 风险事件`
            : `${project.status} · ${project.riskEventCount} risk events`,
        x: index === 0 ? 41 : 78,
        y: index === 0 ? 54 : 58,
        z: 0.7,
        tone: "trace" as const
      },
      {
        id: `${project.id}-artifact`,
        label: locale === "zh" ? "Output Cluster" : "Output Cluster",
        meta:
          locale === "zh"
            ? `${project.artifactCount} 个产物在共享`
            : `${project.artifactCount} artifacts in circulation`,
        x: index === 0 ? 19 : 56,
        y: index === 0 ? 68 : 72,
        z: 0.54,
        tone: "artifact" as const
      }
    ]
  );
  const graphEdges = projects.flatMap((project) => [
    { from: `${project.id}-project`, to: `${project.id}-trace`, emphasis: "strong" as const },
    { from: `${project.id}-trace`, to: `${project.id}-artifact`, emphasis: "soft" as const }
  ]);

  return (
    <div className="space-y-6">
      <GraphTheater
        title={workspace?.name ?? "Northwind Agent Ops"}
        subtitle={
          locale === "zh"
            ? "不是从文件夹看项目，而是从 Agent 工作图谱看项目。主舞台展示多项目的执行主线、产物簇和治理信号。"
            : "Do not inspect projects as folders. Inspect them as living work graphs across execution, outputs, and governance signals."
        }
        nodes={graphNodes}
        edges={graphEdges}
        stats={[
          { label: dict.projectList.riskProjects, value: `${riskProjects}` },
          { label: dict.projectList.recentArtifacts, value: `${artifactCount}` },
          {
            label: locale === "zh" ? "活跃任务链" : "Active episodes",
            value: `${totalEpisodes}`
          }
        ]}
      />

      <section className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <Panel title={dict.projectList.title} eyebrow="Command Surface">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-[24px] border border-cyan-400/16 bg-cyan-400/8 px-4 py-4">
              <div className="text-[11px] uppercase tracking-[0.18em] text-cyan-200/80">
                {dict.projectList.riskProjects}
              </div>
              <div className="mt-3 text-3xl font-semibold text-white">{riskProjects}</div>
              <div className="mt-2 text-sm leading-6 text-slate-300">
                {locale === "zh"
                  ? "存在权限拒绝、策略命中或待审批事件。"
                  : "Projects with denials, policy hits, or pending approvals."}
              </div>
            </div>
            <div className="rounded-[24px] border border-emerald-400/16 bg-emerald-400/8 px-4 py-4">
              <div className="text-[11px] uppercase tracking-[0.18em] text-emerald-200/80">
                {dict.projectList.recentArtifacts}
              </div>
              <div className="mt-3 text-3xl font-semibold text-white">{artifactCount}</div>
              <div className="mt-2 text-sm leading-6 text-slate-300">
                {locale === "zh"
                  ? "跨项目累计产物数。"
                  : "Total artifact count across projects."}
              </div>
            </div>
            <div className="rounded-[24px] border border-fuchsia-400/16 bg-fuchsia-400/8 px-4 py-4">
              <div className="text-[11px] uppercase tracking-[0.18em] text-fuchsia-200/80">
                {locale === "zh" ? "治理密度" : "Governance density"}
              </div>
              <div className="mt-3 text-3xl font-semibold text-white">
                {Math.max(1, riskProjects + projects.length)}
              </div>
              <div className="mt-2 text-sm leading-6 text-slate-300">
                {locale === "zh"
                  ? "用风险、产物和 episode 交叉观察工作复杂度。"
                  : "Estimate work complexity from risk, outputs, and active episodes."}
              </div>
            </div>
          </div>
        </Panel>

        <Panel title={locale === "zh" ? "Operator Notes" : "Operator Notes"} eyebrow="Agent First">
          <div className="space-y-4 text-sm leading-7 text-slate-300">
            <p>{dict.projectList.subtitle}</p>
            <p>
              {locale === "zh"
                ? "这里的项目不是静态空间，而是运行中的工作场：Agent 在同一条主线上共享上下文、推进执行并回写产物。"
                : "Projects are not static spaces. They are living workfields where agents share context, execute, and return outputs to the same spine."}
            </p>
          </div>
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
              className="rounded-[28px] border border-white/10 bg-white/5 px-5 py-5 transition hover:-translate-y-0.5 hover:border-cyan-300/30 hover:bg-white/7"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-3">
                    <h2 className="text-xl font-semibold text-white">{project.name}</h2>
                    <StatusBadge label={dict.statuses[project.status]} raw={project.status} />
                  </div>
                  <p className="max-w-2xl text-sm leading-7 text-slate-300">{project.description}</p>
                </div>
                <div className="grid min-w-[280px] grid-cols-2 gap-3 text-sm text-slate-300">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{dict.common.policyVersion}</div>
                    <div className="mt-1 font-medium text-white">{project.activePolicyVersion}</div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{dict.common.status}</div>
                    <div className="mt-1 font-medium text-white">{formatDate(project.lastActiveAt, locale)}</div>
                  </div>
                  <div>{project.agentCount} agents</div>
                  <div>{project.episodeCount} episodes</div>
                  <div>{project.artifactCount} artifacts</div>
                  <div className={project.riskEventCount > 0 ? "font-semibold text-rose-300" : ""}>
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
