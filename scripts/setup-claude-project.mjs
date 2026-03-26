import fs from "node:fs";
import path from "node:path";

import "./_lib/load-env.mjs";

const projectSlug = process.argv[2];
const primaryAgentSlug = process.argv[3];
const autoReviewOnStop = process.argv[4] ?? "true";
const cwd = process.cwd();
const dbUrl = process.env.DATABASE_URL || "file:./dev.db";

function printUsage() {
  console.log(
    [
      "Usage:",
      "  node scripts/setup-claude-project.mjs <project-slug> <primary-agent-slug> [auto-review-on-stop]",
      "",
      "Examples:",
      "  node scripts/setup-claude-project.mjs q2-customer-pulse research-agent",
      "  node scripts/setup-claude-project.mjs q2-customer-pulse writer-agent false"
    ].join("\n")
  );
}

if (!projectSlug || !primaryAgentSlug) {
  printUsage();
  process.exit(projectSlug || primaryAgentSlug ? 1 : 0);
}

const mcpConfig = {
  mcpServers: {
    agentWorkGraph: {
      command: "node",
      args: ["scripts/mcp-server.mjs"],
      env: {
        DATABASE_URL: dbUrl
      }
    }
  }
};

const baseHookCommand =
  `AWG_PROJECT_SLUG=${projectSlug} ` +
  `AWG_PRIMARY_AGENT_SLUG=${primaryAgentSlug} ` +
  "node scripts/claude-hook-bridge.mjs";

const claudeSettings = {
  hooks: {
    UserPromptSubmit: [
      {
        hooks: [
          {
            type: "command",
            command: baseHookCommand
          }
        ]
      }
    ],
    PreToolUse: [
      {
        matcher: "*",
        hooks: [
          {
            type: "command",
            command: baseHookCommand
          }
        ]
      }
    ],
    PostToolUse: [
      {
        matcher: "*",
        hooks: [
          {
            type: "command",
            command: baseHookCommand
          }
        ]
      }
    ],
    Stop: [
      {
        hooks: [
          {
            type: "command",
            command:
              `AWG_PROJECT_SLUG=${projectSlug} ` +
              `AWG_PRIMARY_AGENT_SLUG=${primaryAgentSlug} ` +
              `AWG_AUTO_REVIEW_ON_STOP=${autoReviewOnStop} ` +
              "node scripts/claude-hook-bridge.mjs"
          }
        ]
      }
    ]
  }
};

const mcpPath = path.resolve(cwd, ".mcp.json");
const claudePath = path.resolve(cwd, ".claude", "settings.json");

fs.mkdirSync(path.dirname(claudePath), { recursive: true });
fs.writeFileSync(mcpPath, `${JSON.stringify(mcpConfig, null, 2)}\n`, "utf8");
fs.writeFileSync(claudePath, `${JSON.stringify(claudeSettings, null, 2)}\n`, "utf8");

console.log(
  JSON.stringify(
    {
      wrote: {
        mcp: mcpPath,
        hooks: claudePath
      },
      project_slug: projectSlug,
      primary_agent_slug: primaryAgentSlug,
      auto_review_on_stop: autoReviewOnStop === "true"
    },
    null,
    2
  )
);
