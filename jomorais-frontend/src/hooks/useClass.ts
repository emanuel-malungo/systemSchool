import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import classService from '../services/class.service'
import type { IClassInput } from '../types/class.types'
import type { PaginationParams } from '../services/class.service'

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
export const classKeys = {
  all: ['classes'] as const,
  lists: () => [...classKeys.all, 'list'] as const,
  list: (params: PaginationParams) => [...classKeys.lists(), params] as const,
  details: () => [...classKeys.all, 'detail'] as const,
  detail: (id: number) => [...classKeys.details(), id] as const,
  complete: (search?: string) => [...classKeys.all, 'complete', search] as const,
  statistics: (filters?: { status?: string }) => 
    [...classKeys.all, 'statistics', filters] as const,
}

/**
 * Hook para buscar todas as classes com paginação e filtros
 * Implementa cache automático e refetch otimizado
 * @param params - Parâmetros de paginação e filtros
 * @returns Query com lista paginada de classes
 */
export function useClasses(params: PaginationParams = { page: 1, limit: 10 }) {
  return useQuery({
    queryKey: classKeys.list(params),
    queryFn: () => classService.getClasses(params),
    staleTime: 1000 * 60 * 5, // Cache válido por 5 minutos
    gcTime: 1000 * 60 * 10, // Mantém no cache por 10 minutos
    retry: 2, // Tenta 2 vezes em caso de erro
    refetchOnWindowFocus: false, // Não refaz a query ao focar a janela
  })
}

/**
 * Hook para buscar todas as classes sem paginação (para selects)
 * Útil para dropdowns e operações que precisam de todos os dados
 * @param search - Termo de busca opcional
 * @param enabled - Se a query deve ser executada
 * @returns Query com lista completa de classes
 */
export function useClassesComplete(search = '', enabled = true) {
  return useQuery({
    queryKey: classKeys.complete(search),
    queryFn: () => classService.getAllClasses(search),
    enabled,
    staleTime: 1000 * 60 * 30, // Cache válido por 30 minutos (dados muito estáveis)
    gcTime: 1000 * 60 * 60, // Mantém no cache por 1 hora
    retry: 1, // Reduzir tentativas
    refetchOnWindowFocus: false, // Não refazer ao focar janela
    refetchOnMount: false, // Não refazer ao montar se há cache válido
  })
}

/**
 * Hook para buscar uma classe específica por ID
 * @param id - ID da classe
 * @param enabled - Se a query deve ser executada
 * @returns Query com dados da classe
 */
export function useClass(id: number, enabled = true) {
  return useQuery({
    queryKey: classKeys.detail(id),
    queryFn: () => classService.getClassById(id),
    enabled: enabled && !!id, // Só executa se enabled for true e id existir
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
  })
}

/**
 * Hook para buscar estatísticas das classes
 * @param filters - Filtros opcionais (status)
 * @param enabled - Se a query deve ser executada
 * @returns Query com estatísticas
 */
export function useClassStatistics(
  filters: { status?: string } = {},
  enabled = true
) {
  return useQuery({
    queryKey: classKeys.statistics(filters),
    queryFn: () => classService.getClassStatistics(filters),
    enabled,
    staleTime: 1000 * 60 * 2, // Cache de 2 minutos para estatísticas
    gcTime: 1000 * 60 * 5,
    retry: 1,
  })
}

/**
 * Hook para criar uma nova classe
 * Invalida cache automaticamente após sucesso
 * @returns Mutation para criar classe
 */
export function useCreateClass() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (classData: IClassInput) => 
      classService.createClass(classData),
    
    onSuccess: () => {
      // Invalida todas as listas de classes para refazer o fetch
      queryClient.invalidateQueries({ queryKey: classKeys.lists() })
      queryClient.invalidateQueries({ queryKey: classKeys.all })
      queryClient.invalidateQueries({ queryKey: classKeys.statistics() })
      
      toast.success('Classe criada com sucesso!')
    },
    
    onError: (error: ApiError) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao criar classe'
      toast.error(errorMessage)
      console.error('Erro ao criar classe:', error)
    },
  })
}

/**
 * Hook para atualizar uma classe existente
 * Utiliza optimistic update para melhor UX
 * @returns Mutation para atualizar classe
 */
export function useUpdateClass() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, classData }: { id: number; classData: Partial<IClassInput> }) =>
      classService.updateClass(id, classData),
    
    // Optimistic update - atualiza o cache antes da resposta do servidor
    onMutate: async (variables) => {
      // Cancela queries em andamento
      await queryClient.cancelQueries({ queryKey: classKeys.detail(variables.id) })
      
      // Salva o valor anterior
      const previousClass = queryClient.getQueryData(classKeys.detail(variables.id))

      return { previousClass }
    },
    
    onSuccess: (_, variables) => {
      // Invalida as listas
      queryClient.invalidateQueries({ queryKey: classKeys.lists() })
      queryClient.invalidateQueries({ queryKey: classKeys.all })
      queryClient.invalidateQueries({ queryKey: classKeys.statistics() })
      queryClient.invalidateQueries({ queryKey: classKeys.detail(variables.id) })
      
      toast.success('Classe atualizada com sucesso!')
    },
    
    onError: (error: ApiError, variables, context) => {
      // Reverte para o valor anterior em caso de erro
      if (context?.previousClass) {
        queryClient.setQueryData(classKeys.detail(variables.id), context.previousClass)
      }
      
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao atualizar classe'
      toast.error(errorMessage)
      console.error('Erro ao atualizar classe:', error)
    },
  })
}

/**
 * Hook para atualizar o status de uma classe
 * @returns Mutation para atualizar status
 */
export function useUpdateClassStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: number }) =>
      classService.updateClassStatus(id, status),
    
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: classKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: classKeys.lists() })
      queryClient.invalidateQueries({ queryKey: classKeys.all })
      queryClient.invalidateQueries({ queryKey: classKeys.statistics() })
      
      const statusMessage = variables.status === 0 ? 'desativada' : 'ativada'
      toast.success(`Classe ${statusMessage} com sucesso!`)
    },
    
    onError: (error: ApiError) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao atualizar status da classe'
      toast.error(errorMessage)
      console.error('Erro ao atualizar status da classe:', error)
    },
  })
}

/**
 * Hook para deletar uma classe
 * @returns Mutation para deletar classe
 */
export function useDeleteClass() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => classService.deleteClass(id),
    
    onSuccess: (_, id: number) => {
      // Remove a classe específica do cache
      queryClient.removeQueries({ queryKey: classKeys.detail(id) })
      
      // Invalida todas as listas
      queryClient.invalidateQueries({ queryKey: classKeys.lists() })
      queryClient.invalidateQueries({ queryKey: classKeys.all })
      queryClient.invalidateQueries({ queryKey: classKeys.statistics() })
      
      toast.success('Classe deletada com sucesso!')
    },
    
    onError: (error: ApiError) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao deletar classe'
      toast.error(errorMessage)
      console.error('Erro ao deletar classe:', error)
    },
  })
}

/**
 * Hook combinado para gerenciar todas as operações de classes
 * Útil quando você precisa de múltiplas operações em um componente
 * @param params - Parâmetros de paginação e filtros
 * @returns Objeto com todas as operações de classes
 */
export function useClassesManager(params: PaginationParams = { page: 1, limit: 10 }) {
  const classes = useClasses(params)
  const createClass = useCreateClass()
  const updateClass = useUpdateClass()
  const updateClassStatus = useUpdateClassStatus()
  const deleteClass = useDeleteClass()

  return {
    // Queries
    classes: classes.data?.data || [],
    pagination: classes.data?.pagination,
    isLoading: classes.isLoading,
    isError: classes.isError,
    error: classes.error,
    refetch: classes.refetch,

    // Mutations
    createClass: createClass.mutate,
    updateClass: updateClass.mutate,
    updateClassStatus: updateClassStatus.mutate,
    deleteClass: deleteClass.mutate,

    // Loading states
    isCreating: createClass.isPending,
    isUpdating: updateClass.isPending,
    isUpdatingStatus: updateClassStatus.isPending,
    isDeleting: deleteClass.isPending,

    // Async versions (para usar com async/await)
    createClassAsync: createClass.mutateAsync,
    updateClassAsync: updateClass.mutateAsync,
    updateClassStatusAsync: updateClassStatus.mutateAsync,
    deleteClassAsync: deleteClass.mutateAsync,
  }
}
