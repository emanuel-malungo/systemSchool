import { Eye, Edit2, Trash2, ChevronLeft, ChevronRight, Users } from 'lucide-react'
import type { Student } from '../../types/student.types'

interface StudentTableProps {
  students: Student[]
  isLoading: boolean
  onEdit: (student: Student) => void
  onView: (student: Student) => void
  onDelete: (student: Student) => void
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function StudentTable({
  students,
  isLoading,
  onEdit,
  onView,
  onDelete,
  currentPage,
  totalPages,
  onPageChange,
}: StudentTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 space-y-4">
          {/* Skeleton Header */}
          <div className="flex gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex-1 h-3 bg-gray-100 rounded-full animate-pulse" />
            ))}
          </div>
          {/* Skeleton Rows */}
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-4 border-t border-gray-50">
              <div className="w-9 h-9 bg-gray-100 rounded-full animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-gray-100 rounded-full w-2/5 animate-pulse" />
                <div className="h-2.5 bg-gray-50 rounded-full w-1/4 animate-pulse" />
              </div>
              <div className="h-3 bg-gray-100 rounded-full w-16 animate-pulse" />
              <div className="h-5 bg-gray-100 rounded-full w-20 animate-pulse" />
              <div className="h-3 bg-gray-100 rounded-full w-20 animate-pulse" />
              <div className="h-3 bg-gray-100 rounded-full w-16 animate-pulse" />
              <div className="flex gap-1.5">
                <div className="w-8 h-8 bg-gray-100 rounded-lg animate-pulse" />
                <div className="w-8 h-8 bg-gray-100 rounded-lg animate-pulse" />
                <div className="w-8 h-8 bg-gray-100 rounded-lg animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (students.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-gray-300" />
          </div>
          <p className="text-gray-900 font-semibold text-base mb-1">Nenhum estudante encontrado</p>
          <p className="text-gray-500 text-sm max-w-xs">
            Tente ajustar os filtros de pesquisa ou adicione um novo estudante ao sistema.
          </p>
        </div>
      </div>
    )
  }

  const formatDate = (date: string | Record<string, unknown>) => {
    try {
      if (typeof date === 'string') {
        return new Date(date).toLocaleDateString('pt-BR')
      }
      return 'Data inválida'
    } catch {
      return 'Data inválida'
    }
  }

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Estudante
              </th>
              <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                ID Matrícula
              </th>
              <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Sexo
              </th>
              <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Data Nascimento
              </th>
              <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Telefone
              </th>
              <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Morada
              </th>
              <th className="px-6 py-3.5 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr
                key={student.codigo}
                className={`
                  group transition-colors duration-150
                  hover:bg-gray-50/80
                  ${index !== students.length - 1 ? 'border-b border-gray-50' : ''}
                `}
              >
                <td className="px-6 py-3.5 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-linear-to-br from-[#007C00] to-[#005a00] rounded-full flex items-center justify-center shrink-0 shadow-xs">
                      <span className="text-white font-bold text-[11px]">
                        {getInitials(student.nome)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 leading-tight">{student.nome}</p>
                      {student.email && (
                        <p className="text-xs text-gray-400 mt-0.5">{student.email}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-3.5 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-1 bg-green-50 text-[#007C00] text-xs font-semibold rounded-md">
                    {student.tb_matriculas?.codigo ? `#${student.tb_matriculas.codigo}` : 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-3.5 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md ${
                    student.sexo === 'Masculino' 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'bg-pink-50 text-pink-700'
                  }`}>
                    {student.sexo}
                  </span>
                </td>
                <td className="px-6 py-3.5 whitespace-nowrap text-sm text-gray-600">
                  {formatDate(student.dataNascimento)}
                </td>
                <td className="px-6 py-3.5 whitespace-nowrap text-sm text-gray-600">
                  {student.telefone && student.telefone !== '.' ? student.telefone : '—'}
                </td>
                <td className="px-6 py-3.5 whitespace-nowrap text-sm text-gray-600 max-w-[180px] truncate">
                  {student.morada || '—'}
                </td>
                <td className="px-6 py-3.5 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {/* Visualizar */}
                    <button
                      onClick={() => onView(student)}
                      className="p-2 text-gray-400 hover:text-[#007C00] hover:bg-green-50 rounded-lg transition-all duration-200"
                      title="Visualizar"
                    >
                      <Eye className="h-4 w-4" />
                    </button>

                    {/* Editar */}
                    <button
                      onClick={() => onEdit(student)}
                      className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all duration-200"
                      title="Editar"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>

                    {/* Deletar */}
                    <button
                      onClick={() => onDelete(student)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
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
      {totalPages > 1 && (
        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Página <span className="font-semibold text-gray-700">{currentPage}</span> de{' '}
            <span className="font-semibold text-gray-700">{totalPages}</span>
          </p>
          
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            >
              <ChevronLeft className="h-4 w-4" />
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
                  className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 ${
                    page === currentPage
                      ? 'bg-[#007C00] text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {page}
                </button>
              )
            })}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
