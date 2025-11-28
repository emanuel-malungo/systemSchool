// Interface para turma relacionada
export interface ITurmaDirector {
  codigo: number;
  designacao: string;
}

// Interface para docente relacionado
export interface IDocenteDirector {
  codigo: number;
  nome: string;
  contacto: string;
}

// Interface completa para diretor de turma (baseada na API real)
export interface IDiretorTurma {
  codigo: number;
  designacao: string | null;
  codigoAnoLectivo: number;
  codigoTurma: number;
  codigoDocente: number;
  
  // Relacionamentos
  tb_turmas: ITurmaDirector;
  tb_docente: IDocenteDirector;
}

// Interface para input de criação/atualização
export interface IDiretorTurmaInput {
  designacao?: string | null;
  codigoAnoLectivo: number;
  codigoTurma: number;
  codigoDocente: number;
}

// Interface para paginação
export interface IDiretorTurmaPagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Interface para resposta da API
export interface IDiretorTurmaResponse {
  success: boolean;
  message: string;
  data: IDiretorTurma;
}

// Interface para lista de diretores de turma
export interface IDiretorTurmaListResponse {
  success: boolean;
  message: string;
  data: IDiretorTurma[];
  pagination: IDiretorTurmaPagination;
}

// Interface para resposta de ações (create/update/delete)
export interface IDiretorTurmaActionResponse {
  success: boolean;
  message: string;
  data?: IDiretorTurma;
}
