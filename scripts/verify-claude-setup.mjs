import fs from "node:fs";
import path from "node:path";

const cwd = process.cwd();
const mcpPath = path.resolve(cwd, ".mcp.json");
const settingsPath = path.resolve(cwd, ".claude", "settings.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

const result = {
  mcp_exists: fs.existsSync(mcpPath),
  hooks_exists: fs.existsSync(settingsPath),
  mcp_valid: false,
  hooks_valid: false,
  checks: [],
  next_steps: []
};

if (result.mcp_exists) {
  try {
    const mcp = readJson(mcpPath);
    const server = mcp?.mcpServers?.agentWorkGraph;
    result.mcp_valid = Boolean(
      server &&
      server.command === "node" &&
      Array.isArray(server.args) &&
      server.args.includes("scripts/mcp-server.mjs")
    );
    result.checks.push({
      item: "mcp_server",
      ok: result.mcp_valid
    });
  } catch {
    result.checks.push({
      item: "mcp_server",
      ok: false
    });
  }
} else {
  result.checks.push({
    item: "mcp_server",
    ok: false
  });
}

if (result.hooks_exists) {
  try {
    const settings = readJson(settingsPath);
    const hooks = settings?.hooks ?? {};
    const requiredEvents = ["UserPromptSubmit", "PreToolUse", "PostToolUse", "Stop"];
    const hasAllEvents = requiredEvents.every((event) => Array.isArray(hooks[event]) && hooks[event].length > 0);
    result.hooks_valid = hasAllEvents;
    result.checks.push({
      item: "hook_events",
      ok: hasAllEvents
    });
  } catch {
    result.checks.push({
      item: "hook_events",
      ok: false
    });
  }
} else {
  result.checks.push({
    item: "hook_events",
    ok: false
  });
}

if (!result.mcp_exists || !result.hooks_exists) {
  result.next_steps.push("Run: npm run claude:setup -- q2-customer-pulse research-agent");
}

if (result.mcp_exists && result.hooks_exists && (!result.mcp_valid || !result.hooks_valid)) {
  result.next_steps.push("Re-run setup to refresh both config files.");
}

if (result.mcp_valid && result.hooks_valid) {
  result.next_steps.push("Run: npm run claude:hook:test");
  result.next_steps.push("Open Claude Code in this repo and execute the quickstart playbook.");
}

console.log(JSON.stringify(result, null, 2));
