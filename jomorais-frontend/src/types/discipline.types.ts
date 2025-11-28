export interface IDisciplineInput {
  designacao: string
  codigo_Curso: number
  status?: number
  cadeiraEspecifica?: number
}

export interface IDiscipline {
  codigo: number
  designacao: string
  codigo_Curso: number
  status: number
  cadeiraEspecifica?: number
  tb_cursos?: {
    codigo: number
    designacao: string
  }
  tb_grade_curricular?: Array<{
    codigo: number
  }>
}

export interface IPagination {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  hasNextPage?: boolean
  hasPreviousPage?: boolean
}

export interface IDisciplineListResponse {
  data: IDiscipline[]
  pagination: IPagination
}

export interface IDisciplineStatistics {
  totalDisciplinas: number
  disciplinasAtivas: number
  disciplinasInativas: number
  disciplinasEspecificas: number
  naGradeCurricular: number
}
