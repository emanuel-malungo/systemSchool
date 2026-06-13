import api from '../utils/api.utils';

export interface IDirectorTurma {
  codigo: number;
  codigo_Professor: number;
  codigo_Turma: number;
  anoLectivo: string;
  codigoAnoLectivo?: number;
  tb_turmas?: {
    codigo: number;
    designacao: string;
    tb_classes?: {
      designacao: string;
    };
    tb_cursos?: {
      designacao: string;
    }
  };
  disciplinas: {
    codigo: number;
    designacao: string;
  }[];
}

export interface ILancarNotasDirectorInput {
  codigoTurma: number;
  codigoDisciplina: number;
  codigoTrimestre: number;
  anoLectivo: string;
  tipoNota: 'MAC' | 'PP' | 'PT';
  notas: { codigoAluno: number; nota: number }[];
}

export class DirectorService {
  static async getPerfil() {
    const response = await api.get('/api/director/perfil');
    return response.data.data;
  }

  static async getMinhasTurmas(): Promise<IDirectorTurma[]> {
    const response = await api.get('/api/director/minhas-turmas');
    return response.data.data;
  }

  static async getAlunosDaTurma(turmaId: number, anoLectivo: string) {
    const response = await api.get(`/api/director/turmas/${turmaId}/alunos`, {
      params: { anoLectivo }
    });
    return response.data.data;
  }

  static async getNotasDaTurma(turmaId: number, params?: { disciplinaId?: number; trimestreId?: number; anoLectivo?: string }) {
    const response = await api.get(`/api/director/turmas/${turmaId}/notas`, { params });
    return response.data.data;
  }

  static async lancarNotas(data: ILancarNotasDirectorInput) {
    const response = await api.post('/api/director/lancar-notas', data);
    return response.data;
  }

  static async getBoletimTurma(turmaId: number, trimestreId: number, anoLectivoId: number) {
    const response = await api.get(`/api/director/boletins-turma/${turmaId}`, {
      params: { trimestreId, anoLectivoId }
    });
    return response.data.data;
  }
}
