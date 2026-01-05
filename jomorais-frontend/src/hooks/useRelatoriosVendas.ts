import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api.utils';

export interface RelatorioVendasFuncionario {
  funcionarioId: number;
  funcionarioNome: string;
  funcionarioUser: string;
  totalVendas: number;
  quantidadePagamentos: number;
  percentualDoTotal?: string; // Percentual das vendas em relação ao total geral
  pagamentos: Array<{
    codigo: number;
    aluno: string;
    tipoServico: string;
    valor: number;
    mes: string;
    ano: number;
    data: string;
    formaPagamento: string;
  }>;
}

export interface RelatorioVendasGeral {
  periodo: string;
  dataInicio: string;
  dataFim: string;
  totalGeral: number;
  totalPagamentos: number;
  funcionarios: RelatorioVendasFuncionario[];
  resumo: {
    melhorFuncionario: RelatorioVendasFuncionario | null;
    totalFuncionarios: number;
    mediaVendasPorFuncionario: number;
  };
}

export interface RelatorioVendasDetalhado {
  funcionario: {
    codigo: number;
    nome: string;
    user: string;
  };
  periodo: string;
  dataInicio: string;
  dataFim: string;
  totalVendas: number;
  quantidadePagamentos: number;
  pagamentos: Array<{
    codigo: number;
    aluno: string;
    tipoServico: string;
    valor: number;
    mes: string;
    ano: number;
    data: string;
    formaPagamento: string;
    fatura: string;
  }>;
}

// Query keys
const relatorioKeys = {
  all: ['relatorios-vendas'] as const,
  geral: (periodo: string, dataInicio?: string, dataFim?: string) => 
    [...relatorioKeys.all, 'geral', periodo, dataInicio, dataFim] as const,
  detalhado: (funcionarioId: number, periodo: string, dataInicio?: string, dataFim?: string) => 
    [...relatorioKeys.all, 'detalhado', funcionarioId, periodo, dataInicio, dataFim] as const,
};

// Tipo para período
export type PeriodoRelatorio = 'diario' | 'semanal' | 'mensal' | 'anual' | 'personalizado';

// API Functions
const fetchRelatorioGeral = async (
  periodo: PeriodoRelatorio,
  dataInicio?: string,
  dataFim?: string
): Promise<RelatorioVendasGeral> => {
  const params = new URLSearchParams();
  params.append('periodo', periodo);
  
  if (dataInicio) params.append('dataInicio', dataInicio);
  if (dataFim) params.append('dataFim', dataFim);
  
  const response = await api.get(`/api/payment-management/relatorios/vendas-funcionarios?${params.toString()}`);
  
  if (response.data.success) {
    return response.data.data;
  } else {
    throw new Error(response.data.message || 'Erro ao buscar relatório');
  }
};

const fetchRelatorioDetalhado = async (
  funcionarioId: number,
  periodo: PeriodoRelatorio,
  dataInicio?: string,
  dataFim?: string
): Promise<RelatorioVendasDetalhado> => {
  const params = new URLSearchParams();
  params.append('periodo', periodo);
  
  if (dataInicio) params.append('dataInicio', dataInicio);
  if (dataFim) params.append('dataFim', dataFim);
  
  const response = await api.get(`/api/payment-management/relatorios/vendas-funcionario/${funcionarioId}?${params.toString()}`);
  
  if (response.data.success) {
    return response.data.data;
  } else {
    throw new Error(response.data.message || 'Erro ao buscar relatório detalhado');
  }
};

// Hook para relatório geral
export const useRelatorioVendasGeral = (
  periodo: PeriodoRelatorio = 'diario',
  dataInicio?: string,
  dataFim?: string,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: relatorioKeys.geral(periodo, dataInicio, dataFim),
    queryFn: () => fetchRelatorioGeral(periodo, dataInicio, dataFim),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos (anteriormente cacheTime)
    enabled: options?.enabled !== false,
    retry: 2,
    retryDelay: 1000,
  });
};

// Hook para relatório detalhado
export const useRelatorioVendasDetalhado = (
  funcionarioId: number | null,
  periodo: PeriodoRelatorio = 'diario',
  dataInicio?: string,
  dataFim?: string,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: funcionarioId ? relatorioKeys.detalhado(funcionarioId, periodo, dataInicio, dataFim) : ['disabled'],
    queryFn: () => funcionarioId ? fetchRelatorioDetalhado(funcionarioId, periodo, dataInicio, dataFim) : Promise.reject('No funcionarioId'),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    enabled: !!funcionarioId && options?.enabled !== false,
    retry: 2,
    retryDelay: 1000,
  });
};

// Hook auxiliar para invalidar cache
export const useRelatoriosVendasActions = () => {
  const queryClient = useQueryClient();

  const invalidateRelatorioGeral = () => {
    queryClient.invalidateQueries({ queryKey: [...relatorioKeys.all, 'geral'] });
  };

  const invalidateRelatorioDetalhado = (funcionarioId?: number) => {
    if (funcionarioId) {
      queryClient.invalidateQueries({ queryKey: [...relatorioKeys.all, 'detalhado', funcionarioId] });
    } else {
      queryClient.invalidateQueries({ queryKey: [...relatorioKeys.all, 'detalhado'] });
    }
  };

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: relatorioKeys.all });
  };

  return {
    invalidateRelatorioGeral,
    invalidateRelatorioDetalhado,
    invalidateAll,
  };
};

// Mantido para compatibilidade com código existente (deprecated)
export const useRelatoriosVendas = () => {
  console.warn('useRelatoriosVendas está deprecated. Use useRelatorioVendasGeral ou useRelatorioVendasDetalhado');
  
  return {
    loading: false,
    error: null,
    relatorioGeral: null,
    relatorioDetalhado: null,
    fetchRelatorioGeral: async () => {},
    fetchRelatorioDetalhado: async () => {},
    clearRelatorios: () => {},
  };
};
