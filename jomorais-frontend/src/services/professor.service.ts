// services/professor.service.ts
import api from '../utils/api.utils';

export interface IProfessorPerfil {
  Codigo: number;
  Nome: string;
  NumeroFuncionario: string | null;
  Status: string;
  Email: string | null;
  Telefone: string | null;
  Especialidade: string | null;
  GrauAcademico: string | null;
  DataCadastro: string | null;
  utilizador?: {
    codigo: number;
    nome: string;
    user: string;
    estadoActual: number;
  };
}

export interface IAtribuicaoDisciplina {
  codigo: number;
  codigo_Professor: number;
  codigo_Disciplina: number;
  codigo_Curso: number;
  anoLectivo: string;
  status: string;
  tb_disciplinas?: {
    codigo: number;
    designacao: string;
  };
  tb_cursos?: {
    codigo: number;
    designacao: string;
  };
}

export interface IAtribuicaoTurma {
  codigo: number;
  codigo_Professor: number;
  codigo_Turma: number;
  codigo_Disciplina: number;
  anoLectivo: string;
  status: string;
  tb_disciplinas?: {
    codigo: number;
    designacao: string;
  };
  tb_turmas?: {
    codigo: number;
    designacao: string;
    tb_classes?: {
      designacao: string;
    };
  };
}

export interface IMinhasAtribuicoes {
  disciplinas: IAtribuicaoDisciplina[];
  turmas: IAtribuicaoTurma[];
  totalDisciplinas: number;
  totalTurmas: number;
}

export interface IProfessorAluno {
  codigo: number;
  nome: string;
  sexo: string;
  confirmacaoId: number;
}

export interface INotaAlunoResponse {
  codigo: number;
  nota: number;
  aluno: { codigo: number; nome: string };
  disciplina: { codigo: number; designacao: string };
  turma: { codigo: number; designacao: string };
  trimestre: { codigo: number; designacao: string };
  tipoAvaliacao: { codigo: number; descricao: string };
  dataCadastro: string;
}

export interface ILancarNotasInput {
  codigoTurma: number;
  codigoDisciplina: number;
  codigoTrimestre: number;
  anoLectivo: string;
  tipoNota: 'MAC' | 'PP' | 'PT';
  notas: { codigoAluno: number; nota: number }[];
}

export class ProfessorService {
  static async getPerfil(): Promise<IProfessorPerfil> {
    const response = await api.get('/api/professor/perfil');
    return response.data.data;
  }

  static async getMinhasAtribuicoes(): Promise<IMinhasAtribuicoes> {
    const response = await api.get('/api/professor/minhas-atribuicoes');
    return response.data.data;
  }

  static async getAlunosDaTurma(turmaId: number, anoLectivo: string): Promise<IProfessorAluno[]> {
    const response = await api.get(`/api/professor/turmas/${turmaId}/alunos`, {
      params: { anoLectivo }
    });
    return response.data.data;
  }

  static async getMinhasNotas(params?: {
    turmaId?: number;
    disciplinaId?: number;
    trimestreId?: number;
    anoLectivo?: string;
  }): Promise<INotaAlunoResponse[]> {
    const response = await api.get('/api/professor/minhas-notas', { params });
    return response.data.data;
  }

  static async lancarNotas(data: ILancarNotasInput): Promise<any> {
    const response = await api.post('/api/professor/lancar-notas', data);
    return response.data;
  }

  static async alterarSenha(senhaAtual: string, novaSenha: string): Promise<any> {
    const response = await api.put('/api/professor/alterar-senha', { senhaAtual, novaSenha });
    return response.data;
  }
}
