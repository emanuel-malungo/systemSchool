/**
 * Tipos relacionados aos Períodos de Aulas
 */

// Período
export interface Period {
  codigo: number
  designacao: string
}

// Resposta da API de Períodos
export interface PeriodResponse {
  success: boolean
  message: string
  data: Period[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

// Resposta da API para um único período
export interface SinglePeriodResponse {
  success: boolean
  message: string
  data: Period
}

// DTO para criação de período
export interface CreatePeriodDTO {
  designacao: string
}

// DTO para atualização de período
export interface UpdatePeriodDTO {
  designacao?: string
}

// Tipos de Período (enum-like)
export type PeriodType = 'MANHA' | 'TARDE' | 'NOITE' | 'TODO DIA'

// Mapeamento de códigos para tipos de período
export const PERIOD_CODES = {
  MANHA: 1,
  TARDE: 2,
  NOITE: 3,
  TODO_DIA: 4
} as const

// Tipo para os códigos de período
export type PeriodCode = typeof PERIOD_CODES[keyof typeof PERIOD_CODES]

// Parâmetros de filtro para períodos
export interface PeriodFilters {
  search?: string
  codigo?: number
}

// Parâmetros de ordenação para períodos
export interface PeriodSortOptions {
  field: 'codigo' | 'designacao'
  order: 'asc' | 'desc'
}

// Parâmetros de paginação
export interface PeriodPaginationParams {
  page?: number
  limit?: number
}

// Informações estendidas do período (com dados adicionais)
export interface PeriodExtended extends Period {
  horario?: string // Horário aproximado do período
  isDiurnal?: boolean // Se é diurno (manhã ou tarde)
  isNocturnal?: boolean // Se é noturno
  isFullDay?: boolean // Se é todo dia
}

// Estatísticas de período (para relatórios)
export interface PeriodStats {
  periodo: Period
  totalTurmas: number
  totalAlunos: number
  totalProfessores: number
}

// Tipo para seleção de período em formulários
export interface PeriodSelectOption {
  value: number
  label: string
  icon?: string
  color?: string
  time?: string
}
