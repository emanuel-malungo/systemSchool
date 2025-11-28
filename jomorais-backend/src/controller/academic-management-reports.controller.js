// controller/academic-management-reports.controller.js
import { PrismaClient } from '@prisma/client'
import { AcademicReportsService } from '../services/academic-management-reports.services.js'
import { handleControllerError } from '../utils/validation.utils.js'
import { convertBigIntToString } from '../utils/bigint.utils.js'
import {
  academicStudentsFiltersSchema,
  academicStatisticsFiltersSchema,
  classPerformanceFiltersSchema,
  teacherPerformanceFiltersSchema,
} from '../validations/academic-management-reports.validations.js'

const prisma = new PrismaClient()

export class AcademicReportsController {
  // ===============================
  // RELATÓRIOS ACADÊMICOS - ALUNOS
  // ===============================

  static async getAcademicStudents(req, res) {
    try {
      const validatedQuery = academicStudentsFiltersSchema.parse(req.query)
      const { page = 1, limit = 10, ...filters } = validatedQuery

      const result = await AcademicReportsService.getAcademicStudents(
        filters,
        page,
        limit,
      )

      const convertedResult = convertBigIntToString(result)

      res.status(200).json({
        success: true,
        message: 'Dados acadêmicos dos alunos recuperados com sucesso',
        data: {
          students: convertedResult.students,
          pagination: convertedResult.pagination,
        },
      })
    } catch (error) {
      handleControllerError(
        res,
        error,
        'Erro ao buscar dados acadêmicos dos alunos',
      )
    }
  }

  // ===============================
  // ESTATÍSTICAS ACADÊMICAS
  // ===============================

  static async getAcademicStatistics(req, res) {
    try {
      const validatedQuery = academicStatisticsFiltersSchema.parse(req.query)

      const statistics = await AcademicReportsService.getAcademicStatistics(
        validatedQuery,
      )

      const convertedStatistics = convertBigIntToString(statistics)

      res.status(200).json({
        success: true,
        message: 'Estatísticas acadêmicas recuperadas com sucesso',
        data: convertedStatistics,
      })
    } catch (error) {
      handleControllerError(
        res,
        error,
        'Erro ao buscar estatísticas acadêmicas',
      )
    }
  }

  // ===============================
  // DESEMPENHO POR TURMA/CLASSE
  // ===============================

  static async getClassPerformance(req, res) {
    try {
      const validatedQuery = classPerformanceFiltersSchema.parse(req.query)

      const performance = await AcademicReportsService.getClassPerformance(
        validatedQuery,
      )

      const converted = convertBigIntToString(performance)

      res.status(200).json({
        success: true,
        message: 'Desempenho por turma recuperado com sucesso',
        data: converted,
      })
    } catch (error) {
      handleControllerError(
        res,
        error,
        'Erro ao buscar desempenho por turma',
      )
    }
  }

  // ===============================
  // DESEMPENHO POR PROFESSOR
  // ===============================

  static async getTeacherPerformance(req, res) {
    try {
      const validatedQuery = teacherPerformanceFiltersSchema.parse(req.query)

      const performance = await AcademicReportsService.getTeacherPerformance(
        validatedQuery,
      )

      const converted = convertBigIntToString(performance)

      res.status(200).json({
        success: true,
        message: 'Desempenho por professor recuperado com sucesso',
        data: converted,
      })
    } catch (error) {
      handleControllerError(
        res,
        error,
        'Erro ao buscar desempenho por professor',
      )
    }
  }

  // ===============================
  // OPÇÕES DE FILTROS ACADÊMICOS
  // ===============================

  static async getFilterOptions(req, res) {
    try {
      const filterOptions = await AcademicReportsService.getFilterOptions()

      const converted = convertBigIntToString(filterOptions)

      res.status(200).json({
        success: true,
        message: 'Opções de filtros acadêmicos recuperadas com sucesso',
        data: converted,
      })
    } catch (error) {
      handleControllerError(
        res,
        error,
        'Erro ao buscar opções de filtros acadêmicos',
      )
    }
  }
}

export default AcademicReportsController
