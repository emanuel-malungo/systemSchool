import { useState } from 'react'
import { Plus, Search, Users, FileText } from 'lucide-react'
import { useTurmasManager } from '../../../hooks/useTurma'
import TurmaTable from '../../../components/turma-management/TurmaTable'
import TurmaViewModal from '../../../components/turma-management/TurmaViewModal'
import TurmaFormModal from '../../../components/turma-management/TurmaFormModal'
import DeleteConfirmModal from '../../../components/turma-management/DeleteConfirmModal'
import StudentReportModal from '../../../components/turma-management/StudentReportModal'
import type { ITurma, ITurmaInput } from '../../../types/turma.types'
import Container from '../../../components/layout/Container'

export default function TurmaManagement() {
  // Estados
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Modais
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [selectedTurma, setSelectedTurma] = useState<ITurma | null>(null)
  const [turmaToDelete, setTurmaToDelete] = useState<ITurma | null>(null)
  const [turmaToEdit, setTurmaToEdit] = useState<ITurma | null>(null)

  // Hook de gerenciamento de turmas
  const {
    turmas,
    pagination,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    createTurmaAsync,
    updateTurmaAsync,
    deleteTurmaAsync,
  } = useTurmasManager({ 
    page: currentPage,
    search: searchTerm,
  })

  // Handlers
  const handleCreateTurma = () => {
    setTurmaToEdit(null)
    setIsFormModalOpen(true)
  }

  const handleEditTurma = (turma: ITurma) => {
    setTurmaToEdit(turma)
    setIsFormModalOpen(true)
  }

  const handleFormSubmit = async (data: ITurmaInput) => {
    try {
      if (turmaToEdit) {
        // Atualizar turma existente
        await updateTurmaAsync({
          id: turmaToEdit.codigo,
          turmaData: data,
        })
      } else {
        // Criar nova turma
        await createTurmaAsync(data)
      }
      setIsFormModalOpen(false)
      setTurmaToEdit(null)
    } catch (error) {
      console.error('Erro ao salvar turma:', error)
    }
  }

  const handleViewTurma = (turma: ITurma) => {
    setSelectedTurma(turma)
    setIsViewModalOpen(true)
  }

  const handleDeleteClick = (turma: ITurma) => {
    setTurmaToDelete(turma)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (turmaToDelete) {
      try {
        await deleteTurmaAsync(turmaToDelete.codigo)
        setIsDeleteModalOpen(false)
        setTurmaToDelete(null)
      } catch (error) {
        console.error('Erro ao deletar turma:', error)
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
                <Users className="h-8 w-8 text-white" />
              </div>
              
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Gerenciamento de Turmas
                </h1>
                <p className="text-gray-600 text-lg">
                  Gerencie as turmas, classes e organização acadêmica
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              {/* Botão de Lista de Alunos */}
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-[#007C00] text-[#007C00] rounded-xl hover:bg-green-50 transition-all shadow-md hover:shadow-lg font-medium"
              >
                <FileText className="h-5 w-5" />
                Lista de Alunos
              </button>

              <button
                onClick={handleCreateTurma}
                className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-[#007C00] to-[#005a00] text-white rounded-xl hover:from-[#005a00] hover:to-[#004000] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
              >
                <Plus className="h-5 w-5" />
                Nova Turma
              </button>
            </div>
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
              placeholder="Pesquisar por turma, classe ou curso..."
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
            Mostrando <span className="text-[#007C00] font-bold">{turmas.length}</span> de <span className="text-gray-900 font-bold">{totalItems}</span> turmas
          </span>
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('')
                setCurrentPage(1)
              }}
              className="text-sm text-[#007C00] hover:text-[#005a00] font-medium hover:underline transition-all"
            >
              Limpar pesquisa
            </button>
          )}
        </div>
      </div>

      {/* Tabela de Turmas */}
      <TurmaTable
        turmas={turmas}
        isLoading={isLoading}
        onEdit={handleEditTurma}
        onView={handleViewTurma}
        onDelete={handleDeleteClick}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {/* Modais */}
      <TurmaViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedTurma(null)
        }}
        turma={selectedTurma}
        onEdit={() => {
          setIsViewModalOpen(false)
          handleEditTurma(selectedTurma!)
        }}
      />

      <TurmaFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false)
          setTurmaToEdit(null)
        }}
        onSubmit={handleFormSubmit}
        turma={turmaToEdit}
        isLoading={isCreating || isUpdating}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setTurmaToDelete(null)
        }}
        onConfirm={handleDeleteConfirm}
        turmaName={turmaToDelete?.designacao || 'Turma'}
        isDeleting={isDeleting}
      />

      <StudentReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </Container>
  )
}
