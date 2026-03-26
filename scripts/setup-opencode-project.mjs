import fs from "node:fs";
import path from "node:path";

const cwd = process.cwd();
const dbUrl = process.env.DATABASE_URL || "file:./dev.db";
const outputPath = process.argv[2] || "opencode.jsonc";

const config = {
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

const resolvedOutput = path.resolve(cwd, outputPath);
fs.mkdirSync(path.dirname(resolvedOutput), { recursive: true });
fs.writeFileSync(resolvedOutput, `${JSON.stringify(config, null, 2)}\n`, "utf8");

console.log(
  JSON.stringify(
    {
      wrote: resolvedOutput,
      config: "opencode",
      database_url: dbUrl
    },
    null,
    2
  )
);
