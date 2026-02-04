import { Eye, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import type { IConfirmation } from '../../types/confirmation.types'
import { usePermissions } from '../../hooks/useAuth'

interface ConfirmationTableProps {
	confirmations: IConfirmation[]
	isLoading: boolean
	onEdit: (confirmation: IConfirmation) => void
	onView: (confirmation: IConfirmation) => void
	onDelete: (confirmation: IConfirmation) => void
	currentPage: number
	totalPages: number
	onPageChange: (page: number) => void
}

export default function ConfirmationTable({
	confirmations,
	isLoading,
	onEdit,
	onView,
	onDelete,
	currentPage,
	totalPages,
	onPageChange,
}: ConfirmationTableProps) {
	const { isAdmin } = usePermissions()
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

	if (confirmations.length === 0) {
		return (
			<div className="bg-white rounded-3xl border border-gray-100 p-16 text-center">
				<div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
					<ChevronLeft className="h-10 w-10 text-gray-200" />
				</div>
				<h2 className="text-xl font-black text-[#1e293b] mb-2">Nenhuma confirmação encontrada</h2>
				<p className="text-gray-500 font-medium max-w-sm mx-auto">
					Não localizamos registros com os critérios informados. Tente ajustar sua busca.
				</p>
			</div>
		)
	}

	const formatDate = (date: string | null) => {
		if (!date) return 'N/A'
		try {
			return new Date(date).toLocaleDateString('pt-BR')
		} catch {
			return 'Data inválida'
		}
	}

	const getStatusBadge = (status: number) => {
		switch (status) {
			case 1:
				return (
					<div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100">
						<div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
						<span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">Ativa</span>
					</div>
				)
			case 2:
				return (
					<div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-100">
						<div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
						<span className="text-[10px] font-black text-rose-700 uppercase tracking-wider">Inativa</span>
					</div>
				)
			default:
				return (
					<div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-50 border border-gray-100">
						<div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
						<span className="text-[10px] font-black text-gray-600 uppercase tracking-wider">Desconhecido</span>
					</div>
				)
		}
	}

	const getClassificationBadge = (classificacao: string | null) => {
		if (!classificacao) {
			return (
				<div className="px-2.5 py-1 rounded-full bg-gray-50 border border-gray-100 text-[10px] font-black text-gray-500 uppercase tracking-wider">
					Pendente
				</div>
			)
		}

		const lower = classificacao.toLowerCase()
		let bgColor = 'bg-blue-50'
		let borderColor = 'border-blue-100'
		let textColor = 'text-blue-700'
		let dotColor = 'bg-blue-500'

		if (lower.includes('aprovado')) {
			bgColor = 'bg-emerald-50'
			borderColor = 'border-emerald-100'
			textColor = 'text-emerald-700'
			dotColor = 'bg-emerald-500'
		} else if (lower.includes('reprovado')) {
			bgColor = 'bg-rose-50'
			borderColor = 'border-rose-100'
			textColor = 'text-rose-700'
			dotColor = 'bg-rose-500'
		}

		return (
			<div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${bgColor} border ${borderColor}`}>
				<div className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></div>
				<span className={`text-[10px] font-black ${textColor} uppercase tracking-wider`}>{classificacao}</span>
			</div>
		)
	}

	return (
		<div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
			<div className="overflow-x-auto">
				<table className="min-w-full border-collapse">
					<thead>
						<tr className="bg-gray-50/50">
							<th className="sticky top-0 z-10 px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 bg-gray-50/50 backdrop-blur-sm">
								Aluno
							</th>
							<th className="sticky top-0 z-10 px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 bg-gray-50/50 backdrop-blur-sm">
								Turma / Classe
							</th>
							<th className="sticky top-0 z-10 px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 bg-gray-50/50 backdrop-blur-sm">
								Data Confirmação
							</th>
							<th className="sticky top-0 z-10 px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 bg-gray-50/50 backdrop-blur-sm">
								Status
							</th>
							<th className="sticky top-0 z-10 px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 bg-gray-50/50 backdrop-blur-sm">
								Classificação
							</th>
							<th className="sticky top-0 z-10 px-6 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 bg-gray-50/50 backdrop-blur-sm">
								Ações
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-50">
						{confirmations.map((confirmation) => {
							if (!confirmation.tb_matriculas?.tb_alunos || !confirmation.tb_turmas) {
								return null
							}

							return (
								<tr key={confirmation.codigo} className="group hover:bg-[#3964d7]/5 transition-all duration-300">
									<td className="px-6 py-5 whitespace-nowrap">
										<div className="flex items-center gap-4">
											<div className="h-11 w-11 rounded-2xl bg-[#3964d7] flex items-center justify-center text-white font-black text-sm shadow-[0_8px_16px_-4px_rgba(57,100,215,0.3)] transition-transform group-hover:scale-110">
												{confirmation.tb_matriculas.tb_alunos.nome?.charAt(0).toUpperCase() || 'A'}
											</div>
											<div>
												<div className="text-sm font-bold text-[#1e293b] leading-tight group-hover:text-[#3964d7] transition-colors">
													{confirmation.tb_matriculas.tb_alunos.nome}
												</div>
												<div className="text-[11px] font-medium text-gray-400 mt-1">
													{confirmation.tb_matriculas.tb_cursos?.designacao || 'Curso não definido'}
												</div>
											</div>
										</div>
									</td>
									<td className="px-6 py-5 whitespace-nowrap">
										<div className="text-sm font-bold text-[#1e293b]">{confirmation.tb_turmas.designacao}</div>
										<div className="text-[11px] font-medium text-gray-400 mt-1">
											{confirmation.tb_turmas.tb_classes?.designacao || 'N/A'}
										</div>
									</td>
									<td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-500">
										<div className="flex items-center gap-2">
											<div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
											{formatDate(confirmation.data_Confirmacao)}
										</div>
									</td>
									<td className="px-6 py-5 whitespace-nowrap">
										{getStatusBadge(confirmation.codigo_Status)}
									</td>
									<td className="px-6 py-5 whitespace-nowrap">
										{getClassificationBadge(confirmation.classificacao)}
									</td>
									<td className="px-6 py-5 whitespace-nowrap text-right">
										<div className="flex items-center justify-end gap-2 pr-2">
											<button
												onClick={() => onView(confirmation)}
												className="p-2.5 bg-[#3964d7]/5 text-[#3964d7] rounded-xl hover:bg-[#3964d7] hover:text-white hover:shadow-lg hover:shadow-[#3964d7]/30 transition-all duration-300 group/btn"
												title="Visualizar"
											>
												<Eye className="h-4 w-4 transition-transform group-hover/btn:scale-110" />
											</button>

											{isAdmin && (
												<button
													onClick={() => onEdit(confirmation)}
													className="p-2.5 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-500 hover:text-white hover:shadow-lg hover:shadow-amber-500/30 transition-all duration-300 group/btn"
													title="Editar"
												>
													<Edit2 className="h-4 w-4 transition-transform group-hover/btn:scale-110" />
												</button>
											)}

											<button
												onClick={() => onDelete(confirmation)}
												className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-500 hover:text-white hover:shadow-lg hover:shadow-rose-500/30 transition-all duration-300 group/btn"
												title="Deletar"
											>
												<Trash2 className="h-4 w-4 transition-transform group-hover/btn:scale-110" />
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
				<div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
					<div className="flex items-center gap-4">
						<span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
							Página <span className="text-[#1e293b]">{currentPage}</span> de <span className="text-[#1e293b]">{totalPages}</span>
						</span>
					</div>

					<div className="flex items-center gap-2">
						<button
							onClick={() => onPageChange(currentPage - 1)}
							disabled={currentPage === 1}
							className="p-2.5 bg-white border border-gray-100 text-gray-400 rounded-xl hover:text-[#3964d7] hover:border-[#3964d7]/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
						>
							<ChevronLeft className="h-4 w-4" />
						</button>

						<div className="flex items-center gap-1">
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
										className={`min-w-[40px] h-[40px] flex items-center justify-center rounded-xl text-xs font-black transition-all ${page === currentPage
											? 'bg-[#3964d7] text-white shadow-[0_8px_16px_-4px_rgba(57,100,215,0.4)]'
											: 'bg-white border border-gray-100 text-gray-400 hover:text-gray-600 hover:border-gray-200 shadow-sm'
											}`}
									>
										{page}
									</button>
								)
							})}
						</div>

						<button
							onClick={() => onPageChange(currentPage + 1)}
							disabled={currentPage === totalPages}
							className="p-2.5 bg-white border border-gray-100 text-gray-400 rounded-xl hover:text-[#3964d7] hover:border-[#3964d7]/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
						>
							<ChevronRight className="h-4 w-4" />
						</button>
					</div>
				</div>
			)}
		</div>
	)
}
