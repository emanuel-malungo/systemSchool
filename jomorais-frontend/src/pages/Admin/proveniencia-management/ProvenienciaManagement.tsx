import { useState } from 'react'
import { Plus, Search, Building2, Filter, X } from 'lucide-react'
import { useProvenienciasManager } from '../../../hooks/useProveniencia'
import ProvenienciaTable from '../../../components/proveniencia-management/ProvenienciaTable'
import ProvenienciaViewModal from '../../../components/proveniencia-management/ProvenienciaViewModal'
import ProvenienciaFormModal from '../../../components/proveniencia-management/ProvenienciaFormModal'
import DeleteConfirmModal from '../../../components/proveniencia-management/DeleteConfirmModal'
import type { Proveniencia, CreateProvenienciaPayload, UpdateProvenienciaPayload } from '../../../types/proveniencia.types'
import Container from '../../../components/layout/Container'

export default function ProvenienciaManagement() {
  // Estados
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Modais
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedProveniencia, setSelectedProveniencia] = useState<Proveniencia | null>(null)
  const [provenienciaToDelete, setProvenienciaToDelete] = useState<Proveniencia | null>(null)
  const [provenienciaToEdit, setProvenienciaToEdit] = useState<Proveniencia | null>(null)

  // Hook de gerenciamento de proveniências
  const {
    proveniencias,
    pagination,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    createProvenienciaAsync,
    updateProvenienciaAsync,
    deleteProvenienciaAsync,
  } = useProvenienciasManager({ 
    page: currentPage,
    search: searchTerm,
  })

  // Handlers
  const handleCreateProveniencia = () => {
    setProvenienciaToEdit(null)
    setIsFormModalOpen(true)
  }

  const handleEditProveniencia = (proveniencia: Proveniencia) => {
    setProvenienciaToEdit(proveniencia)
    setIsFormModalOpen(true)
  }

  const handleFormSubmit = async (data: CreateProvenienciaPayload) => {
    try {
      if (provenienciaToEdit) {
        // Atualizar proveniência existente
        await updateProvenienciaAsync({
          id: provenienciaToEdit.codigo,
          data: data as UpdateProvenienciaPayload,
        })
      } else {
        // Criar nova proveniência
        await createProvenienciaAsync(data)
      }
      setIsFormModalOpen(false)
      setProvenienciaToEdit(null)
    } catch (error) {
      console.error('Erro ao salvar proveniência:', error)
    }
  }

  const handleViewProveniencia = (proveniencia: Proveniencia) => {
    setSelectedProveniencia(proveniencia)
    setIsViewModalOpen(true)
  }

  const handleDeleteClick = (proveniencia: Proveniencia) => {
    setProvenienciaToDelete(proveniencia)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (provenienciaToDelete) {
      try {
        await deleteProvenienciaAsync(provenienciaToDelete.codigo)
        setIsDeleteModalOpen(false)
        setProvenienciaToDelete(null)
      } catch (error) {
        console.error('Erro ao deletar proveniência:', error)
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
            <Building2 className="h-6 w-6 text-[#007C00]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Gerenciamento de Proveniências
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Gerencie as escolas de origem dos alunos transferidos
            </p>
          </div>
        </div>
        
        <button
          onClick={handleCreateProveniencia}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#007C00] text-white rounded-lg hover:bg-[#005a00] active:scale-[0.98] transition-all duration-200 font-medium text-sm shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Nova Proveniência
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
              placeholder="Pesquisar por nome da escola..."
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
            Mostrando <span className="text-gray-900 font-semibold">{proveniencias.length}</span> de <span className="text-gray-900 font-semibold">{totalItems}</span> proveniências
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

      {/* Tabela de Proveniências */}
      <ProvenienciaTable
        proveniencias={proveniencias}
        isLoading={isLoading}
        onEdit={handleEditProveniencia}
        onView={handleViewProveniencia}
        onDelete={handleDeleteClick}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {/* Modais */}
      <ProvenienciaViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedProveniencia(null)
        }}
        proveniencia={selectedProveniencia}
        onEdit={() => {
          setIsViewModalOpen(false)
          handleEditProveniencia(selectedProveniencia!)
        }}
      />

      <ProvenienciaFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false)
          setProvenienciaToEdit(null)
        }}
        onSubmit={handleFormSubmit}
        proveniencia={provenienciaToEdit}
        isLoading={isCreating || isUpdating}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setProvenienciaToDelete(null)
        }}
        onConfirm={handleDeleteConfirm}
        provenienciaName={provenienciaToDelete?.designacao || 'Proveniência'}
        isDeleting={isDeleting}
      />
    </Container>
  )
}
