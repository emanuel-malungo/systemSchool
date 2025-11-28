import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Eye,
  Calendar,
  DollarSign,
  User,
  AlertCircle,
  XCircle,
  Loader2,
  TrendingUp
} from 'lucide-react';
import Container from '../../../components/layout/Container';
import {
  useNotasCredito
} from '../../../hooks/usePayment';
import type { NotaCredito } from '../../../types/payment.types';

const CreditNotes: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedNote, setSelectedNote] = useState<NotaCredito | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const itemsPerPage = 10;

  // Hooks
  const { data: notasResponse, isLoading } = useNotasCredito({
    page: currentPage,
    limit: itemsPerPage
  });

  const notas = useMemo(() => notasResponse?.data || [], [notasResponse?.data]);
  const totalItems = notasResponse?.pagination?.totalItems || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Filtrar notas
  const filteredNotas = useMemo(() => {
    return notas.filter(nota => {
      const matchesSearch = 
        nota.designacao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nota.tb_alunos?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nota.fatura?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });
  }, [notas, searchTerm]);

  // Handlers
  const handleViewDetails = (nota: NotaCredito) => {
    setSelectedNote(nota);
    setShowDetailsModal(true);
  };

  const formatCurrency = (value: number | string): string => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    const safeValue = isNaN(numValue) ? 0 : numValue;
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(safeValue).replace('AOA', 'Kz');
  };

  const formatDate = (dateString: string): string => {
    if (!dateString || dateString === '00-00-0000' || dateString === '0000-00-00') return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('pt-BR');
    } catch {
      return 'N/A';
    }
  };


  return (
    <Container>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-linear-to-br from-red-500 to-red-600 rounded-xl shadow-md">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Notas de Crédito</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-red-600 font-medium">Sistema de anulação ativo</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 text-base max-w-2xl">
                Gerencie e acompanhe todas as notas de crédito emitidas para anulação de pagamentos e reversão de valores
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <div className="bg-linear-to-br from-blue-50 via-white to-blue-50/50 rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-linear-to-br from-[#182F59] to-[#1a3260] rounded-xl shadow-sm">
                <FileText className="w-6 h-6 text-white" />
              </div>
              {totalItems > 0 && (
                <div className="flex items-center space-x-1 text-sm bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <TrendingUp className="h-3 w-3 text-blue-500" />
                  <span className="font-bold text-xs text-blue-600">
                    Ativo
                  </span>
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold mb-2 text-[#182F59]">Total de Notas</p>
              <p className="text-3xl font-bold text-gray-900">{totalItems}</p>
              {totalItems === 0 ? (
                <p className="text-xs text-gray-400 mt-1">Nenhuma nota emitida</p>
              ) : (
                <p className="text-xs text-blue-600 mt-1">Notas de crédito emitidas</p>
              )}
            </div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-8 -translate-x-8"></div>
          </div>

          <div className="bg-linear-to-br from-red-50 via-white to-red-50/50 rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-linear-to-br from-red-500 to-red-600 rounded-xl shadow-sm">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              {filteredNotas.length > 0 && (
                <div className="flex items-center space-x-1 text-sm bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <TrendingUp className="h-3 w-3 text-red-500" />
                  <span className="font-bold text-xs text-red-600">
                    Total
                  </span>
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold mb-2 text-red-600">Valor Total Anulado</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(filteredNotas.reduce((sum, n) => sum + (parseFloat(n.valor?.toString() || '0') || 0), 0))}
              </p>
              {filteredNotas.length === 0 ? (
                <p className="text-xs text-gray-400 mt-1">Nenhum valor anulado</p>
              ) : (
                <p className="text-xs text-red-500 mt-1">Valor total revertido</p>
              )}
            </div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-8 -translate-x-8"></div>
          </div>

          <div className="bg-linear-to-br from-purple-50 via-white to-purple-50/50 rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-linear-to-br from-purple-500 to-purple-600 rounded-xl shadow-sm">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              {filteredNotas.filter(nota => {
                if (!nota.data || nota.data === '00-00-0000' || nota.data === '0000-00-00') return false;
                try {
                  const noteDate = new Date(nota.data);
                  if (isNaN(noteDate.getTime())) return false;
                  const currentDate = new Date();
                  return noteDate.getMonth() === currentDate.getMonth() && 
                         noteDate.getFullYear() === currentDate.getFullYear();
                } catch {
                  return false;
                }
              }).length > 0 && (
                <div className="flex items-center space-x-1 text-sm bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <TrendingUp className="h-3 w-3 text-purple-500" />
                  <span className="font-bold text-xs text-purple-600">
                    Mês
                  </span>
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold mb-2 text-purple-600">Notas Este Mês</p>
              <p className="text-3xl font-bold text-gray-900">
                {filteredNotas.filter(nota => {
                  if (!nota.data || nota.data === '00-00-0000' || nota.data === '0000-00-00') return false;
                  try {
                    const noteDate = new Date(nota.data);
                    if (isNaN(noteDate.getTime())) return false;
                    const currentDate = new Date();
                    return noteDate.getMonth() === currentDate.getMonth() && 
                           noteDate.getFullYear() === currentDate.getFullYear();
                  } catch {
                    return false;
                  }
                }).length}
              </p>
              <p className="text-xs text-purple-500 mt-1">Emitidas este mês</p>
            </div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-8 -translate-x-8"></div>
          </div>

          <div className="bg-linear-to-br from-green-50 via-white to-green-50/50 rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-linear-to-br from-green-500 to-green-600 rounded-xl shadow-sm">
                <User className="w-6 h-6 text-white" />
              </div>
              {new Set(filteredNotas.filter(nota => nota.codigo_aluno).map(nota => nota.codigo_aluno)).size > 0 && (
                <div className="flex items-center space-x-1 text-sm bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="font-bold text-xs text-green-600">
                    Únicos
                  </span>
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold mb-2 text-green-600">Alunos Afetados</p>
              <p className="text-3xl font-bold text-gray-900">
                {new Set(filteredNotas.filter(nota => nota.codigo_aluno).map(nota => nota.codigo_aluno)).size}
              </p>
              <p className="text-xs text-green-500 mt-1">Alunos únicos</p>
            </div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-8 -translate-x-8"></div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por aluno, designação ou fatura..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <span className="ml-3 text-gray-600">Carregando notas de crédito...</span>
            </div>
          ) : filteredNotas.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhuma nota de crédito encontrada</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Número</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Aluno</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Fatura Original</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Valor</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Data</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Motivo</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredNotas.map((nota) => (
                      <tr key={nota.codigo} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <p className="font-medium text-blue-600">#{nota.codigo}</p>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{nota.tb_alunos?.nome || 'N/A'}</p>
                            <p className="text-sm text-gray-500">{nota.tb_alunos?.n_documento_identificacao || 'N/A'}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-gray-900">{nota.fatura || '-'}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium text-red-600">{formatCurrency(nota.valor)}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-gray-900">{formatDate(nota.data)}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm text-gray-600 max-w-xs truncate" title={nota.designacao}>
                            {nota.designacao}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleViewDetails(nota)}
                            className="inline-flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            Detalhes
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-gray-50 px-6 py-4 border-t flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Mostrando <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> a{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, totalItems)}
                    </span>{' '}
                    de <span className="font-medium">{totalItems}</span> resultados
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>
                    <span className="px-3 py-1 text-sm text-gray-700">
                      Página {currentPage} de {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Próxima
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Details Modal */}
        {showDetailsModal && selectedNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500" />
                  Detalhes da Nota de Crédito
                </h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                  title="Fechar modal"
                  aria-label="Fechar modal"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Código</label>
                    <p className="text-lg font-semibold">#{selectedNote.codigo}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Aluno</label>
                  <p className="text-lg">{selectedNote.tb_alunos?.nome || 'N/A'}</p>
                  {selectedNote.tb_alunos?.n_documento_identificacao && (
                    <p className="text-sm text-gray-500">
                      Doc: {selectedNote.tb_alunos.n_documento_identificacao}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Designação</label>
                  <p className="text-lg">{selectedNote.designacao}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Valor</label>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(selectedNote.valor)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Data</label>
                    <p className="text-lg">{formatDate(selectedNote.data)}</p>
                  </div>
                </div>

                {selectedNote.fatura && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Fatura</label>
                    <p className="text-lg text-blue-600">{selectedNote.fatura}</p>
                  </div>
                )}

                {selectedNote.motivo && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Motivo</label>
                    <p className="text-gray-900">{selectedNote.motivo}</p>
                  </div>
                )}

                {selectedNote.tipo && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Tipo</label>
                    <p className="text-gray-900">{selectedNote.tipo}</p>
                  </div>
                )}
              </div>

              <div className="border-t px-6 py-4 flex justify-end">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
};

export default CreditNotes;
