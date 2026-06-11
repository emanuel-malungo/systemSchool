// services/reports-management.services.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ReportsManagementService {
  // ===============================
  // RELATÓRIOS DE ALUNOS
  // ===============================

  /**
   * Buscar alunos com filtros para relatórios
   * @param {Object} filters - Filtros de pesquisa
   * @param {number} page - Página atual
   * @param {number} limit - Limite por página
   * @returns {Object} Lista de alunos e metadados de paginação
   */
  static async getStudentsForReport(filters = {}, page = 1, limit = 10) {
    try {
      const {
        anoAcademico,
        classe,
        curso,
        estado,
        genero,
        periodo,
        dataMatriculaFrom,
        dataMatriculaTo,
        search
      } = filters;

      // Construir condições WHERE
      const whereConditions = {
        AND: []
      };

      // Filtro por ano académico
      if (anoAcademico) {
        const ano = typeof anoAcademico === 'string' ? parseInt(anoAcademico) : anoAcademico;
        // Precisamos verificar se anoAcademico é um designacao (ex: "2023/2024") ou código
        // Como o frontend manda designacao (ex: "2023/2024"), precisamos buscar o ID primeiro
        if (isNaN(ano)) {
          const anoLetivo = await prisma.tb_ano_lectivo.findFirst({
            where: { designacao: anoAcademico }
          });
          if (anoLetivo) {
            whereConditions.AND.push({ tb_matriculas: { tb_confirmacoes: { some: { codigo_Ano_lectivo: anoLetivo.codigo } } } });
          }
        } else {
          whereConditions.AND.push({ tb_matriculas: { tb_confirmacoes: { some: { codigo_Ano_lectivo: ano } } } });
        }
      }

      // Filtro por classe
      if (classe) {
        // Se a classe for enviada como texto (ex: "10ª Classe"), buscar o id
        let classeId = parseInt(classe);
        if (isNaN(classeId)) {
           const classeDb = await prisma.tb_classes.findFirst({ where: { designacao: classe } });
           if (classeDb) classeId = classeDb.codigo;
        }
        if (!isNaN(classeId)) {
          whereConditions.AND.push({ tb_matriculas: { tb_confirmacoes: { some: { tb_turmas: { codigo_Classe: classeId } } } } });
        }
      }

      // Filtro por curso
      if (curso) {
        // Se curso for enviada como texto, buscar o id
        let cursoId = parseInt(curso);
        if (isNaN(cursoId)) {
           const cursoDb = await prisma.tb_cursos.findFirst({ where: { designacao: curso } });
           if (cursoDb) cursoId = cursoDb.codigo;
        }
        if (!isNaN(cursoId)) {
          whereConditions.AND.push({ tb_matriculas: { codigo_Curso: cursoId } });
        }
      }

      // Filtro por estado do aluno
      if (estado) {
        let statusValue;
        switch (estado) {
          case 'Ativo':
            statusValue = 1;
            break;
          case 'Transferido':
            statusValue = 2;
            break;
          case 'Desistente':
            statusValue = 3;
            break;
          case 'Finalizado':
            statusValue = 4;
            break;
          default:
            statusValue = null;
        }
        
        if (statusValue !== null) {
          whereConditions.AND.push({
            codigo_Status: statusValue
          });
        }
      }

      // Filtro por género
      if (genero) {
        whereConditions.AND.push({
          sexo: genero
        });
      }



      // Filtro de pesquisa por nome
      if (search) {
        whereConditions.AND.push({
          OR: [
            { nome: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { numeroMatricula: { contains: search, mode: 'insensitive' } }
          ]
        });
      }

      // Se não há filtros, remover AND vazio
      const finalWhere = whereConditions.AND.length > 0 ? whereConditions : {};

      // Calcular offset
      const offset = (page - 1) * limit;

      // Buscar alunos com paginação
      const [students, totalCount] = await Promise.all([
        prisma.tb_alunos.findMany({
          where: finalWhere,
          include: {
            tb_matriculas: {
              include: {
                tb_cursos: true,
                tb_confirmacoes: {
                  orderBy: { data_Confirmacao: 'desc' },
                  take: 1,
                  include: {
                    tb_turmas: {
                      include: {
                        tb_classes: true,
                        tb_cursos: true
                      }
                    }
                  }
                }
              }
            },
            tb_encarregados: {
              select: {
                nome: true,
                telefone: true,
                email: true
              }
            }
          },
          skip: offset,
          take: limit,
          orderBy: {
            nome: 'asc'
          }
        }),
        prisma.tb_alunos.count({
          where: finalWhere
        })
      ]);

      // Formatar dados dos alunos
      const formattedStudents = students.map(student => {
        const matricula = student.tb_matriculas;
        
        return {
          id: student.codigo,
          nome: student.nome || 'N/A',
          numeroMatricula: 'MAT-' + student.codigo, // Gerar número de matrícula baseado no código
          email: student.email || 'N/A',
          telefone: student.telefone || 'N/A',
          sexo: student.sexo || 'N/A',
          dataNascimento: student.dataNascimento,
          classe: matricula?.tb_confirmacoes?.[0]?.tb_turmas?.tb_classes?.designacao || 'N/A',
          curso: matricula?.tb_cursos?.designacao || matricula?.tb_confirmacoes?.[0]?.tb_turmas?.tb_cursos?.designacao || 'N/A',
          turma: matricula?.tb_confirmacoes?.[0]?.tb_turmas?.designacao || 'N/A',
          periodo: 'N/A',
          anoAcademico: 'N/A',
          dataMatricula: matricula?.dataMatricula || null,
          estado: this.getStatusLabel(student.codigo_Status || 1),
          encarregado: student.tb_encarregados ? {
            nome: student.tb_encarregados.nome,
            telefone: student.tb_encarregados.telefone,
            email: student.tb_encarregados.email
          } : null
        };
      });

      // Calcular metadados de paginação
      const totalPages = Math.ceil(totalCount / limit);

      return {
        students: formattedStudents,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalCount,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      };
    } catch (error) {
      console.error('Erro ao buscar alunos para relatório:', error);
      throw new Error('Erro interno do servidor ao buscar alunos');
    }
  }

  /**
   * Gerar estatísticas dos alunos para relatórios
   * @param {Object} filters - Filtros aplicados
   * @returns {Object} Estatísticas dos alunos
   */
  static async getStudentStatistics(filters = {}) {
    try {
      const {
        anoAcademico,
        classe,
        curso,
        estado,
        genero,
        periodo
      } = filters;

      const statsWhere = { AND: [] };

      // Filtro por ano académico
      if (anoAcademico) {
        const ano = typeof anoAcademico === 'string' ? parseInt(anoAcademico) : anoAcademico;
        if (isNaN(ano)) {
          const anoLetivo = await prisma.tb_ano_lectivo.findFirst({
            where: { designacao: anoAcademico }
          });
          if (anoLetivo) {
            statsWhere.AND.push({ tb_matriculas: { tb_confirmacoes: { some: { codigo_Ano_lectivo: anoLetivo.codigo } } } });
          }
        } else {
          statsWhere.AND.push({ tb_matriculas: { tb_confirmacoes: { some: { codigo_Ano_lectivo: ano } } } });
        }
      }

      // Filtro por classe
      if (classe) {
        let classeId = parseInt(classe);
        if (isNaN(classeId)) {
           const classeDb = await prisma.tb_classes.findFirst({ where: { designacao: classe } });
           if (classeDb) classeId = classeDb.codigo;
        }
        if (!isNaN(classeId)) {
          statsWhere.AND.push({ tb_matriculas: { tb_confirmacoes: { some: { tb_turmas: { codigo_Classe: classeId } } } } });
        }
      }

      // Filtro por curso
      if (curso) {
        let cursoId = parseInt(curso);
        if (isNaN(cursoId)) {
           const cursoDb = await prisma.tb_cursos.findFirst({ where: { designacao: curso } });
           if (cursoDb) cursoId = cursoDb.codigo;
        }
        if (!isNaN(cursoId)) {
          statsWhere.AND.push({ tb_matriculas: { codigo_Curso: cursoId } });
        }
      }

      const finalWhere = statsWhere.AND.length > 0 ? statsWhere : {};

      // Buscar estatísticas
      const [
        totalAlunos,
        alunosAtivos,
        alunosTransferidos,
        alunosDesistentes,
        alunosMasculinos,
        alunosFemininos
      ] = await Promise.all([
        // Total de alunos
        prisma.tb_alunos.count({ where: finalWhere }),
        
        // Alunos ativos
        prisma.tb_alunos.count({
          where: {
            ...finalWhere,
            codigo_Status: 1
          }
        }),
        
        // Alunos transferidos
        prisma.tb_alunos.count({
          where: {
            ...finalWhere,
            codigo_Status: 2
          }
        }),
        
        // Alunos desistentes
        prisma.tb_alunos.count({
          where: {
            ...finalWhere,
            codigo_Status: 3
          }
        }),
        
        // Alunos masculinos
        prisma.tb_alunos.count({
          where: {
            ...finalWhere,
            sexo: 'M'
          }
        }),
        
        // Alunos femininos
        prisma.tb_alunos.count({
          where: {
            ...finalWhere,
            sexo: 'F'
          }
        })
      ]);

      return {
        totalAlunos,
        alunosAtivos,
        alunosTransferidos,
        alunosDesistentes,
        alunosMasculinos,
        alunosFemininos,
        distribuicaoGenero: {
          masculino: alunosMasculinos,
          feminino: alunosFemininos,
          percentualMasculino: totalAlunos > 0 ? ((alunosMasculinos / totalAlunos) * 100).toFixed(1) : 0,
          percentualFeminino: totalAlunos > 0 ? ((alunosFemininos / totalAlunos) * 100).toFixed(1) : 0
        },
        distribuicaoStatus: {
          ativos: alunosAtivos,
          transferidos: alunosTransferidos,
          desistentes: alunosDesistentes,
          percentualAtivos: totalAlunos > 0 ? ((alunosAtivos / totalAlunos) * 100).toFixed(1) : 0
        }
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas dos alunos:', error);
      throw new Error('Erro interno do servidor ao buscar estatísticas');
    }
  }

  /**
   * Buscar dados de um aluno específico para relatório individual
   * @param {number} studentId - ID do aluno
   * @returns {Object} Dados completos do aluno
   */
  static async getStudentReportData(studentId) {
    try {
      const student = await prisma.tb_alunos.findUnique({
        where: { codigo: parseInt(studentId) },
        include: {
          tb_matriculas: true,
          tb_encarregados: true,
          tb_proveniencias: true
        }
      });

      if (!student) {
        throw new Error('Aluno não encontrado');
      }

      return {
        dadosPessoais: {
          codigo: student.codigo,
          nome: student.nome || 'N/A',
          numeroMatricula: 'MAT-' + student.codigo,
          email: student.email || 'N/A',
          telefone: student.telefone || 'N/A',
          sexo: student.sexo || 'N/A',
          dataNascimento: student.dataNascimento,
          naturalidade: 'N/A', // Campo não existe no schema atual
          nacionalidade: 'N/A', // Campo não existe no schema atual
          numeroBI: student.n_documento_identificacao || 'N/A',
          dataEmissaoBI: student.dataEmissao,
          arquivoBI: student.url_Foto || 'N/A',
          status: this.getStatusLabel(student.codigo_Status || 1),
          dataCadastro: student.dataCadastro
        },
        encarregado: student.tb_encarregados ? {
          nome: student.tb_encarregados.nome,
          telefone: student.tb_encarregados.telefone,
          email: student.tb_encarregados.email,
          profissao: 'N/A', // Será preenchido quando tivermos os relacionamentos
          localTrabalho: 'N/A' // Será preenchido quando tivermos os relacionamentos
        } : null,
        proveniencia: student.tb_proveniencias ? {
          escola: 'N/A', // Será preenchido quando tivermos os relacionamentos
          classe: 'N/A', // Será preenchido quando tivermos os relacionamentos
          ano: 'N/A' // Será preenchido quando tivermos os relacionamentos
        } : null,
        historicoMatriculas: student.tb_matriculas ? [{
          ano: 'N/A', // Será preenchido quando tivermos os relacionamentos
          classe: 'N/A', // Será preenchido quando tivermos os relacionamentos
          curso: 'N/A', // Será preenchido quando tivermos os relacionamentos
          turma: 'N/A', // Será preenchido quando tivermos os relacionamentos
          sala: 'N/A', // Será preenchido quando tivermos os relacionamentos
          periodo: 'N/A', // Será preenchido quando tivermos os relacionamentos
          dataMatricula: student.tb_matriculas.dataMatricula || null,
          observacoes: 'N/A'
        }] : [],
        historicoConfirmacoes: [] // Será implementado quando tivermos os relacionamentos corretos
      };
    } catch (error) {
      console.error('Erro ao buscar dados do aluno para relatório:', error);
      throw new Error('Erro interno do servidor ao buscar dados do aluno');
    }
  }

  /**
   * Converter status numérico para label
   * @param {number} status - Status numérico
   * @returns {string} Label do status
   */
  static getStatusLabel(status) {
    switch (status) {
      case 1:
        return 'Ativo';
      case 2:
        return 'Transferido';
      case 3:
        return 'Desistente';
      case 4:
        return 'Finalizado';
      default:
        return 'Indefinido';
    }
  }
}
