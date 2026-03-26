import "./_lib/load-env.mjs";

function summarize(name, options = {}) {
  const value = process.env[name];
  const present = Boolean(value && value.trim().length > 0);
  const kind = options.kind || "secret";

  return {
    name,
    present,
    kind,
    target: options.target || "server",
    note: options.note || null
  };
}

const manifest = {
  service: "traceplane",
  deployTarget: "railway",
  env: [
    summarize("DATABASE_URL", { note: "Optional until Prisma cutover to Postgres is complete." }),
    summarize("SUPABASE_PROJECT_URL", { kind: "public-config" }),
    summarize("SUPABASE_POOLER_URL", {
      note: "Preferred for Railway/serverless Postgres activation."
    }),
    summarize("SUPABASE_DB_URL"),
    summarize("SUPABASE_SECRET_KEY"),
    summarize("SUPABASE_ANON_KEY", { kind: "public-config" }),
    summarize("CLOUDFLARE_ACCOUNT_ID", { kind: "public-config" }),
    summarize("R2_BUCKET", { kind: "public-config" }),
    summarize("R2_ENDPOINT", { kind: "public-config" }),
    summarize("R2_ACCESS_KEY_ID"),
    summarize("R2_SECRET_ACCESS_KEY"),
    summarize("APP_BASE_URL", { kind: "public-config" }),
    summarize("DEFAULT_REGION", { kind: "public-config" }),
    summarize("SYNC_ROOT_PATH", {
      kind: "runtime-config",
      note: "Only used by local projection and sync tooling."
    })
  ]
};

console.log(JSON.stringify(manifest, null, 2));
