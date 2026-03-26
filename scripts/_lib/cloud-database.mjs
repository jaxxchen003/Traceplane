function hasValue(value) {
  return Boolean(value && value.trim().length > 0);
}

export function resolveCloudDatabaseUrl(env = process.env) {
  return env.SUPABASE_POOLER_URL || env.SUPABASE_DB_URL || "";
}

export function detectCloudDatabaseSource(env = process.env) {
  if (hasValue(env.SUPABASE_POOLER_URL)) {
    return "SUPABASE_POOLER_URL";
  }

  if (hasValue(env.SUPABASE_DB_URL)) {
    return "SUPABASE_DB_URL";
  }

  return "none";
}

export function shouldUseCloudDatabase(env = process.env) {
  return env.TRACEPLANE_CLOUD_DB_ACTIVE === "true" && hasValue(resolveCloudDatabaseUrl(env));
}

export async function createRuntimePrismaClient(env = process.env) {
  if (shouldUseCloudDatabase(env)) {
    const cloudDatabaseUrl = resolveCloudDatabaseUrl(env);
    process.env.SUPABASE_DB_URL = cloudDatabaseUrl;
    process.env.DATABASE_URL = cloudDatabaseUrl;
    const { PrismaClient } = await import("../../generated/prisma-cloud/index.js");
    return {
      prisma: new PrismaClient(),
      source: detectCloudDatabaseSource(env),
      provider: "postgres",
      sourceOfTruth: "cloud"
    };
  }

  const { PrismaClient } = await import("@prisma/client");
  return {
    prisma: new PrismaClient(),
    source: "DATABASE_URL",
    provider: "sqlite",
    sourceOfTruth: "local"
  };
}
