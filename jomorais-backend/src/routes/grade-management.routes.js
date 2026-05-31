/**
 * @swagger
 * tags:
 *   - name: Gestão de Notas - Lançamento
 *     description: CRUD completo de lançamento de notas
 *   - name: Gestão de Notas - Pautas
 *     description: Geração de pautas consolidadas
 *   - name: Gestão de Notas - Boletins
 *     description: Geração de boletins por aluno
 *   - name: Gestão de Notas - Estatísticas
 *     description: Relatórios e análises de desempenho
 *   - name: Gestão de Notas - Historial
 *     description: Auditoria de alterações em notas
 *
 * components:
 *   schemas:
 *     Nota:
 *       type: object
 *       required:
 *         - codigoAluno
 *         - codigoDisciplina
 *         - nota
 *         - codigoAnoLectivo
 *         - codigoTipoAvaliacao
 *         - codigoTrimestre
 *         - codigoUtilizador
 *       properties:
 *         codigoAluno:
 *           type: integer
 *           description: Código do aluno
 *         codigoDisciplina:
 *           type: integer
 *           description: Código da disciplina
 *         nota:
 *           type: number
 *           format: float
 *           minimum: 0
 *           maximum: 20
 *           description: Nota (0-20)
 *         codigoAnoLectivo:
 *           type: integer
 *           description: Código do ano letivo
 *         codigoTipoAvaliacao:
 *           type: integer
 *           description: Código do tipo de avaliação
 *         codigoTrimestre:
 *           type: integer
 *           description: Código do trimestre
 *         codigoTurma:
 *           type: integer
 *           description: Código da turma (opcional)
 *         codigoUtilizador:
 *           type: integer
 *           description: Código do utilizador que lança a nota
 *       example:
 *         codigoAluno: 1
 *         codigoDisciplina: 5
 *         nota: 15.5
 *         codigoAnoLectivo: 1
 *         codigoTipoAvaliacao: 2
 *         codigoTrimestre: 1
 *         codigoTurma: 3
 *         codigoUtilizador: 10
 */

import { Router } from 'express';
import { GradeManagementController } from '../controller/grade-management.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

// ===============================
// LANÇAMENTO DE NOTAS
// ===============================

/**
 * @swagger
 * /api/grades/notas:
 *   post:
 *     summary: Lançar nova nota
 *     tags: [Gestão de Notas - Lançamento]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Nota'
 *     responses:
 *       201:
 *         description: Nota lançada com sucesso
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: Nota duplicada
 */
router.post('/notas', GradeManagementController.createGrade);

/**
 * @swagger
 * /api/grades/notas:
 *   get:
 *     summary: Listar notas com filtros
 *     tags: [Gestão de Notas - Lançamento]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: codigoAluno
 *         schema:
 *           type: integer
 *       - in: query
 *         name: codigoDisciplina
 *         schema:
 *           type: integer
 *       - in: query
 *         name: codigoTurma
 *         schema:
 *           type: integer
 *       - in: query
 *         name: codigoTrimestre
 *         schema:
 *           type: integer
 *       - in: query
 *         name: codigoAnoLectivo
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Notas encontradas
 */
router.get('/notas', GradeManagementController.getGrades);

/**
 * @swagger
 * /api/grades/notas/{id}:
 *   get:
 *     summary: Obter nota por ID
 *     tags: [Gestão de Notas - Lançamento]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Nota encontrada
 *       404:
 *         description: Nota não encontrada
 */
router.get('/notas/:id', GradeManagementController.getGradeById);

/**
 * @swagger
 * /api/grades/notas/{id}:
 *   put:
 *     summary: Atualizar nota
 *     tags: [Gestão de Notas - Lançamento]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nota:
 *                 type: number
 *                 description: Nova nota
 *               motivo:
 *                 type: string
 *                 description: Motivo da alteração
 *               codigoUtilizador:
 *                 type: integer
 *                 description: Utilizador que faz a alteração
 *     responses:
 *       200:
 *         description: Nota atualizada com sucesso
 *       404:
 *         description: Nota não encontrada
 */
router.put('/notas/:id', GradeManagementController.updateGrade);

/**
 * @swagger
 * /api/grades/notas/{id}:
 *   delete:
 *     summary: Remover nota
 *     tags: [Gestão de Notas - Lançamento]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Nota removida com sucesso
 *       404:
 *         description: Nota não encontrada
 */
router.delete('/notas/:id', GradeManagementController.deleteGrade);

// ===============================
// PAUTAS
// ===============================

/**
 * @swagger
 * /api/grades/pautas:
 *   get:
 *     summary: Gerar pauta de turma
 *     tags: [Gestão de Notas - Pautas]
 *     parameters:
 *       - in: query
 *         name: codigoTurma
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: codigoTrimestre
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: codigoAnoLectivo
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Pauta gerada com sucesso
 */
router.get('/pautas', GradeManagementController.generatePauta);

// ===============================
// BOLETINS
// ===============================

/**
 * @swagger
 * /api/grades/boletins:
 *   get:
 *     summary: Gerar boletim de aluno
 *     tags: [Gestão de Notas - Boletins]
 *     parameters:
 *       - in: query
 *         name: codigoAluno
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: codigoAnoLectivo
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Boletim gerado com sucesso
 */
router.get('/boletins', GradeManagementController.generateBoletim);
router.get('/boletins-turma', GradeManagementController.generateBoletimTurma);

// ===============================
// HISTÓRICO DE ALTERAÇÕES
// ===============================

/**
 * @swagger
 * /api/grades/historico/{codigoNota}:
 *   get:
 *     summary: Obter histórico de alterações de nota
 *     tags: [Gestão de Notas - Historial]
 *     parameters:
 *       - in: path
 *         name: codigoNota
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Histórico encontrado
 *       404:
 *         description: Nenhum histórico encontrado
 */
router.get('/historico/:codigoNota', GradeManagementController.getGradeHistory);

// ===============================
// ESTATÍSTICAS - TURMA
// ===============================

/**
 * @swagger
 * /api/grades/estatisticas/turma:
 *   get:
 *     summary: Obter estatísticas de turma
 *     tags: [Gestão de Notas - Estatísticas]
 *     parameters:
 *       - in: query
 *         name: codigoTurma
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: codigoTrimestre
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: codigoAnoLectivo
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Estatísticas calculadas
 */
router.get('/estatisticas/turma', GradeManagementController.getGradeStatistics);

/**
 * @swagger
 * /api/grades/estatisticas/disciplina:
 *   get:
 *     summary: Obter estatísticas de disciplina
 *     tags: [Gestão de Notas - Estatísticas]
 *     parameters:
 *       - in: query
 *         name: codigoDisciplina
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: codigoTrimestre
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: codigoAnoLectivo
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Estatísticas da disciplina calculadas
 */
router.get('/estatisticas/disciplina', GradeManagementController.getDisciplineStatistics);

/**
 * @swagger
 * /api/grades/relatorios/professor:
 *   get:
 *     summary: Obter relatório de notas do professor
 *     tags: [Gestão de Notas - Estatísticas]
 *     parameters:
 *       - in: query
 *         name: codigoProfessor
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: codigoTrimestre
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: codigoAnoLectivo
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Relatório gerado com sucesso
 */
router.get('/relatorios/professor', GradeManagementController.getTeacherGradeReport);

// ===============================
// CONSULTAS ESPECIAIS
// ===============================

/**
 * @swagger
 * /api/grades/aluno:
 *   get:
 *     summary: Buscar notas por aluno
 *     tags: [Gestão de Notas - Lançamento]
 *     parameters:
 *       - in: query
 *         name: codigoAluno
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: codigoAnoLectivo
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Notas do aluno encontradas
 */
router.get('/aluno', GradeManagementController.getGradesByStudent);

/**
 * @swagger
 * /api/grades/disciplina:
 *   get:
 *     summary: Buscar notas por disciplina
 *     tags: [Gestão de Notas - Lançamento]
 *     parameters:
 *       - in: query
 *         name: codigoDisciplina
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: codigoAnoLectivo
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Notas da disciplina encontradas
 */
router.get('/disciplina', GradeManagementController.getGradesByDiscipline);

/**
 * @swagger
 * /api/grades/turma:
 *   get:
 *     summary: Buscar notas por turma
 *     tags: [Gestão de Notas - Lançamento]
 *     parameters:
 *       - in: query
 *         name: codigoTurma
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: codigoAnoLectivo
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Notas da turma encontradas
 */
router.get('/turma', GradeManagementController.getGradesByClassroom);

// ===============================
// IMPORTAÇÃO BULK
// ===============================

/**
 * @swagger
 * /api/grades/import-bulk:
 *   post:
 *     summary: Importar múltiplas notas em uma única operação
 *     tags: [Gestão de Notas - Lançamento]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - grades
 *               - codigoAnoLectivo
 *               - codigoUtilizador
 *             properties:
 *               grades:
 *                 type: array
 *                 description: Array de notas a importar
 *                 items:
 *                   type: object
 *                   properties:
 *                     codigoAluno:
 *                       type: integer
 *                     codigoDisciplina:
 *                       type: integer
 *                     nota:
 *                       type: number
 *                     codigoTipoAvaliacao:
 *                       type: integer
 *                     codigoTrimestre:
 *                       type: integer
 *                     codigoTurma:
 *                       type: integer
 *               codigoAnoLectivo:
 *                 type: integer
 *               codigoUtilizador:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Notas importadas
 */
router.post('/import-bulk', GradeManagementController.importGradesBulk);

export default router;
