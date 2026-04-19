import Link from "next/link";
import { notFound } from "next/navigation";

import { ActionLink, ContinuityCard, PromptBlock } from "@/components/continuity-primitives";
import { ProjectControlPanel } from "@/components/demo-control-panel";
import { GraphBriefing } from "@/components/graph-briefing";
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
  const briefingNodes = [
    {
      id: "project-brief",
      label: project.name,
      meta: project.activePolicyVersion,
      tone: "agent" as const,
      detail:
        locale === "zh"
          ? `${project.description} 当前这个项目更适合作为一个共享 handoff 空间来展示：多个 Agent 围绕同一条项目主线协作，用户最关心的是哪条 episode 可以继续，而不是先看抽象管理层。`
          : `${project.description} This project is best presented as a shared handoff field where multiple agents collaborate on one spine. The first question is which episode can be continued next, not which management metric is highest.`
    },
    ...project.agents.map((agent) => ({
      id: `brief-agent-${agent.id}`,
      label: agent.name,
      meta: agent.role,
      tone: "agent" as const,
      detail:
        locale === "zh"
          ? `${agent.name} 当前参与 ${agent.episodesInvolvedCount} 条任务链，已生成 ${agent.artifactsGeneratedCount} 个产物。这个节点更适合作为“下一位接手者”的候选角色，而不是静态成员列表。`
          : `${agent.name} is active in ${agent.episodesInvolvedCount} episodes and has produced ${agent.artifactsGeneratedCount} artifacts. This node is better presented as a likely next handoff actor than a static team row.`
    })),
    ...project.artifacts.slice(0, 2).map((artifact) => ({
      id: `brief-artifact-${artifact.id}`,
      label: artifact.title,
      meta: artifact.episodeTitle,
      tone: "artifact" as const,
      detail:
        locale === "zh"
          ? `这个产物由 ${artifact.generatedByAgent} 生成，类型为 ${artifact.type}。演示时它更适合被讲成“下一位 Agent 从哪里接着做”的起点，而不是普通附件。`
          : `This artifact was generated by ${artifact.generatedByAgent} as a ${artifact.type}. It should be narrated as the point where the next agent can continue, not as a plain attachment.`
    })),
    {
      id: "brief-risk",
      label: locale === "zh" ? "Risk Surface" : "Risk Surface",
      meta:
        locale === "zh"
          ? `${project.riskSummary.permissionDeniedCount + project.riskSummary.policyHitCount} 个风险信号`
          : `${project.riskSummary.permissionDeniedCount + project.riskSummary.policyHitCount} risk signals`,
      tone: "audit" as const,
      detail:
        locale === "zh"
          ? `这个区域保留项目里的风险和阻塞信号，但第一层产品里，它应该服务于“下一步如何继续”这个问题，而不是抢走 continuity 主叙事。`
          : `This surface preserves risk and blockage signals in the project, but in the first tier it should serve the question of how to continue next instead of taking over the continuity narrative.`
    }
  ];

  const handoffCandidate = project.episodes.find(
    (episode: { status: string }) => episode.status === "IN_REVIEW" || episode.status === "COMPLETED"
  ) ?? project.episodes[0] ?? null;
  const handoffStarter = handoffCandidate
    ? locale === "zh"
      ? [
          `项目：${project.name}`,
          `优先继续的主线：${handoffCandidate.title}`,
          `当前执行者：${handoffCandidate.primaryAgent}`,
          `状态：${handoffCandidate.status}`,
          `目标摘要：${handoffCandidate.summary}`,
          "动作：打开这条 Episode，先读取 handoff brief，再把 brief 交给下一位 Agent 继续。"
        ].join("\n")
      : [
          `Project: ${project.name}`,
          `Best spine to continue: ${handoffCandidate.title}`,
          `Current actor: ${handoffCandidate.primaryAgent}`,
          `Status: ${handoffCandidate.status}`,
          `Goal summary: ${handoffCandidate.summary}`,
          "Action: open this episode, read the handoff brief, then pass the brief to the next agent."
        ].join("\n")
    : null;

  return (
    <div className="space-y-6">
      <GraphTheater
        title={project.name}
        subtitle={
          locale === "zh"
            ? "这里不是传统项目详情页，而是一个 continuity 舞台。你应该能在这里立刻看出：哪个 Agent 接入了、哪条 episode 可以继续、从哪个产物开始 handoff。"
            : "This is not a traditional project detail page. It is a continuity stage where you should immediately see which agents are connected, which episode can continue, and which artifact should start the next handoff."
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
        <GraphBriefing
          title={locale === "zh" ? "Mission Brief" : "Mission Brief"}
          emptyLabel={dict.common.noData}
          nodes={briefingNodes}
        />

        <div className="space-y-4">
          <Panel title={locale === "zh" ? "Best Next Handoff" : "Best Next Handoff"} eyebrow="Continue From Here">
            {handoffCandidate ? (
              <div className="space-y-4 text-sm leading-7 text-ink-muted">
                <ContinuityCard
                  label={locale === "zh" ? "优先继续的主线" : "Best spine to continue"}
                  title={handoffCandidate.title}
                  detail={handoffCandidate.summary}
                  tone="cyan"
                />

                <div className="grid gap-3 md:grid-cols-2">
                  <ContinuityCard
                    label={locale === "zh" ? "当前执行者" : "Current actor"}
                    title={handoffCandidate.primaryAgent}
                  />
                  <ContinuityCard
                    label={locale === "zh" ? "产物数量" : "Artifacts"}
                    title={handoffCandidate.artifactCount}
                  />
                </div>

                <ContinuityCard
                  label={locale === "zh" ? "交接动作" : "Handoff action"}
                  detail={
                    locale === "zh"
                      ? "打开这条 Episode，直接读取 handoff brief，把它交给下一位 Agent 继续。"
                      : "Open this episode, read the handoff brief, and give it to the next agent to continue."
                  }
                  tone="emerald"
                />

                {handoffStarter ? <PromptBlock label={locale === "zh" ? "Project Handoff Starter" : "Project Handoff Starter"} content={handoffStarter} /> : null}

                <div className="flex flex-wrap gap-2 pt-1">
                  <ActionLink href={`/${locale}/projects/${project.id}/episodes/${handoffCandidate.id}`}>
                    {locale === "zh" ? "打开 handoff brief" : "Open handoff brief"}
                  </ActionLink>
                  <ActionLink href={`/${locale}/connect`} tone="secondary">
                    {locale === "zh" ? "连接下一个 Agent" : "Connect the next agent"}
                  </ActionLink>
                </div>
              </div>
            ) : (
              <div className="text-sm text-ink-faint">{dict.projectOverview.noEpisodes}</div>
            )}
          </Panel>

          <Panel title={dict.common.riskSummary} eyebrow={dict.common.risk}>
            <div className="grid gap-3 text-sm text-ink-muted">
              <div className="rounded-[20px] border border-signal-error-400/16 bg-signal-error-400/8 px-4 py-4">
                {project.riskSummary.permissionDeniedCount} permission denials
              </div>
              <div className="rounded-[20px] border border-signal-warning-400/16 bg-signal-warning-400/8 px-4 py-4">
                {project.riskSummary.policyHitCount} policy hits
              </div>
              <div className="rounded-[20px] border border-fuchsia-400/16 bg-fuchsia-400/8 px-4 py-4">
                {project.riskSummary.failedEpisodeCount} failed episodes
              </div>
              <div className="rounded-[20px] border border-signal-info-400/16 bg-signal-info-400/8 px-4 py-4">
                {project.riskSummary.pendingApprovalCount} pending approvals
              </div>
              <Link
                href={`/${locale}/audit?projectId=${project.id}`}
                className="mt-2 inline-flex rounded-full border border-white/10 bg-white/6 px-4 py-2 font-medium text-signal-info-100"
              >
                {dict.common.viewAudit}
              </Link>
            </div>
          </Panel>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Panel title={locale === "zh" ? "Project Runtime Posture" : "Project Runtime Posture"} eyebrow="Runtime">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-[20px] border border-signal-info-400/16 bg-signal-info-400/8 px-4 py-4">
              <div className="text-[11px] uppercase tracking-[0.18em] text-signal-info-200/80">
                {locale === "zh" ? "云端模式" : "Cloud mode"}
              </div>
              <div className="mt-2 text-base font-medium text-white">{project.runtimeSummary.cloudMode}</div>
            </div>
            <div className="rounded-[20px] border border-signal-success-400/16 bg-signal-success-400/8 px-4 py-4">
              <div className="text-[11px] uppercase tracking-[0.18em] text-signal-success-200/80">
                {locale === "zh" ? "对象存储" : "Object storage"}
              </div>
              <div className="mt-2 text-base font-medium text-white">{project.runtimeSummary.objectStorageProvider}</div>
            </div>
            <div className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-4">
              <div className="text-[11px] uppercase tracking-[0.18em] text-ink-ghost">
                {locale === "zh" ? "R2 覆盖" : "R2 coverage"}
              </div>
              <div className="mt-2 text-2xl font-semibold text-white">
                {project.runtimeSummary.r2ArtifactCount}
              </div>
              <div className="mt-1 text-sm text-ink-faint">
                {locale === "zh"
                  ? `其余 ${project.runtimeSummary.inlineArtifactCount} 个产物仍以内联方式存在`
                  : `${project.runtimeSummary.inlineArtifactCount} artifacts still remain inline`}
              </div>
            </div>
            <div className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-4">
              <div className="text-[11px] uppercase tracking-[0.18em] text-ink-ghost">
                {locale === "zh" ? "本地投影" : "Local projection"}
              </div>
              <div className="mt-2 text-base font-medium text-white">
                {project.runtimeSummary.projectionExists
                  ? locale === "zh"
                    ? "已检测到项目本地投影"
                    : "Project projection detected"
                  : locale === "zh"
                    ? "尚未检测到项目本地投影"
                    : "Project projection not detected"}
              </div>
              <div className="mt-1 text-sm text-ink-faint">{project.runtimeSummary.projectionRoot}</div>
            </div>
          </div>
        </Panel>

        <Panel title={locale === "zh" ? "Continuity Summary" : "Continuity Summary"} eyebrow="Episode Network">
          <div className="grid gap-3 text-sm text-ink-muted">
            <div className="rounded-[20px] border border-signal-info-400/16 bg-signal-info-400/8 px-4 py-4">
              <div className="text-[11px] uppercase tracking-[0.18em] text-signal-info-200/80">
                {locale === "zh" ? "关系更新" : "Relationship updates"}
              </div>
              <div className="mt-2 text-2xl font-semibold text-white">{project.continuitySummary.dependsOnCount}</div>
            </div>
            <div className="rounded-[20px] border border-signal-warning-400/16 bg-signal-warning-400/8 px-4 py-4">
              <div className="text-[11px] uppercase tracking-[0.18em] text-signal-warning-200/80">
                {locale === "zh" ? "Review 压力" : "Review pressure"}
              </div>
              <div className="mt-2 text-2xl font-semibold text-white">{project.continuitySummary.reviewPressureCount}</div>
            </div>
            <div className="rounded-[20px] border border-signal-error-400/16 bg-signal-error-400/8 px-4 py-4">
              <div className="text-[11px] uppercase tracking-[0.18em] text-signal-error-200/80">
                {locale === "zh" ? "失败链路" : "Failed spines"}
              </div>
              <div className="mt-2 text-2xl font-semibold text-white">{project.continuitySummary.failedEpisodesCount}</div>
            </div>
            <div className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-4 text-ink-muted">
              {locale === "zh"
                ? "Project 不再只是项目详情，它要把 host 接入、存储覆盖率和 episode continuity 压成一个能指导 handoff 的总览面。"
                : "Project Overview should compress host adoption, storage coverage, and episode continuity into one surface that guides the next handoff."}
            </div>
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
                    <div className="mt-1 text-sm text-ink-muted">{agent.role}</div>
                  </div>
                  <div className="text-right text-sm text-ink-muted">
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
              <Link key={artifact.id} href={`/${locale}/artifacts/${artifact.id}`} className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-4 hover:border-signal-info-300/30">
                <div className="font-medium text-white">{artifact.title}</div>
                <div className="mt-1 text-sm text-ink-muted">
                  {artifact.type} · {artifact.generatedByAgent}
                </div>
                <div className="mt-2 text-xs uppercase tracking-[0.15em] text-ink-ghost">{artifact.episodeTitle}</div>
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
                className="rounded-[26px] border border-white/10 bg-white/5 px-5 py-5 transition hover:-translate-y-0.5 hover:border-signal-info-300/30 hover:bg-white/7"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="mb-2 flex items-center gap-3">
                      <h2 className="text-lg font-semibold text-white">{episode.title}</h2>
                      <StatusBadge label={dict.statuses[episode.status]} raw={episode.status} />
                    </div>
                    <p className="max-w-2xl text-sm leading-7 text-ink-muted">{episode.summary}</p>
                  </div>
                  <div className="min-w-[220px] text-sm text-ink-muted">
                    <div>{episode.primaryAgent}</div>
                    <div>{formatDate(episode.updatedAt, locale)}</div>
                    <div>{episode.artifactCount} artifacts</div>
                    {episode.riskFlag ? <div className="mt-1 font-semibold text-signal-error-300">Risk flagged</div> : null}
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
