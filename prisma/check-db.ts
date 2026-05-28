import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  const leads = await prisma.lead.findMany({
    orderBy: { id: "desc" },
    take: 5,
  });

  const counter = await prisma.couponCounter.findUnique({
    where: { id: 1 },
  });

  console.log("DB_LEADS:" + JSON.stringify(leads));
  console.log("DB_COUNTER:" + JSON.stringify(counter));
}

main()
  .catch((error) => {
    console.error("CHECK_DB_ERROR:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
