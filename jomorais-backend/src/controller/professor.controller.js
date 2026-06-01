// controller/professor.controller.js
import prisma from '../config/database.js';
import { AppError } from '../utils/validation.utils.js';
import { compareLegacyPasswords, hashLegacyPassword } from '../utils/encryption.utils.js';

export class ProfessorController {
  /**
   * Helper method to get the logged-in professor based on user ID
   */
  static async getDocenteByUserId(userId) {
    const professor = await prisma.tb_professores.findFirst({
      where: { Codigo_Utilizador: parseInt(userId) }
    });
    return professor;
  }

  /**
   * Helper robusto para encontrar o ano letivo na tb_ano_lectivo
   * Suporta formatos diferentes como "2025/2026" e "2025-2026"
   */
  static async findAnoLectivo(anoLectivo) {
    if (!anoLectivo) return null;
    
    // 1. Tentar correspondência direta
    let anoObj = await prisma.tb_ano_lectivo.findFirst({
      where: {
        OR: [
          { designacao: anoLectivo },
          { anoInicial: anoLectivo }
        ]
      }
    });
    
    if (anoObj) return anoObj;
    
    // 2. Se tiver barra, tentar substituir por traço
    if (anoLectivo.includes('/')) {
      const comTraco = anoLectivo.replace('/', '-');
      anoObj = await prisma.tb_ano_lectivo.findFirst({
        where: {
          OR: [
            { designacao: comTraco },
            { anoInicial: comTraco }
          ]
        }
      });
      if (anoObj) return anoObj;
    }
    
    // 3. Se tiver traço, tentar substituir por barra
    if (anoLectivo.includes('-')) {
      const comBarra = anoLectivo.replace('-', '/');
      anoObj = await prisma.tb_ano_lectivo.findFirst({
        where: {
          OR: [
            { designacao: comBarra },
            { anoInicial: comBarra }
          ]
        }
      });
      if (anoObj) return anoObj;
    }
    
    return null;
  }

  /**
   * Obter perfil do professor autenticado
   * GET /api/professor/perfil
   */
  static async getPerfil(req, res, next) {
    try {
      const userId = parseInt(req.user.id);
      const professor = await ProfessorController.getDocenteByUserId(userId);

      if (!professor) {
        return res.status(404).json({
          success: false,
          message: 'Docente não associado a este utilizador'
        });
      }

      // Buscar também os dados de utilizador associados
      const user = await prisma.tb_utilizadores.findUnique({
        where: { codigo: userId },
        select: {
          codigo: true,
          nome: true,
          user: true,
          estadoActual: true
        }
      });

      return res.json({
        success: true,
        data: {
          ...professor,
          utilizador: user
        }
      });
    } catch (error) {
      console.error('Erro ao obter perfil do professor:', error);
      next(error);
    }
  }

  /**
   * Obter atribuições do professor autenticado (turmas e disciplinas)
   * GET /api/professor/minhas-atribuicoes
   */
  static async getMinhasAtribuicoes(req, res, next) {
    try {
      const userId = parseInt(req.user.id);
      const professor = await ProfessorController.getDocenteByUserId(userId);

      if (!professor) {
        return res.json({
          success: true,
          data: {
            disciplinas: [],
            turmas: [],
            totalDisciplinas: 0,
            totalTurmas: 0
          }
        });
      }

      const [disciplinas, turmas] = await Promise.all([
        prisma.tb_professor_disciplina.findMany({
          where: {
            Codigo_Professor: professor.Codigo,
            Status: 'Activo'
          },
          include: {
            tb_disciplinas: { select: { codigo: true, designacao: true } },
            tb_cursos: { select: { codigo: true, designacao: true } }
          }
        }),
        prisma.tb_professor_turma.findMany({
          where: {
            Codigo_Professor: professor.Codigo,
            Status: 'Activo'
          },
          include: {
            tb_disciplinas: { select: { codigo: true, designacao: true } },
            tb_turmas: {
              select: {
                codigo: true,
                designacao: true,
                tb_classes: { select: { designacao: true } }
              }
            }
          }
        })
      ]);

      const formattedDisciplinas = disciplinas.map(d => ({
        codigo: d.Codigo,
        codigo_Professor: d.Codigo_Professor,
        codigo_Disciplina: d.Codigo_Disciplina,
        codigo_Curso: d.Codigo_Curso,
        anoLectivo: d.AnoLectivo,
        status: d.Status,
        tb_disciplinas: d.tb_disciplinas,
        tb_cursos: d.tb_cursos
      }));

      const formattedTurmas = turmas.map(t => ({
        codigo: t.Codigo,
        codigo_Professor: t.Codigo_Professor,
        codigo_Turma: t.Codigo_Turma,
        codigo_Disciplina: t.Codigo_Disciplina,
        anoLectivo: t.AnoLectivo,
        status: t.Status,
        tb_disciplinas: t.tb_disciplinas,
        tb_turmas: t.tb_turmas
      }));

      return res.json({
        success: true,
        data: {
          disciplinas: formattedDisciplinas,
          turmas: formattedTurmas,
          totalDisciplinas: formattedDisciplinas.length,
          totalTurmas: formattedTurmas.length
        }
      });
    } catch (error) {
      console.error('Erro ao obter atribuições:', error);
      next(error);
    }
  }

  /**
   * Obter alunos de uma turma vinculada ao professor
   * GET /api/professor/turmas/:turmaId/alunos
   */
  static async getAlunosDaTurma(req, res, next) {
    try {
      const userId = parseInt(req.user.id);
      const { turmaId } = req.params;
      const { anoLectivo } = req.query; // Filtro opcional de ano letivo

      if (!anoLectivo) {
        return res.status(400).json({
          success: false,
          message: 'Parâmetro anoLectivo é obrigatório na query string'
        });
      }

      const professor = await ProfessorController.getDocenteByUserId(userId);
      if (!professor) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado. Utilizador não associado a um professor.'
        });
      }

      // Verificar se a turma pertence ao professor neste ano letivo
      const pertence = await prisma.tb_professor_turma.findFirst({
        where: {
          Codigo_Professor: professor.Codigo,
          Codigo_Turma: parseInt(turmaId),
          AnoLectivo: anoLectivo,
          Status: 'Activo'
        }
      });

      if (!pertence) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado. Esta turma não está atribuída a si para este ano letivo.'
        });
      }

      // Resolver o código do ano letivo a partir da designação
      const anoObj = await ProfessorController.findAnoLectivo(anoLectivo);

      if (!anoObj) {
        return res.status(404).json({
          success: false,
          message: 'Ano letivo não encontrado'
        });
      }

      // Buscar a turma física no banco de dados para usar o seu próprio ano letivo real
      const turma = await prisma.tb_turmas.findUnique({
        where: { codigo: parseInt(turmaId) }
      });
      const codigoAnoLectivoReal = turma ? turma.codigo_AnoLectivo : anoObj.codigo;

      // Buscar confirmações de matrícula dos alunos da turma neste ano letivo
      const confirmacoes = await prisma.tb_confirmacoes.findMany({
        where: {
          codigo_Turma: parseInt(turmaId),
          codigo_Ano_lectivo: codigoAnoLectivoReal,
          codigo_Status: 1
        },
        include: {
          tb_matriculas: {
            include: {
              tb_alunos: {
                select: {
                  codigo: true,
                  nome: true,
                  sexo: true
                }
              }
            }
          }
        },
        orderBy: {
          tb_matriculas: {
            tb_alunos: {
              nome: 'asc'
            }
          }
        }
      });

      const alunos = confirmacoes.map(c => ({
        codigo: c.tb_matriculas.tb_alunos.codigo,
        nome: c.tb_matriculas.tb_alunos.nome,
        sexo: c.tb_matriculas.tb_alunos.sexo,
        confirmacaoId: c.codigo
      }));

      return res.json({
        success: true,
        data: alunos
      });
    } catch (error) {
      console.error('Erro ao buscar alunos da turma:', error);
      next(error);
    }
  }

  /**
   * Obter histórico de notas lançadas pelo professor
   * GET /api/professor/minhas-notas
   */
  static async getMinhasNotas(req, res, next) {
    try {
      const userId = parseInt(req.user.id);
      const { turmaId, disciplinaId, trimestreId, anoLectivo } = req.query;

      const professor = await ProfessorController.getDocenteByUserId(userId);
      if (!professor) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado. Utilizador não associado a um professor.'
        });
      }

      // Obter código do ano letivo de forma flexível
      let codigoAnoLectivo = null;
      if (anoLectivo) {
        const anoObj = await ProfessorController.findAnoLectivo(anoLectivo);
        codigoAnoLectivo = anoObj?.codigo;
      }

      if (turmaId) {
        const turma = await prisma.tb_turmas.findUnique({
          where: { codigo: parseInt(turmaId) }
        });
        if (turma) {
          codigoAnoLectivo = turma.codigo_AnoLectivo;
        }
      }

      // Filtro para buscar notas do professor ou de suas turmas atribuídas
      const where = {
        // Notas lançadas por este utilizador
        CodigoUtilizador: userId
      };

      if (turmaId) where.CodigoTurma = parseInt(turmaId);
      if (disciplinaId) where.CodigoDisciplina = parseInt(disciplinaId);
      if (trimestreId) where.CodigoTrimestre = parseInt(trimestreId);
      if (codigoAnoLectivo) where.CodigoAnoLectivo = codigoAnoLectivo;

      const notas = await prisma.tb_notas_alunos.findMany({
        where,
        include: {
          tb_alunos: {
            select: { codigo: true, nome: true }
          },
          tb_disciplinas: {
            select: { codigo: true, designacao: true }
          },
          tb_turmas: {
            select: { codigo: true, designacao: true }
          },
          tb_trimestres: {
            select: { codigo: true, designacao: true }
          },
          tb_tipo_avaliacao: {
            select: { codigo: true, descricao: true }
          }
        },
        orderBy: {
          DataCadastro: 'desc'
        }
      });

      const formatted = notas.map(n => ({
        codigo: n.Codigo,
        nota: n.Nota,
        aluno: n.tb_alunos,
        disciplina: n.tb_disciplinas,
        turma: n.tb_turmas,
        trimestre: n.tb_trimestres,
        tipoAvaliacao: n.tb_tipo_avaliacao,
        dataCadastro: new Date(n.DataCadastro * 1000).toISOString()
      }));

      return res.json({
        success: true,
        data: formatted
      });
    } catch (error) {
      console.error('Erro ao obter minhas notas:', error);
      next(error);
    }
  }

  /**
   * Lançamento de notas em lote pelo professor
   * POST /api/professor/lancar-notas
   */
  static async lancarNotas(req, res, next) {
    try {
      const userId = parseInt(req.user.id);
      const {
        codigoTurma,
        codigoDisciplina,
        codigoTrimestre,
        anoLectivo,         // String de ano letivo, ex: "2025/2026"
        tipoNota,           // Ex: "MAC", "PP", "PT"
        notas               // Array de { codigoAluno: number, nota: number }
      } = req.body;

      if (!codigoTurma || !codigoDisciplina || !codigoTrimestre || !anoLectivo || !tipoNota || !Array.isArray(notas)) {
        return res.status(400).json({
          success: false,
          message: 'Todos os campos (codigoTurma, codigoDisciplina, codigoTrimestre, anoLectivo, tipoNota, notas[]) são obrigatórios.'
        });
      }

      const professor = await ProfessorController.getDocenteByUserId(userId);
      if (!professor) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado. Utilizador não associado a um professor.'
        });
      }

      // 1. Validar se o professor tem essa turma e disciplina atribuída neste ano letivo
      const atribuicao = await prisma.tb_professor_turma.findFirst({
        where: {
          Codigo_Professor: professor.Codigo,
          Codigo_Turma: parseInt(codigoTurma),
          Codigo_Disciplina: parseInt(codigoDisciplina),
          AnoLectivo: anoLectivo,
          Status: 'Activo'
        }
      });

      if (!atribuicao) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado. Esta turma ou disciplina não está atribuída a si para este ano letivo.'
        });
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
        return res.status(400).json({
          success: false,
          message: `O período de lançamento para ${tipoNota} do ${codigoTrimestre}º Trimestre está FECHADO ou INATIVO.`
        });
      }

      // 3. Obter IDs reais de tabelas de suporte do banco (ano letivo, tipo avaliação)
      const mappedTipoNota = tipoNota === 'PP' ? 'NPP' : (tipoNota === 'PT' ? 'NPT' : tipoNota);
      const [anoObj, tipoObj] = await Promise.all([
        ProfessorController.findAnoLectivo(anoLectivo),
        prisma.tb_tipo_avaliacao.findFirst({
          where: {
            OR: [
              { descricao: tipoNota },
              { descricao: mappedTipoNota }
            ]
          }
        })
      ]);

      if (!anoObj) return res.status(404).json({ success: false, message: 'Ano letivo do sistema não encontrado' });
      if (!tipoObj) return res.status(404).json({ success: false, message: 'Tipo de avaliação do sistema não encontrado' });

      const codigoAnoLectivo = atribuicao ? (await prisma.tb_turmas.findUnique({
        where: { codigo: parseInt(codigoTurma) }
      }))?.codigo_AnoLectivo || anoObj.codigo : anoObj.codigo;
      const codigoTipoAvaliacao = tipoObj.codigo;

      // 4. Executar transação para salvar as notas
      const results = await prisma.$transaction(async (tx) => {
        const savedGrades = [];

        for (const item of notas) {
          const { codigoAluno, nota } = item;
          const valorNota = parseFloat(nota);

          if (isNaN(valorNota) || valorNota < 0 || valorNota > 20) {
            throw new AppError(`Nota inválida para o aluno ${codigoAluno}. Deve ser entre 0 e 20.`, 400);
          }

          // Verificar se já existe a nota na tb_notas_alunos
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
            // Atualizar
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
            // Criar
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
   * Alterar senha do professor
   * PUT /api/professor/alterar-senha
   */
  static async alterarSenha(req, res, next) {
    try {
      const userId = parseInt(req.user.id);
      const { senhaAtual, novaSenha } = req.body;

      if (!senhaAtual || !novaSenha) {
        return res.status(400).json({
          success: false,
          message: 'Senha atual e nova senha são obrigatórias'
        });
      }

      const user = await prisma.tb_utilizadores.findUnique({
        where: { codigo: userId }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Utilizador não encontrado'
        });
      }

      // Validar senha atual
      const isPasswordValid = compareLegacyPasswords(senhaAtual, user.passe);
      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Senha atual incorreta'
        });
      }

      // Criptografar nova senha
      const senhaHash = hashLegacyPassword(novaSenha);

      await prisma.tb_utilizadores.update({
        where: { codigo: userId },
        data: { passe: senhaHash }
      });

      return res.json({
        success: true,
        message: 'Senha alterada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      next(error);
    }
  }
}
