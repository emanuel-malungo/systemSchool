import { getPagination, getPagingData } from "../utils/pagination.utils.js";
import { AppError } from "../utils/validation.utils.js";
import { convertBigIntToString } from "../utils/bigint.utils.js";
import prisma from "../config/database.js";

export class UsersServices {
  static async getAllLegacyUsers(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;

      const { skip, take } = getPagination(page, limit);

      // Primeiro conta o total de usuários
      const totalItems = await prisma.tb_utilizadores.count();

      // Depois busca os usuários com paginação
      const users = await prisma.tb_utilizadores.findMany({
        skip,
        take,
        include: {
          tb_tipos_utilizador: true, // pega também o tipo de utilizador
        },
        orderBy: { codigo: "desc" }, // ordena por mais recente
      });

      // Converter BigInt para string antes da serialização JSON
      const convertedUsers = convertBigIntToString(users);

      res.json({
        success: true,
        message: "Lista de usuários legados obtida com sucesso",
        meta: getPagingData(totalItems, page, take),
        data: convertedUsers,
      });
    } catch (error) {
      console.error("Erro ao obter usuários legados:", error);
      throw new AppError("Erro ao obter usuários legados", 500);
    }
  }

  static async getAllUsers(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;

      const { skip, take } = getPagination(page, limit);

      const totalItems = await prisma.users.count();

      const users = await prisma.users.findMany({
        skip,
        take,
        orderBy: { created_at: "desc" },
      });

      // Converter BigInt para string antes da serialização JSON
      const convertedUsers = convertBigIntToString(users);

      res.json({
        success: true,
        message: "Lista de usuários obtida com sucesso",
        meta: getPagingData(totalItems, page, take),
        data: convertedUsers,
      });
    } catch (error) {
      console.error("Erro ao obter usuários:", error);
      throw new AppError("Erro ao obter usuários", 500);
    }
  }

  static async getUserById(userId) {
    const user = await prisma.users.findUnique({
      where: { id: BigInt(userId) },
    });

    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    return convertBigIntToString(user);
  }

  static async getUserLegacyById(userId) {
    const user = await prisma.tb_utilizadores.findUnique({
      where: { codigo: parseInt(userId) },
      include: { tb_tipos_utilizador: true },
    });

    if (!user) {
      throw new AppError("Utilizador não encontrado", 404);
    }

    return convertBigIntToString(user);
  }

  static async createLegacyUser(userData) {
    try {
      // Verificar se o nome de usuário já existe
      const existingUser = await prisma.tb_utilizadores.findFirst({
        where: { user: userData.user }
      });

      if (existingUser) {
        throw new AppError("Nome de usuário já existe", 409);
      }

      // Verificar se o tipo de usuário existe
      const userType = await prisma.tb_tipos_utilizador.findUnique({
        where: { codigo: userData.codigo_Tipo_Utilizador }
      });

      if (!userType) {
        throw new AppError("Tipo de usuário não encontrado", 400);
      }

      // Obter o próximo código (ID) manual para tb_utilizadores
      const maxUtilizador = await prisma.tb_utilizadores.findFirst({
        orderBy: { codigo: 'desc' },
        select: { codigo: true }
      });
      const proximoCodigo = maxUtilizador ? maxUtilizador.codigo + 1 : 1;

      // Criar o usuário
      const user = await prisma.tb_utilizadores.create({
        data: {
          codigo: proximoCodigo,
          nome: userData.nome,
          user: userData.user,
          passe: userData.passe, // Em produção, deve ser hasheada
          codigo_Tipo_Utilizador: userData.codigo_Tipo_Utilizador,
          estadoActual: userData.estadoActual || 'ATIVO',
          dataCadastro: new Date(),
          loginStatus: 'OFF'
        },
        include: {
          tb_tipos_utilizador: true
        }
      });

      return convertBigIntToString(user);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error("Erro ao criar usuário:", error);
      throw new AppError("Erro ao criar usuário", 500);
    }
  }

  static async updateLegacyUser(userId, userData) {
    try {
      // Verificar se o usuário existe
      const existingUser = await prisma.tb_utilizadores.findUnique({
        where: { codigo: parseInt(userId) }
      });

      if (!existingUser) {
        throw new AppError("Utilizador não encontrado", 404);
      }

      // Verificar se o nome de usuário já existe (exceto para o próprio usuário)
      if (userData.user && userData.user !== existingUser.user) {
        const userWithSameUsername = await prisma.tb_utilizadores.findFirst({
          where: { 
            user: userData.user,
            codigo: { not: parseInt(userId) }
          }
        });

        if (userWithSameUsername) {
          throw new AppError("Nome de usuário já existe", 409);
        }
      }

      // Verificar se o tipo de usuário existe (se fornecido)
      if (userData.codigo_Tipo_Utilizador) {
        const userType = await prisma.tb_tipos_utilizador.findUnique({
          where: { codigo: userData.codigo_Tipo_Utilizador }
        });

        if (!userType) {
          throw new AppError("Tipo de usuário não encontrado", 400);
        }
      }

      // Preparar dados para atualização
      const updateData = {};
      if (userData.nome) updateData.nome = userData.nome;
      if (userData.user) updateData.user = userData.user;
      if (userData.passe) updateData.passe = userData.passe; // Em produção, deve ser hasheada
      if (userData.codigo_Tipo_Utilizador) updateData.codigo_Tipo_Utilizador = userData.codigo_Tipo_Utilizador;
      if (userData.estadoActual) updateData.estadoActual = userData.estadoActual;

      // Atualizar o usuário
      const user = await prisma.tb_utilizadores.update({
        where: { codigo: parseInt(userId) },
        data: updateData,
        include: {
          tb_tipos_utilizador: true
        }
      });

      return convertBigIntToString(user);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error("Erro ao atualizar usuário:", error);
      throw new AppError("Erro ao atualizar usuário", 500);
    }
  }

  static async deleteLegacyUser(userId) {
    try {
      console.log(`🗑️ Iniciando exclusão em cascata do usuário ID: ${userId}`);
      
      // Verificar se o usuário existe
      const existingUser = await prisma.tb_utilizadores.findUnique({
        where: { codigo: parseInt(userId) }
      });

      if (!existingUser) {
        throw new AppError("Utilizador não encontrado", 404);
      }

      console.log(`✅ Usuário encontrado: ${existingUser.nome}`);

      // Executar exclusão em cascata usando transação
      await prisma.$transaction(async (tx) => {
        const userCode = parseInt(userId);
        
        console.log(`🔄 Iniciando transação de exclusão em cascata...`);

        // 1. Excluir permissões de usuário
        try {
          const permissoes = await tx.tb_item_permissao_utilizador.deleteMany({
            where: { codigo_Utilizador: userCode }
          });
          console.log(`✅ Excluídas ${permissoes.count} permissões de usuário`);
        } catch (error) {
          console.log(`⚠️ Erro ao excluir permissões: ${error.message}`);
        }

        // 2. Excluir permissões de turma
        try {
          const permissoesTurma = await tx.tb_permissao_turma_utilizador.deleteMany({
            where: { codigoUtilizador: userCode }
          });
          console.log(`✅ Excluídas ${permissoesTurma.count} permissões de turma`);
        } catch (error) {
          console.log(`⚠️ Erro ao excluir permissões de turma: ${error.message}`);
        }

        // 3. Excluir acessos ao sistema
        try {
          const acessos = await tx.tb_acessos_sistema.deleteMany({
            where: { CodigoUtilizador: userCode }
          });
          console.log(`✅ Excluídos ${acessos.count} registros de acesso`);
        } catch (error) {
          console.log(`⚠️ Erro ao excluir acessos: ${error.message}`);
        }

        // 4. Excluir anulações
        try {
          const anulacoes = await tx.tb_anulacoes.deleteMany({
            where: { Codigo_Utilizador: userCode }
          });
          console.log(`✅ Excluídas ${anulacoes.count} anulações`);
        } catch (error) {
          console.log(`⚠️ Erro ao excluir anulações: ${error.message}`);
        }

        // 5. Excluir grade curricular
        try {
          const grades = await tx.tb_grade_curricular.deleteMany({
            where: { codigo_user: userCode }
          });
          console.log(`✅ Excluídas ${grades.count} grades curriculares`);
        } catch (error) {
          console.log(`⚠️ Erro ao excluir grades curriculares: ${error.message}`);
        }

        // 6. Excluir propinas de classe
        try {
          const propinas = await tx.tb_propina_classe.deleteMany({
            where: { codigoUtilizador: userCode }
          });
          console.log(`✅ Excluídas ${propinas.count} propinas de classe`);
        } catch (error) {
          console.log(`⚠️ Erro ao excluir propinas de classe: ${error.message}`);
        }

        // 7. Excluir pagamentos
        try {
          const pagamentos = await tx.tb_pagamentos.deleteMany({
            where: { codigo_Utilizador: userCode }
          });
          console.log(`✅ Excluídos ${pagamentos.count} pagamentos`);
        } catch (error) {
          console.log(`⚠️ Erro ao excluir pagamentos: ${error.message}`);
        }

        // 8. Excluir pagamentos
        try {
          const pagamentos = await tx.tb_pagamentos.deleteMany({
            where: { codigo_Utilizador: userCode }
          });
          console.log(`✅ Excluídos ${pagamentos.count} pagamentos`);
        } catch (error) {
          console.log(`⚠️ Erro ao excluir pagamentos: ${error.message}`);
        }

        // 8.1. Excluir pré-confirmações (depende de matrículas)
        try {
          const preConfirmacoes = await tx.tb_pre_confirmacao.deleteMany({
            where: { CodigoUtilizador: userCode }
          });
          console.log(`✅ Excluídas ${preConfirmacoes.count} pré-confirmações`);
        } catch (error) {
          console.log(`⚠️ Erro ao excluir pré-confirmações: ${error.message}`);
        }

        // 8.2. Excluir registros que dependem de matrículas e alunos (usando subquery)
        try {
          // Primeiro, obter os códigos das matrículas e alunos do usuário
          const matriculasDoUsuario = await tx.tb_matriculas.findMany({
            where: { codigo_Utilizador: userCode },
            select: { codigo: true }
          });
          
          const alunosDoUsuario = await tx.tb_alunos.findMany({
            where: { codigo_Utilizador: userCode },
            select: { codigo: true }
          });
          
          const codigosMatriculas = matriculasDoUsuario.map(m => m.codigo);
          const codigosAlunos = alunosDoUsuario.map(aluno => aluno.codigo);
          
          // Excluir registros que dependem de matrículas
          if (codigosMatriculas.length > 0) {
            // Excluir declarações de notas dependentes de matrículas (não tratado antes)
            const declNot = await tx.tb_declaracao_notas.deleteMany({
              where: { Codigo_Matricula: { in: codigosMatriculas } }
            });
            console.log(`✅ Excluídas ${declNot.count} declarações de notas por matrícula`);

            // Excluir declarações sem nota dependentes de matrículas (não tratado antes)
            const declSemNot = await tx.tb_declaracao_sem_nota.deleteMany({
              where: { Codigo_Matricula: { in: codigosMatriculas } }
            });
            console.log(`✅ Excluídas ${declSemNot.count} declarações sem nota por matrícula`);

            // Excluir faltas dependentes de matrículas (não tratado antes)
            const faltasMat = await tx.tb_faltas.deleteMany({
              where: { Codigo_Matricula: { in: codigosMatriculas } }
            });
            console.log(`✅ Excluídas ${faltasMat.count} faltas por matrícula`);

            // Excluir mérito dependente de matrículas (não tratado antes)
            const meritoMat = await tx.tb_merito.deleteMany({
              where: { Codigo_Matricula: { in: codigosMatriculas } }
            });
            console.log(`✅ Excluídos ${meritoMat.count} registros de mérito por matrícula`);

            // Excluir processos disciplinares dependentes de matrículas (não tratado antes)
            const procDisc = await tx.tb_processos_disciplinar.deleteMany({
              where: { Codigo_Matricula: { in: codigosMatriculas } }
            });
            console.log(`✅ Excluídos ${procDisc.count} processos disciplinares por matrícula`);
          }
          
          // Excluir registros que dependem de alunos
          if (codigosAlunos.length > 0) {
            // Excluir notas de credito
            const notaCredito = await tx.tb_nota_credito.deleteMany({
              where: { codigo_aluno: { in: codigosAlunos } }
            });
            console.log(`✅ Excluídas ${notaCredito.count} notas de crédito`);

            // Excluir serviços de aluno
            const servicoAluno = await tx.tb_servico_aluno.deleteMany({
              where: { codigo_Aluno: { in: codigosAlunos } }
            });
            console.log(`✅ Excluídos ${servicoAluno.count} serviços de aluno`);

            // Excluir comportamento
            const comportamento = await tx.tb_comportamento.deleteMany({
              where: { Codigo_Aluno: { in: codigosAlunos } }
            });
            console.log(`✅ Excluídos ${comportamento.count} registros de comportamento`);

            // Excluir conta aluno
            const contaAluno = await tx.tb_conta_aluno.deleteMany({
              where: { Codigo_Aluno: { in: codigosAlunos } }
            });
            console.log(`✅ Excluídas ${contaAluno.count} contas de aluno`);

            // Excluir depósitos de valor
            const depositos = await tx.tb_deposito_valor.deleteMany({
              where: { Codigo_Aluno: { in: codigosAlunos } }
            });
            console.log(`✅ Excluídos ${depositos.count} depósitos de valor`);
          }
        } catch (error) {
          console.log(`⚠️ Erro ao excluir registros dependentes de matrículas/alunos: ${error.message}`);
        }

        // 9. Excluir confirmações
        try {
          const confirmacoes = await tx.tb_confirmacoes.deleteMany({
            where: { codigo_Utilizador: userCode }
          });
          console.log(`✅ Excluídas ${confirmacoes.count} confirmações`);
        } catch (error) {
          console.log(`⚠️ Erro ao excluir confirmações: ${error.message}`);
        }

        // 10. Excluir matrículas
        try {
          const matriculas = await tx.tb_matriculas.deleteMany({
            where: { codigo_Utilizador: userCode }
          });
          console.log(`✅ Excluídas ${matriculas.count} matrículas`);
        } catch (error) {
          console.log(`⚠️ Erro ao excluir matrículas: ${error.message}`);
        }

        // 11. Excluir alunos
        try {
          const alunos = await tx.tb_alunos.deleteMany({
            where: { codigo_Utilizador: userCode }
          });
          console.log(`✅ Excluídos ${alunos.count} alunos`);
        } catch (error) {
          console.log(`⚠️ Erro ao excluir alunos: ${error.message}`);
        }

        // 12. Excluir encarregados
        try {
          const encarregados = await tx.tb_encarregados.deleteMany({
            where: { codigo_Utilizador: userCode }
          });
          console.log(`✅ Excluídos ${encarregados.count} encarregados`);
        } catch (error) {
          console.log(`⚠️ Erro ao excluir encarregados: ${error.message}`);
        }

        // 13. Excluir docentes
        try {
          const docentes = await tx.tb_docente.deleteMany({
            where: { codigo_Utilizador: userCode }
          });
          console.log(`✅ Excluídos ${docentes.count} docentes`);
        } catch (error) {
          console.log(`⚠️ Erro ao excluir docentes: ${error.message}`);
        }

        // 14. Excluir outros registros usando Prisma quando possível
        const otherTablesToDelete = [
          { table: 'tb_logs', field: 'CodigoUtilizador' },
          { table: 'tb_notas', field: 'CodigoUtilizador' },
          { table: 'tb_notas_1_4', field: 'CodigoUtilizador' },
          { table: 'tb_notas_5_6', field: 'CodigoUtilizador' },
          { table: 'tb_notas_7_9', field: 'CodigoUtilizador' },
          { table: 'tb_notas_alunos', field: 'CodigoUtilizador' },
          { table: 'tb_notas_contgest_10_12', field: 'CodigoUtilizador' },
          { table: 'tb_notas_enfermagem_10_12', field: 'CodigoUtilizador' },
          { table: 'tb_notas_fis_bio_10_12', field: 'CodigoUtilizador' },
          { table: 'tb_notas_jur_econ_10_12', field: 'CodigoUtilizador' },
          { table: 'tb_ocorrencias_alunos', field: 'CodigoUtilizador' },
          { table: 'tb_pauta', field: 'codigo_Utilizador' },
          { table: 'tb_pedidos_declaracao', field: 'CodigoUtilizador' },
          { table: 'tb_processos_disciplinar', field: 'Codigo_Utilizador' },
          { table: 'tb_propinas', field: 'Codigo_Utilizador' },
          { table: 'tb_recibo', field: 'codigo_utilizador' },
          { table: 'tb_resultados_finais', field: 'Codigo_Utilizador' },
          { table: 'tb_tipos_propinas', field: 'Codigo_Utilizador' },
          { table: 'tb_declaracao_sem_nota', field: 'Codigo_Utilizadores' },
          { table: 'tb_entrada_valores', field: 'CodigoUtilizador' },
          { table: 'tb_entrega_declarcoes', field: 'Codigo_Utilizador' }
        ];

        for (const { table, field } of otherTablesToDelete) {
          try {
            if (tx[table] && typeof tx[table].deleteMany === 'function') {
              const result = await tx[table].deleteMany({
                where: { [field]: userCode }
              });
              if (result.count > 0) {
                console.log(`✅ Excluídos ${result.count} registros da tabela ${table}`);
              }
            } else {
              // Fallback para raw SQL se a tabela não estiver no Prisma
              const result = await tx.$executeRawUnsafe(
                `DELETE FROM ${table} WHERE ${field} = ?`,
                userCode
              );
              if (result > 0) {
                console.log(`✅ Excluídos ${result} registros da tabela ${table} (raw SQL)`);
              }
            }
          } catch (tableError) {
            console.log(`⚠️ Tabela ${table} pode não existir ou não ter a coluna ${field}: ${tableError.message}`);
          }
        }

        // 15. Finalmente, excluir o usuário
        await tx.tb_utilizadores.delete({
          where: { codigo: userCode }
        });

        console.log(`✅ Usuário ${existingUser.nome} e todos os registros relacionados foram excluídos com sucesso`);
      });

      return { message: "Usuário e registros relacionados excluídos com sucesso" };
    } catch (error) {
      if (error instanceof AppError) {
        console.log(`🚨 AppError: ${error.message}`);
        throw error;
      }
      
      console.error("❌ Erro inesperado ao excluir usuário em cascata:", error);
      throw new AppError("Erro interno ao excluir usuário", 500);
    }
  }

  static async deactivateLegacyUser(userId) {
    try {
      console.log(`🔒 Desativando usuário ID: ${userId}`);
      
      // Verificar se o usuário existe
      const existingUser = await prisma.tb_utilizadores.findUnique({
        where: { codigo: parseInt(userId) }
      });

      if (!existingUser) {
        throw new AppError("Utilizador não encontrado", 404);
      }

      // Desativar o usuário
      const user = await prisma.tb_utilizadores.update({
        where: { codigo: parseInt(userId) },
        data: { 
          estadoActual: 'INATIVO',
          loginStatus: 'OFF'
        },
        include: {
          tb_tipos_utilizador: true
        }
      });

      console.log(`✅ Usuário ${existingUser.nome} desativado com sucesso`);
      return convertBigIntToString(user);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error("❌ Erro ao desativar usuário:", error);
      throw new AppError("Erro ao desativar usuário", 500);
    }
  }
}
