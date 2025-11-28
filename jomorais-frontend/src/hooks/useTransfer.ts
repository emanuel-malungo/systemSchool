import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import transferService from '../services/transfer.service'
import type { ITransfer, ITransferInput } from '../types/transfer.types'

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
  motivo?: string | null
}

// Chaves de cache para o React Query
export const transferKeys = {
  all: ['transfers'] as const,
  lists: () => [...transferKeys.all, 'list'] as const,
  list: (params: PaginationParams) => [...transferKeys.lists(), params] as const,
  details: () => [...transferKeys.all, 'detail'] as const,
  detail: (id: number) => [...transferKeys.details(), id] as const,
  statistics: (filters: Record<string, unknown>) => [...transferKeys.all, 'statistics', filters] as const,
  byStudent: (alunoId: number) => [...transferKeys.all, 'student', alunoId] as const,
}

/**
 * Hook para buscar todas as transferências com paginação e filtros
 */
export function useTransfers(params: PaginationParams = { page: 1, limit: 10 }) {
  return useQuery({
    queryKey: transferKeys.list(params),
    queryFn: () => transferService.getTransfers(params),
    staleTime: 1000 * 60 * 5, // Cache válido por 5 minutos
    gcTime: 1000 * 60 * 10,
    retry: 2,
    refetchOnWindowFocus: false,
  })
}

/**
 * Hook para buscar uma transferência específica por ID
 */
export function useTransfer(id: number, enabled = true) {
  return useQuery({
    queryKey: transferKeys.detail(id),
    queryFn: () => transferService.getTransferById(id),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
  })
}

/**
 * Hook para buscar transferências por aluno
 */
export function useTransfersByStudent(alunoId: number, enabled = true) {
  return useQuery({
    queryKey: transferKeys.byStudent(alunoId),
    queryFn: () => transferService.getTransfersByStudent(alunoId),
    enabled: enabled && !!alunoId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
  })
}

/**
 * Hook para buscar estatísticas das transferências
 */
export function useTransferStatistics(
  filters: { motivo?: string | null; startDate?: string; endDate?: string } = {}
) {
  return useQuery({
    queryKey: transferKeys.statistics(filters),
    queryFn: () => transferService.getTransfersStatistics(filters),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
    retry: 1,
  })
}

/**
 * Hook para criar uma nova transferência
 */
export function useCreateTransfer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (transferData: ITransferInput) =>
      transferService.createTransfer(transferData),
    
    onSuccess: (response) => {
      const typedResponse = response as { message?: string; data: ITransfer }
      queryClient.invalidateQueries({ queryKey: transferKeys.lists() })
      queryClient.invalidateQueries({ queryKey: transferKeys.all })
      
      toast.success(typedResponse.message || 'Transferência criada com sucesso!')
    },
    
    onError: (error) => {
      const typedError = error as ApiError
      const errorMessage = typedError?.response?.data?.message || 'Erro ao criar transferência'
      toast.error(errorMessage)
      console.error('Erro ao criar transferência:', typedError)
    },
  })
}

/**
 * Hook para criar múltiplas transferências em lote
 */
export function useBatchTransfer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (transfers: ITransferInput[]) =>
      transferService.batchTransfer(transfers),
    
    onSuccess: (response) => {
      const typedResponse = response as { message?: string; data: ITransfer[] }
      queryClient.invalidateQueries({ queryKey: transferKeys.lists() })
      queryClient.invalidateQueries({ queryKey: transferKeys.all })
      
      toast.success(
        typedResponse.message || `${typedResponse.data.length} transferência(s) criada(s) com sucesso!`
      )
    },
    
    onError: (error) => {
      const typedError = error as ApiError
      const errorMessage = typedError?.response?.data?.message || 'Erro ao criar transferências em lote'
      toast.error(errorMessage)
      console.error('Erro ao criar transferências em lote:', typedError)
    },
  })
}

/**
 * Hook para atualizar uma transferência existente
 */
export function useUpdateTransfer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, transferData }: { id: number; transferData: Partial<ITransferInput> }) =>
      transferService.updateTransfer(id, transferData),
    
    // Optimistic update
    onMutate: async ({ id, transferData }) => {
      await queryClient.cancelQueries({ queryKey: transferKeys.detail(id) })
      const previousTransfer = queryClient.getQueryData(transferKeys.detail(id))

      if (previousTransfer) {
        queryClient.setQueryData(transferKeys.detail(id), (old: unknown) => {
          const oldData = old as { data: Record<string, unknown> }
          return {
            ...oldData,
            data: { ...oldData.data, ...transferData },
          }
        })
      }

      return { previousTransfer }
    },
    
    onSuccess: (response, { id }) => {
      const typedResponse = response as { message?: string; data: ITransfer }
      queryClient.setQueryData(transferKeys.detail(id), typedResponse)
      queryClient.invalidateQueries({ queryKey: transferKeys.lists() })
      
      toast.success(typedResponse.message || 'Transferência atualizada com sucesso!')
    },
    
    onError: (error, { id }, context) => {
      const typedError = error as ApiError
      if (context?.previousTransfer) {
        queryClient.setQueryData(transferKeys.detail(id), context.previousTransfer)
      }
      
      const errorMessage = typedError?.response?.data?.message || 'Erro ao atualizar transferência'
      toast.error(errorMessage)
      console.error('Erro ao atualizar transferência:', typedError)
    },
    
    onSettled: (_, __, { id }) => {
      queryClient.invalidateQueries({ queryKey: transferKeys.detail(id) })
    },
  })
}

/**
 * Hook para deletar uma transferência
 */
export function useDeleteTransfer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => transferService.deleteTransfer(id),
    
    onSuccess: (response, id) => {
      const typedResponse = response as { message?: string }
      queryClient.removeQueries({ queryKey: transferKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: transferKeys.lists() })
      
      toast.success(typedResponse.message || 'Transferência deletada com sucesso!')
    },
    
    onError: (error) => {
      const typedError = error as ApiError
      const errorMessage = typedError?.response?.data?.message || 'Erro ao deletar transferência'
      toast.error(errorMessage)
      console.error('Erro ao deletar transferência:', typedError)
    },
  })
}

/**
 * Hook combinado para gerenciar todas as operações de transferências
 */
export function useTransfersManager(params: PaginationParams = { page: 1, limit: 10 }) {
  const transfers = useTransfers(params)
  const createTransfer = useCreateTransfer()
  const batchTransfer = useBatchTransfer()
  const updateTransfer = useUpdateTransfer()
  const deleteTransfer = useDeleteTransfer()

  return {
    // Queries
    transfers: transfers.data?.data || [],
    pagination: transfers.data?.pagination,
    isLoading: transfers.isLoading,
    isError: transfers.isError,
    error: transfers.error,
    refetch: transfers.refetch,

    // Mutations
    createTransfer: createTransfer.mutate,
    batchTransfer: batchTransfer.mutate,
    updateTransfer: updateTransfer.mutate,
    deleteTransfer: deleteTransfer.mutate,

    // Loading states
    isCreating: createTransfer.isPending,
    isBatching: batchTransfer.isPending,
    isUpdating: updateTransfer.isPending,
    isDeleting: deleteTransfer.isPending,

    // Async versions
    createTransferAsync: createTransfer.mutateAsync,
    batchTransferAsync: batchTransfer.mutateAsync,
    updateTransferAsync: updateTransfer.mutateAsync,
    deleteTransferAsync: deleteTransfer.mutateAsync,
  }
}
