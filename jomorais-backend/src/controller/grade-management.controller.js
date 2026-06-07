// controller/grade-management.controller.js
import { GradeManagementService } from "../services/grade-management.services.js";
import { handleControllerError } from "../utils/validation.utils.js";

export class GradeManagementController {
  // ===============================
  // LANÇAMENTO DE NOTAS
  // ===============================

  static async createGrade(req, res) {
    try {
      const result = await GradeManagementService.createGrade(req.body);

      res.status(201).json({
        success: true,
        message: result.mensagem,
        data: result
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao lançar nota", 400);
    }
  }

  static async updateGrade(req, res) {
    try {
      const { id } = req.params;
      const result = await GradeManagementService.updateGrade(id, req.body);

      res.json({
        success: true,
        message: result.mensagem,
        data: result
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao atualizar nota", 400);
    }
  }

  static async getGrades(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      // Filtros opcionais
      const filters = {
        codigoAluno: req.query.codigoAluno,
        codigoDisciplina: req.query.codigoDisciplina,
        codigoTurma: req.query.codigoTurma,
        codigoTrimestre: req.query.codigoTrimestre,
        codigoAnoLectivo: req.query.codigoAnoLectivo
      };

      const result = await GradeManagementService.getGrades(page, limit, filters);

      res.json({
        success: true,
        message: "Notas encontradas",
        ...result
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao buscar notas", 400);
    }
  }

  static async getGradeById(req, res) {
    try {
      const { id } = req.params;
      const result = await GradeManagementService.getGradeById(id);

      res.json({
        success: true,
        message: "Nota encontrada",
        data: result
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao buscar nota", 400);
    }
  }

  static async deleteGrade(req, res) {
    try {
      const { id } = req.params;
      const result = await GradeManagementService.deleteGrade(id);

      res.json({
        success: true,
        message: result.mensagem
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao remover nota", 400);
    }
  }

  // ===============================
  // PAUTA
  // ===============================

  static async exportPautaPDF(req, res) {
    try {
      const { codigoTurma, codigoTrimestre, codigoAnoLectivo } = req.query;

      if (!codigoTurma || !codigoTrimestre || !codigoAnoLectivo) {
        return res.status(400).json({
          success: false,
          message: "Parâmetros obrigatórios: codigoTurma, codigoTrimestre, codigoAnoLectivo"
        });
      }

      const pdfBuffer = await GradeManagementService.exportPautaPDF(
        codigoTurma,
        codigoTrimestre,
        codigoAnoLectivo
      );

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="pauta.pdf"');
      res.send(pdfBuffer);
    } catch (error) {
      handleControllerError(res, error, "Erro ao exportar pauta PDF", 400);
    }
  }

  static async exportPautaExcel(req, res) {
    try {
      const { codigoTurma, codigoTrimestre, codigoAnoLectivo } = req.query;

      if (!codigoTurma || !codigoTrimestre || !codigoAnoLectivo) {
        return res.status(400).json({
          success: false,
          message: "Parâmetros obrigatórios: codigoTurma, codigoTrimestre, codigoAnoLectivo"
        });
      }

      const excelBuffer = await GradeManagementService.exportPautaExcel(
        codigoTurma,
        codigoTrimestre,
        codigoAnoLectivo
      );

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="pauta.xlsx"');
      res.send(excelBuffer);
    } catch (error) {
      handleControllerError(res, error, "Erro ao exportar pauta Excel", 400);
    }
  }

  static async generatePauta(req, res) {
    try {
      const { codigoTurma, codigoTrimestre, codigoAnoLectivo } = req.query;

      if (!codigoTurma || !codigoTrimestre || !codigoAnoLectivo) {
        return res.status(400).json({
          success: false,
          message: "Parâmetros obrigatórios: codigoTurma, codigoTrimestre, codigoAnoLectivo"
        });
      }

      const result = await GradeManagementService.generatePauta(
        codigoTurma,
        codigoTrimestre,
        codigoAnoLectivo
      );

      res.json({
        success: true,
        message: "Pauta gerada com sucesso",
        data: result
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao gerar pauta", 400);
    }
  }

  // ===============================
  // BOLETIM
  // ===============================

  static async generateBoletim(req, res) {
    try {
      const { codigoAluno, codigoAnoLectivo } = req.query;

      if (!codigoAluno || !codigoAnoLectivo) {
        return res.status(400).json({
          success: false,
          message: "Parâmetros obrigatórios: codigoAluno, codigoAnoLectivo"
        });
      }

      const result = await GradeManagementService.generateBoletim(
        codigoAluno,
        codigoAnoLectivo
      );

      res.json({
        success: true,
        message: "Boletim gerado com sucesso",
        data: result
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao gerar boletim", 400);
    }
  }

  static async generateBoletimTurma(req, res) {
    try {
      const { codigoTurma, codigoTrimestre, codigoAnoLectivo } = req.query;

      if (!codigoTurma || !codigoTrimestre || !codigoAnoLectivo) {
        return res.status(400).json({
          success: false,
          message: "Parâmetros obrigatórios: codigoTurma, codigoTrimestre, codigoAnoLectivo"
        });
      }

      const result = await GradeManagementService.generateBoletimTurma(
        codigoTurma,
        codigoTrimestre,
        codigoAnoLectivo
      );

      res.json({
        success: true,
        message: "Boletim da turma gerado com sucesso",
        data: result
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao gerar boletim da turma", 400);
    }
  }

  // ===============================
  // HISTÓRICO
  // ===============================

  static async getGradeHistory(req, res) {
    try {
      const { codigoNota } = req.params;

      if (!codigoNota) {
        return res.status(400).json({
          success: false,
          message: "Parâmetro obrigatório: codigoNota"
        });
      }

      const result = await GradeManagementService.getGradeHistory(codigoNota);

      res.json({
        success: true,
        message: "Histórico de alterações encontrado",
        data: result
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao buscar histórico", 400);
    }
  }

  // ===============================
  // ESTATÍSTICAS
  // ===============================

  static async getGradeStatistics(req, res) {
    try {
      const { codigoTurma, codigoTrimestre, codigoAnoLectivo } = req.query;

      if (!codigoTurma || !codigoTrimestre || !codigoAnoLectivo) {
        return res.status(400).json({
          success: false,
          message: "Parâmetros obrigatórios: codigoTurma, codigoTrimestre, codigoAnoLectivo"
        });
      }

      const result = await GradeManagementService.getGradeStatistics(
        codigoTurma,
        codigoTrimestre,
        codigoAnoLectivo
      );

      res.json({
        success: true,
        message: "Estatísticas calculadas com sucesso",
        data: result
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao calcular estatísticas", 400);
    }
  }

  static async getConsolidatedDisciplineStatistics(req, res) {
    try {
      const { codigoTurma, codigoTrimestre, codigoAnoLectivo } = req.query;

      if (!codigoTurma || !codigoTrimestre || !codigoAnoLectivo) {
        return res.status(400).json({
          success: false,
          message: "Parâmetros obrigatórios: codigoTurma, codigoTrimestre, codigoAnoLectivo"
        });
      }

      const result = await GradeManagementService.getConsolidatedDisciplineStatistics(
        codigoTurma,
        codigoTrimestre,
        codigoAnoLectivo
      );

      res.json({
        success: true,
        message: "Estatísticas consolidadas calculadas com sucesso",
        data: result
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao calcular estatísticas consolidadas", 400);
    }
  }

  static async getDisciplineStatistics(req, res) {
    try {
      const { codigoDisciplina, codigoTrimestre, codigoAnoLectivo } = req.query;

      if (!codigoDisciplina || !codigoTrimestre || !codigoAnoLectivo) {
        return res.status(400).json({
          success: false,
          message: "Parâmetros obrigatórios: codigoDisciplina, codigoTrimestre, codigoAnoLectivo"
        });
      }

      const result = await GradeManagementService.getDisciplineStatistics(
        codigoDisciplina,
        codigoTrimestre,
        codigoAnoLectivo
      );

      res.json({
        success: true,
        message: "Estatísticas da disciplina calculadas com sucesso",
        data: result
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao calcular estatísticas", 400);
    }
  }

  static async getTeacherGradeReport(req, res) {
    try {
      const { codigoProfessor, codigoTrimestre, codigoAnoLectivo } = req.query;

      if (!codigoProfessor || !codigoTrimestre || !codigoAnoLectivo) {
        return res.status(400).json({
          success: false,
          message: "Parâmetros obrigatórios: codigoProfessor, codigoTrimestre, codigoAnoLectivo"
        });
      }

      const result = await GradeManagementService.getTeacherGradeReport(
        codigoProfessor,
        codigoTrimestre,
        codigoAnoLectivo
      );

      res.json({
        success: true,
        message: "Relatório do professor gerado com sucesso",
        data: result
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao gerar relatório", 400);
    }
  }

  // ===============================
  // BUSCAR POR CRITÉRIOS
  // ===============================

  static async getGradesByStudent(req, res) {
    try {
      const { codigoAluno, codigoAnoLectivo } = req.query;

      if (!codigoAluno || !codigoAnoLectivo) {
        return res.status(400).json({
          success: false,
          message: "Parâmetros obrigatórios: codigoAluno, codigoAnoLectivo"
        });
      }

      const result = await GradeManagementService.getGradesByStudent(
        codigoAluno,
        codigoAnoLectivo
      );

      res.json({
        success: true,
        message: "Notas do aluno encontradas",
        data: result
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao buscar notas do aluno", 400);
    }
  }

  static async getGradesByDiscipline(req, res) {
    try {
      const { codigoDisciplina, codigoAnoLectivo } = req.query;

      if (!codigoDisciplina || !codigoAnoLectivo) {
        return res.status(400).json({
          success: false,
          message: "Parâmetros obrigatórios: codigoDisciplina, codigoAnoLectivo"
        });
      }

      const result = await GradeManagementService.getGradesByDiscipline(
        codigoDisciplina,
        codigoAnoLectivo
      );

      res.json({
        success: true,
        message: "Notas por disciplina encontradas",
        data: result
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao buscar notas por disciplina", 400);
    }
  }

  static async getGradesByClassroom(req, res) {
    try {
      const { codigoTurma, codigoAnoLectivo } = req.query;

      if (!codigoTurma || !codigoAnoLectivo) {
        return res.status(400).json({
          success: false,
          message: "Parâmetros obrigatórios: codigoTurma, codigoAnoLectivo"
        });
      }

      const result = await GradeManagementService.getGradesByClassroom(
        codigoTurma,
        codigoAnoLectivo
      );

      res.json({
        success: true,
        message: "Notas por turma encontradas",
        data: result
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao buscar notas por turma", 400);
    }
  }

  // ===============================
  // IMPORTAÇÃO BULK
  // ===============================

  static async importGradesBulk(req, res) {
    try {
      const result = await GradeManagementService.importGradesBulk(req.body);

      res.status(201).json({
        success: true,
        message: `${result.sucessos} notas importadas, ${result.erros} erros`,
        data: result
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao importar notas", 400);
    }
  }
}
