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
			<div className="mb-10 bg-white rounded-4xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 overflow-hidden slide-in-bottom">
				<div className="relative p-10">
					<div className="absolute top-0 right-0 w-64 h-64 bg-[#3964d7]/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
					<div className="absolute bottom-0 left-0 w-48 h-48 bg-[#3964d7]/5 rounded-full -ml-24 -mb-24 blur-3xl"></div>

					<div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
						<div className="flex items-center gap-6">
							<div className="w-20 h-20 bg-linear-to-br from-[#3964d7] to-[#2d52b2] rounded-3xl flex items-center justify-center shadow-xl shadow-[#3964d7]/20 transform hover:scale-105 transition-transform duration-500">
								<Building2 className="h-10 w-10 text-white" />
							</div>

							<div>
								<h1 className="text-3xl font-black text-[#1e293b] tracking-tight mb-1">
									Gestão de Proveniências
								</h1>
								<p className="text-gray-400 font-medium max-w-md">
									Controle das instituições de origem dos alunos transferidos
								</p>
								<div className="flex items-center gap-2 mt-2">
									<span className="h-1.5 w-1.5 rounded-full bg-[#3964d7] animate-pulse"></span>
									<span className="text-[10px] font-black text-[#3964d7] uppercase tracking-widest">Painel Administrativo</span>
								</div>
							</div>
						</div>

						<button
							onClick={handleCreateProveniencia}
							className="group flex items-center gap-3 px-8 py-4 bg-[#3964d7] text-white rounded-2xl hover:bg-[#2d52b2] transition-all duration-300 shadow-[0_8px_20px_-6px_rgba(57,100,215,0.4)] hover:shadow-[0_12px_24px_-6px_rgba(57,100,215,0.5)] active:scale-95 font-black text-xs uppercase tracking-widest"
						>
							<Plus className="h-5 w-5 transition-transform group-hover:rotate-90 duration-500" />
							Nova Proveniência
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
							placeholder="Pesquisar por nome da escola..."
							value={searchTerm}
							onChange={(e) => {
								setSearchTerm(e.target.value)
								setCurrentPage(1)
							}}
							className="w-full pl-14 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-[#1e293b] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#3964d7]/5 transition-all duration-300"
						/>
					</div>
				</div>

				{/* Contador de Resultados */}
				<div className="flex items-center justify-between px-2">
					<div className="flex items-center gap-2">
						<span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Fluxo Operacional:</span>
						<div className="px-3 py-1 bg-[#3964d7]/5 rounded-lg">
							<span className="text-xs font-black text-[#3964d7]">
								{proveniencias.length} de {totalItems} Registros
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
