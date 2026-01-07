// Interfaces para gestão de estudantes

export interface Student {
  codigo: number;
  nome: string;
  pai?: string;
  mae?: string;
  codigo_Nacionalidade: number;
  codigo_Estado_Civil: number;
  dataNascimento: string | Record<string, unknown>; // Pode ser objeto ou string
  email?: string;
  telefone?: string;
  codigo_Status: number;
  codigo_Comuna: number;
  codigo_Encarregado: number;
  codigo_Utilizador: number;
  sexo: string; // "Masculino" ou "Feminino" na API
  n_documento_identificacao?: string;
  dataCadastro: string | Record<string, unknown>; // Pode ser objeto ou string
  saldo: number;
  desconto: number;
  url_Foto?: string;
  tipo_desconto: string;
  escolaProveniencia?: number | null;
  saldo_Anterior?: number | null;
  codigoTipoDocumento: number;
  morada?: string;
  dataEmissao: string | Record<string, unknown>; // Pode ser objeto ou string
  provinciaEmissao?: string;
  motivo_Desconto?: string;
  user_id: string;
  tb_encarregados?: {
    codigo: number;
    nome: string;
    telefone: string;
    email?: string;
    codigo_Profissao?: number;
    local_Trabalho?: string;
    status?: number;
  };
  encarregado?: {
    codigo?: number;
    nome?: string;
    telefone?: string;
    email?: string;
    codigo_Profissao?: number;
    local_Trabalho?: string;
    status?: number;
  };
  tb_utilizadores?: {
    codigo: number;
    nome: string;
    user: string;
  };
  tb_tipo_documento?: {
    codigo: number;
    designacao: string;
  };
  tb_matriculas?: {
    codigo: number;
    data_Matricula: string | Record<string, unknown>;
    codigoStatus: number;
    tb_cursos: {
      codigo: number;
      designacao: string;
    };
    tb_utilizadores?: {
      codigo: number;
      nome: string;
    };
  } | null;
  tb_nacionalidade?: {
    codigo: number;
    designacao: string;
  };
  tb_estado_civil?: {
    codigo: number;
    designacao: string;
  };
  tb_comuna?: {
    codigo: number;
    designacao: string;
    tb_municipios?: {
      codigo: number;
      designacao: string;
      tb_provincias?: {
        codigo: number;
        designacao: string;
      };
    };
  };
  tb_status?: {
    codigo: number;
    designacao: string;
  };
}

export interface StudentResponse {
  success: boolean;
  message: string;
  data: Student[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface UseStudentState {
  students: Student[];
  student: Student | null;
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  } | null;
}

// Interface para o retorno do hook
export interface UseStudentReturn extends UseStudentState {
  getAllStudents: (page?: number, limit?: number, search?: string, statusFilter?: string | null, cursoFilter?: string | null) => Promise<void>;
  getAllStudentsComplete: () => Promise<void>;
  getStudentById: (id: number) => Promise<void>;
  createStudent: (studentData: Student) => Promise<void>;
  updateStudent: (id: number, studentData: Student) => Promise<void>;
  deleteStudent: (id: number) => Promise<void>;
  getAlunosStatistics: (statusFilter?: string | null, cursoFilter?: string | null) => Promise<AlunosStatistics | null>;
  clearError: () => void;
  clearStudent: () => void;
  setLoading: (loading: boolean) => void;
}

export interface EncarregadoData {
  nome?: string;
  telefone?: string;
  email?: string;
  codigo_Profissao?: number;
  local_Trabalho?: string;
  status?: number;
}

export interface CreateStudentPayload {
  nome: string;
  pai: string;
  mae: string;
  sexo: string;
  dataNascimento?: string;
  telefone: string;
  email: string;
  morada: string;
  codigo_Nacionalidade: number;
  codigo_Estado_Civil: number;
  codigo_Comuna: number;
  codigoTipoDocumento: number;
  codigo_Status: number;
  saldo: number;
  escolaProveniencia?: number;
  n_documento_identificacao: string;
  dataEmissao?: string;
  provinciaEmissao?: string;
  encarregado: {
    nome?: string;
    telefone?: string;
    email?: string;
    codigo_Profissao: number;
    local_Trabalho: string;
    status: number;
  };
}

export interface AlunosStatistics {
    totalAlunos: number;
    alunosAtivos: number;
    alunosInativos: number;
    alunosComMatricula: number;
    alunosSemMatricula: number;
    distribuicaoPorSexo: {
        masculino: number;
        feminino: number;
        outro: number;
    };
    percentuais: {
        ativos: string;
        inativos: string;
        comMatricula: string;
        semMatricula: string;
    };
}

export interface StatisticsResponse {
    success: boolean;
    message: string;
    data: AlunosStatistics;
}


export interface IPagination {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
}

// Tipos para padronização com outros services
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string | null;
  curso?: string | null;
  matriculaId?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedStudentResponse {
  success: boolean;
  message: string;
  data: Student[];
  pagination: IPagination;
}