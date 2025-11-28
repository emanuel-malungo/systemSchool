import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import directorTurmaService, { type DirectorTurmaPaginationParams } from '../services/directorTurma.service'
import type { IDiretorTurmaInput } from '../types/directorTurma.types'

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
export const directorTurmaKeys = {
  all: ['director-turmas'] as const,
  lists: () => [...directorTurmaKeys.all, 'list'] as const,
  list: (params: DirectorTurmaPaginationParams) => [...directorTurmaKeys.lists(), params] as const,
  details: () => [...directorTurmaKeys.all, 'detail'] as const,
  detail: (id: number) => [...directorTurmaKeys.details(), id] as const,
  complete: (search?: string) => [...directorTurmaKeys.all, 'complete', search] as const,
  search: (term: string) => [...directorTurmaKeys.all, 'search', term] as const,
  byTurma: (codigoTurma: number) => [...directorTurmaKeys.all, 'turma', codigoTurma] as const,
  byDocente: (codigoDocente: number) => [...directorTurmaKeys.all, 'docente', codigoDocente] as const,
  byAnoLectivo: (codigoAnoLectivo: number) => [...directorTurmaKeys.all, 'ano-lectivo', codigoAnoLectivo] as const,
}

/**
 * Hook para buscar todos os diretores de turma com paginação e filtros
 * Implementa cache automático e refetch otimizado
 * @param params - Parâmetros de paginação e filtros
 * @returns Query com lista paginada de diretores de turma
 */
export function useDirectorTurmas(params: DirectorTurmaPaginationParams = { page: 1, limit: 10 }) {
  return useQuery({
    queryKey: directorTurmaKeys.list(params),
    queryFn: () => directorTurmaService.getDiretoresTurma(params),
    staleTime: 1000 * 60 * 5, // Cache válido por 5 minutos
    gcTime: 1000 * 60 * 10, // Mantém no cache por 10 minutos
    retry: 2, // Tenta 2 vezes em caso de erro
    refetchOnWindowFocus: false, // Não refaz a query ao focar a janela
  })
}

/**
 * Hook para buscar todos os diretores de turma sem paginação (para selects)
 * Útil para dropdowns e operações que precisam de todos os dados
 * @param search - Termo de busca opcional
 * @param enabled - Se a query deve ser executada
 * @returns Query com lista completa de diretores de turma
 */
export function useDirectorTurmasComplete(search = '', enabled = true) {
  return useQuery({
    queryKey: directorTurmaKeys.complete(search),
    queryFn: () => directorTurmaService.getAllDiretoresTurma(search),
    enabled,
    staleTime: 1000 * 60 * 10, // Cache válido por 10 minutos (dados mais estáveis)
    gcTime: 1000 * 60 * 30, // Mantém no cache por 30 minutos
    retry: 2,
  })
}

/**
 * Hook para buscar um diretor de turma específico por ID
 * @param id - Código do diretor de turma
 * @param enabled - Se a query deve ser executada
 * @returns Query com dados do diretor de turma
 */
export function useDirectorTurma(id: number, enabled = true) {
  return useQuery({
    queryKey: directorTurmaKeys.detail(id),
    queryFn: () => directorTurmaService.getDiretorTurmaById(id),
    enabled: enabled && !!id, // Só executa se enabled for true e id existir
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
  })
}

/**
 * Hook para buscar diretores de turma por termo de busca
 * @param searchTerm - Termo para buscar
 * @param enabled - Se a query deve ser executada
 * @returns Query com lista de diretores de turma filtrados
 */
export function useSearchDirectorTurmas(searchTerm: string, enabled = true) {
  return useQuery({
    queryKey: directorTurmaKeys.search(searchTerm),
    queryFn: () => directorTurmaService.searchDiretoresTurma(searchTerm),
    enabled: enabled && searchTerm.length > 0,
    staleTime: 1000 * 60 * 3, // Cache de 3 minutos para buscas
    gcTime: 1000 * 60 * 5,
    retry: 1,
  })
}

/**
 * Hook para buscar diretor de uma turma específica
 * @param codigoTurma - Código da turma
 * @param enabled - Se a query deve ser executada
 * @returns Query com dados do diretor da turma
 */
export function useDiretorPorTurma(codigoTurma: number, enabled = true) {
  return useQuery({
    queryKey: directorTurmaKeys.byTurma(codigoTurma),
    queryFn: () => directorTurmaService.getDiretorPorTurma(codigoTurma),
    enabled: enabled && !!codigoTurma,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
  })
}

/**
 * Hook para buscar turmas que um docente dirige
 * @param codigoDocente - Código do docente
 * @param enabled - Se a query deve ser executada
 * @returns Query com lista de turmas que o docente dirige
 */
export function useTurmasPorDiretor(codigoDocente: number, enabled = true) {
  return useQuery({
    queryKey: directorTurmaKeys.byDocente(codigoDocente),
    queryFn: () => directorTurmaService.getTurmasPorDiretor(codigoDocente),
    enabled: enabled && !!codigoDocente,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
  })
}

/**
 * Hook para buscar diretores de turma por ano letivo
 * @param codigoAnoLectivo - Código do ano letivo
 * @param enabled - Se a query deve ser executada
 * @returns Query com lista de diretores do ano letivo
 */
export function useDiretoresPorAnoLectivo(codigoAnoLectivo: number, enabled = true) {
  return useQuery({
    queryKey: directorTurmaKeys.byAnoLectivo(codigoAnoLectivo),
    queryFn: () => directorTurmaService.getDiretoresPorAnoLectivo(codigoAnoLectivo),
    enabled: enabled && !!codigoAnoLectivo,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
  })
}

/**
 * Hook para criar um novo diretor de turma
 * Invalida cache automaticamente após sucesso
 * @returns Mutation para criar diretor de turma
 */
export function useCreateDirectorTurma() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: IDiretorTurmaInput) => 
      directorTurmaService.createDiretorTurma(data),
    
    onSuccess: () => {
      // Invalida todas as listas de diretores de turma para refazer o fetch
      queryClient.invalidateQueries({ queryKey: directorTurmaKeys.lists() })
      queryClient.invalidateQueries({ queryKey: directorTurmaKeys.all })
      
      toast.success('Diretor de turma criado com sucesso!')
    },
    
    onError: (error: ApiError) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao criar diretor de turma'
      toast.error(errorMessage)
      console.error('Erro ao criar diretor de turma:', error)
    },
  })
}

/**
 * Hook para atualizar um diretor de turma existente
 * Utiliza optimistic update para melhor UX
 * @returns Mutation para atualizar diretor de turma
 */
export function useUpdateDirectorTurma() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<IDiretorTurmaInput> }) =>
      directorTurmaService.updateDiretorTurma(id, data),
    
    // Optimistic update - atualiza o cache antes da resposta do servidor
    onMutate: async (variables: { id: number; data: Partial<IDiretorTurmaInput> }) => {
      // Cancela queries em andamento
      await queryClient.cancelQueries({ queryKey: directorTurmaKeys.detail(variables.id) })
      
      // Salva o valor anterior
      const previousData = queryClient.getQueryData(directorTurmaKeys.detail(variables.id))

      return { previousData }
    },
    
    onSuccess: (_data: unknown, variables: { id: number; data: Partial<IDiretorTurmaInput> }) => {
      // Invalida as listas
      queryClient.invalidateQueries({ queryKey: directorTurmaKeys.lists() })
      queryClient.invalidateQueries({ queryKey: directorTurmaKeys.all })
      queryClient.invalidateQueries({ queryKey: directorTurmaKeys.detail(variables.id) })
      
      toast.success('Diretor de turma atualizado com sucesso!')
    },
    
    onError: (error: ApiError, variables: { id: number; data: Partial<IDiretorTurmaInput> }, context: { previousData?: unknown } | undefined) => {
      // Reverte para o valor anterior em caso de erro
      if (context?.previousData) {
        queryClient.setQueryData(directorTurmaKeys.detail(variables.id), context.previousData)
      }
      
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao atualizar diretor de turma'
      toast.error(errorMessage)
      console.error('Erro ao atualizar diretor de turma:', error)
    },
  })
}

/**
 * Hook para deletar um diretor de turma
 * @returns Mutation para deletar diretor de turma
 */
export function useDeleteDirectorTurma() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => directorTurmaService.deleteDiretorTurma(id),
    
    onSuccess: (_data: unknown, id: number) => {
      // Remove o diretor de turma específico do cache
      queryClient.removeQueries({ queryKey: directorTurmaKeys.detail(id) })
      
      // Invalida todas as listas
      queryClient.invalidateQueries({ queryKey: directorTurmaKeys.lists() })
      queryClient.invalidateQueries({ queryKey: directorTurmaKeys.all })
      
      toast.success('Diretor de turma deletado com sucesso!')
    },
    
    onError: (error: ApiError) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao deletar diretor de turma'
      toast.error(errorMessage)
      console.error('Erro ao deletar diretor de turma:', error)
    },
  })
}

/**
 * Hook combinado para gerenciar todas as operações de diretores de turma
 * Útil quando você precisa de múltiplas operações em um componente
 * @param params - Parâmetros de paginação e filtros
 * @returns Objeto com todas as operações de diretores de turma
 */
export function useDirectorTurmasManager(params: DirectorTurmaPaginationParams = { page: 1, limit: 10 }) {
  const directorTurmas = useDirectorTurmas(params)
  const createDirectorTurma = useCreateDirectorTurma()
  const updateDirectorTurma = useUpdateDirectorTurma()
  const deleteDirectorTurma = useDeleteDirectorTurma()

  return {
    // Queries
    directorTurmas: directorTurmas.data?.data || [],
    pagination: directorTurmas.data?.pagination,
    isLoading: directorTurmas.isLoading,
    isError: directorTurmas.isError,
    error: directorTurmas.error,
    refetch: directorTurmas.refetch,

    // Mutations
    createDirectorTurma: createDirectorTurma.mutate,
    updateDirectorTurma: updateDirectorTurma.mutate,
    deleteDirectorTurma: deleteDirectorTurma.mutate,

    // Loading states
    isCreating: createDirectorTurma.isPending,
    isUpdating: updateDirectorTurma.isPending,
    isDeleting: deleteDirectorTurma.isPending,

    // Async versions (para usar com async/await)
    createDirectorTurmaAsync: createDirectorTurma.mutateAsync,
    updateDirectorTurmaAsync: updateDirectorTurma.mutateAsync,
    deleteDirectorTurmaAsync: deleteDirectorTurma.mutateAsync,
  }
}
