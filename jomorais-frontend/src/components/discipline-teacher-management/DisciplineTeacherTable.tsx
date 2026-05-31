import { Trash2, ChevronLeft, ChevronRight, User, BookOpen, Calendar } from 'lucide-react'
import type { AtribuicaoCompleta } from '../../types/disciplineTeacher.types'

interface DisciplineTeacherTableProps {
  disciplineTeachers: AtribuicaoCompleta[]
  isLoading: boolean
  onDelete: (disciplineTeacher: AtribuicaoCompleta) => void
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function DisciplineTeacherTable({
  disciplineTeachers,
  isLoading,
  onDelete,
  currentPage,
  totalPages,
  onPageChange,
}: DisciplineTeacherTableProps) {
  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
        <p className="text-center text-gray-500 mt-4">Carregando atribuições...</p>
      </div>
    )
  }

  if (!disciplineTeachers || disciplineTeachers.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <BookOpen className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhuma atribuição encontrada
        </h3>
        <p className="text-gray-500">
          Nenhuma atribuição para os filtros selecionados.
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
                Professor
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Disciplina
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Curso / Turma
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Ano Letivo
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {disciplineTeachers.map((dt) => (
              <tr key={`${dt.tipo}-${dt.codigo}`} className="hover:bg-gray-50/50 transition-colors">
                {/* Professor */}
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-purple-50 border border-purple-100">
                      <User className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-semibold text-gray-900">
                        {dt.professor?.nome || 'N/A'}
                      </div>
                      {dt.professor?.numeroFuncionario && (
                        <div className="text-xs text-gray-500 font-medium">
                          Nº Func: {dt.professor.numeroFuncionario}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Disciplina */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-purple-400 shrink-0" />
                    <span className="text-sm font-medium text-gray-800">
                      {dt.disciplina?.designacao || 'N/A'}
                    </span>
                  </div>
                </td>

                {/* Curso / Turma */}
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 w-fit">
                      {dt.curso?.designacao || 'N/A'}
                    </span>
                    {dt.turma && (
                      <span className="text-xs font-bold text-indigo-600 ml-1">
                        Turma: {dt.turma.designacao}
                      </span>
                    )}
                  </div>
                </td>

                {/* Ano Letivo */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 text-sm text-gray-600 font-medium">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {dt.anoLectivo}
                  </div>
                </td>

                {/* Tipo */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    dt.tipo === 'disciplina'
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {dt.tipo === 'disciplina' ? 'Disciplina' : 'Turma'}
                  </span>
                </td>

                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    dt.status === 'Activo'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-gray-50 text-gray-600 border-gray-200'
                  }`}>
                    {dt.status}
                  </span>
                </td>

                {/* Ações */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end">
                    <button
                      onClick={() => onDelete(dt)}
                      className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-700 border border-transparent hover:border-red-100 transition-all active:scale-95 shadow-xs"
                      title="Excluir Atribuição"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <span className="text-sm text-gray-600 font-medium">
            Página {currentPage} de {totalPages}
          </span>
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
                            ? 'border-purple-600 bg-purple-600 text-white font-semibold'
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
      )}
    </div>
  )
}

