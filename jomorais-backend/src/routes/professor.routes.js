// routes/professor.routes.js
import express from 'express';
import { ProfessorController } from '../controller/professor.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Todas as rotas do professor necessitam de token de autenticação
router.use(authenticateToken);

/**
 * @route GET /api/professor/perfil
 * @desc Obter dados do professor autenticado
 */
router.get('/perfil', ProfessorController.getPerfil);

/**
 * @route GET /api/professor/minhas-atribuicoes
 * @desc Listar turmas e disciplinas atribuídas ao professor
 */
router.get('/minhas-atribuicoes', ProfessorController.getMinhasAtribuicoes);

/**
 * @route GET /api/professor/turmas/:turmaId/alunos
 * @desc Listar alunos ativos de uma das turmas do professor
 */
router.get('/turmas/:turmaId/alunos', ProfessorController.getAlunosDaTurma);

/**
 * @route GET /api/professor/minhas-notas
 * @desc Histórico de notas lançadas pelo professor
 */
router.get('/minhas-notas', ProfessorController.getMinhasNotas);

/**
 * @route POST /api/professor/lancar-notas
 * @desc Lançamento em lote de notas (com validação de período)
 */
router.post('/lancar-notas', ProfessorController.lancarNotas);

/**
 * @route PUT /api/professor/alterar-senha
 * @desc Alterar senha do professor logado
 */
router.put('/alterar-senha', ProfessorController.alterarSenha);

export default router;
