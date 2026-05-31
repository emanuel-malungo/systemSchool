// routes/periodos-lancamento.routes.js
import express from 'express';
import { PeriodosLancamentoController } from '../controller/periodos-lancamento.controller.js';

const router = express.Router();

// Listar todos os períodos (protegido)
router.get('/', PeriodosLancamentoController.listarPeriodos);

// Listar períodos ativos (público - usado por professores)
router.get('/ativos', PeriodosLancamentoController.listarPeriodosAtivos);

// Listar anos letivos disponíveis (público - para formulários)
router.get('/anos-letivos', PeriodosLancamentoController.listarAnosLetivos);

// Criar novo período
router.post('/', PeriodosLancamentoController.criarPeriodo);

// Alterar status (ativar/desativar)
router.put('/:id/status', PeriodosLancamentoController.alterarStatusPeriodo);

// Excluir período (bloqueado se houver notas)
router.delete('/:id', PeriodosLancamentoController.excluirPeriodo);

export default router;
