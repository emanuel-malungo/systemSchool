import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import academicEvaluationService from '../services/academic-evaluation.service'
import type {
  CreateTipoAvaliacaoPayload,
  CreateTipoNotaPayload,
  CreateTipoNotaValorPayload,
  CreatePeriodoAvaliacaoPayload,
  UpdatePeriodoAvaliacaoPayload,
} from '../types/academic-evaluation.types'

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
export const academicEvaluationKeys = {
  all: ['academic-evaluation'] as const,
  
  // Tipos de Avaliação
  tiposAvaliacao: () => [...academicEvaluationKeys.all, 'tipos-avaliacao'] as const,
  tiposAvaliacaoList: (page: number, limit: number, search?: string) =>
    [...academicEvaluationKeys.tiposAvaliacao(), { page, limit, search }] as const,
  tipoAvaliacaoDetail: (id: number) => [...academicEvaluationKeys.tiposAvaliacao(), 'detail', id] as const,
  tiposAvaliacaoPorTipo: (tipo: number) => [...academicEvaluationKeys.tiposAvaliacao(), 'por-tipo', tipo] as const,

  // Tipos de Nota
  tiposNota: () => [...academicEvaluationKeys.all, 'tipos-nota'] as const,
  tiposNotaList: (page: number, limit: number, search?: string) =>
    [...academicEvaluationKeys.tiposNota(), { page, limit, search }] as const,
  tipoNotaDetail: (id: number) => [...academicEvaluationKeys.tiposNota(), 'detail', id] as const,
  tiposNotaAtivos: () => [...academicEvaluationKeys.tiposNota(), 'ativos'] as const,

  // Tipos de Nota Valor
  tiposNotaValor: () => [...academicEvaluationKeys.all, 'tipos-nota-valor'] as const,
  tiposNotaValorList: (page: number, limit: number, tipoNotaId?: number) =>
    [...academicEvaluationKeys.tiposNotaValor(), { page, limit, tipoNotaId }] as const,
  tipoNotaValorDetail: (id: number) => [...academicEvaluationKeys.tiposNotaValor(), 'detail', id] as const,

  // Períodos de Avaliação
  periodosAvaliacao: () => [...academicEvaluationKeys.all, 'periodos-avaliacao'] as const,
  periodosAvaliacaoList: (page: number, limit: number, search?: string) =>
    [...academicEvaluationKeys.periodosAvaliacao(), { page, limit, search }] as const,
  periodoAvaliacaoDetail: (id: number) => [...academicEvaluationKeys.periodosAvaliacao(), 'detail', id] as const,
}

// ===============================
// TIPOS DE AVALIAÇÃO - HOOKS
// ===============================

/**
 * Hook para buscar tipos de avaliação com paginação
 */
export function useTiposAvaliacao(page = 1, limit = 10, search = '') {
  return useQuery({
    queryKey: academicEvaluationKeys.tiposAvaliacaoList(page, limit, search),
    queryFn: () => academicEvaluationService.getTiposAvaliacao(page, limit, search),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 2,
    refetchOnWindowFocus: false,
  })
}

/**
 * Hook para buscar um tipo de avaliação específico
 */
export function useTipoAvaliacao(id: number, enabled = true) {
  return useQuery({
    queryKey: academicEvaluationKeys.tipoAvaliacaoDetail(id),
    queryFn: () => academicEvaluationService.getTipoAvaliacaoById(id),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
  })
}

/**
 * Hook para buscar tipos de avaliação por tipo
 */
export function useTiposAvaliacaoPorTipo(tipoAvaliacao: number, enabled = true) {
  return useQuery({
    queryKey: academicEvaluationKeys.tiposAvaliacaoPorTipo(tipoAvaliacao),
    queryFn: () => academicEvaluationService.getTiposAvaliacaoPorTipo(tipoAvaliacao),
    enabled: enabled && !!tipoAvaliacao,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  })
}

/**
 * Hook para criar tipo de avaliação
 */
export function useCreateTipoAvaliacao() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTipoAvaliacaoPayload) =>
      academicEvaluationService.createTipoAvaliacao(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicEvaluationKeys.tiposAvaliacao() })
      toast.success('Tipo de avaliação criado com sucesso')
    },
    onError: (error: ApiError) => {
      const message = error?.response?.data?.message || 'Erro ao criar tipo de avaliação'
      toast.error(message)
    },
  })
}

/**
 * Hook para atualizar tipo de avaliação
 */
export function useUpdateTipoAvaliacao() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateTipoAvaliacaoPayload }) =>
      academicEvaluationService.updateTipoAvaliacao(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: academicEvaluationKeys.tipoAvaliacaoDetail(id) })
      queryClient.invalidateQueries({ queryKey: academicEvaluationKeys.tiposAvaliacao() })
      toast.success('Tipo de avaliação atualizado com sucesso')
    },
    onError: (error: ApiError) => {
      const message = error?.response?.data?.message || 'Erro ao atualizar tipo de avaliação'
      toast.error(message)
    },
  })
}

/**
 * Hook para deletar tipo de avaliação
 */
export function useDeleteTipoAvaliacao() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) =>
      academicEvaluationService.deleteTipoAvaliacao(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicEvaluationKeys.tiposAvaliacao() })
      toast.success('Tipo de avaliação deletado com sucesso')
    },
    onError: (error: ApiError) => {
      const message = error?.response?.data?.message || 'Erro ao deletar tipo de avaliação'
      toast.error(message)
    },
  })
}

// ===============================
// TIPOS DE NOTA - HOOKS
// ===============================

/**
 * Hook para buscar tipos de nota
 */
export function useTiposNota(page = 1, limit = 10, search = '') {
  return useQuery({
    queryKey: academicEvaluationKeys.tiposNotaList(page, limit, search),
    queryFn: () => academicEvaluationService.getTiposNota(page, limit, search),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 2,
    refetchOnWindowFocus: false,
  })
}

/**
 * Hook para buscar um tipo de nota específico
 */
export function useTipoNota(id: number, enabled = true) {
  return useQuery({
    queryKey: academicEvaluationKeys.tipoNotaDetail(id),
    queryFn: () => academicEvaluationService.getTipoNotaById(id),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
  })
}

/**
 * Hook para buscar tipos de nota ativos
 */
export function useTiposNotaAtivos(enabled = true) {
  return useQuery({
    queryKey: academicEvaluationKeys.tiposNotaAtivos(),
    queryFn: () => academicEvaluationService.getTiposNotaAtivos(),
    enabled,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    retry: 2,
  })
}

/**
 * Hook para criar tipo de nota
 */
export function useCreateTipoNota() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTipoNotaPayload) =>
      academicEvaluationService.createTipoNota(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicEvaluationKeys.tiposNota() })
      toast.success('Tipo de nota criado com sucesso')
    },
    onError: (error: ApiError) => {
      const message = error?.response?.data?.message || 'Erro ao criar tipo de nota'
      toast.error(message)
    },
  })
}

/**
 * Hook para atualizar tipo de nota
 */
export function useUpdateTipoNota() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateTipoNotaPayload }) =>
      academicEvaluationService.updateTipoNota(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: academicEvaluationKeys.tipoNotaDetail(id) })
      queryClient.invalidateQueries({ queryKey: academicEvaluationKeys.tiposNota() })
      toast.success('Tipo de nota atualizado com sucesso')
    },
    onError: (error: ApiError) => {
      const message = error?.response?.data?.message || 'Erro ao atualizar tipo de nota'
      toast.error(message)
    },
  })
}

/**
 * Hook para deletar tipo de nota
 */
export function useDeleteTipoNota() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) =>
      academicEvaluationService.deleteTipoNota(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicEvaluationKeys.tiposNota() })
      toast.success('Tipo de nota deletado com sucesso')
    },
    onError: (error: ApiError) => {
      const message = error?.response?.data?.message || 'Erro ao deletar tipo de nota'
      toast.error(message)
    },
  })
}

// ===============================
// TIPOS DE NOTA VALOR - HOOKS
// ===============================

/**
 * Hook para buscar tipos de nota valor
 */
export function useTiposNotaValor(page = 1, limit = 10, tipoNotaId?: number) {
  return useQuery({
    queryKey: academicEvaluationKeys.tiposNotaValorList(page, limit, tipoNotaId),
    queryFn: () => academicEvaluationService.getTiposNotaValor(page, limit, tipoNotaId),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 2,
    refetchOnWindowFocus: false,
  })
}

/**
 * Hook para buscar um tipo de nota valor específico
 */
export function useTipoNotaValor(id: number, enabled = true) {
  return useQuery({
    queryKey: academicEvaluationKeys.tipoNotaValorDetail(id),
    queryFn: () => academicEvaluationService.getTipoNotaValorById(id),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
  })
}

/**
 * Hook para criar tipo de nota valor
 */
export function useCreateTipoNotaValor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTipoNotaValorPayload) =>
      academicEvaluationService.createTipoNotaValor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicEvaluationKeys.tiposNotaValor() })
      toast.success('Tipo de nota valor criado com sucesso')
    },
    onError: (error: ApiError) => {
      const message = error?.response?.data?.message || 'Erro ao criar tipo de nota valor'
      toast.error(message)
    },
  })
}

/**
 * Hook para atualizar tipo de nota valor
 */
export function useUpdateTipoNotaValor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateTipoNotaValorPayload }) =>
      academicEvaluationService.updateTipoNotaValor(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: academicEvaluationKeys.tipoNotaValorDetail(id) })
      queryClient.invalidateQueries({ queryKey: academicEvaluationKeys.tiposNotaValor() })
      toast.success('Tipo de nota valor atualizado com sucesso')
    },
    onError: (error: ApiError) => {
      const message = error?.response?.data?.message || 'Erro ao atualizar tipo de nota valor'
      toast.error(message)
    },
  })
}

/**
 * Hook para deletar tipo de nota valor
 */
export function useDeleteTipoNotaValor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) =>
      academicEvaluationService.deleteTipoNotaValor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicEvaluationKeys.tiposNotaValor() })
      toast.success('Tipo de nota valor deletado com sucesso')
    },
    onError: (error: ApiError) => {
      const message = error?.response?.data?.message || 'Erro ao deletar tipo de nota valor'
      toast.error(message)
    },
  })
}

// ===============================
// PERÍODOS DE AVALIAÇÃO - HOOKS
// ===============================

/**
 * Hook para buscar períodos de avaliação
 */
export function usePeriodosAvaliacao(page = 1, limit = 10, search = '') {
  return useQuery({
    queryKey: academicEvaluationKeys.periodosAvaliacaoList(page, limit, search),
    queryFn: () => academicEvaluationService.getPeriodosAvaliacao(page, limit, search),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 2,
    refetchOnWindowFocus: false,
  })
}

/**
 * Hook para buscar um período de avaliação específico
 */
export function usePeriodoAvaliacao(id: number, enabled = true) {
  return useQuery({
    queryKey: academicEvaluationKeys.periodoAvaliacaoDetail(id),
    queryFn: () => academicEvaluationService.getPeriodoAvaliacaoById(id),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
  })
}

/**
 * Hook para criar período de avaliação
 */
export function useCreatePeriodoAvaliacao() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePeriodoAvaliacaoPayload) =>
      academicEvaluationService.createPeriodoAvaliacao(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicEvaluationKeys.periodosAvaliacao() })
      toast.success('Período de avaliação criado com sucesso')
    },
    onError: (error: ApiError) => {
      const message = error?.response?.data?.message || 'Erro ao criar período de avaliação'
      toast.error(message)
    },
  })
}

/**
 * Hook para atualizar período de avaliação
 */
export function useUpdatePeriodoAvaliacao() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePeriodoAvaliacaoPayload }) =>
      academicEvaluationService.updatePeriodoAvaliacao(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: academicEvaluationKeys.periodoAvaliacaoDetail(id) })
      queryClient.invalidateQueries({ queryKey: academicEvaluationKeys.periodosAvaliacao() })
      toast.success('Período de avaliação atualizado com sucesso')
    },
    onError: (error: ApiError) => {
      const message = error?.response?.data?.message || 'Erro ao atualizar período de avaliação'
      toast.error(message)
    },
  })
}

/**
 * Hook para deletar período de avaliação
 */
export function useDeletePeriodoAvaliacao() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) =>
      academicEvaluationService.deletePeriodoAvaliacao(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicEvaluationKeys.periodosAvaliacao() })
      toast.success('Período de avaliação deletado com sucesso')
    },
    onError: (error: ApiError) => {
      const message = error?.response?.data?.message || 'Erro ao deletar período de avaliação'
      toast.error(message)
    },
  })
}
