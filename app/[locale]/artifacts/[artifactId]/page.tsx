import { notFound } from "next/navigation";

import { ArtifactPreview } from "@/components/artifact-preview";
import { ActionLink, ContinuityCard, LabeledValue, MetricCard } from "@/components/continuity-primitives";
import { Panel } from "@/components/panel";
import { StatusBadge } from "@/components/status-badge";
import { formatDate } from "@/lib/format";
import { getArtifactDetail } from "@/lib/demo-data";
import { getDictionary, isLocale } from "@/lib/i18n";

export default async function ArtifactDetailPage({
  params
}: {
  params: Promise<{ locale: string; artifactId: string }>;
}) {
  const { locale, artifactId } = await params;
  if (!isLocale(locale)) notFound();

  const artifact = await getArtifactDetail(artifactId, locale);
  if (!artifact) notFound();

  const dict = getDictionary(locale);

  return (
    <div className="space-y-6">
      <section className="tp-panel-shell rounded-[34px] px-6 py-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.24em] text-signal-info-200/80">{dict.artifact.title}</div>
            <h1 className="mt-2 text-3xl font-semibold text-white">{artifact.title}</h1>
            <p className="mt-3 text-sm text-ink-muted">
              {artifact.type} · v{artifact.currentVersion} · {artifact.createdBy}
            </p>
          </div>
          <div className="flex gap-3">
            {artifact.uri ? (
              <a href={artifact.uri} className="tp-action-link tp-action-link--secondary px-4 py-2 text-sm">
                {dict.common.download}
              </a>
            ) : null}
            <ActionLink href={`/${locale}/projects/${artifact.sourceProjectId}/episodes/${artifact.sourceEpisodeId}`}>
              {dict.common.backToProject}
            </ActionLink>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <Panel title={dict.common.preview} eyebrow={artifact.type}>
          <ArtifactPreview type={artifact.type} content={artifact.content || ""} />
        </Panel>

        <div className="space-y-6">
          <Panel
            title={locale === "zh" ? "Artifact Runtime State" : "Artifact Runtime State"}
            eyebrow={locale === "zh" ? "Storage + Provenance" : "Storage + Provenance"}
          >
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <MetricCard
                  label={locale === "zh" ? "Storage Mode" : "Storage Mode"}
                  value={artifact.runtimeSummary.storageMode}
                  detail={`${artifact.runtimeSummary.databaseProvider} · ${artifact.runtimeSummary.objectStorageProvider}`}
                  tone="cyan"
                />
                <MetricCard
                  label={locale === "zh" ? "Provenance Mode" : "Provenance Mode"}
                  value={artifact.provenanceSummary.mode}
                  detail={artifact.provenanceSummary.host}
                  tone="amber"
                />
              </div>

              <ContinuityCard
                label={locale === "zh" ? "Projection Surface" : "Projection Surface"}
                className="text-sm text-ink-muted"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <StatusBadge
                    label={artifact.runtimeSummary.projectionExists ? "Projected" : "Pending"}
                    raw={artifact.runtimeSummary.projectionExists ? "COMPLETED" : "PLANNED"}
                  />
                </div>
                <div className="space-y-2">
                  <div><span className="font-medium text-white">{locale === "zh" ? "Cloud Mode:" : "Cloud Mode:"}</span> {artifact.runtimeSummary.cloudMode}</div>
                  <div><span className="font-medium text-white">{locale === "zh" ? "Projection Root:" : "Projection Root:"}</span> <span className="break-all text-ink-muted">{artifact.runtimeSummary.projectionRoot}</span></div>
                  <div className="grid gap-3 pt-2 sm:grid-cols-2">
                    <MetricCard label={locale === "zh" ? "Source Traces" : "Source Traces"} value={artifact.provenanceSummary.traceCount} className="tp-deep-card" />
                    <MetricCard label={locale === "zh" ? "Source Memories" : "Source Memories"} value={artifact.provenanceSummary.memoryCount} className="tp-deep-card" />
                  </div>
                </div>
              </ContinuityCard>
            </div>
          </Panel>

          <Panel title={dict.common.versionHistory} eyebrow="Versions">
            <div className="space-y-3">
              {artifact.versions.map((version: { id: string; version: number; generatedBy: string; createdAt: Date }) => (
                <ContinuityCard key={version.id} label={`v${version.version}`} detail={version.generatedBy} className="text-sm text-ink-muted">
                  <div className="mt-1 text-ink-ghost">{formatDate(version.createdAt, locale)}</div>
                </ContinuityCard>
              ))}
            </div>
          </Panel>

          <Panel title={dict.common.provenance} eyebrow={dict.artifact.sourceEpisode}>
            <div className="space-y-4 text-sm text-ink-muted">
              <LabeledValue label={dict.artifact.sourceEpisode} value={artifact.sourceEpisodeTitle} />
              <div>
                <div className="mb-1 text-[11px] uppercase tracking-[0.18em] text-ink-ghost">Trace</div>
                <div className="space-y-2">
                  {artifact.sourceTraces.map((trace: { id: string; stepIndex: number; title: string }) => (
                    <div key={trace.id} className="tp-soft-card rounded-lg px-3 py-2">
                      Step {trace.stepIndex} · {trace.title}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-1 text-[11px] uppercase tracking-[0.18em] text-ink-ghost">{dict.common.memories}</div>
                <div className="space-y-2">
                  {artifact.sourceMemories.map((memory: { id: string; title: string }) => (
                    <div key={memory.id} className="tp-soft-card rounded-lg px-3 py-2">
                      {memory.title}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Panel>

          <Panel title={dict.common.reuse} eyebrow={dict.artifact.consumedBy}>
            <div className="space-y-3 text-sm text-ink-muted">
              <div>
                {artifact.consumedByAgents.length > 0 ? artifact.consumedByAgents.length : 0} downstream agent references
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <MetricCard label="Hook Capture" value={artifact.provenanceSummary.hasHookCapture ? "Yes" : "No"} />
                <MetricCard label="Imported" value={artifact.provenanceSummary.isImported ? "Yes" : "No"} />
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
