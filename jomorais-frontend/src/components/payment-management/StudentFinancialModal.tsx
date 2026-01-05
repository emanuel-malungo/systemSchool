import React, { useState, useMemo } from 'react';
import { 
  X,
  User, 
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle as XCircleIcon,
  Phone,
  Mail,
  GraduationCap,
  FileText
} from 'lucide-react';
import { 
  useMesesPendentes
} from '../../hooks/usePayment';
import { useAnosLectivos } from '../../hooks/useAnoLectivo';
import type { AlunoConfirmado } from '../../types/payment.types';

// Interface estendida para incluir a estrutura real do em-school
interface EstudanteCompleto extends AlunoConfirmado {
  tb_matriculas?: {
    codigo: number;
    tb_cursos?: {
      codigo: number;
      designacao: string;
      codigo_Status: number;
    };
    tb_confirmacoes?: Array<{
      tb_turmas?: {
        codigo: number;
        designacao: string;
        codigo_Classe: number;
        codigo_Curso: number;
        codigo_Sala: number;
        codigo_Periodo: number;
        status: string;
        codigo_AnoLectivo: number;
        max_Alunos: number;
        tb_classes?: {
          codigo: number;
          designacao: string;
          status: number;
          notaMaxima: number;
          exame: boolean;
        };
      };
    }>;
  };
}

// Interface para dívidas de anos anteriores
interface DividaAnterior {
  anoLectivo: {
    codigo: number;
    designacao: string;
    anoInicial: string;
    anoFinal: string;
  };
  mesesPendentes: string[];
  mesesPagos: string[];
  totalPendente: number;
}

// Interface para os dados da API de meses pendentes
interface MesesPendentesData {
  mesesPendentes?: string[];
  mesesPagos?: string[];
  totalMeses?: number;
  mesesPagosCount?: number;
  mesesPendentesCount?: number;
  proximoMes?: string;
  anoLectivo?: {
    codigo: number;
    designacao: string;
    mesInicial: string;
    mesFinal: string;
    anoInicial: string;
    anoFinal: string;
  };
  dividasAnteriores?: DividaAnterior[];
  temDividas?: boolean;
}

interface StudentFinancialModalProps {
  open: boolean;
  onClose: () => void;
  student: EstudanteCompleto | null;
}

const StudentFinancialModal: React.FC<StudentFinancialModalProps> = ({
  open,
  onClose,
  student
}) => {
  // Estados - apenas selectedAnoLectivo
  const [selectedAnoLectivo, setSelectedAnoLectivo] = useState<number | null>(null);

  // Hooks - Anos letivos
  const { data: anosResponse, isLoading: loadingAnos } = useAnosLectivos(
    { page: 1, limit: 100 }
  );
  const anosLectivos = useMemo(() => anosResponse?.data || [], [anosResponse?.data]);

  // Dados acadêmicos do aluno (declarar antes do useEffect)
  // A estrutura real é: student.tb_matriculas.tb_confirmacoes[0].tb_turmas
  const matricula = student?.tb_matriculas;
  const confirmacoes = matricula?.tb_confirmacoes;
  const confirmacaoRecente = confirmacoes && confirmacoes.length > 0 ? confirmacoes[0] : null;
  const turmaData = confirmacaoRecente?.tb_turmas;
  const classeData = turmaData?.tb_classes;
  const cursoData = matricula?.tb_cursos;

  // Auto-selecionar o ano letivo mais recente quando modal abrir (similar ao jomorais)
  React.useEffect(() => {
    if (open && anosLectivos.length > 0 && !selectedAnoLectivo) {
      // Priorizar ano letivo da confirmação do aluno se existir e for válido
      const anoConfirmacao = turmaData?.codigo_AnoLectivo;
      if (anoConfirmacao && anoConfirmacao > 0) {
        const anoEncontrado = anosLectivos.find(ano => ano.codigo === anoConfirmacao);
        if (anoEncontrado) {
          setSelectedAnoLectivo(anoEncontrado.codigo);
          return;
        }
      }
      
      // Caso contrário, selecionar o primeiro disponível (geralmente o mais recente)
      // Ordenar por designacao decrescente para pegar o mais atual
      const anosOrdenados = [...anosLectivos].sort((a, b) => 
        b.designacao.localeCompare(a.designacao)
      );
      
      if (anosOrdenados.length > 0) {
        setSelectedAnoLectivo(anosOrdenados[0].codigo);
      }
    }
  }, [open, anosLectivos, selectedAnoLectivo, turmaData?.codigo_AnoLectivo]);

  // Hooks - Meses pendentes por ano letivo (só buscar se tiver ano selecionado)
  const { data: mesesResponse, isLoading: loadingMeses } = useMesesPendentes(
    student?.codigo || 0,
    selectedAnoLectivo || undefined,
    { enabled: !!(open && student && selectedAnoLectivo) }
  );
  const mesesPendentesData = mesesResponse?.data || {} as MesesPendentesData;

  // Meses pendentes detalhados (do segundo hook)
  const mesesPendentesDetalhados = mesesPendentesData as MesesPendentesData;

  // Dados da API de meses pendentes
  const apiMesesPendentes = mesesPendentesDetalhados?.mesesPendentes || [];
  const apiMesesPagos = mesesPendentesDetalhados?.mesesPagos || [];
  
  // Dívidas de anos anteriores
  const dividasAnteriores = mesesPendentesDetalhados?.dividasAnteriores || [];
  
  // CORREÇÃO: Usar o length dos arrays diretamente
  const apiMesesPagosCount = apiMesesPagos.length;
  const apiMesesPendentesCount = apiMesesPendentes.length;

  // Dados derivados dos alunos confirmados - sem chamar API adicional
  const dadosFinanceiros = student?.dadosFinanceiros;
  
  // Dados calculados baseados no que temos (preferindo dados da API)
  const totalMesesPagos = apiMesesPagosCount;
  const totalMesesPendentes = apiMesesPendentesCount;
  const totalPago = dadosFinanceiros?.totalPago || 0;
  const totalPendente = dadosFinanceiros?.totalPendente || 0;
  const propinaMensal = dadosFinanceiros?.propinaMensal || 0;

  // Dados prioritários da confirmação (usando a estrutura real do em-school)
  const cursoNome = cursoData?.designacao || 'Curso não especificado';
  const classeNome = classeData?.designacao || 'Classe não informada';
  const turmaNome = turmaData?.designacao || 'Turma não informada';
  
  // Verificar se temos dados de confirmação válidos
  const temConfirmacao = !!(confirmacaoRecente && turmaData && classeData && cursoData);
  
  // Ano letivo atual baseado na confirmação ou selecionado  
  const anoLetivoAtual = useMemo(() => {
    if (selectedAnoLectivo && selectedAnoLectivo > 0) {
      const anoEncontrado = anosLectivos.find(ano => ano.codigo === selectedAnoLectivo);
      if (anoEncontrado) {
        return anoEncontrado.designacao;
      }
    }
    
    // Fallback para dados da API
    if (mesesPendentesDetalhados?.anoLectivo?.designacao) {
      return mesesPendentesDetalhados.anoLectivo.designacao;
    }
    
    // Fallback para o primeiro ano letivo disponível
    if (anosLectivos.length > 0) {
      const anosOrdenados = [...anosLectivos].sort((a, b) => 
        b.designacao.localeCompare(a.designacao)
      );
      return anosOrdenados[0]?.designacao || 'N/A';
    }
    
    return 'N/A';
  }, [selectedAnoLectivo, anosLectivos, mesesPendentesDetalhados]);

  // Reset selectedAnoLectivo quando modal fechar
  const handleClose = () => {
    setSelectedAnoLectivo(null);
    onClose();
  };

  if (!open || !student) return null;

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value).replace('AOA', 'Kz');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" />
              Dados Financeiros do Aluno
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Visualização completa do estado financeiro e histórico de pagamentos
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fechar modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loadingAnos ? (
            <div className="space-y-6">
              {/* Skeleton loading */}
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Informações do Aluno */}
              <div className="bg-white border rounded-lg">
                <div className="border-b px-4 py-3">
                  <h3 className="font-medium flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Informações do Aluno
                  </h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Nome</label>
                        <p className="font-medium">{student.nome}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Documento</label>
                        <p className="font-medium">{student.n_documento_identificacao}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Email</label>
                        <p className="font-medium flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {student.email || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Telefone</label>
                        <p className="font-medium flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          {student.telefone || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Curso</label>
                        <p className="font-medium flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-gray-400" />
                          {cursoNome}
                        </p>
                        {temConfirmacao && cursoNome !== 'Curso não especificado' && (
                          <span className="text-xs text-blue-600">
                            (Confirmação mais recente)
                          </span>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Classe</label>
                        <p className="font-medium">
                          {classeNome}
                        </p>
                        {temConfirmacao && classeNome !== 'Classe não informada' && (
                          <span className="text-xs text-blue-600">
                            (Confirmação mais recente)
                          </span>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Turma</label>
                        <p className="font-medium">
                          {turmaNome}
                        </p>
                        {temConfirmacao && turmaNome !== 'Turma não informada' && (
                          <span className="text-xs text-blue-600">
                            (Confirmação mais recente)
                          </span>
                        )}
                      </div>
                      {anoLetivoAtual && anoLetivoAtual !== 'N/A' && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Ano Letivo Atual</label>
                          <p className="font-medium">
                            {anoLetivoAtual}
                          </p>
                        </div>
                      )}
                      {propinaMensal > 0 && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Propina Mensal</label>
                          <p className="font-medium text-blue-600">
                            {formatCurrency(propinaMensal)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Resumo Financeiro - 4 cards como no jomorais */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-linear-to-br from-blue-50 to-white border border-blue-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-700">Total Meses</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {totalMesesPagos + totalMesesPendentes}
                      </p>
                    </div>
                    <Calendar className="w-10 h-10 text-blue-500" />
                  </div>
                  <div className="mt-2 pt-2 border-t border-blue-200">
                    <p className="text-xs text-blue-600 font-medium">
                      Ano Letivo Selecionado
                    </p>
                  </div>
                </div>

                <div className="bg-linear-to-br from-green-50 to-white border border-green-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-700">Meses Pagos</p>
                      <p className="text-2xl font-bold text-green-600">
                        {totalMesesPagos}
                      </p>
                    </div>
                    <CheckCircle className="w-10 h-10 text-green-500" />
                  </div>
                  <div className="mt-2 pt-2 border-t border-green-200">
                    <p className="text-xs text-green-600 font-medium">
                      {totalPago > 0 ? `Total: ${formatCurrency(totalPago)}` : 
                       apiMesesPagos.length > 0 ? `Meses: ${apiMesesPagos.join(', ')}` : 'Nenhum pagamento registrado'}
                    </p>
                  </div>
                </div>

                <div className="bg-linear-to-br from-yellow-50 to-white border border-yellow-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-yellow-700">Valor Pago</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {formatCurrency(totalPago)}
                      </p>
                    </div>
                    <DollarSign className="w-10 h-10 text-yellow-500" />
                  </div>
                  <div className="mt-2 pt-2 border-t border-yellow-200">
                    <p className="text-xs text-yellow-600 font-medium">
                      Em pagamentos realizados
                    </p>
                  </div>
                </div>

                <div className="bg-linear-to-br from-red-50 to-white border border-red-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-700">Valor Pendente</p>
                      <p className="text-2xl font-bold text-red-600">
                        {totalPendente > 0 ? formatCurrency(totalPendente) : 
                         propinaMensal > 0 && totalMesesPendentes > 0 ? formatCurrency(propinaMensal * totalMesesPendentes) : 
                         formatCurrency(0)}
                      </p>
                    </div>
                    <XCircleIcon className="w-10 h-10 text-red-500" />
                  </div>
                  <div className="mt-2 pt-2 border-t border-red-200">
                    <p className="text-xs text-red-600 font-medium">
                      {mesesPendentesDetalhados?.temDividas ? 'Em débito' : 'Situação regular'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status das Propinas por Ano Letivo */}
              <div className="bg-white border rounded-lg">
                <div className="border-b px-4 py-3 bg-gray-50">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    Status das Propinas por Ano Letivo
                  </h3>
                </div>
                <div className="p-4 space-y-4">
                  {/* Seletor de Ano Letivo */}
                  <div>
                    <label htmlFor="ano-lectivo-select" className="block text-sm font-medium text-gray-700 mb-2">
                      Selecionar Ano Letivo
                    </label>
                    <select
                      id="ano-lectivo-select"
                      title="Selecionar Ano Letivo"
                      value={selectedAnoLectivo || ''}
                      onChange={(e) => setSelectedAnoLectivo(Number(e.target.value))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      disabled={loadingAnos}
                    >
                      <option value="">
                        {loadingAnos ? 'Carregando anos letivos...' : 'Selecione o ano letivo'}
                      </option>
                      {anosLectivos.map((ano) => (
                        <option key={ano.codigo} value={ano.codigo}>
                          {ano.designacao}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Loading */}
                  {loadingMeses && (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      <span className="ml-3 text-gray-600">Carregando meses...</span>
                    </div>
                  )}

                  {/* Conteúdo quando ano letivo selecionado e não está carregando */}
                  {!loadingMeses && selectedAnoLectivo && (
                    <>
                      {/* Resumo com base nos dados do aluno ou da API */}
                      {(totalMesesPagos > 0 || totalMesesPendentes > 0 || apiMesesPendentes.length > 0 || apiMesesPagos.length > 0) ? (
                        <>
                          {/* Info: Meses Pagos - Baseado nos dados da API ou aluno */}
                          {(totalMesesPagos > 0 || apiMesesPagosCount > 0) && (
                            <div className="mb-6">
                              <div className="flex items-center gap-2 mb-3">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <h4 className="font-semibold text-green-700 text-lg">
                                  Meses Pagos ({apiMesesPagosCount || totalMesesPagos})
                                </h4>
                              </div>
                              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <p className="text-green-700 text-sm">
                                  O aluno tem {apiMesesPagosCount || totalMesesPagos} mês(es) de propina pago(s).
                                  {totalPago > 0 && <span> Valor total pago: <span className="font-semibold">{formatCurrency(totalPago)}</span></span>}
                                </p>
                                {apiMesesPagos.length > 0 && (
                                  <div className="mt-3">
                                    <p className="text-xs text-green-600 font-medium mb-2">Meses pagos:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {apiMesesPagos.map((mes: string, index: number) => (
                                        <span key={index} className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                                          {mes}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Meses Pendentes - Baseado nos dados da API */}
                          {(apiMesesPendentes.length > 0 || apiMesesPendentesCount > 0) && (
                            <div className="mb-6">
                              <div className="flex items-center gap-2 mb-3">
                                <XCircleIcon className="w-5 h-5 text-red-600" />
                                <h4 className="font-semibold text-red-700 text-lg">
                                  Meses Pendentes ({apiMesesPendentesCount || apiMesesPendentes.length})
                                </h4>
                              </div>
                              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <p className="text-red-700 text-sm mb-3">
                                  O aluno tem {apiMesesPendentesCount || apiMesesPendentes.length} mês(es) de propina pendente(s).
                                  {totalPendente > 0 && <span> Valor total pendente: <span className="font-semibold">{formatCurrency(totalPendente)}</span></span>}
                                </p>
                                {apiMesesPendentes.length > 0 && (
                                  <div>
                                    <p className="text-xs text-red-600 font-medium mb-2">Meses pendentes:</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                                      {apiMesesPendentes.map((mes: string, index: number) => (
                                        <div key={index} className="bg-red-100 border border-red-300 rounded-lg p-2 text-center">
                                          <span className="text-red-800 font-semibold text-xs">
                                            {mes}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Dívidas de Anos Anteriores */}
                          {dividasAnteriores.length > 0 && (
                            <div className="mb-6">
                              <div className="flex items-center gap-2 mb-3">
                                <XCircleIcon className="w-5 h-5 text-orange-600" />
                                <h4 className="font-semibold text-orange-700 text-lg">
                                  ⚠️ Dívidas de Anos Anteriores ({dividasAnteriores.reduce((acc, d) => acc + d.mesesPendentes.length, 0)} meses)
                                </h4>
                              </div>
                              <div className="space-y-3">
                                {dividasAnteriores.map((divida, index) => (
                                  <div key={index} className="bg-orange-50 border border-orange-300 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Calendar className="w-4 h-4 text-orange-600" />
                                      <span className="text-orange-800 font-semibold">
                                        Ano Letivo: {divida.anoLectivo.designacao}
                                      </span>
                                      <span className="bg-orange-200 text-orange-800 text-xs px-2 py-0.5 rounded-full">
                                        {divida.mesesPendentes.length} mês(es) pendente(s)
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                                      {divida.mesesPendentes.map((mes, mesIndex) => (
                                        <div key={mesIndex} className="bg-orange-100 border border-orange-300 rounded p-2 text-center">
                                          <span className="text-orange-800 font-medium text-xs">
                                            {mes}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-3 p-3 bg-orange-100 border border-orange-300 rounded-lg">
                                <p className="text-orange-800 text-sm font-medium">
                                  ⚠️ Este aluno tem propinas pendentes de anos letivos anteriores que precisam ser regularizadas.
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Fallback se só tiver meses pendentes simples do student e não há dados da API */}
                          {apiMesesPendentes.length === 0 && totalMesesPendentes > 0 && (
                            <div className="mb-6">
                              <div className="flex items-center gap-2 mb-3">
                                <XCircleIcon className="w-5 h-5 text-red-600" />
                                <h4 className="font-semibold text-red-700 text-lg">
                                  Meses Pendentes ({totalMesesPendentes})
                                </h4>
                              </div>
                              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <p className="text-red-700 text-sm">
                                  O aluno tem {totalMesesPendentes} mês(es) de propina pendente(s).
                                  Valor total pendente: <span className="font-semibold">{formatCurrency(totalPendente)}</span>
                                </p>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        // Mensagem quando não há dados para o ano letivo selecionado
                        <div className="text-center py-12">
                          <Calendar className="w-16 h-16 mx-auto mb-4 opacity-30 text-blue-500" />
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
                            <p className="text-blue-800 font-semibold text-lg mb-2">
                              Nenhum dado encontrado
                            </p>
                            <p className="text-blue-600 text-sm">
                              O aluno pode não estar matriculado neste ano letivo ou ainda não possui histórico de pagamentos registrados.
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Mensagem quando nenhum ano letivo selecionado */}
                  {!selectedAnoLectivo && !loadingMeses && (
                    <div className="text-center py-12">
                      <Calendar className="w-16 h-16 mx-auto mb-4 opacity-30 text-gray-400" />
                      <p className="text-gray-500 text-sm">
                        Selecione um ano letivo acima para visualizar o histórico de pagamentos
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Histórico de Pagamentos - Removido porque não temos esses dados sem a API */}
              
              {/* Informação sobre dados limitados */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-yellow-800 font-medium text-sm">Dados Limitados</p>
                    <p className="text-yellow-700 text-sm mt-1">
                      Para visualizar o histórico completo de pagamentos e notas de crédito, 
                      selecione um ano letivo acima. Os dados detalhados são carregados conforme necessário.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentFinancialModal;
