import { useState } from 'react'
import { Plus, Search, Building2 } from 'lucide-react'
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

  return (
    <Container>
      {/* Header */}
      <div className="mb-8 bg-linear-to-br from-blue-50 via-white to-blue-50 rounded-2xl shadow-lg overflow-hidden">
        <div className="relative p-8">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/30 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-100/30 rounded-full -ml-12 -mb-12"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-linear-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Gerenciamento de Proveniências
                </h1>
                <p className="text-gray-600 text-lg">
                  Gerencie as escolas de origem dos alunos transferidos
                </p>
              </div>
            </div>
            
            <button
              onClick={handleCreateProveniencia}
              className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-[#007C00] to-[#005a00] text-white rounded-xl hover:from-[#005a00] hover:to-[#004000] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
            >
              <Plus className="h-5 w-5" />
              Nova Proveniência
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
              placeholder="Pesquisar por nome da escola..."
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
            Mostrando <span className="text-[#007C00] font-bold">{proveniencias.length}</span> de <span className="text-gray-900 font-bold">{totalItems}</span> proveniências
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
