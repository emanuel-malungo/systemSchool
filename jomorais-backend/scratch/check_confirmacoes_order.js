import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  try {
    const confirmacoes = await prisma.tb_confirmacoes.findMany({
      where: {
        codigo_Turma: 35
      },
      include: {
        tb_matriculas: {
          include: {
            tb_alunos: true
          }
        }
      },
      orderBy: { codigo: 'asc' }
    });

    console.log(confirmacoes.map((c, idx) => ({
      numero: idx + 1,
      confirmacaoCodigo: c.codigo,
      alunoCodigo: c.tb_matriculas?.tb_alunos?.codigo,
      alunoNome: c.tb_matriculas?.tb_alunos?.nome
    })));

  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
