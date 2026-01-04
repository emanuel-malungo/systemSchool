import { Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Room } from '../../types/room.types'

interface Pagination {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

interface RoomTableProps {
  rooms: Room[]
  isLoading: boolean
  pagination?: Pagination
  currentPage: number
  onPageChange: (page: number) => void
  onEdit: (room: Room) => void
  onDelete: (room: Room) => void
}

export default function RoomTable({
  rooms,
  isLoading,
  pagination,
  currentPage,
  onPageChange,
  onEdit,
  onDelete,
}: RoomTableProps) {
  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007C00]"></div>
        </div>
        <p className="text-center text-gray-500 mt-4">Carregando salas...</p>
      </div>
    )
  }

  if (!rooms || rooms.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhuma sala encontrada
        </h3>
        <p className="text-gray-500">
          Comece criando uma nova sala de aula.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden">
      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Código
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Designação
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rooms.map((room) => (
              <tr
                key={room.codigo}
                className="hover:bg-gray-50 transition-colors"
              >
                {/* Código */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-[#007C00]/10">
                      <span className="text-sm font-bold text-[#007C00]">
                        #{room.codigo}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Designação */}
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {room.designacao}
                  </div>
                </td>

                {/* Ações */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    {/* Editar */}
                    <button
                      onClick={() => onEdit(room)}
                      className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    {/* Deletar */}
                    <button
                      onClick={() => onDelete(room)}
                      className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                      title="Deletar"
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
      {pagination && pagination.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            {/* Info */}
            <div className="text-sm text-gray-600">
              Mostrando{' '}
              <span className="font-medium text-gray-900">
                {(currentPage - 1) * pagination.itemsPerPage + 1}
              </span>{' '}
              até{' '}
              <span className="font-medium text-gray-900">
                {Math.min(
                  currentPage * pagination.itemsPerPage,
                  pagination.totalItems
                )}
              </span>{' '}
              de{' '}
              <span className="font-medium text-gray-900">
                {pagination.totalItems}
              </span>{' '}
              resultados
            </div>

            {/* Botões de Paginação */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={!pagination.hasPreviousPage}
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Página anterior"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {/* Números de Página */}
              <div className="flex items-center gap-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    // Mostra primeira, última e páginas próximas à atual
                    return (
                      page === 1 ||
                      page === pagination.totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    )
                  })
                  .map((page, index, array) => {
                    // Adiciona "..." entre páginas não consecutivas
                    const prevPage = array[index - 1]
                    const showEllipsis = prevPage && page - prevPage > 1

                    return (
                      <div key={page} className="flex items-center gap-1">
                        {showEllipsis && (
                          <span className="px-2 text-gray-500">...</span>
                        )}
                        <button
                          onClick={() => onPageChange(page)}
                          className={`inline-flex items-center justify-center min-w-[2.25rem] h-9 px-3 rounded-lg border transition-colors ${
                            page === currentPage
                              ? 'border-[#007C00] bg-[#007C00] text-white font-medium'
                              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      </div>
                    )
                  })}
              </div>

              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
