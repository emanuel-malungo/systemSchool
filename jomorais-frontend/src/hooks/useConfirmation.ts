import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import confirmationService from '../services/confirmation.service'
import type { IConfirmation, IConfirmationInput } from '../types/confirmation.types'

// Tipo para erros da API
interface ApiError {
  response?: {
    data?: {
      message?: string
    }
  }
  message?: string
}

// Parâmetros de paginação
interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  status?: string | null
  anoLectivo?: string | null
}

// Chaves de cache para o React Query
export const confirmationKeys = {
  all: ['confirmations'] as const,
  lists: () => [...confirmationKeys.all, 'list'] as const,
  list: (params: PaginationParams) => [...confirmationKeys.lists(), params] as const,
  details: () => [...confirmationKeys.all, 'detail'] as const,
  detail: (id: number) => [...confirmationKeys.details(), id] as const,
  statistics: (filters: Record<string, unknown>) => [...confirmationKeys.all, 'statistics', filters] as const,
  byClassAndYear: (turmaId: number, anoLectivoId: number) => 
    [...confirmationKeys.all, 'class-year', turmaId, anoLectivoId] as const,
}

/**
 * Hook para buscar todas as confirmações com paginação e filtros
 */
export function useConfirmations(params: PaginationParams = { page: 1, limit: 10 }) {
  return useQuery({
    queryKey: confirmationKeys.list(params),
    queryFn: () => confirmationService.getConfirmations(params),
    staleTime: 1000 * 60 * 5, // Cache válido por 5 minutos
    gcTime: 1000 * 60 * 10,
    retry: 2,
    refetchOnWindowFocus: false,
  })
}

/**
 * Hook para buscar uma confirmação específica por ID
 */
export function useConfirmation(id: number, enabled = true) {
  return useQuery({
    queryKey: confirmationKeys.detail(id),
    queryFn: () => confirmationService.getConfirmationById(id),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
  })
}

/**
 * Hook para buscar confirmações por turma e ano letivo
 */
export function useConfirmationsByClassAndYear(
  turmaId: number,
  anoLectivoId: number,
  enabled = true
) {
  return useQuery({
    queryKey: confirmationKeys.byClassAndYear(turmaId, anoLectivoId),
    queryFn: () => confirmationService.getConfirmationsByClassAndYear(turmaId, anoLectivoId),
    enabled: enabled && !!turmaId && !!anoLectivoId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
  })
}

/**
 * Hook para buscar estatísticas das confirmações
 */
export function useConfirmationStatistics(
  filters: { status?: string | null; anoLectivo?: string | null } = {}
) {
  return useQuery({
    queryKey: confirmationKeys.statistics(filters),
    queryFn: () => confirmationService.getConfirmationsStatistics(filters),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
    retry: 1,
  })
}

/**
 * Hook para criar uma nova confirmação
 */
export function useCreateConfirmation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (confirmationData: IConfirmationInput) =>
      confirmationService.createConfirmation(confirmationData),
    
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: confirmationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: confirmationKeys.all })
      
      toast.success(response.message || 'Confirmação criada com sucesso!')
    },
    
    onError: (error: ApiError) => {
      const errorMessage = error?.response?.data?.message || 'Erro ao criar confirmação'
      toast.error(errorMessage)
      console.error('Erro ao criar confirmação:', error)
    },
  })
}

/**
 * Hook para criar múltiplas confirmações em lote
 */
export function useBatchConfirmation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (confirmations: IConfirmationInput[]) =>
      confirmationService.batchConfirmation(confirmations),
    
    onSuccess: (response: { message?: string; data: IConfirmation[] }) => {
      queryClient.invalidateQueries({ queryKey: confirmationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: confirmationKeys.all })
      
      toast.success(
        response.message || `${response.data.length} confirmação(ões) criada(s) com sucesso!`
      )
    },
    
    onError: (error: ApiError) => {
      const errorMessage = error?.response?.data?.message || 'Erro ao criar confirmações em lote'
      toast.error(errorMessage)
      console.error('Erro ao criar confirmações em lote:', error)
    },
  })
}

/**
 * Hook para atualizar uma confirmação existente
 */
export function useUpdateConfirmation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, confirmationData }: { id: number; confirmationData: Partial<IConfirmationInput> }) =>
      confirmationService.updateConfirmation(id, confirmationData),
    
    // Optimistic update
    onMutate: async ({ id, confirmationData }) => {
      await queryClient.cancelQueries({ queryKey: confirmationKeys.detail(id) })
      const previousConfirmation = queryClient.getQueryData(confirmationKeys.detail(id))

      if (previousConfirmation) {
        queryClient.setQueryData(confirmationKeys.detail(id), (old: unknown) => {
          const oldData = old as { data: Record<string, unknown> }
          return {
            ...oldData,
            data: { ...oldData.data, ...confirmationData },
          }
        })
      }

      return { previousConfirmation }
    },
    
    onSuccess: (response, { id }) => {
      const typedResponse = response as { message?: string; data: IConfirmation }
      queryClient.setQueryData(confirmationKeys.detail(id), typedResponse)
      queryClient.invalidateQueries({ queryKey: confirmationKeys.lists() })
      
      toast.success(typedResponse.message || 'Confirmação atualizada com sucesso!')
    },
    
    onError: (error, { id }, context) => {
      const typedError = error as ApiError
      if (context?.previousConfirmation) {
        queryClient.setQueryData(confirmationKeys.detail(id), context.previousConfirmation)
      }
      
      const errorMessage = typedError?.response?.data?.message || 'Erro ao atualizar confirmação'
      toast.error(errorMessage)
      console.error('Erro ao atualizar confirmação:', typedError)
    },
    
    onSettled: (_, __, { id }) => {
      queryClient.invalidateQueries({ queryKey: confirmationKeys.detail(id) })
    },
  })
}

/**
 * Hook para deletar uma confirmação
 */
export function useDeleteConfirmation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => confirmationService.deleteConfirmation(id),
    
    onSuccess: (response, id) => {
      const typedResponse = response as { message?: string }
      queryClient.removeQueries({ queryKey: confirmationKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: confirmationKeys.lists() })
      
      toast.success(typedResponse.message || 'Confirmação deletada com sucesso!')
    },
    
    onError: (error) => {
      const typedError = error as ApiError
      const errorMessage = typedError?.response?.data?.message || 'Erro ao deletar confirmação'
      toast.error(errorMessage)
      console.error('Erro ao deletar confirmação:', typedError)
    },
  })
}

/**
 * Hook combinado para gerenciar todas as operações de confirmações
 */
export function useConfirmationsManager(params: PaginationParams = { page: 1, limit: 10 }) {
  const confirmations = useConfirmations(params)
  const createConfirmation = useCreateConfirmation()
  const batchConfirmation = useBatchConfirmation()
  const updateConfirmation = useUpdateConfirmation()
  const deleteConfirmation = useDeleteConfirmation()

  return {
    // Queries
    confirmations: confirmations.data?.data || [],
    pagination: confirmations.data?.pagination,
    isLoading: confirmations.isLoading,
    isError: confirmations.isError,
    error: confirmations.error,
    refetch: confirmations.refetch,

    // Mutations
    createConfirmation: createConfirmation.mutate,
    batchConfirmation: batchConfirmation.mutate,
    updateConfirmation: updateConfirmation.mutate,
    deleteConfirmation: deleteConfirmation.mutate,

    // Loading states
    isCreating: createConfirmation.isPending,
    isBatching: batchConfirmation.isPending,
    isUpdating: updateConfirmation.isPending,
    isDeleting: deleteConfirmation.isPending,

    // Async versions
    createConfirmationAsync: createConfirmation.mutateAsync,
    batchConfirmationAsync: batchConfirmation.mutateAsync,
    updateConfirmationAsync: updateConfirmation.mutateAsync,
    deleteConfirmationAsync: deleteConfirmation.mutateAsync,
  }
}
