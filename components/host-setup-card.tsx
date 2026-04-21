"use client";

import { useState } from "react";

type HostCard = {
  id: string;
  name: string;
  level: string[];
  setup: string;
  verify: string;
  quickstart: string;
  tone: "agent" | "artifact" | "trace" | "policy";
};

type Locale = "zh" | "en";

type Dict = {
  nav: { dashboard: string; projects: string; connect: string; audit: string };
  controls: { submit: string; creating: string; created: string };
};

type ConnectSurface = {
  hosts: { id: string; latestSignal: string | null }[];
  totals: { episodeCount: number; capturedEvents: number; importedEpisodes: number };
};

const quickstartContent: Record<string, { steps: { title: string; desc: string; code?: string }[]; successCriteria: string[] }> = {
  claude: {
    steps: [
      {
        title: "1. Run setup",
        desc: "Generate MCP config and Claude hooks for this project",
        code: "npm run claude:setup -- q2-customer-pulse research-agent"
      },
      {
        title: "2. Verify config",
        desc: "Confirm MCP and hooks are properly configured",
        code: "npm run claude:verify"
      },
      {
        title: "3. Test hooks",
        desc: "Simulate Claude Code events and confirm they write to episode",
        code: "npm run claude:hook:test"
      },
      {
        title: "4. Run your first episode",
        desc: "Open Claude Code in this repo and use Traceplane tools:",
        code: "Review the customer feedback notes and produce a research note. Use Traceplane: create episode, query context, write memory, append trace, register artifact."
      }
    ],
    successCriteria: [
      "Claude connects to MCP",
      "Key events written to Episode",
      "Final result registered as artifact",
      "Manager can replay the work evidence chain"
    ]
  },
  opencode: {
    steps: [
      {
        title: "1. Run setup",
        desc: "Generate MCP configuration for OpenCode",
        code: "npm run opencode:setup"
      },
      {
        title: "2. Verify MCP",
        desc: "Confirm OpenCode can see and call Traceplane tools",
        code: "npm run opencode:verify"
      },
      {
        title: "3. Test MCP server",
        desc: "Verify all 8 MCP tools are accessible",
        code: "npm run mcp:test"
      },
      {
        title: "4. Run your first episode",
        desc: "Use Traceplane tools in OpenCode:",
        code: "Review the customer feedback and produce a management-facing note. Use: create or continue episode, query context, write memory, append trace, register artifact."
      }
    ],
    successCriteria: [
      "OpenCode stable MCP connection",
      "Works around same Episode",
      "Result registered as artifact",
      "Manager can review work spine"
    ]
  },
  gemini: {
    steps: [
      {
        title: "1. Run setup",
        desc: "Generate .gemini/settings.json with Traceplane MCP config",
        code: "npm run gemini:setup"
      },
      {
        title: "2. Verify config",
        desc: "Confirm Gemini CLI can see Traceplane tools",
        code: "npm run gemini:verify"
      },
      {
        title: "3. Test MCP",
        desc: "Verify MCP server responds with all tools",
        code: "npm run mcp:test"
      },
      {
        title: "4. Run your first episode",
        desc: "Work normally in Gemini CLI with Traceplane:",
        code: "Review customer feedback and produce a management note. Use: create episode, query context, write meaningful memory, append trace for key decisions, register final note as artifact."
      }
    ],
    successCriteria: [
      "Gemini CLI stable MCP connection",
      "Works around same Episode",
      "Result registered as artifact",
      "Manager can review work spine"
    ]
  },
  codex: {
    steps: [
      {
        title: "1. Manual MCP setup",
        desc: "Add Traceplane as MCP server in Codex config",
        code: "Manual setup · docs/codex-integration.md"
      },
      {
        title: "2. Verify connection",
        desc: "Check Traceplane MCP tools inside Codex",
        code: "Check Traceplane MCP tools inside Codex"
      },
      {
        title: "3. Use as handoff target",
        desc: "Codex can consume query_context and get_episode_brief",
        code: "Import context from previous agents, continue the work spine"
      }
    ],
    successCriteria: [
      "Codex as MCP host",
      "Consumes existing episode context",
      "Outputs written back to Episode",
      "Suitable as handoff receiver"
    ]
  }
};

export function HostSetupCard({
  host,
  locale,
  connectSurface,
  dict
}: {
  host: HostCard;
  locale: Locale;
  connectSurface: ConnectSurface;
  dict: Dict;
}) {
  const [expanded, setExpanded] = useState(false);
  const content = quickstartContent[host.id];

  return (
    <div className="rounded-[28px] border border-void-700 bg-white/5 px-5 py-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">{host.name}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {host.level.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-void-700 bg-white/8 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-ink-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-4 text-sm text-ink-muted">
        <div className="rounded-[20px] border border-void-700 bg-white/6 px-4 py-4">
          <div className="text-[11px] uppercase tracking-[0.18em] text-ink-ghost">
            {locale === "zh" ? "最新信号" : "Latest signal"}
          </div>
          <div className="mt-2 text-sm leading-6 text-white">
            {connectSurface.hosts.find((item) => item.id === host.id)?.latestSignal ?? "—"}
          </div>
        </div>
        <div>
          <div className="mb-2 text-[11px] uppercase tracking-[0.18em] text-ink-ghost">
            {locale === "zh" ? "Setup" : "Setup"}
          </div>
          <pre className="overflow-x-auto rounded-[20px] border border-void-700 bg-slate-950/70 px-4 py-3 text-xs text-slate-100">
            <code>{host.setup}</code>
          </pre>
        </div>
        <div>
          <div className="mb-2 text-[11px] uppercase tracking-[0.18em] text-ink-ghost">
            {locale === "zh" ? "Verify" : "Verify"}
          </div>
          <pre className="overflow-x-auto rounded-[20px] border border-void-700 bg-slate-950/70 px-4 py-3 text-xs text-slate-100">
            <code>{host.verify}</code>
          </pre>
        </div>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-4 w-full rounded-[20px] border border-accent/40 bg-accent/8 px-4 py-3 text-sm text-accent hover:bg-accent/16 transition-colors flex items-center justify-center gap-2"
      >
        <span>{expanded ? (locale === "zh" ? "收起快速入门" : "Collapse quickstart") : (locale === "zh" ? "查看完整快速入门" : "View full quickstart")}</span>
        <svg className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && content && (
        <div className="mt-4 space-y-6 border-t border-void-700 pt-4">
          <div className="space-y-4">
            <div className="text-[11px] uppercase tracking-[0.18em] text-signal-warning-200/80 font-medium">
              {locale === "zh" ? "快速入门步骤" : "Quickstart Steps"}
            </div>
            {content.steps.map((step, i) => (
              <div key={i} className="space-y-2">
                <div className="text-sm font-medium text-white">{step.title}</div>
                <div className="text-xs text-ink-muted">{step.desc}</div>
                {step.code && (
                  <pre className="overflow-x-auto rounded-[16px] border border-void-700 bg-slate-950/50 px-3 py-2 text-xs text-slate-300">
                    <code>{step.code}</code>
                  </pre>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="text-[11px] uppercase tracking-[0.18em] text-signal-success-200/80 font-medium">
              {locale === "zh" ? "成功标准" : "Success Criteria"}
            </div>
            <ul className="space-y-1">
              {content.successCriteria.map((c, i) => (
                <li key={i} className="text-xs text-ink-muted flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-signal-success-400" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}