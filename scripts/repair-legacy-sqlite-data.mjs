import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const updates = [
    ["UPDATE Episode SET status = 'IN_REVIEW' WHERE status = 'PENDING_REVIEW'"]
  ];

  for (const [statement] of updates) {
    await prisma.$executeRawUnsafe(statement);
  }

  console.log("[traceplane] legacy sqlite value repair complete");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
