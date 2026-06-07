import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  try {
    const notes = await prisma.tb_notas_alunos.findMany({
      where: {
        CodigoAluno: 9
      },
      include: {
        tb_tipo_avaliacao: true
      }
    });

    console.log(notes.map(n => ({
      nota: n.Nota,
      tipoId: n.CodigoTipoAvaliacao,
      tipoDesc: n.tb_tipo_avaliacao?.designacao
    })));

  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
