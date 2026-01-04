// Interfaces para gestão de pagamentos

// ===============================
// FORMA DE PAGAMENTO
// ===============================

export interface FormaPagamento {
  codigo: number;
  designacao: string;
}

export interface FormaPagamentoInput {
  designacao: string;
}

// ===============================
// TIPO DE SERVIÇO
// ===============================

export interface TipoServico {
  codigo: number;
  designacao: string;
  preco?: number;
  descricao?: string;
  categoria?: string;
}

// ===============================
// PAGAMENTO PRINCIPAL (tb_pagamentoi)
// ===============================

export interface Pagamentoi {
  codigo: number;
  data: string;
  codigo_Aluno: number;
  status: number;
  total: number;
  valorEntregue: number;
  dataBanco?: string | null;
  totalDesconto: number;
  obs?: string | null;
  borderoux?: string | null;
  saldoAnterior: number;
  descontoSaldo: number;
  saldo: number;
  codigoPagamento: number;
  saldoOperacao: number;
  codigoUtilizador?: number | null;
  hash?: string | null;
  tipoDocumento?: string | null;
  totalIva?: number | null;
  nifCliente?: string | null;
  troco?: number | null;
  tb_pagamentos?: PagamentoDetalhe[];
  tb_nota_credito?: NotaCredito[];
}

export interface PagamentoiInput {
  data: string;
  codigo_Aluno: number;
  status: number;
  total: number;
  valorEntregue: number;
  dataBanco?: string | null;
  totalDesconto?: number;
  obs?: string | null;
  borderoux?: string | null;
  saldoAnterior?: number;
  descontoSaldo?: number;
  saldo?: number;
  codigoPagamento?: number;
  saldoOperacao?: number;
  codigoUtilizador?: number;
  hash?: string;
  tipoDocumento?: string;
  totalIva?: number;
  nifCliente?: string;
  troco?: number;
}

// ===============================
// DETALHE DE PAGAMENTO (tb_pagamentos)
// ===============================

export interface PagamentoDetalhe {
  codigo: number;
  codigo_Aluno: number;
  codigo_Tipo_Servico?: number | null;
  data: string;
  n_Bordoro?: string | null;
  multa: number;
  mes?: string | null;
  codigo_Utilizador: number;
  observacao: string;
  ano: number;
  contaMovimentada?: string | null;
  quantidade?: number | null;
  desconto?: number | null;
  totalgeral: number;
  dataBanco?: string | null;
  codigo_Estatus: number;
  codigo_Empresa: number;
  codigo_FormaPagamento: number;
  saldo_Anterior: number;
  codigoPagamento: number;
  descontoSaldo: number;
  tipoDocumento?: string | null;
  next?: string | null;
  codoc: number;
  fatura?: string | null;
  taxa_iva?: number | null;
  hash?: string | null;
  preco: number;
  indice_mes?: number | null;
  indice_ano?: number | null;
  aluno?: {
    codigo: number;
    nome: string;
    n_documento_identificacao?: string;
  };
  tipoServico?: TipoServico;
  formaPagamento?: FormaPagamento;
  utilizador?: {
    codigo: number;
    nome: string;
  };
  pagamento?: {
    codigo: number;
    data: string;
    total: number;
  };
}

export interface PagamentoDetalheInput {
  codigo_Aluno: number;
  codigo_Tipo_Servico?: number;
  data: string;
  n_Bordoro?: string;
  multa?: number;
  mes?: string;
  codigo_Utilizador: number;
  observacao?: string;
  ano?: number;
  contaMovimentada?: string;
  quantidade?: number;
  desconto?: number;
  totalgeral: number;
  dataBanco?: string;
  codigo_Estatus?: number;
  codigo_Empresa?: number;
  codigo_FormaPagamento?: number;
  saldo_Anterior?: number;
  codigoPagamento: number;
  descontoSaldo?: number;
  tipoDocumento?: string;
  next?: string;
  codoc?: number;
  fatura?: string;
  taxa_iva?: number;
  hash?: string;
  preco?: number;
  indice_mes?: number;
  indice_ano?: number;
}

// ===============================
// NOTA DE CRÉDITO
// ===============================

export interface NotaCredito {
  codigo: number;
  designacao: string;
  codigo_aluno: number;
  codigoPagamentoi?: number | null;
  valor: number;
  data: string;
  motivo?: string | null;
  status: number;
  tipo?: string | null;
  fatura?: string | null;
  documento?: string | null;
  next?: string | null;
  hash?: string | null;
  tb_alunos?: {
    codigo: number;
    nome: string;
    n_documento_identificacao?: string;
  };
}

export interface NotaCreditoInput {
  designacao: string;
  fatura: string;
  descricao: string;
  valor: string;
  codigo_aluno: number;
  documento: string;
  next?: string;
  dataOperacao?: string;
  hash?: string;
  codigoPagamentoi?: number;
  pagamento_ref?: string;
}

// ===============================
// MOTIVO DE ANULAÇÃO
// ===============================

export interface MotivoAnulacao {
  codigo: number;
  designacao: string;
  descricao?: string | null;
}

export interface MotivoAnulacaoInput {
  designacao: string;
  descricao?: string;
}

// ===============================
// ALUNO CONFIRMADO (Para listagem de pagamentos)
// ===============================

export interface AlunoConfirmado {
  codigo: number;
  nome: string;
  n_documento_identificacao?: string;
  sexo: string;
  dataNascimento: string;
  email?: string;
  telefone?: string;
  url_Foto?: string;
  confirmacao?: {
    codigo: number;
    codigo_Turma: number;
    codigo_Ano_lectivo: number;
    turma?: {
      codigo: number;
      designacao: string;
      tb_classes?: {
        codigo: number;
        designacao: string;
      };
    };
  };
  dadosFinanceiros?: {
    totalPago: number;
    totalPendente: number;
    mesesPagos: number;
    mesesPendentes: number;
    saldoAtual: number;
    propinaMensal?: number;
  };
}

// ===============================
// DADOS FINANCEIROS DO ALUNO
// ===============================

export interface DadosFinanceirosAluno {
  aluno: {
    codigo: number;
    nome: string;
    n_documento_identificacao?: string;
  };
  turma?: {
    codigo: number;
    designacao: string;
    classe?: {
      codigo: number;
      designacao: string;
    };
  };
  anoLectivo?: {
    codigo: number;
    designacao: string;
  };
  propinaMensal?: number;
  totalPago: number;
  totalPendente: number;
  mesesPagos: string[];
  mesesPendentes: string[];
  saldoAtual: number;
  pagamentos: PagamentoDetalhe[];
  notasCredito: NotaCredito[];
}

// ===============================
// MÊS PENDENTE
// ===============================

export interface MesPendente {
  mes: string;
  ano: number;
  valor: number;
  multa?: number;
  status: 'pendente' | 'pago' | 'parcial';
  dataPagamento?: string;
  indiceMes: number;
}

// ===============================
// ESTATÍSTICAS FINANCEIRAS
// ===============================

export interface EstatisticasFinanceiras {
  totalRecebido: number;
  totalPendente: number;
  totalNotasCredito: number;
  pagamentosRealizados: number;
  alunosComPendencias: number;
  receitaMensal: {
    mes: string;
    valor: number;
  }[];
}

// ===============================
// DASHBOARD FINANCEIRO
// ===============================

export interface DashboardFinanceiro {
  resumo: {
    totalRecebido: number;
    totalPendente: number;
    pagamentosHoje: number;
    receitaMensal: number;
  };
  porFormaPagamento: {
    forma: string;
    total: number;
    quantidade: number;
  }[];
  porTipoServico: {
    servico: string;
    total: number;
    quantidade: number;
  }[];
  tendencia: {
    data: string;
    valor: number;
  }[];
}

// ===============================
// RELATÓRIO FINANCEIRO
// ===============================

export interface RelatorioFinanceiro {
  tipo: 'resumo' | 'detalhado' | 'por_aluno' | 'por_servico';
  periodo: {
    inicio: string;
    fim: string;
  };
  dados: unknown;
  totalizadores: {
    totalGeral: number;
    totalDescontos: number;
    totalLiquido: number;
    quantidadePagamentos: number;
  };
}

export interface RelatorioVendasFuncionario {
  funcionario: {
    codigo: number;
    nome: string;
  };
  periodo: string;
  totalizadores: {
    totalVendas: number;
    quantidadeVendas: number;
    ticketMedio: number;
  };
  porFormaPagamento: {
    forma: string;
    total: number;
    quantidade: number;
  }[];
  porTipoServico: {
    servico: string;
    total: number;
    quantidade: number;
  }[];
}

// ===============================
// FILTROS E PAGINAÇÃO
// ===============================

export interface PaymentFilters {
  search?: string;
  codigo_Aluno?: number;
  codigo_Tipo_Servico?: number;
  tipo_servico?: string;
  status?: number | string;
  codigoPagamento?: number;
  n_Bordoro?: string;
  dataInicio?: string;
  dataFim?: string;
  codigo_FormaPagamento?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: string | number | undefined;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

// ===============================
// RESPOSTAS DA API
// ===============================

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: Pagination;
}

// Type aliases para respostas paginadas específicas
export type FormaPagamentoResponse = PaginatedResponse<FormaPagamento>;
export type PagamentoiResponse = PaginatedResponse<Pagamentoi>;
export type PagamentoDetalheResponse = PaginatedResponse<PagamentoDetalhe>;
export type NotaCreditoResponse = PaginatedResponse<NotaCredito>;
export type MotivoAnulacaoResponse = PaginatedResponse<MotivoAnulacao>;
export type AlunoConfirmadoResponse = PaginatedResponse<AlunoConfirmado>;
