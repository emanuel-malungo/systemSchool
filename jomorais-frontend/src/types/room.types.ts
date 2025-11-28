/**
 * Tipos relacionados à gestão de Salas de Aula
 */

// Sala de Aula
export interface Room {
  codigo: number
  designacao: string
}

// Input para criação de sala
export interface RoomInput {
  designacao: string
}

// Input para atualização de sala
export interface RoomUpdate {
  designacao?: string
}

// Resposta da API para uma única sala
export interface SingleRoomResponse {
  success: boolean
  message: string
  data: Room
}

// Resposta da API para lista de salas
export interface RoomListResponse {
  success: boolean
  message: string
  data: Room[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

// Resposta da API para operações de delete
export interface RoomDeleteResponse {
  success: boolean
  message: string
}

// Parâmetros de filtro para salas
export interface RoomFilters {
  search?: string
}

// Parâmetros de ordenação para salas
export interface RoomSortOptions {
  field: 'codigo' | 'designacao'
  order: 'asc' | 'desc'
}

// Parâmetros de paginação
export interface RoomPaginationParams {
  page?: number
  limit?: number
  search?: string
}

// Sala estendida com informações adicionais
export interface RoomExtended extends Room {
  totalTurmas?: number // Quantidade de turmas associadas
  totalAlunos?: number // Quantidade de alunos nas turmas
  capacidade?: number // Capacidade da sala (futuro)
  bloco?: string // Bloco/prédio da sala (futuro)
  andar?: number // Andar da sala (futuro)
  recursos?: string[] // Recursos disponíveis (futuro: projetor, computador, etc.)
}

// Estatísticas de salas (para relatórios)
export interface RoomStats {
  totalSalas: number
  salasOcupadas: number
  salasDisponiveis: number
  capacidadeTotal?: number
  taxaOcupacao?: number // Percentual de ocupação
}

// Tipo para seleção de sala em formulários
export interface RoomSelectOption {
  value: number
  label: string
  ocupada?: boolean
  totalTurmas?: number
}

// Turma associada à sala (resumida)
export interface RoomTurma {
  codigo: number
  designacao: string
  codigo_Curso?: number
  codigo_Periodo?: number
  codigo_Ano_Lectivo?: number
}

// Sala com turmas associadas
export interface RoomWithTurmas extends Room {
  tb_turmas?: RoomTurma[]
}
