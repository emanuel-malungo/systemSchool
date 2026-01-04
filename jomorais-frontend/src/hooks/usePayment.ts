import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "react-toastify"
import paymentService from "../services/payment.service"
import ThermalInvoiceService, { type ThermalInvoiceData } from "../services/thermalInvoice.service"
import type {
  FormaPagamento,
  FormaPagamentoInput,
  TipoServico,
  Pagamentoi,
  PagamentoiInput,
  PagamentoDetalhe,
  PagamentoDetalheInput,
  NotaCredito,
  NotaCreditoInput,
  MotivoAnulacao,
  MotivoAnulacaoInput,
  AlunoConfirmado,
  DadosFinanceirosAluno,
  MesPendente,
  DashboardFinanceiro,
  EstatisticasFinanceiras,
  RelatorioFinanceiro,
  RelatorioVendasFuncionario,
  PaginationParams,
  PaymentFilters,
} from "../types/payment.types"

interface ApiError {
  response?: {
    data?: {
      message?: string
    }
  }
  message?: string
}

/**
 * Chaves hierárquicas para cache do React Query
 */
export const paymentKeys = {
  all: ['payments'] as const,
  
  // Formas de pagamento
  formasPagamento: () => [...paymentKeys.all, 'formas-pagamento'] as const,
  formasPagamentoList: (params?: PaginationParams) => 
    [...paymentKeys.formasPagamento(), 'list', params] as const,
  formasPagamentoAll: () => [...paymentKeys.formasPagamento(), 'all'] as const,
  formaPagamento: (id: number) => [...paymentKeys.formasPagamento(), id] as const,
  
  // Tipos de serviço
  tiposServico: () => [...paymentKeys.all, 'tipos-servico'] as const,
  
  // Pagamentos principais (pagamentoi)
  pagamentois: () => [...paymentKeys.all, 'pagamentois'] as const,
  pagamentoisList: (params?: PaginationParams & PaymentFilters) => 
    [...paymentKeys.pagamentois(), 'list', params] as const,
  pagamentoi: (id: number) => [...paymentKeys.pagamentois(), id] as const,
  
  // Detalhes de pagamento (pagamentos)
  pagamentos: () => [...paymentKeys.all, 'pagamentos'] as const,
  pagamentosList: (params?: PaginationParams & PaymentFilters) => 
    [...paymentKeys.pagamentos(), 'list', params] as const,
  pagamento: (id: number) => [...paymentKeys.pagamentos(), id] as const,
  
  // Notas de crédito
  notasCredito: () => [...paymentKeys.all, 'notas-credito'] as const,
  notasCreditoList: (params?: PaginationParams) => 
    [...paymentKeys.notasCredito(), 'list', params] as const,
  notaCredito: (id: number) => [...paymentKeys.notasCredito(), id] as const,
  
  // Motivos de anulação
  motivosAnulacao: () => [...paymentKeys.all, 'motivos-anulacao'] as const,
  motivosAnulacaoList: (params?: PaginationParams) => 
    [...paymentKeys.motivosAnulacao(), 'list', params] as const,
  motivoAnulacao: (id: number) => [...paymentKeys.motivosAnulacao(), id] as const,
  
  // Alunos confirmados
  alunosConfirmados: () => [...paymentKeys.all, 'alunos-confirmados'] as const,
  alunosConfirmadosList: (params?: PaginationParams & { codigo_Ano_lectivo?: number }) => 
    [...paymentKeys.alunosConfirmados(), 'list', params] as const,
  
  // Dados financeiros de aluno
  dadosFinanceiros: (alunoId: number, anoLectivoId?: number) => 
    [...paymentKeys.all, 'dados-financeiros', alunoId, anoLectivoId] as const,
  
  // Meses pendentes
  mesesPendentes: (alunoId: number, codigoAnoLectivo?: number) => 
    [...paymentKeys.all, 'meses-pendentes', alunoId, codigoAnoLectivo] as const,
  
  // Dashboard e estatísticas
  dashboard: () => [...paymentKeys.all, 'dashboard'] as const,
  estatisticas: (periodo?: string) => [...paymentKeys.all, 'estatisticas', periodo] as const,
  
  // Relatórios
  relatorios: () => [...paymentKeys.all, 'relatorios'] as const,
  relatorioFinanceiro: (tipo: string, filters: PaymentFilters) => 
    [...paymentKeys.relatorios(), 'financeiro', tipo, filters] as const,
  relatorioVendas: (periodo: string, dataInicio?: string, dataFim?: string) => 
    [...paymentKeys.relatorios(), 'vendas', periodo, dataInicio, dataFim] as const,
  relatorioVendasDetalhado: (funcionarioId: number, periodo: string, dataInicio?: string, dataFim?: string) => 
    [...paymentKeys.relatorios(), 'vendas', funcionarioId, periodo, dataInicio, dataFim] as const,
}

// ===============================
// FORMAS DE PAGAMENTO HOOKS
// ===============================

/**
 * Hook para buscar formas de pagamento com paginação
 */
export function useFormasPagamento(params?: PaginationParams, enabled = true) {
  return useQuery({
    queryKey: paymentKeys.formasPagamentoList(params),
    queryFn: () => paymentService.getFormasPagamento(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
    enabled,
  })
}

/**
 * Hook para buscar todas as formas de pagamento sem paginação
 */
export function useAllFormasPagamento(enabled = true) {
  return useQuery({
    queryKey: paymentKeys.formasPagamentoAll(),
    queryFn: () => paymentService.getAllFormasPagamento(),
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
    retry: 2,
    enabled,
  })
}

/**
 * Hook para buscar uma forma de pagamento por ID
 */
export function useFormaPagamento(id: number, enabled = true) {
  return useQuery({
    queryKey: paymentKeys.formaPagamento(id),
    queryFn: () => paymentService.getFormaPagamentoById(id),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    enabled: enabled && !!id,
  })
}

/**
 * Hook para criar forma de pagamento
 */
export function useCreateFormaPagamento() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: FormaPagamentoInput) => paymentService.createFormaPagamento(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.formasPagamento() })
      toast.success("Forma de pagamento criada com sucesso!")
    },
    onError: (error: ApiError) => {
      const message = error.response?.data?.message || error.message || "Erro ao criar forma de pagamento"
      toast.error(message)
    },
  })
}

/**
 * Hook para atualizar forma de pagamento
 */
export function useUpdateFormaPagamento() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormaPagamentoInput }) => 
      paymentService.updateFormaPagamento(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.formasPagamento() })
      queryClient.invalidateQueries({ queryKey: paymentKeys.formaPagamento(id) })
      toast.success("Forma de pagamento atualizada com sucesso!")
    },
    onError: (error: ApiError) => {
      const message = error.response?.data?.message || error.message || "Erro ao atualizar forma de pagamento"
      toast.error(message)
    },
  })
}

/**
 * Hook para excluir forma de pagamento
 */
export function useDeleteFormaPagamento() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => paymentService.deleteFormaPagamento(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.formasPagamento() })
      toast.success("Forma de pagamento excluída com sucesso!")
    },
    onError: (error: ApiError) => {
      const message = error.response?.data?.message || error.message || "Erro ao excluir forma de pagamento"
      toast.error(message)
    },
  })
}

// ===============================
// TIPOS DE SERVIÇO HOOKS
// ===============================

/**
 * Hook para buscar tipos de serviço
 */
export function useTiposServico(enabled = true) {
  return useQuery({
    queryKey: paymentKeys.tiposServico(),
    queryFn: () => paymentService.getTiposServico(),
    staleTime: 15 * 60 * 1000, // 15 minutos (dados estáveis)
    gcTime: 30 * 60 * 1000, // 30 minutos
    retry: 2,
    enabled,
  })
}

// ===============================
// PAGAMENTOS PRINCIPAIS (PAGAMENTOI) HOOKS
// ===============================

/**
 * Hook para buscar pagamentos principais com filtros
 */
export function usePagamentois(params?: PaginationParams & PaymentFilters, enabled = true) {
  return useQuery({
    queryKey: paymentKeys.pagamentoisList(params),
    queryFn: () => paymentService.getPagamentois(params),
    staleTime: 2 * 60 * 1000, // 2 minutos (dados financeiros mudam frequentemente)
    gcTime: 5 * 60 * 1000,
    retry: 2,
    enabled,
  })
}

/**
 * Hook para buscar um pagamento principal por ID
 */
export function usePagamentoi(id: number, enabled = true) {
  return useQuery({
    queryKey: paymentKeys.pagamentoi(id),
    queryFn: () => paymentService.getPagamentoiById(id),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    enabled: enabled && !!id,
  })
}

/**
 * Hook para criar pagamento principal
 */
export function useCreatePagamentoi() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: PagamentoiInput) => paymentService.createPagamentoi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.pagamentois() })
      queryClient.invalidateQueries({ queryKey: paymentKeys.dashboard() })
      queryClient.invalidateQueries({ queryKey: paymentKeys.estatisticas() })
      toast.success("Pagamento criado com sucesso!")
    },
    onError: (error: ApiError) => {
      const message = error.response?.data?.message || error.message || "Erro ao criar pagamento"
      toast.error(message)
    },
  })
}

/**
 * Hook para atualizar pagamento principal
 */
export function useUpdatePagamentoi() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PagamentoiInput> }) => 
      paymentService.updatePagamentoi(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.pagamentois() })
      queryClient.invalidateQueries({ queryKey: paymentKeys.pagamentoi(id) })
      queryClient.invalidateQueries({ queryKey: paymentKeys.dashboard() })
      queryClient.invalidateQueries({ queryKey: paymentKeys.estatisticas() })
      toast.success("Pagamento atualizado com sucesso!")
    },
    onError: (error: ApiError) => {
      const message = error.response?.data?.message || error.message || "Erro ao atualizar pagamento"
      toast.error(message)
    },
  })
}

/**
 * Hook para excluir pagamento principal
 */
export function useDeletePagamentoi() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => paymentService.deletePagamentoi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.pagamentois() })
      queryClient.invalidateQueries({ queryKey: paymentKeys.dashboard() })
      queryClient.invalidateQueries({ queryKey: paymentKeys.estatisticas() })
      toast.success("Pagamento excluído com sucesso!")
    },
    onError: (error: ApiError) => {
      const message = error.response?.data?.message || error.message || "Erro ao excluir pagamento"
      toast.error(message)
    },
  })
}

// ===============================
// DETALHES DE PAGAMENTO (PAGAMENTOS) HOOKS
// ===============================

/**
 * Hook para buscar detalhes de pagamento com filtros
 */
export function usePagamentos(params?: PaginationParams & PaymentFilters, enabled = true) {
  return useQuery({
    queryKey: paymentKeys.pagamentosList(params),
    queryFn: () => paymentService.getPagamentos(params),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    enabled,
  })
}

/**
 * Hook para buscar um detalhe de pagamento por ID
 */
export function usePagamento(id: number, enabled = true) {
  return useQuery({
    queryKey: paymentKeys.pagamento(id),
    queryFn: () => paymentService.getPagamentoById(id),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    enabled: enabled && !!id,
  })
}

/**
 * Hook para criar detalhe de pagamento (pagamento unificado)
 */
export function useCreatePagamento() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: PagamentoDetalheInput) => paymentService.createPagamento(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.pagamentos() })
      queryClient.invalidateQueries({ queryKey: paymentKeys.pagamentois() })
      queryClient.invalidateQueries({ queryKey: paymentKeys.dashboard() })
      queryClient.invalidateQueries({ queryKey: paymentKeys.estatisticas() })
      queryClient.invalidateQueries({ queryKey: paymentKeys.alunosConfirmados() })
      toast.success("Pagamento registrado com sucesso!")
    },
    onError: (error: ApiError) => {
      const message = error.response?.data?.message || error.message || "Erro ao registrar pagamento"
      toast.error(message)
    },
  })
}

/**
 * Hook para atualizar detalhe de pagamento
 */
export function useUpdatePagamento() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PagamentoDetalheInput> }) => 
      paymentService.updatePagamento(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.pagamentos() })
      queryClient.invalidateQueries({ queryKey: paymentKeys.pagamento(id) })
      queryClient.invalidateQueries({ queryKey: paymentKeys.dashboard() })
      queryClient.invalidateQueries({ queryKey: paymentKeys.estatisticas() })
      toast.success("Pagamento atualizado com sucesso!")
    },
    onError: (error: ApiError) => {
      const message = error.response?.data?.message || error.message || "Erro ao atualizar pagamento"
      toast.error(message)
    },
  })
}

/**
 * Hook para excluir detalhe de pagamento
 */
export function useDeletePagamento() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => paymentService.deletePagamento(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.pagamentos() })
      queryClient.invalidateQueries({ queryKey: paymentKeys.dashboard() })
      queryClient.invalidateQueries({ queryKey: paymentKeys.estatisticas() })
      toast.success("Pagamento excluído com sucesso!")
    },
    onError: (error: ApiError) => {
      const message = error.response?.data?.message || error.message || "Erro ao excluir pagamento"
      toast.error(message)
    },
  })
}

// ===============================
// NOTAS DE CRÉDITO HOOKS
// ===============================

/**
 * Hook para buscar notas de crédito
 */
export function useNotasCredito(params?: PaginationParams, enabled = true) {
  return useQuery({
    queryKey: paymentKeys.notasCreditoList(params),
    queryFn: () => paymentService.getNotasCredito(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    enabled,
  })
}

/**
 * Hook para buscar uma nota de crédito por ID
 */
export function useNotaCredito(id: number, enabled = true) {
  return useQuery({
    queryKey: paymentKeys.notaCredito(id),
    queryFn: () => paymentService.getNotaCreditoById(id),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    enabled: enabled && !!id,
  })
}

/**
 * Hook para criar nota de crédito
 */
export function useCreateNotaCredito() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: NotaCreditoInput) => paymentService.createNotaCredito(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.notasCredito() })
      queryClient.invalidateQueries({ queryKey: paymentKeys.dashboard() })
      queryClient.invalidateQueries({ queryKey: paymentKeys.estatisticas() })
      queryClient.invalidateQueries({ queryKey: paymentKeys.pagamentos() }) // Invalidar lista de pagamentos
      // Invalidar meses pendentes do aluno específico
      queryClient.invalidateQueries({ queryKey: [...paymentKeys.all, 'meses-pendentes', data.codigo_aluno] })
      toast.success("Nota de crédito criada com sucesso!")
    },
    onError: (error: ApiError) => {
      const message = error.response?.data?.message || error.message || "Erro ao criar nota de crédito"
      toast.error(message)
    },
  })
}

/**
 * Hook para atualizar nota de crédito
 */
export function useUpdateNotaCredito() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<NotaCreditoInput> }) => 
      paymentService.updateNotaCredito(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.notasCredito() })
      queryClient.invalidateQueries({ queryKey: paymentKeys.notaCredito(id) })
      queryClient.invalidateQueries({ queryKey: paymentKeys.dashboard() })
      toast.success("Nota de crédito atualizada com sucesso!")
    },
    onError: (error: ApiError) => {
      const message = error.response?.data?.message || error.message || "Erro ao atualizar nota de crédito"
      toast.error(message)
    },
  })
}

/**
 * Hook para excluir nota de crédito
 */
export function useDeleteNotaCredito() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => paymentService.deleteNotaCredito(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.notasCredito() })
      queryClient.invalidateQueries({ queryKey: paymentKeys.dashboard() })
      toast.success("Nota de crédito excluída com sucesso!")
    },
    onError: (error: ApiError) => {
      const message = error.response?.data?.message || error.message || "Erro ao excluir nota de crédito"
      toast.error(message)
    },
  })
}

// ===============================
// MOTIVOS DE ANULAÇÃO HOOKS
// ===============================

/**
 * Hook para buscar motivos de anulação
 */
export function useMotivosAnulacao(params?: PaginationParams, enabled = true) {
  return useQuery({
    queryKey: paymentKeys.motivosAnulacaoList(params),
    queryFn: () => paymentService.getMotivosAnulacao(params),
    staleTime: 15 * 60 * 1000, // 15 minutos (dados estáveis)
    gcTime: 30 * 60 * 1000,
    retry: 2,
    enabled,
  })
}

/**
 * Hook para buscar um motivo de anulação por ID
 */
export function useMotivoAnulacao(id: number, enabled = true) {
  return useQuery({
    queryKey: paymentKeys.motivoAnulacao(id),
    queryFn: () => paymentService.getMotivoAnulacaoById(id),
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
    enabled: enabled && !!id,
  })
}

/**
 * Hook para criar motivo de anulação
 */
export function useCreateMotivoAnulacao() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: MotivoAnulacaoInput) => paymentService.createMotivoAnulacao(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.motivosAnulacao() })
      toast.success("Motivo de anulação criado com sucesso!")
    },
    onError: (error: ApiError) => {
      const message = error.response?.data?.message || error.message || "Erro ao criar motivo de anulação"
      toast.error(message)
    },
  })
}

/**
 * Hook para atualizar motivo de anulação
 */
export function useUpdateMotivoAnulacao() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<MotivoAnulacaoInput> }) => 
      paymentService.updateMotivoAnulacao(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.motivosAnulacao() })
      queryClient.invalidateQueries({ queryKey: paymentKeys.motivoAnulacao(id) })
      toast.success("Motivo de anulação atualizado com sucesso!")
    },
    onError: (error: ApiError) => {
      const message = error.response?.data?.message || error.message || "Erro ao atualizar motivo de anulação"
      toast.error(message)
    },
  })
}

/**
 * Hook para excluir motivo de anulação
 */
export function useDeleteMotivoAnulacao() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => paymentService.deleteMotivoAnulacao(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.motivosAnulacao() })
      toast.success("Motivo de anulação excluído com sucesso!")
    },
    onError: (error: ApiError) => {
      const message = error.response?.data?.message || error.message || "Erro ao excluir motivo de anulação"
      toast.error(message)
    },
  })
}

// ===============================
// ALUNOS CONFIRMADOS HOOKS
// ===============================

/**
 * Hook para buscar alunos confirmados
 * Otimizado com cache agressivo para melhor performance
 */
export function useAlunosConfirmados(
  params?: PaginationParams & { codigo_Ano_lectivo?: number },
  enabled = true
) {
  return useQuery({
    queryKey: paymentKeys.alunosConfirmadosList(params),
    queryFn: () => paymentService.getAlunosConfirmados(params),
    staleTime: 5 * 60 * 1000, // 5 minutos - cache mais agressivo
    gcTime: 10 * 60 * 1000, // 10 minutos - mantém em cache por mais tempo
    retry: 2,
    enabled,
    refetchOnWindowFocus: false, // Evita refetch ao focar a janela
    refetchOnMount: false, // Usa cache se disponível
  })
}

/**
 * Hook para buscar dados financeiros de um aluno
 */
export function useDadosFinanceirosAluno(
  alunoId: number,
  anoLectivoId?: number,
  enabled = true
) {
  return useQuery({
    queryKey: paymentKeys.dadosFinanceiros(alunoId, anoLectivoId),
    queryFn: () => paymentService.getDadosFinanceirosAluno(alunoId, anoLectivoId),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    enabled: enabled && !!alunoId,
  })
}

/**
 * Hook para buscar meses pendentes de um aluno
 */
export function useMesesPendentes(
  alunoId: number,
  codigoAnoLectivo?: number,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: paymentKeys.mesesPendentes(alunoId, codigoAnoLectivo),
    queryFn: () => paymentService.getMesesPendentes(alunoId, codigoAnoLectivo),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    enabled: (options?.enabled ?? true) && !!alunoId,
  })
}

// ===============================
// DASHBOARD E ESTATÍSTICAS HOOKS
// ===============================

/**
 * Hook para buscar dados do dashboard financeiro
 */
export function useDashboardFinanceiro(enabled = true) {
  return useQuery({
    queryKey: paymentKeys.dashboard(),
    queryFn: () => paymentService.getDashboardFinanceiro(),
    staleTime: 1 * 60 * 1000, // 1 minuto (dashboard precisa de dados frescos)
    gcTime: 5 * 60 * 1000,
    retry: 2,
    enabled,
  })
}

/**
 * Hook para buscar estatísticas de pagamentos
 */
export function useEstatisticasPagamentos(periodo = "30", enabled = true) {
  return useQuery({
    queryKey: paymentKeys.estatisticas(periodo),
    queryFn: () => paymentService.getEstatisticasPagamentos(periodo),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    enabled,
  })
}

// ===============================
// RELATÓRIOS HOOKS
// ===============================

/**
 * Hook para gerar relatório financeiro
 */
export function useRelatorioFinanceiro(
  tipo: 'resumo' | 'detalhado' | 'por_aluno' | 'por_servico',
  filters: PaymentFilters,
  enabled = true
) {
  return useQuery({
    queryKey: paymentKeys.relatorioFinanceiro(tipo, filters),
    queryFn: () => paymentService.getRelatorioFinanceiro(tipo, filters),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    enabled,
  })
}

/**
 * Hook para buscar relatório de vendas por funcionário
 */
export function useRelatorioVendasFuncionarios(
  periodo = 'diario',
  dataInicio?: string,
  dataFim?: string,
  enabled = true
) {
  return useQuery({
    queryKey: paymentKeys.relatorioVendas(periodo, dataInicio, dataFim),
    queryFn: () => paymentService.getRelatorioVendasFuncionarios(periodo, dataInicio, dataFim),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    enabled,
  })
}

/**
 * Hook para buscar relatório detalhado de vendas de um funcionário
 */
export function useRelatorioVendasDetalhado(
  funcionarioId: number,
  periodo = 'diario',
  dataInicio?: string,
  dataFim?: string,
  enabled = true
) {
  return useQuery({
    queryKey: paymentKeys.relatorioVendasDetalhado(funcionarioId, periodo, dataInicio, dataFim),
    queryFn: () => paymentService.getRelatorioVendasDetalhado(funcionarioId, periodo, dataInicio, dataFim),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    enabled: enabled && !!funcionarioId,
  })
}

// ===============================
// UTILIDADES HOOKS
// ===============================

/**
 * Hook para gerar PDF de fatura
 */
export function useGerarFaturaPDF() {
  return useMutation({
    mutationFn: (pagamentoId: number) => paymentService.gerarFaturaPDF(pagamentoId),
    onSuccess: (blob, pagamentoId) => {
      // Cria URL temporária e inicia download
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `fatura-${pagamentoId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success("Fatura gerada com sucesso!")
    },
    onError: (error: ApiError) => {
      const message = error.response?.data?.message || error.message || "Erro ao gerar fatura"
      toast.error(message)
    },
  })
}

/**
 * Hook para validar número de borderô
 */
export function useValidateBordero() {
  return useMutation({
    mutationFn: ({ bordero, excludeId }: { bordero: string; excludeId?: number }) => 
      paymentService.validateBordero(bordero, excludeId),
  })
}

// ===============================
// HOOKS ADICIONAIS (COMPATIBILIDADE JOMORAIS-FRONTEND)
// ===============================

/**
 * Hook para gerar fatura térmica em PDF (80mm) usando jsPDF
 * Gera PDF profissional e abre janela de impressão/download
 */
export function useGenerateInvoicePDF() {
  return useMutation({
    mutationFn: async (paymentId: number) => {
      // Buscar dados do pagamento
      const paymentResponse = await paymentService.getPagamentoById(paymentId)
      
      if (!paymentResponse.success || !paymentResponse.data) {
        throw new Error('Pagamento não encontrado')
      }
      
      const payment = paymentResponse.data
      
      // Buscar dados completos do aluno se necessário
      let dadosAcademicos: { curso: string; classe: string; turma: string } | undefined = undefined
      if (payment.codigo_Aluno) {
        try {
          const alunoResponse = await paymentService.getDadosFinanceirosAluno(payment.codigo_Aluno)
          if (alunoResponse.success && alunoResponse.data) {
            const data = alunoResponse.data
            dadosAcademicos = {
              curso: data.anoLectivo?.designacao || 'Curso não especificado',
              classe: data.turma?.classe?.designacao || 'Classe não especificada',
              turma: data.turma?.designacao || 'Turma não especificada'
            }
          }
        } catch (error) {
          console.error('Erro ao buscar dados completos do aluno:', error)
        }
      }
      
      // Preparar meses pagos
      const mesesPagos = payment.mes ? [`${payment.mes}-${payment.ano}`] : []
      
      // Obter nome do operador logado
      let nomeOperador = 'Sistema'
      try {
        const userData = localStorage.getItem('user')
        if (userData) {
          const user = JSON.parse(userData)
          nomeOperador = user.nome || user.username || 'Sistema'
        }
      } catch (error) {
        console.error('Erro ao obter dados do usuário:', error)
      }
      
      // Preparar dados para o serviço de fatura térmica
      const thermalData: ThermalInvoiceData = {
        pagamento: {
          codigo: payment.codigo,
          fatura: payment.fatura || `FAT_${Date.now()}`,
          data: payment.data || new Date().toISOString(),
          mes: payment.mes || '',
          ano: payment.ano || new Date().getFullYear(),
          preco: payment.preco || 0,
          observacao: payment.observacao,
          aluno: {
            codigo: payment.codigo_Aluno,
            nome: payment.aluno?.nome || 'Aluno não identificado',
            n_documento_identificacao: payment.aluno?.n_documento_identificacao
          },
          tipoServico: {
            designacao: payment.tipoServico?.designacao || 'Serviço'
          },
          formaPagamento: {
            designacao: payment.formaPagamento?.designacao || 'DINHEIRO'
          },
          contaMovimentada: payment.contaMovimentada || undefined,
          n_Bordoro: payment.n_Bordoro || undefined,
          mesesPagos
        },
        dadosAcademicos,
        operador: nomeOperador
      }
      
      return thermalData
    },
    onSuccess: async (thermalData) => {
      // Gerar PDF térmico usando jsPDF
      await ThermalInvoiceService.generateThermalPDF(thermalData)
      toast.success("Fatura térmica gerada com sucesso!")
    },
    onError: (error: ApiError) => {
      const message = error.response?.data?.message || error.message || "Erro ao gerar fatura"
      toast.error(message)
    },
  })
}

/**
 * Hook para gerar e imprimir fatura térmica diretamente
 */
export function useGenerateAndPrintInvoicePDF() {
  return useMutation({
    mutationFn: async (paymentId: number) => {
      // Buscar dados do pagamento
      const paymentResponse = await paymentService.getPagamentoById(paymentId)
      
      if (!paymentResponse.success || !paymentResponse.data) {
        throw new Error('Pagamento não encontrado')
      }
      
      const payment = paymentResponse.data
      
      // Buscar dados completos do aluno
      let dadosAcademicos: { curso: string; classe: string; turma: string } | undefined = undefined
      if (payment.codigo_Aluno) {
        try {
          const alunoResponse = await paymentService.getDadosFinanceirosAluno(payment.codigo_Aluno)
          if (alunoResponse.success && alunoResponse.data) {
            const data = alunoResponse.data
            dadosAcademicos = {
              curso: data.anoLectivo?.designacao || 'Curso não especificado',
              classe: data.turma?.classe?.designacao || 'Classe não especificada',
              turma: data.turma?.designacao || 'Turma não especificada'
            }
          }
        } catch (error) {
          console.error('Erro ao buscar dados completos do aluno:', error)
        }
      }
      
      // Preparar meses pagos
      const mesesPagos = payment.mes ? [`${payment.mes}-${payment.ano}`] : []
      
      // Obter nome do operador logado
      let nomeOperador = 'Sistema'
      try {
        const userData = localStorage.getItem('user')
        if (userData) {
          const user = JSON.parse(userData)
          nomeOperador = user.nome || user.username || 'Sistema'
        }
      } catch (error) {
        console.error('Erro ao obter dados do usuário:', error)
      }
      
      // Preparar dados para o serviço de fatura térmica
      const thermalData: ThermalInvoiceData = {
        pagamento: {
          codigo: payment.codigo,
          fatura: payment.fatura || `FAT_${Date.now()}`,
          data: payment.data || new Date().toISOString(),
          mes: payment.mes || '',
          ano: payment.ano || new Date().getFullYear(),
          preco: payment.preco || 0,
          observacao: payment.observacao,
          aluno: {
            codigo: payment.codigo_Aluno,
            nome: payment.aluno?.nome || 'Aluno não identificado',
            n_documento_identificacao: payment.aluno?.n_documento_identificacao
          },
          tipoServico: {
            designacao: payment.tipoServico?.designacao || 'Serviço'
          },
          formaPagamento: {
            designacao: payment.formaPagamento?.designacao || 'DINHEIRO'
          },
          contaMovimentada: payment.contaMovimentada || undefined,
          n_Bordoro: payment.n_Bordoro || undefined,
          mesesPagos
        },
        dadosAcademicos,
        operador: nomeOperador
      }
      
      return thermalData
    },
    onSuccess: async (thermalData) => {
      // Gerar e abrir PDF para impressão
      await ThermalInvoiceService.generateAndPrintThermalPDF(thermalData)
      toast.success("Fatura térmica aberta para impressão!")
    },
    onError: (error: ApiError) => {
      const message = error.response?.data?.message || error.message || "Erro ao gerar fatura"
      toast.error(message)
    },
  })
}

// ===============================
// INTERFACES ADICIONAIS (COMPATIBILIDADE)
// ===============================

/**
 * Interface para dados de pagamento simplificado
 */
export interface IPayment {
  codigo: number
  codigo_Aluno: number
  codigo_Tipo_Servico: number
  data: string
  mes: string
  ano: number
  preco: number
  observacao: string
  fatura: string
  aluno?: {
    codigo: number
    nome: string
    n_documento_identificacao: string
  }
  tipoServico?: {
    codigo: number
    designacao: string
  }
  formaPagamento?: {
    codigo: number
    designacao: string
  }
  contaMovimentada?: string
  n_Bordoro?: string
}

/**
 * Interface para dados de criação de pagamento
 */
export interface ICreatePaymentData {
  codigo_Aluno: number
  codigo_Tipo_Servico: number
  mes: string
  ano: number
  preco: number
  observacao?: string
  codigo_FormaPagamento?: number
}

/**
 * Interface para aluno confirmado (compatibilidade)
 */
export interface IStudentConfirmed {
  codigo: number
  nome: string
  n_documento_identificacao: string
  email: string
  telefone: string
  tb_matriculas: {
    codigo: number
    tb_cursos: {
      codigo: number
      designacao: string
    }
    tb_confirmacoes: Array<{
      tb_turmas: {
        codigo: number
        designacao: string
        tb_classes: {
          designacao: string
        }
      }
    }>
  }
}

/**
 * Interface para dados financeiros de aluno (compatibilidade)
 */
export interface IStudentFinancialData {
  aluno: {
    codigo: number
    nome: string
    documento: string
    email: string
    telefone: string
    curso: string
    turma: string
    classe: string
  }
  mesesPropina: Array<{
    mes: string
    status: 'PAGO' | 'NÃO_PAGO'
    valor: number
    dataPagamento: string | null
    codigoPagamento: number | null
  }>
  historicoFinanceiro: Array<{
    codigo: number
    data: string
    servico: string
    valor: number
    observacao: string
    fatura: string
  }>
  resumo: {
    totalMeses: number
    mesesPagos: number
    mesesPendentes: number
    valorMensal: number
    totalPago: number
    totalPendente: number
  }
}

// Exportações de tipos para facilitar importação
export type {
  FormaPagamento,
  TipoServico,
  Pagamentoi,
  PagamentoDetalhe,
  NotaCredito,
  MotivoAnulacao,
  AlunoConfirmado,
  DadosFinanceirosAluno,
  MesPendente,
  DashboardFinanceiro,
  EstatisticasFinanceiras,
  RelatorioFinanceiro,
  RelatorioVendasFuncionario,
}
