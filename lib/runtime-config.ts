type CloudReadiness = {
  ready: boolean;
  blockers: string[];
};

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

  if (!hasValue(env.DATABASE_URL) && !hasValue(env.SUPABASE_DB_URL)) {
    blockers.push("Missing DATABASE_URL / SUPABASE_DB_URL");
  }

  if ((env.DATABASE_URL || env.SUPABASE_DB_URL || "").includes("[YOUR-PASSWORD]")) {
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
  objectStorageProvider
}: {
  cloudReady: boolean;
  databaseProvider: string;
  objectStorageProvider: string;
}) {
  if (cloudReady && databaseProvider === "postgres" && objectStorageProvider === "r2") {
    return "cloud-active";
  }

  if (cloudReady) {
    return "cloud-configured";
  }

  return "demo-local";
}

export function getRuntimeConfig() {
  const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || "";
  const databaseSource = hasValue(process.env.DATABASE_URL)
    ? "DATABASE_URL"
    : hasValue(process.env.SUPABASE_DB_URL)
      ? "SUPABASE_DB_URL"
      : "none";
  const appBaseUrl = normalizeAppBaseUrl(process.env.APP_BASE_URL);
  const cloud = assessCloudReadiness(process.env);
  const objectStorageConfigured =
    hasValue(process.env.R2_BUCKET) &&
    hasValue(process.env.R2_ENDPOINT) &&
    hasValue(process.env.R2_ACCESS_KEY_ID) &&
    hasValue(process.env.R2_SECRET_ACCESS_KEY);
  const databaseProvider = detectDatabaseProvider(databaseUrl);
  const objectStorageProvider = objectStorageConfigured ? "r2" : "none";
  const deploymentStage = detectDeploymentStage({
    cloudReady: cloud.ready,
    databaseProvider,
    objectStorageProvider
  });

  return {
    service: "traceplane",
    productDefinition: "Enterprise Agent Work Graph",
    database: {
      urlConfigured: hasValue(databaseUrl),
      provider: databaseProvider,
      source: databaseSource
    },
    supabase: {
      configured:
        hasValue(process.env.SUPABASE_PROJECT_URL) &&
        hasValue(process.env.SUPABASE_SECRET_KEY) &&
        hasValue(process.env.SUPABASE_ANON_KEY),
      projectUrlConfigured: hasValue(process.env.SUPABASE_PROJECT_URL)
    },
    objectStorage: {
      provider: objectStorageProvider,
      configured: objectStorageConfigured,
      bucket: process.env.R2_BUCKET || null
    },
    cloud: {
      mode: cloud.ready ? "cloud-ready" : "demo-local",
      deploymentStage,
      readiness: cloud
    },
    appBaseUrl,
    defaultRegion: process.env.DEFAULT_REGION || "global-us-cn",
    syncRootPath: process.env.SYNC_ROOT_PATH || "~/Traceplane",
    localProjection: {
      mode: "cloud-first-projection",
      rootPath: process.env.SYNC_ROOT_PATH || "~/Traceplane"
    }
  } as const;
}
