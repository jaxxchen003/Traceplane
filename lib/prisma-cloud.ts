import { PrismaClient as CloudPrismaClient } from "@/generated/prisma-cloud";

declare global {
  var __traceplane_cloud_prisma__: CloudPrismaClient | undefined;
}

export const prismaCloud =
  global.__traceplane_cloud_prisma__ ??
  new CloudPrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") {
  global.__traceplane_cloud_prisma__ = prismaCloud;
}
