import { Edit2, Trash2, ChevronLeft, ChevronRight, Users } from 'lucide-react'
import type { ITurma } from '../../types/turma.types'

interface TurmaTableProps {
  turmas: ITurma[]
  isLoading: boolean
  onEdit: (turma: ITurma) => void
  onDelete: (turma: ITurma) => void
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function TurmaTable({
  turmas,
  isLoading,
  onEdit,
  onDelete,
  currentPage,
  totalPages,
  onPageChange,
}: TurmaTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007C00]"></div>
        </div>
      </div>
    )
  }

  if (turmas.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="text-center text-gray-500">
          <p className="text-lg">Nenhuma turma encontrada</p>
          <p className="text-sm mt-2">Tente ajustar os filtros ou adicionar uma nova turma</p>
        </div>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Ativo':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Ativo</span>
      case 'Inativo':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Inativo</span>
      case 'Arquivado':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Arquivado</span>
      default:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-200">
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Turma
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Classe
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Curso
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Sala
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Período
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Capacidade
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
            {turmas.map((turma) => (
              <tr key={turma.codigo} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-3.5 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-linear-to-br from-[#007C00] to-[#005a00] flex items-center justify-center text-white font-bold">
                      {turma.designacao?.charAt(0).toUpperCase() || 'T'}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-semibold text-gray-900">
                        {turma.designacao || 'Nome não disponível'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-3.5 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{turma.tb_classes?.designacao || 'N/A'}</div>
                </td>
                <td className="px-6 py-3.5 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{turma.tb_cursos?.designacao || 'N/A'}</div>
                </td>
                <td className="px-6 py-3.5 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{turma.tb_salas?.designacao || 'N/A'}</div>
                </td>
                <td className="px-6 py-3.5 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{turma.tb_periodos?.designacao || 'N/A'}</div>
                </td>
                <td className="px-6 py-3.5 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-sm text-gray-900">
                    <Users className="h-4 w-4 text-gray-400" />
                    {turma.max_Alunos || 0}
                  </div>
                </td>
                <td className="px-6 py-3.5 whitespace-nowrap">
                  {getStatusBadge(turma.status)}
                </td>
                <td className="px-6 py-3.5 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    {/* Editar */}
                    <button
                      onClick={() => onEdit(turma)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#007C00] bg-green-50 border border-green-100 rounded-lg hover:bg-green-100 transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="h-4 w-4" />
                      <span>Editar</span>
                    </button>

                    {/* Deletar */}
                    <button
                      onClick={() => onDelete(turma)}
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
