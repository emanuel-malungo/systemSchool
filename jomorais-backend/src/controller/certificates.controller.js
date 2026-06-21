/**
 * Controller de Certificados
 */

import { CertificatesService } from '../services/certificates.services.js';
import { handleControllerError } from '../utils/validation.utils.js';

export class CertificatesController {
  /**
   * Criar novo certificado
   */
  static async createCertificate(req, res) {
    try {
      const { codigoAluno, codigoAnoLectivo, observacoes } = req.body;
      
      const certificado = await CertificatesService.createCertificate({
        codigoAluno,
        codigoAnoLectivo,
        observacoes
      });

      return res.status(201).json({
        success: true,
        message: 'Certificado criado com sucesso',
        data: certificado
      });
    } catch (error) {
      return handleControllerError(res, error, 'Erro ao criar certificado', 400);
    }
  }

  /**
   * Criar certificados para toda a turma
   */
  static async createClassCertificates(req, res) {
    try {
      const { codigoTurma, codigoAnoLectivo, observacoes } = req.body;
      
      const resultado = await CertificatesService.createClassCertificates({
        codigoTurma,
        codigoAnoLectivo,
        observacoes
      });

      return res.status(201).json({
        success: true,
        message: 'Processamento de certificados concluído',
        data: resultado
      });
    } catch (error) {
      return handleControllerError(res, error, 'Erro ao criar certificados para a turma', 400);
    }
  }

  /**
   * Listar certificados com paginação
   */
  static async getCertificates(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        codigoAluno: req.query.codigoAluno ? parseInt(req.query.codigoAluno) : undefined,
        status: req.query.status,
        codigoAnoLectivo: req.query.codigoAnoLectivo ? parseInt(req.query.codigoAnoLectivo) : undefined
      };

      const resultado = await CertificatesService.getCertificates(page, limit, filters);

      return res.status(200).json({
        success: true,
        message: 'Certificados obtidos com sucesso',
        data: resultado.data,
        pagination: resultado.pagination
      });
    } catch (error) {
      return handleControllerError(res, error, 'Erro ao listar certificados', 400);
    }
  }

  /**
   * Obter certificado por ID
   */
  static async getCertificateById(req, res) {
    try {
      const { id } = req.params;

      const certificado = await CertificatesService.getCertificateById(parseInt(id));

      return res.status(200).json({
        success: true,
        message: 'Certificado obtido com sucesso',
        data: certificado
      });
    } catch (error) {
      return handleControllerError(res, error, 'Erro ao obter certificado', 404);
    }
  }

  /**
   * Obter todos os certificados completos de uma turma
   */
  static async getClassCertificatesFull(req, res) {
    try {
      const { codigoTurma, codigoAnoLectivo } = req.params;

      const certificados = await CertificatesService.getClassCertificatesFull(
        parseInt(codigoTurma),
        parseInt(codigoAnoLectivo)
      );

      return res.status(200).json({
        success: true,
        message: 'Certificados da turma obtidos com sucesso',
        data: certificados
      });
    } catch (error) {
      return handleControllerError(res, error, 'Erro ao obter certificados da turma', 400);
    }
  }

  /**
   * Atualizar certificado
   */
  static async updateCertificate(req, res) {
    try {
      const { id } = req.params;
      const { observacoes } = req.body;

      const certificado = await CertificatesService.updateCertificate(parseInt(id), {
        observacoes
      });

      return res.status(200).json({
        success: true,
        message: 'Certificado atualizado com sucesso',
        data: certificado
      });
    } catch (error) {
      return handleControllerError(res, error, 'Erro ao atualizar certificado', 400);
    }
  }

  /**
   * Assinar certificado
   */
  static async signCertificate(req, res) {
    try {
      const { id } = req.params;
      const codigoUtilizador = req.user?.id;
 
      if (!codigoUtilizador) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
      }
 
      const certificado = await CertificatesService.signCertificate(
        parseInt(id),
        parseInt(codigoUtilizador)
      );
 
      return res.status(200).json({
        success: true,
        message: 'Certificado assinado com sucesso',
        data: certificado
      });
    } catch (error) {
      return handleControllerError(res, error, 'Erro ao assinar certificado', 400);
    }
  }

  /**
   * Cancelar certificado
   */
  static async deleteCertificate(req, res) {
    try {
      const { id } = req.params;

      const certificado = await CertificatesService.deleteCertificate(parseInt(id));

      return res.status(200).json({
        success: true,
        message: 'Certificado cancelado com sucesso',
        data: certificado
      });
    } catch (error) {
      return handleControllerError(res, error, 'Erro ao cancelar certificado', 400);
    }
  }

  /**
   * Obter certificados por aluno
   */
  static async getCertificatesByStudent(req, res) {
    try {
      const { codigoAluno } = req.query;
      const codigoAnoLectivo = req.query.codigoAnoLectivo ? parseInt(req.query.codigoAnoLectivo) : undefined;

      if (!codigoAluno) {
        return res.status(400).json({
          success: false,
          message: 'Parâmetro obrigatório: codigoAluno'
        });
      }

      const resultado = await CertificatesService.getCertificatesByStudent(
        parseInt(codigoAluno),
        codigoAnoLectivo
      );

      return res.status(200).json({
        success: true,
        message: 'Certificados do aluno obtidos com sucesso',
        data: resultado
      });
    } catch (error) {
      return handleControllerError(res, error, 'Erro ao obter certificados do aluno', 400);
    }
  }

  /**
   * Obter estatísticas de certificados
   */
  static async getCertificateStatistics(req, res) {
    try {
      const { codigoAnoLectivo } = req.query;

      if (!codigoAnoLectivo) {
        return res.status(400).json({
          success: false,
          message: 'Parâmetro obrigatório: codigoAnoLectivo'
        });
      }

      const estatisticas = await CertificatesService.getCertificateStatistics(
        parseInt(codigoAnoLectivo)
      );

      return res.status(200).json({
        success: true,
        message: 'Estatísticas obtidas com sucesso',
        data: estatisticas
      });
    } catch (error) {
      return handleControllerError(res, error, 'Erro ao obter estatísticas', 400);
    }
  }

  /**
   * Verificar certificado publicamente
   */
  static async verifyCertificate(req, res) {
    try {
      const { numeroCertificado } = req.params;
      
      const resultado = await CertificatesService.verifyCertificate(numeroCertificado);

      return res.status(200).json({
        success: true,
        message: 'Certificado verificado com sucesso',
        data: resultado
      });
    } catch (error) {
      return handleControllerError(res, error, 'Erro ao verificar certificado', 400);
    }
  }
}
