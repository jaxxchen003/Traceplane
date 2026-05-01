import fs from "node:fs";
import path from "node:path";

import "./_lib/load-env.mjs";

const cwd = process.cwd();
const dbUrl = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/traceplane?schema=public";
const outputPath = process.argv[2] || path.join(".gemini", "settings.json");

const config = {
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

const resolvedOutput = path.resolve(cwd, outputPath);
fs.mkdirSync(path.dirname(resolvedOutput), { recursive: true });
fs.writeFileSync(resolvedOutput, `${JSON.stringify(config, null, 2)}\n`, "utf8");

console.log(
  JSON.stringify(
    {
      wrote: resolvedOutput,
      config: "gemini",
      database_url: dbUrl
    },
    null,
    2
  )
);
