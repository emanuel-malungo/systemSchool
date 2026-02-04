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
			<div className="bg-white rounded-3xl border border-gray-100 p-8 mb-8">
				<div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
					<div className="flex items-center gap-6">
						<div className="w-14 h-14 flex items-center justify-center bg-[#3964d7] rounded-2xl shadow-[0_8px_16px_-4px_rgba(57,100,215,0.4)]">
							<CheckCircle className="h-7 w-7 text-white" />
						</div>
						<div>
							<h1 className="text-2xl font-black text-[#1e293b] leading-tight">
								Confirmações de Matrícula
							</h1>
							<div className="flex items-center gap-2 mt-1">
								<span className="text-[10px] text-[#3964d7] font-black uppercase tracking-widest">Base de dados ativa</span>
								<div className="w-1 h-1 bg-gray-300 rounded-full"></div>
								<span className="text-[10px] text-gray-400 font-bold">Gestão Académica</span>
							</div>
						</div>
					</div>

					<button
						onClick={handleCreateConfirmation}
						className="group flex items-center gap-2.5 px-6 py-4 bg-[#3964d7] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#2d52b2] transition-all duration-300 shadow-[0_8px_16px_-4px_rgba(57,100,215,0.4)] hover:shadow-[0_12px_20px_-4px_rgba(57,100,215,0.5)] active:scale-95"
					>
						<Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
						Nova Confirmação
					</button>
				</div>
			</div>

			{/* Filtros e Pesquisa */}
			<div className="bg-white rounded-3xl border border-gray-100 p-6 mb-8">
				<div className="flex flex-col md:flex-row gap-4">
					{/* Barra de Pesquisa */}
					<div className="flex-1 relative group">
						<Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#3964d7] transition-colors" />
						<input
							type="text"
							placeholder="Pesquisar por aluno ou turma..."
							value={searchTerm}
							onChange={(e) => {
								setSearchTerm(e.target.value)
								setCurrentPage(1)
							}}
							className="w-full pl-14 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-700 font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#3964d7]/5 focus:border-[#3964d7]/50 transition-all duration-300"
						/>
					</div>
				</div>

				{/* Contador de Resultados */}
				<div className="mt-6 pt-5 border-t border-gray-50 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="flex -space-x-2">
							<div className="w-2 h-2 rounded-full bg-[#3964d7] animate-pulse"></div>
						</div>
						<span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
							Mostrando <span className="text-[#3964d7] tracking-normal">{confirmations.length}</span> de <span className="text-[#1e293b] tracking-normal">{totalItems}</span> registros encontrados
						</span>
					</div>

					{searchTerm && (
						<button
							onClick={() => {
								setSearchTerm('')
								setCurrentPage(1)
							}}
							className="px-4 py-2 text-[10px] font-black text-[#3964d7] hover:bg-[#3964d7]/5 rounded-lg transition-all uppercase tracking-widest"
						>
							Limpar Filtros
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
