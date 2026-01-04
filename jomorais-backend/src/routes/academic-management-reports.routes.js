/**
 * Rotas de relatórios acadêmicos
 * Base: /api/academic-management/reports
 */

import express from 'express'
import { AcademicReportsController } from '../controller/academic-management-reports.controller.js'

const router = express.Router()

// Lista de alunos com dados acadêmicos
router.get('/students', AcademicReportsController.getAcademicStudents)

// Estatísticas acadêmicas gerais
router.get('/statistics', AcademicReportsController.getAcademicStatistics)

// Desempenho por turma/classe
router.get('/class-performance', AcademicReportsController.getClassPerformance)

// Desempenho por professor
router.get('/teacher-performance', AcademicReportsController.getTeacherPerformance)

// Opções de filtros acadêmicos
router.get('/filter-options', AcademicReportsController.getFilterOptions)

export default router
