import Link from "next/link";
import { notFound } from "next/navigation";

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
      <section className="rounded-[30px] border border-white/60 bg-white/90 px-6 py-7 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400">{dict.artifact.title}</div>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950">{artifact.title}</h1>
            <p className="mt-3 text-sm text-slate-600">
              {artifact.type} · v{artifact.currentVersion} · {artifact.createdBy}
            </p>
          </div>
          <div className="flex gap-3">
            {artifact.uri ? (
              <a href={artifact.uri} className="rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-800 hover:border-slate-900">
                {dict.common.download}
              </a>
            ) : null}
            <Link
              href={`/${locale}/projects/${artifact.sourceProjectId}/episodes/${artifact.sourceEpisodeId}`}
              className="rounded-full bg-slate-950 px-4 py-2 text-sm text-white"
            >
              {dict.common.backToProject}
            </Link>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <Panel title={dict.common.preview} eyebrow={artifact.type}>
          <pre className="overflow-x-auto rounded-[24px] bg-slate-950 p-5 text-sm leading-7 text-slate-100">
            {artifact.content || "—"}
          </pre>
        </Panel>

        <div className="space-y-6">
          <Panel title={dict.common.versionHistory} eyebrow="Versions">
            <div className="space-y-3">
              {artifact.versions.map((version) => (
                <div key={version.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-700">
                  <div className="font-medium text-slate-950">v{version.version}</div>
                  <div className="mt-1">{version.generatedBy}</div>
                  <div className="mt-1 text-slate-500">{formatDate(version.createdAt, locale)}</div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title={dict.common.provenance} eyebrow={dict.artifact.sourceEpisode}>
            <div className="space-y-4 text-sm text-slate-700">
              <div>
                <div className="mb-1 text-[11px] uppercase tracking-[0.18em] text-slate-400">{dict.artifact.sourceEpisode}</div>
                <div className="font-medium text-slate-950">{artifact.sourceEpisodeTitle}</div>
              </div>
              <div>
                <div className="mb-1 text-[11px] uppercase tracking-[0.18em] text-slate-400">Trace</div>
                <div className="space-y-2">
                  {artifact.sourceTraces.map((trace) => (
                    <div key={trace.id} className="rounded-xl bg-slate-50 px-3 py-2">
                      Step {trace.stepIndex} · {trace.title}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-1 text-[11px] uppercase tracking-[0.18em] text-slate-400">{dict.common.memories}</div>
                <div className="space-y-2">
                  {artifact.sourceMemories.map((memory) => (
                    <div key={memory.id} className="rounded-xl bg-slate-50 px-3 py-2">
                      {memory.title}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Panel>

          <Panel title={dict.common.reuse} eyebrow={dict.artifact.consumedBy}>
            <div className="text-sm text-slate-700">
              {artifact.consumedByAgents.length > 0 ? artifact.consumedByAgents.length : 0} downstream agent references
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
