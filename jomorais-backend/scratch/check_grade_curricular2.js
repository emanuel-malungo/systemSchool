import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  try {
    // Turma 35 = 13ª Informática, codigo_Classe=13, codigo_Curso=5
    const gc = await prisma.tb_grade_curricular.findMany({
      where: { codigo_Classe: 13, codigo_Curso: 5 },
      include: { tb_disciplinas: { select: { codigo: true, designacao: true } } }
    });
    console.log(`Grade curricular for 13ª Informática: ${gc.length} entries`);
    gc.forEach(g => console.log(`  - [${g.codigo_disciplina}] ${g.tb_disciplinas?.designacao}`));

    // Also try without class filter
    const gcCurso = await prisma.tb_grade_curricular.findMany({
      where: { codigo_Curso: 5 },
      include: { tb_disciplinas: { select: { codigo: true, designacao: true } } }
    });
    console.log(`\nGrade curricular for Curso 5 (any class): ${gcCurso.length} entries`);
    gcCurso.forEach(g => console.log(`  - Classe ${g.codigo_Classe} [${g.codigo_disciplina}] ${g.tb_disciplinas?.designacao}`));
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}
check();
