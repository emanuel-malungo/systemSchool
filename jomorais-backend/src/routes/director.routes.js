import express from 'express';
import { DirectorController } from '../controller/director.controller.js';
import { authenticateToken, requireLegacyUserType } from '../middleware/auth.middleware.js';

const router = express.Router();

// O código de tipo de utilizador para 'DIRECTOR DE TURMA' é 10 (baseado no output do setup script)
// Caso precise, também podemos validar se o usuário existe em tb_directores_turmas.
router.use(authenticateToken);

// Middlewares adicionais podem ser aplicados se for estritamente do tipo Director, 
// Mas vamos assumir que apenas ter autenticação é seguro, pois os métodos do controller 
// verificam a tabela tb_directores_turmas para a autorização real da Turma.

router.get('/perfil', DirectorController.getPerfil);
router.get('/minhas-turmas', DirectorController.getMinhasTurmas);
router.get('/turmas/:turmaId/alunos', DirectorController.getAlunosDaTurma);
router.get('/turmas/:turmaId/notas', DirectorController.getNotasDaTurma);
router.post('/lancar-notas', DirectorController.lancarNotas);
router.get('/boletins-turma/:turmaId', DirectorController.getBoletimTurma);

export default router;
