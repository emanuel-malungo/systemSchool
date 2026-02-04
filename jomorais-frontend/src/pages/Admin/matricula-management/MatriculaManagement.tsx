import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, GraduationCap } from 'lucide-react'
import { useMatriculasManager } from '../../../hooks/useMatricula'
import MatriculaTable from '../../../components/matricula-management/MatriculaTable'
import MatriculaViewModal from '../../../components/matricula-management/MatriculaViewModal'
import DeleteConfirmModal from '../../../components/matricula-management/DeleteConfirmModal'
import type { IMatricula } from '../../../types/matricula.types'
import Container from '../../../components/layout/Container'

export default function MatriculaManagement() {
	const navigate = useNavigate()

	// Estados
	const [currentPage, setCurrentPage] = useState(1)
	const [searchTerm, setSearchTerm] = useState('')

	// Modais
	const [isViewModalOpen, setIsViewModalOpen] = useState(false)
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
	const [selectedMatricula, setSelectedMatricula] = useState<IMatricula | null>(null)
	const [matriculaToDelete, setMatriculaToDelete] = useState<IMatricula | null>(null)

	// Hook de gerenciamento de matrículas
	const {
		matriculas,
		pagination,
		isLoading,
		isDeleting,
		deleteMatriculaAsync,
	} = useMatriculasManager({
		page: currentPage,
		search: searchTerm,
	})

	// Handlers
	const handleCreateMatricula = () => {
		navigate('/admin/student-management/enrolls/add')
	}

	const handleEditMatricula = (matricula: IMatricula) => {
		navigate(`/admin/student-management/enrolls/edit/${matricula.codigo}`)
	}

	const handleViewMatricula = (matricula: IMatricula) => {
		setSelectedMatricula(matricula)
		setIsViewModalOpen(true)
	}

	const handleDeleteClick = (matricula: IMatricula) => {
		setMatriculaToDelete(matricula)
		setIsDeleteModalOpen(true)
	}

	const handleDeleteConfirm = async () => {
		if (matriculaToDelete) {
			try {
				await deleteMatriculaAsync(matriculaToDelete.codigo)
				setIsDeleteModalOpen(false)
				setMatriculaToDelete(null)
			} catch (error) {
				console.error('Erro ao deletar matrícula:', error)
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
			<div className="mb-8 bg-white rounded-3xl border border-gray-100 p-8">
				<div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
					<div className="flex-1">
						<div className="flex items-center gap-4 mb-3">
							<div className="w-14 h-14 flex items-center justify-center bg-[#3964d7] rounded-2xl shadow-[0_8px_16px_-4px_rgba(57,100,215,0.4)]">
								<GraduationCap className="h-7 w-7 text-white" />
							</div>
							<div>
								<h1 className="text-2xl font-black text-[#1e293b] leading-tight">
									Gerenciamento de Matrículas
								</h1>
								<div className="flex items-center gap-2 mt-1">
									<div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
									<span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Base de dados ativa</span>
								</div>
							</div>
						</div>
						<p className="text-gray-500 text-sm font-medium max-w-2xl leading-relaxed">
							Visualize, edite e gerencie todas as informações das matrículas dos alunos.
						</p>
					</div>

					<button
						onClick={handleCreateMatricula}
						className="flex items-center gap-2.5 px-6 py-3.5 bg-[#3964d7] text-white rounded-2xl hover:bg-[#2d52b2] transition-all duration-300 font-bold text-sm shadow-[0_8px_20px_-6px_rgba(57,100,215,0.4)] hover:-translate-y-0.5 active:scale-95"
					>
						<Plus className="h-5 w-5" />
						Nova Matrícula
					</button>
				</div>
			</div>

			{/* Filtros e Pesquisa */}
			<div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
				<div className="flex flex-col md:flex-row gap-5">
					{/* Barra de Pesquisa */}
					<div className="flex-1 relative group">
						<Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#3964d7] transition-colors" />
						<input
							type="text"
							placeholder="Pesquisar por aluno ou curso..."
							value={searchTerm}
							onChange={(e) => {
								setSearchTerm(e.target.value)
								setCurrentPage(1)
							}}
							className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#3964d7]/10 focus:border-[#3964d7] focus:bg-white transition-all duration-300 font-medium text-sm text-[#1e293b] placeholder:text-gray-400"
						/>
					</div>
				</div>

				{/* Contador de Resultados */}
				<div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
							Resultados:
						</span>
						<span className="text-sm font-black text-[#1e293b]">
							{matriculas.length} <span className="text-gray-400 font-medium">de</span> {totalItems}
						</span>
					</div>
					{searchTerm && (
						<button
							onClick={() => {
								setSearchTerm('')
								setCurrentPage(1)
							}}
							className="text-xs text-[#3964d7] hover:text-[#2d52b2] font-black uppercase tracking-widest hover:underline transition-all"
						>
							Limpar Filtros
						</button>
					)}
				</div>
			</div>

			{/* Tabela de Matrículas */}
			<MatriculaTable
				matriculas={matriculas}
				isLoading={isLoading}
				onEdit={handleEditMatricula}
				onView={handleViewMatricula}
				onDelete={handleDeleteClick}
				currentPage={currentPage}
				totalPages={totalPages}
				onPageChange={handlePageChange}
			/>

			{/* Modais */}
			<MatriculaViewModal
				isOpen={isViewModalOpen}
				onClose={() => {
					setIsViewModalOpen(false)
					setSelectedMatricula(null)
				}}
				matricula={selectedMatricula}
				onEdit={() => {
					setIsViewModalOpen(false)
					handleEditMatricula(selectedMatricula!)
				}}
			/>

			<DeleteConfirmModal
				isOpen={isDeleteModalOpen}
				onClose={() => {
					setIsDeleteModalOpen(false)
					setMatriculaToDelete(null)
				}}
				onConfirm={handleDeleteConfirm}
				studentName={matriculaToDelete?.tb_alunos?.nome || 'Aluno'}
				isDeleting={isDeleting}
			/>
		</Container>
	)
}
