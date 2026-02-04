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
			<div className="mb-10 bg-white rounded-4xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 overflow-hidden slide-in-bottom">
				<div className="relative p-10">
					<div className="absolute top-0 right-0 w-64 h-64 bg-[#3964d7]/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
					<div className="absolute bottom-0 left-0 w-48 h-48 bg-[#3964d7]/5 rounded-full -ml-24 -mb-24 blur-3xl"></div>

					<div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
						<div className="flex items-center gap-6">
							<div className="w-20 h-20 bg-linear-to-br from-[#3964d7] to-[#2d52b2] rounded-3xl flex items-center justify-center shadow-xl shadow-[#3964d7]/20 transform hover:scale-105 transition-transform duration-500">
								<ArrowRightLeft className="h-10 w-10 text-white" />
							</div>

							<div>
								<h1 className="text-3xl font-black text-[#1e293b] tracking-tight mb-1">
									Gestão de Transferências
								</h1>
								<p className="text-gray-400 font-medium max-w-md">
									Controle e histórico de movimentação externa de discentes
								</p>
								<div className="flex items-center gap-2 mt-2">
									<span className="h-1.5 w-1.5 rounded-full bg-[#3964d7] animate-pulse"></span>
									<span className="text-[10px] font-black text-[#3964d7] uppercase tracking-widest">Painel Administrativo</span>
								</div>
							</div>
						</div>

						<button
							onClick={handleCreateTransfer}
							className="group flex items-center gap-3 px-8 py-4 bg-[#3964d7] text-white rounded-2xl hover:bg-[#2d52b2] transition-all duration-300 shadow-[0_8px_20px_-6px_rgba(57,100,215,0.4)] hover:shadow-[0_12px_24px_-6px_rgba(57,100,215,0.5)] active:scale-95 font-black text-xs uppercase tracking-widest"
						>
							<Plus className="h-5 w-5 transition-transform group-hover:rotate-90 duration-500" />
							Nova Transferência
						</button>
					</div>
				</div>
			</div>

			{/* Filtros e Pesquisa */}
			<div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-8 mb-8 border border-gray-100 flex flex-col gap-6">
				<div className="flex flex-col lg:flex-row gap-6">
					{/* Barra de Pesquisa */}
					<div className="flex-1 relative group">
						<Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#3964d7] transition-all" />
						<input
							type="text"
							placeholder="Pesquisar por aluno..."
							value={searchTerm}
							onChange={(e) => {
								setSearchTerm(e.target.value)
								setCurrentPage(1)
							}}
							className="w-full pl-14 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-[#1e293b] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#3964d7]/5 transition-all duration-300"
						/>
					</div>

					<div className="flex flex-wrap items-center gap-4">
						{/* Filtro de Motivo */}
						<div className="flex items-center gap-3 bg-gray-50 px-5 py-2 rounded-2xl border border-gray-100 hover:bg-white focus-within:bg-white focus-within:ring-4 focus-within:ring-[#3964d7]/5 transition-all duration-300">
							<Filter className="h-4 w-4 text-gray-400" />
							<select
								value={motivoFilter}
								onChange={(e) => {
									setMotivoFilter(e.target.value)
									setCurrentPage(1)
								}}
								className="bg-transparent py-2 pr-2 focus:outline-none text-xs font-black text-[#1e293b] uppercase tracking-widest cursor-pointer appearance-none"
							>
								{motivos.map((motivo) => (
									<option key={motivo.value} value={motivo.value}>
										{motivo.label}
									</option>
								))}
							</select>
						</div>

						{/* Itens por Página */}
						<div className="flex items-center gap-3 bg-gray-50 px-5 py-2 rounded-2xl border border-gray-100 hover:bg-white focus-within:bg-white transition-all duration-300">
							<span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Exibir</span>
							<select
								value={pageSize}
								onChange={(e) => handlePageSizeChange(Number(e.target.value))}
								className="bg-transparent py-2 focus:outline-none text-xs font-black text-[#1e293b] cursor-pointer appearance-none"
							>
								<option value={10}>10</option>
								<option value={25}>25</option>
								<option value={50}>50</option>
								<option value={100}>100</option>
							</select>
						</div>
					</div>
				</div>

				{/* Contador de Resultados */}
				<div className="flex items-center justify-between px-2">
					<div className="flex items-center gap-2">
						<span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Fluxo Operacional:</span>
						<div className="px-3 py-1 bg-[#3964d7]/5 rounded-lg">
							<span className="text-xs font-black text-[#3964d7]">
								{transfers.length} de {totalItems} Registros
							</span>
						</div>
					</div>
					{searchTerm && (
						<button
							onClick={() => {
								setSearchTerm('')
								setCurrentPage(1)
							}}
							className="text-[10px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-[0.2em] transition-all hover:underline"
						>
							Limpar Filtros
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
