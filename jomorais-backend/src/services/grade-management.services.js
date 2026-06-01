// services/grade-management.services.js
import prisma from '../config/database.js';
import { AppError } from '../utils/validation.utils.js';

export class GradeManagementService {
  // ===============================
  // LANÇAMENTO DE NOTAS - CRUD
  // ===============================

  static async createGrade(data) {
    try {
      const {
        codigoAluno,
        codigoDisciplina,
        nota,
        codigoAnoLectivo,
        codigoTipoAvaliacao,
        codigoTrimestre,
        codigoTurma,
        codigoUtilizador
      } = data;

      // Validações básicas
      if (
        !codigoAluno ||
        !codigoDisciplina ||
        nota === undefined ||
        !codigoAnoLectivo ||
        !codigoTipoAvaliacao ||
        !codigoTrimestre ||
        !codigoUtilizador
      ) {
        throw new AppError(
          'Campos obrigatórios: codigoAluno, codigoDisciplina, nota, codigoAnoLectivo, codigoTipoAvaliacao, codigoTrimestre, codigoUtilizador',
          400
        );
      }

      // Validar nota entre 0 e 20
      if (nota < 0 || nota > 20) {
        throw new AppError('Nota deve estar entre 0 e 20', 400);
      }

      // Validar entidades relacionadas
      const [aluno, disciplina, anoLectivo, tipoAvaliacao, trimestre, utilizador] = await Promise.all([
        prisma.tb_alunos.findUnique({ where: { codigo: parseInt(codigoAluno) } }),
        prisma.tb_disciplinas.findUnique({ where: { codigo: parseInt(codigoDisciplina) } }),
        prisma.tb_ano_lectivo.findUnique({ where: { codigo: parseInt(codigoAnoLectivo) } }),
        prisma.tb_tipo_avaliacao.findUnique({ where: { codigo: parseInt(codigoTipoAvaliacao) } }),
        prisma.tb_trimestres.findUnique({ where: { codigo: parseInt(codigoTrimestre) } }),
        prisma.tb_utilizadores.findUnique({ where: { codigo: parseInt(codigoUtilizador) } })
      ]);

      if (!aluno) throw new AppError('Aluno não encontrado', 404);
      if (!disciplina) throw new AppError('Disciplina não encontrada', 404);
      if (!anoLectivo) throw new AppError('Ano letivo não encontrado', 404);
      if (!tipoAvaliacao) throw new AppError('Tipo de avaliação não encontrado', 404);
      if (!trimestre) throw new AppError('Trimestre não encontrado', 404);
      if (!utilizador) throw new AppError('Utilizador não encontrado', 404);

      // Validar turma se fornecida
      if (codigoTurma) {
        const turmaExists = await prisma.tb_turmas.findUnique({
          where: { codigo: parseInt(codigoTurma) }
        });
        if (!turmaExists) throw new AppError('Turma não encontrada', 404);
      }

      // Verificar se já existe nota para este aluno/disciplina/avaliação/trimestre
      const existingGrade = await prisma.tb_notas_alunos.findFirst({
        where: {
          CodigoAluno: parseInt(codigoAluno),
          CodigoDisciplina: parseInt(codigoDisciplina),
          CodigoTipoAvaliacao: parseInt(codigoTipoAvaliacao),
          CodigoTrimestre: parseInt(codigoTrimestre),
          CodigoAnoLectivo: parseInt(codigoAnoLectivo)
        }
      });

      if (existingGrade) {
        throw new AppError(
          'Já existe uma nota para este aluno nesta disciplina e avaliação',
          409
        );
      }

      // Criar nota
      const grade = await prisma.tb_notas_alunos.create({
        data: {
          CodigoAluno: parseInt(codigoAluno),
          CodigoDisciplina: parseInt(codigoDisciplina),
          Nota: parseFloat(nota),
          CodigoAnoLectivo: parseInt(codigoAnoLectivo),
          CodigoTipoAvaliacao: parseInt(codigoTipoAvaliacao),
          CodigoTrimestre: parseInt(codigoTrimestre),
          CodigoTurma: codigoTurma ? parseInt(codigoTurma) : null,
          CodigoUtilizador: parseInt(codigoUtilizador),
          DataCadastro: Math.floor(Date.now() / 1000) // Unix timestamp em segundos
        },
        include: {
          tb_alunos: { select: { codigo: true, nome: true } },
          tb_disciplinas: { select: { codigo: true, designacao: true } },
          tb_tipo_avaliacao: { select: { codigo: true, designacao: true } },
          tb_trimestres: { select: { codigo: true, designacao: true } }
        }
      });

      return {
        ...grade,
        mensagem: 'Nota lançada com sucesso'
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Erro detalhado ao criar nota:', error);
      throw new AppError(`Erro ao lançar nota: ${error.message}`, 500);
    }
  }

  static async updateGrade(id, data) {
    try {
      const gradeId = parseInt(id);

      const existingGrade = await prisma.tb_notas_alunos.findUnique({
        where: { Codigo: gradeId }
      });

      if (!existingGrade) {
        throw new AppError('Nota não encontrada', 404);
      }

      // Validar nota se fornecida
      if (data.nota !== undefined) {
        if (data.nota < 0 || data.nota > 20) {
          throw new AppError('Nota deve estar entre 0 e 20', 400);
        }
      }

      // Preparar dados de atualização
      const updateData = {};

      if (data.nota !== undefined) {
        updateData.Nota = parseFloat(data.nota);
      }

      // Registrar na auditoria se houve mudança
      if (updateData.Nota !== undefined && updateData.Nota !== existingGrade.Nota) {
        await prisma.tb_historico_notas.create({
          data: {
            Codigo_Nota: gradeId,
            CampoAlterado: 'Nota',
            ValorAnterior: existingGrade.Nota,
            ValorNovo: updateData.Nota,
            MotivoAlteracao: data.motivo || 'Atualização de nota',
            AlteradoPor: data.codigoUtilizador ? parseInt(data.codigoUtilizador) : 1,
            DataAlteracao: new Date()
          }
        });
      }

      const updated = await prisma.tb_notas_alunos.update({
        where: { Codigo: gradeId },
        data: updateData,
        include: {
          tb_alunos: { select: { codigo: true, nome: true } },
          tb_disciplinas: { select: { codigo: true, designacao: true } },
          tb_tipo_avaliacao: { select: { codigo: true, designacao: true } },
          tb_trimestres: { select: { codigo: true, designacao: true } }
        }
      });

      return {
        ...updated,
        mensagem: 'Nota atualizada com sucesso'
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Erro ao atualizar nota: ${error.message}`, 500);
    }
  }

  static async getGrades(page = 1, limit = 10, filters = {}) {
    try {
      const skip = (page - 1) * limit;

      const where = {};
      if (filters.codigoAluno) where.CodigoAluno = parseInt(filters.codigoAluno);
      if (filters.codigoDisciplina) where.CodigoDisciplina = parseInt(filters.codigoDisciplina);
      // Note: CodigoTurma filter commented out as column doesn't exist in db yet
      // if (filters.codigoTurma) where.CodigoTurma = parseInt(filters.codigoTurma);
      if (filters.codigoTrimestre) where.CodigoTrimestre = parseInt(filters.codigoTrimestre);
      if (filters.codigoAnoLectivo) where.CodigoAnoLectivo = parseInt(filters.codigoAnoLectivo);

      const [grades, total] = await Promise.all([
        prisma.tb_notas_alunos.findMany({
          where,
          skip,
          take: parseInt(limit),
          include: {
            tb_alunos: { select: { codigo: true, nome: true } },
            tb_disciplinas: { select: { codigo: true, designacao: true } },
            tb_tipo_avaliacao: { select: { codigo: true, designacao: true } },
            tb_trimestres: { select: { codigo: true, designacao: true } },
            tb_turmas: { select: { codigo: true, designacao: true } }
          },
          orderBy: [{ CodigoTrimestre: 'asc' }, { tb_alunos: { nome: 'asc' } }]
        }),
        prisma.tb_notas_alunos.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: grades,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        }
      };
    } catch (error) {
      console.error('Erro ao buscar notas:', error);
      throw new AppError(`Erro ao buscar notas: ${error.message}`, 500);
    }
  }

  static async getGradeById(id) {
    try {
      const grade = await prisma.tb_notas_alunos.findUnique({
        where: { Codigo: parseInt(id) },
        include: {
          tb_alunos: { select: { codigo: true, nome: true } },
          tb_disciplinas: { select: { codigo: true, designacao: true } },
          tb_tipo_avaliacao: { select: { codigo: true, designacao: true } },
          tb_trimestres: { select: { codigo: true, designacao: true } },
          tb_turmas: { select: { codigo: true, designacao: true } }
        }
      });

      if (!grade) {
        throw new AppError('Nota não encontrada', 404);
      }

      return grade;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Erro ao buscar nota: ${error.message}`, 500);
    }
  }

  static async deleteGrade(id) {
    try {
      const grade = await prisma.tb_notas_alunos.findUnique({
        where: { Codigo: parseInt(id) }
      });

      if (!grade) {
        throw new AppError('Nota não encontrada', 404);
      }

      await prisma.tb_notas_alunos.delete({
        where: { Codigo: parseInt(id) }
      });

      return {
        mensagem: 'Nota removida com sucesso'
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Erro ao remover nota: ${error.message}`, 500);
    }
  }

  // ===============================
  // PAUTA (CONSOLIDAÇÃO DE NOTAS)
  // ===============================

  static async exportPautaPDF(codigoTurma, codigoTrimestre, codigoAnoLectivo) {
    // Reuse existing pauta generation logic
    const pautaData = await this.generatePauta(codigoTurma, codigoTrimestre, codigoAnoLectivo);
    const PDFDocument = (await import('pdfkit')).default;
    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {});
    // Header
    doc.fontSize(16).text('Pauta de Turma', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Turma: ${pautaData.turma} | Trimestre: ${pautaData.trimestre} | Ano Lectivo: ${pautaData.anoLectivo}`);
    doc.moveDown();
    // Table header
    doc.font('Helvetica-Bold');
    doc.text('Aluno', 50, doc.y, { continued: true });
    doc.text('Disciplina', 200, doc.y, { continued: true });
    doc.text('Nota', 350, doc.y);
    doc.moveDown();
    doc.font('Helvetica');
    // Iterate alunos
    for (const [alunoId, info] of Object.entries(pautaData.pauta)) {
      const alunoNome = info.aluno?.nome || 'N/A';
      if (info.disciplinas && info.disciplinas.length) {
        for (const d of info.disciplinas) {
          doc.text(alunoNome, 50, doc.y, { continued: true });
          doc.text(d.disciplina, 200, doc.y, { continued: true });
          doc.text(d.nota !== undefined ? d.nota.toString() : '-', 350, doc.y);
          doc.moveDown();
        }
      } else {
        doc.text(alunoNome, 50, doc.y, { continued: true });
        doc.text('-', 200, doc.y, { continued: true });
        doc.text('-', 350, doc.y);
        doc.moveDown();
      }
    }
    doc.end();
    return Buffer.concat(buffers);
  }

  static async exportPautaExcel(codigoTurma, codigoTrimestre, codigoAnoLectivo) {
    const pautaData = await this.generatePauta(codigoTurma, codigoTrimestre, codigoAnoLectivo);
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Pauta');
    // Header rows
    sheet.addRow(['Pauta de Turma']);
    sheet.addRow([`Turma: ${pautaData.turma}`, `Trimestre: ${pautaData.trimestre}`, `Ano Lectivo: ${pautaData.anoLectivo}`]);
    sheet.addRow([]);
    // Table header
    sheet.addRow(['Aluno', 'Disciplina', 'Nota']);
    // Data rows
    for (const [alunoId, info] of Object.entries(pautaData.pauta)) {
      const alunoNome = info.aluno?.nome || 'N/A';
      if (info.disciplinas && info.disciplinas.length) {
        for (const d of info.disciplinas) {
          sheet.addRow([alunoNome, d.disciplina, d.nota !== undefined ? d.nota : '-']);
        }
      } else {
        sheet.addRow([alunoNome, '-', '-']);
      }
    }
    // Auto width
    sheet.columns.forEach(col => { col.width = 20; });
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  static async generatePauta(codigoTurma, codigoTrimestre, codigoAnoLectivo) {
    try {
      // Step 1: Buscar todos os alunos confirmados nesta turma e ano letivo
      const confirmacoes = await prisma.tb_confirmacoes.findMany({
        where: {
          codigo_Turma: parseInt(codigoTurma),
          codigo_Ano_lectivo: parseInt(codigoAnoLectivo)
        },
        include: {
          tb_matriculas: {
            include: {
              tb_alunos: { select: { codigo: true, nome: true } }
            }
          }
        }
      });
      if (confirmacoes.length === 0) {
        throw new AppError('Nenhum aluno confirmado para esta turma e ano letivo', 400);
      }



      // Step 2: Para cada aluno, buscar suas notas no trimestre
      const pautaPorAluno = {};
      
      for (const confirmacao of confirmacoes) {
        const aluno = confirmacao.tb_matriculas.tb_alunos;
        const codigoAluno = aluno.codigo;

        // Buscar notas do aluno neste trimestre e ano letivo
        const notas = await prisma.tb_notas_alunos.findMany({
          where: {
            CodigoAluno: codigoAluno,
            CodigoTrimestre: parseInt(codigoTrimestre),
            CodigoAnoLectivo: parseInt(codigoAnoLectivo)
          },
          include: {
            tb_disciplinas: { select: { codigo: true, designacao: true } },
            tb_tipo_avaliacao: { select: { codigo: true, designacao: true } }
          },
          orderBy: { tb_disciplinas: { designacao: 'asc' } }
        });

        if (notas.length > 0) {
          pautaPorAluno[codigoAluno] = {
            aluno,
            disciplinas: notas.map(nota => ({
              disciplina: nota.tb_disciplinas.designacao,
              tipoAvaliacao: nota.tb_tipo_avaliacao.designacao,
              nota: nota.Nota,
              dataCadastro: nota.DataCadastro
            }))
          };
        }
      }

      // Se nenhum aluno tem notas, retornar pauta vazia com todos os alunos
      const pautaFinal = Object.keys(pautaPorAluno).length > 0 
        ? pautaPorAluno
        : confirmacoes.reduce((acc, confirmacao) => {
            const aluno = confirmacao.tb_matriculas.tb_alunos;
            acc[aluno.codigo] = { aluno, disciplinas: [] };
            return acc;
          }, {});

      return {
        turma: parseInt(codigoTurma),
        trimestre: parseInt(codigoTrimestre),
        anoLectivo: parseInt(codigoAnoLectivo),
        totalAlunos: confirmacoes.length,
        alunosComNotas: Object.keys(pautaPorAluno).length,
        pauta: pautaFinal,
        dataGeracao: new Date().toISOString()
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Erro ao gerar pauta: ${error.message}`, 500);
    }
  }

  // ===============================
  // BOLETIM (RELATÓRIO POR ALUNO / TURMA)
  // ===============================

  /**
   * Gera boletim para todos os alunos de uma turma num trimestre específico.
   * Retorna dados estruturados para geração de PDF no frontend.
   */
  static async generateBoletimTurma(codigoTurma, codigoTrimestre, codigoAnoLectivo) {
    try {
      // 1. Buscar dados da turma
      const turma = await prisma.tb_turmas.findUnique({
        where: { codigo: parseInt(codigoTurma) },
        include: {
          tb_classes: true,
          tb_periodos: true,
          tb_salas: true,
          tb_cursos: true,
        }
      });
      if (!turma) throw new AppError('Turma não encontrada', 404);

      // 2. Buscar ano letivo
      const anoLetivo = await prisma.tb_ano_lectivo.findUnique({
        where: { codigo: parseInt(codigoAnoLectivo) }
      });

      // 3. Buscar trimestre
      const trimestre = await prisma.tb_trimestres.findUnique({
        where: { codigo: parseInt(codigoTrimestre) }
      });

      // 4. Buscar director de turma (tb_directores_turmas → tb_docente)
      const directorTurma = await prisma.tb_directores_turmas.findFirst({
        where: {
          codigoTurma: parseInt(codigoTurma),
          codigoAnoLectivo: parseInt(codigoAnoLectivo)
        },
        include: {
          tb_docente: true
        }
      });

      // 5. Buscar alunos confirmados na turma
      const confirmacoes = await prisma.tb_confirmacoes.findMany({
        where: {
          codigo_Turma: parseInt(codigoTurma),
          codigo_Ano_lectivo: parseInt(codigoAnoLectivo)
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

      if (confirmacoes.length === 0) {
        // No confirmed students for the selected class – client-side issue, not a server error
        throw new AppError('Não há alunos confirmados para a turma selecionada.', 400);
      }

      // 6. Buscar todas as notas da turma no trimestre
      const notas = await prisma.tb_notas_alunos.findMany({
        where: {
          CodigoTurma: parseInt(codigoTurma),
          CodigoTrimestre: parseInt(codigoTrimestre),
          CodigoAnoLectivo: parseInt(codigoAnoLectivo)
        },
        include: {
          tb_disciplinas: { select: { codigo: true, designacao: true } }
        }
      });

      // 7. Buscar faltas dos alunos confirmados (tb_faltas usa Codigo_Matricula, Trimestre e AnoLectivo como strings)
      const codigosMatricula = confirmacoes.map(c => c.codigo_Matricula);
      const trimestreDesignacao = trimestre?.designacao || `${codigoTrimestre}`;
      const anoLetivoDesignacao = anoLetivo?.designacao || `${codigoAnoLectivo}`;
      let faltas = [];
      try {
        faltas = await prisma.tb_faltas.findMany({
          where: {
            Codigo_Matricula: { in: codigosMatricula },
            Trimestre: trimestreDesignacao,
            AnoLectivo: anoLetivoDesignacao
          }
        });
      } catch (e) {
        // Se falhar, ignora faltas
        faltas = [];
      }

      // 8. Buscar lista de disciplinas da turma (via notas)
      const disciplinasMap = {};
      notas.forEach(n => {
        if (n.tb_disciplinas) {
          disciplinasMap[n.tb_disciplinas.codigo] = n.tb_disciplinas;
        }
      });
      const disciplinas = Object.values(disciplinasMap);

      // Mapear código de matrícula → código de aluno para cruzar faltas
      const matriculaParaAluno = {};
      confirmacoes.forEach(conf => {
        if (conf.tb_matriculas?.tb_alunos) {
          matriculaParaAluno[conf.codigo_Matricula] = conf.tb_matriculas.tb_alunos.codigo;
        }
      });

      // 9. Montar boletim por aluno
      const boletins = confirmacoes.map((conf, idx) => {
        const aluno = conf.tb_matriculas?.tb_alunos;
        if (!aluno) return null;

        // Notas deste aluno
        const notasAluno = notas.filter(n => n.CodigoAluno === aluno.codigo);

        // Mapear nota por disciplina (média se houver múltiplos tipos de avaliação)
        const notasPorDisciplina = {};
        notasAluno.forEach(n => {
          const key = n.CodigoDisciplina;
          if (!notasPorDisciplina[key]) {
            notasPorDisciplina[key] = { soma: 0, count: 0, disciplina: n.tb_disciplinas };
          }
          notasPorDisciplina[key].soma += parseFloat(n.Nota || 0);
          notasPorDisciplina[key].count += 1;
        });

        const notasFinais = Object.entries(notasPorDisciplina).map(([codDisc, val]) => ({
          codigoDisciplina: parseInt(codDisc),
          disciplina: val.disciplina?.designacao || '',
          nota: parseFloat((val.soma / val.count).toFixed(1))
        }));

        // Calcular média geral
        const mediaGeral = notasFinais.length > 0
          ? parseFloat((notasFinais.reduce((s, n) => s + n.nota, 0) / notasFinais.length).toFixed(2))
          : 0;

        // Situação do aluno
        const situacao = mediaGeral >= 10 ? 'TRANSITA' : 'N-TRANSITA';

        // Faltas do aluno (cruzar via código de matrícula)
        const faltasAluno = faltas
          .filter(f => matriculaParaAluno[f.Codigo_Matricula] === aluno.codigo)
          .reduce((sum, f) => sum + (parseInt(f.nFaltas) || 1), 0);

        return {
          numero: idx + 1,
          aluno: {
            codigo: aluno.codigo,
            nome: aluno.nome,
            dataNascimento: aluno.dataNascimento
          },
          notas: notasFinais,
          mediaGeral,
          situacao,
          faltas: faltasAluno,
          comportamento: 'Bom'
        };
      }).filter(Boolean);

      // 10. Dados do director de turma (tb_docente tem nome e contacto)
      let nomeDirector = 'N/D';
      let contactoDirector = 'N/D';
      if (directorTurma?.tb_docente) {
        nomeDirector = directorTurma.tb_docente.nome || 'N/D';
        contactoDirector = directorTurma.tb_docente.contacto || 'N/D';
      }

      // 11. Dados da instituição
      let instituicao;
      try {
        instituicao = await prisma.tb_dados_instituicao.findFirst();
      } catch (e) {
        instituicao = null;
      }
      if (!instituicao) {
        instituicao = {
          nome: 'INSTITUTO TÉCNICO PRIVADO DE SAÚDE JOMORAIS',
          localidade: 'Cabinda, Angola',
          telefone_Movel: '+244 915 312 187'
        };
      }

      return {
        turma: {
          codigo: turma.codigo,
          designacao: turma.designacao,
          classe: turma.tb_classes?.designacao || '',
          periodo: turma.tb_periodos?.designacao || '',
          sala: turma.tb_salas?.designacao || '',
          curso: turma.tb_cursos?.designacao || ''
        },
        anoLetivo: anoLetivo?.designacao || codigoAnoLectivo,
        trimestre: trimestre?.designacao || `${codigoTrimestre}º`,
        disciplinas,
        directorTurma: nomeDirector,
        contactoDirector,
        instituicao: {
          nome: instituicao.nome || 'INSTITUTO TÉCNICO PRIVADO DE SAÚDE JOMORAIS',
          endereco: instituicao.localidade || 'Cabinda, Angola',
          telefone: instituicao.telefone_Movel || instituicao.telefone_Fixo || '+244 915 312 187',
          email: instituicao.email || ''
        },
        boletins,
        totalAlunos: boletins.length,
        dataGeracao: new Date().toISOString()
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Erro ao gerar boletim da turma: ${error.message}`, 500);
    }
  }

  static async generateBoletim(codigoAluno, codigoAnoLectivo) {
    try {
      // Buscar todas as notas do aluno no ano letivo
      const notas = await prisma.tb_notas_alunos.findMany({
        where: {
          CodigoAluno: parseInt(codigoAluno),
          CodigoAnoLectivo: parseInt(codigoAnoLectivo)
        },
        include: {
          tb_alunos: { select: { codigo: true, nome: true, classe: true } },
          tb_disciplinas: { select: { codigo: true, designacao: true } },
          tb_trimestres: { select: { codigo: true, designacao: true } },
          tb_tipo_avaliacao: { select: { codigo: true, designacao: true } }
        },
        orderBy: [{ CodigoTrimestre: 'asc' }, { tb_disciplinas: { designacao: 'asc' } }]
      });

      if (notas.length === 0) {
        throw new AppError('Nenhuma nota encontrada para este aluno', 404);
      }

      // Agrupar por trimestre
      const boletimPorTrimestre = {};
      let totalNotas = 0;
      let somaNotas = 0;

      notas.forEach(nota => {
        const codigoTrimestre = nota.CodigoTrimestre;
        if (!boletimPorTrimestre[codigoTrimestre]) {
          boletimPorTrimestre[codigoTrimestre] = {
            trimestre: nota.tb_trimestres.designacao,
            disciplinas: []
          };
        }

        boletimPorTrimestre[codigoTrimestre].disciplinas.push({
          disciplina: nota.tb_disciplinas.designacao,
          tipoAvaliacao: nota.tb_tipo_avaliacao.designacao,
          nota: nota.Nota
        });

        totalNotas++;
        somaNotas += nota.Nota;
      });

      const media = totalNotas > 0 ? somaNotas / totalNotas : 0;

      return {
        aluno: notas[0].tb_alunos,
        anoLectivo: codigoAnoLectivo,
        mediaGeral: parseFloat(media.toFixed(2)),
        boletim: boletimPorTrimestre,
        dataGeracao: new Date().toISOString()
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Erro ao gerar boletim: ${error.message}`, 500);
    }
  }

  // ===============================
  // HISTÓRICO DE ALTERAÇÕES
  // ===============================

  static async getGradeHistory(codigoNota) {
    try {
      const history = await prisma.tb_historico_notas.findMany({
        where: { Codigo_Nota: parseInt(codigoNota) },
        orderBy: { DataAlteracao: 'desc' }
      });

      if (history.length === 0) {
        throw new AppError('Nenhum histórico encontrado para esta nota', 404);
      }

      return {
        codigoNota: parseInt(codigoNota),
        historico: history,
        totalAlteracoes: history.length
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Erro ao buscar histórico: ${error.message}`, 500);
    }
  }

  // ===============================
  // ESTATÍSTICAS E RELATÓRIOS
  // ===============================

  static async getGradeStatistics(codigoTurma, codigoTrimestre, codigoAnoLectivo) {
    try {
      const notas = await prisma.tb_notas_alunos.findMany({
        where: {
          CodigoTurma: parseInt(codigoTurma),
          CodigoTrimestre: parseInt(codigoTrimestre),
          CodigoAnoLectivo: parseInt(codigoAnoLectivo)
        }
      });

      if (notas.length === 0) {
        throw new AppError('Nenhuma nota encontrada para calcular estatísticas', 404);
      }

      const notasArray = notas.map(n => n.Nota);
      const media = notasArray.reduce((a, b) => a + b, 0) / notasArray.length;
      const notasOrdenadas = notasArray.sort((a, b) => a - b);
      const mediana =
        notasOrdenadas.length % 2 === 0
          ? (notasOrdenadas[notasOrdenadas.length / 2 - 1] + notasOrdenadas[notasOrdenadas.length / 2]) / 2
          : notasOrdenadas[Math.floor(notasOrdenadas.length / 2)];

      // Contar aprovações (nota >= 10) e reprovações (nota < 10)
      const aprovados = notasArray.filter(n => n >= 10).length;
      const reprovados = notasArray.filter(n => n < 10).length;
      const taxaAprovacao = ((aprovados / notasArray.length) * 100).toFixed(2);

      return {
        turma: parseInt(codigoTurma),
        trimestre: parseInt(codigoTrimestre),
        anoLectivo: codigoAnoLectivo,
        totalNotas: notasArray.length,
        media: parseFloat(media.toFixed(2)),
        mediana: parseFloat(mediana.toFixed(2)),
        minima: Math.min(...notasArray),
        maxima: Math.max(...notasArray),
        aprovados,
        reprovados,
        taxaAprovacao: `${taxaAprovacao}%`,
        distribuicao: {
          somente0a5: notasArray.filter(n => n >= 0 && n < 5).length,
          somente5a10: notasArray.filter(n => n >= 5 && n < 10).length,
          somente10a15: notasArray.filter(n => n >= 10 && n < 15).length,
          somente15a20: notasArray.filter(n => n >= 15 && n <= 20).length
        }
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Erro ao calcular estatísticas: ${error.message}`, 500);
    }
  }

  static async getDisciplineStatistics(codigoDisciplina, codigoTrimestre, codigoAnoLectivo) {
    try {
      const notas = await prisma.tb_notas_alunos.findMany({
        where: {
          CodigoDisciplina: parseInt(codigoDisciplina),
          CodigoTrimestre: parseInt(codigoTrimestre),
          CodigoAnoLectivo: parseInt(codigoAnoLectivo)
        },
        include: {
          tb_disciplinas: { select: { designacao: true } }
        }
      });

      if (notas.length === 0) {
        throw new AppError('Nenhuma nota encontrada para esta disciplina', 404);
      }

      const notasArray = notas.map(n => n.Nota);
      const media = notasArray.reduce((a, b) => a + b, 0) / notasArray.length;
      const aprovados = notasArray.filter(n => n >= 10).length;

      return {
        disciplina: notas[0].tb_disciplinas.designacao,
        codigoDisciplina: parseInt(codigoDisciplina),
        trimestre: parseInt(codigoTrimestre),
        anoLectivo: codigoAnoLectivo,
        totalAlunosAvaliados: notasArray.length,
        mediaGeral: parseFloat(media.toFixed(2)),
        aprovados,
        reprovados: notasArray.length - aprovados,
        tasaAprovacao: `${((aprovados / notasArray.length) * 100).toFixed(2)}%`
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Erro ao gerar estatísticas da disciplina: ${error.message}`, 500);
    }
  }

  static async getTeacherGradeReport(codigoProfessor, codigoTrimestre, codigoAnoLectivo) {
    try {
      // Buscar todas as notas lançadas por este professor
      const notas = await prisma.tb_notas_alunos.findMany({
        where: {
          tb_alunos: {
            // Notas onde o professor é responsável (via professor_turma ou professor_disciplina)
          },
          CodigoTrimestre: parseInt(codigoTrimestre),
          CodigoAnoLectivo: parseInt(codigoAnoLectivo)
        },
        include: {
          tb_alunos: { select: { codigo: true, nome: true } },
          tb_disciplinas: { select: { codigo: true, designacao: true } },
          tb_turmas: { select: { codigo: true, designacao: true } }
        },
        orderBy: [{ tb_turmas: { designacao: 'asc' } }, { tb_disciplinas: { designacao: 'asc' } }]
      });

      if (notas.length === 0) {
        throw new AppError('Nenhuma nota encontrada para este professor', 404);
      }

      // Agrupar por turma e disciplina
      const relatorioAgrupado = {};
      notas.forEach(nota => {
        const chaveTurma = nota.CodigoTurma;
        if (!relatorioAgrupado[chaveTurma]) {
          relatorioAgrupado[chaveTurma] = {
            turma: nota.tb_turmas?.designacao || 'N/A',
            disciplinas: {}
          };
        }
        const chaveDisciplina = nota.CodigoDisciplina;
        if (!relatorioAgrupado[chaveTurma].disciplinas[chaveDisciplina]) {
          relatorioAgrupado[chaveTurma].disciplinas[chaveDisciplina] = {
            disciplina: nota.tb_disciplinas.designacao,
            alunos: []
          };
        }
        relatorioAgrupado[chaveTurma].disciplinas[chaveDisciplina].alunos.push({
          aluno: nota.tb_alunos,
          nota: nota.Nota
        });
      });

      return {
        professor: parseInt(codigoProfessor),
        trimestre: parseInt(codigoTrimestre),
        anoLectivo: codigoAnoLectivo,
        totalNotas: notas.length,
        relatorio: relatorioAgrupado,
        dataGeracao: new Date().toISOString()
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Erro ao gerar relatório do professor: ${error.message}`, 500);
    }
  }

  // ===============================
  // BUSCAR NOTAS POR CRITÉRIOS
  // ===============================

  static async getGradesByStudent(codigoAluno, codigoAnoLectivo) {
    try {
      const grades = await prisma.tb_notas_alunos.findMany({
        where: {
          CodigoAluno: parseInt(codigoAluno),
          CodigoAnoLectivo: parseInt(codigoAnoLectivo)
        },
        include: {
          tb_disciplinas: { select: { codigo: true, designacao: true } },
          tb_trimestres: { select: { codigo: true, designacao: true } },
          tb_tipo_avaliacao: { select: { codigo: true, designacao: true } }
        },
        orderBy: [{ CodigoTrimestre: 'asc' }, { tb_disciplinas: { designacao: 'asc' } }]
      });

      return {
        codigoAluno: parseInt(codigoAluno),
        anoLectivo: codigoAnoLectivo,
        totalNotas: grades.length,
        notas: grades
      };
    } catch (error) {
      throw new AppError(`Erro ao buscar notas do aluno: ${error.message}`, 500);
    }
  }

  static async getGradesByDiscipline(codigoDisciplina, codigoAnoLectivo) {
    try {
      const grades = await prisma.tb_notas_alunos.findMany({
        where: {
          CodigoDisciplina: parseInt(codigoDisciplina),
          CodigoAnoLectivo: parseInt(codigoAnoLectivo)
        },
        include: {
          tb_alunos: { select: { codigo: true, nome: true } },
          tb_trimestres: { select: { codigo: true, designacao: true } }
        },
        orderBy: [{ CodigoTrimestre: 'asc' }, { tb_alunos: { nome: 'asc' } }]
      });

      return {
        codigoDisciplina: parseInt(codigoDisciplina),
        anoLectivo: codigoAnoLectivo,
        totalNotas: grades.length,
        notas: grades
      };
    } catch (error) {
      throw new AppError(`Erro ao buscar notas por disciplina: ${error.message}`, 500);
    }
  }

  static async getGradesByClassroom(codigoTurma, codigoAnoLectivo) {
    try {
      const grades = await prisma.tb_notas_alunos.findMany({
        where: {
          CodigoTurma: parseInt(codigoTurma),
          CodigoAnoLectivo: parseInt(codigoAnoLectivo)
        },
        include: {
          tb_alunos: { select: { codigo: true, nome: true } },
          tb_disciplinas: { select: { codigo: true, designacao: true } },
          tb_trimestres: { select: { codigo: true, designacao: true } }
        },
        orderBy: [
          { CodigoTrimestre: 'asc' },
          { tb_alunos: { nome: 'asc' } },
          { tb_disciplinas: { designacao: 'asc' } }
        ]
      });

      return {
        codigoTurma: parseInt(codigoTurma),
        anoLectivo: codigoAnoLectivo,
        totalNotas: grades.length,
        notas: grades
      };
    } catch (error) {
      throw new AppError(`Erro ao buscar notas por turma: ${error.message}`, 500);
    }
  }

  // ===============================
  // IMPORTAÇÃO EM BULK
  // ===============================

  static async importGradesBulk(data) {
    try {
      const { grades, codigoAnoLectivo, codigoUtilizador } = data;

      if (!Array.isArray(grades) || grades.length === 0) {
        throw new AppError('Grades deve ser um array não vazio', 400);
      }

      if (!codigoAnoLectivo || !codigoUtilizador) {
        throw new AppError('codigoAnoLectivo e codigoUtilizador são obrigatórios', 400);
      }

      const resultados = {
        sucesso: [],
        erros: []
      };

      // Processar cada nota
      for (let i = 0; i < grades.length; i++) {
        const gradeData = {
          ...grades[i],
          codigoAnoLectivo: parseInt(codigoAnoLectivo),
          codigoUtilizador: parseInt(codigoUtilizador)
        };

        try {
          const grade = await this.createGrade(gradeData);
          resultados.sucesso.push({
            indice: i,
            aluno: grades[i].codigoAluno,
            disciplina: grades[i].codigoDisciplina,
            status: 'OK'
          });
        } catch (error) {
          resultados.erros.push({
            indice: i,
            aluno: grades[i].codigoAluno,
            disciplina: grades[i].codigoDisciplina,
            erro: error.message
          });
        }
      }

      return {
        totalProcessados: grades.length,
        sucessos: resultados.sucesso.length,
        erros: resultados.erros.length,
        resultados
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Erro ao importar notas: ${error.message}`, 500);
    }
  }
}
