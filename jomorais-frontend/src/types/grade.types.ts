// Types para gestão de notas/grades

export interface Student {
  codigo: number
  nome: string
}

export interface Subject {
  codigo: number
  designacao: string
}

export interface EvaluationType {
  codigo: number
  designacao: string
}

export interface Trimester {
  codigo: number
  designacao: string
}

export interface Turma {
  codigo: number
  designacao: string
}

export interface Grade {
  Codigo: number
  CodigoAluno: number
  CodigoDisciplina: number
  Nota: number
  CodigoAnoLectivo: number
  CodigoTipoAvaliacao: number
  CodigoTrimestre: number
  CodigoTurma?: number
  CodigoUtilizador: number
  DataCadastro: string | number
  tb_alunos?: Student
  tb_disciplinas?: Subject
  tb_tipo_avaliacao?: EvaluationType
  tb_trimestres?: Trimester
  tb_turmas?: Turma
}

export interface CreateGradePayload {
  codigoAluno: number
  codigoDisciplina: number
  nota: number
  codigoAnoLectivo: number
  codigoTipoAvaliacao: number
  codigoTrimestre: number
  codigoTurma?: number
  codigoUtilizador: number
}

export interface UpdateGradePayload {
  nota?: number
  motivo?: string
  codigoUtilizador?: number
}

export interface GradeFilters {
  codigoAluno?: number
  codigoDisciplina?: number
  codigoTurma?: number
  codigoTrimestre?: number
  codigoAnoLectivo?: number
}

export interface GradeResponse {
  success: boolean
  message: string
  data: Grade
}

export interface GradesListResponse {
  success: boolean
  message: string
  data: Grade[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export interface PautaItem {
  codigoAluno: number
  nomeAluno: string
  codigoDisciplina: number
  nomeDisciplina: string
  nota: number
  tipoAvaliacao: string
  status: 'Aprovado' | 'Reprovado'
}

export interface Pauta {
  codigoTurma: number
  codigoTrimestre: number
  codigoAnoLectivo: number
  dataGeracao: string
  totalAlunos: number
  mediaGeral: number
  alunosAprovados: number
  alunosReprovados: number
  itens: PautaItem[]
}

export interface PautaResponse {
  success: boolean
  message: string
  data: Pauta
}

export interface UseGradeState {
  grades: Grade[]
  grade: Grade | null
  pauta: Pauta | null
  loading: boolean
  error: string | null
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  } | null
}

export interface UseGradeReturn extends UseGradeState {
  getGrades: (page?: number, limit?: number, filters?: GradeFilters) => Promise<void>
  getGradeById: (id: number) => Promise<void>
  createGrade: (data: CreateGradePayload) => Promise<void>
  updateGrade: (id: number, data: UpdateGradePayload) => Promise<void>
  deleteGrade: (id: number) => Promise<void>
  generatePauta: (codigoTurma: number, codigoTrimestre: number, codigoAnoLectivo: number) => Promise<void>
  clearError: () => void
  clearGrade: () => void
  setLoading: (loading: boolean) => void
}

export interface GradePaginationParams {
  page?: number
  limit?: number
  filters?: GradeFilters
}
