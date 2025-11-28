import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import anoLectivoService from '../services/anoLectivo.service'
import type {
  IAnoLectivoInput,
  PaginationParams,
} from '../types/anoLectivo.types'

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
export const anoLectivoKeys = {
  all: ['anosLectivos'] as const,
  lists: () => [...anoLectivoKeys.all, 'list'] as const,
  list: (params: PaginationParams) => [...anoLectivoKeys.lists(), params] as const,
  details: () => [...anoLectivoKeys.all, 'detail'] as const,
  detail: (id: number) => [...anoLectivoKeys.details(), id] as const,
  search: (filters: Record<string, unknown>) => [...anoLectivoKeys.all, 'search', filters] as const,
}

/**
 * Hook para buscar todos os anos letivos com paginação
 * Implementa cache automático e refetch otimizado
 */
export function useAnosLectivos(params: PaginationParams = { page: 1, limit: 10 }) {
  return useQuery({
    queryKey: anoLectivoKeys.list(params),
    queryFn: () => anoLectivoService.getAnosLectivos(params),
    staleTime: 1000 * 60 * 5, // Cache válido por 5 minutos
    gcTime: 1000 * 60 * 10, // Mantém no cache por 10 minutos
    retry: 2, // Tenta 2 vezes em caso de erro
    refetchOnWindowFocus: false, // Não refaz a query ao focar a janela
  })
}

/**
 * Hook para buscar um ano letivo específico por ID
 */
export function useAnoLectivo(id: number, enabled = true) {
  return useQuery({
    queryKey: anoLectivoKeys.detail(id),
    queryFn: () => anoLectivoService.getAnoLectivoById(id),
    enabled: enabled && !!id, // Só executa se enabled for true e id existir
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
  })
}

/**
 * Hook para criar um novo ano letivo
 * Invalida cache automaticamente após sucesso
 */
export function useCreateAnoLectivo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (anoLectivoData: IAnoLectivoInput) =>
      anoLectivoService.createAnoLectivo(anoLectivoData),
    
    onSuccess: (response) => {
      // Invalida todas as listas de anos letivos para refazer o fetch
      queryClient.invalidateQueries({ queryKey: anoLectivoKeys.lists() })
      
      toast.success(response.message || 'Ano letivo criado com sucesso!')
    },
    
    onError: (error: ApiError) => {
      const errorMessage = error?.response?.data?.message || 'Erro ao criar ano letivo'
      toast.error(errorMessage)
      console.error('Erro ao criar ano letivo:', error)
    },
  })
}

/**
 * Hook para atualizar um ano letivo existente
 * Utiliza optimistic update para melhor UX
 */
export function useUpdateAnoLectivo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, anoLectivoData }: { id: number; anoLectivoData: IAnoLectivoInput }) =>
      anoLectivoService.updateAnoLectivo(id, anoLectivoData),
    
    // Optimistic update - atualiza o cache antes da resposta do servidor
    onMutate: async ({ id, anoLectivoData }) => {
      // Cancela queries em andamento
      await queryClient.cancelQueries({ queryKey: anoLectivoKeys.detail(id) })

      // Salva o valor anterior
      const previousAnoLectivo = queryClient.getQueryData(anoLectivoKeys.detail(id))

      // Atualiza otimisticamente
      if (previousAnoLectivo) {
        queryClient.setQueryData(anoLectivoKeys.detail(id), (old: unknown) => {
          const oldData = old as { data: Record<string, unknown> }
          return {
            ...oldData,
            data: { ...oldData.data, ...anoLectivoData },
          }
        })
      }

      return { previousAnoLectivo }
    },
    
    onSuccess: (response, { id }) => {
      // Atualiza o cache com os dados reais do servidor
      queryClient.setQueryData(anoLectivoKeys.detail(id), response)
      
      // Invalida as listas
      queryClient.invalidateQueries({ queryKey: anoLectivoKeys.lists() })
      
      toast.success(response.message || 'Ano letivo atualizado com sucesso!')
    },
    
    onError: (error: ApiError, { id }, context) => {
      // Reverte para o valor anterior em caso de erro
      if (context?.previousAnoLectivo) {
        queryClient.setQueryData(anoLectivoKeys.detail(id), context.previousAnoLectivo)
      }
      
      const errorMessage = error?.response?.data?.message || 'Erro ao atualizar ano letivo'
      toast.error(errorMessage)
      console.error('Erro ao atualizar ano letivo:', error)
    },
    
    onSettled: (_, __, { id }) => {
      // Revalida a query após a operação
      queryClient.invalidateQueries({ queryKey: anoLectivoKeys.detail(id) })
    },
  })
}

/**
 * Hook para deletar um ano letivo
 */
export function useDeleteAnoLectivo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => anoLectivoService.deleteAnoLectivo(id),
    
    onSuccess: (response, id) => {
      // Remove o ano letivo específico do cache
      queryClient.removeQueries({ queryKey: anoLectivoKeys.detail(id) })
      
      // Invalida todas as listas
      queryClient.invalidateQueries({ queryKey: anoLectivoKeys.lists() })
      
      toast.success(response.message || 'Ano letivo deletado com sucesso!')
    },
    
    onError: (error: ApiError) => {
      const errorMessage = error?.response?.data?.message || 'Erro ao deletar ano letivo'
      toast.error(errorMessage)
    },
  })
}

/**
 * Hook para buscar anos letivos com filtros
 */
export function useSearchAnosLectivos(
  filters: { search?: string },
  params: PaginationParams = { page: 1, limit: 10 }
) {
  return useQuery({
    queryKey: anoLectivoKeys.search({ ...filters, ...params }),
    queryFn: () => anoLectivoService.searchAnosLectivos(filters, params),
    enabled: !!filters.search, // Só executa se houver filtro de busca
    staleTime: 1000 * 60 * 2, // Cache de 2 minutos para buscas
    gcTime: 1000 * 60 * 5,
  })
}

/**
 * Hook combinado para gerenciar todas as operações de anos letivos
 * Útil quando você precisa de múltiplas operações em um componente
 */
export function useAnosLectivosManager(params: PaginationParams = { page: 1, limit: 10 }) {
  const anosLectivos = useAnosLectivos(params)
  const createAnoLectivo = useCreateAnoLectivo()
  const updateAnoLectivo = useUpdateAnoLectivo()
  const deleteAnoLectivo = useDeleteAnoLectivo()

  return {
    // Queries
    anosLectivos: anosLectivos.data?.data || [],
    meta: anosLectivos.data?.meta,
    pagination: anosLectivos.data?.pagination,
    isLoading: anosLectivos.isLoading,
    isError: anosLectivos.isError,
    error: anosLectivos.error,
    refetch: anosLectivos.refetch,

    // Mutations
    createAnoLectivo: createAnoLectivo.mutate,
    updateAnoLectivo: updateAnoLectivo.mutate,
    deleteAnoLectivo: deleteAnoLectivo.mutate,

    // Loading states
    isCreating: createAnoLectivo.isPending,
    isUpdating: updateAnoLectivo.isPending,
    isDeleting: deleteAnoLectivo.isPending,

    // Async versions (para usar com async/await)
    createAnoLectivoAsync: createAnoLectivo.mutateAsync,
    updateAnoLectivoAsync: updateAnoLectivo.mutateAsync,
    deleteAnoLectivoAsync: deleteAnoLectivo.mutateAsync,
  }
}
