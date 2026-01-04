// controller/reports-management.controller.js
import { PrismaClient } from '@prisma/client';
import { ReportsManagementService } from "../services/reports-management.services.js";
import { handleControllerError } from "../utils/validation.utils.js";
import { convertBigIntToString } from "../utils/bigint.utils.js";
import {
  studentReportFiltersSchema,
  studentStatisticsFiltersSchema,
  idParamSchema,
  generateReportSchema,
  individualStudentReportSchema
} from "../validations/reports-management.validations.js";

const prisma = new PrismaClient();

export class ReportsManagementController {
  // ===============================
  // RELATÓRIOS DE ALUNOS
  // ===============================

  /**
   * Buscar alunos com filtros para relatórios
   */
  static async getStudentsForReport(req, res) {
    try {
      const validatedQuery = studentReportFiltersSchema.parse(req.query);
      
      const { page = 1, limit = 10, ...filters } = validatedQuery;
      
      const result = await ReportsManagementService.getStudentsForReport(
        filters,
        page,
        limit
      );

      const convertedResult = convertBigIntToString(result);

      res.status(200).json({
        success: true,
        message: 'Alunos para relatório recuperados com sucesso',
        data: convertedResult
      });
    } catch (error) {
      handleControllerError(res, error, 'Erro ao buscar alunos para relatório');
    }
  }

  /**
   * Buscar estatísticas dos alunos
   */
  static async getStudentStatistics(req, res) {
    try {
      const validatedQuery = studentStatisticsFiltersSchema.parse(req.query);
      
      const statistics = await ReportsManagementService.getStudentStatistics(validatedQuery);
      
      const convertedStatistics = convertBigIntToString(statistics);

      res.status(200).json({
        success: true,
        message: 'Estatísticas dos alunos recuperadas com sucesso',
        data: convertedStatistics
      });
    } catch (error) {
      handleControllerError(res, error, 'Erro ao buscar estatísticas dos alunos');
    }
  }

  /**
   * Buscar dados de um aluno específico para relatório individual
   */
  static async getStudentReportData(req, res) {
    try {
      const { id } = idParamSchema.parse(req.params);
      
      const studentData = await ReportsManagementService.getStudentReportData(id);
      
      const convertedData = convertBigIntToString(studentData);

      res.status(200).json({
        success: true,
        message: 'Dados do aluno para relatório recuperados com sucesso',
        data: convertedData
      });
    } catch (error) {
      handleControllerError(res, error, 'Erro ao buscar dados do aluno para relatório');
    }
  }

  /**
   * Gerar relatório geral de alunos
   */
  static async generateStudentsReport(req, res) {
    try {
      const validatedData = generateReportSchema.parse(req.body);
      
      const { format, filters = {}, includeStatistics, includeCharts } = validatedData;
      
      // Buscar dados dos alunos
      const studentsData = await ReportsManagementService.getStudentsForReport(
        filters,
        1,
        1000 // Limite alto para relatório completo
      );
      
      // Buscar estatísticas se solicitado
      let statistics = null;
      if (includeStatistics) {
        statistics = await ReportsManagementService.getStudentStatistics(filters);
      }

      // Preparar dados para o relatório
      const reportData = {
        students: studentsData.students,
        statistics,
        filters,
        generatedAt: new Date().toISOString(),
        totalStudents: studentsData.pagination.totalItems
      };

      // Por enquanto, retornar os dados JSON
      // Futuramente, implementar geração de PDF/Excel/Word
      const convertedData = convertBigIntToString(reportData);

      res.status(200).json({
        success: true,
        message: `Relatório de alunos gerado com sucesso (formato: ${format})`,
        data: convertedData,
        meta: {
          format,
          includeStatistics,
          includeCharts,
          generatedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      handleControllerError(res, error, 'Erro ao gerar relatório de alunos');
    }
  }

  /**
   * Gerar relatório individual de aluno
   */
  static async generateIndividualStudentReport(req, res) {
    try {
      const { id } = idParamSchema.parse(req.params);
      const validatedData = individualStudentReportSchema.parse(req.body);
      
      const { format, includeHistory, includeEncarregado, includeProveniencia } = validatedData;
      
      // Buscar dados completos do aluno
      const studentData = await ReportsManagementService.getStudentReportData(id);
      
      // Filtrar dados baseado nas opções
      const reportData = {
        dadosPessoais: studentData.dadosPessoais,
        encarregado: includeEncarregado ? studentData.encarregado : null,
        proveniencia: includeProveniencia ? studentData.proveniencia : null,
        historicoMatriculas: includeHistory ? studentData.historicoMatriculas : [],
        historicoConfirmacoes: includeHistory ? studentData.historicoConfirmacoes : [],
        generatedAt: new Date().toISOString()
      };

      // Por enquanto, retornar os dados JSON
      // Futuramente, implementar geração de PDF/Word
      const convertedData = convertBigIntToString(reportData);

      res.status(200).json({
        success: true,
        message: `Relatório individual do aluno gerado com sucesso (formato: ${format})`,
        data: convertedData,
        meta: {
          studentId: id,
          format,
          includeHistory,
          includeEncarregado,
          includeProveniencia,
          generatedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      handleControllerError(res, error, 'Erro ao gerar relatório individual do aluno');
    }
  }

  /**
   * Buscar opções disponíveis para filtros
   */
  static async getFilterOptions(req, res) {
    try {
      // Por enquanto, retornar opções estáticas
      // Futuramente, buscar do banco de dados quando os relacionamentos estiverem corretos
      const filterOptions = {
        anosAcademicos: ['2024', '2025'], // Dados estáticos por enquanto
        classes: ['10ª Classe', '11ª Classe', '12ª Classe'], // Dados estáticos por enquanto
        cursos: ['Informática', 'Contabilidade', 'Gestão'], // Dados estáticos por enquanto
        estados: ['Ativo', 'Transferido', 'Desistente', 'Finalizado'],
        generos: [
          { value: 'M', label: 'Masculino' },
          { value: 'F', label: 'Feminino' }
        ],
        periodos: ['Manhã', 'Tarde', 'Noite']
      };

      res.status(200).json({
        success: true,
        message: 'Opções de filtros recuperadas com sucesso',
        data: filterOptions
      });
    } catch (error) {
      handleControllerError(res, error, 'Erro ao buscar opções de filtros');
    }
  }
}
