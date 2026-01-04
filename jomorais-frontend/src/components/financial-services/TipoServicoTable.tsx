import { Eye, Pencil, Trash2 } from 'lucide-react'
import type { ITipoServico } from '../../types/financialService.types'
import { mockStatus, getStatusColor } from '../../mocks/status.mock'

// Função para obter status por designação
const getStatusByDesignacao = (statusText: string) => {
  // Mapear status de serviço para status do mock
  const statusMap: Record<string, number> = {
    'Activo': 1,    // NORMAL
    'Inactivo': 7,  // ELIMINADO
  }
  return statusMap[statusText] || 1
}

interface TipoServicoTableProps {
  tiposServicos: ITipoServico[]
  isLoading: boolean
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  onView: (tipo: ITipoServico) => void
  onEdit: (tipo: ITipoServico) => void
  onDelete: (tipo: ITipoServico) => void
}

export default function TipoServicoTable({
  tiposServicos,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
  onView,
  onEdit,
  onDelete,
}: TipoServicoTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#007C00]"></div>
          <p className="mt-4 text-gray-600">Carregando tipos de serviços...</p>
        </div>
      </div>
    )
  }

  if (tiposServicos.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="p-8 text-center">
          <p className="text-gray-600">Nenhum tipo de serviço encontrado.</p>
        </div>
      </div>
    )
  }

  const formatCurrency = (value: number, moeda: string) => {
    return `${moeda} ${value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Código
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Serviço
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Categoria
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Preço
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tiposServicos.map((tipo) => (
              <tr key={tipo.codigo} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  {tipo.codigo}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="max-w-xs">
                    <p className="font-medium">{tipo.designacao}</p>
                    {tipo.descricao && (
                      <p className="text-gray-500 text-xs mt-1 line-clamp-2">
                        {tipo.descricao}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {tipo.tipoServico}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {tipo.tb_categoria_servicos?.designacao || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold text-right">
                  {formatCurrency(tipo.preco, tipo.tb_moedas?.designacao || 'Kz')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(getStatusByDesignacao(tipo.status))}`}
                  >
                    {tipo.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onView(tipo)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Ver detalhes"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEdit(tipo)}
                      className="p-2 text-[#007C00] hover:bg-green-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(tipo)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
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
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            
            <span className="text-sm text-gray-700">
              Página <span className="font-semibold">{currentPage}</span> de{' '}
              <span className="font-semibold">{totalPages}</span>
            </span>
            
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
