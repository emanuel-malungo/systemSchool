// Tipos para Profissões

export interface Profession {
  codigo: number;
  designacao: string;
}

export interface ProfessionResponse {
  success: boolean;
  message: string;
  data: Profession[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
