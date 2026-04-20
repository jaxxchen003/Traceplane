import Link from "next/link";
import { notFound } from "next/navigation";

import { EventStream } from "@/components/event-stream";
import { HealthIndicator, ProgressBar, StatusBadge } from "@/components/status-badge";
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

  const activeEpisodes = project.episodes.filter(
    (e: { status: string }) => e.status === "ACTIVE" || e.status === "IN_PROGRESS" || e.status === "RUNNING"
  );
  
  const completedEpisodes = project.episodes.filter(
    (e: { status: string }) => e.status === "COMPLETED" || e.status === "DONE" || e.status === "SUCCESS"
  );

  const totalArtifacts = project.episodes.reduce(
    (sum: number, e: { artifactCount: number }) => sum + e.artifactCount,
    0
  );

  const successRate = project.episodes.length > 0
    ? Math.round((completedEpisodes.length / project.episodes.length) * 100)
    : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-void-600 pb-4">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-semibold text-ink">{project.name}</h1>
          <div className="hidden md:flex items-center gap-4 text-sm">
            <span className="text-ink-ghost">Project:</span>
            <span className="font-mono text-accent">{project.id}</span>
          </div>
        </div>
    <div className="flex items-center gap-3">
      <HealthIndicator status="healthy" />
          <Link
            href={`/${locale}/projects/${projectId}/episodes/new`}
            className="px-3 py-1.5 bg-accent text-white text-xs font-medium rounded hover:bg-accent-glow transition-colors"
          >
            + New
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
        <div className="bg-void-800 border border-void-600 rounded p-3 hover:border-void-500 transition-colors">
          <div className="text-xs text-ink-faint uppercase tracking-wider mb-1">Episodes</div>
          <div className="text-2xl font-semibold font-mono tabular-nums text-ink">{project.episodes.length}</div>
          <div className="text-xs text-signal-success mt-1">↑ {activeEpisodes.length} active</div>
        </div>
        <div className="bg-void-800 border border-void-600 rounded p-3 hover:border-void-500 transition-colors">
          <div className="text-xs text-ink-faint uppercase tracking-wider mb-1">Active Now</div>
          <div className="text-2xl font-semibold font-mono tabular-nums text-signal-info">{activeEpisodes.length}</div>
          <div className="text-xs text-ink-faint mt-1">Running</div>
        </div>
        <div className="bg-void-800 border border-void-600 rounded p-3 hover:border-void-500 transition-colors">
          <div className="text-xs text-ink-faint uppercase tracking-wider mb-1">Artifacts</div>
          <div className="text-2xl font-semibold font-mono tabular-nums text-ink">{totalArtifacts}</div>
          <div className="text-xs text-ink-faint mt-1">R2: {project.runtimeSummary?.r2ArtifactCount || 0} · Local: {project.runtimeSummary?.inlineArtifactCount || 0}</div>
        </div>
      <div className="bg-void-800 border border-void-600 rounded p-3 hover:border-void-500 transition-colors">
        <div className="text-xs text-ink-faint uppercase tracking-wider mb-1">Success Rate</div>
        <div className={`text-2xl font-semibold font-mono tabular-nums ${
          successRate >= 90 ? "text-signal-success" :
          successRate >= 70 ? "text-signal-warning" :
          "text-signal-error"
        }`}>{successRate}%</div>
        <div className="w-full h-1 bg-void-600 rounded mt-2 overflow-hidden">
          <div className={`h-full rounded transition-all duration-500 ${
            successRate >= 90 ? "bg-signal-success" :
            successRate >= 70 ? "bg-signal-warning" :
            "bg-signal-error"
          }`} style={{ width: `${successRate}%` }}></div>
        </div>
      </div>
        <div className="bg-void-800 border border-void-600 rounded p-3 hover:border-void-500 transition-colors">
          <div className="text-xs text-ink-faint uppercase tracking-wider mb-1">Avg Duration</div>
          <div className="text-2xl font-semibold font-mono tabular-nums text-ink">1.8m</div>
          <div className="text-xs text-signal-info mt-1">↓ optimal</div>
        </div>
        <div className="bg-void-800 border border-void-600 rounded p-3 hover:border-void-500 transition-colors">
          <div className="text-xs text-ink-faint uppercase tracking-wider mb-1">Agents</div>
          <div className="text-2xl font-semibold font-mono tabular-nums text-ink">{agents.length}</div>
          <div className="flex -space-x-1.5 mt-2">
            {agents.slice(0, 4).map((a: { id: string; name: string }, i: number) => (
              <div key={a.id} className={`w-5 h-5 rounded-full border border-void-800 flex items-center justify-center text-[10px] font-medium text-white ${i === 0 ? 'bg-signal-info' : i === 1 ? 'bg-signal-warning' : 'bg-signal-success'}`}>
                {a.name.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        <div className="lg:col-span-2">
          <div className="bg-void-800 border border-void-600 rounded overflow-hidden flex flex-col h-full">
            <div className="px-4 py-3 border-b border-void-600 bg-void-700 flex items-center justify-between">
              <span className="text-sm font-medium text-ink">Recent Episodes</span>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-ink-ghost mr-1">Filter:</span>
                <button className="px-2.5 py-1 rounded bg-accent/15 text-accent font-medium border border-accent/20">All</button>
                <button className="px-2.5 py-1 rounded text-ink-faint hover:bg-void-600 hover:text-ink transition-colors">Active</button>
                <button className="px-2.5 py-1 rounded text-ink-faint hover:bg-void-600 hover:text-ink transition-colors">Failed</button>
              </div>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-void-600 bg-void-800">
                    <th className="px-4 py-2.5 text-left font-medium text-ink-faint text-xs uppercase tracking-wider">Status</th>
                    <th className="px-4 py-2.5 text-left font-medium text-ink-faint text-xs uppercase tracking-wider">ID</th>
                    <th className="px-4 py-2.5 text-left font-medium text-ink-faint text-xs uppercase tracking-wider">Title</th>
                    <th className="px-4 py-2.5 text-left font-medium text-ink-faint text-xs uppercase tracking-wider">Agent</th>
                    <th className="px-4 py-2.5 text-left font-medium text-ink-faint text-xs uppercase tracking-wider">Artifacts</th>
                    <th className="px-4 py-2.5 text-left font-medium text-ink-faint text-xs uppercase tracking-wider">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {project.episodes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-ink-faint text-sm">
                        No episodes found
                      </td>
                    </tr>
                  ) : (
                    project.episodes.map((episode: any) => (
                      <tr key={episode.id} className="border-b border-void-600/50 hover-row cursor-pointer transition-colors group">
                        <td className="px-4 py-3">
                          <StatusBadge label={episode.status.toLowerCase()} raw={episode.status} />
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-ink-ghost group-hover:text-accent font-medium transition-colors">
                          {episode.id.slice(-8)}
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/${locale}/projects/${projectId}/episodes/${episode.id}`} className="block">
                            <div className="font-medium text-ink flex items-center gap-2">
                              {episode.title}
                              {episode.riskFlag && (
                                <span className="w-1.5 h-1.5 rounded-full bg-signal-error" title="Risk flags detected"></span>
                              )}
                            </div>
                            <div className="text-xs text-ink-faint mt-0.5 truncate max-w-[200px] xl:max-w-[300px]">
                              {episode.summary || "No summary available"}
                            </div>
                          </Link>
                        </td>
              <td className="px-4 py-3 text-ink-faint text-xs">
                <div className="flex items-center gap-1.5">
                  <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-medium text-white ${
                    episode.status === "IN_PROGRESS" ? "bg-signal-info/60" :
                    episode.status === "COMPLETED" ? "bg-signal-success/60" :
                    episode.status === "FAILED" ? "bg-signal-error/60" :
                    episode.status === "BLOCKED" ? "bg-signal-warning/60" :
                    "bg-signal-neutral/60"
                  }`}>
                    {episode.primaryAgent.charAt(0).toUpperCase()}
                  </span>
                  <span>{episode.primaryAgent}</span>
                </div>
              </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center justify-center min-w-5 px-1.5 h-5 bg-void-600 border border-void-500 rounded text-xs font-mono text-ink-muted">
                            {episode.artifactCount}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-ink-faint text-xs">
                          {new Date(episode.updatedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-void-800 border border-void-600 rounded">
            <div className="px-4 py-3 border-b border-void-600 bg-void-700">
              <span className="text-sm font-medium text-ink">Event Stream</span>
            </div>
            <div className="p-4">
              <EventStream projectId={projectId} />
            </div>
          </div>

          <div className="bg-void-800 border border-void-600 rounded">
            <div className="px-4 py-3 border-b border-void-600 bg-void-700">
              <span className="text-sm font-medium text-ink">System Health</span>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-ink-faint">Database</span>
                  <span className="text-signal-success font-medium">Operational</span>
                </div>
                <div className="h-1 bg-void-600 rounded overflow-hidden">
                  <div className="h-full w-full bg-signal-success rounded"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-ink-faint">R2 Storage</span>
                  <span className="text-signal-success font-medium">Operational</span>
                </div>
                <div className="h-1 bg-void-600 rounded overflow-hidden">
                  <div className="h-full w-full bg-signal-success rounded"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-ink-faint">Hook Bridge</span>
                  <span className="text-signal-info font-medium">Active</span>
                </div>
                <div className="h-1 bg-void-600 rounded overflow-hidden">
                  <div className="h-full w-[85%] bg-signal-info rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-void-800 border border-void-600 rounded">
            <div className="px-4 py-3 border-b border-void-600 bg-void-700">
               <span className="text-sm font-medium text-ink">Quick Actions</span>
            </div>
            <div className="p-2 space-y-1">
               <Link href={`/${locale}/projects/${projectId}/episodes/new`} className="w-full px-3 py-2 text-sm text-left text-ink-muted hover:text-ink hover:bg-void-700 rounded transition-colors flex items-center gap-2">
                 <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                 New Episode
               </Link>
               <button className="w-full px-3 py-2 text-sm text-left text-ink-muted hover:text-ink hover:bg-void-700 rounded transition-colors flex items-center gap-2">
                 <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M4 12l4-4m0 0l4 4m-4-4v12"/></svg>
                 Export Data
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
