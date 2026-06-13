import {  Pencil, Trash2, ChevronLeft, ChevronRight, CheckCircle, XCircle, Mail, Phone } from 'lucide-react'
import type { IDocente } from '../../types/teacher.types'

interface TeacherTableProps {
  teachers: IDocente[]
  isLoading: boolean
  onEdit: (teacher: IDocente) => void
  onDelete: (teacher: IDocente) => void
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function TeacherTable({
  teachers,
  isLoading,
  onEdit,
  onDelete,
  currentPage,
  totalPages,
  onPageChange,
}: TeacherTableProps) {
  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007C00]"></div>
        </div>
        <p className="text-center text-gray-500 mt-4">Carregando professores...</p>
      </div>
    )
  }

  if (!teachers || teachers.length === 0) {
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
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhum professor encontrado
        </h3>
        <p className="text-gray-500">
          Comece criando um novo professor.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-200">
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Professor
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Contacto
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Especialidade
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Disciplinas
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
            {teachers.map((teacher) => (
              <tr
                key={teacher.codigo}
                className="hover:bg-gray-50/50 transition-colors"
              >
                {/* Professor */}
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-[#007C00]/10">
                      <span className="text-sm font-bold text-[#007C00]">
                        {teacher.nome.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {teacher.nome}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {teacher.email}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Contacto */}
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 flex items-center gap-1">
                    <Phone className="h-4 w-4 text-gray-400" />
                    {teacher.contacto}
                  </div>
                </td>

                {/* Especialidade */}
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {teacher.tb_especialidade.designacao}
                  </span>
                </td>

                {/* Disciplinas */}
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {teacher._count?.tb_disciplinas_docente || 0} disciplina(s)
                  </div>
                  {teacher._count && teacher._count.tb_directores_turmas > 0 && (
                    <div className="text-xs text-gray-500">
                      Diretor de {teacher._count.tb_directores_turmas} turma(s)
                    </div>
                  )}
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  {teacher.status === 1 ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Ativo
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <XCircle className="h-3 w-3 mr-1" />
                      Inativo
                    </span>
                  )}
                </td>

                {/* Ações */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    {/* Editar */}
                    <button
                      onClick={() => onEdit(teacher)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#007C00] bg-green-50 border border-green-100 rounded-lg hover:bg-green-100 transition-colors"
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                      <span>Editar</span>
                    </button>

                    {/* Deletar */}
                    <button
                      onClick={() => onDelete(teacher)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-colors"
                      title="Eliminar"
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

      {/* Paginação */}
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
