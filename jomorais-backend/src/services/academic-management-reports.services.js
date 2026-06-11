// services/academic-management-reports.services.js
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class AcademicReportsService {
  // ===============================
  // HELPERS
  // ===============================

  static getStatusLabel(statusCode) {
    switch (statusCode) {
      case 1:
        return 'ativo'
      case 2:
        return 'transferido'
      case 3:
        return 'desistente'
      case 4:
        return 'finalizado'
      default:
        return 'indefinido'
    }
  }

  static buildStudentAcademicData(student) {
    // Tenta encontrar a turma/classe/curso a partir das confirmações ou matrículas
    let curso = 'N/A'
    let classe = 'N/A'
    let turma = 'N/A'

    if (student.tb_matriculas) {
      if (student.tb_matriculas.tb_cursos) {
        curso = student.tb_matriculas.tb_cursos.designacao || 'N/A'
      }
      
      const confirmacoes = student.tb_matriculas.tb_confirmacoes
      if (confirmacoes && confirmacoes.length > 0) {
        // Pega a última confirmação
        const ultimaConfirmacao = confirmacoes[0]
        if (ultimaConfirmacao.tb_turmas) {
          turma = ultimaConfirmacao.tb_turmas.designacao || 'N/A'
          
          if (ultimaConfirmacao.tb_turmas.tb_classes) {
            classe = ultimaConfirmacao.tb_turmas.tb_classes.designacao || 'N/A'
          }
          
          // Fallback para curso a partir da turma, se não encontrou antes
          if (curso === 'N/A' && ultimaConfirmacao.tb_turmas.tb_cursos) {
            curso = ultimaConfirmacao.tb_turmas.tb_cursos.designacao || 'N/A'
          }
        }
      }
    }

    return {
      codigo: student.codigo,
      codigoAluno: student.codigo,
      nomeAluno: student.nome || 'N/A',
      numeroMatricula: student.tb_matriculas ? `MAT-${student.tb_matriculas.codigo}` : `ALU-${student.codigo}`,
      classe,
      curso,
      turma,
      disciplinas: [],
      frequencia: {
        totalAulas: 0,
        aulasAssistidas: 0,
        faltas: 0,
        percentualFrequencia: 0,
        faltasJustificadas: 0,
        faltasInjustificadas: 0,
      },
      aproveitamento: {
        mediaGeral: 0,
        disciplinasAprovadas: 0,
        disciplinasReprovadas: 0,
        disciplinasRecuperacao: 0,
        situacaoGeral: 'pendente',
        ranking: undefined,
        totalAlunos: undefined,
      },
      status: AcademicReportsService.getStatusLabel(student.codigo_Status || 1),
      observacoes: null,
    }
  }

  static mapStatusAlunoToCodigo(statusAluno) {
    switch (statusAluno) {
      case 'ativo':
        return 1
      case 'transferido':
        return 2
      case 'desistente':
        return 3
      case 'finalizado':
        return 4
      default:
        return null
    }
  }

  // ===============================
  // LISTA DE ALUNOS ACADÊMICOS
  // ===============================

  static async getAcademicStudents(filters = {}, page = 1, limit = 10) {
    const {
      statusAluno,
      anoAcademico,
      classe,
      curso,
      turma
    } = filters

    const where = { AND: [] }

    if (statusAluno && statusAluno !== 'todos') {
      const statusValue = this.mapStatusAlunoToCodigo(statusAluno)
      if (statusValue !== null) {
        where.AND.push({ codigo_Status: statusValue })
      }
    }

    if (curso) {
      where.AND.push({ tb_matriculas: { codigo_Curso: parseInt(curso) } })
    }

    if (turma) {
      where.AND.push({ tb_matriculas: { tb_confirmacoes: { some: { codigo_Turma: parseInt(turma) } } } })
    } else if (classe) {
      where.AND.push({ tb_matriculas: { tb_confirmacoes: { some: { tb_turmas: { codigo_Classe: parseInt(classe) } } } } })
    }

    if (anoAcademico) {
      where.AND.push({ tb_matriculas: { tb_confirmacoes: { some: { codigo_Ano_lectivo: parseInt(anoAcademico) } } } })
    }

    const finalWhere = where.AND.length > 0 ? where : {}
    const offset = (page - 1) * limit

    const [students, totalCount] = await Promise.all([
      prisma.tb_alunos.findMany({
        where: finalWhere,
        skip: offset,
        take: limit,
        orderBy: { nome: 'asc' },
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
                      tb_cursos: true,
                    }
                  }
                }
              }
            }
          }
        }
      }),
      prisma.tb_alunos.count({ where: finalWhere }),
    ])

    const formattedStudents = students.map((student) =>
      AcademicReportsService.buildStudentAcademicData(student),
    )

    const totalPages = Math.max(1, Math.ceil(totalCount / limit) || 1)

    return {
      students: formattedStudents,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    }
  }

  // ===============================
  // ESTATÍSTICAS ACADÊMICAS (SIMPLIFICADAS)
  // ===============================

  static async getAcademicStatistics(filters = {}) {
    const {
      statusAluno,
      anoAcademico,
      classe,
      curso,
      turma
    } = filters

    const where = { AND: [] }

    if (statusAluno && statusAluno !== 'todos') {
      const statusValue = this.mapStatusAlunoToCodigo(statusAluno)
      if (statusValue !== null) {
        where.AND.push({ codigo_Status: statusValue })
      }
    }

    if (curso) {
      where.AND.push({ tb_matriculas: { codigo_Curso: parseInt(curso) } })
    }

    if (turma) {
      where.AND.push({ tb_matriculas: { tb_confirmacoes: { some: { codigo_Turma: parseInt(turma) } } } })
    } else if (classe) {
      where.AND.push({ tb_matriculas: { tb_confirmacoes: { some: { tb_turmas: { codigo_Classe: parseInt(classe) } } } } })
    }

    if (anoAcademico) {
      where.AND.push({ tb_matriculas: { tb_confirmacoes: { some: { codigo_Ano_lectivo: parseInt(anoAcademico) } } } })
    }

    const finalWhere = where.AND.length > 0 ? where : {}

    const [
      totalAlunos,
      alunosAtivos,
      alunosTransferidos,
      alunosDesistentes,
      alunosFinalizados,
    ] = await Promise.all([
      prisma.tb_alunos.count({ where: finalWhere }),
      prisma.tb_alunos.count({
        where: {
          ...finalWhere,
          codigo_Status: 1,
        },
      }),
      prisma.tb_alunos.count({
        where: {
          ...finalWhere,
          codigo_Status: 2,
        },
      }),
      prisma.tb_alunos.count({
        where: {
          ...finalWhere,
          codigo_Status: 3,
        },
      }),
      prisma.tb_alunos.count({
        where: {
          ...finalWhere,
          codigo_Status: 4,
        },
      }),
    ])

    const safePercent = (value, total) => {
      if (!total || total === 0) return 0
      return (value / total) * 100
    }

    return {
      totalAlunos,
      alunosAtivos,
      alunosTransferidos,
      alunosDesistentes,
      alunosFinalizados,
      distribuicaoStatus: {
        ativos: alunosAtivos,
        transferidos: alunosTransferidos,
        desistentes: alunosDesistentes,
        finalizados: alunosFinalizados,
        percentualAtivos: safePercent(alunosAtivos, totalAlunos),
        percentualTransferidos: safePercent(alunosTransferidos, totalAlunos),
        percentualDesistentes: safePercent(alunosDesistentes, totalAlunos),
        percentualFinalizados: safePercent(alunosFinalizados, totalAlunos),
      },
    }
  }

  // ===============================
  // DESEMPENHO POR TURMA/CLASSE (SIMPLIFICADO)
  // ===============================

  static async getClassPerformance(filters = {}) {
    const classes = await prisma.tb_classes.findMany({
      orderBy: { designacao: 'asc' },
    })

    const results = await Promise.all(classes.map(async (cls) => {
      // Find how many students are in this class
      const totalAlunos = await prisma.tb_alunos.count({
        where: {
          tb_matriculas: {
            tb_confirmacoes: {
              some: {
                tb_turmas: {
                  codigo_Classe: cls.codigo
                }
              }
            }
          }
        }
      })

      return {
        classe: cls.designacao,
        curso: 'N/A', // O curso pode variar por turma dentro da classe
        totalAlunos,
        mediaGeral: 0, // A ser implementado com tb_notas
        percentualAprovacao: 0,
        melhorAluno: {
          nome: 'N/A',
          media: 0,
        },
        disciplinaMaiorDificuldade: {
          nome: 'N/A',
          percentualReprovacao: 0,
        },
      }
    }))

    // Retorna apenas classes que tenham alunos (ou as 10 maiores)
    return results.filter(r => r.totalAlunos > 0).slice(0, 10)
  }

  // ===============================
  // DESEMPENHO POR PROFESSOR (SIMPLIFICADO)
  // ===============================

  static async getTeacherPerformance(filters = {}) {
    const docentes = await prisma.tb_docente.findMany({ take: 10 })
    return docentes.map(d => ({
      professor: d.nome,
      disciplina: 'N/A',
      turmasAfetas: 0,
      totalAlunos: 0,
      mediaDesempenho: 0,
      percentualAprovacao: 0
    }))
  }

  // ===============================
  // OPÇÕES DE FILTROS ACADÊMICOS (ESTÁTICAS POR ENQUANTO)
  // ===============================

  static async getFilterOptions() {
    const [anosDb, classesDb, cursosDb, turmasDb, disciplinasDb, professoresDb] = await Promise.all([
      prisma.tb_ano_lectivo.findMany({ select: { codigo: true, designacao: true }, orderBy: { designacao: 'desc' } }),
      prisma.tb_classes.findMany({ select: { codigo: true, designacao: true }, orderBy: { designacao: 'asc' } }),
      prisma.tb_cursos.findMany({ select: { codigo: true, designacao: true }, orderBy: { designacao: 'asc' } }),
      prisma.tb_turmas.findMany({ select: { codigo: true, designacao: true, tb_classes: { select: { designacao: true } }, tb_cursos: { select: { designacao: true } } }, orderBy: { designacao: 'asc' } }),
      prisma.tb_disciplinas.findMany({ select: { codigo: true, designacao: true }, orderBy: { designacao: 'asc' } }),
      prisma.tb_docente.findMany({ select: { codigo: true, nome: true }, orderBy: { nome: 'asc' } })
    ]);

    // Estrutura alinhada com AcademicFilterOptions do frontend
    const filterOptions = {
      anosAcademicos: anosDb,
      classes: classesDb,
      cursos: cursosDb,
      turmas: turmasDb.map(t => ({
        codigo: t.codigo,
        designacao: t.designacao,
        classe: t.tb_classes ? t.tb_classes.designacao : 'N/A',
        curso: t.tb_cursos ? t.tb_cursos.designacao : 'N/A'
      })),
      disciplinas: disciplinasDb,
      professores: professoresDb,
      periodos: [
        { value: 'Manhã', label: 'Manhã' },
        { value: 'Tarde', label: 'Tarde' },
        { value: 'Noite', label: 'Noite' },
      ],
      trimestres: [
        { value: '1', label: '1º Trimestre' },
        { value: '2', label: '2º Trimestre' },
        { value: '3', label: '3º Trimestre' },
      ],
      statusAluno: [
        { value: 'ativo', label: 'Ativo' },
        { value: 'transferido', label: 'Transferido' },
        { value: 'desistente', label: 'Desistente' },
        { value: 'finalizado', label: 'Finalizado' },
      ],
      tiposRelatorio: [
        { value: 'notas', label: 'Notas' },
        { value: 'frequencia', label: 'Frequência' },
        { value: 'aproveitamento', label: 'Aproveitamento' },
      ],
    }

    return filterOptions
  }
}

export default AcademicReportsService
