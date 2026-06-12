import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tipos = await prisma.tb_tipos_utilizador.findMany();
  console.log(tipos);
}
main().finally(() => prisma.$disconnect());
