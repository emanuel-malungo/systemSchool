// Types para gestão de proveniências (escolas de origem dos alunos)

export interface Proveniencia {
  codigo: number;
  designacao: string;
  codigoStatus: number;
  localizacao?: string | null;
  contacto?: string | null;
  codigoUtilizador?: number | null;
  dataCadastro: string | Date;
  tb_utilizadores?: {
    codigo: number;
    nome: string;
    user: string;
    email?: string;
  };
}

export interface CreateProvenienciaPayload {
  designacao: string;
  codigoStatus?: number;
  localizacao?: string;
  contacto?: string;
  codigoUtilizador?: number;
  dataCadastro?: string | Date;
}

export interface UpdateProvenienciaPayload {
  designacao?: string;
  codigoStatus?: number;
  localizacao?: string;
  contacto?: string;
  codigoUtilizador?: number;
}

export interface ProvenienciaResponse {
  success: boolean;
  message: string;
  data: Proveniencia[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface SingleProvenienciaResponse {
  success: boolean;
  message: string;
  data: Proveniencia;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface IPagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface PaginatedProvenienciaResponse {
  success: boolean;
  message: string;
  data: Proveniencia[];
  pagination: IPagination;
}

