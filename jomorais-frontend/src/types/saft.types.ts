// Tipos para SAFT-AO (Standard Audit File for Tax - Angola)
// Conforme especificações da AGT (Administração Geral Tributária)

export interface ISAFTHeader {
  auditFileVersion: string; // Versão do ficheiro SAFT
  companyID: string; // NIF da empresa
  taxRegistrationNumber: string; // Número de registo fiscal
  taxAccountingBasis: string; // Base contabilística (F - Faturação, C - Contabilidade)
  companyName: string; // Nome da empresa
  businessName?: string; // Nome comercial
  companyAddress: ISAFTAddress;
  fiscalYear: string; // Ano fiscal (YYYY)
  startDate: string; // Data de início (YYYY-MM-DD)
  endDate: string; // Data de fim (YYYY-MM-DD)
  currencyCode: string; // Código da moeda (AOA)
  dateCreated: string; // Data de criação do ficheiro
  taxEntity: string; // Entidade responsável (Global ou Sede)
  productCompanyTaxID: string; // NIF da empresa do software
  softwareCertificateNumber: string; // Número do certificado do software
  productID: string; // Identificação do produto
  productVersion: string; // Versão do produto
  headerComment?: string; // Comentário do cabeçalho
}

export interface ISAFTAddress {
  buildingNumber?: string; // Número do prédio
  streetName?: string; // Nome da rua
  addressDetail: string; // Morada detalhada
  city: string; // Cidade
  postalCode?: string; // Código postal
  region?: string; // Província
  country: string; // País (AO)
}

export interface ISAFTCustomer {
  customerID: string; // Identificação do cliente
  accountID: string; // Código da conta
  customerTaxID?: string; // NIF do cliente
  companyName: string; // Nome da empresa/cliente
  contact?: string; // Contacto
  billingAddress: ISAFTAddress;
  shipToAddress?: ISAFTAddress;
  telephone?: string; // Telefone
  fax?: string; // Fax
  email?: string; // Email
  website?: string; // Website
  selfBillingIndicator: number; // Indicador de auto-faturação (0 ou 1)
}

export interface ISAFTProduct {
  productType: string; // Tipo de produto (P - Produto, S - Serviço, O - Outros, I - Impostos)
  productCode: string; // Código do produto
  productGroup?: string; // Grupo do produto
  productDescription: string; // Descrição do produto
  productNumberCode?: string; // Código de barras
}

export interface ISAFTTaxTable {
  taxType: string; // Tipo de imposto (IVA, IS, etc.)
  taxCountryRegion: string; // País/Região (AO)
  taxCode: string; // Código do imposto
  description: string; // Descrição
  taxPercentage?: number; // Percentagem do imposto
  taxAmount?: number; // Montante do imposto
}

export interface ISAFTInvoice {
  invoiceNo: string; // Número da fatura
  documentStatus: ISAFTDocumentStatus;
  hash: string; // Hash da fatura
  hashControl: string; // Chave privada usada na assinatura
  period?: number; // Período (1-12)
  invoiceDate: string; // Data da fatura
  invoiceType: string; // Tipo de documento (FT, FR, FS, etc.)
  specialRegimes?: ISAFTSpecialRegimes;
  sourceID: string; // Utilizador responsável
  systemEntryDate: string; // Data de inserção no sistema
  transactionID?: string; // Identificação da transação
  customerID: string; // Identificação do cliente
  shipTo?: ISAFTShipTo;
  shipFrom?: ISAFTShipFrom;
  movementEndTime?: string; // Data e hora de fim de transporte
  movementStartTime?: string; // Data e hora de início de transporte
  line: ISAFTInvoiceLine[];
  documentTotals: ISAFTDocumentTotals;
  withHoldingTax?: ISAFTWithHoldingTax[];
}

export interface ISAFTDocumentStatus {
  invoiceStatus: string; // Estado do documento (N - Normal, A - Anulado, F - Faturado)
  invoiceStatusDate: string; // Data do estado
  reason?: string; // Motivo da alteração
  sourceID: string; // Utilizador responsável
  sourceBilling: string; // Origem da faturação (P - Programa, I - Internet, M - Manual)
}

export interface ISAFTSpecialRegimes {
  selfBillingIndicator: number; // Auto-faturação (0 ou 1)
  cashVATSchemeIndicator: number; // Regime de caixa do IVA (0 ou 1)
  thirdPartiesBillingIndicator: number; // Faturação por terceiros (0 ou 1)
}

export interface ISAFTShipTo {
  deliveryID?: string; // Identificação da entrega
  deliveryDate?: string; // Data de entrega
  warehouseID?: string; // Identificação do armazém
  locationID?: string; // Identificação da localização
  address?: ISAFTAddress;
}

export interface ISAFTShipFrom {
  deliveryID?: string; // Identificação da entrega
  deliveryDate?: string; // Data de entrega
  warehouseID?: string; // Identificação do armazém
  locationID?: string; // Identificação da localização
  address?: ISAFTAddress;
}

export interface ISAFTInvoiceLine {
  lineNumber: number; // Número da linha
  productCode: string; // Código do produto
  productDescription: string; // Descrição do produto
  quantity: number; // Quantidade
  unitOfMeasure: string; // Unidade de medida
  unitPrice: number; // Preço unitário
  taxPointDate?: string; // Data de exigibilidade do imposto
  description: string; // Descrição da linha
  productSerialNumber?: ISAFTProductSerialNumber;
  debitAmount?: number; // Valor a débito
  creditAmount?: number; // Valor a crédito
  tax: ISAFTTax;
  taxExemptionReason?: string; // Motivo de isenção
  taxExemptionCode?: string; // Código de isenção
  settlementAmount?: number; // Montante de liquidação
}

export interface ISAFTProductSerialNumber {
  serialNumber: string; // Número de série
}

export interface ISAFTTax {
  taxType: string; // Tipo de imposto
  taxCountryRegion: string; // País/Região
  taxCode: string; // Código do imposto
  taxPercentage?: number; // Percentagem
  taxAmount?: number; // Montante do imposto
}

export interface ISAFTDocumentTotals {
  taxPayable: number; // Imposto a pagar
  netTotal: number; // Total líquido
  grossTotal: number; // Total bruto
  currency?: ISAFTCurrency;
  settlement?: ISAFTSettlement[];
}

export interface ISAFTCurrency {
  currencyCode: string; // Código da moeda
  currencyAmount: number; // Montante na moeda
  exchangeRate: number; // Taxa de câmbio
}

export interface ISAFTSettlement {
  settlementDiscount?: string; // Desconto de liquidação
  settlementAmount?: number; // Montante de liquidação
  settlementDate?: string; // Data de liquidação
  paymentTerms?: string; // Condições de pagamento
}

export interface ISAFTWithHoldingTax {
  withholdingTaxType: string; // Tipo de retenção
  withholdingTaxDescription: string; // Descrição
  withholdingTaxAmount: number; // Montante retido
}

// Interfaces adicionais para elementos opcionais
export interface ISAFTGeneralLedgerAccount {
  accountID: string;
  accountDescription: string;
  openingDebitBalance?: number;
  openingCreditBalance?: number;
  closingDebitBalance?: number;
  closingCreditBalance?: number;
}

export interface ISAFTSupplier {
  supplierID: string;
  accountID: string;
  supplierTaxID?: string;
  companyName: string;
  contact?: string;
  billingAddress: ISAFTAddress;
  telephone?: string;
  email?: string;
  selfBillingIndicator: number;
}

export interface ISAFTGeneralLedgerEntry {
  transactionID: string;
  period?: number;
  transactionDate: string;
  sourceID: string;
  description?: string;
  docArchivalNumber?: string;
  transactionType?: string;
}

export interface ISAFTStockMovement {
  movementID: string;
  movementDate: string;
  movementType: string;
  customerID?: string;
  supplierID?: string;
}

export interface ISAFTMovementOfGoods {
  numberOfMovementLines: number;
  totalQuantityIssued: number;
  stockMovement: ISAFTStockMovement[];
}

export interface ISAFTWorkDocument {
  documentNumber: string;
  documentDate: string;
  documentType: string;
  customerID?: string;
}

export interface ISAFTWorkingDocuments {
  numberOfEntries: number;
  totalDebit: number;
  totalCredit: number;
  workDocument: ISAFTWorkDocument[];
}

export interface ISAFTPayment {
  paymentRefNo: string; // Número de referência do pagamento
  transactionID?: string; // Identificação da transação
  period?: number; // Período
  transactionDate: string; // Data da transação
  paymentType: string; // Tipo de pagamento (RC - Recibo, RG - Outros)
  description?: string; // Descrição
  systemID?: string; // Identificação do sistema
  documentStatus: ISAFTDocumentStatus;
  paymentMethod: ISAFTPaymentMethod[];
  sourceID: string; // Utilizador responsável
  systemEntryDate: string; // Data de inserção
  customerID: string; // Identificação do cliente
  line: ISAFTPaymentLine[];
  documentTotals: ISAFTPaymentTotals;
  withholdingTax?: ISAFTWithHoldingTax[];
}

export interface ISAFTPaymentMethod {
  paymentMechanism: string; // Mecanismo de pagamento (CC - Cartão de crédito, CD - Cartão de débito, CH - Cheque, MB - Referência MB, NU - Numerário, PR - Permuta, TR - Transferência bancária, O - Outros)
  paymentAmount: number; // Montante do pagamento
  paymentDate: string; // Data do pagamento
}

export interface ISAFTPaymentLine {
  lineNumber: number; // Número da linha
  sourceDocumentID: ISAFTSourceDocumentID[];
  settlementAmount?: number; // Montante de liquidação
  debitAmount?: number; // Valor a débito
  creditAmount?: number; // Valor a crédito
  tax?: ISAFTTax;
}

export interface ISAFTSourceDocumentID {
  originatingON: string; // Número do documento de origem
  invoiceDate: string; // Data da fatura
  description?: string; // Descrição
}

export interface ISAFTPaymentTotals {
  taxPayable: number; // Imposto a pagar
  netTotal: number; // Total líquido
  grossTotal: number; // Total bruto
  settlement?: ISAFTSettlement[];
  currency?: ISAFTCurrency;
}

// Interface principal do ficheiro SAFT
export interface ISAFTFile {
  header: ISAFTHeader;
  masterFiles: {
    generalLedgerAccounts?: ISAFTGeneralLedgerAccount[];
    customers?: ISAFTCustomer[];
    suppliers?: ISAFTSupplier[];
    products?: ISAFTProduct[];
    taxTable?: ISAFTTaxTable[];
  };
  generalLedgerEntries?: ISAFTGeneralLedgerEntry[];
  sourceDocuments: {
    salesInvoices?: {
      numberOfEntries: number;
      totalDebit: number;
      totalCredit: number;
      invoice: ISAFTInvoice[];
    };
    movementOfGoods?: ISAFTMovementOfGoods;
    workingDocuments?: ISAFTWorkingDocuments;
    payments?: {
      numberOfEntries: number;
      totalDebit: number;
      totalCredit: number;
      payment: ISAFTPayment[];
    };
  };
}

// Interfaces para configuração da exportação
export interface ISAFTExportConfig {
  startDate: string;
  endDate: string;
  includeCustomers: boolean;
  includeProducts: boolean;
  includeInvoices: boolean;
  includePayments: boolean;
  companyInfo: {
    nif: string;
    name: string;
    address: string;
    city: string;
    postalCode?: string;
    phone?: string;
    email?: string;
  };
  softwareInfo: {
    name: string;
    version: string;
    certificateNumber: string;
    companyNIF: string;
  };
}

export interface ISAFTExportResponse {
  success: boolean;
  message: string;
  fileName?: string;
  fileSize?: number;
  downloadUrl?: string;
  errors?: string[];
}

// Interfaces auxiliares
export interface ICompanyInfo {
  nif: string;
  nome: string;
  nomeComercial?: string;
  endereco: string;
  cidade: string;
  codigoPostal?: string;
  provincia?: string;
  telefone?: string;
  email?: string;
}

export interface IExportStatistics {
  totalInvoices: number;
  totalPayments: number;
  totalAmount: number;
  totalCustomers?: number;
  totalProducts?: number;
  period: {
    startDate: string;
    endDate: string;
  };
}

export interface IInvoiceData {
  id: number;
  numeroFatura?: string;
  dataEmissao?: string;
  status?: string;
  utilizador?: string;
  alunoId?: number;
  valor?: number;
  tipoServico?: {
    codigo?: string;
    designacao?: string;
  };
  observacoes?: string;
  faturaReferencia?: string;
  total?: number;
}

export interface IPaymentData {
  id: number;
  numeroRecibo?: string;
  dataPagamento?: string;
  utilizador?: string;
  alunoId?: number;
  valor?: number;
  formaPagamento?: {
    designacao?: string;
  };
  faturaReferencia?: string;
  total?: number;
}

export interface IStudentData {
  id: number;
  codigo?: string;
  nome?: string;
  nif?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  cidade?: string;
}

export interface IServiceData {
  id: number;
  codigo?: string;
  designacao?: string;
}
