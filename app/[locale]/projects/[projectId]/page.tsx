import Link from "next/link";
import { notFound } from "next/navigation";

import { EventStream } from "@/components/event-stream";
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
    <div className="space-y-5">

      <div className="flex items-center gap-1.5 text-xs text-ink-dim">
        <Link href={`/${locale}/projects`} className="text-ink-faint hover:text-ink transition-colors">Projects</Link>
        <span>/</span>
        <span className="text-ink-faint">Q2 Customer Pulse</span>
      </div>


      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink flex items-center gap-3">
            {project.name}
            <span className="text-xs font-mono text-ink-dim">{project.id}</span>
          </h1>
          <div className="flex gap-2 mt-2">
            <span className="text-[11px] px-2 py-0.5 border border-void-700 rounded flex items-center gap-1.5 text-ink-faint">
              <span className="w-1.5 h-1.5 rounded-full bg-signal-success" /> Healthy
            </span>
            <span className="text-[11px] px-2 py-0.5 border border-void-700 rounded flex items-center gap-1.5 text-ink-faint">
              <span className="w-1.5 h-1.5 rounded-full bg-signal-info" /> {activeEpisodes.length} Active
            </span>
            <span className="text-[11px] px-2 py-0.5 border border-void-700 rounded text-ink-faint">
              Updated 2m ago
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 text-xs border border-void-700 rounded-md text-ink-faint hover:border-ink-dim hover:text-ink transition-colors">Export</button>
          <Link
            href={`/${locale}/projects/${projectId}/episodes/new`}
            className="px-3 py-1.5 bg-accent text-white text-xs font-medium rounded-md hover:bg-accent-glow transition-colors"
          >
            + New Episode
          </Link>
        </div>
      </div>


      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-void-900 border border-void-700 rounded-lg p-4 relative overflow-hidden group hover:border-ink-dim transition-colors">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="text-[10px] text-ink-dim uppercase tracking-widest mb-1.5">Episodes</div>
          <div className="text-2xl font-semibold font-mono tabular-nums tracking-tight text-ink">{project.episodes.length}</div>
          <div className="text-[10px] font-mono text-signal-success mt-1">↑ {activeEpisodes.length} this week</div>
        </div>

        <div className="bg-void-900 border border-void-700 rounded-lg p-4 relative overflow-hidden group hover:border-ink-dim transition-colors">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="text-[10px] text-ink-dim uppercase tracking-widest mb-1.5">Active</div>
          <div className="text-2xl font-semibold font-mono tabular-nums tracking-tight text-signal-info">{activeEpisodes.length}</div>
          <div className="text-[10px] font-mono text-ink-dim mt-1">Running now</div>
        </div>

        <div className="bg-void-900 border border-void-700 rounded-lg p-4 relative overflow-hidden group hover:border-ink-dim transition-colors">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="text-[10px] text-ink-dim uppercase tracking-widest mb-1.5">Artifacts</div>
          <div className="text-2xl font-semibold font-mono tabular-nums tracking-tight text-ink">{totalArtifacts}</div>
          <div className="text-[10px] font-mono text-ink-dim mt-1">R2: {project.runtimeSummary?.r2ArtifactCount || 0} · Local: {project.runtimeSummary?.inlineArtifactCount || 0}</div>
        </div>

        <div className="bg-void-900 border border-void-700 rounded-lg p-4 relative overflow-hidden group hover:border-ink-dim transition-colors">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="text-[10px] text-ink-dim uppercase tracking-widest mb-1.5">Success Rate</div>
          <div className={`text-2xl font-semibold font-mono tabular-nums tracking-tight ${
            successRate >= 90 ? "text-signal-success" : successRate >= 70 ? "text-signal-warning" : "text-signal-error"
          }`}>{successRate}%</div>
          <div className="h-0.5 bg-void-700 rounded mt-2 overflow-hidden">
            <div className={`h-full rounded transition-all duration-500 ${
              successRate >= 90 ? "bg-signal-success" : successRate >= 70 ? "bg-signal-warning" : "bg-signal-error"
            }`} style={{ width: `${successRate}%` }} />
          </div>
        </div>

        <div className="bg-void-900 border border-void-700 rounded-lg p-4 relative overflow-hidden group hover:border-ink-dim transition-colors">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="text-[10px] text-ink-dim uppercase tracking-widest mb-1.5">Avg Duration</div>
          <div className="text-2xl font-semibold font-mono tabular-nums tracking-tight text-ink">1.8m</div>
          <div className="text-[10px] font-mono text-signal-info mt-1">↓ 0.3m</div>
        </div>

        <div className="bg-void-900 border border-void-700 rounded-lg p-4 relative overflow-hidden group hover:border-ink-dim transition-colors">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="text-[10px] text-ink-dim uppercase tracking-widest mb-1.5">Agents</div>
          <div className="text-2xl font-semibold font-mono tabular-nums tracking-tight text-ink">{agents.length}</div>
          <div className="text-[10px] font-mono text-ink-dim mt-1">{agents.slice(0, 3).map((a: { name: string }) => a.name.charAt(0).toLowerCase()).join(" · ")}</div>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4">

        <div className="bg-void-900 border border-void-700 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-void-700 flex items-center justify-between">
            <span className="text-sm font-semibold text-ink">Recent Episodes</span>
            <div className="flex gap-1">
              <button className="px-2 py-1 text-[11px] rounded border border-accent bg-accent text-white font-medium">All</button>
              <button className="px-2 py-1 text-[11px] rounded border border-void-700 text-ink-dim hover:border-ink-dim hover:text-ink transition-colors">Active</button>
              <button className="px-2 py-1 text-[11px] rounded border border-void-700 text-ink-dim hover:border-ink-dim hover:text-ink transition-colors">Done</button>
              <button className="px-2 py-1 text-[11px] rounded border border-void-700 text-ink-dim hover:border-ink-dim hover:text-ink transition-colors">Failed</button>
            </div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-void-700 bg-void-800">
                <th className="px-4 py-2.5 text-left font-medium text-ink-dim text-[10px] uppercase tracking-widest">Status</th>
                <th className="px-4 py-2.5 text-left font-medium text-ink-dim text-[10px] uppercase tracking-widest">Episode</th>
                <th className="px-4 py-2.5 text-left font-medium text-ink-dim text-[10px] uppercase tracking-widest hidden md:table-cell">Agent</th>
                <th className="px-4 py-2.5 text-left font-medium text-ink-dim text-[10px] uppercase tracking-widest hidden sm:table-cell">Artifacts</th>
                <th className="px-4 py-2.5 text-left font-medium text-ink-dim text-[10px] uppercase tracking-widest">Time</th>
              </tr>
            </thead>
            <tbody>
              {project.episodes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-ink-dim text-sm">
                    No episodes found
                  </td>
                </tr>
              ) : (
                project.episodes.map((episode: any) => (
                  <tr key={episode.id} className="border-b border-void-700 hover:bg-accent-dim cursor-pointer transition-colors group">
                    <td className="px-4 py-3">
                      <StatusBadge label={episode.status.toLowerCase()} raw={episode.status} />
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/${locale}/projects/${projectId}/episodes/${episode.id}`} className="block">
                        <div className="font-medium text-ink group-hover:text-accent transition-colors">{episode.title}</div>
                        <div className="text-[11px] text-ink-dim mt-0.5 truncate max-w-[200px] xl:max-w-[300px]">
                          {episode.summary || "No summary available"}
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-[18px] h-[18px] rounded flex items-center justify-center text-[9px] font-semibold text-white ${
                          episode.status === "IN_PROGRESS" ? "bg-signal-info/20 text-signal-info" :
                          episode.status === "COMPLETED" ? "bg-signal-success/20 text-signal-success" :
                          episode.status === "FAILED" ? "bg-signal-error/20 text-signal-error" :
                          episode.status === "BLOCKED" ? "bg-signal-warning/20 text-signal-warning" :
                          "bg-void-600 text-ink-faint"
                        }`}>
                          {episode.primaryAgent.charAt(0).toUpperCase()}
                        </span>
                        <span className="text-xs text-ink-faint">{episode.primaryAgent}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="inline-flex items-center justify-center min-w-[22px] h-5 px-1 bg-void-800 rounded text-[10px] font-mono text-ink-dim">
                        {episode.artifactCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[11px] font-mono text-ink-dim">
                      {new Date(episode.updatedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>


        <div className="flex flex-col gap-4">

          <div className="bg-void-900 border border-void-700 rounded-lg overflow-hidden">
            <div className="px-3 py-2 border-b border-void-700 flex items-center justify-between">
              <span className="text-xs font-semibold text-ink">Event Stream</span>
              <span className="text-[9px] px-1.5 py-0.5 bg-accent-dim text-accent rounded font-mono">LIVE</span>
            </div>
            <div className="p-3">
              <EventStream projectId={projectId} />
            </div>
          </div>


          <div className="bg-void-900 border border-void-700 rounded-lg overflow-hidden">
            <div className="px-3 py-2 border-b border-void-700">
              <span className="text-xs font-semibold text-ink">System Health</span>
            </div>
            <div className="p-3 space-y-3">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-ink-faint">Database</span>
                  <span className="text-signal-success font-medium">Operational</span>
                </div>
                <div className="h-[3px] bg-void-700 rounded-sm overflow-hidden">
                  <div className="h-full w-full bg-signal-success rounded-sm" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-ink-faint">R2 Storage</span>
                  <span className="text-signal-success font-medium">Operational</span>
                </div>
                <div className="h-[3px] bg-void-700 rounded-sm overflow-hidden">
                  <div className="h-full w-full bg-signal-success rounded-sm" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-ink-faint">Hook Bridge</span>
                  <span className="text-signal-info font-medium">Active</span>
                </div>
                <div className="h-[3px] bg-void-700 rounded-sm overflow-hidden">
                  <div className="h-full w-[85%] bg-signal-info rounded-sm" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-ink-faint">Queue</span>
                  <span className="text-ink-dim">0 pending</span>
                </div>
                <div className="h-[3px] bg-void-700 rounded-sm overflow-hidden">
                  <div className="h-full w-full bg-ink-dim rounded-sm" />
                </div>
              </div>
            </div>
          </div>


          <div className="bg-void-900 border border-void-700 rounded-lg overflow-hidden">
            <div className="px-3 py-2 border-b border-void-700">
              <span className="text-xs font-semibold text-ink">Quick Actions</span>
            </div>
            <div className="p-2">
              <Link href={`/${locale}/projects/${projectId}/episodes/new`} className="block px-2 py-1.5 text-xs text-ink-faint hover:text-ink hover:bg-accent-dim rounded transition-colors">
                + New Episode
              </Link>
              <button className="w-full text-left px-2 py-1.5 text-xs text-ink-faint hover:text-ink hover:bg-accent-dim rounded transition-colors">
                ↗ Export Data
              </button>
              <button className="w-full text-left px-2 py-1.5 text-xs text-ink-faint hover:text-ink hover:bg-accent-dim rounded transition-colors">
                ⚙ Configure
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
