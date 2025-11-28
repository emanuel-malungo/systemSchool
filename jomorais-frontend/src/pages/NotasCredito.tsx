import React, { useState } from 'react';
import { 
  FileText, 
  Search,
  Calendar,
  DollarSign,
  User,
  Eye,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import Container from '../components/layout/Container';
import { 
  useNotasCredito
} from '../hooks/usePayment';
import type { NotaCredito } from '../types/payment.types';

const NotasCredito: React.FC = () => {
  // Estados principais
  const [selectedCreditNote, setSelectedCreditNote] = useState<NotaCredito | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Estados de filtros e paginação
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const itemsPerPage = 10;

  // Hooks para dados
  const { data: notasResponse, isLoading, error } = useNotasCredito({
    page: currentPage,
    limit: itemsPerPage
  });

  const creditNotes = notasResponse?.data || [];
  const totalItems = notasResponse?.pagination?.totalItems || 0;
  const totalPages = notasResponse?.pagination?.totalPages || 1;

  // Filtrar notas localmente
  const filteredNotes = creditNotes.filter(note => {
    const matchesSearch = 
      note.designacao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.tb_alunos?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.fatura?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'active' && note.status === 1) ||
      (statusFilter === 'inactive' && note.status === 0);

    return matchesSearch && matchesStatus;
  });

  // Handlers
  const handleViewDetails = (creditNote: NotaCredito) => {
    setSelectedCreditNote(creditNote);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedCreditNote(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0
    }).format(numValue || 0).replace('AOA', 'Kz');
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === '00-00-0000') return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status: number) => {
    if (status === 1) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Ativa
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Inativa
      </span>
    );
  };

  return (
    <Container>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600" />
              Notas de Crédito
            </h1>
            <p className="text-gray-600 mt-2">
              Visualize e gerencie todas as notas de crédito emitidas para anulação de faturas e reversão de pagamentos.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 via-white to-blue-50/50 rounded-xl p-6 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total de Notas</p>
              <p className="text-2xl font-bold text-blue-900">{totalItems}</p>
              <p className="text-xs text-blue-500 mt-1">Notas de crédito emitidas</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 via-white to-red-50/50 rounded-xl p-6 border border-red-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Valor Total Anulado</p>
              <p className="text-2xl font-bold text-red-900">
                {formatCurrency(creditNotes.reduce((sum, note) => sum + (parseFloat(note.valor?.toString() || '0') || 0), 0))}
              </p>
              <p className="text-xs text-red-500 mt-1">Valor total revertido</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 via-white to-purple-50/50 rounded-xl p-6 border border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Notas Este Mês</p>
              <p className="text-2xl font-bold text-purple-900">
                {creditNotes.filter(note => {
                  const noteDate = new Date(note.data || '');
                  const currentDate = new Date();
                  return noteDate.getMonth() === currentDate.getMonth() && 
                         noteDate.getFullYear() === currentDate.getFullYear();
                }).length}
              </p>
              <p className="text-xs text-purple-500 mt-1">Emitidas este mês</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 via-white to-green-50/50 rounded-xl p-6 border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Alunos Afetados</p>
              <p className="text-2xl font-bold text-green-900">
                {new Set(creditNotes.map(note => note.codigo_aluno)).size}
              </p>
              <p className="text-xs text-green-500 mt-1">Alunos únicos</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
              <User className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Busca de Notas de Crédito</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por número da nota, aluno, fatura..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">Todos os Status</option>
              <option value="active">Ativas</option>
              <option value="inactive">Inativas</option>
            </select>
          </div>

          {/* Export Button */}
          <button
            onClick={() => alert('Funcionalidade de exportação em desenvolvimento')}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-5 h-5" />
            Exportar
          </button>
        </div>
      </div>

      {/* Lista de Notas de Crédito */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Lista de Notas de Crédito ({filteredNotes.length} na página)
          </h3>
        </div>
        
        <div className="overflow-hidden">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="animate-spin h-6 w-6 text-blue-600" />
                <span className="text-gray-600">Carregando página {currentPage}...</span>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="flex flex-col items-center space-y-3">
                <AlertCircle className="h-12 w-12 text-red-400" />
                <p className="text-red-500 font-medium">Erro ao carregar notas de crédito</p>
                <p className="text-sm text-gray-500">
                  Verifique se o backend está rodando ou se há dados na tabela tb_nota_credito
                </p>
              </div>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex flex-col items-center space-y-3">
                <FileText className="h-12 w-12 text-gray-400" />
                <p className="text-gray-500 font-medium">Nenhuma nota de crédito encontrada</p>
                {searchTerm && (
                  <p className="text-sm text-gray-400">Tente ajustar os filtros de busca</p>
                )}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Número</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Aluno</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Fatura Original</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Valor</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Data</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Motivo</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Status</th>
                    <th className="text-center py-3 px-6 font-medium text-gray-900">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredNotes.map((creditNote) => (
                    <tr key={creditNote.codigo} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <p className="font-medium text-blue-600">#{creditNote.codigo}</p>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-gray-900">{creditNote.tb_alunos?.nome || 'N/A'}</p>
                          <p className="text-sm text-gray-500">{creditNote.tb_alunos?.n_documento_identificacao || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-gray-900">{creditNote.fatura || '-'}</p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-medium text-red-600">{formatCurrency(creditNote.valor || 0)}</p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-gray-900">{formatDate(creditNote.data || '')}</p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-sm text-gray-600 max-w-xs truncate" title={creditNote.designacao}>
                          {creditNote.designacao || 'N/A'}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(creditNote.status || 0)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => handleViewDetails(creditNote)}
                          className="inline-flex items-center px-3 py-1 border border-blue-300 rounded-md text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Detalhes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Mostrando {((currentPage - 1) * itemsPerPage) + 1} a{' '}
              {Math.min(currentPage * itemsPerPage, totalItems)} de{' '}
              {totalItems} notas de crédito
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || isLoading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Anterior
              </button>
              <span className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md">
                {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || isLoading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próximo
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Detalhes */}
      {showDetailsModal && selectedCreditNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-xl">
              <h3 className="text-xl font-semibold flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span>Detalhes da Nota de Crédito</span>
              </h3>
              <button
                onClick={handleCloseDetailsModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Informações Principais */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-3">Informações da Nota de Crédito</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700 font-medium">Número:</span>
                    <p className="text-blue-900">#{selectedCreditNote.codigo}</p>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Data de Emissão:</span>
                    <p className="text-blue-900">{formatDate(selectedCreditNote.data || '')}</p>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Fatura Original:</span>
                    <p className="text-blue-900">{selectedCreditNote.fatura || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Valor Anulado:</span>
                    <p className="text-blue-900 font-medium">{formatCurrency(selectedCreditNote.valor || 0)}</p>
                  </div>
                </div>
              </div>

              {/* Informações do Aluno */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Informações do Aluno</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 font-medium">Nome:</span>
                    <p className="text-gray-900">{selectedCreditNote.tb_alunos?.nome || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">Documento:</span>
                    <p className="text-gray-900">{selectedCreditNote.tb_alunos?.n_documento_identificacao || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">Código do Aluno:</span>
                    <p className="text-gray-900">{selectedCreditNote.codigo_aluno}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">Status:</span>
                    <div className="mt-1">{getStatusBadge(selectedCreditNote.status || 0)}</div>
                  </div>
                </div>
              </div>

              {/* Motivo e Descrição */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-3">Motivo da Anulação</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-yellow-700 font-medium">Designação:</span>
                    <p className="text-yellow-900">{selectedCreditNote.designacao || 'N/A'}</p>
                  </div>
                  {selectedCreditNote.motivo && (
                    <div>
                      <span className="text-yellow-700 font-medium">Descrição Detalhada:</span>
                      <p className="text-yellow-900">{selectedCreditNote.motivo}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleCloseDetailsModal}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

export default NotasCredito;
