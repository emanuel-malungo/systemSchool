import express from 'express';
import prisma from '../config/database.js';

const router = express.Router();

// ===============================================================
// FUNÇÕES AUXILIARES DE SINCRONIZAÇÃO COM A TABELA LEGADA
// ===============================================================

async function syncDisciplinaDocenteCreate(tx, { professorId, disciplinaId, cursoId }) {
  try {
    const codigoDocente = parseInt(professorId);

    // Verificar se já existe a associação legada
    const exists = await tx.tb_disciplinas_docente.findFirst({
      where: {
        codigoDocente: codigoDocente,
        codigoDisciplina: parseInt(disciplinaId),
        codigoCurso: parseInt(cursoId)
      }
    });

    if (!exists) {
      await tx.tb_disciplinas_docente.create({
        data: {
          codigoDocente: codigoDocente,
          codigoDisciplina: parseInt(disciplinaId),
          codigoCurso: parseInt(cursoId)
        }
      });
      console.log(`[SYNC LEGACY] Criou associação tb_disciplinas_docente: Docente ${codigoDocente}, Disciplina ${disciplinaId}, Curso ${cursoId}`);
    }
  } catch (err) {
    console.error('[SYNC LEGACY ERROR] Falha ao sincronizar criação em tb_disciplinas_docente:', err.message);
  }
}

async function syncDisciplinaDocenteDelete(tx, { professorId, disciplinaId, cursoId }) {
  try {
    const codigoDocente = parseInt(professorId);

    // Contar quantas atribuições ativas restam para essa combinação
    const count = await tx.tb_professor_disciplina.count({
      where: {
        Codigo_Professor: codigoDocente,
        Codigo_Disciplina: parseInt(disciplinaId),
        Codigo_Curso: parseInt(cursoId),
        Status: 'Activo'
      }
    });

    // Se não restam atribuições ativas em nenhum ano letivo, limpar o legado
    if (count === 0) {
      await tx.tb_disciplinas_docente.deleteMany({
        where: {
          codigoDocente: codigoDocente,
          codigoDisciplina: parseInt(disciplinaId),
          codigoCurso: parseInt(cursoId)
        }
      });
      console.log(`[SYNC LEGACY] Removeu associação tb_disciplinas_docente: Docente ${codigoDocente}, Disciplina ${disciplinaId}, Curso ${cursoId}`);
    }
  } catch (err) {
    console.error('[SYNC LEGACY ERROR] Falha ao sincronizar remoção em tb_disciplinas_docente:', err.message);
  }
}

// ===============================================================
// ROTAS DE ATRIBUIÇÕES DE PROFESSORES
// ===============================================================

/**
 * @route GET /api/professor-disciplinas
 * @desc Listar atribuições de disciplinas
 */
router.get('/professor-disciplinas', async (req, res) => {
  try {
    const atribuicoes = await prisma.tb_professor_disciplina.findMany({
      include: {
        tb_professores: {
          select: {
            Codigo: true,
            Nome: true,
            NumeroFuncionario: true,
            Status: true
          }
        },
        tb_disciplinas: {
          select: {
            codigo: true,
            designacao: true
          }
        },
        tb_cursos: {
          select: {
            codigo: true,
            designacao: true
          }
        }
      },
      orderBy: [
        { AnoLectivo: 'desc' },
        { tb_professores: { Nome: 'asc' } }
      ]
    });

    // Mapear retorno para campos lowercase compatíveis com o frontend
    const formatted = atribuicoes.map(attr => ({
      codigo: attr.Codigo,
      codigo_Professor: attr.Codigo_Professor,
      codigo_Disciplina: attr.Codigo_Disciplina,
      codigo_Curso: attr.Codigo_Curso,
      anoLectivo: attr.AnoLectivo,
      status: attr.Status,
      tb_professores: attr.tb_professores ? {
        codigo: attr.tb_professores.Codigo,
        nome: attr.tb_professores.Nome,
        numeroFuncionario: attr.tb_professores.NumeroFuncionario,
        status: attr.tb_professores.Status
      } : null,
      tb_disciplinas: attr.tb_disciplinas,
      tb_cursos: attr.tb_cursos
    }));

    res.json({
      success: true,
      data: formatted
    });
  } catch (error) {
    console.error('Erro ao listar atribuições de disciplinas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

/**
 * @route GET /api/professor-turmas
 * @desc Listar atribuições de turmas
 */
router.get('/professor-turmas', async (req, res) => {
  try {
    const atribuicoes = await prisma.tb_professor_turma.findMany({
      include: {
        tb_professores: {
          select: {
            Codigo: true,
            Nome: true,
            NumeroFuncionario: true,
            Status: true
          }
        },
        tb_disciplinas: {
          select: {
            codigo: true,
            designacao: true
          }
        },
        tb_turmas: {
          select: {
            codigo: true,
            designacao: true,
            tb_classes: {
              select: {
                designacao: true
              }
            }
          }
        }
      },
      orderBy: [
        { AnoLectivo: 'desc' },
        { tb_professores: { Nome: 'asc' } }
      ]
    });

    // Mapear retorno para campos lowercase compatíveis com o frontend
    const formatted = atribuicoes.map(attr => ({
      codigo: attr.Codigo,
      codigo_Professor: attr.Codigo_Professor,
      codigo_Turma: attr.Codigo_Turma,
      codigo_Disciplina: attr.Codigo_Disciplina,
      anoLectivo: attr.AnoLectivo,
      status: attr.Status,
      tb_professores: attr.tb_professores ? {
        codigo: attr.tb_professores.Codigo,
        nome: attr.tb_professores.Nome,
        numeroFuncionario: attr.tb_professores.NumeroFuncionario,
        status: attr.tb_professores.Status
      } : null,
      tb_disciplinas: attr.tb_disciplinas,
      tb_turmas: attr.tb_turmas
    }));

    res.json({
      success: true,
      data: formatted
    });
  } catch (error) {
    console.error('Erro ao listar atribuições de turmas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

/**
 * @route POST /api/professor-disciplinas
 * @desc Criar atribuição de disciplina
 */
router.post('/professor-disciplinas', async (req, res) => {
  try {
    const { professorId, disciplinaId, cursoId, anoLectivo } = req.body;

    if (!professorId || !disciplinaId || !cursoId || !anoLectivo) {
      return res.status(400).json({
        success: false,
        message: 'Professor, disciplina, curso e ano letivo são obrigatórios'
      });
    }

    const atribuicaoExiste = await prisma.tb_professor_disciplina.findFirst({
      where: {
        Codigo_Professor: parseInt(professorId),
        Codigo_Disciplina: parseInt(disciplinaId),
        Codigo_Curso: parseInt(cursoId),
        AnoLectivo: anoLectivo,
        Status: 'Activo'
      }
    });

    if (atribuicaoExiste) {
      return res.status(400).json({
        success: false,
        message: 'Professor já possui esta disciplina atribuída para este curso e ano letivo'
      });
    }

    // Criar com transação sincronizando o legado
    const atribuicao = await prisma.$transaction(async (tx) => {
      const created = await tx.tb_professor_disciplina.create({
        data: {
          Codigo_Professor: parseInt(professorId),
          Codigo_Disciplina: parseInt(disciplinaId),
          Codigo_Curso: parseInt(cursoId),
          AnoLectivo: anoLectivo,
          Status: 'Activo'
        },
        include: {
          tb_professores: { select: { Nome: true } },
          tb_disciplinas: { select: { designacao: true } },
          tb_cursos: { select: { designacao: true } }
        }
      });

      await syncDisciplinaDocenteCreate(tx, { professorId, disciplinaId, cursoId });

      return created;
    });

    const formatted = {
      codigo: atribuicao.Codigo,
      codigo_Professor: atribuicao.Codigo_Professor,
      codigo_Disciplina: atribuicao.Codigo_Disciplina,
      codigo_Curso: atribuicao.Codigo_Curso,
      anoLectivo: atribuicao.AnoLectivo,
      status: atribuicao.Status,
      tb_professores: { nome: atribuicao.tb_professores.Nome },
      tb_disciplinas: { designacao: atribuicao.tb_disciplinas.designacao },
      tb_cursos: { designacao: atribuicao.tb_cursos.designacao }
    };

    res.status(201).json({
      success: true,
      message: 'Atribuição de disciplina criada com sucesso',
      data: formatted
    });
  } catch (error) {
    console.error('Erro ao criar atribuição de disciplina:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

/**
 * @route POST /api/professor-turmas
 * @desc Criar atribuição de turma
 */
router.post('/professor-turmas', async (req, res) => {
  try {
    const { professorId, turmaId, disciplinaId, anoLectivo } = req.body;

    if (!professorId || !turmaId || !disciplinaId || !anoLectivo) {
      return res.status(400).json({
        success: false,
        message: 'Professor, turma, disciplina e ano letivo são obrigatórios'
      });
    }

    const atribuicaoExiste = await prisma.tb_professor_turma.findFirst({
      where: {
        Codigo_Professor: parseInt(professorId),
        Codigo_Turma: parseInt(turmaId),
        Codigo_Disciplina: parseInt(disciplinaId),
        AnoLectivo: anoLectivo,
        Status: 'Activo'
      }
    });

    if (atribuicaoExiste) {
      return res.status(400).json({
        success: false,
        message: 'Professor já possui esta turma atribuída para esta disciplina e ano letivo'
      });
    }

    const atribuicao = await prisma.tb_professor_turma.create({
      data: {
        Codigo_Professor: parseInt(professorId),
        Codigo_Turma: parseInt(turmaId),
        Codigo_Disciplina: parseInt(disciplinaId),
        AnoLectivo: anoLectivo,
        Status: 'Activo'
      },
      include: {
        tb_professores: { select: { Nome: true } },
        tb_disciplinas: { select: { designacao: true } },
        tb_turmas: { select: { designacao: true } }
      }
    });

    const formatted = {
      codigo: atribuicao.Codigo,
      codigo_Professor: atribuicao.Codigo_Professor,
      codigo_Turma: atribuicao.Codigo_Turma,
      codigo_Disciplina: atribuicao.Codigo_Disciplina,
      anoLectivo: atribuicao.AnoLectivo,
      status: atribuicao.Status,
      tb_professores: { nome: atribuicao.tb_professores.Nome },
      tb_disciplinas: { designacao: atribuicao.tb_disciplinas.designacao },
      tb_turmas: { designacao: atribuicao.tb_turmas.designacao }
    };

    res.status(201).json({
      success: true,
      message: 'Atribuição de turma criada com sucesso',
      data: formatted
    });
  } catch (error) {
    console.error('Erro ao criar atribuição de turma:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

/**
 * @route DELETE /api/professor-disciplinas/:id
 * @desc Excluir atribuição de disciplina
 */
router.delete('/professor-disciplinas/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const atribuicao = await prisma.tb_professor_disciplina.findUnique({
      where: { Codigo: parseInt(id) }
    });

    if (!atribuicao) {
      return res.status(404).json({
        success: false,
        message: 'Atribuição não encontrada'
      });
    }

    await prisma.$transaction(async (tx) => {
      // Excluir atribuição
      await tx.tb_professor_disciplina.delete({
        where: { Codigo: parseInt(id) }
      });

      // Sincronizar exclusão com o legado
      await syncDisciplinaDocenteDelete(tx, {
        professorId: atribuicao.Codigo_Professor,
        disciplinaId: atribuicao.Codigo_Disciplina,
        cursoId: atribuicao.Codigo_Curso
      });
    });

    res.json({
      success: true,
      message: 'Atribuição de disciplina excluída com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir atribuição de disciplina:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

/**
 * @route DELETE /api/professor-turmas/:id
 * @desc Excluir atribuição de turma
 */
router.delete('/professor-turmas/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const atribuicao = await prisma.tb_professor_turma.findUnique({
      where: { Codigo: parseInt(id) }
    });

    if (!atribuicao) {
      return res.status(404).json({
        success: false,
        message: 'Atribuição não encontrada'
      });
    }

    await prisma.tb_professor_turma.delete({
      where: { Codigo: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Atribuição de turma excluída com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir atribuição de turma:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

/**
 * @route POST /api/atribuicao-completa
 * @desc Criar atribuição completa (professor → disciplina → turma)
 */
router.post('/atribuicao-completa', async (req, res) => {
  try {
    const { professorId, disciplinaId, cursoId, turmaId, anoLectivo } = req.body;

    if (!professorId || !disciplinaId || !cursoId || !anoLectivo) {
      return res.status(400).json({
        success: false,
        message: 'Professor, disciplina, curso e ano letivo são obrigatórios'
      });
    }

    const resultado = await prisma.$transaction(async (tx) => {
      // 1. Criar/verificar atribuição professor-disciplina
      let atribuicaoDisciplina = await tx.tb_professor_disciplina.findFirst({
        where: {
          Codigo_Professor: parseInt(professorId),
          Codigo_Disciplina: parseInt(disciplinaId),
          Codigo_Curso: parseInt(cursoId),
          AnoLectivo: anoLectivo,
          Status: 'Activo'
        }
      });

      if (!atribuicaoDisciplina) {
        atribuicaoDisciplina = await tx.tb_professor_disciplina.create({
          data: {
            Codigo_Professor: parseInt(professorId),
            Codigo_Disciplina: parseInt(disciplinaId),
            Codigo_Curso: parseInt(cursoId),
            AnoLectivo: anoLectivo,
            Status: 'Activo'
          }
        });
      } else {
        return {
          success: false,
          message: 'Professor já possui esta disciplina atribuída para este curso e ano letivo'
        };
      }

      // Sincronizar o legado
      await syncDisciplinaDocenteCreate(tx, { professorId, disciplinaId, cursoId });

      // 2. Se turma foi especificada, criar atribuição professor-turma-disciplina
      let atribuicaoTurma = null;
      if (turmaId) {
        const turmaExiste = await tx.tb_professor_turma.findFirst({
          where: {
            Codigo_Professor: parseInt(professorId),
            Codigo_Turma: parseInt(turmaId),
            Codigo_Disciplina: parseInt(disciplinaId),
            AnoLectivo: anoLectivo,
            Status: 'Activo'
          }
        });

        if (turmaExiste) {
          return {
            success: false,
            message: 'Professor já possui esta turma atribuída para esta disciplina e ano letivo'
          };
        }

        atribuicaoTurma = await tx.tb_professor_turma.create({
          data: {
            Codigo_Professor: parseInt(professorId),
            Codigo_Turma: parseInt(turmaId),
            Codigo_Disciplina: parseInt(disciplinaId),
            AnoLectivo: anoLectivo,
            Status: 'Activo'
          }
        });
      }

      return {
        success: true,
        atribuicaoDisciplina,
        atribuicaoTurma
      };
    });

    if (!resultado.success) {
      return res.status(400).json(resultado);
    }

    const dadosCompletos = await prisma.tb_professor_disciplina.findUnique({
      where: { Codigo: resultado.atribuicaoDisciplina.Codigo },
      include: {
        tb_professores: { select: { Codigo: true, Nome: true } },
        tb_disciplinas: { select: { codigo: true, designacao: true } },
        tb_cursos: { select: { codigo: true, designacao: true } }
      }
    });

    const formattedDisciplina = {
      codigo: dadosCompletos.Codigo,
      codigo_Professor: dadosCompletos.Codigo_Professor,
      codigo_Disciplina: dadosCompletos.Codigo_Disciplina,
      codigo_Curso: dadosCompletos.Codigo_Curso,
      anoLectivo: dadosCompletos.AnoLectivo,
      status: dadosCompletos.Status,
      tb_professores: { codigo: dadosCompletos.tb_professores.Codigo, nome: dadosCompletos.tb_professores.Nome },
      tb_disciplinas: dadosCompletos.tb_disciplinas,
      tb_cursos: dadosCompletos.tb_cursos
    };

    const formattedTurma = resultado.atribuicaoTurma ? {
      codigo: resultado.atribuicaoTurma.Codigo,
      codigo_Professor: resultado.atribuicaoTurma.Codigo_Professor,
      codigo_Turma: resultado.atribuicaoTurma.Codigo_Turma,
      codigo_Disciplina: resultado.atribuicaoTurma.Codigo_Disciplina,
      anoLectivo: resultado.atribuicaoTurma.AnoLectivo,
      status: resultado.atribuicaoTurma.Status
    } : null;

    res.status(201).json({
      success: true,
      message: turmaId ? 
        'Atribuição completa (disciplina + turma) criada com sucesso' : 
        'Atribuição de disciplina criada com sucesso',
      data: {
        disciplina: formattedDisciplina,
        turma: formattedTurma
      }
    });
  } catch (error) {
    console.error('Erro ao criar atribuição completa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

/**
 * @route GET /api/atribuicoes-professor/:professorId
 * @desc Buscar todas as atribuições de um professor
 */
router.get('/atribuicoes-professor/:professorId', async (req, res) => {
  try {
    const { professorId } = req.params;

    const [disciplinas, turmas] = await Promise.all([
      prisma.tb_professor_disciplina.findMany({
        where: {
          Codigo_Professor: parseInt(professorId),
          Status: 'Activo'
        },
        include: {
          tb_disciplinas: { select: { codigo: true, designacao: true } },
          tb_cursos: { select: { codigo: true, designacao: true } }
        }
      }),
      prisma.tb_professor_turma.findMany({
        where: {
          Codigo_Professor: parseInt(professorId),
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

    res.json({
      success: true,
      data: {
        disciplinas: formattedDisciplinas,
        turmas: formattedTurmas,
        totalDisciplinas: formattedDisciplinas.length,
        totalTurmas: formattedTurmas.length
      }
    });
  } catch (error) {
    console.error('Erro ao buscar atribuições do professor:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

/**
 * @route DELETE /api/professores/:professorId/disciplinas/:atribuicaoId
 * @desc Remover atribuição de disciplina por professor
 */
router.delete('/professores/:professorId/disciplinas/:atribuicaoId', async (req, res) => {
  try {
    const { professorId, atribuicaoId } = req.params;

    const atribuicao = await prisma.tb_professor_disciplina.findFirst({
      where: {
        Codigo: parseInt(atribuicaoId),
        Codigo_Professor: parseInt(professorId)
      }
    });

    if (!atribuicao) {
      return res.status(404).json({
        success: false,
        message: 'Atribuição de disciplina não encontrada'
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.tb_professor_disciplina.delete({
        where: { Codigo: parseInt(atribuicaoId) }
      });

      await syncDisciplinaDocenteDelete(tx, {
        professorId: atribuicao.Codigo_Professor,
        disciplinaId: atribuicao.Codigo_Disciplina,
        cursoId: atribuicao.Codigo_Curso
      });
    });

    res.json({
      success: true,
      message: 'Atribuição de disciplina removida com sucesso'
    });
  } catch (error) {
    console.error('Erro ao remover atribuição de disciplina:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

/**
 * @route DELETE /api/professores/:professorId/turmas/:atribuicaoId
 * @desc Remover atribuição de turma por professor
 */
router.delete('/professores/:professorId/turmas/:atribuicaoId', async (req, res) => {
  try {
    const { professorId, atribuicaoId } = req.params;

    const atribuicao = await prisma.tb_professor_turma.findFirst({
      where: {
        Codigo: parseInt(atribuicaoId),
        Codigo_Professor: parseInt(professorId)
      }
    });

    if (!atribuicao) {
      return res.status(404).json({
        success: false,
        message: 'Atribuição de turma não encontrada'
      });
    }

    await prisma.tb_professor_turma.delete({
      where: { Codigo: parseInt(atribuicaoId) }
    });

    res.json({
      success: true,
      message: 'Atribuição de turma removida com sucesso'
    });
  } catch (error) {
    console.error('Erro ao remover atribuição de turma:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

/**
 * @route POST /api/professores/:professorId/disciplinas
 * @desc Atribuir disciplina ao professor
 */
router.post('/professores/:professorId/disciplinas', async (req, res) => {
  try {
    const { professorId } = req.params;
    const { disciplinaId, cursoId, anoLectivo } = req.body;

    const atribuicaoExiste = await prisma.tb_professor_disciplina.findFirst({
      where: {
        Codigo_Professor: parseInt(professorId),
        Codigo_Disciplina: parseInt(disciplinaId),
        Codigo_Curso: parseInt(cursoId),
        AnoLectivo: anoLectivo,
        Status: 'Activo'
      }
    });

    if (atribuicaoExiste) {
      return res.status(400).json({
        success: false,
        message: 'Professor já possui esta disciplina atribuída'
      });
    }

    const atribuicao = await prisma.$transaction(async (tx) => {
      const created = await tx.tb_professor_disciplina.create({
        data: {
          Codigo_Professor: parseInt(professorId),
          Codigo_Disciplina: parseInt(disciplinaId),
          Codigo_Curso: parseInt(cursoId),
          AnoLectivo: anoLectivo,
          Status: 'Activo'
        }
      });

      await syncDisciplinaDocenteCreate(tx, { professorId, disciplinaId, cursoId });

      return created;
    });

    res.status(201).json({
      success: true,
      message: 'Disciplina atribuída com sucesso',
      data: {
        codigo: atribuicao.Codigo,
        codigo_Professor: atribuicao.Codigo_Professor,
        codigo_Disciplina: atribuicao.Codigo_Disciplina,
        codigo_Curso: atribuicao.Codigo_Curso,
        anoLectivo: atribuicao.AnoLectivo,
        status: atribuicao.Status
      }
    });
  } catch (error) {
    console.error('Erro ao atribuir disciplina:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

/**
 * @route POST /api/professores/:professorId/turmas
 * @desc Atribuir turma ao professor
 */
router.post('/professores/:professorId/turmas', async (req, res) => {
  try {
    const { professorId } = req.params;
    const { turmaId, disciplinaId, anoLectivo } = req.body;

    const atribuicaoExiste = await prisma.tb_professor_turma.findFirst({
      where: {
        Codigo_Professor: parseInt(professorId),
        Codigo_Turma: parseInt(turmaId),
        Codigo_Disciplina: parseInt(disciplinaId),
        AnoLectivo: anoLectivo,
        Status: 'Activo'
      }
    });

    if (atribuicaoExiste) {
      return res.status(400).json({
        success: false,
        message: 'Professor já possui esta turma atribuída para esta disciplina'
      });
    }

    const atribuicao = await prisma.tb_professor_turma.create({
      data: {
        Codigo_Professor: parseInt(professorId),
        Codigo_Turma: parseInt(turmaId),
        Codigo_Disciplina: parseInt(disciplinaId),
        AnoLectivo: anoLectivo,
        Status: 'Activo'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Turma atribuída com sucesso',
      data: {
        codigo: atribuicao.Codigo,
        codigo_Professor: atribuicao.Codigo_Professor,
        codigo_Turma: atribuicao.Codigo_Turma,
        codigo_Disciplina: atribuicao.Codigo_Disciplina,
        anoLectivo: atribuicao.AnoLectivo,
        status: atribuicao.Status
      }
    });
  } catch (error) {
    console.error('Erro ao atribuir turma:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

/**
 * @route GET /api/professores
 * @desc Listar todos os professores mapeados para minúsculo
 */
router.get('/professores', async (req, res) => {
  try {
    const { page = 1, limit = 100, search = '', status = 'Activo' } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      Status: status,
      ...(search && {
        OR: [
          { Nome: { contains: search } },
          { Email: { contains: search } },
          { Formacao: { contains: search } },
          { Especialidade: { contains: search } }
        ]
      })
    };

    const professores = await prisma.tb_professores.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { Nome: 'asc' }
    });

    const total = await prisma.tb_professores.count({ where });

    const formatted = professores.map(p => ({
      codigo: p.Codigo,
      nome: p.Nome,
      email: p.Email,
      telefone: p.Telefone,
      formacao: p.Formacao,
      nivelAcademico: p.NivelAcademico,
      especialidade: p.Especialidade,
      numeroFuncionario: p.NumeroFuncionario,
      status: p.Status,
      codigoUtilizador: p.Codigo_Utilizador
    }));

    res.json({
      success: true,
      data: formatted,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao listar professores:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

export default router;
