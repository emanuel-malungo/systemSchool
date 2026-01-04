// Tipos de Acesso de Usuário
export interface UserAccessType {
  codigo: number;
  designacao: string;
}

// Tipos de Usuário Legado
export interface LegacyUserType {
  codigo: number;
  nome: string;
  tipoDesignacao: string;
}

export interface LegacyUser {
  codigo: number;
  nome: string;
  user: string;
  passe?: string;
  codigo_Tipo_Utilizador: number;
  estadoActual: 'ATIVO' | 'INATIVO';
  codigoStatus: number; // Status do usuário
  dataCadastro: string;
  loginStatus: 'ON' | 'OFF';
  tb_tipos_utilizador?: LegacyUserType;
}

// Tipos de Usuário Moderno
export interface ModernUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

// DTOs para criação e atualização
export interface CreateLegacyUserDTO {
  nome: string;
  user: string;
  passe: string;
  codigo_Tipo_Utilizador: number;
  estadoActual?: 'ATIVO' | 'INATIVO';
  codigoStatus: number; // Status do usuário (obrigatório)
}

export interface UpdateLegacyUserDTO {
  nome?: string;
  user?: string;
  passe?: string;
  codigo_Tipo_Utilizador?: number;
  estadoActual?: 'ATIVO' | 'INATIVO';
  codigoStatus?: number; // Status do usuário (opcional na atualização)
}

// Tipos de Paginação
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

// Resposta da API
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

// Resposta paginada
export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: PaginationMeta;
}

// Tipos para os filtros e ordenação
export interface UserFilters {
  search?: string;
  estadoActual?: 'ATIVO' | 'INATIVO';
  codigo_Tipo_Utilizador?: number;
}

export interface UserSortOptions {
  field: 'nome' | 'user' | 'dataCadastro' | 'estadoActual';
  order: 'asc' | 'desc';
}

export interface UserTableProps {
  users: LegacyUser[]
  isLoading: boolean, 
  onEdit: (user: LegacyUser) => void
  onView: (user: LegacyUser) => void
  onDelete: (user: LegacyUser) => void
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}