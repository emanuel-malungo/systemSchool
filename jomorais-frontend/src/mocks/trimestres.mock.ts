import type { Trimester, TrimesterResponse } from "../types/trimester.types"

/**
 * Mock de Trimestres
 * Representa os diferentes trimestres do ano letivo
 */
export const mockTrimesters: Trimester[] = [
  {
    codigo: 1,
    designacao: "I TRIMESTRE"
  },
  {
    codigo: 2,
    designacao: "II TRIMESTRE"
  },
  {
    codigo: 3,
    designacao: "III TRIMESTRE"
  }
]

/**
 * Resposta mockada da API completa
 */
export const mockTrimesterResponse: TrimesterResponse = {
  success: true,
  message: "Trimestres encontrados",
  data: mockTrimesters,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 3,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPreviousPage: false
  }
}

/**
 * Busca um trimestre pelo código
 * @param codigo - Código do trimestre
 * @returns Trimestre encontrado ou undefined
 */
export const getTrimesterByCode = (codigo: number): Trimester | undefined => {
  return mockTrimesters.find(trimester => trimester.codigo === codigo)
}

/**
 * Busca trimestres por designação (pesquisa parcial)
 * @param searchTerm - Termo de busca
 * @returns Array de trimestres que correspondem à busca
 */
export const searchTrimesters = (searchTerm: string): Trimester[] => {
  const term = searchTerm.toLowerCase()
  return mockTrimesters.filter(trimester => 
    trimester.designacao.toLowerCase().includes(term)
  )
}

/**
 * Retorna todos os trimestres ordenados por código
 * @returns Array de trimestres ordenados
 */
export const getSortedTrimesters = (): Trimester[] => {
  return [...mockTrimesters].sort((a, b) => a.codigo - b.codigo)
}

/**
 * Retorna a cor baseada no trimestre
 * @param codigo - Código do trimestre
 * @returns Classe CSS para a cor do badge
 */
export const getTrimesterColor = (codigo: number): string => {
  switch (codigo) {
    case 1: // I TRIMESTRE
      return 'bg-blue-100 text-blue-800'
    case 2: // II TRIMESTRE
      return 'bg-purple-100 text-purple-800'
    case 3: // III TRIMESTRE
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

/**
 * Retorna o ícone baseado no trimestre
 * @param codigo - Código do trimestre
 * @returns Nome do ícone Lucide
 */
export const getTrimesterIcon = (codigo: number): string => {
  switch (codigo) {
    case 1: // I TRIMESTRE
      return 'Calendar'
    case 2: // II TRIMESTRE
      return 'CalendarDays'
    case 3: // III TRIMESTRE
      return 'CalendarCheck'
    default:
      return 'Calendar'
  }
}

/**
 * Retorna o período aproximado do trimestre (meses)
 * @param codigo - Código do trimestre
 * @returns String com os meses
 */
export const getTrimesterMonths = (codigo: number): string => {
  switch (codigo) {
    case 1: // I TRIMESTRE
      return 'Fevereiro - Abril'
    case 2: // II TRIMESTRE
      return 'Maio - Julho'
    case 3: // III TRIMESTRE
      return 'Agosto - Outubro'
    default:
      return 'Não definido'
  }
}

/**
 * Retorna o número romano do trimestre
 * @param codigo - Código do trimestre
 * @returns Número romano (I, II, III)
 */
export const getTrimesterRoman = (codigo: number): string => {
  switch (codigo) {
    case 1:
      return 'I'
    case 2:
      return 'II'
    case 3:
      return 'III'
    default:
      return ''
  }
}

/**
 * Verifica se é o primeiro trimestre
 * @param codigo - Código do trimestre
 * @returns true se for o primeiro trimestre
 */
export const isFirstTrimester = (codigo: number): boolean => {
  return codigo === 1
}

/**
 * Verifica se é o segundo trimestre
 * @param codigo - Código do trimestre
 * @returns true se for o segundo trimestre
 */
export const isSecondTrimester = (codigo: number): boolean => {
  return codigo === 2
}

/**
 * Verifica se é o terceiro/último trimestre
 * @param codigo - Código do trimestre
 * @returns true se for o terceiro trimestre
 */
export const isLastTrimester = (codigo: number): boolean => {
  return codigo === 3
}

/**
 * Retorna o próximo trimestre
 * @param codigo - Código do trimestre atual
 * @returns Próximo trimestre ou undefined se for o último
 */
export const getNextTrimester = (codigo: number): Trimester | undefined => {
  if (codigo >= 3) return undefined
  return getTrimesterByCode(codigo + 1)
}

/**
 * Retorna o trimestre anterior
 * @param codigo - Código do trimestre atual
 * @returns Trimestre anterior ou undefined se for o primeiro
 */
export const getPreviousTrimester = (codigo: number): Trimester | undefined => {
  if (codigo <= 1) return undefined
  return getTrimesterByCode(codigo - 1)
}

/**
 * Retorna a porcentagem de progresso do ano letivo
 * @param codigo - Código do trimestre
 * @returns Porcentagem (0-100)
 */
export const getTrimesterProgress = (codigo: number): number => {
  switch (codigo) {
    case 1:
      return 33
    case 2:
      return 66
    case 3:
      return 100
    default:
      return 0
  }
}
