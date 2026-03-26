import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

import "./_lib/load-env.mjs";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const prismaCli = resolve(rootDir, "node_modules", "prisma", "build", "index.js");
const nextCli = resolve(rootDir, "node_modules", "next", "dist", "bin", "next");
const standaloneServer = resolve(rootDir, ".next", "standalone", "server.js");

function runNodeScript(scriptPath, args, env = process.env) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(process.execPath, [scriptPath, ...args], {
      cwd: rootDir,
      env,
      stdio: "inherit"
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolvePromise();
        return;
      }

      rejectPromise(new Error(`Command failed: ${scriptPath} ${args.join(" ")} (${code ?? "unknown"})`));
    });
  });
}

function resolveSqlitePath(databaseUrl) {
  if (!databaseUrl.startsWith("file:")) {
    return null;
  }

  const relativePath = databaseUrl.slice("file:".length);
  if (relativePath.startsWith("/")) {
    return relativePath;
  }

  return resolve(rootDir, "prisma", relativePath);
}

function normalizeDatabaseUrl(databaseUrl) {
  const sqlitePath = resolveSqlitePath(databaseUrl);
  if (!sqlitePath) {
    return databaseUrl;
  }

  return `file:${sqlitePath}`;
}

async function repairLegacySqliteData(databaseUrl) {
  process.env.DATABASE_URL = databaseUrl;
  const prisma = new PrismaClient();

  try {
    await prisma.$executeRawUnsafe(
      "UPDATE Episode SET status = 'IN_REVIEW' WHERE status = 'PENDING_REVIEW'"
    );
    console.log("[traceplane] legacy sqlite value repair complete");
  } finally {
    await prisma.$disconnect();
  }
}

async function ensureDatabaseReady() {
  const databaseUrl = process.env.DATABASE_URL ?? "file:./dev.db";
  const normalizedDatabaseUrl = normalizeDatabaseUrl(databaseUrl);
  const forceReset = process.env.DEMO_RESET_ENABLED === "true";
  const sqlitePath = resolveSqlitePath(normalizedDatabaseUrl);
  const databaseExists = sqlitePath ? existsSync(sqlitePath) : true;
  const isSqlite = normalizedDatabaseUrl.startsWith("file:");
  const runtimeEnv = {
    ...process.env,
    DATABASE_URL: normalizedDatabaseUrl
  };

  if (isSqlite) {
    console.log(`[traceplane] ensuring sqlite schema at ${normalizedDatabaseUrl}`);
    await runNodeScript(prismaCli, ["db", "push"], runtimeEnv);
    console.log("[traceplane] sqlite schema push complete");
    await repairLegacySqliteData(normalizedDatabaseUrl);
  }

  if (!forceReset && databaseExists) {
    return runtimeEnv;
  }

  await runNodeScript(resolve(rootDir, "prisma", "seed.mjs"), [], runtimeEnv);
  return runtimeEnv;
}

async function main() {
  const runtimeEnv = await ensureDatabaseReady();

  const port = process.env.PORT ?? "3000";
  const host = "0.0.0.0";
  const commandArgs = existsSync(standaloneServer)
    ? [standaloneServer]
    : [nextCli, "start", "--hostname", "0.0.0.0", "--port", port];

  const child = spawn(process.execPath, commandArgs, {
    cwd: rootDir,
    env: {
      ...runtimeEnv,
      PORT: port,
      HOST: host,
      HOSTNAME: host
    },
    stdio: "inherit"
  });

  child.on("exit", (code) => {
    process.exit(code ?? 0);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
