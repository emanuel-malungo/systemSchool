/**
 * Tipos relacionados aos Trimestres do Ano Letivo
 */

// Trimestre
export interface Trimester {
  codigo: number
  designacao: string
}

// Resposta da API de Trimestres
export interface TrimesterResponse {
  success: boolean
  message: string
  data: Trimester[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

// Resposta da API para um único trimestre
export interface SingleTrimesterResponse {
  success: boolean
  message: string
  data: Trimester
}

// DTO para criação de trimestre
export interface CreateTrimesterDTO {
  designacao: string
}

// DTO para atualização de trimestre
export interface UpdateTrimesterDTO {
  designacao?: string
}

// Tipos de Trimestre (enum-like)
export type TrimesterType = 'I TRIMESTRE' | 'II TRIMESTRE' | 'III TRIMESTRE'

// Mapeamento de códigos para tipos de trimestre
export const TRIMESTER_CODES = {
  FIRST: 1,
  SECOND: 2,
  THIRD: 3
} as const

// Tipo para os códigos de trimestre
export type TrimesterCode = typeof TRIMESTER_CODES[keyof typeof TRIMESTER_CODES]

// Parâmetros de filtro para trimestres
export interface TrimesterFilters {
  search?: string
  codigo?: number
}

// Parâmetros de ordenação para trimestres
export interface TrimesterSortOptions {
  field: 'codigo' | 'designacao'
  order: 'asc' | 'desc'
}

// Parâmetros de paginação
export interface TrimesterPaginationParams {
  page?: number
  limit?: number
}

// Informações estendidas do trimestre (com dados adicionais)
export interface TrimesterExtended extends Trimester {
  meses?: string // Meses do trimestre
  numeroRomano?: string // Número romano (I, II, III)
  progresso?: number // Porcentagem de progresso (33%, 66%, 100%)
  isFirst?: boolean // Se é o primeiro trimestre
  isLast?: boolean // Se é o último trimestre
}

// Estatísticas de trimestre (para relatórios)
export interface TrimesterStats {
  trimestre: Trimester
  totalAvaliacoes: number
  totalAlunos: number
  mediaGeral: number
  aprovados?: number
  reprovados?: number
}

// Tipo para seleção de trimestre em formulários
export interface TrimesterSelectOption {
  value: number
  label: string
  icon?: string
  color?: string
  months?: string
  progress?: number
}

// Avaliação associada ao trimestre (resumida)
export interface TrimesterAvaliacao {
  codigo: number
  codigo_Trimestre: number
  codigo_Aluno: number
  nota: number
}

// Trimestre com avaliações associadas
export interface TrimesterWithAvaliacoes extends Trimester {
  avaliacoes?: TrimesterAvaliacao[]
  totalAvaliacoes?: number
}
