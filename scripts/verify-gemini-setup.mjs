import fs from "node:fs";
import path from "node:path";

const cwd = process.cwd();
const configPath = path.resolve(cwd, process.argv[2] || path.join(".gemini", "settings.json"));

const result = {
  config_exists: fs.existsSync(configPath),
  config_valid: false,
  checks: [],
  next_steps: []
};

if (result.config_exists) {
  try {
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    const server = config?.mcpServers?.agentWorkGraph;
    result.config_valid = Boolean(
      server &&
        server.command === "node" &&
        Array.isArray(server.args) &&
        server.args.includes("scripts/mcp-server.mjs")
    );
    result.checks.push({
      item: "gemini_mcp",
      ok: result.config_valid
    });
  } catch {
    result.checks.push({
      item: "gemini_mcp",
      ok: false
    });
  }
} else {
  result.checks.push({
    item: "gemini_mcp",
    ok: false
  });
}

if (!result.config_exists) {
  result.next_steps.push("Run: npm run gemini:setup");
} else if (!result.config_valid) {
  result.next_steps.push("Re-run setup to refresh .gemini/settings.json.");
} else {
  result.next_steps.push("Run: npm run mcp:test");
  result.next_steps.push("Open Gemini CLI in this repo and follow docs/gemini-quickstart.md");
}

console.log(JSON.stringify(result, null, 2));
