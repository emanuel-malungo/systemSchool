// Interfaces para relatórios acadêmicos

export interface AcademicReportFilters {
  anoAcademico?: string
  classe?: string
  curso?: string
  turma?: string
  disciplina?: string
  professor?: string
  periodo?: string
  trimestre?: '1' | '2' | '3' | 'todos'
  statusAluno?: 'ativo' | 'transferido' | 'desistente' | 'finalizado' | 'todos'
  tipoRelatorio?: 'notas' | 'frequencia' | 'aproveitamento' | 'todos'
  dataInicio?: string
  dataFim?: string
}

export interface StudentAcademicData {
  codigo: number
  codigoAluno: number
  nomeAluno: string
  numeroMatricula: string
  classe: string
  curso: string
  turma: string
  disciplinas: DisciplineGrade[]
  frequencia: AttendanceData
  aproveitamento: PerformanceData
  status: string
  observacoes?: string
}

export interface DisciplineGrade {
  codigoDisciplina: number
  nomeDisciplina: string
  professor: string
  notas: {
    trimestre1?: number
    trimestre2?: number
    trimestre3?: number
    notaFinal?: number
    situacao: 'aprovado' | 'reprovado' | 'recuperacao' | 'pendente'
  }
  frequencia: {
    aulasMinistradas: number
    aulasAssistidas: number
    faltas: number
    percentualFrequencia: number
  }
  cargaHoraria: number
}

export interface AttendanceData {
  totalAulas: number
  aulasAssistidas: number
  faltas: number
  percentualFrequencia: number
  faltasJustificadas: number
  faltasInjustificadas: number
}

export interface PerformanceData {
  mediaGeral: number
  disciplinasAprovadas: number
  disciplinasReprovadas: number
  disciplinasRecuperacao: number
  situacaoGeral: 'aprovado' | 'reprovado' | 'recuperacao' | 'pendente'
  ranking?: number
  totalAlunos?: number
}

export interface AcademicStatistics {
  totalAlunos: number
  alunosAtivos: number
  alunosTransferidos: number
  alunosDesistentes: number
  alunosFinalizados: number
  distribuicaoStatus: {
    ativos: number
    transferidos: number
    desistentes: number
    finalizados: number
    percentualAtivos: number
    percentualTransferidos: number
    percentualDesistentes: number
    percentualFinalizados: number
  }
}

export interface ClassPerformance {
  classe: string
  curso: string
  totalAlunos: number
  mediaGeral: number
  percentualAprovacao: number
  melhorAluno: {
    nome: string
    media: number
  }
  disciplinaMaiorDificuldade: {
    nome: string
    percentualReprovacao: number
  }
}

export interface TeacherPerformance {
  codigoProfessor: number
  nomeProfessor: string
  disciplinas: string[]
  turmas: string[]
  totalAlunos: number
  mediaGeralAlunos: number
  percentualAprovacao: number
  frequenciaMediaAlunos: number
}

export interface UseAcademicReportsParams {
  page?: number
  limit?: number
  enabled?: boolean
  filters?: AcademicReportFilters
}

export interface AcademicReportsResponse {
  success: boolean
  message: string
  data: {
    students: StudentAcademicData[]
    pagination: {
      currentPage: number
      totalPages: number
      totalItems: number
      itemsPerPage: number
      hasNextPage: boolean
      hasPreviousPage: boolean
    }
  }
}

export interface AcademicStatisticsResponse {
  success: boolean
  message: string
  data: AcademicStatistics
}

export interface GenerateAcademicReportRequest {
  format: 'word' | 'pdf' | 'excel'
  filters: AcademicReportFilters
  includeStatistics: boolean
  includeGrades: boolean
  includeAttendance: boolean
  includeCharts: boolean
  periodo?: {
    inicio: string
    fim: string
  }
}

export interface AcademicFilterOptions {
  anosAcademicos: Array<{
    codigo: number
    designacao: string
  }>
  classes: Array<{
    codigo: number
    designacao: string
  }>
  cursos: Array<{
    codigo: number
    designacao: string
  }>
  turmas: Array<{
    codigo: number
    designacao: string
    classe: string
    curso: string
  }>
  disciplinas: Array<{
    codigo: number
    designacao: string
  }>
  professores: Array<{
    codigo: number
    nome: string
  }>
  periodos: Array<{
    value: string
    label: string
  }>
  trimestres: Array<{
    value: string
    label: string
  }>
  statusAluno: Array<{
    value: string
    label: string
  }>
  tiposRelatorio: Array<{
    value: string
    label: string
  }>
}

// Tipos para API
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface ApiError {
  response?: {
    data?: {
      message?: string
    }
  }
  message?: string
}

export interface PaginationMeta {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export type AcademicStudentsApiResponse = ApiResponse<{
  students: StudentAcademicData[]
  pagination: PaginationMeta
}>

export type AcademicStatisticsApiResponse = ApiResponse<AcademicStatistics>

export type AcademicFilterOptionsApiResponse = ApiResponse<AcademicFilterOptions>

export type ClassPerformanceApiResponse = ApiResponse<ClassPerformance[]>

export type TeacherPerformanceApiResponse = ApiResponse<TeacherPerformance[]>
