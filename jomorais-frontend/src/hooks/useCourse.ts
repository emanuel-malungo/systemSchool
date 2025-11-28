import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import courseService from '../services/course.service'
import type {
  ICourseInput,
  PaginationParams,
} from '../types/course.types'

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
export const courseKeys = {
  all: ['courses'] as const,
  lists: () => [...courseKeys.all, 'list'] as const,
  list: (params: PaginationParams) => [...courseKeys.lists(), params] as const,
  details: () => [...courseKeys.all, 'detail'] as const,
  detail: (id: number) => [...courseKeys.details(), id] as const,
  complete: (search?: string, includeArchived?: boolean) => 
    [...courseKeys.all, 'complete', search, includeArchived] as const,
  statistics: () => [...courseKeys.all, 'statistics'] as const,
}

/**
 * Hook para buscar todos os cursos com paginação e filtros
 * Implementa cache automático e refetch otimizado
 * @param params - Parâmetros de paginação e filtros
 * @returns Query com lista paginada de cursos
 */
export function useCourses(params: PaginationParams = { page: 1, limit: 10 }) {
  return useQuery({
    queryKey: courseKeys.list(params),
    queryFn: () => courseService.getCourses(params),
    staleTime: 1000 * 60 * 5, // Cache válido por 5 minutos
    gcTime: 1000 * 60 * 10, // Mantém no cache por 10 minutos
    retry: 2, // Tenta 2 vezes em caso de erro
    refetchOnWindowFocus: false, // Não refaz a query ao focar a janela
  })
}

/**
 * Hook para buscar todos os cursos sem paginação (para selects)
 * Útil para dropdowns e operações que precisam de todos os dados
 * @param search - Termo de busca opcional
 * @param includeArchived - Incluir cursos arquivados
 * @param enabled - Se a query deve ser executada
 * @returns Query com lista completa de cursos
 */
export function useCoursesComplete(search = '', includeArchived = false, enabled = true) {
  return useQuery({
    queryKey: courseKeys.complete(search, includeArchived),
    queryFn: () => courseService.getAllCourses(search, includeArchived),
    enabled,
    staleTime: 1000 * 60 * 30, // Cache válido por 30 minutos (dados muito estáveis)
    gcTime: 1000 * 60 * 60, // Mantém no cache por 1 hora
    retry: 1, // Reduzir tentativas
    refetchOnWindowFocus: false, // Não refazer ao focar janela
    refetchOnMount: false, // Não refazer ao montar se há cache válido
  })
}

/**
 * Hook para buscar um curso específico por ID
 * @param id - ID do curso
 * @param enabled - Se a query deve ser executada
 * @returns Query com dados do curso
 */
export function useCourse(id: number, enabled = true) {
  return useQuery({
    queryKey: courseKeys.detail(id),
    queryFn: () => courseService.getCourseById(id),
    enabled: enabled && !!id, // Só executa se enabled for true e id existir
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
  })
}

/**
 * Hook para buscar estatísticas dos cursos
 * @param enabled - Se a query deve ser executada
 * @returns Query com estatísticas
 */
export function useCourseStatistics(enabled = true) {
  return useQuery({
    queryKey: courseKeys.statistics(),
    queryFn: () => courseService.getCourseStats(),
    enabled,
    staleTime: 1000 * 60 * 2, // Cache de 2 minutos para estatísticas
    gcTime: 1000 * 60 * 5,
    retry: 1,
  })
}

/**
 * Hook para criar um novo curso
 * Invalida cache automaticamente após sucesso
 * @returns Mutation para criar curso
 */
export function useCreateCourse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (courseData: ICourseInput) => courseService.createCourse(courseData),
    
    onSuccess: (response) => {
      // Invalida todas as listas de cursos para refazer o fetch
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() })
      queryClient.invalidateQueries({ queryKey: courseKeys.all })
      queryClient.invalidateQueries({ queryKey: courseKeys.statistics() })
      
      toast.success(response.message || 'Curso criado com sucesso!')
    },
    
    onError: (error: ApiError) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao criar curso'
      toast.error(errorMessage)
      console.error('Erro ao criar curso:', error)
    },
  })
}

/**
 * Hook para atualizar um curso existente
 * Utiliza optimistic update para melhor UX
 * @returns Mutation para atualizar curso
 */
export function useUpdateCourse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, courseData }: { id: number; courseData: Partial<ICourseInput> }) =>
      courseService.updateCourse(id, courseData),
    
    // Optimistic update - atualiza o cache antes da resposta do servidor
    onMutate: async ({ id, courseData }) => {
      // Cancela queries em andamento
      await queryClient.cancelQueries({ queryKey: courseKeys.detail(id) })
      
      // Salva o valor anterior
      const previousCourse = queryClient.getQueryData(courseKeys.detail(id))

      // Atualiza otimisticamente
      if (previousCourse) {
        queryClient.setQueryData(courseKeys.detail(id), (old: unknown) => {
          const oldData = old as { data: Record<string, unknown> }
          return {
            ...oldData,
            data: { ...oldData.data, ...courseData },
          }
        })
      }

      return { previousCourse }
    },
    
    onSuccess: (response, { id }) => {
      // Atualiza o cache com os dados reais do servidor
      queryClient.setQueryData(courseKeys.detail(id), response)
      
      // Invalida as listas
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() })
      queryClient.invalidateQueries({ queryKey: courseKeys.all })
      queryClient.invalidateQueries({ queryKey: courseKeys.statistics() })
      
      toast.success(response.message || 'Curso atualizado com sucesso!')
    },
    
    onError: (error: ApiError, { id }, context) => {
      // Reverte para o valor anterior em caso de erro
      if (context?.previousCourse) {
        queryClient.setQueryData(courseKeys.detail(id), context.previousCourse)
      }
      
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao atualizar curso'
      toast.error(errorMessage)
      console.error('Erro ao atualizar curso:', error)
    },
    
    onSettled: (_, __, { id }) => {
      // Revalida a query após a operação
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(id) })
    },
  })
}

/**
 * Hook para arquivar um curso
 * @returns Mutation para arquivar curso
 */
export function useArchiveCourse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => courseService.archiveCourse(id),
    
    onSuccess: (response, id) => {
      queryClient.setQueryData(courseKeys.detail(id), response)
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() })
      queryClient.invalidateQueries({ queryKey: courseKeys.all })
      queryClient.invalidateQueries({ queryKey: courseKeys.statistics() })
      
      toast.success(response.message || 'Curso arquivado com sucesso!')
    },
    
    onError: (error: ApiError) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao arquivar curso'
      toast.error(errorMessage)
      console.error('Erro ao arquivar curso:', error)
    },
  })
}

/**
 * Hook para restaurar um curso arquivado
 * @returns Mutation para restaurar curso
 */
export function useUnarchiveCourse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => courseService.unarchiveCourse(id),
    
    onSuccess: (response, id) => {
      queryClient.setQueryData(courseKeys.detail(id), response)
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() })
      queryClient.invalidateQueries({ queryKey: courseKeys.all })
      queryClient.invalidateQueries({ queryKey: courseKeys.statistics() })
      
      toast.success(response.message || 'Curso restaurado com sucesso!')
    },
    
    onError: (error: ApiError) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao restaurar curso'
      toast.error(errorMessage)
      console.error('Erro ao restaurar curso:', error)
    },
  })
}

/**
 * Hook para deletar um curso permanentemente
 * @returns Mutation para deletar curso
 */
export function useDeleteCourse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => courseService.deleteCourse(id),
    
    onSuccess: (response, id) => {
      // Remove o curso específico do cache
      queryClient.removeQueries({ queryKey: courseKeys.detail(id) })
      
      // Invalida todas as listas
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() })
      queryClient.invalidateQueries({ queryKey: courseKeys.all })
      queryClient.invalidateQueries({ queryKey: courseKeys.statistics() })
      
      toast.success(response.message || 'Curso deletado com sucesso!')
    },
    
    onError: (error: ApiError) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao deletar curso'
      toast.error(errorMessage)
      console.error('Erro ao deletar curso:', error)
    },
  })
}

/**
 * Hook combinado para gerenciar todas as operações de cursos
 * Útil quando você precisa de múltiplas operações em um componente
 * @param params - Parâmetros de paginação e filtros
 * @returns Objeto com todas as operações de cursos
 */
export function useCoursesManager(params: PaginationParams = { page: 1, limit: 10 }) {
  const courses = useCourses(params)
  const createCourse = useCreateCourse()
  const updateCourse = useUpdateCourse()
  const archiveCourse = useArchiveCourse()
  const unarchiveCourse = useUnarchiveCourse()
  const deleteCourse = useDeleteCourse()

  return {
    // Queries
    courses: courses.data?.data || [],
    pagination: courses.data?.pagination,
    isLoading: courses.isLoading,
    isError: courses.isError,
    error: courses.error,
    refetch: courses.refetch,

    // Mutations
    createCourse: createCourse.mutate,
    updateCourse: updateCourse.mutate,
    archiveCourse: archiveCourse.mutate,
    unarchiveCourse: unarchiveCourse.mutate,
    deleteCourse: deleteCourse.mutate,

    // Loading states
    isCreating: createCourse.isPending,
    isUpdating: updateCourse.isPending,
    isArchiving: archiveCourse.isPending,
    isUnarchiving: unarchiveCourse.isPending,
    isDeleting: deleteCourse.isPending,

    // Async versions (para usar com async/await)
    createCourseAsync: createCourse.mutateAsync,
    updateCourseAsync: updateCourse.mutateAsync,
    archiveCourseAsync: archiveCourse.mutateAsync,
    unarchiveCourseAsync: unarchiveCourse.mutateAsync,
    deleteCourseAsync: deleteCourse.mutateAsync,
  }
}
