// Tipos para Document Types
export interface IDocumentType {
  codigo: number;
  designacao: string;
}

// Tipos para Document Numbering
export interface IDocumentNumbering {
  codigo?: number; // pode existir no retorno do backend
  designacao: string;
  next: number;
}

// Resposta padrão da API
export interface IApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
