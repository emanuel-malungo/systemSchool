import type { Period, PeriodResponse } from "../types/period.types"

/**
 * Mock de Períodos
 * Representa os diferentes períodos de aulas disponíveis
 */
export const mockPeriods: Period[] = [
  {
    codigo: 1,
    designacao: "MANHA"
  },
  {
    codigo: 2,
    designacao: "TARDE"
  },
  {
    codigo: 3,
    designacao: "NOITE"
  },
  {
    codigo: 4,
    designacao: "TODO DIA"
  }
]

/**
 * Resposta mockada da API completa
 */
export const mockPeriodResponse: PeriodResponse = {
  success: true,
  message: "Períodos encontrados",
  data: mockPeriods,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 4,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPreviousPage: false
  }
}

/**
 * Busca um período pelo código
 * @param codigo - Código do período
 * @returns Período encontrado ou undefined
 */
export const getPeriodByCode = (codigo: number): Period | undefined => {
  return mockPeriods.find(period => period.codigo === codigo)
}

/**
 * Busca períodos por designação (pesquisa parcial)
 * @param searchTerm - Termo de busca
 * @returns Array de períodos que correspondem à busca
 */
export const searchPeriods = (searchTerm: string): Period[] => {
  const term = searchTerm.toLowerCase()
  return mockPeriods.filter(period => 
    period.designacao.toLowerCase().includes(term)
  )
}

/**
 * Retorna todos os períodos ordenados por código
 * @returns Array de períodos ordenados
 */
export const getSortedPeriods = (): Period[] => {
  return [...mockPeriods].sort((a, b) => a.codigo - b.codigo)
}

/**
 * Retorna todos os períodos ordenados por designação
 * @returns Array de períodos ordenados alfabeticamente
 */
export const getSortedPeriodsByName = (): Period[] => {
  return [...mockPeriods].sort((a, b) => 
    a.designacao.localeCompare(b.designacao)
  )
}

/**
 * Períodos mais comuns (sem TODO DIA)
 */
export const commonPeriods: Period[] = [
  {
    codigo: 1,
    designacao: "MANHA"
  },
  {
    codigo: 2,
    designacao: "TARDE"
  },
  {
    codigo: 3,
    designacao: "NOITE"
  }
]

/**
 * Retorna a cor baseada no período
 * @param codigo - Código do período
 * @returns Classe CSS para a cor do badge
 */
export const getPeriodColor = (codigo: number): string => {
  switch (codigo) {
    case 1: // MANHA
      return 'bg-yellow-100 text-yellow-800'
    case 2: // TARDE
      return 'bg-orange-100 text-orange-800'
    case 3: // NOITE
      return 'bg-indigo-100 text-indigo-800'
    case 4: // TODO DIA
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

/**
 * Retorna o ícone baseado no período
 * @param codigo - Código do período
 * @returns Nome do ícone Lucide
 */
export const getPeriodIcon = (codigo: number): string => {
  switch (codigo) {
    case 1: // MANHA
      return 'Sunrise'
    case 2: // TARDE
      return 'Sun'
    case 3: // NOITE
      return 'Moon'
    case 4: // TODO DIA
      return 'Clock'
    default:
      return 'Calendar'
  }
}

/**
 * Retorna o horário aproximado do período
 * @param codigo - Código do período
 * @returns String com o horário
 */
export const getPeriodTime = (codigo: number): string => {
  switch (codigo) {
    case 1: // MANHA
      return '07:00 - 12:00'
    case 2: // TARDE
      return '13:00 - 18:00'
    case 3: // NOITE
      return '18:00 - 22:00'
    case 4: // TODO DIA
      return '07:00 - 18:00'
    default:
      return 'Não definido'
  }
}

/**
 * Verifica se um período é diurno
 * @param codigo - Código do período
 * @returns true se o período for diurno (manhã ou tarde)
 */
export const isDiurnalPeriod = (codigo: number): boolean => {
  return codigo === 1 || codigo === 2
}

/**
 * Verifica se um período é noturno
 * @param codigo - Código do período
 * @returns true se o período for noturno
 */
export const isNocturnalPeriod = (codigo: number): boolean => {
  return codigo === 3
}

/**
 * Verifica se um período é integral
 * @param codigo - Código do período
 * @returns true se o período for integral (todo dia)
 */
export const isFullDayPeriod = (codigo: number): boolean => {
  return codigo === 4
}
