import Link from "next/link";
import { notFound } from "next/navigation";

import { ArtifactPreview } from "@/components/artifact-preview";
import { Panel } from "@/components/panel";
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
      <section className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,15,32,0.92),rgba(2,6,23,0.96))] px-6 py-7 shadow-[0_30px_90px_rgba(2,6,23,0.45)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.24em] text-cyan-200/80">{dict.artifact.title}</div>
            <h1 className="mt-2 text-3xl font-semibold text-white">{artifact.title}</h1>
            <p className="mt-3 text-sm text-slate-300">
              {artifact.type} · v{artifact.currentVersion} · {artifact.createdBy}
            </p>
          </div>
          <div className="flex gap-3">
            {artifact.uri ? (
              <a href={artifact.uri} className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-slate-100 hover:border-white/20">
                {dict.common.download}
              </a>
            ) : null}
            <Link
              href={`/${locale}/projects/${artifact.sourceProjectId}/episodes/${artifact.sourceEpisodeId}`}
              className="rounded-full border border-cyan-400/30 bg-cyan-400/12 px-4 py-2 text-sm text-cyan-50"
            >
              {dict.common.backToProject}
            </Link>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <Panel title={dict.common.preview} eyebrow={artifact.type}>
          <ArtifactPreview type={artifact.type} content={artifact.content || ""} />
        </Panel>

        <div className="space-y-6">
          <Panel title={dict.common.versionHistory} eyebrow="Versions">
            <div className="space-y-3">
              {artifact.versions.map((version: { id: string; version: number; generatedBy: string; createdAt: Date }) => (
                <div key={version.id} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-300">
                  <div className="font-medium text-white">v{version.version}</div>
                  <div className="mt-1">{version.generatedBy}</div>
                  <div className="mt-1 text-slate-500">{formatDate(version.createdAt, locale)}</div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title={dict.common.provenance} eyebrow={dict.artifact.sourceEpisode}>
            <div className="space-y-4 text-sm text-slate-300">
              <div>
                <div className="mb-1 text-[11px] uppercase tracking-[0.18em] text-slate-500">{dict.artifact.sourceEpisode}</div>
                <div className="font-medium text-white">{artifact.sourceEpisodeTitle}</div>
              </div>
              <div>
                <div className="mb-1 text-[11px] uppercase tracking-[0.18em] text-slate-500">Trace</div>
                <div className="space-y-2">
                  {artifact.sourceTraces.map((trace: { id: string; stepIndex: number; title: string }) => (
                    <div key={trace.id} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                      Step {trace.stepIndex} · {trace.title}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-1 text-[11px] uppercase tracking-[0.18em] text-slate-500">{dict.common.memories}</div>
                <div className="space-y-2">
                  {artifact.sourceMemories.map((memory: { id: string; title: string }) => (
                    <div key={memory.id} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                      {memory.title}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Panel>

          <Panel title={dict.common.reuse} eyebrow={dict.artifact.consumedBy}>
            <div className="text-sm text-slate-300">
              {artifact.consumedByAgents.length > 0 ? artifact.consumedByAgents.length : 0} downstream agent references
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
