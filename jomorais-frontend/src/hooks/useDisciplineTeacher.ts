import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { toast } from 'react-toastify'
import disciplineTeacherService from '../services/disciplineTeacher.service'
import type { AtribuicaoCompleta, IAtribuicaoCompletaInput } from '../types/disciplineTeacher.types'

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
 */
export const teacherAtribuicoesKeys = {
  all: ['teacher-atribuicoes'] as const,
  disciplinas: () => [...teacherAtribuicoesKeys.all, 'disciplinas'] as const,
  turmas: () => [...teacherAtribuicoesKeys.all, 'turmas'] as const,
  professores: () => [...teacherAtribuicoesKeys.all, 'professores'] as const,
}

/**
 * Hook para buscar atribuições de disciplinas
 */
export function useProfessorDisciplinas() {
  return useQuery({
    queryKey: teacherAtribuicoesKeys.disciplinas(),
    queryFn: () => disciplineTeacherService.getProfessorDisciplinas(),
    staleTime: 1000 * 60 * 5, // Cache válido por 5 minutos
  })
}

/**
 * Hook para buscar atribuições de turmas
 */
export function useProfessorTurmas() {
  return useQuery({
    queryKey: teacherAtribuicoesKeys.turmas(),
    queryFn: () => disciplineTeacherService.getProfessorTurmas(),
    staleTime: 1000 * 60 * 5, // Cache válido por 5 minutos
  })
}

/**
 * Hook para buscar a lista de professores completa
 */
export function useProfessoresComplete(search = '', enabled = true) {
  return useQuery({
    queryKey: [...teacherAtribuicoesKeys.professores(), search],
    queryFn: () => disciplineTeacherService.getProfessoresComplete(search),
    enabled,
    staleTime: 1000 * 60 * 10,
  })
}

/**
 * Hook para criar uma atribuição completa
 */
export function useCreateAtribuicaoCompleta() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: IAtribuicaoCompletaInput) => 
      disciplineTeacherService.createAtribuicaoCompleta(data),
    
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: teacherAtribuicoesKeys.all })
      toast.success(res.message || 'Atribuição criada com sucesso!')
    },
    
    onError: (error: ApiError) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao criar atribuição'
      toast.error(errorMessage)
      console.error('Erro ao criar atribuição:', error)
    },
  })
}

/**
 * Hook para deletar atribuição de disciplina
 */
export function useDeleteProfessorDisciplina() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => disciplineTeacherService.deleteProfessorDisciplina(id),
    
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: teacherAtribuicoesKeys.all })
      toast.success(res.message || 'Atribuição de disciplina excluída!')
    },
    
    onError: (error: ApiError) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao excluir atribuição'
      toast.error(errorMessage)
    },
  })
}

/**
 * Hook para deletar atribuição de turma
 */
export function useDeleteProfessorTurma() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => disciplineTeacherService.deleteProfessorTurma(id),
    
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: teacherAtribuicoesKeys.all })
      toast.success(res.message || 'Atribuição de turma excluída!')
    },
    
    onError: (error: ApiError) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao excluir atribuição'
      toast.error(errorMessage)
    },
  })
}

/**
 * Hook combinado para gerenciar todas as atribuições
 */
export function useDisciplineTeachersManager() {
  const disciplinasQuery = useProfessorDisciplinas()
  const turmasQuery = useProfessorTurmas()
  const createMutation = useCreateAtribuicaoCompleta()
  const deleteDisciplinaMutation = useDeleteProfessorDisciplina()
  const deleteTurmaMutation = useDeleteProfessorTurma()

  // Combinar as atribuições
  const combinedAtribuicoes = useMemo(() => {
    const disciplinas = disciplinasQuery.data?.data || []
    const turmas = turmasQuery.data?.data || []
    
    const all: AtribuicaoCompleta[] = []
    
    disciplinas.forEach((attr: any) => {
      all.push({
        codigo: attr.codigo,
        professor: {
          codigo: attr.codigo_Professor,
          nome: attr.tb_professores?.nome || 'Professor não encontrado',
          numeroFuncionario: attr.tb_professores?.numeroFuncionario
        },
        disciplina: {
          codigo: attr.codigo_Disciplina,
          designacao: attr.tb_disciplinas?.designacao || 'Disciplina não encontrada'
        },
        curso: {
          codigo: attr.codigo_Curso,
          designacao: attr.tb_cursos?.designacao || 'Curso não encontrado'
        },
        anoLectivo: attr.anoLectivo,
        tipo: 'disciplina',
        status: attr.status || 'Activo'
      })
    })

    turmas.forEach((attr: any) => {
      all.push({
        codigo: attr.codigo,
        professor: {
          codigo: attr.codigo_Professor,
          nome: attr.tb_professores?.nome || 'Professor não encontrado',
          numeroFuncionario: attr.tb_professores?.numeroFuncionario
        },
        disciplina: {
          codigo: attr.codigo_Disciplina,
          designacao: attr.tb_disciplinas?.designacao || 'Disciplina não encontrada'
        },
        curso: {
          codigo: 0,
          designacao: 'Via Turma'
        },
        turma: {
          codigo: attr.codigo_Turma,
          designacao: attr.tb_turmas?.designacao || 'Turma não encontrada'
        },
        anoLectivo: attr.anoLectivo,
        tipo: 'turma',
        status: attr.status || 'Activo'
      })
    })

    return all
  }, [disciplinasQuery.data, turmasQuery.data])

  return {
    disciplineTeachers: combinedAtribuicoes,
    isLoading: disciplinasQuery.isLoading || turmasQuery.isLoading,
    isRefetching: disciplinasQuery.isRefetching || turmasQuery.isRefetching,
    refetch: async () => {
      await Promise.all([disciplinasQuery.refetch(), turmasQuery.refetch()])
    },
    createDisciplineTeacherAsync: createMutation.mutateAsync,
    deleteProfessorDisciplinaAsync: deleteDisciplinaMutation.mutateAsync,
    deleteProfessorTurmaAsync: deleteTurmaMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isDeleting: deleteDisciplinaMutation.isPending || deleteTurmaMutation.isPending
  }
}
