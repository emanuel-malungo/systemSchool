import { useState } from 'react'
import { Plus, Search, Filter, ArrowRightLeft } from 'lucide-react'
import { useTransfersManager } from '../../../hooks/useTransfer'
import TransferTable from '../../../components/transfer-management/TransferTable'
import TransferViewModal from '../../../components/transfer-management/TransferViewModal'
import TransferFormModal from '../../../components/transfer-management/TransferFormModal'
import DeleteConfirmModal from '../../../components/transfer-management/DeleteConfirmModal'
import type { ITransfer, ITransferInput } from '../../../types/transfer.types'
import Container from '../../../components/layout/Container'

export default function TransferManagement() {
  // Estados
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [motivoFilter, setMotivoFilter] = useState<string>('all')
  
  // Modais
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedTransfer, setSelectedTransfer] = useState<ITransfer | null>(null)
  const [transferToDelete, setTransferToDelete] = useState<ITransfer | null>(null)
  const [transferToEdit, setTransferToEdit] = useState<ITransfer | null>(null)

  // Hook de gerenciamento de transferências
  const {
    transfers,
    pagination,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    createTransferAsync,
    updateTransferAsync,
    deleteTransferAsync,
  } = useTransfersManager({ 
    page: currentPage, 
    limit: pageSize,
    search: searchTerm,
    motivo: motivoFilter !== 'all' ? motivoFilter : undefined,
  })

  // Handlers
  const handleCreateTransfer = () => {
    setTransferToEdit(null)
    setIsFormModalOpen(true)
  }

  const handleEditTransfer = (transfer: ITransfer) => {
    setTransferToEdit(transfer)
    setIsFormModalOpen(true)
  }

  const handleFormSubmit = async (data: ITransferInput) => {
    try {
      if (transferToEdit) {
        // Atualizar transferência existente
        await updateTransferAsync({
          id: transferToEdit.codigo,
          transferData: data,
        })
      } else {
        // Criar nova transferência
        await createTransferAsync(data)
      }
      setIsFormModalOpen(false)
      setTransferToEdit(null)
    } catch (error) {
      console.error('Erro ao salvar transferência:', error)
    }
  }

  const handleViewTransfer = (transfer: ITransfer) => {
    setSelectedTransfer(transfer)
    setIsViewModalOpen(true)
  }

  const handleDeleteClick = (transfer: ITransfer) => {
    setTransferToDelete(transfer)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (transferToDelete) {
      try {
        await deleteTransferAsync(transferToDelete.codigo)
        setIsDeleteModalOpen(false)
        setTransferToDelete(null)
      } catch (error) {
        console.error('Erro ao deletar transferência:', error)
      }
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1)
  }

  const totalPages = pagination?.totalPages || 1
  const totalItems = pagination?.totalItems || 0

  // Mapeamento de motivos
  const motivos = [
    { value: 'all', label: 'Todos os Motivos' },
    { value: '1', label: 'Mudança de Residência' },
    { value: '2', label: 'Problemas Financeiros' },
    { value: '3', label: 'Insatisfação com a Escola' },
    { value: '4', label: 'Problemas de Saúde' },
    { value: '5', label: 'Outros Motivos' },
  ]

  return (
    <Container>
      {/* Header */}
      <div className="mb-8 bg-gradient-to-br from-red-50 via-white to-red-50 rounded-2xl shadow-lg overflow-hidden">
        <div className="relative p-8">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-100/30 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-red-100/30 rounded-full -ml-12 -mb-12"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                <ArrowRightLeft className="h-8 w-8 text-white" />
              </div>
              
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Gerenciamento de Transferências
                </h1>
                <p className="text-gray-600 text-lg">
                  Gerencie as transferências de alunos para outras escolas
                </p>
              </div>
            </div>
            
            <button
              onClick={handleCreateTransfer}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#007C00] to-[#005a00] text-white rounded-xl hover:from-[#005a00] hover:to-[#004000] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
            >
              <Plus className="h-5 w-5" />
              Nova Transferência
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
              placeholder="Pesquisar por aluno..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00] transition-all"
            />
          </div>

          {/* Filtro de Motivo */}
          <div className="flex items-center gap-3 bg-gray-50 px-4 rounded-xl border border-gray-200">
            <Filter className="h-5 w-5 text-gray-500" />
            <select
              value={motivoFilter}
              onChange={(e) => {
                setMotivoFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="bg-transparent py-3 pr-8 focus:outline-none text-gray-700 font-medium cursor-pointer"
            >
              {motivos.map((motivo) => (
                <option key={motivo.value} value={motivo.value}>
                  {motivo.label}
                </option>
              ))}
            </select>
          </div>

          {/* Itens por Página */}
          <div className="flex items-center gap-3 bg-gray-50 px-4 rounded-xl border border-gray-200">
            <span className="text-sm text-gray-600 font-medium">Exibir:</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="bg-transparent py-3 pr-8 focus:outline-none text-gray-700 font-medium cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Contador de Resultados */}
        <div className="mt-5 pt-4 border-t border-gray-200 flex items-center justify-between">
          <span className="text-sm text-gray-600 font-medium">
            Mostrando <span className="text-[#007C00] font-bold">{transfers.length}</span> de <span className="text-gray-900 font-bold">{totalItems}</span> transferências
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

      {/* Tabela de Transferências */}
      <TransferTable
        transfers={transfers}
        isLoading={isLoading}
        onEdit={handleEditTransfer}
        onView={handleViewTransfer}
        onDelete={handleDeleteClick}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {/* Modais */}
      <TransferViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedTransfer(null)
        }}
        transfer={selectedTransfer}
        onEdit={() => {
          setIsViewModalOpen(false)
          handleEditTransfer(selectedTransfer!)
        }}
      />

      <TransferFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false)
          setTransferToEdit(null)
        }}
        onSubmit={handleFormSubmit}
        transfer={transferToEdit}
        isLoading={isCreating || isUpdating}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setTransferToDelete(null)
        }}
        onConfirm={handleDeleteConfirm}
        studentName={transferToDelete?.tb_alunos?.nome || 'Aluno'}
        isDeleting={isDeleting}
      />
    </Container>
  )
}
