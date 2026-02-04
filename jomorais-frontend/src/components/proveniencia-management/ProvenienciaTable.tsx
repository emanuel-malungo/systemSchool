import { Eye, Edit2, Trash2, ChevronLeft, ChevronRight, Building2, MapPin, Phone } from 'lucide-react'
import type { Proveniencia } from '../../types/proveniencia.types'

interface ProvenienciaTableProps {
	proveniencias: Proveniencia[]
	isLoading: boolean
	onEdit: (proveniencia: Proveniencia) => void
	onView: (proveniencia: Proveniencia) => void
	onDelete: (proveniencia: Proveniencia) => void
	currentPage: number
	totalPages: number
	onPageChange: (page: number) => void
}

export default function ProvenienciaTable({
	proveniencias,
	isLoading,
	onEdit,
	onView,
	onDelete,
	currentPage,
	totalPages,
	onPageChange,
}: ProvenienciaTableProps) {
	if (isLoading) {
		return (
			<div className="bg-white rounded-4xl shadow-sm p-20 border border-gray-100/50 backdrop-blur-xl">
				<div className="flex flex-col items-center justify-center">
					<div className="relative">
						<div className="h-16 w-16 rounded-full border-4 border-[#3964d7]/10 border-t-[#3964d7] animate-spin"></div>
						<div className="absolute inset-0 flex items-center justify-center">
							<div className="h-8 w-8 rounded-full bg-[#3964d7]/5"></div>
						</div>
					</div>
					<p className="mt-6 text-sm font-black text-[#1e293b] uppercase tracking-[0.2em] animate-pulse">Carregando Dados...</p>
				</div>
			</div>
		)
	}

	if (proveniencias.length === 0) {
		return (
			<div className="bg-white rounded-4xl shadow-sm p-20 border border-gray-100/50 text-center slide-in-bottom">
				<div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-gray-300">
					<Building2 className="h-10 w-10" />
				</div>
				<h3 className="text-xl font-black text-[#1e293b] mb-2 uppercase tracking-tight">Nenhuma instituição</h3>
				<p className="text-gray-400 font-medium max-w-xs mx-auto text-sm leading-relaxed">
					Nenhuma proveniência foi encontrada. Tente ajustar os filtros de busca.
				</p>
			</div>
		)
	}

	const formatDate = (date: string | Date | null) => {
		if (!date) return 'N/A'
		try {
			return new Date(date).toLocaleDateString('pt-BR', {
				day: '2-digit',
				month: 'short',
				year: 'numeric'
			})
		} catch {
			return 'Data inválida'
		}
	}

	const getStatusBadge = (status: number) => {
		switch (status) {
			case 1:
				return (
					<span className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-xl border bg-emerald-50 text-emerald-600 border-emerald-100">
						Ativa
					</span>
				)
			case 0:
				return (
					<span className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-xl border bg-rose-50 text-rose-600 border-rose-100">
						Inativa
					</span>
				)
			default:
				return (
					<span className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-xl border bg-gray-50 text-gray-600 border-gray-100">
						N/A
					</span>
				)
		}
	}

	return (
		<div className="bg-white rounded-4xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100 overflow-hidden slide-in-bottom">
			<div className="overflow-x-auto scrollbar-hide">
				<table className="min-w-full divide-y divide-gray-50">
					<thead className="bg-[#f8fafc]/50 sticky top-0 z-10 backdrop-blur-md">
						<tr>
							<th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Instituição</th>
							<th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Localização</th>
							<th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Contacto</th>
							<th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Cadastro</th>
							<th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Estatuto</th>
							<th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Ações</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-50">
						{proveniencias.map((proveniencia) => (
							<tr key={proveniencia.codigo} className="group hover:bg-[#3964d7]/5 transition-all duration-300">
								<td className="px-8 py-5 whitespace-nowrap">
									<div className="flex items-center gap-4">
										<div className="h-11 w-11 rounded-2xl bg-[#3964d7] flex items-center justify-center text-white font-black text-sm shadow-[0_8px_16px_-4px_rgba(57,100,215,0.3)] transition-transform group-hover:scale-110">
											{proveniencia.designacao?.charAt(0).toUpperCase() || 'P'}
										</div>
										<div>
											<div className="text-sm font-bold text-[#1e293b] leading-tight group-hover:text-[#3964d7] transition-colors uppercase tracking-tight">
												{proveniencia.designacao}
											</div>
											<div className="text-[11px] font-medium text-gray-400 mt-1 uppercase tracking-widest">
												CÓD: {proveniencia.codigo}
											</div>
										</div>
									</div>
								</td>
								<td className="px-8 py-5 whitespace-nowrap">
									<div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-tight">
										<MapPin className="h-4 w-4 text-gray-300" />
										{proveniencia.localizacao || 'N/A'}
									</div>
								</td>
								<td className="px-8 py-5 whitespace-nowrap text-xs font-bold text-gray-500 uppercase tracking-tight">
									<div className="flex items-center gap-2">
										<Phone className="h-4 w-4 text-gray-300" />
										{proveniencia.contacto || 'N/A'}
									</div>
								</td>
								<td className="px-8 py-5 whitespace-nowrap text-xs font-bold text-gray-500">
									{formatDate(proveniencia.dataCadastro)}
								</td>
								<td className="px-8 py-5 whitespace-nowrap">
									{getStatusBadge(proveniencia.codigoStatus)}
								</td>
								<td className="px-8 py-5 whitespace-nowrap text-right">
									<div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
										<button
											onClick={() => onView(proveniencia)}
											className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:bg-[#3964d7] hover:text-white transition-all shadow-sm active:scale-90"
											title="Visualizar"
										>
											<Eye className="h-4 w-4" />
										</button>
										<button
											onClick={() => onEdit(proveniencia)}
											className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:bg-amber-500 hover:text-white transition-all shadow-sm active:scale-90"
											title="Editar"
										>
											<Edit2 className="h-4 w-4" />
										</button>
										<button
											onClick={() => onDelete(proveniencia)}
											className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-90"
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
				<div className="bg-[#f8fafc]/50 px-8 py-6 flex items-center justify-between border-t border-gray-50">
					<div className="flex items-center gap-2">
						<span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Página</span>
						<div className="px-3 py-1 bg-white border border-gray-100 rounded-lg shadow-sm">
							<span className="text-xs font-black text-[#3964d7]">{currentPage}</span>
							<span className="mx-1 text-gray-300">/</span>
							<span className="text-xs font-black text-gray-500">{totalPages}</span>
						</div>
					</div>

					<div className="flex items-center gap-2">
						<button
							onClick={() => onPageChange(currentPage - 1)}
							disabled={currentPage === 1}
							className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-[#3964d7] hover:border-[#3964d7]/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
						>
							<ChevronLeft className="h-5 w-5" />
						</button>
						<button
							onClick={() => onPageChange(currentPage + 1)}
							disabled={currentPage === totalPages}
							className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-[#3964d7] hover:border-[#3964d7]/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
						>
							<ChevronRight className="h-5 w-5" />
						</button>
					</div>
				</div>
			)}
		</div>
	)
}
