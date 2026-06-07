import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  try {
    const gc = await prisma.tb_grade_curricular.findMany({
      where: {
        codigo_Curso: 5
      },
      include: {
        tb_classes: true,
        tb_disciplinas: true
      }
    });
    console.log(`Found ${gc.length} records in grade curricular for curso 5`);
    console.log(gc.map(g => ({
      classe: g.tb_classes?.designacao,
      classeId: g.codigo_Classe,
      disc: g.tb_disciplinas?.designacao,
      discId: g.codigo_disciplina,
    })));

  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
