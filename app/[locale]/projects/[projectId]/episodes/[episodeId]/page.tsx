import Link from "next/link";
import { notFound } from "next/navigation";

import { Panel } from "@/components/panel";
import { StatusBadge } from "@/components/status-badge";
import { TimelineDebugWrapper } from "@/components/timeline-debug-wrapper";
import { formatDuration } from "@/lib/format";
import { getEpisodeReview, getProjectAgents } from "@/lib/demo-data";
import { getDictionary, isLocale } from "@/lib/i18n";

export default async function EpisodeReviewPage({
  params,
}: {
  params: Promise<{ locale: string; projectId: string; episodeId: string }>;
}) {
  const { locale, projectId, episodeId } = await params;
  if (!isLocale(locale)) notFound();

  const [episode, agents] = await Promise.all([
    getEpisodeReview(episodeId, locale),
    getProjectAgents(projectId, locale),
  ]);

  if (!episode || episode.projectId !== projectId) notFound();

  const dict = getDictionary(locale);

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-1.5 text-xs text-ink-dim mb-2">
          <Link href={`/${locale}/projects/${projectId}`} className="text-ink-faint hover:text-ink transition-colors">Projects</Link>
          <span>/</span>
          <Link href={`/${locale}/projects/${projectId}`} className="text-ink-faint hover:text-ink transition-colors">{episode.projectName}</Link>
          <span>/</span>
          <span className="text-ink-faint">{episodeId.slice(0, 8)}</span>
        </div>
        <div className="flex items-baseline gap-3">
          <h1 className="text-xl font-semibold tracking-tight text-ink">
            {episode.title}
          </h1>
          <StatusBadge label={episode.status} raw={episode.status} />
        </div>
        <p className="mt-2 text-sm text-ink-muted max-w-2xl">{episode.goal}</p>
        <div className="mt-2 flex items-center gap-3 text-xs text-ink-faint">
          <span>{episode.projectName}</span>
          <span className="text-void-500">·</span>
          <span className="font-mono">{formatDuration(episode.startedAt, episode.endedAt)}</span>
          <span className="text-void-500">·</span>
          <span className="font-mono">{episode.timeline.length} traces</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-void-900 border border-void-700 rounded-lg p-3">
          <div className="text-[10px] font-medium text-ink-dim uppercase tracking-widest mb-1.5">
            Status
          </div>
          <div className="text-base font-semibold text-ink">{episode.status}</div>
        </div>
        <div className="bg-void-900 border border-void-700 rounded-lg p-3">
          <div className="text-[10px] font-medium text-ink-dim uppercase tracking-widest mb-1.5">
            Traces
          </div>
          <div className="text-base font-semibold font-mono text-ink">
            {episode.timeline.length}
          </div>
        </div>
        <div className="bg-void-900 border border-void-700 rounded-lg p-3">
          <div className="text-[10px] font-medium text-ink-dim uppercase tracking-widest mb-1.5">
            Artifacts
          </div>
          <div className="text-base font-semibold font-mono text-ink">
            {episode.artifacts.length}
          </div>
        </div>
        <div className="bg-void-900 border border-void-700 rounded-lg p-3">
          <div className="text-[10px] font-medium text-ink-dim uppercase tracking-widest mb-1.5">
            Policy
          </div>
          <div className="text-sm font-semibold text-ink truncate">
            {episode.policyVersion}
          </div>
        </div>
      </div>

      <Panel title="Execution Timeline" eyebrow="Trace Events">
        <TimelineDebugWrapper
          timeline={episode.timeline}
          episodeId={episode.id}
          locale={locale}
          dict={dict}
        />
      </Panel>

      <Panel title="Next Agent Handoff" eyebrow="Continue">
        <div className="space-y-4">
        <div className="bg-void-900 border border-void-700 rounded-lg p-3">
          <div className="text-[10px] uppercase tracking-widest text-accent mb-1.5">
            Latest Step
          </div>
          <div className="font-semibold text-ink text-sm">
            {episode.handoffSummary.latestStepTitle}
          </div>
          <div className="text-xs text-ink-muted mt-1">
            {episode.handoffSummary.latestResult}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-void-900 border border-void-700 rounded-lg p-3">
            <div className="text-[10px] uppercase tracking-widest text-ink-dim mb-1.5">
              Artifacts
            </div>
            <div className="font-semibold text-ink text-sm">
              {episode.handoffSummary.latestArtifactTitle || "None"}
            </div>
          </div>
          <div className="bg-void-900 border border-void-700 rounded-lg p-3">
            <div className="text-[10px] uppercase tracking-widest text-ink-dim mb-1.5">
              Handoff Ready
            </div>
            <div
              className={`font-semibold text-sm ${
                episode.handoffSummary.readyForHandoff
                  ? "text-signal-success"
                  : "text-signal-warning"
              }`}
            >
              {episode.handoffSummary.readyForHandoff ? "Yes" : "No"}
            </div>
          </div>
        </div>

        <div className="bg-signal-success/5 border border-signal-success/20 rounded-lg p-3">
          <div className="text-[10px] uppercase tracking-widest text-signal-success mb-1.5">
            Next Action
          </div>
          <div className="text-xs text-ink-muted">
            {episode.handoffSummary.nextAction}
          </div>
        </div>

        <Link
          href={`/${locale}/projects/${projectId}/episodes/new?forkFrom=${episodeId}`}
          className="block w-full px-4 py-2.5 bg-accent text-white text-sm font-medium rounded-md hover:bg-accent-glow transition-colors text-center"
        >
          Fork Episode
        </Link>
        </div>
      </Panel>

      <Panel title="Audit Trail" eyebrow="Events">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center p-3 bg-void-900 border border-void-700 rounded-lg">
            <div className="text-xl font-semibold font-mono text-ink">
              {episode.auditSummary.readCount}
            </div>
            <div className="text-[10px] text-ink-dim mt-1">Reads</div>
          </div>
          <div className="text-center p-3 bg-void-900 border border-void-700 rounded-lg">
            <div className="text-xl font-semibold font-mono text-ink">
              {episode.auditSummary.writeCount}
            </div>
            <div className="text-[10px] text-ink-dim mt-1">Writes</div>
          </div>
          <div className="text-center p-3 bg-void-900 border border-void-700 rounded-lg">
            <div className="text-xl font-semibold font-mono text-signal-error">
              {episode.auditSummary.permissionDeniedCount}
            </div>
            <div className="text-[10px] text-ink-dim mt-1">Denied</div>
          </div>
          <div className="text-center p-3 bg-void-900 border border-void-700 rounded-lg">
            <div className="text-xl font-semibold font-mono text-signal-warning">
              {episode.auditSummary.policyHitCount}
            </div>
            <div className="text-[10px] text-ink-dim mt-1">Policy</div>
          </div>
        </div>
      </Panel>
    </div>
  );
}
