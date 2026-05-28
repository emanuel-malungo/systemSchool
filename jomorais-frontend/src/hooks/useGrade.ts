import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import gradeService from '../services/grade.service'
import type { CreateGradePayload, UpdateGradePayload, GradeFilters } from '../types/grade.types'

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
export const gradeKeys = {
  all: ['grades'] as const,
  lists: () => [...gradeKeys.all, 'list'] as const,
  list: (filters: { page: number; limit: number; filters?: GradeFilters }) =>
    [...gradeKeys.lists(), filters] as const,
  details: () => [...gradeKeys.all, 'detail'] as const,
  detail: (id: number) => [...gradeKeys.details(), id] as const,
  byStudent: (studentId: number) => [...gradeKeys.all, 'student', studentId] as const,
  bySubject: (subjectId: number) => [...gradeKeys.all, 'subject', subjectId] as const,
  byTurma: (turmaId: number) => [...gradeKeys.all, 'turma', turmaId] as const,
  byTurmaAndTrimester: (turmaId: number, trimesterId: number) =>
    [...gradeKeys.all, 'turma', turmaId, 'trimester', trimesterId] as const,
  
  // Pauta
  pauta: () => [...gradeKeys.all, 'pauta'] as const,
  pautaList: (turmaId: number, trimesterId: number, anoId: number) =>
    [...gradeKeys.pauta(), turmaId, trimesterId, anoId] as const,
}

/**
 * Hook para buscar notas com paginação e filtros
 * @param page - Número da página
 * @param limit - Itens por página
 * @param filters - Filtros adicionais
 * @returns Query com lista paginada de notas
 */
export function useGrades(
  page = 1,
  limit = 10,
  filters?: GradeFilters
) {
  return useQuery({
    queryKey: gradeKeys.list({ page, limit, filters }),
    queryFn: () => gradeService.getGrades(page, limit, filters),
    staleTime: 1000 * 60 * 5, // Cache válido por 5 minutos
    gcTime: 1000 * 60 * 10, // Mantém no cache por 10 minutos
    retry: 2,
    refetchOnWindowFocus: false,
  })
}

/**
 * Hook para buscar uma nota específica
 * @param id - Código da nota
 * @param enabled - Se a query deve ser executada
 * @returns Query com dados da nota
 */
export function useGrade(id: number, enabled = true) {
  return useQuery({
    queryKey: gradeKeys.detail(id),
    queryFn: () => gradeService.getGradeById(id),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
  })
}

/**
 * Hook para buscar notas de um aluno
 * @param studentId - Código do aluno
 * @returns Query com notas do aluno
 */
export function useGradesByStudent(studentId: number, enabled = true) {
  return useQuery({
    queryKey: gradeKeys.byStudent(studentId),
    queryFn: () => gradeService.getGradesByStudent(studentId),
    enabled: enabled && !!studentId,
    staleTime: 1000 * 60 * 3,
    gcTime: 1000 * 60 * 5,
  })
}

/**
 * Hook para buscar notas de uma disciplina
 * @param subjectId - Código da disciplina
 * @returns Query com notas da disciplina
 */
export function useGradesBySubject(subjectId: number, enabled = true) {
  return useQuery({
    queryKey: gradeKeys.bySubject(subjectId),
    queryFn: () => gradeService.getGradesBySubject(subjectId),
    enabled: enabled && !!subjectId,
    staleTime: 1000 * 60 * 3,
    gcTime: 1000 * 60 * 5,
  })
}

/**
 * Hook para buscar notas de uma turma
 * @param turmaId - Código da turma
 * @param trimesterId - Código do trimestre (opcional)
 * @returns Query com notas da turma
 */
export function useGradesByTurma(turmaId: number, trimesterId?: number, enabled = true) {
  const queryKey = trimesterId
    ? gradeKeys.byTurmaAndTrimester(turmaId, trimesterId)
    : gradeKeys.byTurma(turmaId)

  return useQuery({
    queryKey,
    queryFn: () => gradeService.getGradesByTurma(turmaId, trimesterId),
    enabled: enabled && !!turmaId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  })
}

/**
 * Hook para criar nota
 */
export function useCreateGrade() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateGradePayload) => gradeService.createGrade(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gradeKeys.lists() })
      queryClient.invalidateQueries({ queryKey: gradeKeys.pauta() })
      toast.success('Nota lançada com sucesso')
    },
    onError: (error: ApiError) => {
      const message =
        error?.response?.data?.message || error?.message || 'Erro ao lançar nota'
      toast.error(message)
    },
  })
}

/**
 * Hook para atualizar nota
 */
export function useUpdateGrade() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateGradePayload }) =>
      gradeService.updateGrade(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: gradeKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: gradeKeys.lists() })
      queryClient.invalidateQueries({ queryKey: gradeKeys.pauta() })
      toast.success('Nota atualizada com sucesso')
    },
    onError: (error: ApiError) => {
      const message =
        error?.response?.data?.message || error?.message || 'Erro ao atualizar nota'
      toast.error(message)
    },
  })
}

/**
 * Hook para deletar nota
 */
export function useDeleteGrade() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => gradeService.deleteGrade(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gradeKeys.lists() })
      queryClient.invalidateQueries({ queryKey: gradeKeys.pauta() })
      toast.success('Nota deletada com sucesso')
    },
    onError: (error: ApiError) => {
      const message =
        error?.response?.data?.message || error?.message || 'Erro ao deletar nota'
      toast.error(message)
    },
  })
}

/**
 * Hook para gerar pauta (consolidação de notas)
 */
export function useGeneratePauta() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      codigoTurma,
      codigoTrimestre,
      codigoAnoLectivo,
    }: {
      codigoTurma: number
      codigoTrimestre: number
      codigoAnoLectivo: number
    }) => gradeService.generatePauta(codigoTurma, codigoTrimestre, codigoAnoLectivo),
    onSuccess: (_, { codigoTurma, codigoTrimestre, codigoAnoLectivo }) => {
      queryClient.invalidateQueries({
        queryKey: gradeKeys.pautaList(codigoTurma, codigoTrimestre, codigoAnoLectivo),
      })
      toast.success('Pauta gerada com sucesso')
    },
    onError: (error: ApiError) => {
      const message =
        error?.response?.data?.message || error?.message || 'Erro ao gerar pauta'
      toast.error(message)
    },
  })
}

/**
 * Hook para buscar pauta
 */
export function usePauta(
  codigoTurma: number,
  codigoTrimestre: number,
  codigoAnoLectivo: number,
  enabled = true
) {
  return useQuery({
    queryKey: gradeKeys.pautaList(codigoTurma, codigoTrimestre, codigoAnoLectivo),
    queryFn: () =>
      gradeService.getPauta(codigoTurma, codigoTrimestre, codigoAnoLectivo),
    enabled:
      enabled && !!codigoTurma && !!codigoTrimestre && !!codigoAnoLectivo,
    staleTime: 1000 * 60 * 10, // Pauta muda menos frequentemente
    gcTime: 1000 * 60 * 30,
  })
}

/**
 * Hook para exportar pauta em PDF
 */
export function useExportPautaPDF() {
  return useMutation({
    mutationFn: ({
      codigoTurma,
      codigoTrimestre,
      codigoAnoLectivo,
    }: {
      codigoTurma: number
      codigoTrimestre: number
      codigoAnoLectivo: number
    }) => gradeService.exportPautaPDF(codigoTurma, codigoTrimestre, codigoAnoLectivo),
    onSuccess: (blob, { codigoTurma, codigoTrimestre }) => {
      // Criar URL para download
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Pauta_Turma_${codigoTurma}_Trimestre_${codigoTrimestre}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Pauta exportada com sucesso')
    },
    onError: (error: ApiError) => {
      const message =
        error?.response?.data?.message || error?.message || 'Erro ao exportar pauta'
      toast.error(message)
    },
  })
}

/**
 * Hook para exportar pauta em Excel
 */
export function useExportPautaExcel() {
  return useMutation({
    mutationFn: ({
      codigoTurma,
      codigoTrimestre,
      codigoAnoLectivo,
    }: {
      codigoTurma: number
      codigoTrimestre: number
      codigoAnoLectivo: number
    }) =>
      gradeService.exportPautaExcel(codigoTurma, codigoTrimestre, codigoAnoLectivo),
    onSuccess: (blob, { codigoTurma, codigoTrimestre }) => {
      // Criar URL para download
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Pauta_Turma_${codigoTurma}_Trimestre_${codigoTrimestre}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Pauta exportada com sucesso')
    },
    onError: (error: ApiError) => {
      const message =
        error?.response?.data?.message || error?.message || 'Erro ao exportar pauta'
      toast.error(message)
    },
  })
}

/**
 * Hook para publicar pauta
 */
export function usePublishPauta() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      codigoTurma,
      codigoTrimestre,
    }: {
      codigoTurma: number
      codigoTrimestre: number
    }) => gradeService.publishPauta(codigoTurma, codigoTrimestre),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gradeKeys.pauta() })
      toast.success('Pauta publicada com sucesso')
    },
    onError: (error: ApiError) => {
      const message =
        error?.response?.data?.message || error?.message || 'Erro ao publicar pauta'
      toast.error(message)
    },
  })
}
