import { useState } from 'react'
import { Plus, Search, BookOpen } from 'lucide-react'
import { useDisciplinesManager } from '../../../hooks/useDiscipline'
import DisciplineTable from '../../../components/discipline-management/DisciplineTable'
import DisciplineViewModal from '../../../components/discipline-management/DisciplineViewModal'
import DisciplineFormModal from '../../../components/discipline-management/DisciplineFormModal'
import DeleteConfirmModal from '../../../components/discipline-management/DeleteConfirmModal'
import type { IDiscipline, IDisciplineInput } from '../../../types/discipline.types'
import Container from '../../../components/layout/Container'

export default function DisciplineManagement() {
  // Estados
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCourse, setFilterCourse] = useState<number | undefined>(undefined)
  
  // Modais
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedDiscipline, setSelectedDiscipline] = useState<IDiscipline | null>(null)
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

  const handleViewDiscipline = (discipline: IDiscipline) => {
    setSelectedDiscipline(discipline)
    setIsViewModalOpen(true)
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
      {/* Header */}
      <div className="mb-8 bg-linear-to-br from-green-50 via-white to-green-50 rounded-2xl shadow-lg overflow-hidden">
        <div className="relative p-8">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-100/30 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-green-100/30 rounded-full -ml-12 -mb-12"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-linear-to-br from-[#007C00] to-[#005a00] rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Gerenciamento de Disciplinas
                </h1>
                <p className="text-gray-600 text-lg">
                  Gerencie as disciplinas dos cursos oferecidos pela instituição
                </p>
              </div>
            </div>
            
            <button
              onClick={handleCreateDiscipline}
              className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-[#007C00] to-[#005a00] text-white rounded-xl hover:from-[#005a00] hover:to-[#004000] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
            >
              <Plus className="h-5 w-5" />
              Nova Disciplina
            </button>
          </div>
        </div>
      </div>

      {/* Filtros e Pesquisa */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Barra de Pesquisa */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar por nome da disciplina..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00] transition-all"
            />
          </div>
        </div>

        {/* Contador de Resultados */}
        <div className="mt-5 pt-4 border-t border-gray-200 flex items-center justify-between">
          <span className="text-sm text-gray-600 font-medium">
            Mostrando <span className="text-[#007C00] font-bold">{disciplines.length}</span> de <span className="text-gray-900 font-bold">{totalItems}</span> disciplinas
          </span>
          {(searchTerm || filterCourse) && (
            <button
              onClick={() => {
                setSearchTerm('')
                setFilterCourse(undefined)
                setCurrentPage(1)
              }}
              className="text-sm text-[#007C00] hover:text-[#005a00] font-medium hover:underline transition-all"
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
        onView={handleViewDiscipline}
        onDelete={handleDeleteClick}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {/* Modais */}
      <DisciplineViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedDiscipline(null)
        }}
        discipline={selectedDiscipline}
        onEdit={() => {
          setIsViewModalOpen(false)
          handleEditDiscipline(selectedDiscipline!)
        }}
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
    </Container>
  )
}
