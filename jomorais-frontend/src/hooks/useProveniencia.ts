import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import provenienciaService from '../services/proveniencia.service'
import type { 
  Proveniencia, 
  CreateProvenienciaPayload, 
  UpdateProvenienciaPayload,
  PaginationParams 
} from '../types/proveniencia.types'

// Tipo para erros da API
interface ApiError {
  response?: {
    data?: {
      message?: string
    }
  }
  message?: string
}

// Chaves de cache para o React Query
export const provenienciaKeys = {
  all: ['proveniencias'] as const,
  lists: () => [...provenienciaKeys.all, 'list'] as const,
  list: (params: PaginationParams) => [...provenienciaKeys.lists(), params] as const,
  details: () => [...provenienciaKeys.all, 'detail'] as const,
  detail: (id: number) => [...provenienciaKeys.details(), id] as const,
  complete: () => [...provenienciaKeys.all, 'complete'] as const,
}

/**
 * Hook para buscar todas as proveniências com paginação e filtros
 */
export function useProveniencias(params: PaginationParams = { page: 1, limit: 10 }) {
  return useQuery({
    queryKey: provenienciaKeys.list(params),
    queryFn: () => provenienciaService.getAllProveniencias(params),
    staleTime: 1000 * 60 * 5, // Cache válido por 5 minutos
    gcTime: 1000 * 60 * 10,
    retry: 2,
    refetchOnWindowFocus: false,
  })
}

/**
 * Hook para buscar todas as proveniências sem paginação (para selects)
 */
export function useProvenienciasComplete(enabled = true) {
  return useQuery({
    queryKey: provenienciaKeys.complete(),
    queryFn: () => provenienciaService.getAllProvenienciasComplete(),
    enabled,
    staleTime: 1000 * 60 * 10, // Cache válido por 10 minutos (dados mais estáveis)
    gcTime: 1000 * 60 * 30,
    retry: 2,
  })
}

/**
 * Hook para buscar uma proveniência específica por ID
 */
export function useProveniencia(id: number, enabled = true) {
  return useQuery({
    queryKey: provenienciaKeys.detail(id),
    queryFn: () => provenienciaService.getProvenienciaById(id),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
  })
}

/**
 * Hook para criar uma nova proveniência
 */
export function useCreateProveniencia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateProvenienciaPayload) =>
      provenienciaService.createProveniencia(data),
    
    onSuccess: (response) => {
      const typedResponse = response as { message?: string; data: Proveniencia }
      queryClient.invalidateQueries({ queryKey: provenienciaKeys.lists() })
      queryClient.invalidateQueries({ queryKey: provenienciaKeys.complete() })
      
      toast.success(typedResponse.message || 'Proveniência criada com sucesso!')
    },
    
    onError: (error) => {
      const typedError = error as ApiError
      const errorMessage = typedError?.response?.data?.message || 'Erro ao criar proveniência'
      toast.error(errorMessage)
      console.error('Erro ao criar proveniência:', typedError)
    },
  })
}

/**
 * Hook para atualizar uma proveniência existente
 */
export function useUpdateProveniencia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProvenienciaPayload }) =>
      provenienciaService.updateProveniencia(id, data),
    
    // Optimistic update
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: provenienciaKeys.detail(id) })
      const previousProveniencia = queryClient.getQueryData(provenienciaKeys.detail(id))

      if (previousProveniencia) {
        queryClient.setQueryData(provenienciaKeys.detail(id), (old: unknown) => {
          const oldData = old as { data: Record<string, unknown> }
          return {
            ...oldData,
            data: { ...oldData.data, ...data },
          }
        })
      }

      return { previousProveniencia }
    },
    
    onSuccess: (response, { id }) => {
      const typedResponse = response as { message?: string; data: Proveniencia }
      queryClient.setQueryData(provenienciaKeys.detail(id), typedResponse)
      queryClient.invalidateQueries({ queryKey: provenienciaKeys.lists() })
      queryClient.invalidateQueries({ queryKey: provenienciaKeys.complete() })
      
      toast.success(typedResponse.message || 'Proveniência atualizada com sucesso!')
    },
    
    onError: (error, { id }, context) => {
      const typedError = error as ApiError
      if (context?.previousProveniencia) {
        queryClient.setQueryData(provenienciaKeys.detail(id), context.previousProveniencia)
      }
      
      const errorMessage = typedError?.response?.data?.message || 'Erro ao atualizar proveniência'
      toast.error(errorMessage)
      console.error('Erro ao atualizar proveniência:', typedError)
    },
    
    onSettled: (_, __, { id }) => {
      queryClient.invalidateQueries({ queryKey: provenienciaKeys.detail(id) })
    },
  })
}

/**
 * Hook para deletar uma proveniência
 */
export function useDeleteProveniencia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => provenienciaService.deleteProveniencia(id),
    
    onSuccess: (response, id) => {
      const typedResponse = response as { message?: string }
      queryClient.removeQueries({ queryKey: provenienciaKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: provenienciaKeys.lists() })
      queryClient.invalidateQueries({ queryKey: provenienciaKeys.complete() })
      
      toast.success(typedResponse.message || 'Proveniência deletada com sucesso!')
    },
    
    onError: (error) => {
      const typedError = error as ApiError
      const errorMessage = typedError?.response?.data?.message || 'Erro ao deletar proveniência'
      toast.error(errorMessage)
      console.error('Erro ao deletar proveniência:', typedError)
    },
  })
}

/**
 * Hook combinado para gerenciar todas as operações de proveniências
 */
export function useProvenienciasManager(params: PaginationParams = { page: 1, limit: 10 }) {
  const proveniencias = useProveniencias(params)
  const createProveniencia = useCreateProveniencia()
  const updateProveniencia = useUpdateProveniencia()
  const deleteProveniencia = useDeleteProveniencia()

  return {
    // Queries
    proveniencias: proveniencias.data?.data || [],
    pagination: proveniencias.data?.pagination,
    isLoading: proveniencias.isLoading,
    isError: proveniencias.isError,
    error: proveniencias.error,
    refetch: proveniencias.refetch,

    // Mutations
    createProveniencia: createProveniencia.mutate,
    updateProveniencia: updateProveniencia.mutate,
    deleteProveniencia: deleteProveniencia.mutate,

    // Loading states
    isCreating: createProveniencia.isPending,
    isUpdating: updateProveniencia.isPending,
    isDeleting: deleteProveniencia.isPending,

    // Async versions
    createProvenienciaAsync: createProveniencia.mutateAsync,
    updateProvenienciaAsync: updateProveniencia.mutateAsync,
    deleteProvenienciaAsync: deleteProveniencia.mutateAsync,
  }
}
