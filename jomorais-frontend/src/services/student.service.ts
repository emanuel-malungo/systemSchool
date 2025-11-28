import api from "../utils/api.utils"
import type {
  Student,
  StudentResponse,
  AlunosStatistics,
  StatisticsResponse,
  ApiResponse,
  PaginationParams,
  PaginatedStudentResponse,
} from "../types/student.types"

/**
 * Service para gerenciamento de estudantes
 * Implementa todas as operações CRUD e estatísticas
 */
class StudentService {
  private readonly baseUrl = "/api/student-management/alunos"
  private readonly statisticsUrl = "/api/student-management/statistics/alunos"

  /**
   * Busca todos os estudantes com paginação e filtros
   * @param params - Parâmetros de paginação e filtros
   * @returns Promise com lista paginada de estudantes
   */
  async getAllStudents(
    params: PaginationParams = { page: 1, limit: 10 }
  ): Promise<PaginatedStudentResponse> {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append("page", params.page?.toString() || "1")
      queryParams.append("limit", params.limit?.toString() || "10")
      
      if (params.search) {
        queryParams.append("search", params.search)
      }
      if (params.status && params.status !== "all") {
        queryParams.append("status", params.status)
      }
      if (params.curso && params.curso !== "all") {
        queryParams.append("curso", params.curso)
      }

      const response = await api.get<StudentResponse>(
        `${this.baseUrl}?${queryParams.toString()}`
      )

      return {
        success: response.data.success,
        message: response.data.message,
        data: response.data.data,
        pagination: response.data.pagination || {
          currentPage: params.page || 1,
          totalPages: 1,
          totalItems: response.data.data.length,
          itemsPerPage: params.limit || 10,
        },
      }
    } catch (error) {
      console.error("Erro ao buscar estudantes:", error)
      throw error
    }
  }

  /**
   * Busca todos os estudantes sem paginação (para exports, etc)
   * @returns Promise com lista completa de estudantes
   */
  async getAllStudentsComplete(): Promise<PaginatedStudentResponse> {
    return this.getAllStudents({ page: 1, limit: 1000 })
  }

  /**
   * Busca um estudante pelo ID
   * @param id - ID do estudante
   * @returns Promise com dados do estudante
   */
  async getStudentById(id: number): Promise<ApiResponse<Student>> {
    try {
      const response = await api.get<ApiResponse<Student>>(
        `${this.baseUrl}/${id}`
      )
      return response.data
    } catch (error) {
      console.error(`Erro ao buscar estudante ${id}:`, error)
      throw error
    }
  }

  /**
   * Cria um novo estudante
   * @param studentData - Dados do novo estudante
   * @returns Promise com dados do estudante criado
   */
  async createStudent(studentData: Student): Promise<ApiResponse<Student>> {
    try {
      const response = await api.post<ApiResponse<Student>>(
        this.baseUrl,
        studentData
      )
      return response.data
    } catch (error) {
      console.error("Erro ao criar estudante:", error)
      throw error
    }
  }

  /**
   * Atualiza um estudante existente
   * @param id - ID do estudante
   * @param studentData - Dados a serem atualizados
   * @returns Promise com dados do estudante atualizado
   */
  async updateStudent(
    id: number,
    studentData: Student
  ): Promise<ApiResponse<Student>> {
    try {
      const response = await api.put<ApiResponse<Student>>(
        `${this.baseUrl}/${id}`,
        studentData
      )
      return response.data
    } catch (error) {
      console.error(`Erro ao atualizar estudante ${id}:`, error)
      throw error
    }
  }

  /**
   * Deleta um estudante
   * @param id - ID do estudante
   * @returns Promise com mensagem de sucesso
   */
  async deleteStudent(id: number): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await api.delete<ApiResponse<{ message: string }>>(
        `${this.baseUrl}/${id}`
      )
      return response.data
    } catch (error) {
      console.error(`Erro ao deletar estudante ${id}:`, error)
      throw error
    }
  }

  /**
   * Busca estatísticas dos estudantes
   * @param filters - Filtros de status e curso
   * @returns Promise com estatísticas
   */
  async getAlunosStatistics(
    filters: { status?: string | null; curso?: string | null } = {}
  ): Promise<AlunosStatistics> {
    try {
      const params = new URLSearchParams()

      if (filters.status && filters.status !== "all") {
        params.append("status", filters.status)
      }
      if (filters.curso && filters.curso !== "all") {
        params.append("curso", filters.curso)
      }

      const queryString = params.toString()
      const url = `${this.statisticsUrl}${queryString ? `?${queryString}` : ""}`

      const response = await api.get<StatisticsResponse>(url)
      return response.data.data
    } catch (error) {
      console.error("Erro ao buscar estatísticas de estudantes:", error)
      throw error
    }
  }
}

// Exporta uma instância única do service (Singleton)
export default new StudentService()


