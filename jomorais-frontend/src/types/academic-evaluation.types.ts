// Types para gestão de avaliação acadêmica

// ============ TIPOS DE AVALIAÇÃO ============

export interface TipoAvaliacao {
  codigo: number
  designacao: string
  descricao?: string
  tipoAvaliacao?: number
}

export interface CreateTipoAvaliacaoPayload {
  designacao: string
  descricao?: string
  tipoAvaliacao?: number
}

export interface TipoAvaliacaoResponse {
  success: boolean
  message: string
  data: TipoAvaliacao
}

export interface TiposAvaliacaoListResponse {
  success: boolean
  message: string
  data: TipoAvaliacao[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

// ============ TIPOS DE NOTA ============

export interface TipoNota {
  codigo: number
  designacao: string
  descricao?: string
  status: number
}

export interface CreateTipoNotaPayload {
  designacao: string
  descricao?: string
  status?: number
}

export interface TipoNotaResponse {
  success: boolean
  message: string
  data: TipoNota
}

export interface TiposNotaListResponse {
  success: boolean
  message: string
  data: TipoNota[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

// ============ TIPOS DE NOTA VALOR ============

export interface TipoNotaValor {
  codigo: number
  codigoTipoNota: number
  valorNumerico: number
  valorTexto?: string
  descricao?: string
}

export interface CreateTipoNotaValorPayload {
  codigoTipoNota: number
  valorNumerico: number
  valorTexto?: string
  descricao?: string
}

export interface TipoNotaValorResponse {
  success: boolean
  message: string
  data: TipoNotaValor
}

export interface TiposNotaValorListResponse {
  success: boolean
  message: string
  data: TipoNotaValor[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

// ============ PERÍODOS DE AVALIAÇÃO ============

export interface PeriodoAvaliacao {
  Codigo: number
  Designacao: string
  TipoAvaliacao: string
  Trimestre: number
  DataInicio: string
  DataFim: string
  AnoLectivo: string
  Status: 'Activo' | 'Inactivo'
  dataCriacao?: string
  dataAtualizacao?: string
}

export interface CreatePeriodoAvaliacaoPayload {
  designacao: string
  tipoAvaliacao: string
  trimestre: number
  dataInicio: string
  dataFim: string
  anoLectivo: string
  status?: string
}

export interface UpdatePeriodoAvaliacaoPayload {
  designacao?: string
  tipoAvaliacao?: string
  trimestre?: number
  dataInicio?: string
  dataFim?: string
  anoLectivo?: string
  status?: string
}

export interface PeriodoAvaliacaoResponse {
  success: boolean
  message: string
  data: PeriodoAvaliacao
}

export interface PeriodosAvaliacaoListResponse {
  success: boolean
  message: string
  data: PeriodoAvaliacao[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

// ============ PARÂMETROS DE PAGINAÇÃO ============

export interface AcademicEvaluationPaginationParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  tipoNotaId?: number
}

// ============ ESTADO DE HOOKS ============

export interface UseAcademicEvaluationState {
  tiposAvaliacao: TipoAvaliacao[]
  tipoAvaliacao: TipoAvaliacao | null
  tiposNota: TipoNota[]
  tipoNota: TipoNota | null
  tiposNotaValor: TipoNotaValor[]
  tipoNotaValor: TipoNotaValor | null
  periodosAvaliacao: PeriodoAvaliacao[]
  periodoAvaliacao: PeriodoAvaliacao | null
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

export interface UseAcademicEvaluationReturn extends UseAcademicEvaluationState {
  // Tipos de Avaliação
  getTiposAvaliacao: (page?: number, limit?: number, search?: string) => Promise<void>
  getTipoAvaliacaoById: (id: number) => Promise<void>
  createTipoAvaliacao: (data: CreateTipoAvaliacaoPayload) => Promise<void>
  updateTipoAvaliacao: (id: number, data: CreateTipoAvaliacaoPayload) => Promise<void>
  deleteTipoAvaliacao: (id: number) => Promise<void>
  getTiposAvaliacaoPorTipo: (tipoAvaliacao: number) => Promise<void>

  // Tipos de Nota
  getTiposNota: (page?: number, limit?: number, search?: string) => Promise<void>
  getTipoNotaById: (id: number) => Promise<void>
  createTipoNota: (data: CreateTipoNotaPayload) => Promise<void>
  updateTipoNota: (id: number, data: CreateTipoNotaPayload) => Promise<void>
  deleteTipoNota: (id: number) => Promise<void>
  getTiposNotaAtivos: () => Promise<void>

  // Tipos de Nota Valor
  getTiposNotaValor: (page?: number, limit?: number, tipoNotaId?: number) => Promise<void>
  getTipoNotaValorById: (id: number) => Promise<void>
  createTipoNotaValor: (data: CreateTipoNotaValorPayload) => Promise<void>
  updateTipoNotaValor: (id: number, data: CreateTipoNotaValorPayload) => Promise<void>
  deleteTipoNotaValor: (id: number) => Promise<void>

  // Períodos de Avaliação
  getPeriodosAvaliacao: (page?: number, limit?: number, search?: string) => Promise<void>
  getPeriodoAvaliacaoById: (id: number) => Promise<void>
  createPeriodoAvaliacao: (data: CreatePeriodoAvaliacaoPayload) => Promise<void>
  updatePeriodoAvaliacao: (id: number, data: UpdatePeriodoAvaliacaoPayload) => Promise<void>
  deletePeriodoAvaliacao: (id: number) => Promise<void>

  clearError: () => void
  setLoading: (loading: boolean) => void
}
