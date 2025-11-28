import { useState } from 'react'
import { Plus, Search, BookOpen } from 'lucide-react'
import { useDisciplineTeachersManager } from '../../../hooks/useDisciplineTeacher'
import type { IDisciplinaDocente, IDisciplinaDocenteInput } from '../../../types/disciplineTeacher.types'
import DisciplineTeacherTable from '../../../components/discipline-teacher-management/DisciplineTeacherTable'
import DisciplineTeacherFormModal from '../../../components/discipline-teacher-management/DisciplineTeacherFormModal'
import DisciplineTeacherViewModal from '../../../components/discipline-teacher-management/DisciplineTeacherViewModal'
import DeleteConfirmModal from '../../../components/discipline-teacher-management/DeleteConfirmModal'
import Container from '../../../components/layout/Container'

export default function DisciplineTeacherManagement() {
  // Estados
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Modais
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedDisciplineTeacher, setSelectedDisciplineTeacher] = useState<IDisciplinaDocente | null>(null)
  const [disciplineTeacherToDelete, setDisciplineTeacherToDelete] = useState<IDisciplinaDocente | null>(null)
  const [disciplineTeacherToEdit, setDisciplineTeacherToEdit] = useState<IDisciplinaDocente | null>(null)

  // Hook de gerenciamento
  const {
    disciplineTeachers,
    pagination,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    createDisciplineTeacherAsync,
    updateDisciplineTeacherAsync,
    deleteDisciplineTeacherAsync,
  } = useDisciplineTeachersManager({ 
    page: currentPage,
    search: searchTerm,
  })

  // Handlers
  const handleCreateDisciplineTeacher = () => {
    setDisciplineTeacherToEdit(null)
    setIsFormModalOpen(true)
  }

  const handleEditDisciplineTeacher = (disciplineTeacher: IDisciplinaDocente) => {
    setDisciplineTeacherToEdit(disciplineTeacher)
    setIsFormModalOpen(true)
  }

  const handleFormSubmit = async (data: IDisciplinaDocenteInput) => {
    try {
      if (disciplineTeacherToEdit) {
        await updateDisciplineTeacherAsync({
          id: disciplineTeacherToEdit.codigo,
          data,
        })
      } else {
        await createDisciplineTeacherAsync(data)
      }
      setIsFormModalOpen(false)
      setDisciplineTeacherToEdit(null)
    } catch (error) {
      console.error('Erro ao salvar associação:', error)
    }
  }

  const handleViewDisciplineTeacher = (disciplineTeacher: IDisciplinaDocente) => {
    setSelectedDisciplineTeacher(disciplineTeacher)
    setIsViewModalOpen(true)
  }

  const handleDeleteClick = (disciplineTeacher: IDisciplinaDocente) => {
    setDisciplineTeacherToDelete(disciplineTeacher)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (disciplineTeacherToDelete) {
      try {
        await deleteDisciplineTeacherAsync(disciplineTeacherToDelete.codigo)
        setIsDeleteModalOpen(false)
        setDisciplineTeacherToDelete(null)
      } catch (error) {
        console.error('Erro ao deletar associação:', error)
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
      <div className="mb-8 bg-linear-to-br from-purple-50 via-white to-purple-50 rounded-2xl shadow-lg overflow-hidden">
        <div className="relative p-8">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100/30 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-100/30 rounded-full -ml-12 -mb-12"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-linear-to-br from-purple-600 to-purple-800 rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Disciplinas dos Professores
                </h1>
                <p className="text-gray-600 text-lg">
                  Gerencie as disciplinas atribuídas aos professores
                </p>
              </div>
            </div>
            
            <button
              onClick={handleCreateDisciplineTeacher}
              className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-purple-600 to-purple-800 text-white rounded-xl hover:from-purple-700 hover:to-purple-900 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
            >
              <Plus className="h-5 w-5" />
              Nova Atribuição
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
              placeholder="Pesquisar por professor ou disciplina..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-all"
            />
          </div>
        </div>

        {/* Contador de Resultados */}
        <div className="mt-5 pt-4 border-t border-gray-200 flex items-center justify-between">
          <span className="text-sm text-gray-600 font-medium">
            Mostrando <span className="text-purple-600 font-bold">{disciplineTeachers.length}</span> de <span className="text-gray-900 font-bold">{totalItems}</span> atribuições
          </span>
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('')
                setCurrentPage(1)
              }}
              className="text-sm text-purple-600 hover:text-purple-800 font-medium hover:underline transition-all"
            >
              Limpar pesquisa
            </button>
          )}
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <DisciplineTeacherTable
          disciplineTeachers={disciplineTeachers}
          isLoading={isLoading}
          onEdit={handleEditDisciplineTeacher}
          onView={handleViewDisciplineTeacher}
          onDelete={handleDeleteClick}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Modais */}
      <DisciplineTeacherFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false)
          setDisciplineTeacherToEdit(null)
        }}
        onSubmit={handleFormSubmit}
        disciplineTeacher={disciplineTeacherToEdit}
        isLoading={isCreating || isUpdating}
      />

      <DisciplineTeacherViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedDisciplineTeacher(null)
        }}
        disciplineTeacher={selectedDisciplineTeacher}
        onEdit={handleEditDisciplineTeacher}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setDisciplineTeacherToDelete(null)
        }}
        onConfirm={handleDeleteConfirm}
        disciplineTeacherInfo={
          disciplineTeacherToDelete
            ? `${disciplineTeacherToDelete.tb_disciplinas?.designacao} - ${disciplineTeacherToDelete.tb_docente?.nome}`
            : ''
        }
        isLoading={isDeleting}
      />
    </Container>
  )
}
