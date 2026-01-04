import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import turmaService from '../services/turma.service'
import type { ITurmaInput } from '../types/turma.types'
import type { PaginationParams } from '../services/turma.service'

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
export const turmaKeys = {
  all: ['turmas'] as const,
  lists: () => [...turmaKeys.all, 'list'] as const,
  list: (params: PaginationParams) => [...turmaKeys.lists(), params] as const,
  details: () => [...turmaKeys.all, 'detail'] as const,
  detail: (id: number) => [...turmaKeys.details(), id] as const,
  complete: () => [...turmaKeys.all, 'complete'] as const,
  alunos: (turmaId: number) => [...turmaKeys.all, 'alunos', turmaId] as const,
  salaDisponibilidade: (codigoSala: number, codigoPeriodo: number, codigoAnoLectivo: number) => 
    [...turmaKeys.all, 'sala-disponibilidade', codigoSala, codigoPeriodo, codigoAnoLectivo] as const,
}

/**
 * Hook para buscar todas as turmas com paginação e filtros
 * Implementa cache automático e refetch otimizado
 * @param params - Parâmetros de paginação e filtros
 * @returns Query com lista paginada de turmas
 */
export function useTurmas(params: PaginationParams = { page: 1, limit: 10 }) {
  return useQuery({
    queryKey: turmaKeys.list(params),
    queryFn: () => turmaService.getTurmas(params),
    staleTime: 1000 * 60 * 5, // Cache válido por 5 minutos
    gcTime: 1000 * 60 * 10, // Mantém no cache por 10 minutos
    retry: 2, // Tenta 2 vezes em caso de erro
    refetchOnWindowFocus: false, // Não refaz a query ao focar a janela
  })
}

/**
 * Hook para buscar todas as turmas sem paginação (para selects)
 * Útil para dropdowns e operações que precisam de todos os dados
 * @param search - Termo de busca opcional
 * @param enabled - Se a query deve ser executada
 * @returns Query com lista completa de turmas
 */
export function useTurmasComplete(search = '', enabled = true) {
  return useQuery({
    queryKey: [...turmaKeys.complete(), search],
    queryFn: () => turmaService.getAllTurmas(search),
    enabled,
    staleTime: 1000 * 60 * 10, // Cache válido por 10 minutos (dados mais estáveis)
    gcTime: 1000 * 60 * 30,
    retry: 2,
  })
}

/**
 * Hook para buscar uma turma específica por ID
 * @param id - ID da turma
 * @param enabled - Se a query deve ser executada
 * @returns Query com dados da turma
 */
export function useTurma(id: number, enabled = true) {
  return useQuery({
    queryKey: turmaKeys.detail(id),
    queryFn: () => turmaService.getTurmaById(id),
    enabled: enabled && !!id, // Só executa se enabled for true e id existir
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
  })
}

/**
 * Hook para buscar alunos de uma turma específica
 * @param turmaId - ID da turma
 * @param enabled - Se a query deve ser executada
 * @returns Query com lista de alunos da turma
 */
export function useAlunosByTurma(turmaId: number, enabled = true) {
  return useQuery({
    queryKey: turmaKeys.alunos(turmaId),
    queryFn: () => turmaService.getAlunosByTurma(turmaId),
    enabled: enabled && !!turmaId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
  })
}

/**
 * Hook para validar disponibilidade de sala
 * @param codigoSala - Código da sala
 * @param codigoPeriodo - Código do período
 * @param codigoAnoLectivo - Código do ano letivo
 * @param enabled - Se a query deve ser executada
 * @returns Query com disponibilidade e possíveis conflitos
 */
export function useSalaDisponibilidade(
  codigoSala: number,
  codigoPeriodo: number,
  codigoAnoLectivo: number,
  enabled = true
) {
  return useQuery({
    queryKey: turmaKeys.salaDisponibilidade(codigoSala, codigoPeriodo, codigoAnoLectivo),
    queryFn: () => turmaService.validateSalaDisponibilidade(codigoSala, codigoPeriodo, codigoAnoLectivo),
    enabled: enabled && !!codigoSala && !!codigoPeriodo && !!codigoAnoLectivo,
    staleTime: 1000 * 60 * 2, // Cache válido por 2 minutos
    gcTime: 1000 * 60 * 5,
    retry: 1,
  })
}

/**
 * Hook para criar uma nova turma
 * Invalida cache automaticamente após sucesso
 * @returns Mutation para criar turma
 */
export function useCreateTurma() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (turmaData: ITurmaInput) => turmaService.createTurma(turmaData),
    
    onSuccess: (response) => {
      // Invalida todas as listas de turmas para refazer o fetch
      queryClient.invalidateQueries({ queryKey: turmaKeys.lists() })
      queryClient.invalidateQueries({ queryKey: turmaKeys.complete() })
      queryClient.invalidateQueries({ queryKey: turmaKeys.all })
      
      toast.success(response.message || 'Turma criada com sucesso!')
    },
    
    onError: (error: ApiError) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao criar turma'
      toast.error(errorMessage)
      console.error('Erro ao criar turma:', error)
    },
  })
}

/**
 * Hook para atualizar uma turma existente
 * Utiliza optimistic update para melhor UX
 * @returns Mutation para atualizar turma
 */
export function useUpdateTurma() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, turmaData }: { id: number; turmaData: Partial<ITurmaInput> }) =>
      turmaService.updateTurma(id, turmaData),
    
    // Optimistic update - atualiza o cache antes da resposta do servidor
    onMutate: async ({ id, turmaData }) => {
      // Cancela queries em andamento
      await queryClient.cancelQueries({ queryKey: turmaKeys.detail(id) })
      
      // Salva o valor anterior
      const previousTurma = queryClient.getQueryData(turmaKeys.detail(id))

      // Atualiza otimisticamente
      if (previousTurma) {
        queryClient.setQueryData(turmaKeys.detail(id), (old: unknown) => {
          const oldData = old as { data: Record<string, unknown> }
          return {
            ...oldData,
            data: { ...oldData.data, ...turmaData },
          }
        })
      }

      return { previousTurma }
    },
    
    onSuccess: (response, { id }) => {
      // Atualiza o cache com os dados reais do servidor
      queryClient.setQueryData(turmaKeys.detail(id), response)
      
      // Invalida as listas
      queryClient.invalidateQueries({ queryKey: turmaKeys.lists() })
      queryClient.invalidateQueries({ queryKey: turmaKeys.complete() })
      
      toast.success(response.message || 'Turma atualizada com sucesso!')
    },
    
    onError: (error: ApiError, { id }, context) => {
      // Reverte para o valor anterior em caso de erro
      if (context?.previousTurma) {
        queryClient.setQueryData(turmaKeys.detail(id), context.previousTurma)
      }
      
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao atualizar turma'
      toast.error(errorMessage)
      console.error('Erro ao atualizar turma:', error)
    },
    
    onSettled: (_, __, { id }) => {
      // Revalida a query após a operação
      queryClient.invalidateQueries({ queryKey: turmaKeys.detail(id) })
    },
  })
}

/**
 * Hook para atualizar o status de uma turma
 * @returns Mutation para atualizar status
 */
export function useUpdateTurmaStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'Ativo' | 'Inativo' | 'Arquivado' }) =>
      turmaService.updateTurmaStatus(id, status),
    
    onSuccess: (response, { id, status }) => {
      queryClient.setQueryData(turmaKeys.detail(id), response)
      queryClient.invalidateQueries({ queryKey: turmaKeys.lists() })
      queryClient.invalidateQueries({ queryKey: turmaKeys.complete() })
      
      const statusMessage = status === 'Arquivado' ? 'arquivada' : 
                          status === 'Inativo' ? 'desativada' : 'ativada'
      toast.success(response.message || `Turma ${statusMessage} com sucesso!`)
    },
    
    onError: (error: ApiError) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao atualizar status da turma'
      toast.error(errorMessage)
      console.error('Erro ao atualizar status da turma:', error)
    },
  })
}

/**
 * Hook para deletar uma turma
 * @returns Mutation para deletar turma
 */
export function useDeleteTurma() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => turmaService.deleteTurma(id),
    
    onSuccess: (response, id) => {
      // Remove a turma específica do cache
      queryClient.removeQueries({ queryKey: turmaKeys.detail(id) })
      
      // Invalida todas as listas
      queryClient.invalidateQueries({ queryKey: turmaKeys.lists() })
      queryClient.invalidateQueries({ queryKey: turmaKeys.complete() })
      
      toast.success(response.message || 'Turma deletada com sucesso!')
    },
    
    onError: (error: ApiError) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao deletar turma'
      toast.error(errorMessage)
      console.error('Erro ao deletar turma:', error)
    },
  })
}

/**
 * Hook combinado para gerenciar todas as operações de turmas
 * Útil quando você precisa de múltiplas operações em um componente
 * @param params - Parâmetros de paginação e filtros
 * @returns Objeto com todas as operações de turmas
 */
export function useTurmasManager(params: PaginationParams = { page: 1, limit: 10 }) {
  const turmas = useTurmas(params)
  const createTurma = useCreateTurma()
  const updateTurma = useUpdateTurma()
  const updateTurmaStatus = useUpdateTurmaStatus()
  const deleteTurma = useDeleteTurma()

  return {
    // Queries
    turmas: turmas.data?.data || [],
    pagination: turmas.data?.pagination,
    isLoading: turmas.isLoading,
    isError: turmas.isError,
    error: turmas.error,
    refetch: turmas.refetch,

    // Mutations
    createTurma: createTurma.mutate,
    updateTurma: updateTurma.mutate,
    updateTurmaStatus: updateTurmaStatus.mutate,
    deleteTurma: deleteTurma.mutate,

    // Loading states
    isCreating: createTurma.isPending,
    isUpdating: updateTurma.isPending,
    isUpdatingStatus: updateTurmaStatus.isPending,
    isDeleting: deleteTurma.isPending,

    // Async versions
    createTurmaAsync: createTurma.mutateAsync,
    updateTurmaAsync: updateTurma.mutateAsync,
    updateTurmaStatusAsync: updateTurmaStatus.mutateAsync,
    deleteTurmaAsync: deleteTurma.mutateAsync,
  }
}
