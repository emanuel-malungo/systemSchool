import { useState } from 'react'
import { Plus, Search, BookOpen } from 'lucide-react'
import { useDisciplinesManager } from '../../../hooks/useDiscipline'
import DisciplineTable from '../../../components/discipline-management/DisciplineTable'
import DisciplineFormModal from '../../../components/discipline-management/DisciplineFormModal'
import DeleteConfirmModal from '../../../components/discipline-management/DeleteConfirmModal'
import type { IDiscipline, IDisciplineInput } from '../../../types/discipline.types'
import Container from '../../../components/layout/Container'
import { usePageTitle } from '../../../hooks/usePageTitle'

export default function DisciplineManagement() {
  usePageTitle('Gerenciamento de Disciplinas')

  // Estados
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCourse, setFilterCourse] = useState<number | undefined>(undefined)
  
  // Modais
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [disciplineToDelete, setDisciplineToDelete] = useState<IDiscipline | null>(null)
  const [disciplineToEdit, setDisciplineToEdit] = useState<IDiscipline | null>(null)

  // Hook de gerenciamento de disciplinas
  const {
    disciplines,
    pagination,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    createDisciplineAsync,
    updateDisciplineAsync,
    deleteDisciplineAsync,
  } = useDisciplinesManager({ 
    page: currentPage,
    search: searchTerm,
    codigo_Curso: filterCourse,
  })

  // Handlers
  const handleCreateDiscipline = () => {
    setDisciplineToEdit(null)
    setIsFormModalOpen(true)
  }

  const handleEditDiscipline = (discipline: IDiscipline) => {
    setDisciplineToEdit(discipline)
    setIsFormModalOpen(true)
  }

  const handleFormSubmit = async (data: IDisciplineInput) => {
    try {
      if (disciplineToEdit) {
        // Atualizar disciplina existente
        await updateDisciplineAsync({
          id: disciplineToEdit.codigo,
          disciplineData: data,
        })
      } else {
        // Criar nova disciplina
        await createDisciplineAsync(data)
      }
      setIsFormModalOpen(false)
      setDisciplineToEdit(null)
    } catch (error) {
      console.error('Erro ao salvar disciplina:', error)
    }
  }


  const handleDeleteClick = (discipline: IDiscipline) => {
    setDisciplineToDelete(discipline)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (disciplineToDelete) {
      try {
        await deleteDisciplineAsync(disciplineToDelete.codigo)
        setIsDeleteModalOpen(false)
        setDisciplineToDelete(null)
      } catch (error) {
        console.error('Erro ao deletar disciplina:', error)
      }
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const totalPages = pagination?.totalPages || 1
  const totalItems = pagination?.totalItems || 0

  return (
    <Container>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
              <BookOpen className="h-6 w-6 text-[#007C00]" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  Gerenciamento de Disciplinas
                </h1>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-50 border border-green-100">
                  <div className="w-1.5 h-1.5 bg-[#007C00] rounded-full animate-pulse"></div>
                  <span className="text-xs text-[#007C00] font-medium">{totalItems} Disciplinas Ativas</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                Gerencie as disciplinas dos cursos oferecidos pela instituição
              </p>
            </div>
          </div>
          
          <button
            onClick={handleCreateDiscipline}
            className="flex items-center gap-2 px-4 py-2 bg-[#007C00] text-white rounded-lg hover:bg-[#005a00] transition-colors shadow-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            Nova Disciplina
          </button>
        </div>

        {/* Filtros e Pesquisa */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Barra de Pesquisa */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Pesquisar por nome da disciplina..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00] transition-all text-sm"
              />
            </div>
          </div>

          {/* Contador de Resultados */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Mostrando <span className="font-medium text-gray-900">{disciplines.length}</span> de <span className="font-medium text-gray-900">{totalItems}</span> resultados
            </span>
            {(searchTerm || filterCourse) && (
              <button
                onClick={() => {
                  setSearchTerm('')
                  setFilterCourse(undefined)
                  setCurrentPage(1)
                }}
                className="text-sm text-[#007C00] hover:text-[#005a00] font-medium transition-colors"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>

      {/* Tabela de Disciplinas */}
      <DisciplineTable
        disciplines={disciplines}
        isLoading={isLoading}
        onEdit={handleEditDiscipline}
        onDelete={handleDeleteClick}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      <DisciplineFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false)
          setDisciplineToEdit(null)
        }}
        onSubmit={handleFormSubmit}
        discipline={disciplineToEdit}
        isLoading={isCreating || isUpdating}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setDisciplineToDelete(null)
        }}
        onConfirm={handleDeleteConfirm}
        disciplineName={disciplineToDelete?.designacao || 'Disciplina'}
        isDeleting={isDeleting}
      />
      </div>
    </Container>
  )
}
