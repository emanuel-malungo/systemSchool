import { Eye, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import type { ITransfer } from '../../types/transfer.types'

interface TransferTableProps {
  transfers: ITransfer[]
  isLoading: boolean
  onEdit: (transfer: ITransfer) => void
  onView: (transfer: ITransfer) => void
  onDelete: (transfer: ITransfer) => void
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function TransferTable({
  transfers,
  isLoading,
  onEdit,
  onView,
  onDelete,
  currentPage,
  totalPages,
  onPageChange,
}: TransferTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007C00]"></div>
        </div>
      </div>
    )
  }

  if (transfers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="text-center text-gray-500">
          <p className="text-lg">Nenhuma transferência encontrada</p>
          <p className="text-sm mt-2">Tente ajustar os filtros ou adicionar uma nova transferência</p>
        </div>
      </div>
    )
  }

  const formatDate = (date: string | object | null) => {
    if (!date) return 'N/A'
    if (typeof date === 'object') return 'N/A'
    try {
      return new Date(date).toLocaleDateString('pt-BR')
    } catch {
      return 'Data inválida'
    }
  }

  // Mapeamento de motivos (pode ser carregado de uma API futuramente)
  const getMotivoText = (codigoMotivo: number) => {
    const motivos: Record<number, string> = {
      1: 'Mudança de Residência',
      2: 'Problemas Financeiros',
      3: 'Insatisfação com a Escola',
      4: 'Problemas de Saúde',
      5: 'Outros Motivos',
    }
    return motivos[codigoMotivo] || `Motivo ${codigoMotivo}`
  }

  const getMotivoColor = (codigoMotivo: number) => {
    const colors: Record<number, string> = {
      1: 'bg-blue-100 text-blue-800',
      2: 'bg-yellow-100 text-yellow-800',
      3: 'bg-red-100 text-red-800',
      4: 'bg-purple-100 text-purple-800',
      5: 'bg-gray-100 text-gray-800',
    }
    return colors[codigoMotivo] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aluno
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Escola Destino
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data Transferência
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Motivo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Responsável
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transfers.map((transfer) => {
              // Validação de segurança
              if (!transfer.tb_alunos) {
                return null
              }
              
              return (
              <tr key={transfer.codigo} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-[#007C00] flex items-center justify-center text-white font-bold">
                      {transfer.tb_alunos.nome?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {transfer.tb_alunos.nome || 'Nome não disponível'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {transfer.tb_alunos.sexo || 'N/A'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    Escola #{transfer.codigoEscola}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(transfer.dataTransferencia)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getMotivoColor(transfer.codigoMotivo)}`}>
                    {getMotivoText(transfer.codigoMotivo)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {transfer.tb_utilizadores?.nome || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {transfer.tb_utilizadores?.user || ''}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    {/* Visualizar */}
                    <button
                      onClick={() => onView(transfer)}
                      className="text-[#007C00] hover:text-[#005a00] transition-colors p-1 hover:bg-green-50 rounded"
                      title="Visualizar"
                    >
                      <Eye className="h-5 w-5" />
                    </button>

                    {/* Editar */}
                    <button
                      onClick={() => onEdit(transfer)}
                      className="text-yellow-600 hover:text-yellow-900 transition-colors p-1 hover:bg-yellow-50 rounded"
                      title="Editar"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>

                    {/* Deletar */}
                    <button
                      onClick={() => onDelete(transfer)}
                      className="text-red-600 hover:text-red-900 transition-colors p-1 hover:bg-red-50 rounded"
                      title="Deletar"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próxima
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Página <span className="font-medium">{currentPage}</span> de{' '}
                <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5" />
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
                      onClick={() => onPageChange(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === currentPage
                          ? 'z-10 bg-green-50 border-[#007C00] text-[#007C00]'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  )
                })}

                <button
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
