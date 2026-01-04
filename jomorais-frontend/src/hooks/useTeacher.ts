import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import teacherService, { type TeacherPaginationParams } from '../services/teacher.service'
import type { IDocenteInput } from '../types/teacher.types'

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
export const teacherKeys = {
  all: ['teachers'] as const,
  lists: () => [...teacherKeys.all, 'list'] as const,
  list: (params: TeacherPaginationParams) => [...teacherKeys.lists(), params] as const,
  details: () => [...teacherKeys.all, 'detail'] as const,
  detail: (id: number) => [...teacherKeys.details(), id] as const,
  complete: (search?: string) => [...teacherKeys.all, 'complete', search] as const,
  search: (term: string) => [...teacherKeys.all, 'search', term] as const,
  especialidades: () => [...teacherKeys.all, 'especialidades'] as const,
  disciplinasDocente: () => [...teacherKeys.all, 'disciplinas-docente'] as const,
  turmasPorDocente: (docenteId: number) => [...teacherKeys.all, 'turmas', docenteId] as const,
  docentesPorTurma: (turmaId: number) => [...teacherKeys.all, 'turma', turmaId] as const,
}

/**
 * Hook para buscar todos os docentes com paginação e filtros
 * Implementa cache automático e refetch otimizado
 * @param params - Parâmetros de paginação e filtros
 * @returns Query com lista paginada de docentes
 */
export function useTeachers(params: TeacherPaginationParams = { page: 1, limit: 10 }) {
  return useQuery({
    queryKey: teacherKeys.list(params),
    queryFn: () => teacherService.getDocentes(params),
    staleTime: 1000 * 60 * 5, // Cache válido por 5 minutos
    gcTime: 1000 * 60 * 10, // Mantém no cache por 10 minutos
    retry: 2, // Tenta 2 vezes em caso de erro
    refetchOnWindowFocus: false, // Não refaz a query ao focar a janela
  })
}

/**
 * Hook para buscar todos os docentes sem paginação (para selects)
 * Útil para dropdowns e operações que precisam de todos os dados
 * @param search - Termo de busca opcional
 * @param enabled - Se a query deve ser executada
 * @returns Query com lista completa de docentes
 */
export function useTeachersComplete(search = '', enabled = true) {
  return useQuery({
    queryKey: teacherKeys.complete(search),
    queryFn: () => teacherService.getAllDocentes(search),
    enabled,
    staleTime: 1000 * 60 * 10, // Cache válido por 10 minutos (dados mais estáveis)
    gcTime: 1000 * 60 * 30, // Mantém no cache por 30 minutos
    retry: 2,
  })
}

/**
 * Hook para buscar um docente específico por ID
 * @param id - Código do docente
 * @param enabled - Se a query deve ser executada
 * @returns Query com dados do docente
 */
export function useTeacher(id: number, enabled = true) {
  return useQuery({
    queryKey: teacherKeys.detail(id),
    queryFn: () => teacherService.getDocenteById(id),
    enabled: enabled && !!id, // Só executa se enabled for true e id existir
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
  })
}

/**
 * Hook para buscar docentes por termo de busca
 * @param searchTerm - Termo para buscar
 * @param enabled - Se a query deve ser executada
 * @returns Query com lista de docentes filtrados
 */
export function useSearchTeachers(searchTerm: string, enabled = true) {
  return useQuery({
    queryKey: teacherKeys.search(searchTerm),
    queryFn: () => teacherService.searchDocentes(searchTerm),
    enabled: enabled && searchTerm.length > 0,
    staleTime: 1000 * 60 * 3, // Cache de 3 minutos para buscas
    gcTime: 1000 * 60 * 5,
    retry: 1,
  })
}

/**
 * Hook para buscar especialidades
 * @param enabled - Se a query deve ser executada
 * @returns Query com lista de especialidades
 */
export function useEspecialidades(enabled = true) {
  return useQuery({
    queryKey: teacherKeys.especialidades(),
    queryFn: () => teacherService.getEspecialidades(),
    enabled,
    staleTime: 1000 * 60 * 30, // Cache válido por 30 minutos (dados muito estáveis)
    gcTime: 1000 * 60 * 60, // Mantém no cache por 1 hora
    retry: 2,
  })
}

/**
 * Hook para buscar disciplinas associadas a docentes
 * @param enabled - Se a query deve ser executada
 * @returns Query com lista de disciplinas docente
 */
export function useDisciplinasDocente(enabled = true) {
  return useQuery({
    queryKey: teacherKeys.disciplinasDocente(),
    queryFn: () => teacherService.getDisciplinasDocente(),
    enabled,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 2,
  })
}

/**
 * Hook para buscar turmas de um docente
 * @param docenteId - Código do docente
 * @param enabled - Se a query deve ser executada
 * @returns Query com lista de turmas
 */
export function useTurmasPorDocente(docenteId: number, enabled = true) {
  return useQuery({
    queryKey: teacherKeys.turmasPorDocente(docenteId),
    queryFn: () => teacherService.getTurmasPorDocente(docenteId),
    enabled: enabled && !!docenteId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
  })
}

/**
 * Hook para buscar docentes de uma turma
 * @param turmaId - Código da turma
 * @param enabled - Se a query deve ser executada
 * @returns Query com lista de docentes
 */
export function useDocentesPorTurma(turmaId: number, enabled = true) {
  return useQuery({
    queryKey: teacherKeys.docentesPorTurma(turmaId),
    queryFn: () => teacherService.getDocentesPorTurma(turmaId),
    enabled: enabled && !!turmaId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
  })
}

/**
 * Hook para criar um novo docente
 * Invalida cache automaticamente após sucesso
 * @returns Mutation para criar docente
 */
export function useCreateTeacher() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (teacherData: IDocenteInput) => 
      teacherService.createDocente(teacherData),
    
    onSuccess: () => {
      // Invalida todas as listas de docentes para refazer o fetch
      queryClient.invalidateQueries({ queryKey: teacherKeys.lists() })
      queryClient.invalidateQueries({ queryKey: teacherKeys.all })
      
      toast.success('Docente criado com sucesso!')
    },
    
    onError: (error: ApiError) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao criar docente'
      toast.error(errorMessage)
      console.error('Erro ao criar docente:', error)
    },
  })
}

/**
 * Hook para atualizar um docente existente
 * Utiliza optimistic update para melhor UX
 * @returns Mutation para atualizar docente
 */
export function useUpdateTeacher() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, teacherData }: { id: number; teacherData: Partial<IDocenteInput> }) =>
      teacherService.updateDocente(id, teacherData),
    
    // Optimistic update - atualiza o cache antes da resposta do servidor
    onMutate: async (variables: { id: number; teacherData: Partial<IDocenteInput> }) => {
      // Cancela queries em andamento
      await queryClient.cancelQueries({ queryKey: teacherKeys.detail(variables.id) })
      
      // Salva o valor anterior
      const previousTeacher = queryClient.getQueryData(teacherKeys.detail(variables.id))

      return { previousTeacher }
    },
    
    onSuccess: (_data: unknown, variables: { id: number; teacherData: Partial<IDocenteInput> }) => {
      // Invalida as listas
      queryClient.invalidateQueries({ queryKey: teacherKeys.lists() })
      queryClient.invalidateQueries({ queryKey: teacherKeys.all })
      queryClient.invalidateQueries({ queryKey: teacherKeys.detail(variables.id) })
      
      toast.success('Docente atualizado com sucesso!')
    },
    
    onError: (error: ApiError, variables: { id: number; teacherData: Partial<IDocenteInput> }, context: { previousTeacher?: unknown } | undefined) => {
      // Reverte para o valor anterior em caso de erro
      if (context?.previousTeacher) {
        queryClient.setQueryData(teacherKeys.detail(variables.id), context.previousTeacher)
      }
      
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao atualizar docente'
      toast.error(errorMessage)
      console.error('Erro ao atualizar docente:', error)
    },
  })
}

/**
 * Hook para atualizar o status de um docente
 * @returns Mutation para atualizar status
 */
export function useUpdateTeacherStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: number }) =>
      teacherService.updateDocenteStatus(id, status),
    
    onSuccess: (_data: unknown, variables: { id: number; status: number }) => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.lists() })
      queryClient.invalidateQueries({ queryKey: teacherKeys.all })
      queryClient.invalidateQueries({ queryKey: teacherKeys.detail(variables.id) })
      
      toast.success('Status do docente atualizado com sucesso!')
    },
    
    onError: (error: ApiError) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao atualizar status'
      toast.error(errorMessage)
      console.error('Erro ao atualizar status do docente:', error)
    },
  })
}

/**
 * Hook para deletar um docente
 * @returns Mutation para deletar docente
 */
export function useDeleteTeacher() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => teacherService.deleteDocente(id),
    
    onSuccess: (_data: unknown, id: number) => {
      // Remove o docente específico do cache
      queryClient.removeQueries({ queryKey: teacherKeys.detail(id) })
      
      // Invalida todas as listas
      queryClient.invalidateQueries({ queryKey: teacherKeys.lists() })
      queryClient.invalidateQueries({ queryKey: teacherKeys.all })
      
      toast.success('Docente deletado com sucesso!')
    },
    
    onError: (error: ApiError) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao deletar docente'
      toast.error(errorMessage)
      console.error('Erro ao deletar docente:', error)
    },
  })
}

/**
 * Hook para criar associação de disciplina com docente
 * @returns Mutation para criar disciplina docente
 */
export function useCreateDisciplinaDocente() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { codigoDocente: number; codigoCurso: number; codigoDisciplina: number }) =>
      teacherService.createDisciplinaDocente(data),
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.disciplinasDocente() })
      queryClient.invalidateQueries({ queryKey: teacherKeys.all })
      
      toast.success('Disciplina associada ao docente com sucesso!')
    },
    
    onError: (error: ApiError) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao associar disciplina'
      toast.error(errorMessage)
      console.error('Erro ao criar disciplina docente:', error)
    },
  })
}

/**
 * Hook para deletar associação de disciplina com docente
 * @returns Mutation para deletar disciplina docente
 */
export function useDeleteDisciplinaDocente() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => teacherService.deleteDisciplinaDocente(id),
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.disciplinasDocente() })
      queryClient.invalidateQueries({ queryKey: teacherKeys.all })
      
      toast.success('Associação removida com sucesso!')
    },
    
    onError: (error: ApiError) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao remover associação'
      toast.error(errorMessage)
      console.error('Erro ao deletar disciplina docente:', error)
    },
  })
}

/**
 * Hook combinado para gerenciar todas as operações de docentes
 * Útil quando você precisa de múltiplas operações em um componente
 * @param params - Parâmetros de paginação e filtros
 * @returns Objeto com todas as operações de docentes
 */
export function useTeachersManager(params: TeacherPaginationParams = { page: 1, limit: 10 }) {
  const teachers = useTeachers(params)
  const createTeacher = useCreateTeacher()
  const updateTeacher = useUpdateTeacher()
  const updateTeacherStatus = useUpdateTeacherStatus()
  const deleteTeacher = useDeleteTeacher()

  return {
    // Queries
    teachers: teachers.data?.data || [],
    pagination: teachers.data?.pagination,
    isLoading: teachers.isLoading,
    isError: teachers.isError,
    error: teachers.error,
    refetch: teachers.refetch,

    // Mutations
    createTeacher: createTeacher.mutate,
    updateTeacher: updateTeacher.mutate,
    updateTeacherStatus: updateTeacherStatus.mutate,
    deleteTeacher: deleteTeacher.mutate,

    // Loading states
    isCreating: createTeacher.isPending,
    isUpdating: updateTeacher.isPending,
    isUpdatingStatus: updateTeacherStatus.isPending,
    isDeleting: deleteTeacher.isPending,

    // Async versions (para usar com async/await)
    createTeacherAsync: createTeacher.mutateAsync,
    updateTeacherAsync: updateTeacher.mutateAsync,
    updateTeacherStatusAsync: updateTeacherStatus.mutateAsync,
    deleteTeacherAsync: deleteTeacher.mutateAsync,
  }
}
