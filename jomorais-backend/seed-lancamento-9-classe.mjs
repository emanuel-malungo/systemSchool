import { PrismaClient } from '@prisma/client';
import { CertificatesService } from './src/services/certificates.services.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Iniciando seed de lançamento e certificados para a 9ª classe...');

  try {
    // 1. Encontrar a 9ª classe
    const classe9 = await prisma.tb_classes.findFirst({
      where: { designacao: { contains: '9' } }
    });

    if (!classe9) {
      throw new Error('Classe de 9º ano não encontrada.');
    }

    console.log(`✅ Classe encontrada: ${classe9.designacao} (Código: ${classe9.codigo})`);

    // 2. Encontrar uma turma desta classe
    const turma = await prisma.tb_turmas.findFirst({
      where: { codigo_Classe: classe9.codigo }
    });

    if (!turma) {
      throw new Error('Nenhuma turma encontrada para a 9ª classe.');
    }

    console.log(`✅ Turma encontrada: ${turma.designacao} (Código: ${turma.codigo})`);

    const codigoAnoLectivo = turma.codigo_AnoLectivo;

    // 3. Encontrar confirmações (alunos) para esta turma
    const confirmacoes = await prisma.tb_confirmacoes.findMany({
      where: {
        codigo_Turma: turma.codigo,
        codigo_Ano_lectivo: codigoAnoLectivo
      },
      include: {
        tb_matriculas: {
          include: {
            tb_alunos: true
          }
        }
      }
    });

    if (confirmacoes.length === 0) {
      throw new Error('Nenhum aluno confirmado nesta turma.');
    }

    console.log(`✅ Encontrados ${confirmacoes.length} alunos nesta turma.`);

    // 4. Encontrar disciplinas (Grade curricular da turma/classe)
    const gradeCurricular = await prisma.tb_grade_curricular.findMany({
      where: { codigo_Classe: classe9.codigo }
    });

    const disciplinasIds = gradeCurricular.map(g => g.codigo_disciplina);
    
    if (disciplinasIds.length === 0) {
        // Fallback: pegar todas as disciplinas se a grade não estiver definida
        const todasDisciplinas = await prisma.tb_disciplinas.findMany({ take: 5 });
        todasDisciplinas.forEach(d => disciplinasIds.push(d.codigo));
    }

    console.log(`✅ ${disciplinasIds.length} disciplinas encontradas para lançar notas.`);

    // 5. Trimestres e Tipos de Avaliação
    const trimestres = [1, 2, 3]; // Trimestre 1, 2 e 3
    const tiposAvaliacao = [1, 2, 3]; // 1: MAC, 2: NPP, 3: PT
    
    // Mapeamento para tb_notas_7_9 (simplificado)
    const disciplinasMap = {
      1: 'MAT', 2: 'PT', 3: 'QUIM', 4: 'BIO', 5: 'FIS',
      6: 'GEO', 7: 'HIST', 8: 'LING_ESTR', 9: 'EMC', 10: 'EVP',
      11: 'EMP', 12: 'ED_FIS'
    };

    // 6. Lançar notas e gerar certificados
    for (const conf of confirmacoes) {
      const aluno = conf.tb_matriculas.tb_alunos;
      console.log(`\n👨‍🎓 Processando aluno: ${aluno.nome} (Código: ${aluno.codigo})`);

      const notas79Data = {
        Codigo_Aluno: aluno.codigo,
        Codigo_AnoLectivo: codigoAnoLectivo,
        Codigo_Turma: turma.codigo,
        Codigo_Utilizador: 1,
        DataCadastro: new Date(),
        obs: 'Aprovado',
        desempenho: 'Bom'
      };

      for (const discId of disciplinasIds) {
        const prefix = disciplinasMap[discId] || 'MAT';
        
        for (const trim of trimestres) {
          for (const tipo of tiposAvaliacao) {
            const notaVal = Math.floor(Math.random() * 5) + 14; // 14 a 18

            // Inserir nota na tabela principal
            const existingNota = await prisma.tb_notas_alunos.findFirst({
              where: {
                CodigoAluno: aluno.codigo,
                CodigoDisciplina: discId,
                CodigoAnoLectivo: codigoAnoLectivo,
                CodigoTurma: turma.codigo,
                CodigoTrimestre: trim,
                CodigoTipoAvaliacao: tipo
              }
            });

            if (!existingNota) {
              await prisma.tb_notas_alunos.create({
                data: {
                  CodigoAluno: aluno.codigo,
                  CodigoDisciplina: discId,
                  CodigoAnoLectivo: codigoAnoLectivo,
                  CodigoTurma: turma.codigo,
                  CodigoTrimestre: trim,
                  CodigoTipoAvaliacao: tipo,
                  CodigoUtilizador: 1,
                  Nota: notaVal,
                  DataCadastro: Math.floor(Date.now() / 1000)
                }
              });
            }

            // Popula o objeto tb_notas_7_9
            if (tipo === 1) notas79Data[`${prefix}_AC${trim}`] = notaVal;
            if (tipo === 2) notas79Data[`${prefix}_AC${trim}`] = (notas79Data[`${prefix}_AC${trim}`] + notaVal) / 2; // Media das avaliações contínuas
            if (tipo === 3) notas79Data[`${prefix}_FR${trim}`] = notaVal;
          }
        }
        // Exame
        notas79Data[`${prefix}_EXAME`] = Math.floor(Math.random() * 5) + 14;
      }

      // Inserir ou atualizar tb_notas_7_9
      const existing79 = await prisma.tb_notas_7_9.findFirst({
        where: { Codigo_Aluno: aluno.codigo, Codigo_AnoLectivo: codigoAnoLectivo }
      });
      
      try {
          if (!existing79) {
            await prisma.tb_notas_7_9.create({ data: notas79Data });
            console.log(`   📝 tb_notas_7_9 populado com sucesso.`);
          }
      } catch (err) {
          console.log(`   ⚠️ Aviso: Tabela tb_notas_7_9 não possui todas as disciplinas configuradas ou erro: ${err.message}`);
      }

      // Gerar certificado
      try {
        const cert = await CertificatesService.createCertificate({
          codigoAluno: aluno.codigo,
          codigoAnoLectivo: codigoAnoLectivo,
          observacoes: 'Certificado gerado via Seed automático.'
        });
        console.log(`   🎓 Certificado gerado com sucesso: ${cert.NumeroCertificado}`);
      } catch (err) {
        if(err.message.includes('já existe')) {
           console.log(`   🎓 Certificado já existe.`);
        } else {
           console.log(`   ⚠️ Aviso ao gerar certificado: ${err.message}`);
        }
      }
    }

    console.log('\n🎉 Seed de Lançamento e Certificados concluído com sucesso!');

  } catch (error) {
    console.error('❌ Erro no seed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
