import fs from "node:fs";
import path from "node:path";

const cwd = process.cwd();
const envLocalPath = path.join(cwd, ".env.local");

function parseEnv(content) {
  const entries = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq);
    let value = trimmed.slice(eq + 1);
    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    entries[key] = value;
  }
  return entries;
}

const result = {
  env_local_exists: fs.existsSync(envLocalPath),
  checks: [],
  next_steps: []
};

if (!result.env_local_exists) {
  result.next_steps.push("Create .env.local with cloud credentials.");
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

const env = parseEnv(fs.readFileSync(envLocalPath, "utf8"));

const required = [
  "SUPABASE_PROJECT_URL",
  "SUPABASE_DB_URL",
  "SUPABASE_SECRET_KEY",
  "SUPABASE_ANON_KEY",
  "CLOUDFLARE_ACCOUNT_ID",
  "R2_BUCKET",
  "R2_ENDPOINT",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "APP_BASE_URL",
  "DEFAULT_REGION",
  "SYNC_ROOT_PATH"
];

for (const key of required) {
  result.checks.push({
    item: key,
    ok: Boolean(env[key] && env[key].trim().length > 0)
  });
}

result.checks.push({
  item: "supabase_db_url_is_postgres",
  ok: (env.SUPABASE_DB_URL || "").startsWith("postgresql://")
});

result.checks.push({
  item: "app_base_url_has_protocol",
  ok: /^https?:\/\//.test(env.APP_BASE_URL || "")
});

result.checks.push({
  item: "sync_root_path_present",
  ok: (env.SYNC_ROOT_PATH || "").length > 0
});

const hasFailures = result.checks.some((check) => !check.ok);

if (hasFailures) {
  result.next_steps.push("Fill the missing or invalid cloud variables in .env.local");
} else {
  result.next_steps.push("Cloud config is locally complete. Next step is verifying live network connectivity.");
  result.next_steps.push("When network access is allowed, run Prisma against Supabase and verify R2 credentials.");
}

console.log(JSON.stringify(result, null, 2));
