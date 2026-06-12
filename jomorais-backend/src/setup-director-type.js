import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.tb_tipos_utilizador.findFirst({
    where: { designacao: 'DIRECTOR DE TURMA' }
  });

  if (!existing) {
    const maxTipo = await prisma.tb_tipos_utilizador.findFirst({
      orderBy: { codigo: 'desc' }
    });
    const proximoCodigo = maxTipo ? maxTipo.codigo + 1 : 1;
    
    await prisma.tb_tipos_utilizador.create({
      data: {
        codigo: proximoCodigo,
        designacao: 'DIRECTOR DE TURMA'
      }
    });
    console.log(`Created DIRECTOR DE TURMA with codigo ${proximoCodigo}`);
  } else {
    console.log(`DIRECTOR DE TURMA already exists with codigo ${existing.codigo}`);
  }
}

main().finally(() => prisma.$disconnect());
