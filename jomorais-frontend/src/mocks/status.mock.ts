import type { Status, StatusResponse, TipoStatus } from "../types/status.types"

/**
 * Tipo de Status Geral
 */
export const tipoStatusGeral: TipoStatus = {
  codigo: 3,
  designacao: "Geral"
}

/**
 * Mock de Status do Sistema
 * Representa os diferentes status que um aluno pode ter
 */
export const mockStatus: Status[] = [
  {
    codigo: 4,
    designacao: "ANULOU",
    tipoStatus: 3,
    tb_tipo_status: tipoStatusGeral
  },
  {
    codigo: 8,
    designacao: "BOLCEIRO",
    tipoStatus: 3,
    tb_tipo_status: tipoStatusGeral
  },
  {
    codigo: 2,
    designacao: "DESISTENTE",
    tipoStatus: 3,
    tb_tipo_status: tipoStatusGeral
  },
  {
    codigo: 7,
    designacao: "ELIMINADO",
    tipoStatus: 3,
    tb_tipo_status: tipoStatusGeral
  },
  {
    codigo: 1,
    designacao: "NORMAL",
    tipoStatus: 3,
    tb_tipo_status: tipoStatusGeral
  },
  {
    codigo: 5,
    designacao: "PENDENTE",
    tipoStatus: 3,
    tb_tipo_status: tipoStatusGeral
  },
  {
    codigo: 3,
    designacao: "TRANSFERIDO",
    tipoStatus: 3,
    tb_tipo_status: tipoStatusGeral
  }
]

/**
 * Resposta mockada da API completa
 */
export const mockStatusResponse: StatusResponse = {
  success: true,
  message: "Status encontrados",
  data: mockStatus,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 7,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPreviousPage: false
  }
}

/**
 * Busca um status pelo código
 * @param codigo - Código do status
 * @returns Status encontrado ou undefined
 */
export const getStatusByCode = (codigo: number): Status | undefined => {
  return mockStatus.find(status => status.codigo === codigo)
}

/**
 * Busca status por designação (pesquisa parcial)
 * @param searchTerm - Termo de busca
 * @returns Array de status que correspondem à busca
 */
export const searchStatus = (searchTerm: string): Status[] => {
  const term = searchTerm.toLowerCase()
  return mockStatus.filter(status => 
    status.designacao.toLowerCase().includes(term)
  )
}

/**
 * Retorna todos os status ordenados por designação
 * @returns Array de status ordenados
 */
export const getSortedStatus = (): Status[] => {
  return [...mockStatus].sort((a, b) => 
    a.designacao.localeCompare(b.designacao)
  )
}

/**
 * Status mais comuns
 */
export const commonStatus: Status[] = [
  {
    codigo: 1,
    designacao: "NORMAL",
    tipoStatus: 3,
    tb_tipo_status: tipoStatusGeral
  },
  {
    codigo: 5,
    designacao: "PENDENTE",
    tipoStatus: 3,
    tb_tipo_status: tipoStatusGeral
  },
  {
    codigo: 8,
    designacao: "BOLCEIRO",
    tipoStatus: 3,
    tb_tipo_status: tipoStatusGeral
  },
  {
    codigo: 3,
    designacao: "TRANSFERIDO",
    tipoStatus: 3,
    tb_tipo_status: tipoStatusGeral
  },
  {
    codigo: 2,
    designacao: "DESISTENTE",
    tipoStatus: 3,
    tb_tipo_status: tipoStatusGeral
  }
]

/**
 * Status Ativos (excluindo Anulou e Eliminado)
 */
export const activeStatus: Status[] = [
  {
    codigo: 1,
    designacao: "NORMAL",
    tipoStatus: 3,
    tb_tipo_status: tipoStatusGeral
  },
  {
    codigo: 8,
    designacao: "BOLCEIRO",
    tipoStatus: 3,
    tb_tipo_status: tipoStatusGeral
  },
  {
    codigo: 5,
    designacao: "PENDENTE",
    tipoStatus: 3,
    tb_tipo_status: tipoStatusGeral
  }
]

/**
 * Status Inativos
 */
export const inactiveStatus: Status[] = [
  {
    codigo: 2,
    designacao: "DESISTENTE",
    tipoStatus: 3,
    tb_tipo_status: tipoStatusGeral
  },
  {
    codigo: 3,
    designacao: "TRANSFERIDO",
    tipoStatus: 3,
    tb_tipo_status: tipoStatusGeral
  },
  {
    codigo: 4,
    designacao: "ANULOU",
    tipoStatus: 3,
    tb_tipo_status: tipoStatusGeral
  },
  {
    codigo: 7,
    designacao: "ELIMINADO",
    tipoStatus: 3,
    tb_tipo_status: tipoStatusGeral
  }
]

/**
 * Verifica se um status é ativo
 * @param codigo - Código do status
 * @returns true se o status for ativo
 */
export const isActiveStatus = (codigo: number): boolean => {
  return activeStatus.some(status => status.codigo === codigo)
}

/**
 * Verifica se um status é inativo
 * @param codigo - Código do status
 * @returns true se o status for inativo
 */
export const isInactiveStatus = (codigo: number): boolean => {
  return inactiveStatus.some(status => status.codigo === codigo)
}

/**
 * Retorna a cor baseada no status
 * @param codigo - Código do status
 * @returns Classe CSS para a cor do badge
 */
export const getStatusColor = (codigo: number): string => {
  switch (codigo) {
    case 1: // NORMAL
      return 'bg-green-100 text-green-800'
    case 8: // BOLCEIRO
      return 'bg-blue-100 text-blue-800'
    case 5: // PENDENTE
      return 'bg-yellow-100 text-yellow-800'
    case 3: // TRANSFERIDO
      return 'bg-purple-100 text-purple-800'
    case 2: // DESISTENTE
      return 'bg-orange-100 text-orange-800'
    case 4: // ANULOU
      return 'bg-red-100 text-red-800'
    case 7: // ELIMINADO
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

/**
 * Retorna o ícone baseado no status
 * @param codigo - Código do status
 * @returns Nome do ícone Lucide
 */
export const getStatusIcon = (codigo: number): string => {
  switch (codigo) {
    case 1: // NORMAL
      return 'CheckCircle'
    case 8: // BOLCEIRO
      return 'Award'
    case 5: // PENDENTE
      return 'Clock'
    case 3: // TRANSFERIDO
      return 'ArrowRightLeft'
    case 2: // DESISTENTE
      return 'UserX'
    case 4: // ANULOU
      return 'XCircle'
    case 7: // ELIMINADO
      return 'Ban'
    default:
      return 'Circle'
  }
}
