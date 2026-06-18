import { useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Download,
  Eye,
  X,
  FileText,
  Filter,
  BarChart3,
} from 'lucide-react';
import Container from '../../../components/layout/Container';
import { 
  useRelatorioVendasGeral, 
  useRelatorioVendasDetalhado,
  type RelatorioVendasFuncionario,
  type PeriodoRelatorio
} from '../../../hooks/useRelatoriosVendas';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'react-toastify';

export default function SalesReports() {
  // Estados
  const [periodo, setPeriodo] = useState<PeriodoRelatorio>('diario');
  const [dataInicio, setDataInicio] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [dataFim, setDataFim] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(true); // Filtros visíveis por padrão

  // Queries
  const { data: relatorioGeral, isLoading, error, refetch } = useRelatorioVendasGeral(
    periodo,
    dataInicio || undefined,
    dataFim || undefined
  );

  const { data: relatorioDetalhado } = useRelatorioVendasDetalhado(
    funcionarioSelecionado,
    periodo,
    dataInicio || undefined,
    dataFim || undefined
  );

  // Handlers
  const handlePeriodoChange = (novoPeriodo: PeriodoRelatorio) => {
    setPeriodo(novoPeriodo);
    
    const hoje = new Date();
    
    switch (novoPeriodo) {
      case 'diario':
        // Hoje
        setDataInicio(format(hoje, 'yyyy-MM-dd'));
        setDataFim(format(hoje, 'yyyy-MM-dd'));
        break;
      case 'semanal':
        // Esta semana (segunda a domingo)
        const inicioSemana = new Date(hoje);
        inicioSemana.setDate(hoje.getDate() - hoje.getDay() + 1); // Segunda
        const fimSemana = new Date(inicioSemana);
        fimSemana.setDate(inicioSemana.getDate() + 6); // Domingo
        setDataInicio(format(inicioSemana, 'yyyy-MM-dd'));
        setDataFim(format(fimSemana, 'yyyy-MM-dd'));
        break;
      case 'mensal':
        // Este mês
        const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
        setDataInicio(format(inicioMes, 'yyyy-MM-dd'));
        setDataFim(format(fimMes, 'yyyy-MM-dd'));
        break;
      case 'anual':
        // Este ano
        const inicioAno = new Date(hoje.getFullYear(), 0, 1);
        const fimAno = new Date(hoje.getFullYear(), 11, 31);
        setDataInicio(format(inicioAno, 'yyyy-MM-dd'));
        setDataFim(format(fimAno, 'yyyy-MM-dd'));
        break;
      case 'personalizado':
        // Manter datas atuais para personalização
        break;
    }
  };

  const handleVerDetalhes = (funcionario: RelatorioVendasFuncionario) => {
    setFuncionarioSelecionado(funcionario.funcionarioId);
  };

  const handleFecharDetalhes = () => {
    setFuncionarioSelecionado(null);
  };

  const handleExportarPDF = () => {
    if (!relatorioGeral) {
      toast.error('Nenhum dado disponível para exportar');
      return;
    }

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      
      // Header
      doc.setFillColor(24, 47, 89);
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('Relatório de Vendas', pageWidth / 2, 20, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Período: ${relatorioGeral.periodo}`, pageWidth / 2, 28, { align: 'center' });
      doc.text(`${formatDate(relatorioGeral.dataInicio)} até ${formatDate(relatorioGeral.dataFim)}`, pageWidth / 2, 34, { align: 'center' });
      
      // Resumo
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Resumo Geral', 14, 55);
      
      const summaryData = [
        ['Total em Vendas', formatCurrency(relatorioGeral.totalGeral)],
        ['Total de Pagamentos', relatorioGeral.totalPagamentos.toString()],
        ['Funcionários Ativos', relatorioGeral.resumo.totalFuncionarios.toString()],
        ['Média por Funcionário', formatCurrency(relatorioGeral.resumo.mediaVendasPorFuncionario)]
      ];
      
      autoTable(doc, {
        startY: 60,
        head: [['Indicador', 'Valor']],
        body: summaryData,
        theme: 'striped',
        headStyles: { 
          fillColor: [24, 47, 89],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center'
        },
        columnStyles: {
          0: { cellWidth: 100, fontStyle: 'bold' },
          1: { cellWidth: 80, halign: 'right' }
        },
        margin: { left: 14, right: 14 }
      });
      
      // Tabela de funcionários
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      const finalY = (doc as any).lastAutoTable.finalY || 120;
      doc.text('Vendas por Funcionário', 14, finalY + 15);
      
      const employeeData = relatorioGeral.funcionarios.map((func, index) => [
        (index + 1).toString(),
        func.funcionarioNome,
        func.funcionarioUser,
        formatCurrency(func.totalVendas),
        func.quantidadePagamentos.toString(),
        func.percentualDoTotal || '0%'
      ]);
      
      autoTable(doc, {
        startY: finalY + 20,
        head: [['#', 'Funcionário', 'Usuário', 'Total Vendas', 'Pagamentos', '% Total']],
        body: employeeData,
        theme: 'striped',
        headStyles: { 
          fillColor: [24, 47, 89],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center'
        },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 50 },
          2: { cellWidth: 35 },
          3: { cellWidth: 35, halign: 'right', fontStyle: 'bold' },
          4: { cellWidth: 25, halign: 'center' },
          5: { cellWidth: 25, halign: 'center' }
        },
        margin: { left: 14, right: 14 },
        didDrawCell: (data) => {
          // Destacar o melhor vendedor
          if (data.section === 'body' && data.row.index === 0) {
            doc.setFillColor(255, 235, 59, 0.2);
          }
        }
      });
      
      // Footer
      const pageCount = doc.internal.pages.length - 1;
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Gerado em ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`,
          14,
          doc.internal.pageSize.height - 10
        );
        doc.text(
          `Página ${i} de ${pageCount}`,
          pageWidth - 14,
          doc.internal.pageSize.height - 10,
          { align: 'right' }
        );
      }
      
      // Save
      const filename = `relatorio-vendas-${format(new Date(), 'yyyy-MM-dd-HHmm')}.pdf`;
      doc.save(filename);
      
      toast.success('Relatório PDF gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar relatório PDF');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0
    }).format(value).replace('AOA', 'Kz');
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  return (
    <Container>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#007C00]/10 rounded-xl flex items-center justify-center shrink-0">
              <BarChart3 className="h-6 w-6 text-[#007C00]" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  Relatório de Vendas
                </h1>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">Tempo real</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                Acompanhe o desempenho de vendas por funcionário e período
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 active:scale-[0.98] transition-all duration-200 font-medium text-sm shadow-sm"
            >
              <Filter className="h-4 w-4" />
              <span>Filtros</span>
            </button>
            
            <button
              onClick={handleExportarPDF}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#007C00] text-white rounded-lg hover:bg-[#005a00] active:scale-[0.98] transition-all duration-200 font-medium text-sm shadow-sm"
            >
              <Download className="h-4 w-4" />
              <span>Exportar PDF</span>
            </button>
          </div>
        </div>

          {/* Filtros */}
          {showFilters && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              {/* Botões rápidos de período */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Período Rápido
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handlePeriodoChange('diario')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      periodo === 'diario'
                        ? 'bg-[#182F59] text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Hoje
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePeriodoChange('semanal')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      periodo === 'semanal'
                        ? 'bg-[#182F59] text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Esta Semana
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePeriodoChange('mensal')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      periodo === 'mensal'
                        ? 'bg-[#182F59] text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Este Mês
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePeriodoChange('anual')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      periodo === 'anual'
                        ? 'bg-[#182F59] text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Este Ano
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePeriodoChange('personalizado')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      periodo === 'personalizado'
                        ? 'bg-[#182F59] text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Personalizado
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Período Select (escondido, usando botões) */}
                <div className="hidden">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Período
                  </label>
                  <select
                    value={periodo}
                    onChange={(e) => handlePeriodoChange(e.target.value as any)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="diario">Hoje</option>
                    <option value="semanal">Esta Semana</option>
                    <option value="mensal">Este Mês</option>
                    <option value="anual">Este Ano</option>
                    <option value="personalizado">Personalizado</option>
                  </select>
                </div>

                {/* Data Início */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Início
                  </label>
                  <input
                    type="date"
                    value={dataInicio}
                    onChange={(e) => {
                      setDataInicio(e.target.value);
                      setPeriodo('personalizado');
                    }}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Data Fim */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Fim
                  </label>
                  <input
                    type="date"
                    value={dataFim}
                    onChange={(e) => {
                      setDataFim(e.target.value);
                      setPeriodo('personalizado');
                    }}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Botão Aplicar */}
                <div className="flex items-end">
                  <button
                    onClick={() => refetch()}
                    className="w-full px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Aplicar Filtros
                  </button>
                </div>
              </div>

              {/* Indicador do período selecionado */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Período selecionado:</span>{' '}
                  {periodo === 'diario' && 'Hoje'}
                  {periodo === 'semanal' && 'Esta Semana'}
                  {periodo === 'mensal' && 'Este Mês'}
                  {periodo === 'anual' && 'Este Ano'}
                  {periodo === 'personalizado' && 'Personalizado'}
                  {' • '}
                  <span className="font-semibold">
                    {formatDate(dataInicio)} até {formatDate(dataFim)}
                  </span>
                </p>
              </div>
            </div>
          )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">Erro ao carregar relatório. Tente novamente.</p>
          </div>
        )}

        {/* Cards de Resumo */}
        {relatorioGeral && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {/* Total Vendas */}
              <div className="bg-gradient-to-br from-green-50 via-white to-green-50/50 rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-sm">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2 text-green-600">Total em Vendas</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatCurrency(relatorioGeral.totalGeral)}
                  </p>
                </div>
              </div>

              {/* Total Pagamentos */}
              <div className="bg-gradient-to-br from-blue-50 via-white to-blue-50/50 rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-[#182F59] to-[#1a3260] rounded-xl shadow-sm">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2 text-[#182F59]">Total de Pagamentos</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {relatorioGeral.totalPagamentos}
                  </p>
                </div>
              </div>

              {/* Total Funcionários */}
              <div className="bg-gradient-to-br from-purple-50 via-white to-purple-50/50 rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-sm">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2 text-purple-600">Funcionários Ativos</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {relatorioGeral.resumo.totalFuncionarios}
                  </p>
                </div>
              </div>

              {/* Média por Funcionário */}
              <div className="bg-gradient-to-br from-orange-50 via-white to-orange-50/50 rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-sm">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2 text-orange-600">Média por Funcionário</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatCurrency(relatorioGeral.resumo.mediaVendasPorFuncionario)}
                  </p>
                </div>
              </div>
            </div>

            {/* Tabela de Funcionários */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Users className="w-6 h-6 text-[#182F59]" />
                  Vendas por Funcionário
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Período: {relatorioGeral.periodo} • {formatDate(relatorioGeral.dataInicio)} até {formatDate(relatorioGeral.dataFim)}
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Funcionário
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Usuário
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Total Vendas
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Pagamentos
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        % do Total
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {relatorioGeral.funcionarios.map((funcionario, index) => (
                      <tr 
                        key={funcionario.funcionarioId}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                              index === 0 ? 'bg-yellow-500' : 
                              index === 1 ? 'bg-gray-400' :
                              index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{funcionario.funcionarioNome}</p>
                              {index === 0 && (
                                <span className="text-xs text-yellow-600 font-medium">🏆 Melhor Vendedor</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-600">{funcionario.funcionarioUser}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-semibold text-green-600">
                            {formatCurrency(funcionario.totalVendas)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {funcionario.quantidadePagamentos}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: funcionario.percentualDoTotal || '0%' }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-600">
                              {funcionario.percentualDoTotal}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleVerDetalhes(funcionario)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#182F59] text-white rounded-lg hover:bg-[#1a3260] transition-colors text-sm font-medium"
                          >
                            <Eye className="w-4 h-4" />
                            Ver Detalhes
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Modal de Detalhes do Funcionário */}
        {funcionarioSelecionado && relatorioDetalhado && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-[#182F59] to-[#1a3260] text-white p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{relatorioDetalhado.funcionario.nome}</h2>
                  <p className="text-blue-200 mt-1">@{relatorioDetalhado.funcionario.user}</p>
                </div>
                <button
                  onClick={handleFecharDetalhes}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
                {/* Cards de Resumo */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500 rounded-lg">
                        <DollarSign className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-green-600 font-medium">Total Vendido</p>
                        <p className="text-xl font-bold text-gray-900">
                          {formatCurrency(relatorioDetalhado.totalVendas)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-blue-600 font-medium">Pagamentos</p>
                        <p className="text-xl font-bold text-gray-900">
                          {relatorioDetalhado.quantidadePagamentos}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-purple-600 font-medium">Ticket Médio</p>
                        <p className="text-xl font-bold text-gray-900">
                          {formatCurrency(relatorioDetalhado.totalVendas / relatorioDetalhado.quantidadePagamentos)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabela de Pagamentos */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Pagamentos Detalhados</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-white border-b">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Data</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Aluno</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Serviço</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Mês</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Forma Pagamento</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Valor</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {relatorioDetalhado.pagamentos.map((pagamento) => (
                          <tr key={pagamento.codigo} className="bg-white hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {formatDate(pagamento.data)}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {pagamento.aluno}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {pagamento.tipoServico}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {pagamento.mes}/{pagamento.ano}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {pagamento.formaPagamento}
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-green-600 text-right">
                              {formatCurrency(pagamento.valor)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
}
