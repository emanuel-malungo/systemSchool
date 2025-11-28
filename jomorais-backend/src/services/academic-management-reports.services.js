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
    return {
      codigo: student.codigo,
      codigoAluno: student.codigo,
      nomeAluno: student.nome || 'N/A',
      numeroMatricula: 'MAT-' + student.codigo,
      classe: 'N/A',
      curso: 'N/A',
      turma: 'N/A',
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
      // Outros filtros (anoAcademico, classe, curso, turma, disciplina, professor, periodo, trimestre, tipoRelatorio, datas)
      // serão usados futuramente quando os relacionamentos estiverem mapeados
    } = filters

    const where = { AND: [] }

    if (statusAluno && statusAluno !== 'todos') {
      const statusValue = this.mapStatusAlunoToCodigo(statusAluno)
      if (statusValue !== null) {
        where.AND.push({ codigo_Status: statusValue })
      }
    }

    const finalWhere = where.AND.length > 0 ? where : {}
    const offset = (page - 1) * limit

    const [students, totalCount] = await Promise.all([
      prisma.tb_alunos.findMany({
        where: finalWhere,
        skip: offset,
        take: limit,
        orderBy: { nome: 'asc' },
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
    const where = { AND: [] }

    const { statusAluno } = filters

    if (statusAluno && statusAluno !== 'todos') {
      const statusValue = this.mapStatusAlunoToCodigo(statusAluno)
      if (statusValue !== null) {
        where.AND.push({ codigo_Status: statusValue })
      }
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

  static async getClassPerformance(/* filters = {} */) {
    const classes = await prisma.tb_classes.findMany({
      orderBy: { designacao: 'asc' },
      take: 10,
    })

    const results = classes.map((cls) => ({
      classe: cls.designacao,
      curso: 'N/A',
      totalAlunos: 0,
      mediaGeral: 0,
      percentualAprovacao: 0,
      melhorAluno: {
        nome: 'N/A',
        media: 0,
      },
      disciplinaMaiorDificuldade: {
        nome: 'N/A',
        percentualReprovacao: 0,
      },
    }))

    return results
  }

  // ===============================
  // DESEMPENHO POR PROFESSOR (SIMPLIFICADO)
  // ===============================

  static async getTeacherPerformance(/* filters = {} */) {
    // Sem mapeamento claro de tabela de professores, retornamos lista vazia por enquanto
    return []
  }

  // ===============================
  // OPÇÕES DE FILTROS ACADÊMICOS (ESTÁTICAS POR ENQUANTO)
  // ===============================

  static async getFilterOptions() {
    // Estrutura alinhada com AcademicFilterOptions do frontend
    const filterOptions = {
      anosAcademicos: [
        { codigo: 1, designacao: '2024/2025' },
        { codigo: 2, designacao: '2025/2026' },
      ],
      classes: [
        { codigo: 1, designacao: '10ª Classe' },
        { codigo: 2, designacao: '11ª Classe' },
        { codigo: 3, designacao: '12ª Classe' },
      ],
      cursos: [
        { codigo: 1, designacao: 'Informática' },
        { codigo: 2, designacao: 'Contabilidade' },
        { codigo: 3, designacao: 'Gestão' },
      ],
      turmas: [
        {
          codigo: 1,
          designacao: '10IG-A',
          classe: '10ª Classe',
          curso: 'Informática',
        },
      ],
      disciplinas: [
        { codigo: 1, designacao: 'Matemática' },
        { codigo: 2, designacao: 'Português' },
      ],
      professores: [
        { codigo: 1, nome: 'Professor 1' },
        { codigo: 2, nome: 'Professor 2' },
      ],
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
