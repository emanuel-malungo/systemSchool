import { Eye, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import type { IAnoLectivo } from '../../../types/anoLectivo.types'

interface AnoLectivoTableProps {
  anosLectivos: IAnoLectivo[]
  isLoading: boolean
  onEdit: (anoLectivo: IAnoLectivo) => void
  onView: (anoLectivo: IAnoLectivo) => void
  onDelete: (anoLectivo: IAnoLectivo) => void
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function AnoLectivoTable({
  anosLectivos,
  isLoading,
  onEdit,
  onView,
  onDelete,
  currentPage,
  totalPages,
  onPageChange,
}: AnoLectivoTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007C00]"></div>
        </div>
      </div>
    )
  }

  if (anosLectivos.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="text-center text-gray-500">
          <p className="text-lg">Nenhum ano letivo encontrado</p>
          <p className="text-sm mt-2">Tente ajustar os filtros ou adicionar um novo ano letivo</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Código
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Designação
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Período
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ano Inicial
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ano Final
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {anosLectivos.map((anoLectivo) => (
              <tr key={anoLectivo.codigo} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{anoLectivo.codigo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{anoLectivo.designacao}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {anoLectivo.mesInicial} - {anoLectivo.mesFinal}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{anoLectivo.anoInicial}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{anoLectivo.anoFinal}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    {/* Visualizar */}
                    <button
                      onClick={() => onView(anoLectivo)}
                      className="text-[#007C00] hover:text-[#005a00] transition-colors p-1 hover:bg-green-50 rounded"
                      title="Visualizar"
                    >
                      <Eye className="h-5 w-5" />
                    </button>

                    {/* Editar */}
                    <button
                      onClick={() => onEdit(anoLectivo)}
                      className="text-yellow-600 hover:text-yellow-900 transition-colors p-1 hover:bg-yellow-50 rounded"
                      title="Editar"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>

                    {/* Deletar */}
                    <button
                      onClick={() => onDelete(anoLectivo)}
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
              aria-label="Página anterior"
            >
              Anterior
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Próxima página"
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
                  aria-label="Página anterior"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                {/* Páginas */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      page === currentPage
                        ? 'z-10 bg-green-50 border-[#007C00] text-[#007C00]'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                    aria-label={`Ir para página ${page}`}
                    aria-current={page === currentPage ? 'page' : undefined}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Próxima página"
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
