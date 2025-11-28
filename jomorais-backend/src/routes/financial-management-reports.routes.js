/**
 * @swagger
 * components:
 *   schemas:
 *     FinancialReportFilters:
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
 *         tipoTransacao:
 *           type: string
 *           enum: [payment, tuition, fine, discount]
 *           description: Tipo de transação
 *         statusPagamento:
 *           type: string
 *           enum: [paid, pending, overdue, cancelled]
 *           description: Status do pagamento
 *         dataInicio:
 *           type: string
 *           format: date
 *           description: Data inicial do período
 *         dataFim:
 *           type: string
 *           format: date
 *           description: Data final do período
 *         valorMinimo:
 *           type: number
 *           description: Valor mínimo da transação
 *         valorMaximo:
 *           type: number
 *           description: Valor máximo da transação
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
 *     FinancialTransaction:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID da transação
 *         nomeAluno:
 *           type: string
 *           description: Nome do aluno
 *         numeroMatricula:
 *           type: string
 *           description: Número de matrícula
 *         tipoTransacao:
 *           type: string
 *           description: Tipo de transação
 *         descricao:
 *           type: string
 *           description: Descrição da transação
 *         valor:
 *           type: number
 *           description: Valor da transação
 *         valorPago:
 *           type: number
 *           description: Valor pago
 *         valorPendente:
 *           type: number
 *           description: Valor pendente
 *         statusPagamento:
 *           type: string
 *           description: Status do pagamento
 *         dataTransacao:
 *           type: string
 *           format: date
 *           description: Data da transação
 *         dataPagamento:
 *           type: string
 *           format: date
 *           description: Data do pagamento
 *         metodoPagamento:
 *           type: string
 *           description: Método de pagamento
 * 
 *     FinancialStatistics:
 *       type: object
 *       properties:
 *         valorTotalArrecadado:
 *           type: number
 *           description: Valor total arrecadado
 *         valorTotalPendente:
 *           type: number
 *           description: Valor total pendente
 *         valorTotalAtrasado:
 *           type: number
 *           description: Valor total atrasado
 *         totalTransacoes:
 *           type: integer
 *           description: Total de transações
 *         percentualArrecadacao:
 *           type: number
 *           description: Percentual de arrecadação
 *         ticketMedio:
 *           type: number
 *           description: Ticket médio
 *         distribuicaoPorStatus:
 *           type: object
 *           properties:
 *             pagas:
 *               type: integer
 *             pendentes:
 *               type: integer
 *             atrasadas:
 *               type: integer
 *             canceladas:
 *               type: integer
 *         distribuicaoPorTipo:
 *           type: object
 *           properties:
 *             pagamentos:
 *               type: integer
 *             propinas:
 *               type: integer
 *             multas:
 *               type: integer
 *             descontos:
 *               type: integer
 *         metodosPagamento:
 *           type: object
 *           properties:
 *             dinheiro:
 *               type: integer
 *             transferencia:
 *               type: integer
 *             multicaixa:
 *               type: integer
 *             outros:
 *               type: integer
 * 
 *   tags:
 *     - name: Financial Reports
 *       description: Operações de relatórios financeiros
 */

import express from 'express';
import { FinancialReportsController } from '../controller/financial-management-reports.controller.js';

const router = express.Router();

/**
 * @swagger
 * /api/financial-management/reports/transactions:
 *   get:
 *     summary: Buscar transações financeiras para relatórios
 *     tags: [Financial Reports]
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
 *         name: tipoTransacao
 *         schema:
 *           type: string
 *           enum: [payment, tuition, fine, discount]
 *         description: Filtrar por tipo de transação
 *       - in: query
 *         name: statusPagamento
 *         schema:
 *           type: string
 *           enum: [paid, pending, overdue, cancelled]
 *         description: Filtrar por status do pagamento
 *       - in: query
 *         name: dataInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial do período
 *       - in: query
 *         name: dataFim
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final do período
 *       - in: query
 *         name: valorMinimo
 *         schema:
 *           type: number
 *         description: Valor mínimo da transação
 *       - in: query
 *         name: valorMaximo
 *         schema:
 *           type: number
 *         description: Valor máximo da transação
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
 *         description: Lista de transações financeiras recuperada com sucesso
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
 *                     transactions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/FinancialTransaction'
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
router.get('/transactions', FinancialReportsController.getFinancialTransactions);

/**
 * @swagger
 * /api/financial-management/reports/statistics:
 *   get:
 *     summary: Buscar estatísticas financeiras
 *     tags: [Financial Reports]
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
 *         name: tipoTransacao
 *         schema:
 *           type: string
 *           enum: [payment, tuition, fine, discount]
 *         description: Filtrar por tipo de transação
 *       - in: query
 *         name: statusPagamento
 *         schema:
 *           type: string
 *           enum: [paid, pending, overdue, cancelled]
 *         description: Filtrar por status do pagamento
 *       - in: query
 *         name: dataInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial do período
 *       - in: query
 *         name: dataFim
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final do período
 *     responses:
 *       200:
 *         description: Estatísticas financeiras recuperadas com sucesso
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
 *                   $ref: '#/components/schemas/FinancialStatistics'
 *       400:
 *         description: Parâmetros inválidos
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/statistics', FinancialReportsController.getFinancialStatistics);

/**
 * @swagger
 * /api/financial-management/reports/filter-options:
 *   get:
 *     summary: Buscar opções disponíveis para filtros financeiros
 *     tags: [Financial Reports]
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
 *                     tiposTransacao:
 *                       type: array
 *                       items:
 *                         type: object
 *                     statusPagamento:
 *                       type: array
 *                       items:
 *                         type: object
 *                     metodosPagamento:
 *                       type: array
 *                       items:
 *                         type: object
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/filter-options', FinancialReportsController.getFilterOptions);

export default router;
