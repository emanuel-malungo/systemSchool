import {  Pencil, Trash2, ChevronLeft, ChevronRight, User, School, UserCheck } from 'lucide-react'
import type { IDiretorTurma } from '../../types/directorTurma.types'

interface DirectorTurmaTableProps {
  directorTurmas: IDiretorTurma[]
  isLoading: boolean
  onEdit: (directorTurma: IDiretorTurma) => void
  onDelete: (directorTurma: IDiretorTurma) => void
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function DirectorTurmaTable({
  directorTurmas,
  isLoading,
  onEdit,
  onDelete,
  currentPage,
  totalPages,
  onPageChange,
}: DirectorTurmaTableProps) {
  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
        <p className="text-center text-gray-500 mt-4">Carregando diretores de turma...</p>
      </div>
    )
  }

  if (!directorTurmas || directorTurmas.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <UserCheck className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhum diretor de turma encontrado
        </h3>
        <p className="text-gray-500">
          Comece atribuindo um diretor a uma turma.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Código
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Turma
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Diretor
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
            {directorTurmas.map((dt) => (
              <tr key={dt.codigo} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <span className="text-sm font-mono font-semibold text-gray-900">
                    #{dt.codigo}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <School className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">
                      {dt.tb_turmas?.designacao || 'N/A'}
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-emerald-100">
                      <User className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {dt.tb_docente?.nome || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {dt.tb_docente?.contacto || ''}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  {dt.designacao ? (
                    <span className="text-sm text-gray-900">{dt.designacao}</span>
                  ) : (
                    <span className="text-sm text-gray-400 italic">Sem designação</span>
                  )}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(dt)}
                      className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => onDelete(dt)}
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

      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    return (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    )
                  })
                  .map((page, index, array) => {
                    const prevPage = array[index - 1]
                    const showEllipsis = prevPage && page - prevPage > 1

                    return (
                      <div key={page} className="flex items-center gap-1">
                        {showEllipsis && <span className="px-2 text-gray-500">...</span>}
                        <button
                          onClick={() => onPageChange(page)}
                          className={`inline-flex items-center justify-center min-w-[2.25rem] h-9 px-3 rounded-lg border transition-colors ${
                            page === currentPage
                              ? 'border-emerald-600 bg-emerald-600 text-white font-medium'
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
                disabled={currentPage === totalPages}
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
