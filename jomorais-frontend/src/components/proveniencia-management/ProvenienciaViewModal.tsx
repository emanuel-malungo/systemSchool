import { X, Edit2, Building, MapPin, Phone, Calendar, User } from 'lucide-react'
import { useProveniencia } from '../../hooks/useProveniencia'
import type { Proveniencia } from '../../types/proveniencia.types'

interface ProvenienciaViewModalProps {
	isOpen: boolean
	onClose: () => void
	proveniencia: Proveniencia | null
	onEdit: () => void
}

export default function ProvenienciaViewModal({
	isOpen,
	onClose,
	proveniencia,
	onEdit,
}: ProvenienciaViewModalProps) {
	// Busca dados completos da proveniência
	const { data: provenienciaData, isLoading } = useProveniencia(
		proveniencia?.codigo || 0,
		isOpen && !!proveniencia
	)

	// Usa os dados completos se disponíveis, senão usa os dados básicos
	const fullProveniencia = provenienciaData?.data || proveniencia

	if (!isOpen || !proveniencia) return null

	const formatDate = (date: string | Date | null) => {
		if (!date) return 'N/A'
		try {
			return new Date(date).toLocaleDateString('pt-BR', {
				day: '2-digit',
				month: 'long',
				year: 'numeric',
			})
		} catch {
			return 'Data inválida'
		}
	}

	const getStatusText = (status: number) => {
		return status === 1 ? 'Ativa' : 'Inativa'
	}

	if (isLoading) {
		return (
			<div className="fixed inset-0 z-[100] overflow-y-auto overflow-x-hidden">
				<div className="flex min-h-screen items-center justify-center p-4">
					<div className="fixed inset-0 bg-[#0f172a]/40 backdrop-blur-sm transition-opacity duration-500" onClick={onClose} />
					<div className="relative bg-white rounded-4xl shadow-xl max-w-2xl w-full p-20 border border-gray-100 text-center">
						<div className="relative inline-block">
							<div className="h-16 w-16 rounded-full border-4 border-[#3964d7]/10 border-t-[#3964d7] animate-spin"></div>
						</div>
						<p className="mt-6 text-sm font-black text-[#1e293b] uppercase tracking-[0.2em] animate-pulse">Consultando Dossiê...</p>
					</div>
				</div>
			</div>
		)
	}

	if (!fullProveniencia) return null

	return (
		<div className="fixed inset-0 z-[100] overflow-y-auto overflow-x-hidden">
			<div className="flex min-h-screen items-center justify-center p-4">
				{/* Backdrop com Blur */}
				<div
					className="fixed inset-0 bg-[#0f172a]/40 backdrop-blur-sm transition-opacity duration-500"
					onClick={onClose}
				/>

				{/* Modal Container */}
				<div className="relative bg-[#f8fafc] rounded-4xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] max-w-2xl w-full overflow-hidden border border-white flex flex-col slide-in-bottom">

					{/* Header com Glassmorphism */}
					<div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md p-8 border-b border-gray-100 flex items-center justify-between">
						<div className="flex items-center gap-4">
							<div className="w-12 h-12 bg-[#3964d7]/10 rounded-2xl flex items-center justify-center">
								<Building className="h-6 w-6 text-[#3964d7]" />
							</div>
							<div>
								<h2 className="text-xl font-black text-[#1e293b] uppercase tracking-tight">Dossiê da Instituição</h2>
								<div className="flex items-center gap-2 mt-0.5">
									<div className="h-1.5 w-1.5 rounded-full bg-[#3964d7] animate-pulse"></div>
									<span className="text-[10px] font-black text-[#3964d7] uppercase tracking-[0.2em]">Registro Oficial</span>
								</div>
							</div>
						</div>
						<button
							onClick={onClose}
							className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:bg-rose-50 hover:text-rose-500 transition-all duration-300 active:scale-90"
						>
							<X className="h-5 w-5" />
						</button>
					</div>

					{/* Conteúdo rolável */}
					<div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
						<div className="space-y-8">

							{/* Card Principal de Identificação */}
							<div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden group">
								<div className="absolute top-0 right-0 w-32 h-32 bg-[#3964d7]/5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110 duration-700"></div>

								<div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
									<div className="relative">
										<div className="w-24 h-24 rounded-3xl bg-linear-to-br from-[#3964d7] to-[#2d52b2] flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-[#3964d7]/20 transform rotate-3 group-hover:rotate-0 transition-transform duration-500">
											{fullProveniencia.designacao?.charAt(0).toUpperCase() || 'P'}
										</div>
										<div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-xl shadow-md border border-gray-50 flex items-center justify-center">
											<div className={`w-4 h-4 rounded-full ${fullProveniencia.codigoStatus === 1 ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
										</div>
									</div>

									<div className="text-center md:text-left">
										<h3 className="text-2xl font-black text-[#1e293b] uppercase tracking-tight leading-tight">
											{fullProveniencia.designacao || 'Sem Nome'}
										</h3>
										<div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3">
											<div className="flex items-center gap-1.5">
												<span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ID Registro:</span>
												<span className="px-2 py-0.5 bg-gray-100 rounded-md text-[10px] font-black text-gray-600">#{fullProveniencia.codigo}</span>
											</div>
											<div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${fullProveniencia.codigoStatus === 1
												? 'bg-emerald-50 text-emerald-600 border-emerald-100'
												: 'bg-rose-50 text-rose-600 border-rose-100'
												}`}>
												{getStatusText(fullProveniencia.codigoStatus)}
											</div>
										</div>
									</div>
								</div>
							</div>

							{/* Grid de Informações Detalhadas */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">

								{/* Localização */}
								<div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:border-[#3964d7]/30 transition-colors">
									<div className="flex items-start gap-4">
										<div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
											<MapPin className="h-6 w-6 text-blue-500" />
										</div>
										<div>
											<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Localização Física</p>
											<p className="text-sm font-bold text-[#1e293b] leading-relaxed">
												{fullProveniencia.localizacao || 'Não informada'}
											</p>
										</div>
									</div>
								</div>

								{/* Contacto */}
								<div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:border-[#3964d7]/30 transition-colors">
									<div className="flex items-start gap-4">
										<div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center shrink-0">
											<Phone className="h-6 w-6 text-orange-500" />
										</div>
										<div>
											<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Canal de Contacto</p>
											<p className="text-sm font-bold text-[#1e293b] leading-relaxed">
												{fullProveniencia.contacto || 'Sem contacto'}
											</p>
										</div>
									</div>
								</div>

								{/* Data de Cadastro */}
								<div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:border-[#3964d7]/30 transition-colors">
									<div className="flex items-start gap-4">
										<div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
											<Calendar className="h-6 w-6 text-emerald-500" />
										</div>
										<div>
											<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Data de Inserção</p>
											<p className="text-sm font-bold text-[#1e293b] leading-relaxed">
												{formatDate(fullProveniencia.dataCadastro)}
											</p>
										</div>
									</div>
								</div>

								{/* Outras Infos (Espelhando o original) */}
								<div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:border-[#3964d7]/30 transition-colors">
									<div className="flex items-start gap-4">
										<div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center shrink-0">
											<Building className="h-6 w-6 text-purple-500" />
										</div>
										<div>
											<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Tipo de Entidade</p>
											<p className="text-sm font-bold text-[#1e293b] leading-relaxed">
												Ensino Geral / Superior
											</p>
										</div>
									</div>
								</div>
							</div>

							{/* Auditoria do Sistema (Rodapé Interno) */}
							{fullProveniencia.tb_utilizadores && (
								<div className="bg-[#1e293b] rounded-3xl p-8 text-white relative overflow-hidden group">
									<div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full -mr-10 -mt-10"></div>

									<div className="relative z-10">
										<div className="flex items-center gap-3 mb-6">
											<div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
												<User className="h-5 w-5 text-blue-400" />
											</div>
											<h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-400">Auditoria de Segurança</h4>
										</div>

										<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
											<div className="space-y-4">
												<div>
													<p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Responsável pelo Cadastro</p>
													<p className="text-sm font-bold">{fullProveniencia.tb_utilizadores.nome}</p>
												</div>
												<div>
													<p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Identificador Utente</p>
													<p className="text-xs font-medium text-gray-400">{fullProveniencia.tb_utilizadores.user}</p>
												</div>
											</div>

											{fullProveniencia.tb_utilizadores.email && (
												<div className="flex flex-col justify-end">
													<div className="p-4 bg-white/5 rounded-2xl border border-white/10">
														<p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Email Corporativo</p>
														<p className="text-xs font-bold text-blue-200 truncate">{fullProveniencia.tb_utilizadores.email}</p>
													</div>
												</div>
											)}
										</div>
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Footer com Ações Padronizadas */}
					<div className="p-8 bg-gray-50/50 border-t border-gray-100 flex flex-col md:flex-row gap-4">
						<button
							onClick={onClose}
							className="flex-1 py-4 bg-white text-gray-500 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-gray-100 transition-all duration-300 border border-gray-100 active:scale-95"
						>
							Fechar Dossiê
						</button>
						<button
							onClick={onEdit}
							className="flex-1 py-4 bg-[#3964d7] text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-[#2d52b2] shadow-xl shadow-[#3964d7]/20 transition-all duration-300 flex items-center justify-center gap-3 active:scale-95"
						>
							<Edit2 className="h-4 w-4" />
							Editar Informações
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}
