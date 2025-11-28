import { Eye, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Proveniencia } from '../../types/proveniencia.types'

interface ProvenienciaTableProps {
  proveniencias: Proveniencia[]
  isLoading: boolean
  onEdit: (proveniencia: Proveniencia) => void
  onView: (proveniencia: Proveniencia) => void
  onDelete: (proveniencia: Proveniencia) => void
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function ProvenienciaTable({
  proveniencias,
  isLoading,
  onEdit,
  onView,
  onDelete,
  currentPage,
  totalPages,
  onPageChange,
}: ProvenienciaTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007C00]"></div>
        </div>
      </div>
    )
  }

  if (proveniencias.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="text-center text-gray-500">
          <p className="text-lg">Nenhuma proveniência encontrada</p>
          <p className="text-sm mt-2">Tente ajustar os filtros ou adicionar uma nova proveniência</p>
        </div>
      </div>
    )
  }

  const formatDate = (date: string | Date) => {
    if (!date) return 'N/A'
    try {
      return new Date(date).toLocaleDateString('pt-BR')
    } catch {
      return 'Data inválida'
    }
  }

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Ativa</span>
      case 0:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Inativa</span>
      default:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Desconhecido</span>
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Designação
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Localização
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contacto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data Cadastro
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {proveniencias.map((proveniencia) => (
              <tr key={proveniencia.codigo} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-[#007C00] flex items-center justify-center text-white font-bold">
                      {proveniencia.designacao?.charAt(0).toUpperCase() || 'P'}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {proveniencia.designacao || 'Nome não disponível'}
                      </div>
                      <div className="text-sm text-gray-500">
                        Código: {proveniencia.codigo}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {proveniencia.localizacao || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {proveniencia.contacto || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(proveniencia.dataCadastro)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(proveniencia.codigoStatus)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    {/* Visualizar */}
                    <button
                      onClick={() => onView(proveniencia)}
                      className="text-[#007C00] hover:text-[#005a00] transition-colors p-1 hover:bg-green-50 rounded"
                      title="Visualizar"
                    >
                      <Eye className="h-5 w-5" />
                    </button>

                    {/* Editar */}
                    <button
                      onClick={() => onEdit(proveniencia)}
                      className="text-yellow-600 hover:text-yellow-900 transition-colors p-1 hover:bg-yellow-50 rounded"
                      title="Editar"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>

                    {/* Deletar */}
                    <button
                      onClick={() => onDelete(proveniencia)}
                      className="text-red-600 hover:text-red-900 transition-colors p-1 hover:bg-red-50 rounded"
                      title="Deletar"
                    >
                      <Trash2 className="h-5 w-5" />
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
