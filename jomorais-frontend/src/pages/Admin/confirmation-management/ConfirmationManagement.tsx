import { useState } from 'react'
import { Plus, Search, CheckCircle, Filter, X } from 'lucide-react'
import { useConfirmationsManager } from '../../../hooks/useConfirmation'
import { usePermissions } from '../../../hooks/useAuth'
import ConfirmationTable from '../../../components/confirmation-management/ConfirmationTable'
import ConfirmationViewModal from '../../../components/confirmation-management/ConfirmationViewModal'
import ConfirmationFormModal from '../../../components/confirmation-management/ConfirmationFormModal'
import DeleteConfirmModal from '../../../components/confirmation-management/DeleteConfirmModal'
import type { IConfirmation, IConfirmationInput } from '../../../types/confirmation.types'
import Container from '../../../components/layout/Container'
import { usePageTitle } from '../../../hooks/usePageTitle'

export default function ConfirmationManagement() {
  usePageTitle('Gerenciamento de Confirmações')

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
  const hasActiveFilters = searchTerm

  const handleClearFilters = () => {
    setSearchTerm('')
    setCurrentPage(1)
  }

  return (
    <Container>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#007C00]/10 rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle className="h-6 w-6 text-[#007C00]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Gerenciamento de Confirmações
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Gerencie as confirmações de matrícula dos alunos
            </p>
          </div>
        </div>
        
        <button
          onClick={handleCreateConfirmation}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#007C00] text-white rounded-lg hover:bg-[#005a00] active:scale-[0.98] transition-all duration-200 font-medium text-sm shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Nova Confirmação
        </button>
      </div>

      {/* Filtros e Pesquisa */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Filtros de pesquisa</span>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          {/* Barra de Pesquisa */}
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar por aluno ou turma..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 hover:bg-gray-100/75 border border-transparent rounded-lg text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#007C00]/20 focus:bg-gray-100 transition-all duration-200"
            />
          </div>
        </div>

        {/* Contador de Resultados */}
        <div className="mt-4 pt-3.5 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Mostrando <span className="text-gray-900 font-semibold">{confirmations.length}</span> de <span className="text-gray-900 font-semibold">{totalItems}</span> confirmações
          </span>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors duration-200"
            >
              <X className="h-3.5 w-3.5" />
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
