export interface ITurmaInput {
  designacao: string
  codigo_Classe: number
  codigo_Curso: number
  codigo_Sala: number
  codigo_Periodo: number
  codigo_AnoLectivo?: number
  max_Alunos?: number
  status?: string
}

export interface ITurma {
  codigo: number
  designacao: string
  codigo_Classe: number
  codigo_Curso: number
  codigo_Sala: number
  codigo_Periodo: number
  codigo_AnoLectivo: number
  max_Alunos: number
  status: string
  tb_classes?: {
    codigo: number
    designacao: string
  }
  tb_cursos?: {
    codigo: number
    designacao: string
  }
  tb_salas?: {
    codigo: number
    designacao: string
  }
  tb_periodos?: {
    codigo: number
    designacao: string
  }
}

export interface IPagination {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  hasNextPage?: boolean
  hasPreviousPage?: boolean
}

export interface ITurmaListResponse {
  data: ITurma[]
  pagination: IPagination
}
