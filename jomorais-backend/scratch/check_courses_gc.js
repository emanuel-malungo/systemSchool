import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  try {
    const gc = await prisma.tb_grade_curricular.findMany({
      include: {
        tb_cursos: true,
        tb_classes: true,
        tb_disciplinas: true
      }
    });

    const coursesMap = {};
    gc.forEach(g => {
      const courseName = g.tb_cursos?.designacao || `Course ${g.codigo_Curso}`;
      if (!coursesMap[courseName]) coursesMap[courseName] = [];
      coursesMap[courseName].push(`${g.tb_classes?.designacao || g.codigo_Classe} - ${g.tb_disciplinas?.designacao}`);
    });

    console.log('Courses and their grade curricular entries in DB:');
    for (const [courseName, list] of Object.entries(coursesMap)) {
      console.log(`\n--- ${courseName} (Total: ${list.length}) ---`);
      console.log(list.slice(0, 10)); // print first 10
    }

  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
