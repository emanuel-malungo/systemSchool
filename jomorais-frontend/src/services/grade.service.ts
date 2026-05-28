import api from '../utils/api.utils'
import type {
  CreateGradePayload,
  UpdateGradePayload,
  GradeResponse,
  GradesListResponse,
  GradeFilters,
  PautaResponse,
} from '../types/grade.types'

/**
 * Service para gerenciamento de Notas/Grades
 * Implementa todas as operações CRUD baseado no backend: grade-management.services.js
 */
class GradeService {
  private readonly baseURL = '/api/grades'

  // ===============================
  // NOTAS - CRUD
  // ===============================

  /**
   * Busca notas com paginação e filtros
   * @param page - Número da página (padrão: 1)
   * @param limit - Itens por página (padrão: 10)
   * @param filters - Filtros adicionais
   * @returns Promise com lista paginada de notas
   */
  async getGrades(
    page = 1,
    limit = 10,
    filters?: GradeFilters
  ): Promise<GradesListResponse> {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append('page', page.toString())
      queryParams.append('limit', limit.toString())

      if (filters?.codigoAluno) {
        queryParams.append('codigoAluno', filters.codigoAluno.toString())
      }
      if (filters?.codigoDisciplina) {
        queryParams.append('codigoDisciplina', filters.codigoDisciplina.toString())
      }
      if (filters?.codigoTurma) {
        queryParams.append('codigoTurma', filters.codigoTurma.toString())
      }
      if (filters?.codigoTrimestre) {
        queryParams.append('codigoTrimestre', filters.codigoTrimestre.toString())
      }
      if (filters?.codigoAnoLectivo) {
        queryParams.append('codigoAnoLectivo', filters.codigoAnoLectivo.toString())
      }

      const response = await api.get<GradesListResponse>(
        `${this.baseURL}/notas?${queryParams.toString()}`
      )
      return response.data
    } catch (error) {
      console.error('Erro ao buscar notas:', error)
      throw error
    }
  }

  /**
   * Busca uma nota específica por ID
   * @param id - Código da nota
   * @returns Promise com dados da nota
   */
  async getGradeById(id: number): Promise<GradeResponse> {
    try {
      const response = await api.get<GradeResponse>(`${this.baseURL}/notas/${id}`)
      return response.data
    } catch (error) {
      console.error(`Erro ao buscar nota ${id}:`, error)
      throw error
    }
  }

  /**
   * Busca notas de um aluno específico
   * @param studentId - Código do aluno
   * @param page - Número da página
   * @param limit - Itens por página
   * @returns Promise com notas do aluno
   */
  async getGradesByStudent(
    studentId: number,
    page = 1,
    limit = 100
  ): Promise<GradesListResponse> {
    try {
      return this.getGrades(page, limit, { codigoAluno: studentId })
    } catch (error) {
      console.error(`Erro ao buscar notas do aluno ${studentId}:`, error)
      throw error
    }
  }

  /**
   * Busca notas de uma turma específica
   * @param turmaId - Código da turma
   * @param trimesterId - Código do trimestre (opcional)
   * @param page - Número da página
   * @param limit - Itens por página
   * @returns Promise com notas da turma
   */
  async getGradesByTurma(
    turmaId: number,
    trimesterId?: number,
    page = 1,
    limit = 100
  ): Promise<GradesListResponse> {
    try {
      const filters: GradeFilters = { codigoTurma: turmaId }
      if (trimesterId) filters.codigoTrimestre = trimesterId
      return this.getGrades(page, limit, filters)
    } catch (error) {
      console.error(`Erro ao buscar notas da turma ${turmaId}:`, error)
      throw error
    }
  }

  /**
   * Busca notas de uma disciplina específica
   * @param subjectId - Código da disciplina
   * @param page - Número da página
   * @param limit - Itens por página
   * @returns Promise com notas da disciplina
   */
  async getGradesBySubject(
    subjectId: number,
    page = 1,
    limit = 100
  ): Promise<GradesListResponse> {
    try {
      return this.getGrades(page, limit, { codigoDisciplina: subjectId })
    } catch (error) {
      console.error(`Erro ao buscar notas da disciplina ${subjectId}:`, error)
      throw error
    }
  }

  /**
   * Cria uma nova nota
   * @param data - Dados da nota
   * @returns Promise com nota criada
   */
  async createGrade(data: CreateGradePayload): Promise<GradeResponse> {
    try {
      const response = await api.post<GradeResponse>(`${this.baseURL}/notas`, data)
      return response.data
    } catch (error) {
      console.error('Erro ao lançar nota:', error)
      throw error
    }
  }

  /**
   * Atualiza uma nota existente
   * @param id - Código da nota
   * @param data - Dados a atualizar
   * @returns Promise com nota atualizada
   */
  async updateGrade(id: number, data: UpdateGradePayload): Promise<GradeResponse> {
    try {
      const response = await api.put<GradeResponse>(`${this.baseURL}/notas/${id}`, data)
      return response.data
    } catch (error) {
      console.error(`Erro ao atualizar nota ${id}:`, error)
      throw error
    }
  }

  /**
   * Deleta uma nota
   * @param id - Código da nota
   * @returns Promise<void>
   */
  async deleteGrade(id: number): Promise<void> {
    try {
      await api.delete(`${this.baseURL}/notas/${id}`)
    } catch (error) {
      console.error(`Erro ao deletar nota ${id}:`, error)
      throw error
    }
  }

  /**
   * Importa múltiplas notas em uma única operação
   * @param data - Objeto contendo as notas, ano letivo e utilizador
   * @returns Promise com o resultado da importação em lote
   */
  async importGradesBulk(data: {
    grades: Array<{
      codigoAluno: number
      codigoDisciplina: number
      nota: number
      codigoTipoAvaliacao: number
      codigoTrimestre: number
      codigoTurma?: number
    }>
    codigoAnoLectivo: number
    codigoUtilizador: number
  }): Promise<any> {
    try {
      const response = await api.post(`${this.baseURL}/notas/import-bulk`, data)
      return response.data
    } catch (error) {
      console.error('Erro ao importar notas em lote:', error)
      throw error
    }
  }

  /**
   * Valida se uma nota é válida (entre 0 e 20)
   * @param nota - Valor da nota
   * @returns boolean
   */
  isValidGrade(nota: number): boolean {
    return nota >= 0 && nota <= 20
  }

  /**
   * Verifica se um aluno foi aprovado (nota >= 10)
   * @param nota - Valor da nota
   * @returns boolean
   */
  isApproved(nota: number): boolean {
    return nota >= 10
  }

  /**
   * Calcula a situação do aluno
   * @param nota - Valor da nota
   * @returns 'Aprovado' | 'Reprovado'
   */
  getStatus(nota: number): 'Aprovado' | 'Reprovado' {
    return this.isApproved(nota) ? 'Aprovado' : 'Reprovado'
  }

  // ===============================
  // PAUTA - CONSOLIDAÇÃO DE NOTAS
  // ===============================

  /**
   * Gera pauta (consolidação de notas) para uma turma em um trimestre
   * @param codigoTurma - Código da turma
   * @param codigoTrimestre - Código do trimestre
   * @param codigoAnoLectivo - Código do ano letivo
   * @returns Promise com pauta gerada
   */
  async generatePauta(
    codigoTurma: number,
    codigoTrimestre: number,
    codigoAnoLectivo: number
  ): Promise<PautaResponse> {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append('codigoTurma', codigoTurma.toString())
      queryParams.append('codigoTrimestre', codigoTrimestre.toString())
      queryParams.append('codigoAnoLectivo', codigoAnoLectivo.toString())

      const response = await api.get<PautaResponse>(
        `${this.baseURL}/pautas?${queryParams.toString()}`
      )
      return response.data
    } catch (error) {
      console.error('Erro ao gerar pauta:', error)
      throw error
    }
  }

  /**
   * Busca pauta gerada para uma turma
   * @param codigoTurma - Código da turma
   * @param codigoTrimestre - Código do trimestre
   * @param codigoAnoLectivo - Código do ano letivo
   * @returns Promise com pauta
   */
  async getPauta(
    codigoTurma: number,
    codigoTrimestre: number,
    codigoAnoLectivo: number
  ): Promise<PautaResponse> {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append('codigoTurma', codigoTurma.toString())
      queryParams.append('codigoTrimestre', codigoTrimestre.toString())
      queryParams.append('codigoAnoLectivo', codigoAnoLectivo.toString())

      const response = await api.get<PautaResponse>(
        `${this.baseURL}/pautas?${queryParams.toString()}`
      )
      return response.data
    } catch (error) {
      console.error('Erro ao buscar pauta:', error)
      throw error
    }
  }

  /**
   * Exporta pauta em PDF
   * @param codigoTurma - Código da turma
   * @param codigoTrimestre - Código do trimestre
   * @param codigoAnoLectivo - Código do ano letivo
   * @returns Promise<Blob> com PDF gerado
   */
  async exportPautaPDF(
    codigoTurma: number,
    codigoTrimestre: number,
    codigoAnoLectivo: number
  ): Promise<Blob> {
    try {
      const response = await api.get(
        `${this.baseURL}/pautas/export/pdf?codigoTurma=${codigoTurma}&codigoTrimestre=${codigoTrimestre}&codigoAnoLectivo=${codigoAnoLectivo}`,
        {
          responseType: 'blob'
        }
      )
      return response.data
    } catch (error) {
      console.error('Erro ao exportar pauta em PDF:', error)
      throw error
    }
  }

  /**
   * Exporta pauta em Excel
   * @param codigoTurma - Código da turma
   * @param codigoTrimestre - Código do trimestre
   * @param codigoAnoLectivo - Código do ano letivo
   * @returns Promise<Blob> com arquivo Excel gerado
   */
  async exportPautaExcel(
    codigoTurma: number,
    codigoTrimestre: number,
    codigoAnoLectivo: number
  ): Promise<Blob> {
    try {
      const response = await api.get(
        `${this.baseURL}/pautas/export/excel?codigoTurma=${codigoTurma}&codigoTrimestre=${codigoTrimestre}&codigoAnoLectivo=${codigoAnoLectivo}`,
        {
          responseType: 'blob'
        }
      )
      return response.data
    } catch (error) {
      console.error('Erro ao exportar pauta em Excel:', error)
      throw error
    }
  }

  /**
   * Publica pauta (torna notas visíveis para alunos)
   * @param codigoTurma - Código da turma
   * @param codigoTrimestre - Código do trimestre
   * @returns Promise<void>
   */
  async publishPauta(codigoTurma: number, codigoTrimestre: number): Promise<void> {
    try {
      await api.post(`${this.pautaURL}/publish`, {
        codigoTurma,
        codigoTrimestre,
      })
    } catch (error) {
      console.error('Erro ao publicar pauta:', error)
      throw error
    }
  }
}

export default new GradeService()
