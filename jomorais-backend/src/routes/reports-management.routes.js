/**
 * @swagger
 * components:
 *   schemas:
 *     StudentReportFilters:
 *       type: object
 *       properties:
 *         anoAcademico:
 *           type: string
 *           description: Ano académico para filtrar
 *           example: "2025"
 *         classe:
 *           type: string
 *           description: Classe para filtrar
 *           example: "10ª"
 *         curso:
 *           type: string
 *           description: Curso para filtrar
 *           example: "Informática"
 *         estado:
 *           type: string
 *           enum: [Ativo, Transferido, Desistente, Finalizado]
 *           description: Estado do aluno
 *         genero:
 *           type: string
 *           enum: [M, F]
 *           description: Género do aluno
 *         periodo:
 *           type: string
 *           enum: [Manhã, Tarde, Noite]
 *           description: Período de estudo
 *         dataMatriculaFrom:
 *           type: string
 *           format: date
 *           description: Data inicial de matrícula
 *         dataMatriculaTo:
 *           type: string
 *           format: date
 *           description: Data final de matrícula
 *         search:
 *           type: string
 *           description: Termo de pesquisa
 *         page:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *           description: Página atual
 *         limit:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *           description: Itens por página
 * 
 *     StudentReportData:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID do aluno
 *         nome:
 *           type: string
 *           description: Nome do aluno
 *         numeroMatricula:
 *           type: string
 *           description: Número de matrícula
 *         email:
 *           type: string
 *           description: Email do aluno
 *         telefone:
 *           type: string
 *           description: Telefone do aluno
 *         classe:
 *           type: string
 *           description: Classe atual
 *         curso:
 *           type: string
 *           description: Curso atual
 *         estado:
 *           type: string
 *           description: Estado do aluno
 *         dataMatricula:
 *           type: string
 *           format: date
 *           description: Data de matrícula
 * 
 *     StudentStatistics:
 *       type: object
 *       properties:
 *         totalAlunos:
 *           type: integer
 *           description: Total de alunos
 *         alunosAtivos:
 *           type: integer
 *           description: Número de alunos ativos
 *         alunosTransferidos:
 *           type: integer
 *           description: Número de alunos transferidos
 *         alunosDesistentes:
 *           type: integer
 *           description: Número de alunos desistentes
 *         distribuicaoGenero:
 *           type: object
 *           properties:
 *             masculino:
 *               type: integer
 *             feminino:
 *               type: integer
 *             percentualMasculino:
 *               type: string
 *             percentualFeminino:
 *               type: string
 * 
 *   tags:
 *     - name: Reports Management
 *       description: Operações de gestão de relatórios
 */

import express from 'express';
import { ReportsManagementController } from '../controller/reports-management.controller.js';

const router = express.Router();

/**
 * @swagger
 * /api/reports-management/students:
 *   get:
 *     summary: Buscar alunos para relatórios com filtros
 *     tags: [Reports Management]
 *     parameters:
 *       - in: query
 *         name: anoAcademico
 *         schema:
 *           type: string
 *         description: Filtrar por ano académico
 *       - in: query
 *         name: classe
 *         schema:
 *           type: string
 *         description: Filtrar por classe
 *       - in: query
 *         name: curso
 *         schema:
 *           type: string
 *         description: Filtrar por curso
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [Ativo, Transferido, Desistente, Finalizado]
 *         description: Filtrar por estado do aluno
 *       - in: query
 *         name: genero
 *         schema:
 *           type: string
 *           enum: [M, F]
 *         description: Filtrar por género
 *       - in: query
 *         name: periodo
 *         schema:
 *           type: string
 *           enum: [Manhã, Tarde, Noite]
 *         description: Filtrar por período
 *       - in: query
 *         name: dataMatriculaFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial de matrícula
 *       - in: query
 *         name: dataMatriculaTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final de matrícula
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Termo de pesquisa
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Página atual
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Itens por página
 *     responses:
 *       200:
 *         description: Lista de alunos recuperada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     students:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/StudentReportData'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         totalItems:
 *                           type: integer
 *                         itemsPerPage:
 *                           type: integer
 *                         hasNextPage:
 *                           type: boolean
 *                         hasPrevPage:
 *                           type: boolean
 *       400:
 *         description: Parâmetros inválidos
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/students', ReportsManagementController.getStudentsForReport);

/**
 * @swagger
 * /api/reports-management/students/statistics:
 *   get:
 *     summary: Buscar estatísticas dos alunos
 *     tags: [Reports Management]
 *     parameters:
 *       - in: query
 *         name: anoAcademico
 *         schema:
 *           type: string
 *         description: Filtrar por ano académico
 *       - in: query
 *         name: classe
 *         schema:
 *           type: string
 *         description: Filtrar por classe
 *       - in: query
 *         name: curso
 *         schema:
 *           type: string
 *         description: Filtrar por curso
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [Ativo, Transferido, Desistente, Finalizado]
 *         description: Filtrar por estado do aluno
 *       - in: query
 *         name: genero
 *         schema:
 *           type: string
 *           enum: [M, F]
 *         description: Filtrar por género
 *       - in: query
 *         name: periodo
 *         schema:
 *           type: string
 *           enum: [Manhã, Tarde, Noite]
 *         description: Filtrar por período
 *     responses:
 *       200:
 *         description: Estatísticas recuperadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/StudentStatistics'
 *       400:
 *         description: Parâmetros inválidos
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/students/statistics', ReportsManagementController.getStudentStatistics);

/**
 * @swagger
 * /api/reports-management/students/{id}:
 *   get:
 *     summary: Buscar dados de um aluno específico para relatório
 *     tags: [Reports Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do aluno
 *     responses:
 *       200:
 *         description: Dados do aluno recuperados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     dadosPessoais:
 *                       type: object
 *                     encarregado:
 *                       type: object
 *                     proveniencia:
 *                       type: object
 *                     historicoMatriculas:
 *                       type: array
 *                     historicoConfirmacoes:
 *                       type: array
 *       404:
 *         description: Aluno não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/students/:id', ReportsManagementController.getStudentReportData);

/**
 * @swagger
 * /api/reports-management/students/generate:
 *   post:
 *     summary: Gerar relatório geral de alunos
 *     tags: [Reports Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               format:
 *                 type: string
 *                 enum: [pdf, excel, word]
 *                 default: pdf
 *                 description: Formato do relatório
 *               filters:
 *                 $ref: '#/components/schemas/StudentReportFilters'
 *               includeStatistics:
 *                 type: boolean
 *                 default: true
 *                 description: Incluir estatísticas no relatório
 *               includeCharts:
 *                 type: boolean
 *                 default: false
 *                 description: Incluir gráficos no relatório
 *     responses:
 *       200:
 *         description: Relatório gerado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                 meta:
 *                   type: object
 *       400:
 *         description: Dados inválidos
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/students/generate', ReportsManagementController.generateStudentsReport);

/**
 * @swagger
 * /api/reports-management/students/{id}/generate:
 *   post:
 *     summary: Gerar relatório individual de aluno
 *     tags: [Reports Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do aluno
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               format:
 *                 type: string
 *                 enum: [pdf, word]
 *                 default: pdf
 *                 description: Formato do relatório
 *               includeHistory:
 *                 type: boolean
 *                 default: true
 *                 description: Incluir histórico acadêmico
 *               includeEncarregado:
 *                 type: boolean
 *                 default: true
 *                 description: Incluir dados do encarregado
 *               includeProveniencia:
 *                 type: boolean
 *                 default: true
 *                 description: Incluir dados de proveniência
 *     responses:
 *       200:
 *         description: Relatório individual gerado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                 meta:
 *                   type: object
 *       404:
 *         description: Aluno não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/students/:id/generate', ReportsManagementController.generateIndividualStudentReport);

/**
 * @swagger
 * /api/reports-management/filter-options:
 *   get:
 *     summary: Buscar opções disponíveis para filtros
 *     tags: [Reports Management]
 *     responses:
 *       200:
 *         description: Opções de filtros recuperadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     anosAcademicos:
 *                       type: array
 *                       items:
 *                         type: string
 *                     classes:
 *                       type: array
 *                       items:
 *                         type: string
 *                     cursos:
 *                       type: array
 *                       items:
 *                         type: string
 *                     estados:
 *                       type: array
 *                       items:
 *                         type: string
 *                     generos:
 *                       type: array
 *                       items:
 *                         type: object
 *                     periodos:
 *                       type: array
 *                       items:
 *                         type: string
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/filter-options', ReportsManagementController.getFilterOptions);

export default router;
