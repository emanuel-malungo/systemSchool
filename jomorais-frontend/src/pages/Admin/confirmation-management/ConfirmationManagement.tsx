import { useState } from 'react'
import { Plus, Search, CheckCircle } from 'lucide-react'
import { useConfirmationsManager } from '../../../hooks/useConfirmation'
import { usePermissions } from '../../../hooks/useAuth'
import ConfirmationTable from '../../../components/confirmation-management/ConfirmationTable'
import ConfirmationViewModal from '../../../components/confirmation-management/ConfirmationViewModal'
import ConfirmationFormModal from '../../../components/confirmation-management/ConfirmationFormModal'
import DeleteConfirmModal from '../../../components/confirmation-management/DeleteConfirmModal'
import type { IConfirmation, IConfirmationInput } from '../../../types/confirmation.types'
import Container from '../../../components/layout/Container'

export default function ConfirmationManagement() {
  const { isAdmin } = usePermissions()
  // Estados
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Modais
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedConfirmation, setSelectedConfirmation] = useState<IConfirmation | null>(null)
  const [confirmationToDelete, setConfirmationToDelete] = useState<IConfirmation | null>(null)
  const [confirmationToEdit, setConfirmationToEdit] = useState<IConfirmation | null>(null)

  // Hook de gerenciamento de confirmações
  const {
    confirmations,
    pagination,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    createConfirmationAsync,
    updateConfirmationAsync,
    deleteConfirmationAsync,
  } = useConfirmationsManager({ 
    page: currentPage, 
    search: searchTerm,
  })

  // Handlers
  const handleCreateConfirmation = () => {
    setConfirmationToEdit(null)
    setIsFormModalOpen(true)
  }

  const handleEditConfirmation = (confirmation: IConfirmation) => {
    // Apenas administradores podem editar confirmações
    if (!isAdmin) {
      alert('Apenas administradores podem editar confirmações.')
      return
    }
    setConfirmationToEdit(confirmation)
    setIsFormModalOpen(true)
  }

  const handleFormSubmit = async (data: IConfirmationInput) => {
      if (confirmationToEdit) {
        // Atualizar confirmação existente
        await updateConfirmationAsync({
          id: confirmationToEdit.codigo,
          confirmationData: data,
        })
      } else {
        // Criar nova confirmação
        await createConfirmationAsync(data)
      }
      setIsFormModalOpen(false)
      setConfirmationToEdit(null)
  }

  const handleViewConfirmation = (confirmation: IConfirmation) => {
    setSelectedConfirmation(confirmation)
    setIsViewModalOpen(true)
  }

  const handleDeleteClick = (confirmation: IConfirmation) => {
    setConfirmationToDelete(confirmation)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (confirmationToDelete) {
      try {
        await deleteConfirmationAsync(confirmationToDelete.codigo)
        setIsDeleteModalOpen(false)
        setConfirmationToDelete(null)
      } catch (error) {
        console.error('Erro ao deletar confirmação:', error)
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
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Gerenciamento de Confirmações
                </h1>
                <p className="text-gray-600 text-lg">
                  Gerencie as confirmações de matrícula dos alunos
                </p>
              </div>
            </div>
            
            <button
              onClick={handleCreateConfirmation}
              className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-[#007C00] to-[#005a00] text-white rounded-xl hover:from-[#005a00] hover:to-[#004000] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
            >
              <Plus className="h-5 w-5" />
              Nova Confirmação
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
              placeholder="Pesquisar por aluno ou turma..."
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
            Mostrando <span className="text-[#007C00] font-bold">{confirmations.length}</span> de <span className="text-gray-900 font-bold">{totalItems}</span> confirmações
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

      {/* Tabela de Confirmações */}
      <ConfirmationTable
        confirmations={confirmations}
        isLoading={isLoading}
        onEdit={handleEditConfirmation}
        onView={handleViewConfirmation}
        onDelete={handleDeleteClick}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {/* Modais */}
      <ConfirmationViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedConfirmation(null)
        }}
        confirmation={selectedConfirmation}
        onEdit={isAdmin ? () => {
          setIsViewModalOpen(false)
          handleEditConfirmation(selectedConfirmation!)
        } : undefined}
      />

      <ConfirmationFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false)
          setConfirmationToEdit(null)
        }}
        onSubmit={handleFormSubmit}
        confirmation={confirmationToEdit}
        isLoading={isCreating || isUpdating}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setConfirmationToDelete(null)
        }}
        onConfirm={handleDeleteConfirm}
        studentName={confirmationToDelete?.tb_matriculas?.tb_alunos?.nome || 'Aluno'}
        isDeleting={isDeleting}
      />
    </Container>
  )
}
