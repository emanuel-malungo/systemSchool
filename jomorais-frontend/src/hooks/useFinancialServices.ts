import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import FinancialServiceService from '../services/financialService.service'
import type {
  IMoedaInput,
  IMoedaListResponse,
  IMoedaResponse,
  ICategoriaServicoInput,
  ICategoriaServicoListResponse,
  ICategoriaServicoResponse,
  ITipoServicoInput,
  ITipoServicoListResponse,
  ITipoServicoResponse,
  ITipoServicoFilter,
  IRelatorioFinanceiroResponse,
} from '../types/financialService.types'

interface ApiError {
  response?: {
    data?: {
      message?: string
    }
  }
  message?: string
}

export interface FinancialPaginationParams {
  page?: number
  limit?: number
  search?: string
}

export interface UseTiposServicosParams {
  page?: number
  limit?: number
  filters?: ITipoServicoFilter
}

export const financialServiceKeys = {
  all: ['financial-services'] as const,

  // Moedas
  moedas: () => [...financialServiceKeys.all, 'moedas'] as const,
  moedasList: (params?: FinancialPaginationParams) =>
    [...financialServiceKeys.moedas(), 'list', params] as const,
  moeda: (id: number) => [...financialServiceKeys.moedas(), id] as const,

  // Categorias de serviços
  categorias: () => [...financialServiceKeys.all, 'categorias'] as const,
  categoriasList: (params?: FinancialPaginationParams) =>
    [...financialServiceKeys.categorias(), 'list', params] as const,
  categoria: (id: number) => [...financialServiceKeys.categorias(), id] as const,

  // Tipos de serviços
  tiposServicos: () => [...financialServiceKeys.all, 'tipos-servicos'] as const,
  tiposServicosList: (params?: UseTiposServicosParams) =>
    [...financialServiceKeys.tiposServicos(), 'list', params] as const,
  tipoServico: (id: number) => [...financialServiceKeys.tiposServicos(), id] as const,
  tiposServicosAtivos: () => [...financialServiceKeys.tiposServicos(), 'ativos'] as const,
  tiposServicosComMulta: () => [...financialServiceKeys.tiposServicos(), 'com-multa'] as const,
  tiposServicosPorCategoria: (categoriaId: number) =>
    [...financialServiceKeys.tiposServicos(), 'categoria', categoriaId] as const,
  tiposServicosPorMoeda: (moedaId: number) =>
    [...financialServiceKeys.tiposServicos(), 'moeda', moedaId] as const,

  // Relatório financeiro
  relatorioFinanceiro: () => [...financialServiceKeys.all, 'relatorio-financeiro'] as const,
}

// ===============================
// MOEDAS
// ===============================

export function useMoedas(
  params: FinancialPaginationParams = { page: 1, limit: 10 },
  enabled = true,
) {
  return useQuery<IMoedaListResponse, ApiError>({
    queryKey: financialServiceKeys.moedasList(params),
    queryFn: () =>
      FinancialServiceService.getMoedas(
        params.page ?? 1,
        params.limit ?? 10,
        params.search ?? '',
      ),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 2,
    refetchOnWindowFocus: false,
    enabled,
  })
}

export function useMoeda(id: number, enabled = true) {
  return useQuery<IMoedaResponse, ApiError>({
    queryKey: financialServiceKeys.moeda(id),
    queryFn: () => FinancialServiceService.getMoedaById(id),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 2,
  })
}

export function useCreateMoeda() {
  const queryClient = useQueryClient()

  return useMutation<IMoedaResponse, ApiError, IMoedaInput>({
    mutationFn: (data) => FinancialServiceService.createMoeda(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: financialServiceKeys.moedas() })
      const message = response.message || 'Moeda criada com sucesso!'
      toast.success(message)
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || error.message || 'Erro ao criar moeda'
      toast.error(message)
    },
  })
}

export function useUpdateMoeda() {
  const queryClient = useQueryClient()

  return useMutation<IMoedaResponse, ApiError, { id: number; data: IMoedaInput}>(
    {
      mutationFn: ({ id, data }) => FinancialServiceService.updateMoeda(id, data),
      onSuccess: (response, { id }) => {
        queryClient.invalidateQueries({ queryKey: financialServiceKeys.moedas() })
        queryClient.invalidateQueries({ queryKey: financialServiceKeys.moeda(id) })
        const message =
          response.message || 'Moeda atualizada com sucesso!'
        toast.success(message)
      },
      onError: (error) => {
        const message =
          error.response?.data?.message || error.message || 'Erro ao atualizar moeda'
        toast.error(message)
      },
    },
  )
}

export function useDeleteMoeda() {
  const queryClient = useQueryClient()

  return useMutation<
    { success: boolean; message: string },
    ApiError,
    number
  >({
    mutationFn: (id) => FinancialServiceService.deleteMoeda(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: financialServiceKeys.moedas() })
      const message = response.message || 'Moeda excluída com sucesso!'
      toast.success(message)
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || error.message || 'Erro ao excluir moeda'
      toast.error(message)
    },
  })
}

// ===============================
// CATEGORIAS DE SERVIÇOS
// ===============================

export function useCategoriasServicos(
  params: FinancialPaginationParams = { page: 1, limit: 10 },
  enabled = true,
) {
  return useQuery<ICategoriaServicoListResponse, ApiError>({
    queryKey: financialServiceKeys.categoriasList(params),
    queryFn: () =>
      FinancialServiceService.getCategorias(
        params.page ?? 1,
        params.limit ?? 10,
        params.search ?? '',
      ),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 2,
    refetchOnWindowFocus: false,
    enabled,
  })
}

export function useCategoriaServico(id: number, enabled = true) {
  return useQuery<ICategoriaServicoResponse, ApiError>({
    queryKey: financialServiceKeys.categoria(id),
    queryFn: () => FinancialServiceService.getCategoriaById(id),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 2,
  })
}

export function useCreateCategoriaServico() {
  const queryClient = useQueryClient()

  return useMutation<
    ICategoriaServicoResponse,
    ApiError,
    ICategoriaServicoInput
  >({
    mutationFn: (data) => FinancialServiceService.createCategoria(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: financialServiceKeys.categorias(),
      })
      const message =
        response.message || 'Categoria de serviço criada com sucesso!'
      toast.success(message)
    },
    onError: (error) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Erro ao criar categoria de serviço'
      toast.error(message)
    },
  })
}

export function useUpdateCategoriaServico() {
  const queryClient = useQueryClient()

  return useMutation<
    ICategoriaServicoResponse,
    ApiError,
    { id: number; data: ICategoriaServicoInput }
  >({
    mutationFn: ({ id, data }) =>
      FinancialServiceService.updateCategoria(id, data),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({
        queryKey: financialServiceKeys.categorias(),
      })
      queryClient.invalidateQueries({
        queryKey: financialServiceKeys.categoria(id),
      })
      const message =
        response.message || 'Categoria de serviço atualizada com sucesso!'
      toast.success(message)
    },
    onError: (error) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Erro ao atualizar categoria de serviço'
      toast.error(message)
    },
  })
}

export function useDeleteCategoriaServico() {
  const queryClient = useQueryClient()

  return useMutation<
    { success: boolean; message: string },
    ApiError,
    number
  >({
    mutationFn: (id) => FinancialServiceService.deleteCategoria(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: financialServiceKeys.categorias(),
      })
      const message =
        response.message || 'Categoria de serviço excluída com sucesso!'
      toast.success(message)
    },
    onError: (error) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Erro ao excluir categoria de serviço'
      toast.error(message)
    },
  })
}

// ===============================
// TIPOS DE SERVIÇOS (PRINCIPAL)
// ===============================

export function useTiposServicos(
  params: UseTiposServicosParams = { page: 1, limit: 10 },
  enabled = true,
) {
  const { page = 1, limit = 10, filters } = params

  return useQuery<ITipoServicoListResponse, ApiError>({
    queryKey: financialServiceKeys.tiposServicosList(params),
    queryFn: () =>
      FinancialServiceService.getTiposServicos(page, limit, filters),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 2,
    refetchOnWindowFocus: false,
    enabled,
  })
}

export function useTipoServico(id: number, enabled = true) {
  return useQuery<ITipoServicoResponse, ApiError>({
    queryKey: financialServiceKeys.tipoServico(id),
    queryFn: () => FinancialServiceService.getTipoServicoById(id),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 2,
  })
}

export function useCreateTipoServico() {
  const queryClient = useQueryClient()

  return useMutation<ITipoServicoResponse, ApiError, ITipoServicoInput>({
    mutationFn: (data) => FinancialServiceService.createTipoServico(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: financialServiceKeys.tiposServicos(),
      })
      const message =
        response.message || 'Tipo de serviço criado com sucesso!'
      toast.success(message)
    },
    onError: (error) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Erro ao criar tipo de serviço'
      toast.error(message)
    },
  })
}

export function useUpdateTipoServico() {
  const queryClient = useQueryClient()

  return useMutation<
    ITipoServicoResponse,
    ApiError,
    { id: number; data: ITipoServicoInput }
  >({
    mutationFn: ({ id, data }) =>
      FinancialServiceService.updateTipoServico(id, data),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({
        queryKey: financialServiceKeys.tiposServicos(),
      })
      queryClient.invalidateQueries({
        queryKey: financialServiceKeys.tipoServico(id),
      })
      const message =
        response.message || 'Tipo de serviço atualizado com sucesso!'
      toast.success(message)
    },
    onError: (error) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Erro ao atualizar tipo de serviço'
      toast.error(message)
    },
  })
}

export function useDeleteTipoServico() {
  const queryClient = useQueryClient()

  return useMutation<
    {
      success: boolean
      message: string
      deleted?: {
        pagamentos: number
        propinasClasse: number
        servicosAluno: number
        servicosTurma: number
      }
    },
    ApiError,
    number
  >({
    mutationFn: (id) => FinancialServiceService.deleteTipoServico(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: financialServiceKeys.tiposServicos(),
      })
      const message =
        response.message || 'Tipo de serviço excluído com sucesso!'
      toast.success(message)
    },
    onError: (error) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Erro ao excluir tipo de serviço'
      toast.error(message)
    },
  })
}

export function useTiposServicosAtivos(enabled = true) {
  return useQuery<ITipoServicoListResponse, ApiError>({
    queryKey: financialServiceKeys.tiposServicosAtivos(),
    queryFn: () => FinancialServiceService.getTiposServicosAtivos(),
    enabled,
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 30,
    retry: 2,
    refetchOnWindowFocus: false,
  })
}

export function useTiposServicosComMulta(enabled = true) {
  return useQuery<ITipoServicoListResponse, ApiError>({
    queryKey: financialServiceKeys.tiposServicosComMulta(),
    queryFn: () => FinancialServiceService.getTiposServicosComMulta(),
    enabled,
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 30,
    retry: 2,
    refetchOnWindowFocus: false,
  })
}

export function useTiposServicosPorCategoria(
  categoriaId: number,
  enabled = true,
) {
  return useQuery<ITipoServicoListResponse, ApiError>({
    queryKey: financialServiceKeys.tiposServicosPorCategoria(categoriaId),
    queryFn: () => FinancialServiceService.getTiposServicosPorCategoria(categoriaId),
    enabled: enabled && !!categoriaId,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    retry: 2,
    refetchOnWindowFocus: false,
  })
}

export function useTiposServicosPorMoeda(
  moedaId: number,
  enabled = true,
) {
  return useQuery<ITipoServicoListResponse, ApiError>({
    queryKey: financialServiceKeys.tiposServicosPorMoeda(moedaId),
    queryFn: () => FinancialServiceService.getTiposServicosPorMoeda(moedaId),
    enabled: enabled && !!moedaId,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    retry: 2,
    refetchOnWindowFocus: false,
  })
}

// ===============================
// RELATÓRIO FINANCEIRO
// ===============================

export function useFinancialServicesRelatorioFinanceiro(enabled = true) {
  return useQuery<IRelatorioFinanceiroResponse, ApiError>({
    queryKey: financialServiceKeys.relatorioFinanceiro(),
    queryFn: () => FinancialServiceService.getRelatorioFinanceiro(),
    enabled,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 2,
    refetchOnWindowFocus: false,
  })
}

// ===============================
// HOOK COMPOSTO PARA TIPOS DE SERVIÇOS
// ===============================

export function useTiposServicosManager(
  params: UseTiposServicosParams = { page: 1, limit: 10 },
) {
  const tiposServicosQuery = useTiposServicos(params)
  const createTipoServico = useCreateTipoServico()
  const updateTipoServico = useUpdateTipoServico()
  const deleteTipoServico = useDeleteTipoServico()

  return {
    tiposServicos: tiposServicosQuery.data?.data || [],
    pagination: tiposServicosQuery.data?.pagination,
    isLoading: tiposServicosQuery.isLoading,
    isError: tiposServicosQuery.isError,
    error: tiposServicosQuery.error,
    refetch: tiposServicosQuery.refetch,

    createTipoServico: createTipoServico.mutate,
    updateTipoServico: updateTipoServico.mutate,
    deleteTipoServico: deleteTipoServico.mutate,

    isCreating: createTipoServico.isPending,
    isUpdating: updateTipoServico.isPending,
    isDeleting: deleteTipoServico.isPending,

    createTipoServicoAsync: createTipoServico.mutateAsync,
    updateTipoServicoAsync: updateTipoServico.mutateAsync,
    deleteTipoServicoAsync: deleteTipoServico.mutateAsync,
  }
}
