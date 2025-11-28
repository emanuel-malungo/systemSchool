import { Eye, Edit2, Trash2, ChevronLeft, ChevronRight, Archive } from 'lucide-react'
import type { ICourse } from '../../types/course.types'

interface CourseTableProps {
  courses: ICourse[]
  isLoading: boolean
  onEdit: (course: ICourse) => void
  onView: (course: ICourse) => void
  onDelete: (course: ICourse) => void
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function CourseTable({
  courses,
  isLoading,
  onEdit,
  onView,
  onDelete,
  currentPage,
  totalPages,
  onPageChange,
}: CourseTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007C00]"></div>
        </div>
      </div>
    )
  }

  if (courses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="text-center text-gray-500">
          <p className="text-lg">Nenhum curso encontrado</p>
          <p className="text-sm mt-2">Tente ajustar os filtros ou adicionar um novo curso</p>
        </div>
      </div>
    )
  }

  const getStatusBadge = (statusCode: number) => {
    switch (statusCode) {
      case 1:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Ativo
          </span>
        )
      case 2:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Inativo
          </span>
        )
      case 3:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <Archive className="h-3 w-3" />
            Arquivado
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Desconhecido
          </span>
        )
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
                Código
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Designação
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
            {courses.map((course) => (
              <tr key={course.codigo} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{course.codigo}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{course.designacao || 'Sem nome'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(course.codigo_Status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    {/* Visualizar */}
                    <button
                      onClick={() => onView(course)}
                      className="text-[#007C00] hover:text-[#005a00] transition-colors p-1 hover:bg-green-50 rounded"
                      title="Visualizar"
                    >
                      <Eye className="h-5 w-5" />
                    </button>

                    {/* Editar */}
                    <button
                      onClick={() => onEdit(course)}
                      className="text-yellow-600 hover:text-yellow-900 transition-colors p-1 hover:bg-yellow-50 rounded"
                      title="Editar"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>

                    {/* Deletar */}
                    <button
                      onClick={() => onDelete(course)}
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
                  )
                })}

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
