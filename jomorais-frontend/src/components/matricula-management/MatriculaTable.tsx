import { Eye, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import type { IMatricula } from '../../types/matricula.types'

interface MatriculaTableProps {
	matriculas: IMatricula[]
	isLoading: boolean
	onEdit: (matricula: IMatricula) => void
	onView: (matricula: IMatricula) => void
	onDelete: (matricula: IMatricula) => void
	currentPage: number
	totalPages: number
	onPageChange: (page: number) => void
}

export default function MatriculaTable({
	matriculas,
	isLoading,
	onEdit,
	onView,
	onDelete,
	currentPage,
	totalPages,
	onPageChange,
}: MatriculaTableProps) {
	if (isLoading) {
		return (
			<div className="bg-white rounded-3xl border border-gray-100 p-20">
				<div className="flex flex-col items-center justify-center">
					<div className="relative w-16 h-16">
						<div className="absolute inset-0 border-4 border-[#3964d7]/10 rounded-full"></div>
						<div className="absolute inset-0 border-4 border-[#3964d7] border-t-transparent rounded-full animate-spin"></div>
					</div>
					<p className="mt-6 text-sm font-bold text-[#1e293b] animate-pulse uppercase tracking-[0.2em]">Sincronizando Dados...</p>
				</div>
			</div>
		)
	}

	if (matriculas.length === 0) {
		return (
			<div className="bg-white rounded-lg shadow-sm p-8">
				<div className="text-center text-gray-500">
					<p className="text-lg">Nenhuma matrícula encontrada</p>
					<p className="text-sm mt-2">Tente ajustar os filtros ou adicionar uma nova matrícula</p>
				</div>
			</div>
		)
	}

	const formatDate = (date: string) => {
		try {
			return new Date(date).toLocaleDateString('pt-BR')
		} catch {
			return 'Data inválida'
		}
	}

	const getStatusBadge = (status: number) => {
		switch (status) {
			case 1:
				return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Ativa</span>
			case 2:
				return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Inativa</span>
			default:
				return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Desconhecido</span>
		}
	}

	return (
		<div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
			{/* Tabela */}
			<div className="overflow-x-auto">
				<table className="min-w-full divide-y divide-gray-100">
					<thead className="sticky top-0 z-10 bg-white border-b border-gray-100">
						<tr className="bg-gray-50/50">
							<th className="px-8 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
								Aluno
							</th>
							<th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
								Curso
							</th>
							<th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
								Data Matrícula
							</th>
							<th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
								Status
							</th>
							<th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
								Confirmações
							</th>
							<th className="px-8 py-5 text-right text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] sticky right-0 bg-[#3964d7]/10 backdrop-blur-sm shadow-[-12px_0_24px_-12px_rgba(0,0,0,0.1)]">
								Ações
							</th>
						</tr>
					</thead>
					<tbody className="bg-white divide-y divide-gray-200">
						{matriculas.map((matricula) => {
							// Validação de segurança
							if (!matricula.tb_alunos || !matricula.tb_cursos) {
								return null
							}

							return (
								<tr key={matricula.codigo} className="hover:bg-gray-50/80 transition-all duration-300 group">
									<td className="px-8 py-5 whitespace-nowrap">
										<div className="flex items-center gap-4">
											<div className="w-10 h-10 rounded-xl bg-[#3964d7]/10 flex items-center justify-center text-[#3964d7] font-black text-sm">
												{matricula.tb_alunos.nome?.charAt(0).toUpperCase() || 'A'}
											</div>
											<div>
												<div className="text-sm font-black text-[#1e293b] group-hover:text-[#3964d7] transition-colors">
													{matricula.tb_alunos.nome || 'Nome não disponível'}
												</div>
												<div className="text-[11px] text-gray-400 font-medium">
													{matricula.tb_alunos.sexo || 'N/A'}
												</div>
											</div>
										</div>
									</td>
									<td className="px-6 py-5 whitespace-nowrap">
										<div className="text-sm font-black text-[#1e293b]">{matricula.tb_cursos.designacao || 'N/A'}</div>
									</td>
									<td className="px-6 py-5 whitespace-nowrap text-xs font-bold text-[#1e293b]">
										{formatDate(matricula.data_Matricula)}
									</td>
									<td className="px-6 py-5 whitespace-nowrap">
										{getStatusBadge(matricula.codigoStatus)}
									</td>
									<td className="px-6 py-5 whitespace-nowrap text-xs font-bold text-[#1e293b]">
										{matricula.tb_confirmacoes?.length || 0} confirmação(ões)
									</td>
									<td className="px-8 py-5 whitespace-nowrap text-right text-sm font-medium sticky right-0 bg-white/95 backdrop-blur-sm shadow-[-12px_0_24px_-12px_rgba(0,0,0,0.1)] group-hover:bg-gray-50/95 transition-colors">
										<div className="flex items-center justify-end gap-2">
											<button
												onClick={() => onView(matricula)}
												className="p-2.5 bg-blue-50 text-[#3964d7] hover:bg-[#3964d7] hover:text-white rounded-xl transition-all duration-300"
												title="Detalhes"
											>
												<Eye className="h-4 w-4" />
											</button>
											<button
												onClick={() => onEdit(matricula)}
												className="p-2.5 bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white rounded-xl transition-all duration-300"
												title="Editar"
											>
												<Edit2 className="h-4 w-4" />
											</button>
											<button
												onClick={() => onDelete(matricula)}
												className="p-2.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl transition-all duration-300"
												title="Eliminar"
											>
												<Trash2 className="h-4 w-4" />
											</button>
										</div>
									</td>
								</tr>
							)
						})}
					</tbody>
				</table>
			</div>

			{/* Paginação */}
			{totalPages > 1 && (
				<div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
					<div className="flex-1 flex justify-between sm:hidden">
						<button
							onClick={() => onPageChange(currentPage - 1)}
							disabled={currentPage === 1}
							className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Anterior
						</button>
						<button
							onClick={() => onPageChange(currentPage + 1)}
							disabled={currentPage === totalPages}
							className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Próxima
						</button>
					</div>
					<div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
						<div>
							<p className="text-sm text-gray-700">
								Página <span className="font-medium">{currentPage}</span> de{' '}
								<span className="font-medium">{totalPages}</span>
							</p>
						</div>
						<div>
							<nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
								<button
									onClick={() => onPageChange(currentPage - 1)}
									disabled={currentPage === 1}
									className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									<ChevronLeft className="h-5 w-5" />
								</button>

								{Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
									let page = i + 1
									if (totalPages > 5 && currentPage > 3) {
										page = currentPage - 2 + i
										if (page > totalPages) page = totalPages - (4 - i)
									}
									return (
										<button
											key={page}
											onClick={() => onPageChange(page)}
											className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === currentPage
												? 'z-10 bg-blue-50 border-[#3964d7] text-[#3964d7]'
												: 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
												}`}
										>
											{page}
										</button>
									)
								})}

								<button
									onClick={() => onPageChange(currentPage + 1)}
									disabled={currentPage === totalPages}
									className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									<ChevronRight className="h-5 w-5" />
								</button>
							</nav>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
