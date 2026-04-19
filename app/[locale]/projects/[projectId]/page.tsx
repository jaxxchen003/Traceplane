import Link from "next/link";
import { notFound } from "next/navigation";

import { EpisodeTable, EpisodeStatusGroup } from "@/components/episode-table";
import { Panel } from "@/components/panel";
import { StatusBadge } from "@/components/status-badge";
import { formatDate } from "@/lib/format";
import { getProjectAgents, getProjectOverview } from "@/lib/demo-data";
import { getDictionary, isLocale } from "@/lib/i18n";

export default async function ProjectOverviewPage({
  params,
}: {
  params: Promise<{ locale: string; projectId: string }>;
}) {
  const { locale, projectId } = await params;
  if (!isLocale(locale)) notFound();

  const [project, agents, dict] = await Promise.all([
    getProjectOverview(projectId, locale),
    getProjectAgents(projectId, locale),
    Promise.resolve(getDictionary(locale)),
  ]);

  if (!project) notFound();

  // Group episodes by status
  const activeEpisodes = project.episodes.filter(
    (e: { status: string }) => e.status === "ACTIVE" || e.status === "IN_PROGRESS"
  );
  const readyEpisodes = project.episodes.filter(
    (e: { status: string }) => e.status === "PLANNED" || e.status === "IN_REVIEW"
  );
  const completedEpisodes = project.episodes.filter(
    (e: { status: string }) => e.status === "COMPLETED" || e.status === "DONE"
  );
  const blockedEpisodes = project.episodes.filter(
    (e: { status: string }) => e.status === "FAILED" || e.status === "BLOCKED"
  );

  const totalArtifacts = project.episodes.reduce(
    (sum: number, e: { artifactCount: number }) => sum + e.artifactCount,
    0
  );

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-mono text-ink-faint uppercase tracking-wider">
            Project
          </span>
        </div>
        <div className="flex items-baseline gap-4">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            {project.name}
          </h1>
          <span className="font-mono text-sm text-ink-faint">{projectId}</span>
        </div>
        <p className="mt-3 text-sm text-ink-muted max-w-2xl">
          {project.description}
        </p>
        <div className="mt-3 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-signal-success animate-status-pulse" />
            <span className="text-signal-success">Healthy</span>
          </div>
          <span className="text-void-400">·</span>
          <span className="text-ink-faint">
            Updated: {formatDate(project.episodes[0]?.updatedAt || project.createdAt, locale)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-void-800 border border-void-600 rounded p-4">
          <div className="text-xs font-medium text-ink-faint uppercase tracking-wider mb-2">
            Episodes
          </div>
          <div className="text-2xl font-semibold font-mono tabular-nums text-ink">
            {project.episodes.length}
          </div>
          <div className="text-xs text-signal-success mt-1 flex items-center gap-1">
            <svg
              className="w-3 h-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M7 17l5-5 5 5M12 12V3" />
            </svg>
            +{activeEpisodes.length} active
          </div>
        </div>

        <div className="bg-void-800 border border-void-600 rounded p-4">
          <div className="text-xs font-medium text-ink-faint uppercase tracking-wider mb-2">
            Active
          </div>
          <div className="text-2xl font-semibold font-mono tabular-nums text-signal-info">
            {activeEpisodes.length}
          </div>
          <div className="text-xs text-ink-faint mt-1">Running now</div>
        </div>

        <div className="bg-void-800 border border-void-600 rounded p-4">
          <div className="text-xs font-medium text-ink-faint uppercase tracking-wider mb-2">
            Artifacts
          </div>
          <div className="text-2xl font-semibold font-mono tabular-nums text-ink">
            {totalArtifacts}
          </div>
          <div className="text-xs text-ink-faint mt-1">
            R2: {project.runtimeSummary?.r2ArtifactCount ?? 0}
          </div>
        </div>

        <div className="bg-void-800 border border-void-600 rounded p-4">
          <div className="text-xs font-medium text-ink-faint uppercase tracking-wider mb-2">
            Success Rate
          </div>
          <div className="text-2xl font-semibold font-mono tabular-nums text-signal-success">
            {project.episodes.length > 0
              ? Math.round(
                  (completedEpisodes.length / project.episodes.length) * 100
                )
              : 0}
            %
          </div>
          <div className="w-full h-1 bg-void-600 rounded mt-2 overflow-hidden">
            <div
              className="h-full bg-signal-success rounded"
              style={{
                width: `${
                  project.episodes.length > 0
                    ? (completedEpisodes.length / project.episodes.length) * 100
                    : 0
                }%`,
              }}
            />
          </div>
        </div>

        <div className="bg-void-800 border border-void-600 rounded p-4">
          <div className="text-xs font-medium text-ink-faint uppercase tracking-wider mb-2">
            Agents
          </div>
          <div className="text-2xl font-semibold font-mono tabular-nums text-ink">
            {agents.length}
          </div>
          <div className="flex -space-x-1.5 mt-2">
            {agents.slice(0, 3).map((agent: { id: string; name: string }, i: number) => (
              <div
                key={agent.id}
                className="w-5 h-5 rounded-full bg-void-600 border border-void-800 flex items-center justify-center text-[10px]"
              >
                {agent.name.charAt(0)}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-void-800 border border-void-600 rounded p-4">
          <div className="text-xs font-medium text-ink-faint uppercase tracking-wider mb-2">
            Policy
          </div>
          <div className="text-sm font-medium text-ink truncate">
            {project.activePolicyVersion}
          </div>
          <div className="text-xs text-ink-faint mt-1">
            {project.riskSummary?.policyHitCount ?? 0} hits
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {activeEpisodes.length > 0 && (
            <EpisodeStatusGroup
              title="Active Now"
              episodes={activeEpisodes}
              projectId={projectId}
              locale={locale}
              accentColor="bg-signal-info animate-status-pulse"
            />
          )}

          {readyEpisodes.length > 0 && (
            <EpisodeStatusGroup
              title="Ready to Continue"
              episodes={readyEpisodes}
              projectId={projectId}
              locale={locale}
              accentColor="bg-signal-warning"
            />
          )}

          {completedEpisodes.length > 0 && (
            <EpisodeStatusGroup
              title="Recently Completed"
              episodes={completedEpisodes.slice(0, 5)}
              projectId={projectId}
              locale={locale}
              accentColor="bg-signal-success"
            />
          )}

          {blockedEpisodes.length > 0 && (
            <EpisodeStatusGroup
              title="Blocked or Failed"
              episodes={blockedEpisodes}
              projectId={projectId}
              locale={locale}
              accentColor="bg-signal-error"
            />
          )}
        </div>

        <div className="space-y-6">
          <Panel title="Participating Agents" eyebrow="Team">
            <div className="space-y-3">
              {agents.map((agent: { id: string; name: string; role: string }) => (
                <div
                  key={agent.id}
                  className="flex items-center gap-3 p-2 rounded hover:bg-void-700/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded bg-accent/20 flex items-center justify-center text-sm font-medium text-accent">
                    {agent.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-ink">{agent.name}</div>
                    <div className="text-xs text-ink-faint">{agent.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Quick Actions" eyebrow="Create">
            <div className="space-y-2">
              <Link
                href={`/${locale}/projects/${projectId}/episodes/new`}
                className="block w-full px-4 py-2.5 bg-accent text-white text-sm font-medium rounded hover:bg-accent-glow transition-colors text-center"
              >
                + New Episode
              </Link>
              <button className="block w-full px-4 py-2.5 border border-void-600 text-ink-muted text-sm font-medium rounded hover:border-void-500 hover:text-ink transition-colors">
                Export Project Data
              </button>
            </div>
          </Panel>

          {project.artifacts && project.artifacts.length > 0 && (
            <Panel title="Recent Artifacts" eyebrow="Outputs">
              <div className="space-y-3">
                {project.artifacts.map(
                  (artifact: { id: string; title: string; type: string }) => (
                    <div
                      key={artifact.id}
                      className="p-2 rounded border border-void-600 hover:border-void-500 transition-colors"
                    >
                      <div className="text-sm font-medium text-ink">{artifact.title}</div>
                      <div className="text-xs text-ink-faint">{artifact.type}</div>
                    </div>
                  )
                )}
              </div>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
