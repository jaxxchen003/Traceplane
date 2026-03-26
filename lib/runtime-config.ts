import {
  detectCloudDatabaseSource,
  detectSupabaseConnectionMode,
  resolveCloudDatabaseUrl
} from "@/lib/cloud-database";

type CloudReadiness = {
  ready: boolean;
  blockers: string[];
};

function getEnv() {
  return process.env as Record<string, string | undefined>;
}

function hasValue(value: string | undefined) {
  return Boolean(value && value.trim().length > 0);
}

function normalizeAppBaseUrl(value: string | undefined) {
  if (!hasValue(value)) return null;
  const raw = value!.trim();
  return raw.startsWith("http://") || raw.startsWith("https://") ? raw : `https://${raw}`;
}

function detectDatabaseProvider(databaseUrl: string | undefined) {
  if (!databaseUrl) return "unknown";
  if (databaseUrl.startsWith("file:")) return "sqlite";
  if (databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://")) {
    return "postgres";
  }
  return "unknown";
}

function assessCloudReadiness(env: NodeJS.ProcessEnv): CloudReadiness {
  const blockers: string[] = [];

  if (!hasValue(env.SUPABASE_PROJECT_URL)) {
    blockers.push("Missing SUPABASE_PROJECT_URL");
  }

  if (!hasValue(env.DATABASE_URL) && !hasValue(env.SUPABASE_DB_URL) && !hasValue(env.SUPABASE_POOLER_URL)) {
    blockers.push("Missing DATABASE_URL / SUPABASE_DB_URL / SUPABASE_POOLER_URL");
  }

  if ((env.DATABASE_URL || env.SUPABASE_POOLER_URL || env.SUPABASE_DB_URL || "").includes("[YOUR-PASSWORD]")) {
    blockers.push("Supabase database URL still contains placeholder password");
  }

  if (!hasValue(env.SUPABASE_SECRET_KEY)) {
    blockers.push("Missing SUPABASE_SECRET_KEY");
  }

  if (!hasValue(env.R2_BUCKET)) {
    blockers.push("Missing R2_BUCKET");
  }

  if (!hasValue(env.CLOUDFLARE_ACCOUNT_ID)) {
    blockers.push("Missing CLOUDFLARE_ACCOUNT_ID");
  }

  if (!hasValue(env.R2_ENDPOINT)) {
    blockers.push("Missing R2_ENDPOINT");
  }

  if (!hasValue(env.R2_ACCESS_KEY_ID)) {
    blockers.push("Missing R2_ACCESS_KEY_ID");
  } else if ((env.R2_ACCESS_KEY_ID || "").includes("r2.cloudflarestorage.com")) {
    blockers.push("R2_ACCESS_KEY_ID is using the endpoint URL instead of an access key");
  }

  if (!hasValue(env.R2_SECRET_ACCESS_KEY)) {
    blockers.push("Missing R2_SECRET_ACCESS_KEY");
  } else if ((env.R2_SECRET_ACCESS_KEY || "").includes("r2.cloudflarestorage.com")) {
    blockers.push("R2_SECRET_ACCESS_KEY is using the endpoint URL instead of a secret key");
  }

  return {
    ready: blockers.length === 0,
    blockers
  };
}

function detectDeploymentStage({
  cloudReady,
  databaseProvider,
  objectStorageProvider,
  cloudDbActive
}: {
  cloudReady: boolean;
  databaseProvider: string;
  objectStorageProvider: string;
  cloudDbActive: boolean;
}) {
  if (cloudReady && cloudDbActive && databaseProvider === "postgres" && objectStorageProvider === "r2") {
    return "cloud-active";
  }

  if (cloudReady) {
    return "cloud-configured";
  }

  return "demo-local";
}

export function getRuntimeConfig() {
  const env = getEnv();
  const cloudDbRequested = env["TRACEPLANE_CLOUD_DB_ACTIVE"] === "true";
  const cloudDbRuntime = env["TRACEPLANE_CLOUD_DB_RUNTIME"] || (cloudDbRequested ? "requested" : "local");
  const cloudDbActive = cloudDbRuntime === "active";
  const configuredCloudDatabaseUrl = resolveCloudDatabaseUrl(env);
  const cloudDatabaseSource = detectCloudDatabaseSource(env);
  const cloudConnectionMode = detectSupabaseConnectionMode(configuredCloudDatabaseUrl);
  const databaseUrl = cloudDbActive
    ? configuredCloudDatabaseUrl || env["DATABASE_URL"] || ""
    : env["DATABASE_URL"] || configuredCloudDatabaseUrl || "";
  const databaseSource = cloudDbActive
    ? cloudDatabaseSource !== "none"
      ? cloudDatabaseSource
      : hasValue(env["DATABASE_URL"])
        ? "DATABASE_URL"
        : "none"
    : hasValue(env["DATABASE_URL"])
      ? "DATABASE_URL"
      : cloudDatabaseSource !== "none"
        ? cloudDatabaseSource
        : "none";
  const appBaseUrl = normalizeAppBaseUrl(env["APP_BASE_URL"]);
  const cloud = assessCloudReadiness(env as NodeJS.ProcessEnv);
  const objectStorageConfigured =
    hasValue(env["R2_BUCKET"]) &&
    hasValue(env["R2_ENDPOINT"]) &&
    hasValue(env["R2_ACCESS_KEY_ID"]) &&
    hasValue(env["R2_SECRET_ACCESS_KEY"]);
  const databaseProvider = detectDatabaseProvider(databaseUrl);
  const objectStorageProvider = objectStorageConfigured ? "r2" : "none";
  const activationBlockers: string[] = [];

  if (cloudDbRequested && cloudDbRuntime === "fallback") {
    activationBlockers.push("Cloud database activation failed; Traceplane is running on sqlite fallback.");
  }

  if (cloudDbRequested && cloudConnectionMode === "direct") {
    activationBlockers.push(
      "Supabase direct connection is configured. For Railway and other IPv4/serverless environments, use a session pooler URL."
    );
  }

  const deploymentStage = detectDeploymentStage({
    cloudReady: cloud.ready,
    databaseProvider,
    objectStorageProvider,
    cloudDbActive
  });

  return {
    service: "traceplane",
    productDefinition: "Enterprise Agent Work Graph",
    database: {
      urlConfigured: hasValue(databaseUrl),
      provider: databaseProvider,
      source: databaseSource,
      connectionMode: cloudDbActive ? cloudConnectionMode : "local"
    },
    supabase: {
      configured:
        hasValue(env["SUPABASE_PROJECT_URL"]) &&
        hasValue(env["SUPABASE_SECRET_KEY"]) &&
        hasValue(env["SUPABASE_ANON_KEY"]),
      projectUrlConfigured: hasValue(env["SUPABASE_PROJECT_URL"])
    },
    objectStorage: {
      provider: objectStorageProvider,
      configured: objectStorageConfigured,
      bucket: env["R2_BUCKET"] || null
    },
    cloud: {
      mode: cloud.ready ? "cloud-ready" : "demo-local",
      deploymentStage,
      databaseActive: cloudDbActive,
      databaseRequested: cloudDbRequested,
      databaseRuntimeState: cloudDbRuntime,
      activationBlockers,
      readiness: cloud
    },
    appBaseUrl,
    defaultRegion: env["DEFAULT_REGION"] || "global-us-cn",
    syncRootPath: env["SYNC_ROOT_PATH"] || "~/Traceplane",
    localProjection: {
      mode: "cloud-first-projection",
      rootPath: env["SYNC_ROOT_PATH"] || "~/Traceplane"
    }
  } as const;
}
