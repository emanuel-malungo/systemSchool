/**
 * @swagger
 * tags:
 *   - name: Gestão Acadêmica - Professores e Avaliação
 *     description: Sistema completo de gestão de professores e períodos de avaliação
 *   - name: Professores
 *     description: CRUD de professores
 *   - name: Professor Disciplina
 *     description: Atribuição de disciplinas a professores
 *   - name: Professor Turma
 *     description: Atribuição de turmas a professores
 *   - name: Períodos Avaliação
 *     description: Gestão de períodos de avaliação
 *   - name: Relatórios Professores
 *     description: Operações especiais e relatórios
 *
 * components:
 *   schemas:
 *     Professor:
 *       type: object
 *       required:
 *         - nome
 *         - email
 *         - formacao
 *         - nivelAcademico
 *       properties:
 *         Codigo:
 *           type: integer
 *           description: Código único do professor
 *         nome:
 *           type: string
 *           description: Nome completo do professor
 *         email:
 *           type: string
 *           description: Email do professor
 *         telefone:
 *           type: string
 *           description: Telefone de contacto
 *         formacao:
 *           type: string
 *           description: Formação académica
 *         nivelAcademico:
 *           type: string
 *           description: Nível académico (ex: Licenciado, Mestre)
 *         especialidade:
 *           type: string
 *           description: Especialidade do professor
 *         numeroFuncionario:
 *           type: string
 *           description: Número de funcionário
 *         dataAdmissao:
 *           type: string
 *           format: date
 *           description: Data de admissão
 *         status:
 *           type: string
 *           enum: [Activo, Inactivo]
 *           description: Status do professor
 *       example:
 *         nome: "João da Silva"
 *         email: "joao.silva@escola.ao"
 *         formacao: "Licenciatura em Física"
 *         nivelAcademico: "Licenciado"
 *         especialidade: "Física"
 *         telefone: "923456789"
 *         status: "Activo"
 *
 *     PeriodoAvaliacao:
 *       type: object
 *       required:
 *         - designacao
 *         - tipoAvaliacao
 *         - trimestre
 *         - dataInicio
 *         - dataFim
 *         - anoLectivo
 *       properties:
 *         Codigo:
 *           type: integer
 *           description: Código único do período
 *         Designacao:
 *           type: string
 *           description: Designação do período
 *         TipoAvaliacao:
 *           type: string
 *           description: Tipo de avaliação (Formativa, Somativa)
 *         Trimestre:
 *           type: integer
 *           enum: [1, 2, 3]
 *           description: Número do trimestre
 *         DataInicio:
 *           type: string
 *           format: date
 *           description: Data de início do período
 *         DataFim:
 *           type: string
 *           format: date
 *           description: Data de fim do período
 *         AnoLectivo:
 *           type: string
 *           description: Ano letivo (ex: 2024/2025)
 *         Status:
 *           type: string
 *           enum: [Activo, Inactivo]
 *           description: Status do período
 *       example:
 *         designacao: "Avaliação 1º Trimestre"
 *         tipoAvaliacao: "Somativa"
 *         trimestre: 1
 *         dataInicio: "2024-02-01"
 *         dataFim: "2024-04-30"
 *         anoLectivo: "2024/2025"
 *         status: "Activo"
 */

import { Router } from 'express';
import { ProfessorEvaluationController } from '../controller/professor-evaluation.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

// Aplicar middleware de autenticação a todas as rotas
// router.use(authenticateToken);

// ===============================
// ROTAS PROFESSORES
// ===============================

/**
 * @swagger
 * /api/professor-evaluation/professores:
 *   post:
 *     summary: Criar novo professor
 *     tags: [Professores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Professor'
 *     responses:
 *       201:
 *         description: Professor criado com sucesso
 *       400:
 *         description: Erro ao criar professor
 */
router.post('/professores', ProfessorEvaluationController.createProfessor);

/**
 * @swagger
 * /api/professor-evaluation/professores:
 *   get:
 *     summary: Listar professores com paginação
 *     tags: [Professores]
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nome, email ou telefone
 *     responses:
 *       200:
 *         description: Professores encontrados
 */
router.get('/professores', ProfessorEvaluationController.getProfessores);

/**
 * @swagger
 * /api/professor-evaluation/professores/ativos:
 *   get:
 *     summary: Listar professores ativos
 *     tags: [Professores]
 *     responses:
 *       200:
 *         description: Professores ativos encontrados
 */
router.get('/professores/ativos', ProfessorEvaluationController.getProfessoresAtivos);

/**
 * @swagger
 * /api/professor-evaluation/professores/{id}:
 *   get:
 *     summary: Obter professor por ID
 *     tags: [Professores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Professor encontrado
 *       404:
 *         description: Professor não encontrado
 */
router.get('/professores/:id', ProfessorEvaluationController.getProfessorById);

/**
 * @swagger
 * /api/professor-evaluation/professores/{id}:
 *   put:
 *     summary: Atualizar professor
 *     tags: [Professores]
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
 *             $ref: '#/components/schemas/Professor'
 *     responses:
 *       200:
 *         description: Professor atualizado com sucesso
 *       404:
 *         description: Professor não encontrado
 */
router.put('/professores/:id', ProfessorEvaluationController.updateProfessor);

/**
 * @swagger
 * /api/professor-evaluation/professores/{id}:
 *   delete:
 *     summary: Deletar professor (soft delete)
 *     tags: [Professores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Professor deletado com sucesso
 *       404:
 *         description: Professor não encontrado
 */
router.delete('/professores/:id', ProfessorEvaluationController.deleteProfessor);

// ===============================
// ROTAS PROFESSOR DISCIPLINA
// ===============================

/**
 * @swagger
 * /api/professor-evaluation/professor-disciplina:
 *   post:
 *     summary: Atribuir disciplina a professor
 *     tags: [Professor Disciplina]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - codigoProfessor
 *               - codigoDisciplina
 *               - codigoCurso
 *               - anoLectivo
 *             properties:
 *               codigoProfessor:
 *                 type: integer
 *               codigoDisciplina:
 *                 type: integer
 *               codigoCurso:
 *                 type: integer
 *               anoLectivo:
 *                 type: string
 *     responses:
 *       201:
 *         description: Disciplina atribuída com sucesso
 *       409:
 *         description: Atribuição duplicada
 */
router.post('/professor-disciplina', ProfessorEvaluationController.assignDisciplinaToProfessor);

/**
 * @swagger
 * /api/professor-evaluation/professor-disciplina:
 *   get:
 *     summary: Listar atribuições de disciplinas
 *     tags: [Professor Disciplina]
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
 *         name: professorId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Atribuições encontradas
 */
router.get('/professor-disciplina', ProfessorEvaluationController.getProfessorDisciplinas);

/**
 * @swagger
 * /api/professor-evaluation/professor-disciplina/{id}:
 *   put:
 *     summary: Atualizar atribuição de disciplina
 *     tags: [Professor Disciplina]
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
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Atribuição atualizada com sucesso
 */
router.put('/professor-disciplina/:id', ProfessorEvaluationController.updateProfessorDisciplina);

/**
 * @swagger
 * /api/professor-evaluation/professor-disciplina/{id}:
 *   delete:
 *     summary: Remover atribuição de disciplina
 *     tags: [Professor Disciplina]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Atribuição removida com sucesso
 */
router.delete('/professor-disciplina/:id', ProfessorEvaluationController.deleteProfessorDisciplina);

// ===============================
// ROTAS PROFESSOR TURMA
// ===============================

/**
 * @swagger
 * /api/professor-evaluation/professor-turma:
 *   post:
 *     summary: Atribuir turma a professor
 *     tags: [Professor Turma]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - codigoProfessor
 *               - codigoTurma
 *               - codigoDisciplina
 *               - anoLectivo
 *             properties:
 *               codigoProfessor:
 *                 type: integer
 *               codigoTurma:
 *                 type: integer
 *               codigoDisciplina:
 *                 type: integer
 *               anoLectivo:
 *                 type: string
 *     responses:
 *       201:
 *         description: Turma atribuída com sucesso
 */
router.post('/professor-turma', ProfessorEvaluationController.assignTurmaToProfessor);

/**
 * @swagger
 * /api/professor-evaluation/professor-turma:
 *   get:
 *     summary: Listar atribuições de turmas
 *     tags: [Professor Turma]
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
 *         name: professorId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Atribuições encontradas
 */
router.get('/professor-turma', ProfessorEvaluationController.getProfessorTurmas);

/**
 * @swagger
 * /api/professor-evaluation/professor-turma/{id}:
 *   put:
 *     summary: Atualizar atribuição de turma
 *     tags: [Professor Turma]
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
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Atribuição atualizada com sucesso
 */
router.put('/professor-turma/:id', ProfessorEvaluationController.updateProfessorTurma);

/**
 * @swagger
 * /api/professor-evaluation/professor-turma/{id}:
 *   delete:
 *     summary: Remover atribuição de turma
 *     tags: [Professor Turma]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Atribuição removida com sucesso
 */
router.delete('/professor-turma/:id', ProfessorEvaluationController.deleteProfessorTurma);

// ===============================
// ROTAS PERÍODOS DE AVALIAÇÃO
// ===============================

/**
 * @swagger
 * /api/professor-evaluation/periodos-avaliacao:
 *   post:
 *     summary: Criar período de avaliação
 *     tags: [Períodos Avaliação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PeriodoAvaliacao'
 *     responses:
 *       201:
 *         description: Período criado com sucesso
 */
router.post('/periodos-avaliacao', ProfessorEvaluationController.createPeriodoAvaliacao);

/**
 * @swagger
 * /api/professor-evaluation/periodos-avaliacao:
 *   get:
 *     summary: Listar períodos de avaliação
 *     tags: [Períodos Avaliação]
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
 *         name: anoLectivo
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Períodos encontrados
 */
router.get('/periodos-avaliacao', ProfessorEvaluationController.getPeriodosAvaliacao);

/**
 * @swagger
 * /api/professor-evaluation/periodos-avaliacao/ativos:
 *   get:
 *     summary: Listar períodos ativos
 *     tags: [Períodos Avaliação]
 *     responses:
 *       200:
 *         description: Períodos ativos encontrados
 */
router.get('/periodos-avaliacao/ativos', ProfessorEvaluationController.getPeriodosAtivos);

/**
 * @swagger
 * /api/professor-evaluation/periodos-avaliacao/{id}:
 *   get:
 *     summary: Obter período por ID
 *     tags: [Períodos Avaliação]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Período encontrado
 */
router.get('/periodos-avaliacao/:id', ProfessorEvaluationController.getPeriodoAvaliacaoById);

/**
 * @swagger
 * /api/professor-evaluation/periodos-avaliacao/{id}:
 *   put:
 *     summary: Atualizar período de avaliação
 *     tags: [Períodos Avaliação]
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
 *             $ref: '#/components/schemas/PeriodoAvaliacao'
 *     responses:
 *       200:
 *         description: Período atualizado com sucesso
 */
router.put('/periodos-avaliacao/:id', ProfessorEvaluationController.updatePeriodoAvaliacao);

/**
 * @swagger
 * /api/professor-evaluation/periodos-avaliacao/{id}:
 *   delete:
 *     summary: Deletar período de avaliação
 *     tags: [Períodos Avaliação]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Período deletado com sucesso
 */
router.delete('/periodos-avaliacao/:id', ProfessorEvaluationController.deletePeriodoAvaliacao);

// ===============================
// ROTAS RELATÓRIOS
// ===============================

/**
 * @swagger
 * /api/professor-evaluation/relatorios/professores:
 *   get:
 *     summary: Gerar relatório de professores
 *     tags: [Relatórios Professores]
 *     responses:
 *       200:
 *         description: Relatório gerado com sucesso
 */
router.get('/relatorios/professores', ProfessorEvaluationController.getRelatorioProfessores);

/**
 * @swagger
 * /api/professor-evaluation/estatisticas/professores:
 *   get:
 *     summary: Gerar estatísticas de professores
 *     tags: [Relatórios Professores]
 *     responses:
 *       200:
 *         description: Estatísticas geradas com sucesso
 */
router.get('/estatisticas/professores', ProfessorEvaluationController.getEstatisticasProfessores);

export default router;
