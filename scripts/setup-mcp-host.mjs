import fs from "node:fs";
import path from "node:path";

import "./_lib/load-env.mjs";

const host = process.argv[2];
const explicitOutput = process.argv[3];
const cwd = process.cwd();
const dbUrl = process.env.DATABASE_URL || "file:./dev.db";

const definitions = {
  "claude-code": {
    defaultOutput: ".mcp.json",
    render() {
      return {
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
    }
  },
  opencode: {
    defaultOutput: "opencode.jsonc",
    render() {
      return {
        $schema: "https://opencode.ai/config.json",
        mcp: {
          agentWorkGraph: {
            type: "local",
            command: ["node", "scripts/mcp-server.mjs"],
            enabled: true,
            environment: {
              DATABASE_URL: dbUrl
            }
          }
        }
      };
    }
  },
  gemini: {
    defaultOutput: path.join(".gemini", "settings.json"),
    render() {
      return {
        mcpServers: {
          agentWorkGraph: {
            command: "node",
            args: ["scripts/mcp-server.mjs"],
            cwd,
            env: {
              DATABASE_URL: dbUrl
            },
            timeout: 30000,
            trust: false
          }
        }
      };
    }
  }
};

function printUsage() {
  console.log(
    [
      "Usage:",
      "  node scripts/setup-mcp-host.mjs <claude-code|opencode|gemini> [outputPath]",
      "",
      "Examples:",
      "  node scripts/setup-mcp-host.mjs claude-code",
      "  node scripts/setup-mcp-host.mjs claude-code .mcp.json",
      "  node scripts/setup-mcp-host.mjs gemini .gemini/settings.json"
    ].join("\n")
  );
}

if (!host || !definitions[host]) {
  printUsage();
  process.exit(host ? 1 : 0);
}

const definition = definitions[host];
const outputPath = explicitOutput || definition.defaultOutput;
const payload = `${JSON.stringify(definition.render(), null, 2)}\n`;

if (!explicitOutput) {
  console.log(payload);
  process.exit(0);
}

const resolvedOutput = path.resolve(cwd, outputPath);
fs.mkdirSync(path.dirname(resolvedOutput), { recursive: true });
fs.writeFileSync(resolvedOutput, payload, "utf8");

console.log(`Wrote ${host} MCP config to ${resolvedOutput}`);
