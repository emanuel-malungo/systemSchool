// controller/professor-evaluation.controller.js
import { ProfessorEvaluationService } from "../services/professor-evaluation.services.js";
import { handleControllerError } from "../utils/validation.utils.js";

export class ProfessorEvaluationController {
  // ===============================
  // PROFESSORES - CRUD
  // ===============================

  static async createProfessor(req, res) {
    try {
      const professor = await ProfessorEvaluationService.createProfessor(req.body);

      res.status(201).json({
        success: true,
        message: professor.mensagem,
        data: professor
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao criar professor", 400);
    }
  }

  static async updateProfessor(req, res) {
    try {
      const { id } = req.params;
      const professor = await ProfessorEvaluationService.updateProfessor(id, req.body);

      res.json({
        success: true,
        message: professor.mensagem,
        data: professor
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao atualizar professor", 400);
    }
  }

  static async getProfessores(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || '';

      const result = await ProfessorEvaluationService.getProfessores(page, limit, search);

      res.json({
        success: true,
        message: "Professores encontrados",
        ...result
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao buscar professores", 400);
    }
  }

  static async getProfessorById(req, res) {
    try {
      const { id } = req.params;
      const professor = await ProfessorEvaluationService.getProfessorById(id);

      res.json({
        success: true,
        message: "Professor encontrado",
        data: professor
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao buscar professor", 400);
    }
  }

  static async deleteProfessor(req, res) {
    try {
      const { id } = req.params;
      const result = await ProfessorEvaluationService.deleteProfessor(id);

      res.json({
        success: true,
        message: result.mensagem
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao deletar professor", 400);
    }
  }

  static async getProfessoresAtivos(req, res) {
    try {
      const result = await ProfessorEvaluationService.getProfessoresAtivos();

      res.json({
        success: true,
        message: "Professores ativos encontrados",
        data: result
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao buscar professores ativos", 400);
    }
  }

  // ===============================
  // PROFESSOR DISCIPLINA
  // ===============================

  static async assignDisciplinaToProfessor(req, res) {
    try {
      const result = await ProfessorEvaluationService.assignDisciplinaToProfessor(req.body);

      res.status(201).json({
        success: true,
        message: result.mensagem,
        data: result
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao atribuir disciplina", 400);
    }
  }

  static async getProfessorDisciplinas(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const professorId = req.query.professorId;

      const result = await ProfessorEvaluationService.getProfessorDisciplinas(
        page,
        limit,
        professorId
      );

      res.json({
        success: true,
        message: "Disciplinas do professor encontradas",
        ...result
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao buscar disciplinas do professor", 400);
    }
  }

  static async updateProfessorDisciplina(req, res) {
    try {
      const { id } = req.params;
      const result = await ProfessorEvaluationService.updateProfessorDisciplina(id, req.body);

      res.json({
        success: true,
        message: result.mensagem,
        data: result
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao atualizar atribuição de disciplina", 400);
    }
  }

  static async deleteProfessorDisciplina(req, res) {
    try {
      const { id } = req.params;
      const result = await ProfessorEvaluationService.deleteProfessorDisciplina(id);

      res.json({
        success: true,
        message: result.mensagem
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao remover atribuição de disciplina", 400);
    }
  }

  // ===============================
  // PROFESSOR TURMA
  // ===============================

  static async assignTurmaToProfessor(req, res) {
    try {
      const result = await ProfessorEvaluationService.assignTurmaToProfessor(req.body);

      res.status(201).json({
        success: true,
        message: result.mensagem,
        data: result
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao atribuir turma", 400);
    }
  }

  static async getProfessorTurmas(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const professorId = req.query.professorId;

      const result = await ProfessorEvaluationService.getProfessorTurmas(
        page,
        limit,
        professorId
      );

      res.json({
        success: true,
        message: "Turmas do professor encontradas",
        ...result
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao buscar turmas do professor", 400);
    }
  }

  static async updateProfessorTurma(req, res) {
    try {
      const { id } = req.params;
      const result = await ProfessorEvaluationService.updateProfessorTurma(id, req.body);

      res.json({
        success: true,
        message: result.mensagem,
        data: result
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao atualizar atribuição de turma", 400);
    }
  }

  static async deleteProfessorTurma(req, res) {
    try {
      const { id } = req.params;
      const result = await ProfessorEvaluationService.deleteProfessorTurma(id);

      res.json({
        success: true,
        message: result.mensagem
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao remover atribuição de turma", 400);
    }
  }

  // ===============================
  // PERÍODOS DE AVALIAÇÃO
  // ===============================

  static async createPeriodoAvaliacao(req, res) {
    try {
      const result = await ProfessorEvaluationService.createPeriodoAvaliacao(req.body);

      res.status(201).json({
        success: true,
        message: result.mensagem,
        data: result
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao criar período de avaliação", 400);
    }
  }

  static async getPeriodosAvaliacao(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const anoLectivo = req.query.anoLectivo;

      const result = await ProfessorEvaluationService.getPeriodosAvaliacao(
        page,
        limit,
        anoLectivo
      );

      res.json({
        success: true,
        message: "Períodos de avaliação encontrados",
        ...result
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao buscar períodos de avaliação", 400);
    }
  }

  static async getPeriodoAvaliacaoById(req, res) {
    try {
      const { id } = req.params;
      const result = await ProfessorEvaluationService.getPeriodoAvaliacaoById(id);

      res.json({
        success: true,
        message: "Período de avaliação encontrado",
        data: result
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao buscar período de avaliação", 400);
    }
  }

  static async updatePeriodoAvaliacao(req, res) {
    try {
      const { id } = req.params;
      const result = await ProfessorEvaluationService.updatePeriodoAvaliacao(id, req.body);

      res.json({
        success: true,
        message: result.mensagem,
        data: result
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao atualizar período de avaliação", 400);
    }
  }

  static async deletePeriodoAvaliacao(req, res) {
    try {
      const { id } = req.params;
      const result = await ProfessorEvaluationService.deletePeriodoAvaliacao(id);

      res.json({
        success: true,
        message: result.mensagem
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao deletar período de avaliação", 400);
    }
  }

  static async getPeriodosAtivos(req, res) {
    try {
      const result = await ProfessorEvaluationService.getPeriodosAtivos();

      res.json({
        success: true,
        message: "Períodos ativos encontrados",
        data: result
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao buscar períodos ativos", 400);
    }
  }

  // ===============================
  // RELATÓRIOS E ESTATÍSTICAS
  // ===============================

  static async getRelatorioProfessores(req, res) {
    try {
      const result = await ProfessorEvaluationService.getRelatorioProfessores();

      res.json({
        success: true,
        message: "Relatório de professores gerado com sucesso",
        ...result
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao gerar relatório de professores", 400);
    }
  }

  static async getEstatisticasProfessores(req, res) {
    try {
      const result = await ProfessorEvaluationService.getEstatisticasProfessores();

      res.json({
        success: true,
        message: "Estatísticas de professores geradas com sucesso",
        ...result
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao gerar estatísticas de professores", 400);
    }
  }
}
