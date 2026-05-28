import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  await prisma.$transaction([
    prisma.lead.deleteMany(),
    prisma.couponCounter.upsert({
      where: { id: 1 },
      update: { current: 99 },
      create: { id: 1, current: 99 },
    }),
  ]);

  console.log("Reset concluido: leads removidos e contador preparado para iniciar em 0100.");
}

main()
  .catch((error) => {
    console.error("Falha ao resetar dados:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
