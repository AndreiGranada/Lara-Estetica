import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

async function main() {
  const envVars = process.env as unknown as Record<string, string | undefined>;
  const connectionString = envVars.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL nao definida para executar seed.");
  }

  const adapter = new PrismaPg(connectionString);
  const prisma = new PrismaClient({ adapter });

  await prisma.couponCounter.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, current: 99 },
  });

  await prisma.$disconnect();
  console.log("Seed concluido: contador de cupom preparado para iniciar em 0100.");
}

main().catch(async (error) => {
  console.error("Falha ao executar seed:", error);
  process.exitCode = 1;
});
