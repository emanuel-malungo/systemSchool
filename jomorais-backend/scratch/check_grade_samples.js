import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  try {
    // Let's look for a class that has grade curricular entries
    const grades = await prisma.tb_grade_curricular.findMany({
      take: 20,
      include: {
        tb_classes: true,
        tb_cursos: true,
        tb_disciplinas: true
      }
    });

    console.log('Sample Grade Curricular entries:');
    console.log(grades.map(g => ({
      class: g.tb_classes?.designacao,
      course: g.tb_cursos?.designacao,
      discipline: g.tb_disciplinas?.designacao
    })));

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
