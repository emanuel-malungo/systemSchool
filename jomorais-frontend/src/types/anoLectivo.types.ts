export interface IAnoLectivoInput {
  designacao: string
  mesInicial: string
  mesFinal: string
  anoInicial: string
  anoFinal: string
}

export interface IAnoLectivo {
  codigo: number
  designacao: string
  mesInicial: string
  mesFinal: string
  anoInicial: string
  anoFinal: string
}

export interface IPagination {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  hasNextPage?: boolean
  hasPreviousPage?: boolean
}

export interface IAnoLectivoListResponse {
  data: IAnoLectivo[]
  pagination: IPagination
}

// Tipos para padronização com outros services
export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface PaginatedAnoLectivoResponse {
  success: boolean
  message?: string
  data: IAnoLectivo[]
  meta?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  pagination?: IPagination
}
