import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  try {
    const disciplines = await prisma.tb_disciplinas.findMany({
      where: {
        codigo_Curso: 5
      }
    });

    console.log(`Disciplines linked directly to course 5: ${disciplines.length}`);
    console.log(disciplines.map(d => ({
      codigo: d.codigo,
      designacao: d.designacao,
      status: d.status
    })));

  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
