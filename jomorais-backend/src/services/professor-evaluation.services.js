// services/professor-evaluation.services.js
import prisma from '../config/database.js';
import { AppError } from '../utils/validation.utils.js';
import { hashLegacyPassword } from '../utils/encryption.utils.js';

// ==========================================
// FUNÇÕES AUXILIARES DE GERAÇÃO DE USERNAME
// ==========================================

async function verificarUsernameExiste(username, tx) {
  const db = tx || prisma;
  const usuario = await db.tb_utilizadores.findFirst({
    where: { user: username }
  });
  return !!usuario;
}

async function gerarUsername(nomeCompleto, tx) {
  if (!nomeCompleto || typeof nomeCompleto !== 'string') {
    throw new AppError('Nome completo é obrigatório para gerar username', 400);
  }

  // Limpar e normalizar o nome
  const nomeNormalizado = nomeCompleto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z\s]/g, '') // Remove caracteres especiais
    .trim();

  if (!nomeNormalizado) {
    throw new AppError('Nome inválido para gerar username', 400);
  }

  const partesNome = nomeNormalizado.split(/\s+/).filter(parte => parte.length > 0);
  
  if (partesNome.length === 0) {
    throw new AppError('Nome deve conter pelo menos uma palavra válida', 400);
  }

  let baseUsername;
  
  if (partesNome.length === 1) {
    baseUsername = partesNome[0];
  } else {
    baseUsername = `${partesNome[0]}.${partesNome[partesNome.length - 1]}`;
  }

  let username = baseUsername;
  let contador = 1;
  
  while (await verificarUsernameExiste(username, tx)) {
    username = `${baseUsername}${contador}`;
    contador++;
    
    if (contador > 999) {
      username = `${baseUsername}${Date.now()}`;
      break;
    }
  }

  return username;
}


export class ProfessorEvaluationService {
  // ===============================
  // PROFESSORES - CRUD COMPLETO
  // ===============================

  static async createProfessor(data) {
    try {
      const {
        nome,
        email,
        telefone,
        formacao,
        nivelAcademico,
        especialidade,
        numeroFuncionario,
        dataAdmissao,
        status = 'Activo',
        codigoUtilizador,
        criarUsuario = true // Por padrão, criar usuário automaticamente se não for fornecido
      } = data;

      // Validações básicas
      if (!nome || !email || !formacao || !nivelAcademico) {
        throw new AppError('Campos obrigatórios: nome, email, formação e nível acadêmico', 400);
      }

      // Verificar se professor com mesmo email já existe
      const existingProfessor = await prisma.tb_professores.findFirst({
        where: { Email: email.toLowerCase().trim() }
      });

      if (existingProfessor) {
        throw new AppError('Já existe um professor com este email', 409);
      }

      // Executar a criação em uma transação do Prisma
      const result = await prisma.$transaction(async (tx) => {
        let finalCodigoUtilizador = codigoUtilizador ? parseInt(codigoUtilizador) : null;
        let dadosUsuario = null;

        // Se codigoUtilizador foi fornecido, validar utilizador existente
        if (finalCodigoUtilizador) {
          const utilizadorExists = await tx.tb_utilizadores.findUnique({
            where: { codigo: finalCodigoUtilizador }
          });
          if (!utilizadorExists) {
            throw new AppError('Utilizador não encontrado', 404);
          }
        } 
        // Caso contrário, se criarUsuario for true, criar o utilizador automaticamente
        else if (criarUsuario) {
          try {
            // Gerar username único
            const username = await gerarUsername(nome, tx);
            
            // Gerar hash da senha padrão (MD5 para compatibilidade com sistema legado do JoMorais)
            const senhaHash = hashLegacyPassword('123456');

            // Buscar tipo de usuário "Professor" ou "PROFESSOR (A)"
            let tipoUsuarioProfessor = await tx.tb_tipos_utilizador.findFirst({
              where: {
                OR: [
                  { designacao: 'Professor' },
                  { designacao: 'PROFESSOR (A)' }
                ]
              }
            });

            let codigoTipoUtilizador = tipoUsuarioProfessor?.codigo;
            if (!codigoTipoUtilizador) {
              const checkId8 = await tx.tb_tipos_utilizador.findUnique({
                where: { codigo: 8 }
              });
              if (checkId8) {
                codigoTipoUtilizador = 8;
              } else {
                try {
                  const maxTipo = await tx.tb_tipos_utilizador.findFirst({
                    orderBy: { codigo: 'desc' },
                    select: { codigo: true }
                  });
                  const proximoTipoCodigo = maxTipo ? maxTipo.codigo + 1 : 1;

                  const novoTipo = await tx.tb_tipos_utilizador.create({
                    data: {
                      codigo: proximoTipoCodigo,
                      designacao: 'PROFESSOR (A)'
                    }
                  });
                  codigoTipoUtilizador = novoTipo.codigo;
                } catch (e) {
                  // Fallback final
                  codigoTipoUtilizador = 8;
                }
              }
            }

            // Obter o próximo código (ID) manual para tb_utilizadores
            const maxUtilizador = await tx.tb_utilizadores.findFirst({
              orderBy: { codigo: 'desc' },
              select: { codigo: true }
            });
            const proximoCodigo = maxUtilizador ? maxUtilizador.codigo + 1 : 1;

            // Criar utilizador
            const novoUsuario = await tx.tb_utilizadores.create({
              data: {
                codigo: proximoCodigo,
                nome: nome.trim(),
                user: username,
                passe: senhaHash,
                codigo_Tipo_Utilizador: codigoTipoUtilizador,
                estadoActual: 'Activo',
                dataCadastro: new Date(),
                loginStatus: 'OFF'
              }
            });

            finalCodigoUtilizador = novoUsuario.codigo;
            dadosUsuario = {
              username: username,
              senhaTemporaria: '123456',
              tipo: 'Professor'
            };
          } catch (userError) {
            console.error('Erro ao criar usuário automático para o professor:', userError);
            throw new AppError(`Erro ao criar utilizador automático: ${userError.message}`, 500);
          }
        }

        // Resolve the especialidade ID
        let codigoEspecialidadeResolved = null;
        if (especialidade) {
          const espObj = await tx.tb_especialidade.findFirst({
            where: { designacao: { contains: especialidade.trim() } }
          });
          if (espObj) {
            codigoEspecialidadeResolved = espObj.codigo;
          }
        }

        // Criar na tabela tb_docente primeiro para obter o ID autoincrementado unificado
        const novoDocente = await tx.tb_docente.create({
          data: {
            nome: nome.trim(),
            status: status === 'Activo' ? 1 : 0,
            codigo_Utilizador: finalCodigoUtilizador,
            codigo_Especialidade: codigoEspecialidadeResolved,
            contacto: telefone?.trim() || null,
            email: email.toLowerCase().trim(),
            user_id: BigInt(1) // ID do utilizador criador padrão
          }
        });

        // Criar o professor vinculando ao utilizador com o mesmo ID
        const professor = await tx.tb_professores.create({
          data: {
            Codigo: novoDocente.codigo,
            Nome: nome.trim(),
            Email: email.toLowerCase().trim(),
            Telefone: telefone?.trim() || null,
            Formacao: formacao.trim(),
            NivelAcademico: nivelAcademico.trim(),
            Especialidade: especialidade?.trim() || null,
            NumeroFuncionario: numeroFuncionario?.trim() || null,
            DataAdmissao: dataAdmissao ? new Date(dataAdmissao) : null,
            Status: status,
            Codigo_Utilizador: finalCodigoUtilizador
          }
        });

        return {
          professor,
          dadosUsuario
        };
      });

      return {
        ...result.professor,
        usuario: result.dadosUsuario,
        mensagem: 'Professor criado com sucesso'
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Erro detalhado ao criar professor:', error);
      throw new AppError(`Erro ao criar professor: ${error.message}`, 500);
    }
  }

  static async updateProfessor(id, data) {
    try {
      const professorId = parseInt(id);

      const existingProfessor = await prisma.tb_professores.findUnique({
        where: { Codigo: professorId }
      });

      if (!existingProfessor) {
        throw new AppError('Professor não encontrado', 404);
      }

      // Se atualizando email, verificar duplicatas
      if (data.email && data.email.toLowerCase().trim() !== existingProfessor.Email) {
        const duplicateEmail = await prisma.tb_professores.findFirst({
          where: {
            Email: data.email.toLowerCase().trim(),
            Codigo: { not: professorId }
          }
        });
        if (duplicateEmail) {
          throw new AppError('Já existe outro professor com este email', 409);
        }
      }

      // Validar utilizador se fornecido
      if (data.codigoUtilizador) {
        const utilizadorExists = await prisma.tb_utilizadores.findUnique({
          where: { codigo: parseInt(data.codigoUtilizador) }
        });
        if (!utilizadorExists) {
          throw new AppError('Utilizador não encontrado', 404);
        }
      }

      const updateData = {};
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== null) {
          switch (key) {
            case 'nome':
              updateData['Nome'] = data[key].trim();
              break;
            case 'email':
              updateData['Email'] = data[key].toLowerCase().trim();
              break;
            case 'telefone':
              updateData['Telefone'] = data[key].trim();
              break;
            case 'formacao':
              updateData['Formacao'] = data[key].trim();
              break;
            case 'nivelAcademico':
              updateData['NivelAcademico'] = data[key].trim();
              break;
            case 'especialidade':
              updateData['Especialidade'] = data[key].trim();
              break;
            case 'numeroFuncionario':
              updateData['NumeroFuncionario'] = data[key].trim();
              break;
            case 'status':
              updateData['Status'] = data[key].trim();
              break;
            case 'dataAdmissao':
              updateData['DataAdmissao'] = new Date(data[key]);
              break;
            case 'codigoUtilizador':
              updateData['Codigo_Utilizador'] = parseInt(data[key]);
              break;
          }
        }
      });

      // Executar a atualização em uma transação para manter tb_docente sincronizado
      const result = await prisma.$transaction(async (tx) => {
        // Mapear campos para tb_docente
        const docenteUpdateData = {};
        if (data.nome) docenteUpdateData.nome = data.nome.trim();
        if (data.email) docenteUpdateData.email = data.email.toLowerCase().trim();
        if (data.telefone !== undefined) docenteUpdateData.contacto = data.telefone?.trim() || null;
        if (data.status) docenteUpdateData.status = data.status === 'Activo' ? 1 : 0;
        if (data.codigoUtilizador !== undefined) docenteUpdateData.codigo_Utilizador = data.codigoUtilizador ? parseInt(data.codigoUtilizador) : null;

        // Se especialidade foi alterada, resolver o ID
        if (data.especialidade) {
          const espObj = await tx.tb_especialidade.findFirst({
            where: { designacao: { contains: data.especialidade.trim() } }
          });
          if (espObj) {
            docenteUpdateData.codigo_Especialidade = espObj.codigo;
          }
        }

        // Atualizar tb_docente se houver campos para atualizar
        if (Object.keys(docenteUpdateData).length > 0) {
          await tx.tb_docente.update({
            where: { codigo: professorId },
            data: docenteUpdateData
          }).catch(e => console.error('Erro ao atualizar tb_docente correspondente:', e));
        }

        // Atualizar tb_professores
        return await tx.tb_professores.update({
          where: { Codigo: professorId },
          data: updateData
        });
      });

      return {
        ...result,
        mensagem: 'Professor atualizado com sucesso'
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Erro ao atualizar professor: ${error.message}`, 500);
    }
  }

  static async getProfessores(page = 1, limit = 10, search = '') {
    try {
      const skip = (page - 1) * limit;

      const where = search ? {
        OR: [
          { Nome: { contains: search } },
          { Email: { contains: search } },
          { Telefone: { contains: search } },
          { Especialidade: { contains: search } }
        ]
      } : {};

      const [professores, total] = await Promise.all([
        prisma.tb_professores.findMany({
          where,
          skip,
          take: parseInt(limit),
          include: {
            _count: {
              select: {
                tb_professor_disciplina: true,
                tb_professor_turma: true
              }
            }
          },
          orderBy: { Nome: 'asc' }
        }),
        prisma.tb_professores.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: professores,
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
      console.error('Erro ao buscar professores:', error);
      throw new AppError(`Erro ao buscar professores: ${error.message}`, 500);
    }
  }

  static async getProfessorById(id) {
    try {
      const professor = await prisma.tb_professores.findUnique({
        where: { Codigo: parseInt(id) },
        include: {
          tb_professor_disciplina: {
            select: {
              Codigo: true,
              Codigo_Disciplina: true,
              Codigo_Curso: true,
              AnoLectivo: true,
              Status: true
            },
            take: 10
          },
          tb_professor_turma: {
            select: {
              Codigo: true,
              Codigo_Turma: true,
              Codigo_Disciplina: true,
              AnoLectivo: true,
              Status: true
            },
            take: 10
          }
        }
      });

      if (!professor) {
        throw new AppError('Professor não encontrado', 404);
      }

      return professor;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Erro ao buscar professor: ${error.message}`, 500);
    }
  }

  static async deleteProfessor(id) {
    try {
      const professorId = parseInt(id);

      const professor = await prisma.tb_professores.findUnique({
        where: { Codigo: professorId },
        include: {
          _count: {
            select: {
              tb_professor_disciplina: true,
              tb_professor_turma: true
            }
          }
        }
      });

      if (!professor) {
        throw new AppError('Professor não encontrado', 404);
      }

      // Verificar se possui atribuições ativas
      if (
        professor._count.tb_professor_disciplina > 0 ||
        professor._count.tb_professor_turma > 0
      ) {
        throw new AppError(
          'Não é possível excluir professor com atribuições de disciplina ou turma ativas',
          400
        );
      }

      // Arquivar em vez de deletar (soft delete) nas duas tabelas
      await prisma.$transaction(async (tx) => {
        await tx.tb_professores.update({
          where: { Codigo: professorId },
          data: { Status: 'Inactivo' }
        });

        await tx.tb_docente.update({
          where: { codigo: professorId },
          data: { status: 0 }
        }).catch(e => console.error('Erro ao desativar tb_docente correspondente:', e));
      });

      return {
        mensagem: 'Professor arquivado com sucesso'
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Erro ao deletar professor: ${error.message}`, 500);
    }
  }

  static async getProfessoresAtivos() {
    try {
      return await prisma.tb_professores.findMany({
        where: { Status: 'Activo' },
        select: {
          Codigo: true,
          Nome: true,
          Email: true,
          Especialidade: true
        },
        orderBy: { Nome: 'asc' }
      });
    } catch (error) {
      throw new AppError(`Erro ao buscar professores ativos: ${error.message}`, 500);
    }
  }

  // ===============================
  // PROFESSOR DISCIPLINA - CRUD
  // ===============================

  static async assignDisciplinaToProfessor(data) {
    try {
      const { codigoProfessor, codigoDisciplina, codigoCurso, anoLectivo } = data;

      if (!codigoProfessor || !codigoDisciplina || !codigoCurso || !anoLectivo) {
        throw new AppError(
          'Campos obrigatórios: codigoProfessor, codigoDisciplina, codigoCurso, anoLectivo',
          400
        );
      }

      // Validar professor
      const professor = await prisma.tb_professores.findUnique({
        where: { Codigo: parseInt(codigoProfessor) }
      });
      if (!professor) throw new AppError('Professor não encontrado', 404);

      // Validar disciplina
      const disciplina = await prisma.tb_disciplinas.findUnique({
        where: { codigo: parseInt(codigoDisciplina) }
      });
      if (!disciplina) throw new AppError('Disciplina não encontrada', 404);

      // Validar curso
      const curso = await prisma.tb_cursos.findUnique({
        where: { codigo: parseInt(codigoCurso) }
      });
      if (!curso) throw new AppError('Curso não encontrado', 404);

      // Verificar duplicata
      const existingAssignment = await prisma.tb_professor_disciplina.findFirst({
        where: {
          Codigo_Professor: parseInt(codigoProfessor),
          Codigo_Disciplina: parseInt(codigoDisciplina),
          Codigo_Curso: parseInt(codigoCurso),
          AnoLectivo: anoLectivo.trim()
        }
      });

      if (existingAssignment) {
        throw new AppError(
          'Professor já está atribuído a esta disciplina neste curso e ano letivo',
          409
        );
      }

      const assignment = await prisma.tb_professor_disciplina.create({
        data: {
          Codigo_Professor: parseInt(codigoProfessor),
          Codigo_Disciplina: parseInt(codigoDisciplina),
          Codigo_Curso: parseInt(codigoCurso),
          AnoLectivo: anoLectivo.trim(),
          Status: 'Activo'
        },
        include: {
          tb_professores: { select: { Codigo: true, nome: true } },
          tb_disciplinas: { select: { codigo: true, designacao: true } },
          tb_cursos: { select: { codigo: true, designacao: true } }
        }
      });

      return {
        ...assignment,
        mensagem: 'Disciplina atribuída ao professor com sucesso'
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Erro ao atribuir disciplina: ${error.message}`, 500);
    }
  }

  static async getProfessorDisciplinas(page = 1, limit = 10, professorId = null) {
    try {
      const skip = (page - 1) * limit;

      const where = professorId
        ? { Codigo_Professor: parseInt(professorId) }
        : {};

      const [disciplinas, total] = await Promise.all([
        prisma.tb_professor_disciplina.findMany({
          where,
          skip,
          take: parseInt(limit),
          include: {
            tb_professores: { select: { Codigo: true, nome: true } },
            tb_disciplinas: { select: { codigo: true, designacao: true } },
            tb_cursos: { select: { codigo: true, designacao: true } }
          },
          orderBy: { AnoLectivo: 'desc' }
        }),
        prisma.tb_professor_disciplina.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: disciplinas,
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
      throw new AppError(`Erro ao buscar disciplinas do professor: ${error.message}`, 500);
    }
  }

  static async updateProfessorDisciplina(id, data) {
    try {
      const assignment = await prisma.tb_professor_disciplina.findUnique({
        where: { Codigo: parseInt(id) }
      });

      if (!assignment) {
        throw new AppError('Atribuição de disciplina não encontrada', 404);
      }

      const updateData = {};
      if (data.status) updateData.Status = data.status;

      const updated = await prisma.tb_professor_disciplina.update({
        where: { Codigo: parseInt(id) },
        data: updateData,
        include: {
          tb_professores: { select: { Codigo: true, nome: true } },
          tb_disciplinas: { select: { codigo: true, designacao: true } },
          tb_cursos: { select: { codigo: true, designacao: true } }
        }
      });

      return {
        ...updated,
        mensagem: 'Atribuição de disciplina atualizada com sucesso'
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Erro ao atualizar atribuição: ${error.message}`, 500);
    }
  }

  static async deleteProfessorDisciplina(id) {
    try {
      const assignment = await prisma.tb_professor_disciplina.findUnique({
        where: { Codigo: parseInt(id) }
      });

      if (!assignment) {
        throw new AppError('Atribuição de disciplina não encontrada', 404);
      }

      await prisma.tb_professor_disciplina.delete({
        where: { Codigo: parseInt(id) }
      });

      return {
        mensagem: 'Atribuição de disciplina removida com sucesso'
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Erro ao remover atribuição: ${error.message}`, 500);
    }
  }

  // ===============================
  // PROFESSOR TURMA - CRUD
  // ===============================

  static async assignTurmaToProfessor(data) {
    try {
      const { codigoProfessor, codigoTurma, codigoDisciplina, anoLectivo } = data;

      if (!codigoProfessor || !codigoTurma || !codigoDisciplina || !anoLectivo) {
        throw new AppError(
          'Campos obrigatórios: codigoProfessor, codigoTurma, codigoDisciplina, anoLectivo',
          400
        );
      }

      // Validações
      const [professor, turma, disciplina] = await Promise.all([
        prisma.tb_professores.findUnique({
          where: { Codigo: parseInt(codigoProfessor) }
        }),
        prisma.tb_turmas.findUnique({
          where: { codigo: parseInt(codigoTurma) }
        }),
        prisma.tb_disciplinas.findUnique({
          where: { codigo: parseInt(codigoDisciplina) }
        })
      ]);

      if (!professor) throw new AppError('Professor não encontrado', 404);
      if (!turma) throw new AppError('Turma não encontrada', 404);
      if (!disciplina) throw new AppError('Disciplina não encontrada', 404);

      // Verificar duplicata
      const existingAssignment = await prisma.tb_professor_turma.findFirst({
        where: {
          Codigo_Professor: parseInt(codigoProfessor),
          Codigo_Turma: parseInt(codigoTurma),
          Codigo_Disciplina: parseInt(codigoDisciplina),
          AnoLectivo: anoLectivo.trim()
        }
      });

      if (existingAssignment) {
        throw new AppError(
          'Professor já está atribuído a esta turma e disciplina neste ano letivo',
          409
        );
      }

      const assignment = await prisma.tb_professor_turma.create({
        data: {
          Codigo_Professor: parseInt(codigoProfessor),
          Codigo_Turma: parseInt(codigoTurma),
          Codigo_Disciplina: parseInt(codigoDisciplina),
          AnoLectivo: anoLectivo.trim(),
          Status: 'Activo'
        },
        include: {
          tb_professores: { select: { Codigo: true, nome: true } },
          tb_turmas: { select: { codigo: true, designacao: true } },
          tb_disciplinas: { select: { codigo: true, designacao: true } }
        }
      });

      return {
        ...assignment,
        mensagem: 'Turma atribuída ao professor com sucesso'
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Erro ao atribuir turma: ${error.message}`, 500);
    }
  }

  static async getProfessorTurmas(page = 1, limit = 10, professorId = null) {
    try {
      const skip = (page - 1) * limit;

      const where = professorId
        ? { Codigo_Professor: parseInt(professorId) }
        : {};

      const [turmas, total] = await Promise.all([
        prisma.tb_professor_turma.findMany({
          where,
          skip,
          take: parseInt(limit),
          include: {
            tb_professores: { select: { Codigo: true, nome: true } },
            tb_turmas: { select: { codigo: true, designacao: true } },
            tb_disciplinas: { select: { codigo: true, designacao: true } }
          },
          orderBy: { AnoLectivo: 'desc' }
        }),
        prisma.tb_professor_turma.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: turmas,
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
      throw new AppError(`Erro ao buscar turmas do professor: ${error.message}`, 500);
    }
  }

  static async updateProfessorTurma(id, data) {
    try {
      const assignment = await prisma.tb_professor_turma.findUnique({
        where: { Codigo: parseInt(id) }
      });

      if (!assignment) {
        throw new AppError('Atribuição de turma não encontrada', 404);
      }

      const updateData = {};
      if (data.status) updateData.Status = data.status;

      const updated = await prisma.tb_professor_turma.update({
        where: { Codigo: parseInt(id) },
        data: updateData,
        include: {
          tb_professores: { select: { Codigo: true, nome: true } },
          tb_turmas: { select: { codigo: true, designacao: true } },
          tb_disciplinas: { select: { codigo: true, designacao: true } }
        }
      });

      return {
        ...updated,
        mensagem: 'Atribuição de turma atualizada com sucesso'
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Erro ao atualizar atribuição: ${error.message}`, 500);
    }
  }

  static async deleteProfessorTurma(id) {
    try {
      const assignment = await prisma.tb_professor_turma.findUnique({
        where: { Codigo: parseInt(id) }
      });

      if (!assignment) {
        throw new AppError('Atribuição de turma não encontrada', 404);
      }

      await prisma.tb_professor_turma.delete({
        where: { Codigo: parseInt(id) }
      });

      return {
        mensagem: 'Atribuição de turma removida com sucesso'
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Erro ao remover atribuição: ${error.message}`, 500);
    }
  }

  // ===============================
  // PERÍODOS DE AVALIAÇÃO - CRUD
  // ===============================

  static async createPeriodoAvaliacao(data) {
    try {
      const {
        designacao,
        tipoAvaliacao,
        trimestre,
        dataInicio,
        dataFim,
        anoLectivo,
        status = 'Activo',
        observacoes
      } = data;

      if (
        !designacao ||
        !tipoAvaliacao ||
        !trimestre ||
        !dataInicio ||
        !dataFim ||
        !anoLectivo
      ) {
        throw new AppError(
          'Campos obrigatórios: designacao, tipoAvaliacao, trimestre, dataInicio, dataFim, anoLectivo',
          400
        );
      }

      // Validar datas
      const inicio = new Date(dataInicio);
      const fim = new Date(dataFim);

      if (inicio >= fim) {
        throw new AppError('Data de início deve ser anterior à data de fim', 400);
      }

      // Verificar duplicata
      const existingPeriodo = await prisma.tb_periodos_avaliacao.findFirst({
        where: {
          designacao: designacao.trim(),
          AnoLectivo: anoLectivo.trim()
        }
      });

      if (existingPeriodo) {
        throw new AppError(
          'Já existe um período de avaliação com esta designação neste ano letivo',
          409
        );
      }

      const periodo = await prisma.tb_periodos_avaliacao.create({
        data: {
          Designacao: designacao.trim(),
          TipoAvaliacao: tipoAvaliacao.trim(),
          Trimestre: parseInt(trimestre),
          DataInicio: inicio,
          DataFim: fim,
          AnoLectivo: anoLectivo.trim(),
          Status: status,
          Observacoes: observacoes?.trim() || null
        }
      });

      return {
        ...periodo,
        mensagem: 'Período de avaliação criado com sucesso'
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Erro ao criar período de avaliação: ${error.message}`, 500);
    }
  }

  static async getPeriodosAvaliacao(page = 1, limit = 10, anoLectivo = null) {
    try {
      const skip = (page - 1) * limit;

      const where = anoLectivo ? { AnoLectivo: anoLectivo.trim() } : {};

      const [periodos, total] = await Promise.all([
        prisma.tb_periodos_avaliacao.findMany({
          where,
          skip,
          take: parseInt(limit),
          orderBy: [{ AnoLectivo: 'desc' }, { Trimestre: 'asc' }]
        }),
        prisma.tb_periodos_avaliacao.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: periodos,
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
      throw new AppError(`Erro ao buscar períodos de avaliação: ${error.message}`, 500);
    }
  }

  static async getPeriodoAvaliacaoById(id) {
    try {
      const periodo = await prisma.tb_periodos_avaliacao.findUnique({
        where: { Codigo: parseInt(id) }
      });

      if (!periodo) {
        throw new AppError('Período de avaliação não encontrado', 404);
      }

      return periodo;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Erro ao buscar período de avaliação: ${error.message}`, 500);
    }
  }

  static async updatePeriodoAvaliacao(id, data) {
    try {
      const periodo = await prisma.tb_periodos_avaliacao.findUnique({
        where: { Codigo: parseInt(id) }
      });

      if (!periodo) {
        throw new AppError('Período de avaliação não encontrado', 404);
      }

      // Validar datas se fornecidas
      if (data.dataInicio && data.dataFim) {
        const inicio = new Date(data.dataInicio);
        const fim = new Date(data.dataFim);
        if (inicio >= fim) {
          throw new AppError('Data de início deve ser anterior à data de fim', 400);
        }
      }

      const updateData = {};
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== null) {
          switch (key) {
            case 'designacao':
            case 'tipoAvaliacao':
            case 'anoLectivo':
            case 'observacoes':
            case 'status':
              updateData[key.charAt(0).toUpperCase() + key.slice(1)] = typeof data[key] === 'string' 
                ? data[key].trim() 
                : data[key];
              break;
            case 'trimestre':
              updateData['Trimestre'] = parseInt(data[key]);
              break;
            case 'dataInicio':
              updateData['DataInicio'] = new Date(data[key]);
              break;
            case 'dataFim':
              updateData['DataFim'] = new Date(data[key]);
              break;
          }
        }
      });

      const updated = await prisma.tb_periodos_avaliacao.update({
        where: { Codigo: parseInt(id) },
        data: updateData
      });

      return {
        ...updated,
        mensagem: 'Período de avaliação atualizado com sucesso'
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Erro ao atualizar período de avaliação: ${error.message}`, 500);
    }
  }

  static async deletePeriodoAvaliacao(id) {
    try {
      const periodo = await prisma.tb_periodos_avaliacao.findUnique({
        where: { Codigo: parseInt(id) },
        include: {
          _count: {
            select: { tb_historico_notas: true }
          }
        }
      });

      if (!periodo) {
        throw new AppError('Período de avaliação não encontrado', 404);
      }

      if (periodo._count.tb_historico_notas > 0) {
        throw new AppError(
          'Não é possível deletar período de avaliação com histórico de notas',
          400
        );
      }

      await prisma.tb_periodos_avaliacao.delete({
        where: { Codigo: parseInt(id) }
      });

      return {
        mensagem: 'Período de avaliação removido com sucesso'
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Erro ao remover período de avaliação: ${error.message}`, 500);
    }
  }

  static async getPeriodosAtivos() {
    try {
      return await prisma.tb_periodos_avaliacao.findMany({
        where: { Status: 'Activo' },
        orderBy: [{ AnoLectivo: 'desc' }, { Trimestre: 'asc' }]
      });
    } catch (error) {
      throw new AppError(`Erro ao buscar períodos ativos: ${error.message}`, 500);
    }
  }

  // ===============================
  // RELATÓRIOS E ESTATÍSTICAS
  // ===============================

  static async getRelatorioProfessores() {
    try {
      const [
        totalProfessores,
        professoresAtivos,
        totalDisciplinasAtribuidas,
        totalTurmasAtribuidas,
        totalPeriodos,
        periodosAtivos
      ] = await Promise.all([
        prisma.tb_professores.count(),
        prisma.tb_professores.count({ where: { status: 'Activo' } }),
        prisma.tb_professor_disciplina.count({ where: { Status: 'Activo' } }),
        prisma.tb_professor_turma.count({ where: { Status: 'Activo' } }),
        prisma.tb_periodos_avaliacao.count(),
        prisma.tb_periodos_avaliacao.count({ where: { Status: 'Activo' } })
      ]);

      return {
        resumo: {
          totalProfessores,
          professoresAtivos,
          inativos: totalProfessores - professoresAtivos,
          totalDisciplinasAtribuidas,
          totalTurmasAtribuidas,
          totalPeriodos,
          periodosAtivos
        }
      };
    } catch (error) {
      throw new AppError(`Erro ao gerar relatório: ${error.message}`, 500);
    }
  }

  static async getEstatisticasProfessores() {
    try {
      const professoresComAtribuicoes = await prisma.tb_professores.findMany({
        where: { status: 'Activo' },
        select: {
          Codigo: true,
          nome: true,
          especialidade: true,
          _count: {
            select: {
              tb_professor_disciplina: true,
              tb_professor_turma: true
            }
          }
        },
        orderBy: { nome: 'asc' }
      });

      const distribuicaoPorEspecialidade = await prisma.tb_professores.groupBy({
        by: ['especialidade'],
        where: { status: 'Activo' },
        _count: { Codigo: true }
      });

      return {
        professoresComAtribuicoes,
        distribuicaoPorEspecialidade
      };
    } catch (error) {
      throw new AppError(`Erro ao gerar estatísticas: ${error.message}`, 500);
    }
  }
}
