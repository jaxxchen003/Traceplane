import Link from \"next/link\";
import { notFound } from \"next/navigation\";

import { ActionLink, ContinuityCard, MetricCard, PromptBlock, TimelineEntry, TokenList } from \"@/components/continuity-primitives\";
import { EpisodeControlPanel } from \"@/components/demo-control-panel\";
import { GraphBriefing } from \"@/components/graph-briefing\";
import { GraphTheater } from \"@/components/graph-theater\";
import { Panel } from \"@/components/panel\";
import { RelationshipFlow } from \"@/components/relationship-flow\";
import { StatusBadge } from \"@/components/status-badge\";
import { StateInspector } from \"@/components/state-inspector\";
import { formatDate, formatDuration } from \"@/lib/format\";
import { getEpisodeReview, getProjectAgents } from \"@/lib/demo-data\";
import { getDictionary, isLocale } from \"@/lib/i18n\";
import { useState } from \"react\";


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
  const graphNodes = [
    {
      id: "episode-core",
      label: episode.title,
      meta:
        locale === "zh"
          ? `${episode.timeline.length} 个执行事件`
          : `${episode.timeline.length} execution events`,
      x: 50,
      y: 22,
      z: 0.98,
      tone: "agent" as const
    },
    ...episode.memories.slice(0, 3).map((memory: {
      id: string;
      title: string;
      type: string;
      sensitivity: string;
    }, index: number) => ({
      id: `memory-${memory.id}`,
      label: memory.title,
      meta:
        locale === "zh"
          ? `${memory.type} · ${memory.sensitivity}`
          : `${memory.type} · ${memory.sensitivity}`,
      x: [20, 38, 78][index] ?? 22,
      y: [34, 56, 40][index] ?? 36,
      z: 0.78 - index * 0.1,
      tone: "memory" as const
    })),
    ...episode.timeline.slice(0, 3).map((trace: {
      id: string;
      stepIndex: number;
      stepTitle: string;
      actor: string;
    }, index: number) => ({
      id: `trace-${trace.id}`,
      label: `Step ${trace.stepIndex}`,
      meta: `${trace.stepTitle} · ${trace.actor}`,
      x: [46, 62, 76][index] ?? 48,
      y: [52, 66, 52][index] ?? 58,
      z: 0.7 - index * 0.08,
      tone: "trace" as const
    })),
    ...episode.artifacts.slice(0, 2).map((artifact: {
      id: string;
      title: string;
      type: string;
      version: number;
    }, index: number) => ({
      id: `artifact-${artifact.id}`,
      label: artifact.title,
      meta: `${artifact.type} · v${artifact.version}`,
      x: index === 0 ? 28 : 70,
      y: 82,
      z: 0.52,
      tone: "artifact" as const
    })),
    {
      id: "policy-node",
      label: locale === "zh" ? "Policy Envelope" : "Policy Envelope",
      meta: episode.policyVersion,
      x: 84,
      y: 26,
      z: 0.72,
      tone: "policy" as const
    },
    {
      id: "audit-node",
      label: locale === "zh" ? "Audit Signals" : "Audit Signals",
      meta:
        locale === "zh"
          ? `${episode.auditSummary.policyHitCount + episode.auditSummary.permissionDeniedCount} 个命中`
          : `${episode.auditSummary.policyHitCount + episode.auditSummary.permissionDeniedCount} hits`,
      x: 14,
      y: 70,
      z: 0.62,
      tone: "audit" as const
    }
  ];
  const graphEdges = [
    ...episode.memories.slice(0, 3).map((memory: { id: string }) => ({
      from: `memory-${memory.id}`,
      to: "episode-core",
      emphasis: "soft" as const
    })),
    ...episode.timeline.slice(0, 3).map((trace: { id: string }) => ({
      from: "episode-core",
      to: `trace-${trace.id}`,
      emphasis: "strong" as const
    })),
    ...episode.artifacts.slice(0, 2).map((artifact: { id: string }) => ({
      from: `trace-${episode.timeline[0]?.id ?? ""}`,
      to: `artifact-${artifact.id}`,
      emphasis: "soft" as const
    })),
    { from: "episode-core", to: "policy-node", emphasis: "soft" as const },
    { from: "episode-core", to: "audit-node", emphasis: "soft" as const }
  ].filter((edge) => !edge.from.endsWith("-"));
  const briefingNodes = [
    {
      id: "brief-episode",
      label: episode.title,
      meta: episode.projectName,
      tone: "agent" as const,
      detail:
        locale === "zh"
          ? `${episode.summary} 这个 episode 的核心目标是：${episode.goal}。在演示里，它应该被讲成一条完整的工作链，而不是若干日志片段。`
          : `${episode.summary} The core objective of this episode is: ${episode.goal}. In the demo it should be narrated as one full work line, not a loose set of logs.`
    },
    ...episode.memories.slice(0, 3).map((memory) => ({
      id: `brief-memory-${memory.id}`,
      label: memory.title,
      meta: `${memory.type} · ${memory.sensitivity}`,
      tone: "memory" as const,
      detail:
        locale === "zh"
          ? `${memory.content} 这条 memory 被用于 ${memory.usedInStepCount} 个步骤，是执行链里的真实上下文节点。`
          : `${memory.content} This memory was used in ${memory.usedInStepCount} steps and behaves like a real context node in the execution chain.`
    })),
    ...episode.timeline.slice(0, 3).map((item) => ({
      id: `brief-trace-${item.id}`,
      label: `Step ${item.stepIndex} · ${item.stepTitle}`,
      meta: item.actor,
      tone: "trace" as const,
      detail:
        locale === "zh"
          ? `${item.shortResult} ${item.decisionSummary ?? ""} ${item.resultSummary ?? ""}`.trim()
          : `${item.shortResult} ${item.decisionSummary ?? ""} ${item.resultSummary ?? ""}`.trim()
    })),
    ...episode.artifacts.slice(0, 2).map((artifact) => ({
      id: `brief-artifact-${artifact.id}`,
      label: artifact.title,
      meta: `${artifact.type} · v${artifact.version}`,
      tone: "artifact" as const,
      detail:
        locale === "zh"
          ? `由 ${artifact.generatedBy} 生成。这个产物代表了工作图谱里的输出层，它应该能被追溯、复用并继续被消费。`
          : `Generated by ${artifact.generatedBy}. This artifact represents the output layer of the work graph and should be traceable, reusable, and further consumed.`
    })),
    {
      id: "brief-audit",
      label: locale === "zh" ? "Audit Surface" : "Audit Surface",
      meta:
        locale === "zh"
          ? `${episode.auditSummary.readCount} reads · ${episode.auditSummary.writeCount} writes`
          : `${episode.auditSummary.readCount} reads · ${episode.auditSummary.writeCount} writes`,
      tone: "audit" as const,
      detail:
        locale === "zh"
          ? `这一层把 ${episode.auditSummary.permissionDeniedCount} 个 denial 和 ${episode.auditSummary.policyHitCount} 个 policy hit 收束成可回看的执行证据，让下一个 Agent 或使用者知道这条 spine 哪里需要小心。`
          : `This layer turns ${episode.auditSummary.permissionDeniedCount} denials and ${episode.auditSummary.policyHitCount} policy hits into replayable execution evidence so the next agent knows where this spine needs caution.`
    }
  ];

  return (
    <div className="space-y-6">
      <GraphTheater
        title={episode.title}
        subtitle={
          locale === "zh"
            ? "这个舞台把 memory、execution、artifacts、policy 和 audit 压到同一个视图里。上层是空间关系，下层仍保留结构化管理和复盘。"
            : "This stage compresses memory, execution, artifacts, policy, and audit into one view, then pairs it with structured management below."
        }
        nodes={graphNodes}
        edges={graphEdges}
        stats={[
          { label: dict.common.project, value: episode.projectName },
          { label: dict.common.policyVersion, value: episode.policyVersion },
          {
            label: dict.common.duration,
            value: formatDuration(episode.startedAt, episode.endedAt)
          }
        ]}
      />

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <GraphBriefing
          title={locale === "zh" ? "Episode Brief" : "Episode Brief"}
          emptyLabel={dict.common.noData}
          nodes={briefingNodes}
        />

        <div className="space-y-4">
          <Panel title={locale === "zh" ? "Next Agent Handoff" : "Next Agent Handoff"} eyebrow="Brief">
            <div className="space-y-4 text-sm leading-7 text-slate-300">
              <ContinuityCard
                label={locale === "zh" ? "最新一步" : "Latest step"}
                title={episode.handoffSummary.latestStepTitle}
                detail={episode.handoffSummary.latestResult}
                tone="cyan"
              />

              <div className="grid gap-3 md:grid-cols-2">
                <MetricCard
                  label={locale === "zh" ? "最新产物" : "Latest artifact"}
                  value={episode.handoffSummary.latestArtifactTitle}
                />
                <MetricCard
                  label={locale === "zh" ? "可交接状态" : "Handoff state"}
                  value={
                    episode.handoffSummary.readyForHandoff
                      ? locale === "zh"
                        ? "可以直接交给下一位 Agent"
                        : "Ready to hand to the next agent"
                      : locale === "zh"
                        ? "还不适合交接"
                        : "Not ready for handoff yet"
                  }
                />
              </div>

              <ContinuityCard
                label={locale === "zh" ? "下一步建议" : "Next action"}
                detail={episode.handoffSummary.nextAction}
                tone="emerald"
              />

              {episode.handoffSummary.memoryTitles.length > 0 ? (
                <ContinuityCard label={locale === "zh" ? "交接时优先带上" : "Bring into handoff"}>
                  <TokenList items={episode.handoffSummary.memoryTitles} />
                </ContinuityCard>
              ) : null}

              {episode.handoffSummary.cautionItems.length > 0 ? (
                <ContinuityCard label={locale === "zh" ? "交接注意" : "Cautions"} tone="amber">
                  <ul className="mt-3 space-y-2">
                    {episode.handoffSummary.cautionItems.map((item: string) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </ContinuityCard>
              ) : null}

              <PromptBlock
                label={locale === "zh" ? "Agent Continuation Packet" : "Agent Continuation Packet"}
                content={episode.continuationPacket}
              />
            </div>
          </Panel>

          <Panel title={dict.episode.auditSummary} eyebrow={dict.common.auditTrail}>
            <div className="grid gap-3 text-sm text-slate-300">
              <MetricCard label="Reads" value={`${episode.auditSummary.readCount} reads`} tone="cyan" />
              <MetricCard label="Writes" value={`${episode.auditSummary.writeCount} writes`} tone="emerald" />
              <MetricCard label="Denials" value={`${episode.auditSummary.permissionDeniedCount} denials`} tone="rose" />
              <MetricCard label="Policy" value={`${episode.auditSummary.policyHitCount} policy hits`} tone="amber" />
              <ActionLink href={`/${locale}/audit?episodeId=${episode.id}`} tone="secondary">
                {dict.common.viewAudit}
              </ActionLink>
            </div>
          </Panel>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
        <div className="space-y-6">
import { TimelineDebugWrapper } from \"@/components/timeline-debug-wrapper\";

// ... (inside EpisodeReviewPage render)
// Replace the existing timeline section:
<<PanelPanel title={dict.common.timeline} eyebrow={dict.episode.title}>
  <<TimelineTimelineDebugWrapper 
    timeline={episode.timeline} 
    episodeId={episode.id} 
    locale={locale} 
    dict={dict} 
  />
</Panel>


          <Panel title={dict.episode.relationshipMap} eyebrow="Edges">
            <div className="space-y-4">
              <RelationshipFlow
                memories={episode.memories.map((memory: {
                  id: string;
                  title: string;
                  type: string;
                  sensitivity: string;
                }) => ({
                  id: memory.id,
                  label: memory.title,
                  meta: `${memory.type} · ${memory.sensitivity}`
                }))}
                traces={episode.timeline.map((trace: {
                  id: string;
                  stepIndex: number;
                  stepTitle: string;
                  actor: string;
                }) => ({
                  id: trace.id,
                  label: `Step ${trace.stepIndex} · ${trace.stepTitle}`,
                  meta: trace.actor
                }))}
                artifacts={episode.artifacts.map((artifact: {
                  id: string;
                  title: string;
                  type: string;
                  version: number;
                }) => ({
                  id: artifact.id,
                  label: artifact.title,
                  meta: `${artifact.type} · v${artifact.version}`
                }))}
              />
              <div className="grid gap-3 text-sm text-slate-300">
                {episode.relationships.map((edge: {
                  id: string;
                  edgeType: string;
                  fromNodeType: string;
                  fromNodeId: string;
                  toNodeType: string;
                  toNodeId: string;
                }) => (
                  <div key={edge.id} className="tp-soft-card rounded-2xl px-4 py-3">
                    <span className="font-medium text-white">{edge.edgeType}</span>
                    <span className="mx-2 text-slate-500">·</span>
                    <span>{edge.fromNodeType}:{edge.fromNodeId.slice(-6)}</span>
                    <span className="mx-2 text-slate-500">→</span>
                    <span>{edge.toNodeType}:{edge.toNodeId.slice(-6)}</span>
                  </div>
                ))}
              </div>
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
              traces={episode.timeline.map((item: { id: string; stepIndex: number; stepTitle: string }) => ({
                id: item.id,
                label: `Step ${item.stepIndex} · ${item.stepTitle}`
              }))}
              memories={episode.memories.map((item: { id: string; title: string }) => ({
                id: item.id,
                label: item.title
              }))}
            />
          </Panel>

          <Panel
            title={locale === "zh" ? "Runtime Provenance" : "Runtime Provenance"}
            eyebrow={locale === "zh" ? "Work Plane State" : "Work Plane State"}
          >
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <MetricCard
                  label={locale === "zh" ? "Cloud Mode" : "Cloud Mode"}
                  value={episode.runtimeSummary.cloudMode}
                  detail={`${episode.runtimeSummary.databaseProvider} · ${episode.runtimeSummary.objectStorageProvider}`}
                  tone="cyan"
                />
                <MetricCard
                  label={locale === "zh" ? "Capture Mode" : "Capture Mode"}
                  value={episode.provenanceSummary.mode}
                  detail={episode.provenanceSummary.host}
                  tone="amber"
                />
              </div>

              <ContinuityCard label={locale === "zh" ? "Storage Status" : "Storage Status"}>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <StatusBadge
                    label={
                      episode.runtimeSummary.projectionExists
                        ? locale === "zh"
                          ? "Projected"
                          : "Projected"
                        : locale === "zh"
                          ? "Pending"
                          : "Pending"
                    }
                    raw={episode.runtimeSummary.projectionExists ? "COMPLETED" : "PLANNED"}
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <MetricCard label={locale === "zh" ? "Artifacts" : "Artifacts"} value={episode.storageSummary.totalArtifacts} className="tp-deep-card" />
                  <MetricCard label="R2" value={episode.storageSummary.r2ArtifactCount} tone="cyan" />
                  <MetricCard label={locale === "zh" ? "Inline" : "Inline"} value={episode.storageSummary.inlineArtifactCount} tone="amber" />
                </div>
              </ContinuityCard>

              <ContinuityCard label={locale === "zh" ? "Projection + Review" : "Projection + Review"} className="bg-[linear-gradient(135deg,rgba(14,165,233,0.08),rgba(250,204,21,0.04),rgba(15,23,42,0.42))]">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <StatusBadge
                    label={episode.reviewOutcome ?? "PENDING"}
                    raw={episode.reviewOutcome ?? "PENDING"}
                  />
                </div>
                <div className="space-y-3 text-sm leading-7 text-slate-300">
                  <div>
                    <span className="font-medium text-white">
                      {locale === "zh" ? "Projection Root:" : "Projection Root:"}
                    </span>{" "}
                    {episode.runtimeSummary.projectionRoot}
                  </div>
                  <div>
                    <span className="font-medium text-white">
                      {locale === "zh" ? "Episode Path:" : "Episode Path:"}
                    </span>{" "}
                    <span className="break-all text-slate-200">{episode.runtimeSummary.projectionPath}</span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <MetricCard label={locale === "zh" ? "Trace Events" : "Trace Events"} value={episode.provenanceSummary.signals.traceEventCount} className="tp-deep-card" />
                    <MetricCard label={locale === "zh" ? "Hook Capture" : "Hook Capture"} value={episode.provenanceSummary.signals.hasHookCapture ? "Yes" : "No"} className="tp-deep-card" />
                    <MetricCard label={locale === "zh" ? "Imported" : "Imported"} value={episode.provenanceSummary.signals.isImported ? "Yes" : "No"} className="tp-deep-card" />
                  </div>
                </div>
              </ContinuityCard>
            </div>
          </Panel>

          <Panel title={dict.common.summary} eyebrow={dict.episode.goal}>
            <div className="space-y-4 text-sm leading-7 text-slate-300">
              <div>{episode.goal}</div>
              <ContinuityCard label={dict.episode.finalOutcome} detail={episode.finalOutcome} />
              <div>
                <div className="mb-2 text-[11px] uppercase tracking-[0.18em] text-slate-500">{dict.common.participatingAgents}</div>
                <div>{episode.participatingAgents.join(" · ")}</div>
              </div>
            </div>
          </Panel>

          <Panel title={dict.common.memories} eyebrow="Memory">
            <div className="space-y-3">
              {episode.memories.map((memory: {
                id: string;
                title: string;
                content: string;
                type: string;
                sensitivity: string;
                usedInStepCount: number;
              }) => (
                <ContinuityCard key={memory.id} label={`${memory.type} · ${memory.sensitivity} · ${memory.usedInStepCount} steps`} title={memory.title} detail={memory.content} />
              ))}
            </div>
          </Panel>

          <Panel title={dict.common.artifacts} eyebrow="Outputs">
            <div className="space-y-3">
              {episode.artifacts.map((artifact: {
                id: string;
                title: string;
                generatedBy: string;
                type: string;
                version: number;
              }) => (
                <Link
                  key={artifact.id}
                  href={`/${locale}/artifacts/${artifact.id}`}
                  className="tp-soft-card block rounded-2xl px-4 py-4 hover:border-cyan-300/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-white">{artifact.title}</div>
                      <div className="mt-1 text-sm text-slate-300">{artifact.generatedBy}</div>
                    </div>
                    <div className="text-right text-xs uppercase tracking-[0.16em] text-slate-500">
                      {artifact.type} v{artifact.version}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
