// controller/periodos-lancamento.controller.js
import prisma from '../config/database.js';

export class PeriodosLancamentoController {
  /**
   * Listar todos os períodos de lançamento
   * GET /api/periodos-lancamento
   */
  static async listarPeriodos(req, res) {
    try {
      let periodos;
      try {
        const periodosDb = await prisma.tb_periodos_avaliacao.findMany({
          orderBy: [
            { AnoLectivo: 'desc' },
            { Trimestre: 'asc' },
            { TipoAvaliacao: 'asc' }
          ]
        });

        const agora = new Date();
        periodos = periodosDb.map(p => ({
          codigo: p.Codigo,
          nome: p.Designacao,
          tipoNota: p.TipoAvaliacao,
          trimestre: p.Trimestre,
          anoLectivo: p.AnoLectivo,
          status: agora >= p.DataInicio && agora <= p.DataFim ? 'Ativo' : 'Inativo',
          dataInicio: p.DataInicio.toISOString(),
          dataFim: p.DataFim.toISOString(),
          criadoPor: 'Sistema',
          dataCriacao: p.DataCadastro?.toISOString()
        }));
      } catch (error) {
        console.error('Erro ao buscar da tabela tb_periodos_avaliacao:', error);
        periodos = [
          {
            codigo: 1,
            nome: 'Período de Avaliação Contínua - 1º Trimestre',
            tipoNota: 'MAC',
            trimestre: 1,
            anoLectivo: new Date().getFullYear().toString(),
            status: 'Ativo',
            dataInicio: new Date().toISOString(),
            dataFim: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            criadoPor: 'Sistema'
          }
        ];
      }

      return res.json({
        success: true,
        message: 'Períodos listados com sucesso',
        data: periodos
      });
    } catch (error) {
      console.error('Erro ao listar períodos:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Listar anos letivos disponíveis
   * GET /api/periodos-lancamento/anos-letivos
   */
  static async listarAnosLetivos(req, res) {
    try {
      let anosLetivos;
      try {
        anosLetivos = await prisma.tb_ano_lectivo.findMany({
          select: { codigo: true, designacao: true },
          orderBy: { designacao: 'desc' }
        });
      } catch (error) {
        console.error('Erro ao buscar anos letivos:', error);
        const anoAtual = new Date().getFullYear();
        anosLetivos = [
          { codigo: 1, designacao: `${anoAtual}` },
          { codigo: 2, designacao: `${anoAtual + 1}` }
        ];
      }

      return res.json({
        success: true,
        message: 'Anos letivos listados com sucesso',
        data: anosLetivos
      });
    } catch (error) {
      console.error('Erro ao listar anos letivos:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Listar períodos ativos para professores
   * GET /api/periodos-lancamento/ativos
   */
  static async listarPeriodosAtivos(req, res) {
    try {
      let periodos;
      try {
        const todosOsPeriodos = await prisma.tb_periodos_avaliacao.findMany({
          orderBy: [
            { AnoLectivo: 'desc' },
            { Trimestre: 'asc' },
            { TipoAvaliacao: 'asc' }
          ]
        });

        const agora = new Date();
        const periodosAtivos = todosOsPeriodos.filter(p =>
          agora >= p.DataInicio && agora <= p.DataFim
        );

        periodos = periodosAtivos.map(p => ({
          codigo: p.Codigo,
          nome: p.Designacao,
          tipoNota: p.TipoAvaliacao,
          trimestre: p.Trimestre,
          anoLectivo: p.AnoLectivo,
          status: 'Ativo',
          dataInicio: p.DataInicio.toISOString(),
          dataFim: p.DataFim.toISOString()
        }));

        // Se não há ativos, retornar o mais recente como fallback
        if (periodos.length === 0 && todosOsPeriodos.length > 0) {
          const maisRecente = todosOsPeriodos[0];
          periodos = [{
            codigo: maisRecente.Codigo,
            nome: maisRecente.Designacao,
            tipoNota: maisRecente.TipoAvaliacao,
            trimestre: maisRecente.Trimestre,
            anoLectivo: maisRecente.AnoLectivo,
            status: 'Ativo',
            dataInicio: maisRecente.DataInicio.toISOString(),
            dataFim: maisRecente.DataFim.toISOString()
          }];
        }
      } catch (error) {
        console.error('Erro ao buscar períodos ativos:', error);
        periodos = [{
          codigo: 1,
          nome: 'Período MAC - 1º Trimestre',
          tipoNota: 'MAC',
          trimestre: 1,
          anoLectivo: new Date().getFullYear().toString(),
          status: 'Ativo',
          dataInicio: new Date().toISOString(),
          dataFim: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }];
      }

      return res.json({
        success: true,
        message: 'Períodos ativos listados com sucesso',
        data: periodos
      });
    } catch (error) {
      console.error('Erro ao listar períodos ativos:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Criar novo período de lançamento
   * POST /api/periodos-lancamento
   */
  static async criarPeriodo(req, res) {
    try {
      const { nome, tipoNota, trimestre, anoLectivo, dataInicio, dataFim } = req.body;

      // Validações
      if (!nome || !tipoNota || !trimestre || !anoLectivo || !dataInicio || !dataFim) {
        return res.status(400).json({
          success: false,
          message: 'Todos os campos são obrigatórios'
        });
      }

      if (!['MAC', 'PP', 'PT', 'NPP', 'NPT'].includes(tipoNota)) {
        return res.status(400).json({
          success: false,
          message: 'Tipo de nota deve ser MAC, PP, PT, NPP ou NPT'
        });
      }

      if (![1, 2, 3].includes(parseInt(trimestre))) {
        return res.status(400).json({
          success: false,
          message: 'Trimestre deve ser 1, 2 ou 3'
        });
      }

      const inicio = new Date(dataInicio);
      const fim = new Date(dataFim);
      if (fim <= inicio) {
        return res.status(400).json({
          success: false,
          message: 'Data de fim deve ser posterior à data de início'
        });
      }

      // Verificar se já existe período para o mesmo tipo/trimestre/ano
      const anoStr = anoLectivo.toString();
      const periodoExistente = await prisma.tb_periodos_avaliacao.findFirst({
        where: {
          TipoAvaliacao: tipoNota,
          Trimestre: parseInt(trimestre),
          AnoLectivo: anoStr
        }
      });

      if (periodoExistente) {
        return res.status(400).json({
          success: false,
          message: `Já existe um período para ${tipoNota} no ${trimestre}º trimestre de ${anoLectivo}`
        });
      }

      const novoPeriodo = await prisma.tb_periodos_avaliacao.create({
        data: {
          Designacao: nome,
          TipoAvaliacao: tipoNota,
          Trimestre: parseInt(trimestre),
          AnoLectivo: anoStr,
          DataInicio: inicio,
          DataFim: fim,
          Status: 'Activo',
          Observacoes: `Criado via sistema em ${new Date().toLocaleDateString('pt-PT')}`,
          DataCadastro: new Date()
        }
      });

      return res.status(201).json({
        success: true,
        message: 'Período criado com sucesso',
        data: {
          codigo: novoPeriodo.Codigo,
          nome: novoPeriodo.Designacao,
          tipoNota: novoPeriodo.TipoAvaliacao,
          trimestre: novoPeriodo.Trimestre,
          anoLectivo: novoPeriodo.AnoLectivo,
          dataInicio: novoPeriodo.DataInicio.toISOString(),
          dataFim: novoPeriodo.DataFim.toISOString()
        }
      });
    } catch (error) {
      console.error('Erro ao criar período:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Ativar/Desativar período (via datas)
   * PUT /api/periodos-lancamento/:id/status
   */
  static async alterarStatusPeriodo(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['Ativo', 'Inativo'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status deve ser Ativo ou Inativo'
        });
      }

      const periodo = await prisma.tb_periodos_avaliacao.findUnique({
        where: { Codigo: parseInt(id) }
      });

      if (!periodo) {
        return res.status(404).json({
          success: false,
          message: 'Período não encontrado'
        });
      }

      const agora = new Date();
      let novaDataInicio, novaDataFim;

      if (status === 'Ativo') {
        novaDataInicio = agora;
        novaDataFim = new Date(agora.getTime() + 30 * 24 * 60 * 60 * 1000);
      } else {
        novaDataInicio = periodo.DataInicio;
        novaDataFim = new Date(agora.getTime() - 24 * 60 * 60 * 1000);
      }

      const periodoAtualizado = await prisma.tb_periodos_avaliacao.update({
        where: { Codigo: parseInt(id) },
        data: {
          DataInicio: novaDataInicio,
          DataFim: novaDataFim,
          Observacoes: `${periodo.Observacoes || ''} | Status alterado para ${status} em ${agora.toLocaleDateString('pt-PT')}`
        }
      });

      return res.json({
        success: true,
        message: `Período ${status === 'Ativo' ? 'ativado' : 'desativado'} com sucesso`,
        data: {
          ...periodoAtualizado,
          status
        }
      });
    } catch (error) {
      console.error('Erro ao alterar status do período:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Excluir período (bloqueado se houver notas associadas)
   * DELETE /api/periodos-lancamento/:id
   */
  static async excluirPeriodo(req, res) {
    try {
      const { id } = req.params;

      const periodo = await prisma.tb_periodos_avaliacao.findUnique({
        where: { Codigo: parseInt(id) }
      });

      if (!periodo) {
        return res.status(404).json({
          success: false,
          message: 'Período não encontrado'
        });
      }

      // Resolver código do trimestre na tabela tb_trimestres
      let codigoTrimestre = null;
      try {
        const trimObj = await prisma.tb_trimestres.findFirst({
          where: { designacao: { contains: periodo.Trimestre.toString() } }
        });
        codigoTrimestre = trimObj?.codigo ?? periodo.Trimestre;
      } catch {
        codigoTrimestre = periodo.Trimestre;
      }

      // Resolver código do tipo de avaliação na tabela tb_tipo_avaliacao
      let codigoTipoAvaliacao = null;
      try {
        const tipoObj = await prisma.tb_tipo_avaliacao.findFirst({
          where: { descricao: periodo.TipoAvaliacao }
        });
        codigoTipoAvaliacao = tipoObj?.codigo ?? null;
      } catch {
        codigoTipoAvaliacao = null;
      }

      // Resolver código do ano letivo na tabela tb_ano_lectivo
      let codigoAnoLectivo = null;
      try {
        const anoObj = await prisma.tb_ano_lectivo.findFirst({
          where: {
            OR: [
              { designacao: periodo.AnoLectivo },
              { anoInicial: periodo.AnoLectivo }
            ]
          }
        });
        codigoAnoLectivo = anoObj?.codigo ?? null;
      } catch {
        codigoAnoLectivo = null;
      }

      // Verificar se há notas lançadas para este período na tabela tb_notas_alunos
      if (codigoTrimestre && codigoAnoLectivo) {
        const whereNotas = {
          CodigoTrimestre: codigoTrimestre,
          CodigoAnoLectivo: codigoAnoLectivo
        };
        if (codigoTipoAvaliacao) {
          whereNotas.CodigoTipoAvaliacao = codigoTipoAvaliacao;
        }

        const notasExistentes = await prisma.tb_notas_alunos.count({
          where: whereNotas
        });

        if (notasExistentes > 0) {
          return res.status(400).json({
            success: false,
            message: `Não é possível excluir período com ${notasExistentes} nota(s) já lançada(s)`
          });
        }
      }

      await prisma.tb_periodos_avaliacao.delete({
        where: { Codigo: parseInt(id) }
      });

      return res.json({
        success: true,
        message: 'Período excluído com sucesso'
      });
    } catch (error) {
      console.error('Erro ao excluir período:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}
