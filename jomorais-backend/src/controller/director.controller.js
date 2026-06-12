import prisma from '../config/database.js';
import { AppError } from '../utils/validation.utils.js';
import { compareLegacyPasswords, hashLegacyPassword } from '../utils/encryption.utils.js';
import { GradeManagementService } from '../services/grade-management.services.js';

export class DirectorController {
  // Helper to get the logged-in director based on user ID
  static async getDocenteByUserId(userId) {
    const professor = await prisma.tb_professores.findFirst({
      where: { Codigo_Utilizador: parseInt(userId) }
    });
    return professor;
  }

  // Helper para ano letivo
  static async findAnoLectivo(anoLectivo) {
    if (!anoLectivo) return null;
    let anoObj = await prisma.tb_ano_lectivo.findFirst({
      where: { OR: [{ designacao: anoLectivo }, { anoInicial: anoLectivo }] }
    });
    if (anoObj) return anoObj;
    if (anoLectivo.includes('/')) {
      const comTraco = anoLectivo.replace('/', '-');
      anoObj = await prisma.tb_ano_lectivo.findFirst({
        where: { OR: [{ designacao: comTraco }, { anoInicial: comTraco }] }
      });
      if (anoObj) return anoObj;
    }
    if (anoLectivo.includes('-')) {
      const comBarra = anoLectivo.replace('-', '/');
      anoObj = await prisma.tb_ano_lectivo.findFirst({
        where: { OR: [{ designacao: comBarra }, { anoInicial: comBarra }] }
      });
      if (anoObj) return anoObj;
    }
    return null;
  }

  /**
   * Obter perfil do diretor e os dados de utilizador
   * GET /api/director/perfil
   */
  static async getPerfil(req, res, next) {
    try {
      const userId = parseInt(req.user.id);
      const professor = await DirectorController.getDocenteByUserId(userId);

      if (!professor) {
        return res.status(404).json({
          success: false,
          message: 'Docente não associado a este utilizador'
        });
      }

      const user = await prisma.tb_utilizadores.findUnique({
        where: { codigo: userId },
        select: { codigo: true, nome: true, user: true, estadoActual: true }
      });

      return res.json({
        success: true,
        data: { ...professor, utilizador: user }
      });
    } catch (error) {
      console.error('Erro ao obter perfil do diretor:', error);
      next(error);
    }
  }

  /**
   * Obter as turmas que o diretor dirige
   * GET /api/director/minhas-turmas
   */
  static async getMinhasTurmas(req, res, next) {
    try {
      const userId = parseInt(req.user.id);
      const professor = await DirectorController.getDocenteByUserId(userId);

      if (!professor) {
        return res.json({ success: true, data: [] });
      }

      // Buscar turmas que ele dirige
      const directorias = await prisma.tb_directores_turmas.findMany({
        where: { codigoDocente: professor.Codigo },
        include: {
          tb_turmas: {
            include: { tb_classes: true, tb_cursos: true }
          },
          tb_ano_lectivo: true
        }
      });

      const turmasFormatadas = [];

      // Para cada turma, obter a grade curricular para saber quais as disciplinas
      for (const dir of directorias) {
        if (!dir.tb_turmas) continue;

        const disciplinas = await prisma.tb_grade_curricular.findMany({
          where: {
            codigo_Classe: dir.tb_turmas.codigo_Classe,
            codigo_Curso: dir.tb_turmas.codigo_Curso
          },
          include: {
            tb_disciplinas: { select: { codigo: true, designacao: true } }
          }
        });

        turmasFormatadas.push({
          codigo: dir.codigo,
          codigo_Professor: dir.codigoDocente,
          codigo_Turma: dir.codigoTurma,
          anoLectivo: dir.tb_ano_lectivo?.designacao || '',
          tb_turmas: dir.tb_turmas,
          disciplinas: disciplinas.map(d => d.tb_disciplinas).filter(Boolean)
        });
      }

      return res.json({
        success: true,
        data: turmasFormatadas
      });
    } catch (error) {
      console.error('Erro ao obter turmas dirigidas:', error);
      next(error);
    }
  }

  /**
   * Obter alunos de uma turma dirigida
   * GET /api/director/turmas/:turmaId/alunos
   */
  static async getAlunosDaTurma(req, res, next) {
    try {
      const userId = parseInt(req.user.id);
      const { turmaId } = req.params;
      const { anoLectivo } = req.query;

      if (!anoLectivo) {
        return res.status(400).json({ success: false, message: 'Parâmetro anoLectivo é obrigatório na query string' });
      }

      const professor = await DirectorController.getDocenteByUserId(userId);
      if (!professor) return res.status(403).json({ success: false, message: 'Acesso negado.' });

      const anoObj = await DirectorController.findAnoLectivo(anoLectivo);
      if (!anoObj) return res.status(404).json({ success: false, message: 'Ano letivo não encontrado' });

      // Verificar se é o diretor da turma
      const isDirector = await prisma.tb_directores_turmas.findFirst({
        where: {
          codigoTurma: parseInt(turmaId),
          codigoDocente: professor.Codigo,
          codigoAnoLectivo: anoObj.codigo
        }
      });

      if (!isDirector) {
        return res.status(403).json({ success: false, message: 'Não é o diretor desta turma neste ano letivo.' });
      }

      const confirmacoes = await prisma.tb_confirmacoes.findMany({
        where: {
          codigo_Turma: parseInt(turmaId),
          codigo_Ano_lectivo: anoObj.codigo,
          codigo_Status: 1
        },
        include: {
          tb_matriculas: {
            include: {
              tb_alunos: { select: { codigo: true, nome: true, sexo: true } }
            }
          }
        },
        orderBy: {
          tb_matriculas: { tb_alunos: { nome: 'asc' } }
        }
      });

      const alunos = confirmacoes.map(c => ({
        codigo: c.tb_matriculas.tb_alunos.codigo,
        nome: c.tb_matriculas.tb_alunos.nome,
        sexo: c.tb_matriculas.tb_alunos.sexo,
        confirmacaoId: c.codigo
      }));

      return res.json({ success: true, data: alunos });
    } catch (error) {
      console.error('Erro ao buscar alunos da turma:', error);
      next(error);
    }
  }

  /**
   * Obter notas lançadas para a turma (qualquer disciplina/professor)
   * GET /api/director/turmas/:turmaId/notas
   */
  static async getNotasDaTurma(req, res, next) {
    try {
      const userId = parseInt(req.user.id);
      const { turmaId } = req.params;
      const { disciplinaId, trimestreId, anoLectivo } = req.query;

      const professor = await DirectorController.getDocenteByUserId(userId);
      if (!professor) return res.status(403).json({ success: false, message: 'Acesso negado.' });

      const anoObj = await DirectorController.findAnoLectivo(anoLectivo);
      if (!anoObj) return res.status(404).json({ success: false, message: 'Ano letivo não encontrado' });

      // Verificar se é o diretor da turma
      const isDirector = await prisma.tb_directores_turmas.findFirst({
        where: {
          codigoTurma: parseInt(turmaId),
          codigoDocente: professor.Codigo,
          codigoAnoLectivo: anoObj.codigo
        }
      });

      if (!isDirector) {
        return res.status(403).json({ success: false, message: 'Acesso negado. Não é o diretor desta turma.' });
      }

      const where = {
        CodigoTurma: parseInt(turmaId),
        CodigoAnoLectivo: anoObj.codigo
      };
      if (disciplinaId) where.CodigoDisciplina = parseInt(disciplinaId);
      if (trimestreId) where.CodigoTrimestre = parseInt(trimestreId);

      const notas = await prisma.tb_notas_alunos.findMany({
        where,
        include: {
          tb_alunos: { select: { codigo: true, nome: true } },
          tb_disciplinas: { select: { codigo: true, designacao: true } },
          tb_tipo_avaliacao: { select: { codigo: true, descricao: true } }
        }
      });

      const formatted = notas.map(n => ({
        codigo: n.Codigo,
        nota: n.Nota,
        aluno: n.tb_alunos,
        disciplina: n.tb_disciplinas,
        tipoAvaliacao: n.tb_tipo_avaliacao,
        dataCadastro: new Date(n.DataCadastro * 1000).toISOString()
      }));

      return res.json({ success: true, data: formatted });
    } catch (error) {
      console.error('Erro ao obter notas da turma:', error);
      next(error);
    }
  }

  /**
   * Lançamento de notas em lote pelo diretor
   * POST /api/director/lancar-notas
   */
  static async lancarNotas(req, res, next) {
    try {
      const userId = parseInt(req.user.id);
      const { codigoTurma, codigoDisciplina, codigoTrimestre, anoLectivo, tipoNota, notas } = req.body;

      if (!codigoTurma || !codigoDisciplina || !codigoTrimestre || !anoLectivo || !tipoNota || !Array.isArray(notas)) {
        return res.status(400).json({ success: false, message: 'Faltam dados obrigatórios.' });
      }

      const professor = await DirectorController.getDocenteByUserId(userId);
      if (!professor) return res.status(403).json({ success: false, message: 'Acesso negado.' });

      const anoObj = await DirectorController.findAnoLectivo(anoLectivo);
      if (!anoObj) return res.status(404).json({ success: false, message: 'Ano letivo do sistema não encontrado' });

      // Validar se é diretor da turma
      const isDirector = await prisma.tb_directores_turmas.findFirst({
        where: {
          codigoTurma: parseInt(codigoTurma),
          codigoDocente: professor.Codigo,
          codigoAnoLectivo: anoObj.codigo
        }
      });

      if (!isDirector) {
        return res.status(403).json({ success: false, message: 'Acesso negado. Não é o diretor desta turma.' });
      }

      // 2. Verificar se o período de lançamento está ativo
      const agora = new Date();
      const periodoAtivo = await prisma.tb_periodos_avaliacao.findFirst({
        where: {
          TipoAvaliacao: tipoNota,
          Trimestre: parseInt(codigoTrimestre),
          DataInicio: { lte: agora },
          DataFim: { gte: agora }
        }
      });

      if (!periodoAtivo) {
        return res.status(400).json({ success: false, message: `O período de lançamento para ${tipoNota} do ${codigoTrimestre}º Trimestre está FECHADO ou INATIVO.` });
      }

      const mappedTipoNota = tipoNota === 'PP' ? 'NPP' : (tipoNota === 'PT' ? 'NPT' : tipoNota);
      const tipoObj = await prisma.tb_tipo_avaliacao.findFirst({
        where: { OR: [{ descricao: tipoNota }, { descricao: mappedTipoNota }] }
      });
      if (!tipoObj) return res.status(404).json({ success: false, message: 'Tipo de avaliação do sistema não encontrado' });

      const codigoTipoAvaliacao = tipoObj.codigo;
      const codigoAnoLectivo = anoObj.codigo;

      // Executar transação para salvar as notas
      const results = await prisma.$transaction(async (tx) => {
        const savedGrades = [];
        for (const item of notas) {
          const { codigoAluno, nota } = item;
          const valorNota = parseFloat(nota);
          if (isNaN(valorNota) || valorNota < 0 || valorNota > 20) {
            throw new AppError(`Nota inválida para o aluno ${codigoAluno}.`, 400);
          }

          const notaExistente = await tx.tb_notas_alunos.findFirst({
            where: {
              CodigoAluno: parseInt(codigoAluno),
              CodigoDisciplina: parseInt(codigoDisciplina),
              CodigoTipoAvaliacao: codigoTipoAvaliacao,
              CodigoTrimestre: parseInt(codigoTrimestre),
              CodigoAnoLectivo: codigoAnoLectivo
            }
          });

          let grade;
          if (notaExistente) {
            grade = await tx.tb_notas_alunos.update({
              where: { Codigo: notaExistente.Codigo },
              data: {
                Nota: valorNota,
                CodigoTurma: parseInt(codigoTurma),
                CodigoUtilizador: userId,
                DataCadastro: Math.floor(Date.now() / 1000)
              }
            });
          } else {
            grade = await tx.tb_notas_alunos.create({
              data: {
                CodigoAluno: parseInt(codigoAluno),
                CodigoDisciplina: parseInt(codigoDisciplina),
                Nota: valorNota,
                CodigoAnoLectivo: codigoAnoLectivo,
                CodigoTipoAvaliacao: codigoTipoAvaliacao,
                CodigoTrimestre: parseInt(codigoTrimestre),
                CodigoTurma: parseInt(codigoTurma),
                CodigoUtilizador: userId,
                DataCadastro: Math.floor(Date.now() / 1000)
              }
            });
          }
          savedGrades.push(grade);
        }
        return savedGrades;
      });

      return res.json({
        success: true,
        message: `${results.length} nota(s) lançada(s) ou atualizada(s) com sucesso.`,
        data: results
      });
    } catch (error) {
      console.error('Erro ao lançar notas:', error);
      next(error);
    }
  }

  /**
   * Buscar dados para o Boletim da turma (Reutiliza a lógica do GradeManagementService)
   * GET /api/director/boletins-turma/:turmaId
   */
  static async getBoletimTurma(req, res, next) {
    try {
      const { turmaId } = req.params;
      const { trimestreId, anoLectivoId } = req.query;

      if (!trimestreId || !anoLectivoId) {
        return res.status(400).json({ success: false, message: 'Trimestre e Ano Lectivo são obrigatórios' });
      }

      // Verificação de segurança adicional para garantir que é o diretor da turma
      const userId = parseInt(req.user.id);
      const professor = await DirectorController.getDocenteByUserId(userId);
      if (!professor) return res.status(403).json({ success: false, message: 'Acesso negado.' });

      const isDirector = await prisma.tb_directores_turmas.findFirst({
        where: {
          codigoTurma: parseInt(turmaId),
          codigoDocente: professor.Codigo,
          codigoAnoLectivo: parseInt(anoLectivoId)
        }
      });

      if (!isDirector) {
        return res.status(403).json({ success: false, message: 'Acesso negado. Não é o diretor desta turma.' });
      }

      // Aproveita o service existente que estrutura os dados do boletim
      const boletimData = await GradeManagementService.generateBoletimTurma(
        turmaId,
        trimestreId,
        anoLectivoId,
        userId
      );

      return res.json({
        success: true,
        data: boletimData
      });
    } catch (error) {
      console.error('Erro ao gerar dados do boletim (Director):', error);
      next(error);
    }
  }
}
