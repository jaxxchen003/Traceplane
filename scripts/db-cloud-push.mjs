import { spawn } from "node:child_process";

import "./_lib/load-env.mjs";

const child = spawn(
  process.platform === "win32" ? "npx.cmd" : "npx",
  ["prisma", "db", "push", "--schema", "prisma/schema.postgres.prisma", "--skip-generate"],
  {
    stdio: "inherit",
    env: process.env
  }
);

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
