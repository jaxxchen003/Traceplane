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

export function getRuntimeConfig() {
  const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || "";
  const appBaseUrl = normalizeAppBaseUrl(process.env.APP_BASE_URL);
  const cloud = assessCloudReadiness(process.env);

  return {
    service: "traceplane",
    productDefinition: "Enterprise Agent Work Graph",
    database: {
      urlConfigured: hasValue(databaseUrl),
      provider: detectDatabaseProvider(databaseUrl)
    },
    cloud: {
      mode: cloud.ready ? "cloud-ready" : "demo-local",
      readiness: cloud
    },
    appBaseUrl,
    defaultRegion: process.env.DEFAULT_REGION || "global-us-cn",
    syncRootPath: process.env.SYNC_ROOT_PATH || "~/Traceplane"
  } as const;
}
