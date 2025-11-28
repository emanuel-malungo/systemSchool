// Tipo de Status
export interface TipoStatus {
  codigo: number
  designacao: string
}

// Status
export interface Status {
  codigo: number
  designacao: string
  tipoStatus: number
  tb_tipo_status: TipoStatus
}

// Resposta da API de Status
export interface StatusResponse {
  success: boolean
  message: string
  data: Status[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}
