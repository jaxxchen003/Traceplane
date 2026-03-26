function hasValue(value: string | undefined) {
  return Boolean(value && value.trim().length > 0);
}

export function resolveCloudDatabaseUrl(env: NodeJS.ProcessEnv | Record<string, string | undefined>) {
  return env.SUPABASE_POOLER_URL || env.SUPABASE_DB_URL || "";
}

export function detectCloudDatabaseSource(env: NodeJS.ProcessEnv | Record<string, string | undefined>) {
  if (hasValue(env.SUPABASE_POOLER_URL)) {
    return "SUPABASE_POOLER_URL";
  }

  if (hasValue(env.SUPABASE_DB_URL)) {
    return "SUPABASE_DB_URL";
  }

  return "none";
}

export function detectSupabaseConnectionMode(databaseUrl: string | undefined) {
  if (!hasValue(databaseUrl)) {
    return "none";
  }

  if (databaseUrl!.includes("pooler.supabase.com") || databaseUrl!.includes(":6543")) {
    return "pooler";
  }

  if (databaseUrl!.includes(".supabase.co")) {
    return "direct";
  }

  return "external";
}
