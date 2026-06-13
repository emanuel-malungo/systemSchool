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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007C00]"></div>
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-200">
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
          <tbody className="divide-y divide-gray-100 bg-white">
            {disciplineTeachers.map((dt) => (
              <tr key={`${dt.tipo}-${dt.codigo}`} className="hover:bg-gray-50/50 transition-colors">
                {/* Professor */}
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-green-50 border border-green-100">
                      <User className="h-5 w-5 text-[#007C00]" />
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
                    <BookOpen className="h-4 w-4 text-gray-400 shrink-0" />
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
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-[#007C00]/10 text-[#007C00] border-[#007C00]/20'
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
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-colors"
                      title="Eliminar Atribuição"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Eliminar</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-gray-200">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Próxima
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Página <span className="font-semibold text-gray-900">{currentPage}</span> de{' '}
                <span className="font-semibold text-gray-900">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px border border-gray-200 overflow-hidden" aria-label="Pagination">
                <button
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-3 py-2 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let page: number
                  if (totalPages <= 5) {
                    page = i + 1
                  } else if (currentPage <= 3) {
                    page = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i
                  } else {
                    page = currentPage - 2 + i
                  }
                  
                  return (
                    <button
                      key={page}
                      onClick={() => onPageChange(page)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold transition-colors ${
                        page === currentPage
                          ? 'z-10 bg-green-50 text-[#007C00] border-x border-green-200'
                          : 'bg-white text-gray-600 hover:bg-gray-50 border-x border-gray-200'
                      }`}
                    >
                      {page}
                    </button>
                  )
                })}

                <button
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-3 py-2 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

