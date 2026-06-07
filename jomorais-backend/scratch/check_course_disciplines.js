import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  try {
    const disciplines = await prisma.tb_disciplinas.findMany({
      include: {
        tb_cursos: true
      }
    });

    const coursesMap = {};
    disciplines.forEach(d => {
      const courseName = d.tb_cursos?.designacao || `Course ${d.codigo_Curso}`;
      if (!coursesMap[courseName]) coursesMap[courseName] = [];
      coursesMap[courseName].push(d.designacao);
    });

    console.log('Courses and their directly linked disciplines:');
    for (const [courseName, list] of Object.entries(coursesMap)) {
      console.log(`\n--- ${courseName} (Total: ${list.length}) ---`);
      console.log(list);
    }

  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
