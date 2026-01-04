import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import disciplineService from '../services/discipline.service'
import type { IDisciplineInput } from '../types/discipline.types'
import type { PaginationParams } from '../services/discipline.service'

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
export const disciplineKeys = {
  all: ['disciplines'] as const,
  lists: () => [...disciplineKeys.all, 'list'] as const,
  list: (params: PaginationParams) => [...disciplineKeys.lists(), params] as const,
  details: () => [...disciplineKeys.all, 'detail'] as const,
  detail: (id: number) => [...disciplineKeys.details(), id] as const,
  complete: (search?: string, codigo_Curso?: number) => 
    [...disciplineKeys.all, 'complete', search, codigo_Curso] as const,
  statistics: (filters?: { codigo_Curso?: number; status?: string }) => 
    [...disciplineKeys.all, 'statistics', filters] as const,
  byCurso: (codigo_Curso: number) => [...disciplineKeys.all, 'byCurso', codigo_Curso] as const,
}

/**
 * Hook para buscar todas as disciplinas com paginação e filtros
 * Implementa cache automático e refetch otimizado
 * @param params - Parâmetros de paginação e filtros
 * @returns Query com lista paginada de disciplinas
 */
export function useDisciplines(params: PaginationParams = { page: 1, limit: 10 }) {
  return useQuery({
    queryKey: disciplineKeys.list(params),
    queryFn: () => disciplineService.getDisciplines(params),
    staleTime: 1000 * 60 * 5, // Cache válido por 5 minutos
    gcTime: 1000 * 60 * 10, // Mantém no cache por 10 minutos
    retry: 2, // Tenta 2 vezes em caso de erro
    refetchOnWindowFocus: false, // Não refaz a query ao focar a janela
  })
}

/**
 * Hook para buscar todas as disciplinas sem paginação (para selects)
 * Útil para dropdowns e operações que precisam de todos os dados
 * @param search - Termo de busca opcional
 * @param codigo_Curso - Filtro por curso
 * @param enabled - Se a query deve ser executada
 * @returns Query com lista completa de disciplinas
 */
export function useDisciplinesComplete(search = '', codigo_Curso?: number, enabled = true) {
  return useQuery({
    queryKey: disciplineKeys.complete(search, codigo_Curso),
    queryFn: () => disciplineService.getAllDisciplines(search, codigo_Curso),
    enabled,
    staleTime: 1000 * 60 * 10, // Cache válido por 10 minutos (dados mais estáveis)
    gcTime: 1000 * 60 * 30,
    retry: 2,
  })
}

/**
 * Hook para buscar uma disciplina específica por ID
 * @param id - ID da disciplina
 * @param enabled - Se a query deve ser executada
 * @returns Query com dados da disciplina
 */
export function useDiscipline(id: number, enabled = true) {
  return useQuery({
    queryKey: disciplineKeys.detail(id),
    queryFn: () => disciplineService.getDisciplineById(id),
    enabled: enabled && !!id, // Só executa se enabled for true e id existir
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
  })
}

/**
 * Hook para buscar disciplinas por curso
 * @param codigo_Curso - Código do curso
 * @param enabled - Se a query deve ser executada
 * @returns Query com lista de disciplinas do curso
 */
export function useDisciplinesByCurso(codigo_Curso: number, enabled = true) {
  return useQuery({
    queryKey: disciplineKeys.byCurso(codigo_Curso),
    queryFn: () => disciplineService.getDisciplinesByCurso(codigo_Curso),
    enabled: enabled && !!codigo_Curso,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
  })
}

/**
 * Hook para buscar estatísticas das disciplinas
 * @param filters - Filtros opcionais (curso, status)
 * @param enabled - Se a query deve ser executada
 * @returns Query com estatísticas
 */
export function useDisciplineStatistics(
  filters: { codigo_Curso?: number; status?: string } = {},
  enabled = true
) {
  return useQuery({
    queryKey: disciplineKeys.statistics(filters),
    queryFn: () => disciplineService.getDisciplineStatistics(filters),
    enabled,
    staleTime: 1000 * 60 * 2, // Cache de 2 minutos para estatísticas
    gcTime: 1000 * 60 * 5,
    retry: 1,
  })
}

/**
 * Hook para criar uma nova disciplina
 * Invalida cache automaticamente após sucesso
 * @returns Mutation para criar disciplina
 */
export function useCreateDiscipline() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (disciplineData: IDisciplineInput) => 
      disciplineService.createDiscipline(disciplineData),
    
    onSuccess: () => {
      // Invalida todas as listas de disciplinas para refazer o fetch
      queryClient.invalidateQueries({ queryKey: disciplineKeys.lists() })
      queryClient.invalidateQueries({ queryKey: disciplineKeys.all })
      queryClient.invalidateQueries({ queryKey: disciplineKeys.statistics() })
      
      toast.success('Disciplina criada com sucesso!')
    },
    
    onError: (error: ApiError) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao criar disciplina'
      toast.error(errorMessage)
      console.error('Erro ao criar disciplina:', error)
    },
  })
}

/**
 * Hook para atualizar uma disciplina existente
 * Utiliza optimistic update para melhor UX
 * @returns Mutation para atualizar disciplina
 */
export function useUpdateDiscipline() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, disciplineData }: { id: number; disciplineData: Partial<IDisciplineInput> }) =>
      disciplineService.updateDiscipline(id, disciplineData),
    
    // Optimistic update - atualiza o cache antes da resposta do servidor
    onMutate: async (variables) => {
      // Cancela queries em andamento
      await queryClient.cancelQueries({ queryKey: disciplineKeys.detail(variables.id) })
      
      // Salva o valor anterior
      const previousDiscipline = queryClient.getQueryData(disciplineKeys.detail(variables.id))

      return { previousDiscipline }
    },
    
    onSuccess: (_, variables) => {
      // Invalida as listas
      queryClient.invalidateQueries({ queryKey: disciplineKeys.lists() })
      queryClient.invalidateQueries({ queryKey: disciplineKeys.all })
      queryClient.invalidateQueries({ queryKey: disciplineKeys.statistics() })
      queryClient.invalidateQueries({ queryKey: disciplineKeys.detail(variables.id) })
      
      toast.success('Disciplina atualizada com sucesso!')
    },
    
    onError: (error: ApiError, variables, context) => {
      // Reverte para o valor anterior em caso de erro
      if (context?.previousDiscipline) {
        queryClient.setQueryData(disciplineKeys.detail(variables.id), context.previousDiscipline)
      }
      
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao atualizar disciplina'
      toast.error(errorMessage)
      console.error('Erro ao atualizar disciplina:', error)
    },
  })
}

/**
 * Hook para atualizar o status de uma disciplina
 * @returns Mutation para atualizar status
 */
export function useUpdateDisciplineStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: number }) =>
      disciplineService.updateDisciplineStatus(id, status),
    
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: disciplineKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: disciplineKeys.lists() })
      queryClient.invalidateQueries({ queryKey: disciplineKeys.all })
      queryClient.invalidateQueries({ queryKey: disciplineKeys.statistics() })
      
      const statusMessage = variables.status === 0 ? 'desativada' : 'ativada'
      toast.success(`Disciplina ${statusMessage} com sucesso!`)
    },
    
    onError: (error: ApiError) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao atualizar status da disciplina'
      toast.error(errorMessage)
      console.error('Erro ao atualizar status da disciplina:', error)
    },
  })
}

/**
 * Hook para deletar uma disciplina
 * @returns Mutation para deletar disciplina
 */
export function useDeleteDiscipline() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => disciplineService.deleteDiscipline(id),
    
    onSuccess: (_, id: number) => {
      // Remove a disciplina específica do cache
      queryClient.removeQueries({ queryKey: disciplineKeys.detail(id) })
      
      // Invalida todas as listas
      queryClient.invalidateQueries({ queryKey: disciplineKeys.lists() })
      queryClient.invalidateQueries({ queryKey: disciplineKeys.all })
      queryClient.invalidateQueries({ queryKey: disciplineKeys.statistics() })
      
      toast.success('Disciplina deletada com sucesso!')
    },
    
    onError: (error: ApiError) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao deletar disciplina'
      toast.error(errorMessage)
      console.error('Erro ao deletar disciplina:', error)
    },
  })
}

/**
 * Hook combinado para gerenciar todas as operações de disciplinas
 * Útil quando você precisa de múltiplas operações em um componente
 * @param params - Parâmetros de paginação e filtros
 * @returns Objeto com todas as operações de disciplinas
 */
export function useDisciplinesManager(params: PaginationParams = { page: 1, limit: 10 }) {
  const disciplines = useDisciplines(params)
  const createDiscipline = useCreateDiscipline()
  const updateDiscipline = useUpdateDiscipline()
  const updateDisciplineStatus = useUpdateDisciplineStatus()
  const deleteDiscipline = useDeleteDiscipline()

  return {
    // Queries
    disciplines: disciplines.data?.data || [],
    pagination: disciplines.data?.pagination,
    isLoading: disciplines.isLoading,
    isError: disciplines.isError,
    error: disciplines.error,
    refetch: disciplines.refetch,

    // Mutations
    createDiscipline: createDiscipline.mutate,
    updateDiscipline: updateDiscipline.mutate,
    updateDisciplineStatus: updateDisciplineStatus.mutate,
    deleteDiscipline: deleteDiscipline.mutate,

    // Loading states
    isCreating: createDiscipline.isPending,
    isUpdating: updateDiscipline.isPending,
    isUpdatingStatus: updateDisciplineStatus.isPending,
    isDeleting: deleteDiscipline.isPending,

    // Async versions (para usar com async/await)
    createDisciplineAsync: createDiscipline.mutateAsync,
    updateDisciplineAsync: updateDiscipline.mutateAsync,
    updateDisciplineStatusAsync: updateDisciplineStatus.mutateAsync,
    deleteDisciplineAsync: deleteDiscipline.mutateAsync,
  }
}
