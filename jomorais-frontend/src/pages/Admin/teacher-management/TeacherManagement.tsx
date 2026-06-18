import { useState } from 'react'
import { Plus, Search, GraduationCap } from 'lucide-react'
import { useTeachersManager } from '../../../hooks/useTeacher'
import type { IDocente, IDocenteInput } from '../../../types/teacher.types'
import TeacherTable from '../../../components/teacher-management/TeacherTable'
import TeacherFormModal from '../../../components/teacher-management/TeacherFormModal'
import DeleteConfirmModal from '../../../components/teacher-management/DeleteConfirmModal'
import Container from '../../../components/layout/Container'
import CredentialsModal from '../../../components/teacher-management/CredentialsModal'
import { usePageTitle } from '../../../hooks/usePageTitle'

export default function TeacherManagement() {
  usePageTitle('Gerenciamento de Professores')
  // Estados
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Modais
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [teacherToDelete, setTeacherToDelete] = useState<IDocente | null>(null)
  const [teacherToEdit, setTeacherToEdit] = useState<IDocente | null>(null)
  const [credentials, setCredentials] = useState<{ username: string; senhaTemporaria: string } | null>(null)
  const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false)

  // Hook de gerenciamento de professores
  const {
    teachers,
    pagination,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    createTeacherAsync,
    updateTeacherAsync,
    deleteTeacherAsync,
  } = useTeachersManager({ 
    page: currentPage,
    search: searchTerm,
  })

  // Handlers
  const handleCreateTeacher = () => {
    setTeacherToEdit(null)
    setIsFormModalOpen(true)
  }

  const handleEditTeacher = (teacher: IDocente) => {
    setTeacherToEdit(teacher)
    setIsFormModalOpen(true)
  }

  const handleFormSubmit = async (data: IDocenteInput) => {
    try {
      if (teacherToEdit) {
        // Atualizar professor existente
        await updateTeacherAsync({
          id: teacherToEdit.codigo,
          teacherData: data,
        })
      } else {
        // Criar novo professor
        const result = await createTeacherAsync(data)
        if (result?.data?.usuario) {
          setCredentials({
            username: result.data.usuario.username,
            senhaTemporaria: result.data.usuario.senhaTemporaria
          })
          setIsCredentialsModalOpen(true)
        }
      }
      setIsFormModalOpen(false)
      setTeacherToEdit(null)
    } catch (error) {
      console.error('Erro ao salvar professor:', error)
    }
  }



  const handleDeleteClick = (teacher: IDocente) => {
    setTeacherToDelete(teacher)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (teacherToDelete) {
      try {
        await deleteTeacherAsync(teacherToDelete.codigo)
        setIsDeleteModalOpen(false)
        setTeacherToDelete(null)
      } catch (error) {
        console.error('Erro ao deletar professor:', error)
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
              <GraduationCap className="h-6 w-6 text-[#007C00]" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  Gerenciamento de Professores
                </h1>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-50 border border-green-100">
                  <div className="w-1.5 h-1.5 bg-[#007C00] rounded-full animate-pulse"></div>
                  <span className="text-xs text-[#007C00] font-medium">{totalItems} Professores Ativos</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                Gerencie os professores e suas especialidades
              </p>
            </div>
          </div>
          
          <button
            onClick={handleCreateTeacher}
            className="flex items-center gap-2 px-4 py-2 bg-[#007C00] text-white rounded-lg hover:bg-[#005a00] transition-colors shadow-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            Novo Professor
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
                placeholder="Pesquisar por nome ou email..."
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
              Mostrando <span className="font-medium text-gray-900">{teachers.length}</span> de <span className="font-medium text-gray-900">{totalItems}</span> resultados
            </span>
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('')
                  setCurrentPage(1)
                }}
                className="text-sm text-[#007C00] hover:text-[#005a00] font-medium transition-colors"
              >
                Limpar pesquisa
              </button>
            )}
          </div>
        </div>

      {/* Tabela de Professores */}
      <TeacherTable
        teachers={teachers}
        isLoading={isLoading}
        onEdit={handleEditTeacher}
        onDelete={handleDeleteClick}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {/* Modais */}
      <TeacherFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false)
          setTeacherToEdit(null)
        }}
        onSubmit={handleFormSubmit}
        teacher={teacherToEdit}
        isLoading={isCreating || isUpdating}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setTeacherToDelete(null)
        }}
        onConfirm={handleDeleteConfirm}
        teacherName={teacherToDelete?.nome || ''}
        isLoading={isDeleting}
      />

      <CredentialsModal
        isOpen={isCredentialsModalOpen}
        onClose={() => {
          setIsCredentialsModalOpen(false)
          setCredentials(null)
        }}
        credentials={credentials}
      />
      </div>
    </Container>
  )
}
