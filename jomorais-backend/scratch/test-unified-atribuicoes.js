import prisma from 'file:///c:/Users/User/Videos/project/backend/systemSchool/jomorais-backend/src/config/database.js';

async function test() {
  try {
    console.log('--- TESTANDO ATRIBUIÇÕES NO JOMORAIS ---');
    
    // 1. Verificar registros atuais
    const profs = await prisma.tb_professores.findMany({ take: 3 });
    const discs = await prisma.tb_disciplinas.findMany({ take: 3 });
    const cursos = await prisma.tb_cursos.findMany({ take: 3 });
    const turmas = await prisma.tb_turmas.findMany({ take: 3 });

    console.log('Professores encontrados:', profs.map(p => ({ Codigo: p.Codigo, Nome: p.Nome })));
    console.log('Disciplinas encontradas:', discs.map(d => ({ codigo: d.codigo, designacao: d.designacao })));
    console.log('Cursos encontrados:', cursos.map(c => ({ codigo: c.codigo, designacao: c.designacao })));
    console.log('Turmas encontradas:', turmas.map(t => ({ codigo: t.codigo, designacao: t.designacao })));

    if (profs.length === 0 || discs.length === 0 || cursos.length === 0) {
      console.log('Dados insuficientes para criar uma atribuição de teste.');
      return;
    }

    const professorId = profs[0].Codigo;
    const disciplinaId = discs[0].codigo;
    const cursoId = cursos[0].codigo;
    const anoLectivo = '2024/2025';

    console.log(`\nTentando criar atribuição de teste para Professor ${professorId}, Disciplina ${disciplinaId}, Curso ${cursoId}, Ano Letivo ${anoLectivo}...`);

    // 2. Simular o que a rota POST /api/professor-disciplinas faz (com transação prisma e sync legada)
    const atribuicao = await prisma.$transaction(async (tx) => {
      // Verificar se já existe
      const exists = await tx.tb_professor_disciplina.findFirst({
        where: {
          Codigo_Professor: professorId,
          Codigo_Disciplina: disciplinaId,
          Codigo_Curso: cursoId,
          AnoLectivo: anoLectivo,
          Status: 'Activo'
        }
      });

      if (exists) {
        console.log('Atribuição de teste já existe.');
        return exists;
      }

      const created = await tx.tb_professor_disciplina.create({
        data: {
          Codigo_Professor: professorId,
          Codigo_Disciplina: disciplinaId,
          Codigo_Curso: cursoId,
          AnoLectivo: anoLectivo,
          Status: 'Activo'
        }
      });

      // Sincronizar com o legado tb_disciplinas_docente
      const codigoDocente = parseInt(professorId);
      const existsLegacy = await tx.tb_disciplinas_docente.findFirst({
        where: {
          codigoDocente: codigoDocente,
          codigoDisciplina: parseInt(disciplinaId),
          codigoCurso: parseInt(cursoId)
        }
      });

      if (!existsLegacy) {
        await tx.tb_disciplinas_docente.create({
          data: {
            codigoDocente: codigoDocente,
            codigoDisciplina: parseInt(disciplinaId),
            codigoCurso: parseInt(cursoId)
          }
        });
        console.log('[SYNC LEGACY SUCCESS] Criou associação tb_disciplinas_docente');
      }

      return created;
    });

    console.log('Atribuição criada/confirmada:', atribuicao);

    // 3. Listar as atribuições
    const todasAtribuicoes = await prisma.tb_professor_disciplina.findMany({
      where: { Codigo_Professor: professorId },
      include: {
        tb_professores: { select: { Nome: true } },
        tb_disciplinas: { select: { designacao: true } },
        tb_cursos: { select: { designacao: true } }
      }
    });
    console.log('\nAtribuições ativas do professor no banco de dados:', todasAtribuicoes);

    // 4. Testar exclusão com transação prisma e sync legada
    console.log(`\nTentando excluir atribuição de teste de código ${atribuicao.Codigo}...`);
    await prisma.$transaction(async (tx) => {
      await tx.tb_professor_disciplina.delete({
        where: { Codigo: atribuicao.Codigo }
      });

      // Contar quantas atribuições ativas restam para essa combinação
      const count = await tx.tb_professor_disciplina.count({
        where: {
          Codigo_Professor: professorId,
          Codigo_Disciplina: disciplinaId,
          Codigo_Curso: cursoId,
          Status: 'Activo'
        }
      });

      if (count === 0) {
        await tx.tb_disciplinas_docente.deleteMany({
          where: {
            codigoDocente: professorId,
            codigoDisciplina: disciplinaId,
            codigoCurso: cursoId
          }
        });
        console.log('[SYNC LEGACY SUCCESS] Removeu associação tb_disciplinas_docente');
      }
    });

    console.log('Exclusão e sincronização legada bem sucedidas!');

  } catch (error) {
    console.error('Erro durante o teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
