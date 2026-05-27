/**
 * @swagger
 * tags:
 *   - name: Gestão de Certificados
 *     description: Emissão, assinatura e consulta de certificados de conclusão
 *
 * components:
 *   schemas:
 *     Certificado:
 *       type: object
 *       required:
 *         - codigoAluno
 *         - codigoDisciplina
 *         - codigoAnoLectivo
 *       properties:
 *         codigoAluno:
 *           type: integer
 *           description: Código do aluno
 *         codigoDisciplina:
 *           type: integer
 *           description: Código da disciplina
 *         codigoAnoLectivo:
 *           type: integer
 *           description: Código do ano letivo
 *         observacoes:
 *           type: string
 *           description: Observações adicionais
 *       example:
 *         codigoAluno: 1
 *         codigoDisciplina: 5
 *         codigoAnoLectivo: 1
 *         observacoes: "Aluno com excelente desempenho"
 */

import { Router } from 'express';
import { CertificatesController } from '../controller/certificates.controller.js';

const router = Router();

/**
 * @swagger
 * /api/certificates:
 *   post:
 *     summary: Criar novo certificado
 *     tags: [Gestão de Certificados]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Certificado'
 *     responses:
 *       201:
 *         description: Certificado criado com sucesso
 *       400:
 *         description: Aluno não aprovado nesta disciplina
 *       409:
 *         description: Certificado já existe
 */
router.post('/', CertificatesController.createCertificate);

/**
 * @swagger
 * /api/certificates:
 *   get:
 *     summary: Listar certificados com filtros
 *     tags: [Gestão de Certificados]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pendente, Assinado, Cancelado]
 *       - in: query
 *         name: codigoAnoLectivo
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Certificados encontrados
 */
router.get('/', CertificatesController.getCertificates);

/**
 * @swagger
 * /api/certificates/{id}:
 *   get:
 *     summary: Obter certificado por ID
 *     tags: [Gestão de Certificados]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Certificado encontrado
 *       404:
 *         description: Certificado não encontrado
 */
router.get('/:id', CertificatesController.getCertificateById);

/**
 * @swagger
 * /api/certificates/{id}:
 *   put:
 *     summary: Atualizar certificado
 *     tags: [Gestão de Certificados]
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
 *               observacoes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Certificado atualizado com sucesso
 *       400:
 *         description: Certificado já assinado
 */
router.put('/:id', CertificatesController.updateCertificate);

/**
 * @swagger
 * /api/certificates/{id}/sign:
 *   post:
 *     summary: Assinar certificado
 *     tags: [Gestão de Certificados]
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
 *             required:
 *               - codigoUtilizador
 *             properties:
 *               codigoUtilizador:
 *                 type: integer
 *                 description: Código do utilizador que assina
 *     responses:
 *       200:
 *         description: Certificado assinado com sucesso
 *       400:
 *         description: Certificado já foi assinado
 */
router.post('/:id/sign', CertificatesController.signCertificate);

/**
 * @swagger
 * /api/certificates/{id}:
 *   delete:
 *     summary: Cancelar certificado
 *     tags: [Gestão de Certificados]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Certificado cancelado com sucesso
 *       404:
 *         description: Certificado não encontrado
 */
router.delete('/:id', CertificatesController.deleteCertificate);

/**
 * @swagger
 * /api/certificates/student/{codigoAluno}:
 *   get:
 *     summary: Obter certificados de um aluno
 *     tags: [Gestão de Certificados]
 *     parameters:
 *       - in: query
 *         name: codigoAluno
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: codigoAnoLectivo
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Certificados do aluno
 */
router.get('/aluno/:codigoAluno', CertificatesController.getCertificatesByStudent);

/**
 * @swagger
 * /api/certificates/stats:
 *   get:
 *     summary: Obter estatísticas de certificados
 *     tags: [Gestão de Certificados]
 *     parameters:
 *       - in: query
 *         name: codigoAnoLectivo
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Estatísticas calculadas
 */
router.get('/stats/por-ano', CertificatesController.getCertificateStatistics);

export default router;
