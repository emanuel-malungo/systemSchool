// Interface para disciplina do docente baseada na API
export interface IDisciplinaDocente {
  codigo: number;
  codigoDocente: number;
  codigoCurso: number;
  codigoDisciplina: number;
  tb_docente: {
    codigo: number;
    nome: string;
  };
  tb_cursos: {
    codigo: number;
    designacao: string;
  };
  tb_disciplinas: {
    codigo: number;
    designacao: string;
  };
}

// Interface para input de criação/atualização
export interface IDisciplinaDocenteInput {
  codigoDocente: number;
  codigoCurso: number;
  codigoDisciplina: number;
}

// Interface para resposta da API
export interface IDisciplinaDocenteResponse {
  success: boolean;
  message: string;
  data: IDisciplinaDocente[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Interface para resposta de criação/atualização
export interface IDisciplinaDocenteActionResponse {
  success: boolean;
  message: string;
  data?: IDisciplinaDocente;
}

// ===============================================================
// ALIGNMENT TYPES FOR JUNQUEIRA FLOW
// ===============================================================

export interface AtribuicaoCompleta {
  codigo: number;
  professor: {
    codigo: number;
    nome: string;
    numeroFuncionario?: string;
  };
  disciplina: {
    codigo: number;
    designacao: string;
  };
  curso: {
    codigo: number;
    designacao: string;
  };
  turma?: {
    codigo: number;
    designacao: string;
  };
  anoLectivo: string;
  tipo: 'disciplina' | 'turma';
  status: string;
}

export interface IAtribuicaoCompletaInput {
  professorId: number;
  disciplinaId: number;
  cursoId: number;
  turmaId?: number;
  anoLectivo: string;
  incluirTurma?: boolean;
}

