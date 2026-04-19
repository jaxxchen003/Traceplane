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
    <div className="space-y-6">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-mono text-ink-faint uppercase tracking-wider">
            Episode
          </span>
          <span className="font-mono text-xs text-ink-faint">{episodeId.slice(0, 8)}</span>
        </div>
        <div className="flex items-baseline gap-4">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            {episode.title}
          </h1>
          <StatusBadge label={episode.status} raw={episode.status} />
        </div>
        <p className="mt-3 text-sm text-ink-muted max-w-2xl">{episode.goal}</p>
        <div className="mt-3 flex items-center gap-4 text-sm">
          <span className="text-ink-muted">{episode.projectName}</span>
          <span className="text-void-400">·</span>
          <span className="text-ink-faint">{formatDuration(episode.startedAt, episode.endedAt)}</span>
          <span className="text-void-400">·</span>
          <span className="text-ink-faint">{episode.timeline.length} traces</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-void-800 border border-void-600 rounded p-4">
          <div className="text-xs font-medium text-ink-faint uppercase tracking-wider mb-2">
            Status
          </div>
          <div className="text-lg font-semibold text-ink">{episode.status}</div>
        </div>
        <div className="bg-void-800 border border-void-600 rounded p-4">
          <div className="text-xs font-medium text-ink-faint uppercase tracking-wider mb-2">
            Traces
          </div>
          <div className="text-lg font-semibold font-mono text-ink">
            {episode.timeline.length}
          </div>
        </div>
        <div className="bg-void-800 border border-void-600 rounded p-4">
          <div className="text-xs font-medium text-ink-faint uppercase tracking-wider mb-2">
            Artifacts
          </div>
          <div className="text-lg font-semibold font-mono text-ink">
            {episode.artifacts.length}
          </div>
        </div>
        <div className="bg-void-800 border border-void-600 rounded p-4">
          <div className="text-xs font-medium text-ink-faint uppercase tracking-wider mb-2">
            Policy
          </div>
          <div className="text-sm font-semibold text-ink truncate">
            {episode.policyVersion}
          </div>
        </div>
      </div>

      {/* Main Content - Timeline */}
      <Panel title="Execution Timeline" eyebrow="Trace Events">
        <TimelineDebugWrapper
          timeline={episode.timeline}
          episodeId={episode.id}
          locale={locale}
          dict={dict}
        />
      </Panel>

      {/* Handoff Panel */}
      <Panel title="Next Agent Handoff" eyebrow="Continue">
        <div className="space-y-4">
          <div className="bg-void-800 border border-void-600 rounded p-4">
            <div className="text-xs uppercase tracking-wider text-accent mb-2">
              Latest Step
            </div>
            <div className="font-semibold text-ink">
              {episode.handoffSummary.latestStepTitle}
            </div>
            <div className="text-sm text-ink-muted mt-1">
              {episode.handoffSummary.latestResult}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-void-800 border border-void-600 rounded p-4">
              <div className="text-xs uppercase tracking-wider text-ink-faint mb-2">
                Artifacts
              </div>
              <div className="font-semibold text-ink">
                {episode.handoffSummary.latestArtifactTitle || "None"}
              </div>
            </div>
            <div className="bg-void-800 border border-void-600 rounded p-4">
              <div className="text-xs uppercase tracking-wider text-ink-faint mb-2">
                Handoff Ready
              </div>
              <div
                className={`font-semibold ${
                  episode.handoffSummary.readyForHandoff
                    ? "text-signal-success"
                    : "text-signal-warning"
                }`}
              >
                {episode.handoffSummary.readyForHandoff ? "Yes" : "No"}
              </div>
            </div>
          </div>

          <div className="bg-signal-success/5 border border-signal-success/20 rounded p-4">
            <div className="text-xs uppercase tracking-wider text-signal-success mb-2">
              Next Action
            </div>
            <div className="text-sm text-ink-muted">
              {episode.handoffSummary.nextAction}
            </div>
          </div>

          <Link
            href={`/${locale}/projects/${projectId}/episodes/new?forkFrom=${episodeId}`}
            className="block w-full px-4 py-2.5 bg-accent text-white text-sm font-medium rounded hover:bg-accent-glow transition-colors text-center"
          >
            Fork Episode
          </Link>
        </div>
      </Panel>

      {/* Audit Summary */}
      <Panel title="Audit Trail" eyebrow="Events">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center p-3 bg-void-800 border border-void-600 rounded">
            <div className="text-2xl font-semibold font-mono text-ink">
              {episode.auditSummary.readCount}
            </div>
            <div className="text-xs text-ink-faint mt-1">Reads</div>
          </div>
          <div className="text-center p-3 bg-void-800 border border-void-600 rounded">
            <div className="text-2xl font-semibold font-mono text-ink">
              {episode.auditSummary.writeCount}
            </div>
            <div className="text-xs text-ink-faint mt-1">Writes</div>
          </div>
          <div className="text-center p-3 bg-void-800 border border-void-600 rounded">
            <div className="text-2xl font-semibold font-mono text-signal-error">
              {episode.auditSummary.permissionDeniedCount}
            </div>
            <div className="text-xs text-ink-faint mt-1">Denied</div>
          </div>
          <div className="text-center p-3 bg-void-800 border border-void-600 rounded">
            <div className="text-2xl font-semibold font-mono text-signal-warning">
              {episode.auditSummary.policyHitCount}
            </div>
            <div className="text-xs text-ink-faint mt-1">Policy</div>
          </div>
        </div>
      </Panel>
    </div>
  );
}
