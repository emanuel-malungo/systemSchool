// Interface para especialidade
export interface IEspecialidade {
  codigo: number;
  designacao: string;
}

// Interface para disciplina docente
export interface IDisciplinaDocente {
  codigo: number;
  codigoCurso: number;
  codigoDisciplina: number;
  tb_disciplinas?: {
    codigo: number;
    designacao: string;
  };
  tb_cursos?: {
    codigo: number;
    designacao: string;
  };
}

// Interface para diretor de turma
export interface IDiretorTurma {
  codigo: number;
  codigoTurma: number;
  anoLectivo: string;
}

// Interface completa para docente (baseada na API real)
export interface IDocente {
  codigo: number;
  nome: string;
  status: number;
  codigo_disciplina?: number | null;
  codigo_Utilizador: number;
  codigo_Especialidade: number;
  contacto: string;
  email: string;
  user_id: string;
  
  // Relacionamentos
  tb_disciplinas?: {
    codigo: number;
    designacao: string;
  } | null;
  tb_utilizadores?: {
    codigo: number;
    nome: string;
    email: string;
  } | null;
  tb_especialidade: IEspecialidade;
  tb_disciplinas_docente?: IDisciplinaDocente[];
  tb_directores_turmas?: IDiretorTurma[];
  tb_docente_turma?: Array<{
    codigo_Docente: number;
    codigo_turma: number;
  }>;
  
  // Contador de relacionamentos (usado na listagem)
  _count?: {
    tb_disciplinas_docente: number;
    tb_directores_turmas: number;
    tb_docente_turma: number;
  };
}

// Interface para input de criação/atualização de docente
export interface IDocenteInput {
  nome: string;
  status?: number;
  codigo_disciplina?: number | null;
  codigo_Utilizador?: number;
  codigo_Especialidade: number;
  contacto: string;
  email: string;
  user_id?: string;
}

// Interface para paginação
export interface IDocentePagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

// Interface para resposta da API
export interface IDocenteResponse {
  success: boolean;
  message: string;
  data: IDocente;
}

// Interface para lista de docentes
export interface IDocenteListResponse {
  success: boolean;
  message: string;
  data: IDocente[];
  pagination?: IDocentePagination;
}

// Interface para resposta de especialidades
export interface IEspecialidadeResponse {
  success: boolean;
  message: string;
  data: IEspecialidade[];
}

// Interface para resposta de disciplinas docente
export interface IDisciplinaDocenteResponse {
  success: boolean;
  message: string;
  data: IDisciplinaDocente[];
}
