import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import disciplineTeacherService, { type DisciplineTeacherPaginationParams } from '../services/disciplineTeacher.service'
import type { IDisciplinaDocenteInput } from '../types/disciplineTeacher.types'

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
export const disciplineTeacherKeys = {
  all: ['discipline-teachers'] as const,
  lists: () => [...disciplineTeacherKeys.all, 'list'] as const,
  list: (params: DisciplineTeacherPaginationParams) => [...disciplineTeacherKeys.lists(), params] as const,
  details: () => [...disciplineTeacherKeys.all, 'detail'] as const,
  detail: (id: number) => [...disciplineTeacherKeys.details(), id] as const,
  complete: (search?: string) => [...disciplineTeacherKeys.all, 'complete', search] as const,
  search: (term: string) => [...disciplineTeacherKeys.all, 'search', term] as const,
  statistics: () => [...disciplineTeacherKeys.all, 'statistics'] as const,
  byDocente: (codigoDocente: number) => [...disciplineTeacherKeys.all, 'docente', codigoDocente] as const,
  byDisciplina: (codigoDisciplina: number) => [...disciplineTeacherKeys.all, 'disciplina', codigoDisciplina] as const,
}

/**
 * Hook para buscar todas as disciplinas docente com paginação e filtros
 * Implementa cache automático e refetch otimizado
 * @param params - Parâmetros de paginação e filtros
 * @returns Query com lista paginada de disciplinas docente
 */
export function useDisciplineTeachers(params: DisciplineTeacherPaginationParams = { page: 1, limit: 10 }) {
  return useQuery({
    queryKey: disciplineTeacherKeys.list(params),
    queryFn: () => disciplineTeacherService.getDisciplinasDocente(params),
    staleTime: 1000 * 60 * 5, // Cache válido por 5 minutos
    gcTime: 1000 * 60 * 10, // Mantém no cache por 10 minutos
    retry: 2, // Tenta 2 vezes em caso de erro
    refetchOnWindowFocus: false, // Não refaz a query ao focar a janela
  })
}

/**
 * Hook para buscar todas as disciplinas docente sem paginação (para selects)
 * Útil para dropdowns e operações que precisam de todos os dados
 * @param search - Termo de busca opcional
 * @param enabled - Se a query deve ser executada
 * @returns Query com lista completa de disciplinas docente
 */
export function useDisciplineTeachersComplete(search = '', enabled = true) {
  return useQuery({
    queryKey: disciplineTeacherKeys.complete(search),
    queryFn: () => disciplineTeacherService.getAllDisciplinasDocente(search),
    enabled,
    staleTime: 1000 * 60 * 10, // Cache válido por 10 minutos (dados mais estáveis)
    gcTime: 1000 * 60 * 30, // Mantém no cache por 30 minutos
    retry: 2,
  })
}

/**
 * Hook para buscar uma disciplina docente específica por ID
 * @param id - Código da disciplina docente
 * @param enabled - Se a query deve ser executada
 * @returns Query com dados da disciplina docente
 */
export function useDisciplineTeacher(id: number, enabled = true) {
  return useQuery({
    queryKey: disciplineTeacherKeys.detail(id),
    queryFn: () => disciplineTeacherService.getDisciplinaDocenteById(id),
    enabled: enabled && !!id, // Só executa se enabled for true e id existir
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
  })
}

/**
 * Hook para buscar disciplinas docente por termo de busca
 * @param searchTerm - Termo para buscar
 * @param enabled - Se a query deve ser executada
 * @returns Query com lista de disciplinas docente filtradas
 */
export function useSearchDisciplineTeachers(searchTerm: string, enabled = true) {
  return useQuery({
    queryKey: disciplineTeacherKeys.search(searchTerm),
    queryFn: () => disciplineTeacherService.searchDisciplinasDocente(searchTerm),
    enabled: enabled && searchTerm.length > 0,
    staleTime: 1000 * 60 * 3, // Cache de 3 minutos para buscas
    gcTime: 1000 * 60 * 5,
    retry: 1,
  })
}

/**
 * Hook para buscar estatísticas de disciplinas docente
 * @param enabled - Se a query deve ser executada
 * @returns Query com estatísticas
 */
export function useDisciplineTeacherStatistics(enabled = true) {
  return useQuery({
    queryKey: disciplineTeacherKeys.statistics(),
    queryFn: () => disciplineTeacherService.getEstatisticasDisciplinasDocente(),
    enabled,
    staleTime: 1000 * 60 * 10, // Cache válido por 10 minutos
    gcTime: 1000 * 60 * 30, // Mantém no cache por 30 minutos
    retry: 2,
  })
}

/**
 * Hook para buscar disciplinas de um docente específico
 * @param codigoDocente - Código do docente
 * @param enabled - Se a query deve ser executada
 * @returns Query com lista de disciplinas do docente
 */
export function useDisciplinasPorDocente(codigoDocente: number, enabled = true) {
  return useQuery({
    queryKey: disciplineTeacherKeys.byDocente(codigoDocente),
    queryFn: () => disciplineTeacherService.getDisciplinasPorDocente(codigoDocente),
    enabled: enabled && !!codigoDocente,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
  })
}

/**
 * Hook para buscar docentes de uma disciplina específica
 * @param codigoDisciplina - Código da disciplina
 * @param enabled - Se a query deve ser executada
 * @returns Query com lista de docentes da disciplina
 */
export function useDocentesPorDisciplina(codigoDisciplina: number, enabled = true) {
  return useQuery({
    queryKey: disciplineTeacherKeys.byDisciplina(codigoDisciplina),
    queryFn: () => disciplineTeacherService.getDocentesPorDisciplina(codigoDisciplina),
    enabled: enabled && !!codigoDisciplina,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
  })
}

/**
 * Hook para criar uma nova associação disciplina-docente
 * Invalida cache automaticamente após sucesso
 * @returns Mutation para criar disciplina docente
 */
export function useCreateDisciplineTeacher() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: IDisciplinaDocenteInput) => 
      disciplineTeacherService.createDisciplinaDocente(data),
    
    onSuccess: () => {
      // Invalida todas as listas de disciplinas docente para refazer o fetch
      queryClient.invalidateQueries({ queryKey: disciplineTeacherKeys.lists() })
      queryClient.invalidateQueries({ queryKey: disciplineTeacherKeys.all })
      
      toast.success('Disciplina associada ao docente com sucesso!')
    },
    
    onError: (error: ApiError) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao criar associação'
      toast.error(errorMessage)
      console.error('Erro ao criar disciplina docente:', error)
    },
  })
}

/**
 * Hook para atualizar uma associação disciplina-docente existente
 * Utiliza optimistic update para melhor UX
 * @returns Mutation para atualizar disciplina docente
 */
export function useUpdateDisciplineTeacher() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<IDisciplinaDocenteInput> }) =>
      disciplineTeacherService.updateDisciplinaDocente(id, data),
    
    // Optimistic update - atualiza o cache antes da resposta do servidor
    onMutate: async (variables: { id: number; data: Partial<IDisciplinaDocenteInput> }) => {
      // Cancela queries em andamento
      await queryClient.cancelQueries({ queryKey: disciplineTeacherKeys.detail(variables.id) })
      
      // Salva o valor anterior
      const previousData = queryClient.getQueryData(disciplineTeacherKeys.detail(variables.id))

      return { previousData }
    },
    
    onSuccess: (_data: unknown, variables: { id: number; data: Partial<IDisciplinaDocenteInput> }) => {
      // Invalida as listas
      queryClient.invalidateQueries({ queryKey: disciplineTeacherKeys.lists() })
      queryClient.invalidateQueries({ queryKey: disciplineTeacherKeys.all })
      queryClient.invalidateQueries({ queryKey: disciplineTeacherKeys.detail(variables.id) })
      
      toast.success('Associação atualizada com sucesso!')
    },
    
    onError: (error: ApiError, variables: { id: number; data: Partial<IDisciplinaDocenteInput> }, context: { previousData?: unknown } | undefined) => {
      // Reverte para o valor anterior em caso de erro
      if (context?.previousData) {
        queryClient.setQueryData(disciplineTeacherKeys.detail(variables.id), context.previousData)
      }
      
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao atualizar associação'
      toast.error(errorMessage)
      console.error('Erro ao atualizar disciplina docente:', error)
    },
  })
}

/**
 * Hook para deletar uma associação disciplina-docente
 * @returns Mutation para deletar disciplina docente
 */
export function useDeleteDisciplineTeacher() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => disciplineTeacherService.deleteDisciplinaDocente(id),
    
    onSuccess: (_data: unknown, id: number) => {
      // Remove a disciplina docente específica do cache
      queryClient.removeQueries({ queryKey: disciplineTeacherKeys.detail(id) })
      
      // Invalida todas as listas
      queryClient.invalidateQueries({ queryKey: disciplineTeacherKeys.lists() })
      queryClient.invalidateQueries({ queryKey: disciplineTeacherKeys.all })
      queryClient.invalidateQueries({ queryKey: disciplineTeacherKeys.statistics() })
      
      toast.success('Associação removida com sucesso!')
    },
    
    onError: (error: ApiError) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao deletar associação'
      toast.error(errorMessage)
      console.error('Erro ao deletar disciplina docente:', error)
    },
  })
}

/**
 * Hook combinado para gerenciar todas as operações de disciplinas docente
 * Útil quando você precisa de múltiplas operações em um componente
 * @param params - Parâmetros de paginação e filtros
 * @returns Objeto com todas as operações de disciplinas docente
 */
export function useDisciplineTeachersManager(params: DisciplineTeacherPaginationParams = { page: 1, limit: 10 }) {
  const disciplineTeachers = useDisciplineTeachers(params)
  const createDisciplineTeacher = useCreateDisciplineTeacher()
  const updateDisciplineTeacher = useUpdateDisciplineTeacher()
  const deleteDisciplineTeacher = useDeleteDisciplineTeacher()

  return {
    // Queries
    disciplineTeachers: disciplineTeachers.data?.data || [],
    pagination: disciplineTeachers.data?.pagination,
    isLoading: disciplineTeachers.isLoading,
    isError: disciplineTeachers.isError,
    error: disciplineTeachers.error,
    refetch: disciplineTeachers.refetch,

    // Mutations
    createDisciplineTeacher: createDisciplineTeacher.mutate,
    updateDisciplineTeacher: updateDisciplineTeacher.mutate,
    deleteDisciplineTeacher: deleteDisciplineTeacher.mutate,

    // Loading states
    isCreating: createDisciplineTeacher.isPending,
    isUpdating: updateDisciplineTeacher.isPending,
    isDeleting: deleteDisciplineTeacher.isPending,

    // Async versions (para usar com async/await)
    createDisciplineTeacherAsync: createDisciplineTeacher.mutateAsync,
    updateDisciplineTeacherAsync: updateDisciplineTeacher.mutateAsync,
    deleteDisciplineTeacherAsync: deleteDisciplineTeacher.mutateAsync,
  }
}
