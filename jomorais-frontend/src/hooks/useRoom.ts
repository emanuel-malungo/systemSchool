import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import roomService from '../services/room.service'
import type { RoomInput, RoomUpdate, RoomPaginationParams } from '../types/room.types'

/**
 * Tipo para erros da API
 */
interface ApiError {
  response?: {
    data?: {
      message?: string
    }
  }
  message?: string
}

/**
 * Chaves de cache para o React Query
 * Organização hierárquica para facilitar invalidação de cache
 */
export const roomKeys = {
  all: ['rooms'] as const,
  lists: () => [...roomKeys.all, 'list'] as const,
  list: (params: RoomPaginationParams) => [...roomKeys.lists(), params] as const,
  details: () => [...roomKeys.all, 'detail'] as const,
  detail: (id: number) => [...roomKeys.details(), id] as const,
  complete: (search?: string) => [...roomKeys.all, 'complete', search] as const,
  search: (term: string) => [...roomKeys.all, 'search', term] as const,
}

/**
 * Hook para buscar todas as salas com paginação e filtros
 * Implementa cache automático e refetch otimizado
 * @param params - Parâmetros de paginação e filtros
 * @returns Query com lista paginada de salas
 */
export function useRooms(params: RoomPaginationParams = { page: 1, limit: 10 }) {
  return useQuery({
    queryKey: roomKeys.list(params),
    queryFn: () => roomService.getRooms(params),
    staleTime: 1000 * 60 * 5, // Cache válido por 5 minutos
    gcTime: 1000 * 60 * 10, // Mantém no cache por 10 minutos
    retry: 2, // Tenta 2 vezes em caso de erro
    refetchOnWindowFocus: false, // Não refaz a query ao focar a janela
  })
}

/**
 * Hook para buscar todas as salas sem paginação (para selects)
 * Útil para dropdowns e operações que precisam de todos os dados
 * @param search - Termo de busca opcional
 * @param enabled - Se a query deve ser executada
 * @returns Query com lista completa de salas
 */
export function useRoomsComplete(search = '', enabled = true) {
  return useQuery({
    queryKey: roomKeys.complete(search),
    queryFn: () => roomService.getAllRooms(search),
    enabled,
    staleTime: 1000 * 60 * 10, // Cache válido por 10 minutos (dados mais estáveis)
    gcTime: 1000 * 60 * 30, // Mantém no cache por 30 minutos
    retry: 2,
  })
}

/**
 * Hook para buscar uma sala específica por ID
 * @param id - Código da sala
 * @param enabled - Se a query deve ser executada
 * @returns Query com dados da sala
 */
export function useRoom(id: number, enabled = true) {
  return useQuery({
    queryKey: roomKeys.detail(id),
    queryFn: () => roomService.getRoomById(id),
    enabled: enabled && !!id, // Só executa se enabled for true e id existir
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
  })
}

/**
 * Hook para buscar salas por termo de busca
 * @param searchTerm - Termo para buscar
 * @param enabled - Se a query deve ser executada
 * @returns Query com lista de salas filtradas
 */
export function useSearchRooms(searchTerm: string, enabled = true) {
  return useQuery({
    queryKey: roomKeys.search(searchTerm),
    queryFn: () => roomService.searchRooms(searchTerm),
    enabled: enabled && searchTerm.length > 0,
    staleTime: 1000 * 60 * 3, // Cache de 3 minutos para buscas
    gcTime: 1000 * 60 * 5,
    retry: 1,
  })
}

/**
 * Hook para criar uma nova sala
 * Invalida cache automaticamente após sucesso
 * @returns Mutation para criar sala
 */
export function useCreateRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (roomData: RoomInput) => 
      roomService.createRoom(roomData),
    
    onSuccess: () => {
      // Invalida todas as listas de salas para refazer o fetch
      queryClient.invalidateQueries({ queryKey: roomKeys.lists() })
      queryClient.invalidateQueries({ queryKey: roomKeys.all })
      
      toast.success('Sala criada com sucesso!')
    },
    
    onError: (error: ApiError) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao criar sala'
      toast.error(errorMessage)
      console.error('Erro ao criar sala:', error)
    },
  })
}

/**
 * Hook para atualizar uma sala existente
 * Utiliza optimistic update para melhor UX
 * @returns Mutation para atualizar sala
 */
export function useUpdateRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, roomData }: { id: number; roomData: RoomUpdate }) =>
      roomService.updateRoom(id, roomData),
    
    // Optimistic update - atualiza o cache antes da resposta do servidor
    onMutate: async (variables: { id: number; roomData: RoomUpdate }) => {
      // Cancela queries em andamento
      await queryClient.cancelQueries({ queryKey: roomKeys.detail(variables.id) })
      
      // Salva o valor anterior
      const previousRoom = queryClient.getQueryData(roomKeys.detail(variables.id))

      return { previousRoom }
    },
    
    onSuccess: (_data: unknown, variables: { id: number; roomData: RoomUpdate }) => {
      // Invalida as listas
      queryClient.invalidateQueries({ queryKey: roomKeys.lists() })
      queryClient.invalidateQueries({ queryKey: roomKeys.all })
      queryClient.invalidateQueries({ queryKey: roomKeys.detail(variables.id) })
      
      toast.success('Sala atualizada com sucesso!')
    },
    
    onError: (error: ApiError, variables: { id: number; roomData: RoomUpdate }, context: { previousRoom?: unknown } | undefined) => {
      // Reverte para o valor anterior em caso de erro
      if (context?.previousRoom) {
        queryClient.setQueryData(roomKeys.detail(variables.id), context.previousRoom)
      }
      
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao atualizar sala'
      toast.error(errorMessage)
      console.error('Erro ao atualizar sala:', error)
    },
  })
}

/**
 * Hook para deletar uma sala
 * @returns Mutation para deletar sala
 */
export function useDeleteRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => roomService.deleteRoom(id),
    
    onSuccess: (_data: unknown, id: number) => {
      // Remove a sala específica do cache
      queryClient.removeQueries({ queryKey: roomKeys.detail(id) })
      
      // Invalida todas as listas
      queryClient.invalidateQueries({ queryKey: roomKeys.lists() })
      queryClient.invalidateQueries({ queryKey: roomKeys.all })
      
      toast.success('Sala deletada com sucesso!')
    },
    
    onError: (error: ApiError) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao deletar sala'
      toast.error(errorMessage)
      console.error('Erro ao deletar sala:', error)
    },
  })
}

/**
 * Hook combinado para gerenciar todas as operações de salas
 * Útil quando você precisa de múltiplas operações em um componente
 * @param params - Parâmetros de paginação e filtros
 * @returns Objeto com todas as operações de salas
 */
export function useRoomsManager(params: RoomPaginationParams = { page: 1, limit: 10 }) {
  const rooms = useRooms(params)
  const createRoom = useCreateRoom()
  const updateRoom = useUpdateRoom()
  const deleteRoom = useDeleteRoom()

  return {
    // Queries
    rooms: rooms.data?.data || [],
    pagination: rooms.data?.pagination,
    isLoading: rooms.isLoading,
    isError: rooms.isError,
    error: rooms.error,
    refetch: rooms.refetch,

    // Mutations
    createRoom: createRoom.mutate,
    updateRoom: updateRoom.mutate,
    deleteRoom: deleteRoom.mutate,

    // Loading states
    isCreating: createRoom.isPending,
    isUpdating: updateRoom.isPending,
    isDeleting: deleteRoom.isPending,

    // Async versions (para usar com async/await)
    createRoomAsync: createRoom.mutateAsync,
    updateRoomAsync: updateRoom.mutateAsync,
    deleteRoomAsync: deleteRoom.mutateAsync,
  }
}
