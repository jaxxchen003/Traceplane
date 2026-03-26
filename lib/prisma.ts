import { PrismaClient } from "@prisma/client";
import { prismaCloud } from "@/lib/prisma-cloud";

declare global {
  var __traceplane_sqlite_prisma__: PrismaClient | undefined;
}

const sqlitePrisma =
  global.__traceplane_sqlite_prisma__ ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") {
  global.__traceplane_sqlite_prisma__ = sqlitePrisma;
}

const cloudPrisma = prismaCloud as unknown as PrismaClient;
const useCloudDatabase =
  process.env.TRACEPLANE_CLOUD_DB_ACTIVE === "true" &&
  Boolean(process.env.SUPABASE_DB_URL);

export const activePrisma = useCloudDatabase ? cloudPrisma : sqlitePrisma;

export { activePrisma as prisma };
