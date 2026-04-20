"use client";

import Link from "next/link";
import { StatusBadge, StatusTone } from "./status-badge";

interface Episode {
  id: string;
  title: string;
  status: string;
  primaryAgent: string;
  updatedAt: Date;
  artifactCount: number;
  summary?: string;
}

interface EpisodeTableProps {
  episodes: Episode[];
  projectId: string;
  locale: string;
}

function getAgentTone(agentName: string): StatusTone {
  const firstChar = agentName.charAt(0).toUpperCase();
  if (["C", "D", "E"].includes(firstChar)) return "info";
  if (["O", "P", "Q"].includes(firstChar)) return "warning";
  if (["G", "H", "I"].includes(firstChar)) return "success";
  return "neutral";
}

export function EpisodeTable({ episodes, projectId, locale }: EpisodeTableProps) {
  if (episodes.length === 0) {
    return (
      <div className="border border-dashed border-void-600 rounded px-5 py-8 text-center">
        <p className="text-sm text-ink-faint">No episodes yet</p>
        <p className="text-xs text-ink-ghost mt-2">Create your first episode to get started</p>
      </div>
    );
  }

  return (
    <div className="bg-void-800 border border-void-600 rounded overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-void-600 bg-void-700">
            <th className="px-4 py-3 text-left font-medium text-ink-faint text-xs uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left font-medium text-ink-faint text-xs uppercase tracking-wider">
              Episode
            </th>
            <th className="px-4 py-3 text-left font-medium text-ink-faint text-xs uppercase tracking-wider hidden md:table-cell">
              Agent
            </th>
            <th className="px-4 py-3 text-left font-medium text-ink-faint text-xs uppercase tracking-wider hidden sm:table-cell">
              Artifacts
            </th>
            <th className="px-4 py-3 text-left font-medium text-ink-faint text-xs uppercase tracking-wider">
              Updated
            </th>
          </tr>
        </thead>
        <tbody>
          {episodes.map((episode) => {
            const agentTone = getAgentTone(episode.primaryAgent);
            return (
              <tr
                key={episode.id}
                className="border-b border-void-600/50 hover:bg-void-700/50 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3">
                  <StatusBadge 
                    label={episode.status} 
                    raw={episode.status}
                    pulse={episode.status === "IN_PROGRESS" || episode.status === "ACTIVE"}
                  />
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/${locale}/projects/${projectId}/episodes/${episode.id}`}
                    className="block"
                  >
                    <div className="font-medium text-ink hover:text-accent transition-colors">
                      {episode.title}
                    </div>
                    {episode.summary && (
                      <div className="text-xs text-ink-faint mt-1 truncate max-w-[300px]">
                        {episode.summary}
                      </div>
                    )}
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink-muted hidden md:table-cell">
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-medium text-white bg-${agentTone}/60`}>
                      {episode.primaryAgent.charAt(0).toUpperCase()}
                    </span>
                    <span>{episode.primaryAgent}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-ink-muted hidden sm:table-cell">
                  <span className="inline-flex items-center justify-center w-6 h-5 bg-void-600 rounded text-xs font-mono">
                    {episode.artifactCount}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink-faint text-xs">
                  {new Date(episode.updatedAt).toLocaleDateString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}


export function EpisodeStatusGroup({
  title,
  episodes,
  projectId,
  locale,
  accentColor,
}: {
  title: string;
  episodes: Episode[];
  projectId: string;
  locale: string;
  accentColor: string;
}) {
  if (episodes.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-2 h-2 rounded-full ${accentColor}`} />
        <h3 className="text-sm font-medium text-ink">{title}</h3>
        <span className="text-xs text-ink-faint">({episodes.length})</span>
      </div>
      <EpisodeTable episodes={episodes} projectId={projectId} locale={locale} />
    </div>
  );
}
