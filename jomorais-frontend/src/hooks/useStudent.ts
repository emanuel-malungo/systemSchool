import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import studentService from '../services/student.service'
import type {
  Student,
  PaginationParams,
} from '../types/student.types'

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
export const studentKeys = {
  all: ['students'] as const,
  lists: () => [...studentKeys.all, 'list'] as const,
  list: (params: PaginationParams) => [...studentKeys.lists(), params] as const,
  details: () => [...studentKeys.all, 'detail'] as const,
  detail: (id: number) => [...studentKeys.details(), id] as const,
  statistics: (filters: Record<string, unknown>) => [...studentKeys.all, 'statistics', filters] as const,
  complete: () => [...studentKeys.all, 'complete'] as const,
}

/**
 * Hook para buscar todos os estudantes com paginação e filtros
 * Implementa cache automático e refetch otimizado
 */
export function useStudents(params: PaginationParams = { page: 1, limit: 10 }) {
  return useQuery({
    queryKey: studentKeys.list(params),
    queryFn: () => studentService.getAllStudents(params),
    staleTime: 1000 * 60 * 5, // Cache válido por 5 minutos
    gcTime: 1000 * 60 * 10, // Mantém no cache por 10 minutos
    retry: 2, // Tenta 2 vezes em caso de erro
    refetchOnWindowFocus: false, // Não refaz a query ao focar a janela
  })
}

/**
 * Hook para buscar todos os estudantes sem paginação
 * Útil para exports e operações que precisam de todos os dados
 */
export function useStudentsComplete(enabled = true) {
  return useQuery({
    queryKey: studentKeys.complete(),
    queryFn: () => studentService.getAllStudentsComplete(),
    enabled,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
  })
}

/**
 * Hook para buscar um estudante específico por ID
 */
export function useStudent(id: number, enabled = true) {
  return useQuery({
    queryKey: studentKeys.detail(id),
    queryFn: () => studentService.getStudentById(id),
    enabled: enabled && !!id, // Só executa se enabled for true e id existir
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
  })
}

/**
 * Hook para criar um novo estudante
 * Invalida cache automaticamente após sucesso
 */
export function useCreateStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (studentData: Student) =>
      studentService.createStudent(studentData),
    
    onSuccess: (response) => {
      // Invalida todas as listas de estudantes para refazer o fetch
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: studentKeys.complete() })
      queryClient.invalidateQueries({ queryKey: studentKeys.all })
      
      toast.success(response.message || 'Estudante criado com sucesso!')
    },
    
    onError: (error: ApiError) => {
      const errorMessage = error?.response?.data?.message || 'Erro ao criar estudante'
      toast.error(errorMessage)
      console.error('Erro ao criar estudante:', error)
    },
  })
}

/**
 * Hook para atualizar um estudante existente
 * Utiliza optimistic update para melhor UX
 */
export function useUpdateStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, studentData }: { id: number; studentData: Student }) =>
      studentService.updateStudent(id, studentData),
    
    // Optimistic update - atualiza o cache antes da resposta do servidor
    onMutate: async ({ id, studentData }) => {
      // Cancela queries em andamento
      await queryClient.cancelQueries({ queryKey: studentKeys.detail(id) })

      // Salva o valor anterior
      const previousStudent = queryClient.getQueryData(studentKeys.detail(id))

      // Atualiza otimisticamente
      if (previousStudent) {
        queryClient.setQueryData(studentKeys.detail(id), (old: unknown) => {
          const oldData = old as { data: Record<string, unknown> }
          return {
            ...oldData,
            data: { ...oldData.data, ...studentData },
          }
        })
      }

      return { previousStudent }
    },
    
    onSuccess: (response, { id }) => {
      // Atualiza o cache com os dados reais do servidor
      queryClient.setQueryData(studentKeys.detail(id), response)
      
      // Invalida as listas
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: studentKeys.complete() })
      
      toast.success(response.message || 'Estudante atualizado com sucesso!')
    },
    
    onError: (error: ApiError, { id }, context) => {
      // Reverte para o valor anterior em caso de erro
      if (context?.previousStudent) {
        queryClient.setQueryData(studentKeys.detail(id), context.previousStudent)
      }
      
      const errorMessage = error?.response?.data?.message || 'Erro ao atualizar estudante'
      toast.error(errorMessage)
      console.error('Erro ao atualizar estudante:', error)
    },
    
    onSettled: (_, __, { id }) => {
      // Revalida a query após a operação
      queryClient.invalidateQueries({ queryKey: studentKeys.detail(id) })
    },
  })
}

/**
 * Hook para deletar um estudante
 */
export function useDeleteStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => studentService.deleteStudent(id),
    
    onSuccess: (response, id) => {
      // Remove o estudante específico do cache
      queryClient.removeQueries({ queryKey: studentKeys.detail(id) })
      
      // Invalida todas as listas
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: studentKeys.complete() })
      
      toast.success(response.message || 'Estudante deletado com sucesso!')
    },
    
    onError: (error: ApiError) => {
      const errorMessage = error?.response?.data?.message || 'Erro ao deletar estudante'
      toast.error(errorMessage)
      console.error('Erro ao deletar estudante:', error)
    },
  })
}

/**
 * Hook para buscar estatísticas dos estudantes
 */
export function useStudentStatistics(
  filters: { status?: string | null; curso?: string | null } = {}
) {
  return useQuery({
    queryKey: studentKeys.statistics(filters),
    queryFn: () => studentService.getAlunosStatistics(filters),
    staleTime: 1000 * 60 * 2, // Cache de 2 minutos para estatísticas
    gcTime: 1000 * 60 * 5,
    retry: 1,
  })
}

/**
 * Hook combinado para gerenciar todas as operações de estudantes
 * Útil quando você precisa de múltiplas operações em um componente
 */
export function useStudentsManager(params: PaginationParams = { page: 1, limit: 10 }) {
  const students = useStudents(params)
  const createStudent = useCreateStudent()
  const updateStudent = useUpdateStudent()
  const deleteStudent = useDeleteStudent()

  return {
    // Queries
    students: students.data?.data || [],
    pagination: students.data?.pagination,
    isLoading: students.isLoading,
    isError: students.isError,
    error: students.error,
    refetch: students.refetch,

    // Mutations
    createStudent: createStudent.mutate,
    updateStudent: updateStudent.mutate,
    deleteStudent: deleteStudent.mutate,

    // Loading states
    isCreating: createStudent.isPending,
    isUpdating: updateStudent.isPending,
    isDeleting: deleteStudent.isPending,

    // Async versions (para usar com async/await)
    createStudentAsync: createStudent.mutateAsync,
    updateStudentAsync: updateStudent.mutateAsync,
    deleteStudentAsync: deleteStudent.mutateAsync,
  }
}
