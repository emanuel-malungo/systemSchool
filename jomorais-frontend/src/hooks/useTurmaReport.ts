import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import turmaReportService from '../services/turmaReport.service'

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
export const turmaReportKeys = {
  all: ['turma-reports'] as const,
  students: (turmaId: number) => [...turmaReportKeys.all, 'students', turmaId] as const,
  allTurmasWithStudents: (anoLectivoId?: number) => 
    [...turmaReportKeys.all, 'all-turmas-students', anoLectivoId] as const,
}

/**
 * Hook para buscar alunos de uma turma específica
 * @param turmaId - ID da turma
 * @param enabled - Se a query deve ser executada
 * @returns Query com lista de alunos
 */
export function useStudentsByTurma(turmaId: number, enabled = true) {
  return useQuery({
    queryKey: turmaReportKeys.students(turmaId),
    queryFn: () => turmaReportService.getStudentsByTurma(turmaId),
    enabled: enabled && !!turmaId,
    staleTime: 1000 * 60 * 5, // Cache válido por 5 minutos
    gcTime: 1000 * 60 * 10,
    retry: 1,
  })
}

/**
 * Hook para buscar todas as turmas com seus alunos
 * @param anoLectivoId - ID do ano letivo (opcional)
 * @param enabled - Se a query deve ser executada
 * @returns Query com lista de turmas e alunos
 */
export function useAllTurmasWithStudents(anoLectivoId?: number, enabled = true) {
  return useQuery({
    queryKey: turmaReportKeys.allTurmasWithStudents(anoLectivoId),
    queryFn: () => turmaReportService.getAllTurmasWithStudents(anoLectivoId),
    enabled,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
  })
}

/**
 * Hook para gerar PDF de uma turma específica
 * @returns Mutation para gerar PDF
 */
export function useGenerateSingleTurmaPDF() {
  return useMutation({
    mutationFn: (turma: any) => turmaReportService.generateSingleTurmaPDF(turma),
    
    onSuccess: () => {
      toast.success('PDF gerado com sucesso!')
    },
    
    onError: (error: ApiError) => {
      const errorMessage = error?.message || 'Erro ao gerar PDF'
      toast.error(errorMessage)
      console.error('Erro ao gerar PDF da turma:', error)
    },
  })
}

/**
 * Hook para gerar PDF de todas as turmas
 * @returns Mutation para gerar PDF
 */
export function useGenerateAllTurmasPDF() {
  return useMutation({
    mutationFn: (anoLectivoId?: number) => turmaReportService.generateAllTurmasPDF(anoLectivoId),
    
    onSuccess: () => {
      toast.success('PDF de todas as turmas gerado com sucesso!')
    },
    
    onError: (error: ApiError) => {
      const errorMessage = error?.message || 'Erro ao gerar PDF'
      toast.error(errorMessage)
      console.error('Erro ao gerar PDF de todas as turmas:', error)
    },
  })
}

/**
 * Hook para gerar documento Word de uma turma específica
 * @returns Mutation para gerar DOCX
 */
export function useGenerateSingleTurmaDOC() {
  return useMutation({
    mutationFn: (turma: any) => turmaReportService.generateSingleTurmaDOC(turma),
    
    onSuccess: () => {
      toast.success('Documento Word gerado com sucesso!')
    },
    
    onError: (error: ApiError) => {
      const errorMessage = error?.message || 'Erro ao gerar documento Word'
      toast.error(errorMessage)
      console.error('Erro ao gerar DOC da turma:', error)
    },
  })
}

/**
 * Hook para gerar documento Word de todas as turmas
 * @returns Mutation para gerar DOCX
 */
export function useGenerateAllTurmasDOC() {
  return useMutation({
    mutationFn: (anoLectivoId?: number) => turmaReportService.generateAllTurmasDOC(anoLectivoId),
    
    onSuccess: () => {
      toast.success('Documento Word de todas as turmas gerado com sucesso!')
    },
    
    onError: (error: ApiError) => {
      const errorMessage = error?.message || 'Erro ao gerar documento Word'
      toast.error(errorMessage)
      console.error('Erro ao gerar DOC de todas as turmas:', error)
    },
  })
}

/**
 * Hook combinado para gerenciar todas as operações de relatórios de turmas
 * Útil quando você precisa de múltiplas operações em um componente
 * @param turmaId - ID da turma (opcional)
 * @param anoLectivoId - ID do ano letivo (opcional)
 * @returns Objeto com todas as operações de relatórios
 */
export function useTurmaReportManager(turmaId?: number, anoLectivoId?: number) {
  const students = useStudentsByTurma(turmaId || 0, !!turmaId)
  const allTurmasWithStudents = useAllTurmasWithStudents(anoLectivoId, !!anoLectivoId)
  const generateSinglePDF = useGenerateSingleTurmaPDF()
  const generateAllPDF = useGenerateAllTurmasPDF()
  const generateSingleDOC = useGenerateSingleTurmaDOC()
  const generateAllDOC = useGenerateAllTurmasDOC()

  return {
    // Queries
    students: students.data || [],
    allTurmasWithStudents: allTurmasWithStudents.data || [],
    isLoadingStudents: students.isLoading,
    isLoadingAllTurmas: allTurmasWithStudents.isLoading,
    isError: students.isError || allTurmasWithStudents.isError,
    error: students.error || allTurmasWithStudents.error,
    refetchStudents: students.refetch,
    refetchAllTurmas: allTurmasWithStudents.refetch,

    // Mutations
    generateSinglePDF: generateSinglePDF.mutate,
    generateAllPDF: generateAllPDF.mutate,
    generateSingleDOC: generateSingleDOC.mutate,
    generateAllDOC: generateAllDOC.mutate,

    // Loading states
    isGeneratingSinglePDF: generateSinglePDF.isPending,
    isGeneratingAllPDF: generateAllPDF.isPending,
    isGeneratingSingleDOC: generateSingleDOC.isPending,
    isGeneratingAllDOC: generateAllDOC.isPending,

    // Async versions (para usar com async/await)
    generateSinglePDFAsync: generateSinglePDF.mutateAsync,
    generateAllPDFAsync: generateAllPDF.mutateAsync,
    generateSingleDOCAsync: generateSingleDOC.mutateAsync,
    generateAllDOCAsync: generateAllDOC.mutateAsync,
  }
}
