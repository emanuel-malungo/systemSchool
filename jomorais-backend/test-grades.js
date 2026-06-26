import { PrismaClient } from '@prisma/client';
import { GradeManagementService } from './src/services/grade-management.services.js';

const prisma = new PrismaClient();

async function run() {
  console.log("Iniciando Lançamento de Notas de Teste para a Turma Ideal (Turma 252 - 10ª C.E.J)...");
  
  const turmaId = 252;
  
  const turma = await prisma.tb_turmas.findUnique({
    where: { codigo: turmaId },
    include: { tb_cursos: true, tb_classes: true }
  });

  if (!turma) {
    console.error(`Turma ${turmaId} não encontrada!`);
    return;
  }

  // Pegar todos os alunos matriculados nesta turma independentemente do ano
  const confirmacoes = await prisma.tb_confirmacoes.findMany({
    where: { codigo_Turma: turmaId },
    include: { tb_matriculas: { include: { tb_alunos: true } } }
  });

  const alunos = confirmacoes.map(c => c.tb_matriculas?.tb_alunos).filter(Boolean);
  
  console.log(`Encontrados ${alunos.length} alunos na turma.`);

  if (alunos.length === 0) return;

  const anoLectivo = await prisma.tb_ano_lectivo.findUnique({
    where: { codigo: confirmacoes[0].codigo_Ano_lectivo }
  });

  console.log(`Turma selecionada: ${turma.designacao} (Ano: ${anoLectivo?.designacao})`);

  const grade = await prisma.tb_grade_curricular.findMany({
    where: {
      codigo_Curso: turma.codigo_curso,
      codigo_Classe: turma.codigo_Classe
    },
    include: { tb_disciplinas: true }
  });

  console.log(`Encontradas ${grade.length} disciplinas para esta turma.`);

  const trimestres = await prisma.tb_trimestres.findMany({ take: 1 }); // Vamos focar apenas no 1º Trimestre para ser mais rápido
  const mac = await prisma.tb_tipo_avaliacao.findFirst({ where: { designacao: { contains: 'MAC' } } });
  const pp = await prisma.tb_tipo_avaliacao.findFirst({ where: { designacao: { contains: 'PP' } } });
  const pt = await prisma.tb_tipo_avaliacao.findFirst({ where: { designacao: { contains: 'PT' } } });

  const tiposAvaliacao = [];
  if (mac) tiposAvaliacao.push(mac.codigo);
  if (pp) tiposAvaliacao.push(pp.codigo);
  if (pt) tiposAvaliacao.push(pt.codigo);

  console.log(`Inserindo notas aleatórias para MAC, PP, e PT... Aguarde uns segundos.`);
  
  let notasInseridas = 0;

  for (const aluno of alunos) {
    for (const g of grade) {
      for (const trimestre of trimestres) {
        for (const tipo of tiposAvaliacao) {
          try {
            // Gerar nota ligeiramente realista: 8 a 18
            const notaVal = Math.floor(Math.random() * 11) + 8; 
            await GradeManagementService.createGrade({
              codigoAluno: aluno.codigo,
              codigoDisciplina: g.codigo_disciplina,
              nota: notaVal,
              codigoAnoLectivo: anoLectivo.codigo,
              codigoTipoAvaliacao: tipo,
              codigoTrimestre: trimestre.codigo,
              codigoTurma: turma.codigo,
              codigoUtilizador: 1
            });
            notasInseridas++;
          } catch (e) {
            // Se a nota já existir, ou houver erro, ignora
          }
        }
      }
    }
  }

  console.log(`\n==========================================`);
  console.log(`Seed de notas concluído com sucesso!`);
  console.log(`${notasInseridas} notas foram inseridas no sistema.`);
  console.log(`==========================================\n`);
  console.log(`>>> AGORA PODE TESTAR:`);
  console.log(`Vá à listagem de Pautas e faça Download do Excel para:`);
  console.log(`- Turma: ${turma.designacao}`);
  console.log(`- Trimestre: 1º Trimestre`);
  console.log(`- Ano Lectivo: ${anoLectivo.designacao}`);
  
  process.exit(0);
}

run().catch(console.error);
