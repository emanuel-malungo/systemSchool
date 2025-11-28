/**
 * Input para criar/atualizar curso
 */
export interface ICourseInput {
  designacao: string
}

/**
 * Entidade Curso
 */
export interface ICourse {
  codigo: number
  designacao: string
  codigo_Status: number
  duracao?: number
  descricao?: string | null
  createdAt?: string
  updatedAt?: string
}

/**
 * Paginação genérica
 */
export interface IPagination {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  hasNextPage?: boolean
  hasPreviousPage?: boolean
  total?: number
  page?: number
  limit?: number
}

/**
 * Resposta genérica da API
 */
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

/**
 * Resposta de lista de cursos
 */
export interface ICourseListResponse {
  data: ICourse[]
  pagination: IPagination
}

/**
 * Resposta paginada de cursos
 */
export interface PaginatedCourseResponse extends ApiResponse<ICourse[]> {
  pagination: IPagination
}

/**
 * Parâmetros de paginação e filtros
 */
export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  includeArchived?: boolean
}

/**
 * Estatísticas de cursos
 */
export interface ICourseStats {
  total: number
  active: number
  inactive: number
  archived?: number
}
