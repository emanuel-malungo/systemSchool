import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Eye,
  Calendar,
  DollarSign,
  User,
  AlertCircle,
  Loader2,
  Filter,
  X,
  ChevronLeft,
  ChevronRight
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
        (nota.designacao?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (nota.tb_alunos?.nome?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (nota.fatura?.toLowerCase() || '').includes(searchTerm.toLowerCase());

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
      let date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        const parts = dateString.split(/[-/]/);
        if (parts.length === 3) {
          // Tentativa de parse DD-MM-YYYY ou DD/MM/YYYY
          date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T12:00:00Z`);
        }
      }

      if (isNaN(date.getTime())) return dateString; // Fallback para mostrar a string original

      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
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
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
              <FileText className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  Notas de Crédito
                </h1>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-50 border border-red-100">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-red-700 font-medium">Sistema de anulação ativo</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                Gerencie e acompanhe todas as notas de crédito emitidas para anulação de pagamentos e reversão de valores
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Card 1: Total de Notas */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              {totalItems > 0 && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-100">
                  <span className="text-[10px] font-bold text-blue-600 uppercase">Ativo</span>
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total de Notas</p>
              <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
            </div>
          </div>

          {/* Card 2: Valor Total Anulado */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-red-600" />
              </div>
              {filteredNotas.length > 0 && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-50 border border-red-100">
                  <span className="text-[10px] font-bold text-red-600 uppercase">Total</span>
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Valor Total Anulado</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(filteredNotas.reduce((sum, n) => sum + (parseFloat(n.valor?.toString() || '0') || 0), 0))}
              </p>
            </div>
          </div>

          {/* Card 3: Notas Este Mês */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-purple-50 border border-purple-100">
                <span className="text-[10px] font-bold text-purple-600 uppercase">Mês</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Notas Este Mês</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredNotas.filter(nota => {
                  const dataNota = nota.data || (nota as any).createdAt || (nota as any).created_at;
                  if (!dataNota || dataNota === '00-00-0000' || dataNota === '0000-00-00') return false;
                  try {
                    let noteDate = new Date(dataNota);
                    if (isNaN(noteDate.getTime())) {
                      const parts = dataNota.split(/[-/]/);
                      if (parts.length === 3) {
                        noteDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T12:00:00Z`);
                      }
                    }
                    if (isNaN(noteDate.getTime())) return false;
                    
                    const currentDate = new Date();
                    return noteDate.getMonth() === currentDate.getMonth() && 
                           noteDate.getFullYear() === currentDate.getFullYear();
                  } catch {
                    return false;
                  }
                }).length}
              </p>
            </div>
          </div>

          {/* Card 4: Alunos Afetados */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <User className="w-5 h-5 text-[#007C00]" />
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-50 border border-green-100">
                <span className="text-[10px] font-bold text-[#007C00] uppercase">Únicos</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Alunos Afetados</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(filteredNotas.filter(nota => nota.codigo_aluno).map(nota => nota.codigo_aluno)).size}
              </p>
            </div>
          </div>
        </div>

        {/* Filtros e Pesquisa */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filtros de pesquisa</span>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por aluno, designação ou fatura..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 hover:bg-gray-100/75 border border-transparent rounded-lg text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:bg-gray-100 transition-all duration-200"
              />
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Mostrando <span className="text-gray-900 font-semibold">{filteredNotas.length}</span> notas de crédito nesta página
            </span>
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCurrentPage(1);
                }}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors duration-200"
              >
                <X className="h-3.5 w-3.5" />
                Limpar filtros
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-red-500" />
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
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Número</th>
                      <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Aluno</th>
                      <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Fatura Original</th>
                      <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Valor</th>
                      <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Data</th>
                      <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Motivo</th>
                      <th className="px-6 py-3.5 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredNotas.map((nota, index) => (
                      <tr
                        key={nota.codigo}
                        className={`
                          transition-colors duration-150
                          hover:bg-gray-50/80
                          ${index !== filteredNotas.length - 1 ? 'border-b border-gray-50' : ''}
                        `}
                      >
                        <td className="px-6 py-3.5 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-1 bg-red-50 text-red-700 text-xs font-semibold rounded-md">
                            #{nota.codigo}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                              <User className="w-4 h-4 text-gray-500" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900 leading-tight">
                                {nota.tb_alunos?.nome || 'N/A'}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {nota.tb_alunos?.n_documento_identificacao || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 whitespace-nowrap text-sm text-gray-600">
                          {nota.fatura || '—'}
                        </td>
                        <td className="px-6 py-3.5 whitespace-nowrap">
                          <span className="text-sm font-bold text-red-600">
                            {formatCurrency(nota.valor)}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 whitespace-nowrap text-sm text-gray-600 font-medium">
                          {formatDate(nota.data || (nota as any).createdAt || (nota as any).created_at)}
                        </td>
                        <td className="px-6 py-3.5 text-sm text-gray-600 max-w-[200px] truncate" title={nota.designacao}>
                          {nota.designacao}
                        </td>
                        <td className="px-6 py-3.5 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleViewDetails(nota)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Ver detalhes"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100 bg-white">
                  <p className="text-sm text-gray-500">
                    Página <span className="font-semibold text-gray-700">{currentPage}</span> de{' '}
                    <span className="font-semibold text-gray-700">{totalPages}</span>
                  </p>
                  
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                      title="Página Anterior"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let page = i + 1
                      if (totalPages > 5 && currentPage > 3) {
                        page = currentPage - 2 + i
                        if (page > totalPages) page = totalPages - (4 - i)
                      }
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 ${
                            page === currentPage
                              ? 'bg-[#007C00] text-white shadow-sm'
                              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    })}

                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                      title="Próxima Página"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Details Modal */}
        {showDetailsModal && selectedNote && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
              {/* Sticky Header */}
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-5 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Detalhes da Nota de Crédito</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Código identificador #{selectedNote.codigo}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 hover:bg-gray-50 rounded-lg"
                  aria-label="Fechar modal"
                  title="Fechar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Informações Gerais */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Informações Gerais</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500">Código da Nota</p>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5">#{selectedNote.codigo}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">Data de Emissão</p>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5">{formatDate(selectedNote.data || (selectedNote as any).createdAt || (selectedNote as any).created_at)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">Valor Revertido</p>
                      <p className="text-base font-bold text-red-600 mt-0.5">{formatCurrency(selectedNote.valor)}</p>
                    </div>
                    {selectedNote.fatura && (
                      <div>
                        <p className="text-xs font-medium text-gray-500">Fatura Original</p>
                        <p className="text-sm font-semibold text-blue-600 mt-0.5">{selectedNote.fatura}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Informações do Aluno */}
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Dados do Aluno</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    <div>
                      <p className="text-xs font-medium text-gray-500">Nome do Aluno</p>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5">{selectedNote.tb_alunos?.nome || 'N/A'}</p>
                    </div>
                    {selectedNote.tb_alunos?.n_documento_identificacao && (
                      <div>
                        <p className="text-xs font-medium text-gray-500">Documento de Identificação</p>
                        <p className="text-sm font-semibold text-gray-900 mt-0.5">{selectedNote.tb_alunos.n_documento_identificacao}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Motivos e Tipo */}
                <div className="pt-4 border-t border-gray-100 space-y-4">
                  <div>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Designação / Motivo</h3>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3.5 rounded-lg border border-gray-100 leading-relaxed">
                      {selectedNote.designacao}
                    </p>
                  </div>

                  {selectedNote.motivo && (
                    <div>
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Detalhamento do Motivo</h3>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3.5 rounded-lg border border-gray-100 leading-relaxed">
                        {selectedNote.motivo}
                      </p>
                    </div>
                  )}

                  {selectedNote.tipo && (
                    <div>
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Tipo de Operação</h3>
                      <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-md">
                        {selectedNote.tipo}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t border-gray-100 px-6 py-4 bg-gray-50/50 flex justify-end">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm"
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
