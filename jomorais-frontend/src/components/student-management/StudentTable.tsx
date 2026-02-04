import { Eye, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Student } from '../../types/student.types'

interface StudentTableProps {
	students: Student[]
	isLoading: boolean
	onEdit: (student: Student) => void
	onView: (student: Student) => void
	onDelete: (student: Student) => void
	currentPage: number
	totalPages: number
	onPageChange: (page: number) => void
}

export default function StudentTable({
	students,
	isLoading,
	onEdit,
	onView,
	onDelete,
	currentPage,
	totalPages,
	onPageChange,
}: StudentTableProps) {
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

	if (students.length === 0) {
		return (
			<div className="bg-white rounded-lg shadow-sm p-8">
				<div className="text-center text-gray-500">
					<p className="text-lg">Nenhum estudante encontrado</p>
					<p className="text-sm mt-2">Tente ajustar os filtros ou adicionar um novo estudante</p>
				</div>
			</div>
		)
	}

	const formatDate = (date: string | Record<string, unknown>) => {
		try {
			if (typeof date === 'string') {
				return new Date(date).toLocaleDateString('pt-BR')
			}
			return 'Data inválida'
		} catch {
			return 'Data inválida'
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
								Estudante
							</th>
							<th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
								ID Matrícula
							</th>
							<th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
								Género
							</th>
							<th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
								Nascimento
							</th>
							<th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
								Contacto
							</th>
							<th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
								Morada
							</th>
							<th className="px-8 py-5 text-right text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] sticky right-0 bg-[#3964d7]/10 backdrop-blur-sm shadow-[-12px_0_24px_-12px_rgba(0,0,0,0.1)]">
								Ações
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-100">
						{students.map((student) => (
							<tr key={student.codigo} className="hover:bg-gray-50/80 transition-all duration-300 group">
								<td className="px-8 py-5 whitespace-nowrap">
									<div className="flex items-center gap-4">
										<div className="w-10 h-10 rounded-xl bg-[#3964d7]/10 flex items-center justify-center text-[#3964d7] font-black text-sm">
											{student.nome.charAt(0)}
										</div>
										<div>
											<div className="text-sm font-black text-[#1e293b] group-hover:text-[#3964d7] transition-colors">{student.nome}</div>
											{student.email && (
												<div className="text-[11px] text-gray-400 font-medium">{student.email}</div>
											)}
										</div>
									</div>
								</td>
								<td className="px-6 py-5 whitespace-nowrap">
									<div className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-100 text-xs font-black text-[#1e293b]">
										{student.tb_matriculas?.codigo ? `#${student.tb_matriculas.codigo}` : '--'}
									</div>
								</td>
								<td className="px-6 py-5 whitespace-nowrap text-sm">
									<span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${student.sexo === 'Masculino'
										? 'bg-blue-50 text-blue-600'
										: 'bg-rose-50 text-rose-600'
										}`}>
										{student.sexo}
									</span>
								</td>
								<td className="px-6 py-5 whitespace-nowrap text-xs font-bold text-[#1e293b]">
									{formatDate(student.dataNascimento)}
								</td>
								<td className="px-6 py-5 whitespace-nowrap text-xs font-bold text-[#1e293b]">
									{student.telefone && student.telefone !== '.' ? student.telefone : '--'}
								</td>
								<td className="px-6 py-5 whitespace-nowrap text-xs font-medium text-gray-500 max-w-[200px] truncate">
									{student.morada || '--'}
								</td>
								<td className="px-8 py-5 whitespace-nowrap text-right text-sm font-medium sticky right-0 bg-white/95 backdrop-blur-sm shadow-[-12px_0_24px_-12px_rgba(0,0,0,0.1)] group-hover:bg-gray-50/95 transition-colors">
									<div className="flex items-center justify-end gap-2">
										<button
											onClick={() => onView(student)}
											className="p-2.5 bg-blue-50 text-[#3964d7] hover:bg-[#3964d7] hover:text-white rounded-xl transition-all duration-300"
											title="Detalhes"
										>
											<Eye className="h-4 w-4" />
										</button>
										<button
											onClick={() => onEdit(student)}
											className="p-2.5 bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white rounded-xl transition-all duration-300"
											title="Editar"
										>
											<Edit2 className="h-4 w-4" />
										</button>
										<button
											onClick={() => onDelete(student)}
											className="p-2.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl transition-all duration-300"
											title="Eliminar"
										>
											<Trash2 className="h-4 w-4" />
										</button>
									</div>
								</td>
							</tr>
						))}
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
												? 'z-10 bg-green-50 border-[#007C00] text-[#007C00]'
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
