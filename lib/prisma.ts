import { createRequire } from "node:module";
import { PrismaClient } from "@prisma/client";

function getEnvFlag(key: string) {
  return process.env[key];
}

const require = createRequire(import.meta.url);

declare global {
  var __traceplane_sqlite_prisma__: PrismaClient | undefined;
  var __traceplane_cloud_prisma__: PrismaClient | undefined;
}

const sqlitePrisma =
  global.__traceplane_sqlite_prisma__ ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") {
  global.__traceplane_sqlite_prisma__ = sqlitePrisma;
}

const useCloudDatabase =
  getEnvFlag("TRACEPLANE_CLOUD_DB_ACTIVE") === "true" &&
  getEnvFlag("TRACEPLANE_CLOUD_DB_RUNTIME") === "active" &&
  Boolean(getEnvFlag("SUPABASE_DB_URL"));

function getCloudPrisma() {
  const existingCloudPrisma = global.__traceplane_cloud_prisma__;
  if (existingCloudPrisma) {
    return existingCloudPrisma;
  }

  const cloudClientModule = require("../generated/prisma-cloud/index.js") as {
    PrismaClient: typeof PrismaClient;
  };
  const cloudPrisma = new cloudClientModule.PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"]
  });

  if (process.env.NODE_ENV !== "production") {
    global.__traceplane_cloud_prisma__ = cloudPrisma;
  }

  return cloudPrisma;
}

export const activePrisma = useCloudDatabase ? getCloudPrisma() : sqlitePrisma;

export { activePrisma as prisma };
