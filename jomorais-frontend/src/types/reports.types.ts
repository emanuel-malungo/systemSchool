// types/reports.types.ts

// ===============================
// INTERFACES BASE
// ===============================

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data: T
}

export interface PaginationMeta {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

// ===============================
// FILTROS DE RELATÓRIOS
// ===============================

export interface ReportFilters {
  anoAcademico?: string
  classe?: string
  curso?: string
  estado?: 'Ativo' | 'Transferido' | 'Desistente' | 'Finalizado'
  genero?: 'M' | 'F'
  periodo?: 'Manhã' | 'Tarde' | 'Noite'
  dataMatriculaFrom?: string
  dataMatriculaTo?: string
  search?: string
}

export interface ReportPaginationParams extends ReportFilters {
  page?: number
  limit?: number
}

// ===============================
// DADOS DO ALUNO PARA RELATÓRIOS
// ===============================

export interface StudentReportData {
  id: number
  nome: string
  numeroMatricula: string
  email?: string
  telefone?: string
  sexo: 'M' | 'F'
  dataNascimento?: string
  classe: string
  curso: string
  turma: string
  periodo: string
  anoAcademico: string | number
  dataMatricula?: string
  estado: string
  encarregado?: {
    nome: string
    telefone?: string
    email?: string
  } | null
}

export interface StudentsReportResponse {
  students: StudentReportData[]
  pagination: PaginationMeta
}

// ===============================
// ESTATÍSTICAS DE ALUNOS
// ===============================

export interface StudentStatistics {
  totalAlunos: number
  alunosAtivos: number
  alunosTransferidos: number
  alunosDesistentes: number
  alunosMasculinos: number
  alunosFemininos: number
  distribuicaoGenero: {
    masculino: number
    feminino: number
    percentualMasculino: string
    percentualFeminino: string
  }
  distribuicaoStatus: {
    ativos: number
    transferidos: number
    desistentes: number
    percentualAtivos: string
  }
}

// ===============================
// DADOS COMPLETOS DO ALUNO
// ===============================

export interface StudentCompleteData {
  dadosPessoais: {
    codigo: number
    nome: string
    numeroMatricula: string
    email?: string
    telefone?: string
    sexo: 'M' | 'F'
    dataNascimento?: string
    naturalidade?: string
    nacionalidade?: string
    numeroBI?: string
    dataEmissaoBI?: string
    arquivoBI?: string
    status: string
    dataCadastro?: string
  }
  encarregado?: {
    nome: string
    telefone?: string
    email?: string
    profissao?: string
    localTrabalho?: string
  } | null
  proveniencia?: {
    escola?: string
    classe?: string
    ano?: string
  } | null
  historicoMatriculas: Array<{
    ano?: string | number
    classe?: string
    curso?: string
    turma?: string
    sala?: string
    periodo?: string
    dataMatricula?: string
    observacoes?: string
  }>
  historicoConfirmacoes: Array<{
    ano?: string | number
    classe?: string
    curso?: string
    turma?: string
    dataConfirmacao?: string
    observacoes?: string
  }>
}

// ===============================
// GERAÇÃO DE RELATÓRIOS
// ===============================

export interface GenerateReportRequest {
  format: 'pdf' | 'excel' | 'word'
  filters?: ReportFilters
  includeStatistics?: boolean
  includeCharts?: boolean
}

export interface GenerateIndividualReportRequest {
  format: 'pdf' | 'word'
  includeHistory?: boolean
  includeEncarregado?: boolean
  includeProveniencia?: boolean
}

export interface GeneratedReportResponse {
  students?: StudentReportData[]
  statistics?: StudentStatistics | null
  filters?: ReportFilters
  generatedAt: string
  totalStudents?: number
}

export interface GeneratedIndividualReportResponse {
  dadosPessoais: StudentCompleteData['dadosPessoais']
  encarregado?: StudentCompleteData['encarregado']
  proveniencia?: StudentCompleteData['proveniencia']
  historicoMatriculas?: StudentCompleteData['historicoMatriculas']
  historicoConfirmacoes?: StudentCompleteData['historicoConfirmacoes']
  generatedAt: string
}

// ===============================
// OPÇÕES DE FILTROS
// ===============================

export interface FilterOptions {
  anosAcademicos: string[]
  classes: string[]
  cursos: string[]
  estados: string[]
  generos: Array<{
    value: 'M' | 'F'
    label: string
  }>
  periodos: string[]
}

// ===============================
// RESPONSES DA API
// ===============================

export type StudentsReportApiResponse = ApiResponse<StudentsReportResponse>
export type StudentStatisticsApiResponse = ApiResponse<StudentStatistics>
export type StudentCompleteDataApiResponse = ApiResponse<StudentCompleteData>
export type GeneratedReportApiResponse = ApiResponse<GeneratedReportResponse>
export type GeneratedIndividualReportApiResponse = ApiResponse<GeneratedIndividualReportResponse>
export type FilterOptionsApiResponse = ApiResponse<FilterOptions>

// ===============================
// PARÂMETROS DE HOOKS
// ===============================

export interface UseStudentsReportParams extends ReportPaginationParams {
  enabled?: boolean
}

export interface UseStudentStatisticsParams extends ReportFilters {
  enabled?: boolean
}

export interface UseStudentCompleteDataParams {
  studentId: number
  enabled?: boolean
}

// ===============================
// ERROS DA API
// ===============================

export interface ApiError {
  response?: {
    data?: {
      message?: string
      errors?: Record<string, string[]>
    }
    status?: number
  }
  message?: string
}
