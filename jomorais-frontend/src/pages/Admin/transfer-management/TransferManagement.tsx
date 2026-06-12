import { useState } from 'react'
import { Plus, Search, Filter, ArrowRightLeft } from 'lucide-react'
import { useTransfersManager } from '../../../hooks/useTransfer'
import TransferTable from '../../../components/transfer-management/TransferTable'
import TransferViewModal from '../../../components/transfer-management/TransferViewModal'
import TransferFormModal from '../../../components/transfer-management/TransferFormModal'
import DeleteConfirmModal from '../../../components/transfer-management/DeleteConfirmModal'
import type { ITransfer, ITransferInput } from '../../../types/transfer.types'
import Container from '../../../components/layout/Container'
import { TransferPdfGenerator } from '../../../utils/TransferPdfGenerator'
import transferService from '../../../services/transfer.service'
import { toast } from 'react-toastify'

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

  const handlePrintTransfer = async (transfer: ITransfer) => {
    try {
      toast.info('Buscando dados para emissão da guia em PDF...')
      const response = await transferService.getTransferPdfData(transfer.codigo)
      if (response.success && response.data) {
        TransferPdfGenerator.generatePDF(response.data)
        toast.success('Guia de transferência (PDF) gerada com sucesso!')
      } else {
        toast.error('Erro ao buscar dados para emissão da guia')
      }
    } catch (error) {
      console.error('Erro ao gerar guia de transferência:', error)
      toast.error('Erro ao gerar guia de transferência. Tente novamente.')
    }
  }

  const handleExportWord = async (transfer: ITransfer) => {
    try {
      toast.info('Buscando dados para emissão da guia em Word...')
      const response = await transferService.getTransferPdfData(transfer.codigo)
      if (response.success && response.data) {
        await TransferPdfGenerator.generateWord(response.data)
        toast.success('Guia de transferência (Word) gerada com sucesso!')
      } else {
        toast.error('Erro ao buscar dados para emissão da guia')
      }
    } catch (error) {
      console.error('Erro ao exportar guia para Word:', error)
      toast.error('Erro ao exportar guia para Word. Tente novamente.')
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#007C00]/10 rounded-xl flex items-center justify-center shrink-0">
            <ArrowRightLeft className="h-6 w-6 text-[#007C00]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Gerenciamento de Transferências
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Gerencie as transferências de alunos para outras escolas
            </p>
          </div>
        </div>
        
        <button
          onClick={handleCreateTransfer}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#007C00] text-white rounded-lg hover:bg-[#005a00] active:scale-[0.98] transition-all duration-200 font-medium text-sm shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Nova Transferência
        </button>
      </div>

      {/* Filtros e Pesquisa */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Filtros de pesquisa</span>
        </div>
        <div className="flex flex-col lg:flex-row flex-wrap gap-3">
          {/* Barra de Pesquisa */}
          <div className="flex-1 min-w-[250px] relative">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar por aluno..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 hover:bg-gray-100/75 border border-transparent rounded-lg text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#007C00]/20 focus:bg-gray-100 transition-all duration-200"
            />
          </div>

          {/* Filtro de Motivo */}
          <div className="flex items-center gap-3 bg-gray-50 px-3 py-0.5 rounded-lg border border-transparent hover:bg-gray-100/75 transition-all w-full lg:w-auto">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={motivoFilter}
              onChange={(e) => {
                setMotivoFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="bg-transparent py-2 pr-6 focus:outline-none text-sm text-gray-700 font-medium cursor-pointer"
            >
              {motivos.map((motivo) => (
                <option key={motivo.value} value={motivo.value}>
                  {motivo.label}
                </option>
              ))}
            </select>
          </div>

          {/* Itens por Página */}
          <div className="flex items-center gap-3 bg-gray-50 px-3 py-0.5 rounded-lg border border-transparent hover:bg-gray-100/75 transition-all w-full lg:w-auto">
            <span className="text-sm text-gray-500 font-medium">Exibir:</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="bg-transparent py-2 pr-6 focus:outline-none text-sm text-gray-700 font-medium cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Contador de Resultados */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
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
        onPrint={handlePrintTransfer}
        onExportWord={handleExportWord}
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
