import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import certificateService from '../services/certificate.service'
import type { CreateCertificatePayload, UpdateCertificatePayload, CertificateFilters } from '../types/certificate.types'

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
export const certificateKeys = {
  all: ['certificates'] as const,
  lists: () => [...certificateKeys.all, 'list'] as const,
  list: (filters: { page: number; limit: number; filters?: CertificateFilters }) =>
    [...certificateKeys.lists(), filters] as const,
  details: () => [...certificateKeys.all, 'detail'] as const,
  detail: (id: number) => [...certificateKeys.details(), id] as const,
  byStudent: (studentId: number) => [...certificateKeys.all, 'student', studentId] as const,
  bySubject: (subjectId: number) => [...certificateKeys.all, 'subject', subjectId] as const,
  pending: () => [...certificateKeys.all, 'pending'] as const,
  signed: () => [...certificateKeys.all, 'signed'] as const,
}

/**
 * Hook para buscar certificados com paginação e filtros
 * @param page - Número da página
 * @param limit - Itens por página
 * @param filters - Filtros adicionais
 * @returns Query com lista paginada de certificados
 */
export function useCertificates(
  page = 1,
  limit = 10,
  filters?: CertificateFilters
) {
  return useQuery({
    queryKey: certificateKeys.list({ page, limit, filters }),
    queryFn: () => certificateService.getCertificates(page, limit, filters),
    staleTime: 1000 * 60 * 5, // Cache válido por 5 minutos
    gcTime: 1000 * 60 * 10, // Mantém no cache por 10 minutos
    retry: 2,
    refetchOnWindowFocus: false,
  })
}

/**
 * Hook para buscar um certificado específico
 * @param id - Código do certificado
 * @param enabled - Se a query deve ser executada
 * @returns Query com dados do certificado
 */
export function useCertificate(id: number, enabled = true) {
  return useQuery({
    queryKey: certificateKeys.detail(id),
    queryFn: () => certificateService.getCertificateById(id),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
  })
}

/**
 * Hook para buscar certificados pendentes de um aluno
 * @param studentId - Código do aluno
 * @returns Query com certificados pendentes
 */
export function useCertificatesByStudent(studentId: number, enabled = true) {
  return useQuery({
    queryKey: certificateKeys.byStudent(studentId),
    queryFn: () =>
      certificateService.getCertificates(1, 100, { codigoAluno: studentId, status: 'Pendente' }),
    enabled: enabled && !!studentId,
    staleTime: 1000 * 60 * 3,
    gcTime: 1000 * 60 * 5,
  })
}

/**
 * Hook para buscar certificados por disciplina
 * @param subjectId - Código da disciplina
 * @returns Query com certificados da disciplina
 */
export function useCertificatesBySubject(subjectId: number, enabled = true) {
  return useQuery({
    queryKey: certificateKeys.bySubject(subjectId),
    queryFn: () =>
      certificateService.getCertificates(1, 100, { codigoDisciplina: subjectId }),
    enabled: enabled && !!subjectId,
    staleTime: 1000 * 60 * 3,
    gcTime: 1000 * 60 * 5,
  })
}

/**
 * Hook para buscar certificados pendentes
 * @returns Query com certificados pendentes
 */
export function usePendingCertificates() {
  return useQuery({
    queryKey: certificateKeys.pending(),
    queryFn: () =>
      certificateService.getCertificates(1, 100, { status: 'Pendente' }),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 2,
  })
}

/**
 * Hook para criar certificado
 */
export function useCreateCertificate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCertificatePayload) =>
      certificateService.createCertificate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: certificateKeys.lists() })
      toast.success('Certificado criado com sucesso')
    },
    onError: (error: ApiError) => {
      const message =
        error?.response?.data?.message || error?.message || 'Erro ao criar certificado'
      toast.error(message)
    },
  })
}

/**
 * Hook para atualizar certificado
 */
export function useUpdateCertificate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCertificatePayload }) =>
      certificateService.updateCertificate(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: certificateKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: certificateKeys.lists() })
      toast.success('Certificado atualizado com sucesso')
    },
    onError: (error: ApiError) => {
      const message =
        error?.response?.data?.message || error?.message || 'Erro ao atualizar certificado'
      toast.error(message)
    },
  })
}

/**
 * Hook para deletar certificado
 */
export function useDeleteCertificate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) =>
      certificateService.deleteCertificate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: certificateKeys.lists() })
      toast.success('Certificado deletado com sucesso')
    },
    onError: (error: ApiError) => {
      const message =
        error?.response?.data?.message || error?.message || 'Erro ao deletar certificado'
      toast.error(message)
    },
  })
}

/**
 * Hook para assinar certificado
 */
export function useSignCertificate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, codigoUtilizador }: { id: number; codigoUtilizador: number }) =>
      certificateService.signCertificate(id, codigoUtilizador),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: certificateKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: certificateKeys.lists() })
      queryClient.invalidateQueries({ queryKey: certificateKeys.pending() })
      toast.success('Certificado assinado com sucesso')
    },
    onError: (error: ApiError) => {
      const message =
        error?.response?.data?.message || error?.message || 'Erro ao assinar certificado'
      toast.error(message)
    },
  })
}

/**
 * Hook para gerar número de certificado
 */
export function useGenerateCertificateNumber() {
  return useMutation({
    mutationFn: (codigoAnoLectivo: number) =>
      certificateService.generateNumeroCertificado(codigoAnoLectivo),
    onError: (error: ApiError) => {
      const message =
        error?.response?.data?.message || error?.message || 'Erro ao gerar número do certificado'
      toast.error(message)
    },
  })
}
