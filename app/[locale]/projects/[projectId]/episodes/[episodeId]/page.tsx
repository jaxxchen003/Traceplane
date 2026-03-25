import Link from "next/link";
import { notFound } from "next/navigation";

import { EpisodeControlPanel } from "@/components/demo-control-panel";
import { GraphBriefing } from "@/components/graph-briefing";
import { GraphTheater } from "@/components/graph-theater";
import { Panel } from "@/components/panel";
import { RelationshipFlow } from "@/components/relationship-flow";
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
          ? `这一层把 ${episode.auditSummary.permissionDeniedCount} 个 denial 和 ${episode.auditSummary.policyHitCount} 个 policy hit 组织成企业可读的治理证据链。`
          : `This layer organizes ${episode.auditSummary.permissionDeniedCount} denials and ${episode.auditSummary.policyHitCount} policy hits into a governance-readable evidence chain.`
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

        <Panel title={dict.episode.auditSummary} eyebrow={dict.common.auditTrail}>
          <div className="grid gap-3 text-sm text-slate-300">
            <div className="rounded-[20px] border border-cyan-400/16 bg-cyan-400/8 px-4 py-4">
              {episode.auditSummary.readCount} reads
            </div>
            <div className="rounded-[20px] border border-emerald-400/16 bg-emerald-400/8 px-4 py-4">
              {episode.auditSummary.writeCount} writes
            </div>
            <div className="rounded-[20px] border border-rose-400/16 bg-rose-400/8 px-4 py-4">
              {episode.auditSummary.permissionDeniedCount} denials
            </div>
            <div className="rounded-[20px] border border-amber-400/16 bg-amber-400/8 px-4 py-4">
              {episode.auditSummary.policyHitCount} policy hits
            </div>
            <Link
              href={`/${locale}/audit?episodeId=${episode.id}`}
              className="mt-2 inline-flex rounded-full border border-white/10 bg-white/6 px-4 py-2 font-medium text-cyan-100"
            >
              {dict.common.viewAudit}
            </Link>
          </div>
        </Panel>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
        <div className="space-y-6">
          <Panel title={dict.common.timeline} eyebrow={dict.episode.title}>
            <div className="space-y-4">
              {episode.timeline.map((item: {
                id: string;
                stepIndex: number;
                status: string;
                stepTitle: string;
                shortResult: string;
                actor: string;
                eventTime: Date;
                toolName: string | null;
                inputSummary: string | null;
                decisionSummary: string | null;
                resultSummary: string | null;
                errorSummary: string | null;
                policyHitReason: string | null;
                permissionDeniedReason: string | null;
              }) => (
                <div key={item.id} className="rounded-[24px] border border-white/10 bg-white/5 px-5 py-5">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="mb-2 flex items-center gap-3">
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Step {item.stepIndex}
                        </div>
                        <StatusBadge label={dict.statuses[item.status]} raw={item.status} />
                      </div>
                      <h2 className="text-lg font-semibold text-white">{item.stepTitle}</h2>
                      <p className="mt-2 text-sm leading-7 text-slate-300">{item.shortResult}</p>
                    </div>
                    <div className="min-w-[220px] text-sm text-slate-300">
                      <div>{item.actor}</div>
                      <div>{formatDate(item.eventTime, locale)}</div>
                      {item.toolName ? <div>{item.toolName}</div> : null}
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 text-sm text-slate-300 lg:grid-cols-2">
                    {item.inputSummary ? (
                      <div>
                        <span className="font-medium text-white">Input:</span> {item.inputSummary}
                      </div>
                    ) : null}
                    {item.decisionSummary ? (
                      <div>
                        <span className="font-medium text-white">Decision:</span> {item.decisionSummary}
                      </div>
                    ) : null}
                    {item.resultSummary ? (
                      <div>
                        <span className="font-medium text-white">Result:</span> {item.resultSummary}
                      </div>
                    ) : null}
                    {item.errorSummary ? (
                      <div className="text-rose-300">
                        <span className="font-medium">Error:</span> {item.errorSummary}
                      </div>
                    ) : null}
                    {item.policyHitReason ? (
                      <div className="text-amber-200">
                        <span className="font-medium">Policy:</span> {item.policyHitReason}
                      </div>
                    ) : null}
                    {item.permissionDeniedReason ? (
                      <div className="text-rose-300">
                        <span className="font-medium">Denied:</span> {item.permissionDeniedReason}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
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
                  <div key={edge.id} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
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

          <Panel title={dict.common.summary} eyebrow={dict.episode.goal}>
            <div className="space-y-4 text-sm leading-7 text-slate-300">
              <div>{episode.goal}</div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="mb-2 text-[11px] uppercase tracking-[0.18em] text-slate-500">{dict.episode.finalOutcome}</div>
                <div className="text-white">{episode.finalOutcome}</div>
              </div>
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
                <div key={memory.id} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                  <div className="font-medium text-white">{memory.title}</div>
                  <div className="mt-1 text-sm leading-7 text-slate-300">{memory.content}</div>
                  <div className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-500">
                    {memory.type} · {memory.sensitivity} · {memory.usedInStepCount} steps
                  </div>
                </div>
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
                  className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-4 hover:border-cyan-300/30"
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
