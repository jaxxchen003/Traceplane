import fs from "node:fs";
import path from "node:path";

const cwd = process.cwd();
const configPath = path.resolve(cwd, process.argv[2] || "opencode.jsonc");

const result = {
  config_exists: fs.existsSync(configPath),
  config_valid: false,
  checks: [],
  next_steps: []
};

if (result.config_exists) {
  try {
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    const server = config?.mcp?.agentWorkGraph;
    result.config_valid = Boolean(
      server &&
      server.type === "local" &&
      Array.isArray(server.command) &&
      server.command[0] === "node" &&
      server.command.includes("scripts/mcp-server.mjs")
    );
    result.checks.push({
      item: "opencode_mcp",
      ok: result.config_valid
    });
  } catch {
    result.checks.push({
      item: "opencode_mcp",
      ok: false
    });
  }
} else {
  result.checks.push({
    item: "opencode_mcp",
    ok: false
  });
}

if (!result.config_exists) {
  result.next_steps.push("Run: npm run opencode:setup");
} else if (!result.config_valid) {
  result.next_steps.push("Re-run setup to refresh opencode.jsonc.");
} else {
  result.next_steps.push("Run: npm run mcp:test");
  result.next_steps.push("Optionally run: npm run normalize:opencode -- examples/imports/opencode-export.json q2-customer-pulse research-agent .tmp/opencode-normalized.json");
}

console.log(JSON.stringify(result, null, 2));
