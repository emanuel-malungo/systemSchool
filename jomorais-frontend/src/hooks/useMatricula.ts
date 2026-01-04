import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import matriculaService from '../services/matricula.service'
import type {
  IMatriculaInput,
  PaginationParams,
} from '../types/matricula.types'

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
export const matriculaKeys = {
  all: ['matriculas'] as const,
  lists: () => [...matriculaKeys.all, 'list'] as const,
  list: (params: PaginationParams) => [...matriculaKeys.lists(), params] as const,
  details: () => [...matriculaKeys.all, 'detail'] as const,
  detail: (id: number) => [...matriculaKeys.details(), id] as const,
  statistics: (filters: Record<string, unknown>) => [...matriculaKeys.all, 'statistics', filters] as const,
  byAnoLectivo: (anoLectivoId: number) => [...matriculaKeys.all, 'ano-lectivo', anoLectivoId] as const,
  withoutConfirmation: () => [...matriculaKeys.all, 'without-confirmation'] as const,
}

/**
 * Hook para buscar todas as matrículas com paginação e filtros
 */
export function useMatriculas(params: PaginationParams = { page: 1, limit: 10 }) {
  return useQuery({
    queryKey: matriculaKeys.list(params),
    queryFn: () => matriculaService.getMatriculas(params),
    staleTime: 1000 * 60 * 5, // Cache válido por 5 minutos
    gcTime: 1000 * 60 * 10,
    retry: 2,
    refetchOnWindowFocus: false,
  })
}

/**
 * Hook para buscar uma matrícula específica por ID
 */
export function useMatricula(id: number, enabled = true) {
  return useQuery({
    queryKey: matriculaKeys.detail(id),
    queryFn: () => matriculaService.getMatriculaById(id),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
  })
}

/**
 * Hook para buscar matrículas por ano letivo
 */
export function useMatriculasByAnoLectivo(anoLectivoId: number, enabled = true) {
  return useQuery({
    queryKey: matriculaKeys.byAnoLectivo(anoLectivoId),
    queryFn: () => matriculaService.getMatriculasByAnoLectivo(anoLectivoId),
    enabled: enabled && !!anoLectivoId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
  })
}

/**
 * Hook para buscar matrículas sem confirmação
 */
export function useMatriculasWithoutConfirmation(enabled = true) {
  return useQuery({
    queryKey: matriculaKeys.withoutConfirmation(),
    queryFn: () => matriculaService.getMatriculasWithoutConfirmacao(),
    enabled,
    staleTime: 1000 * 60 * 2, // Cache de 2 minutos
    gcTime: 1000 * 60 * 5,
    retry: 1,
  })
}

/**
 * Hook para buscar estatísticas das matrículas
 */
export function useMatriculaStatistics(
  filters: { status?: string | null; curso?: string | null } = {}
) {
  return useQuery({
    queryKey: matriculaKeys.statistics(filters),
    queryFn: () => matriculaService.getMatriculasStatistics(filters),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
    retry: 1,
  })
}

/**
 * Hook para criar uma nova matrícula
 */
export function useCreateMatricula() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (matriculaData: IMatriculaInput) =>
      matriculaService.createMatricula(matriculaData),
    
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: matriculaKeys.lists() })
      queryClient.invalidateQueries({ queryKey: matriculaKeys.withoutConfirmation() })
      queryClient.invalidateQueries({ queryKey: matriculaKeys.all })
      
      toast.success(response.message || 'Matrícula criada com sucesso!')
    },
    
    onError: (error: ApiError) => {
      const errorMessage = error?.response?.data?.message || 'Erro ao criar matrícula'
      toast.error(errorMessage)
      console.error('Erro ao criar matrícula:', error)
    },
  })
}

/**
 * Hook para criar múltiplas matrículas em lote
 */
export function useBatchMatricula() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (matriculas: IMatriculaInput[]) =>
      matriculaService.batchMatricula(matriculas),
    
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: matriculaKeys.lists() })
      queryClient.invalidateQueries({ queryKey: matriculaKeys.withoutConfirmation() })
      queryClient.invalidateQueries({ queryKey: matriculaKeys.all })
      
      const { summary } = response.data
      toast.success(
        `${summary.success} matrícula(s) criada(s) com sucesso! ${
          summary.failed > 0 ? `${summary.failed} falharam.` : ''
        }`
      )
    },
    
    onError: (error: ApiError) => {
      const errorMessage = error?.response?.data?.message || 'Erro ao criar matrículas em lote'
      toast.error(errorMessage)
      console.error('Erro ao criar matrículas em lote:', error)
    },
  })
}

/**
 * Hook para atualizar uma matrícula existente
 */
export function useUpdateMatricula() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, matriculaData }: { id: number; matriculaData: Partial<IMatriculaInput> }) =>
      matriculaService.updateMatricula(id, matriculaData),
    
    // Optimistic update
    onMutate: async ({ id, matriculaData }) => {
      await queryClient.cancelQueries({ queryKey: matriculaKeys.detail(id) })
      const previousMatricula = queryClient.getQueryData(matriculaKeys.detail(id))

      if (previousMatricula) {
        queryClient.setQueryData(matriculaKeys.detail(id), (old: unknown) => {
          const oldData = old as { data: Record<string, unknown> }
          return {
            ...oldData,
            data: { ...oldData.data, ...matriculaData },
          }
        })
      }

      return { previousMatricula }
    },
    
    onSuccess: (response, { id }) => {
      queryClient.setQueryData(matriculaKeys.detail(id), response)
      queryClient.invalidateQueries({ queryKey: matriculaKeys.lists() })
      
      toast.success(response.message || 'Matrícula atualizada com sucesso!')
    },
    
    onError: (error: ApiError, { id }, context) => {
      if (context?.previousMatricula) {
        queryClient.setQueryData(matriculaKeys.detail(id), context.previousMatricula)
      }
      
      const errorMessage = error?.response?.data?.message || 'Erro ao atualizar matrícula'
      toast.error(errorMessage)
      console.error('Erro ao atualizar matrícula:', error)
    },
    
    onSettled: (_, __, { id }) => {
      queryClient.invalidateQueries({ queryKey: matriculaKeys.detail(id) })
    },
  })
}

/**
 * Hook para deletar uma matrícula
 */
export function useDeleteMatricula() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => matriculaService.deleteMatricula(id),
    
    onSuccess: (response, id) => {
      queryClient.removeQueries({ queryKey: matriculaKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: matriculaKeys.lists() })
      queryClient.invalidateQueries({ queryKey: matriculaKeys.withoutConfirmation() })
      
      toast.success(response.message || 'Matrícula deletada com sucesso!')
    },
    
    onError: (error: ApiError) => {
      const errorMessage = error?.response?.data?.message || 'Erro ao deletar matrícula'
      toast.error(errorMessage)
      console.error('Erro ao deletar matrícula:', error)
    },
  })
}

/**
 * Hook combinado para gerenciar todas as operações de matrículas
 */
export function useMatriculasManager(params: PaginationParams = { page: 1, limit: 10 }) {
  const matriculas = useMatriculas(params)
  const createMatricula = useCreateMatricula()
  const batchMatricula = useBatchMatricula()
  const updateMatricula = useUpdateMatricula()
  const deleteMatricula = useDeleteMatricula()

  return {
    // Queries
    matriculas: matriculas.data?.data || [],
    pagination: matriculas.data?.pagination,
    isLoading: matriculas.isLoading,
    isError: matriculas.isError,
    error: matriculas.error,
    refetch: matriculas.refetch,

    // Mutations
    createMatricula: createMatricula.mutate,
    batchMatricula: batchMatricula.mutate,
    updateMatricula: updateMatricula.mutate,
    deleteMatricula: deleteMatricula.mutate,

    // Loading states
    isCreating: createMatricula.isPending,
    isBatching: batchMatricula.isPending,
    isUpdating: updateMatricula.isPending,
    isDeleting: deleteMatricula.isPending,

    // Async versions
    createMatriculaAsync: createMatricula.mutateAsync,
    batchMatriculaAsync: batchMatricula.mutateAsync,
    updateMatriculaAsync: updateMatricula.mutateAsync,
    deleteMatriculaAsync: deleteMatricula.mutateAsync,
  }
}
