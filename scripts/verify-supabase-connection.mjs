import pg from "pg";
import dns from "node:dns/promises";

import "./_lib/load-env.mjs";

const { Client } = pg;

async function main() {
  const databaseUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL || "";

  if (!databaseUrl.startsWith("postgresql://") && !databaseUrl.startsWith("postgres://")) {
    throw new Error("DATABASE_URL is not configured for Postgres");
  }

  const url = new URL(databaseUrl);
  const ipv4 = await dns.lookup(url.hostname, { family: 4 });

  const client = new Client({
    host: ipv4.address,
    port: Number(url.port || 5432),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.replace(/^\//, "")),
    ssl: {
      rejectUnauthorized: false,
      servername: url.hostname
    }
  });

  await client.connect();
  const result = await client.query(
    "select current_database() as database, current_user as user, version() as version"
  );
  await client.end();

  console.log(
    JSON.stringify(
      {
        ok: true,
        provider: "postgres",
        connection: result.rows?.[0] ?? null
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error(
      JSON.stringify(
        {
          ok: false,
          provider: "postgres",
          error: error instanceof Error ? error.message : String(error)
        },
        null,
        2
      )
    );
    process.exit(1);
  });
