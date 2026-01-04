// ===============================
// INTERFACES PARA SERVIÇOS FINANCEIROS
// ===============================

// Moeda
export interface IMoeda {
  codigo: number;
  designacao: string;
  simbolo?: string;
  activo?: boolean;
  dataCriacao?: string;
  dataActualizacao?: string;
  _count?: {
    tb_tipo_servicos: number;
  };
}

export interface IMoedaInput {
  designacao: string;
  simbolo?: string;
  activo?: boolean;
}

export interface IMoedaResponse {
  success: boolean;
  message: string;
  data: IMoeda;
}

export interface IMoedaListResponse {
  success: boolean;
  message: string;
  data: IMoeda[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Categoria de Serviço
export interface ICategoriaServico {
  codigo: number;
  designacao: string;
  _count?: {
    tb_tipo_servicos: number;
  };
}

export interface ICategoriaServicoInput {
  designacao: string;
}

export interface ICategoriaServicoResponse {
  success: boolean;
  message: string;
  data: ICategoriaServico;
}

export interface ICategoriaServicoListResponse {
  success: boolean;
  message: string;
  data: ICategoriaServico[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Tipo de Serviço (Principal)
export interface ITipoServico {
  codigo: number;
  designacao: string;
  preco: number;
  descricao: string;
  codigo_Utilizador: number;
  codigo_Moeda: number;
  tipoServico: string; // "Propina", "Taxa", "Multa", "Certificado", "Outro"
  status: string; // "Activo", "Inactivo"
  aplicarMulta: boolean;
  aplicarDesconto: boolean;
  codigo_Ano: number;
  codigoAnoLectivo?: number | null;
  valorMulta: number;
  iva?: number | null;
  codigoRasao?: number | null;
  categoria?: number | null;
  codigo_multa?: number | null;
  // Relacionamentos
  tb_moedas?: {
    codigo: number;
    designacao: string;
  };
  tb_categoria_servicos?: {
    codigo: number;
    designacao: string;
  } | null;
  _count?: {
    tb_servicos_turma: number;
    tb_servico_aluno: number;
    tb_propina_classe: number;
  };
}

export interface ITipoServicoInput {
  designacao: string;
  preco: number;
  descricao: string;
  codigo_Utilizador: number;
  codigo_Moeda: number;
  tipoServico: string;
  status?: string;
  aplicarMulta?: boolean;
  aplicarDesconto?: boolean;
  codigo_Ano?: number;
  codigoAnoLectivo?: number | null;
  valorMulta?: number;
  iva?: number | null;
  codigoRasao?: number | null;
  categoria?: number | null;
  codigo_multa?: number | null;
}

export interface ITipoServicoResponse {
  success: boolean;
  message: string;
  data: ITipoServico;
}

export interface ITipoServicoListResponse {
  success: boolean;
  message: string;
  data: ITipoServico[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Filtros para busca
export interface ITipoServicoFilter {
  search?: string;
  tipoServico?: string;
  status?: string;
  categoria?: number;
  moeda?: number;
}

// Relatório Financeiro
export interface IRelatorioFinanceiro {
  resumo: {
    totalMoedas: number;
    totalCategorias: number;
    totalTiposServicos: number;
    servicosAtivos: number;
    servicosComMulta: number;
    servicosComDesconto: number;
    totalArrecadado?: number; // Campo opcional até API ser atualizada
    servicosPagos?: number; // Campo opcional até API ser atualizada
    servicosPendentes?: number; // Campo opcional até API ser atualizada
    servicosAtrasados?: number; // Campo opcional até API ser atualizada
  };
}

export interface IRelatorioFinanceiroResponse {
  success: boolean;
  message: string;
  data: IRelatorioFinanceiro;
}

// Enums para facilitar uso
export const TipoServicoEnum = {
  PROPINA: 'Propina',
  TAXA: 'Taxa',
  MULTA: 'Multa',
  CERTIFICADO: 'Certificado',
  OUTRO: 'Outro'
} as const;

export const StatusServicoEnum = {
  ACTIVO: 'Activo',
  INACTIVO: 'Inactivo'
} as const;

export type TipoServicoType = typeof TipoServicoEnum[keyof typeof TipoServicoEnum];
export type StatusServicoType = typeof StatusServicoEnum[keyof typeof StatusServicoEnum];

// ===============================
// INTERFACES PARA PAGAMENTOS PRINCIPAIS
// ===============================

// Pagamento Principal (tb_pagamentoi)
export interface IPagamentoPrincipalInput {
  data: string; // YYYY-MM-DD
  codigo_Aluno: number;
  status: number;
  total?: number;
  valorEntregue: number;
  dataBanco: string; // YYYY-MM-DD
  totalDesconto?: number;
  obs?: string;
  borderoux?: string;
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

export interface IPagamentoPrincipal extends IPagamentoPrincipalInput {
  codigo: number;
  tb_pagamentos?: any[];
  tb_nota_credito?: any[];
  // Relacionamentos para compatibilidade
  aluno?: {
    codigo: number;
    nome: string;
  };
  tb_alunos?: {
    codigo: number;
    nome: string;
    numeroMatricula?: string;
  };
  detalhes?: Array<{
    tipoServico?: {
      codigo: number;
      designacao: string;
    };
  }>;
}

export interface IPagamentoPrincipalResponse {
  success: boolean;
  message: string;
  data: IPagamentoPrincipal;
}

export interface IPagamentoPrincipalListResponse {
  success: boolean;
  message: string;
  data: IPagamentoPrincipal[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// Aluno (para seleção)
export interface IAlunoBasico {
  codigo: number;
  nome: string;
  dataNascimento?: string;
  sexo?: string;
}

export interface IAlunoBasicoResponse {
  success: boolean;
  message: string;
  data: IAlunoBasico[];
}

// Status de Pagamento
export const StatusPagamentoEnum = {
  ATIVO: 1,
  CANCELADO: 2,
  PENDENTE: 3,
  PROCESSANDO: 4
} as const;

export type StatusPagamentoType = typeof StatusPagamentoEnum[keyof typeof StatusPagamentoEnum];

// Tipos de Documento
export const TipoDocumentoEnum = {
  RECIBO: 'Recibo',
  FATURA: 'Fatura',
  NOTA_CREDITO: 'Nota de Crédito',
  COMPROVATIVO: 'Comprovativo'
} as const;

export type TipoDocumentoType = typeof TipoDocumentoEnum[keyof typeof TipoDocumentoEnum];
